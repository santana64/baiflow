"use server";

import { createHash, randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { AddOnType, PartnerProfessionalType } from "@prisma/client";
import { getAppUrl } from "@/lib/env";
import { ADD_ONS } from "@/lib/add-ons";
import { PLAN_DEFINITIONS } from "@/lib/plans";
import { DomainError, NotFoundError, toActionError, ValidationError, type ActionResult } from "@/lib/errors";
import { getCurrentUser } from "./auth";
import { prisma } from "./db";
import { getRegisteredLetterAllowance } from "./entitlements";
import { sendGliLeadProvider, sendRegisteredLetterProvider, createSignatureProvider } from "./external-providers";
import { renderDocumentPdf } from "./pdf";
import { getStripe } from "./stripe";
import { getAccessibleUserIds } from "./workspace";

function hashToken(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function createSecret(prefix: string) {
  return `${prefix}_${randomBytes(32).toString("base64url")}`;
}

export async function startAddOnCheckout(formData: FormData) {
  const user = await getCurrentUser();
  const accessibleUserIds = await getAccessibleUserIds(user.id);
  const type = String(formData.get("type")) as AddOnType;
  const rentCaseId = String(formData.get("rentCaseId") || "");
  const documentId = String(formData.get("documentId") || "");
  const addOn = ADD_ONS[type];
  if (!addOn) throw new ValidationError("Add-on invalide");

  if (rentCaseId) {
    const rentCase = await prisma.rentCase.findFirst({ where: { id: rentCaseId, userId: { in: accessibleUserIds } } });
    if (!rentCase) throw new NotFoundError("Dossier introuvable");
  }
  if (documentId) {
    const document = await prisma.generatedDocument.findFirst({ where: { id: documentId, rentCase: { userId: { in: accessibleUserIds } } } });
    if (!document) throw new NotFoundError("Document introuvable");
  }

  if (type === "REGISTERED_LETTER") {
    const allowance = await getRegisteredLetterAllowance(user);
    if (allowance.remaining > 0) {
      const includedOrder = await prisma.addOnOrder.create({
        data: {
          userId: user.id,
          rentCaseId: rentCaseId || null,
          documentId: documentId || null,
          type,
          status: "PAID",
          amountCents: 0,
          providerCostCents: addOn.providerCostCents,
          metadata: { includedInPlan: true, allowanceRemainingBeforeReservation: allowance.remaining }
        }
      });
      redirect(rentCaseId ? `/app/cases/${rentCaseId}?addon=included&order=${includedOrder.id}` : "/app/add-ons?addon=included");
    }
  }

  const order = await prisma.addOnOrder.create({
    data: {
      userId: user.id,
      rentCaseId: rentCaseId || null,
      documentId: documentId || null,
      type,
      amountCents: addOn.priceCents,
      providerCostCents: addOn.providerCostCents
    }
  });

  const stripe = getStripe();
  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: user.stripeCustomerId ?? undefined,
    customer_email: user.stripeCustomerId ? undefined : user.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: addOn.priceCents,
          product_data: {
            name: addOn.name,
            description: addOn.description
          }
        }
      }
    ],
    success_url: `${getAppUrl()}/app/add-ons/${order.id}?payment=success`,
    cancel_url: `${getAppUrl()}/app/cases${rentCaseId ? `/${rentCaseId}` : ""}?payment=cancelled`,
    metadata: { userId: user.id, orderId: order.id, addOnType: type }
  });
  await prisma.addOnOrder.update({ where: { id: order.id }, data: { stripeSessionId: checkout.id } });
  redirect(checkout.url ?? "/app/account?billing=checkout-error");
}

export async function markAddOnPaidForDev(formData: FormData) {
  const user = await getCurrentUser();
  const accessibleUserIds = await getAccessibleUserIds(user.id);
  if (process.env.NODE_ENV === "production") throw new DomainError("Paiement Stripe requis en production.");
  const type = String(formData.get("type")) as AddOnType;
  const rentCaseId = String(formData.get("rentCaseId") || "");
  const documentId = String(formData.get("documentId") || "");
  const addOn = ADD_ONS[type];
  if (!addOn) throw new ValidationError("Add-on invalide");
  if (rentCaseId) {
    const rentCase = await prisma.rentCase.findFirst({ where: { id: rentCaseId, userId: { in: accessibleUserIds } } });
    if (!rentCase) throw new NotFoundError("Dossier introuvable");
  }
  if (documentId) {
    const document = await prisma.generatedDocument.findFirst({ where: { id: documentId, rentCase: { userId: { in: accessibleUserIds } } } });
    if (!document) throw new NotFoundError("Document introuvable");
  }
  await prisma.addOnOrder.create({
    data: {
      userId: user.id,
      rentCaseId: rentCaseId || null,
      documentId: documentId || null,
      type,
      status: "PAID",
      amountCents: addOn.priceCents,
      providerCostCents: addOn.providerCostCents,
      metadata: { dev: true }
    }
  });
  redirect(rentCaseId ? `/app/cases/${rentCaseId}?addon=paid` : "/app/add-ons?addon=paid");
}

export async function generateTenantPortalLink(formData: FormData) {
  const user = await getCurrentUser();
  const accessibleUserIds = await getAccessibleUserIds(user.id);
  const rentCaseId = String(formData.get("rentCaseId"));
  const rentCase = await prisma.rentCase.findFirst({ where: { id: rentCaseId, userId: { in: accessibleUserIds } } });
  if (!rentCase) throw new NotFoundError("Dossier introuvable");
  const billingUser = rentCase.userId === user.id ? user : await prisma.user.findUniqueOrThrow({ where: { id: rentCase.userId } });
  if (!PLAN_DEFINITIONS[billingUser.plan].hasTenantPortal) {
    throw new DomainError("Le portail locataire est disponible a partir du forfait Premium/Gestionnaire.");
  }
  const rawToken = createSecret("tenant");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await prisma.tenantPortalAccess.create({
    data: { rentCaseId, tokenHash: hashToken(rawToken), expiresAt }
  });
  await prisma.caseEvent.create({
    data: {
      rentCaseId,
      type: "CUSTOM",
      title: "Lien portail locataire créé",
      description: "Lien sécurisé valable 30 jours.",
      eventDate: new Date()
    }
  });
  revalidatePath(`/app/cases/${rentCaseId}`);
  redirect(`/app/cases/${rentCaseId}?tenantPortal=${encodeURIComponent(rawToken)}`);
}

export async function createApiKey(formData: FormData) {
  const user = await getCurrentUser();
  if (!PLAN_DEFINITIONS[user.plan].hasApiAccess) throw new DomainError("L'accès API est disponible à partir du forfait Gestionnaire.");
  const name = String(formData.get("name") || "Clé API").slice(0, 80);
  const rawKey = createSecret("bf");
  await prisma.apiKey.create({
    data: {
      userId: user.id,
      name,
      prefix: rawKey.slice(0, 10),
      keyHash: hashToken(rawKey)
    }
  });
  redirect(`/app/developer?created=${encodeURIComponent(rawKey)}`);
}

export async function saveWhiteLabel(formData: FormData) {
  const user = await getCurrentUser();
  if (!PLAN_DEFINITIONS[user.plan].hasWhiteLabel) throw new DomainError("Le white label est réservé au forfait Agence.");
  await prisma.whiteLabelSetting.upsert({
    where: { userId: user.id },
    update: {
      brandName: String(formData.get("brandName") || "BailFlow"),
      logoUrl: String(formData.get("logoUrl") || "") || null,
      primaryColor: String(formData.get("primaryColor") || "#0a0a0a"),
      accentColor: String(formData.get("accentColor") || "#16a34a"),
      customDomain: String(formData.get("customDomain") || "") || null
    },
    create: {
      userId: user.id,
      brandName: String(formData.get("brandName") || "BailFlow"),
      logoUrl: String(formData.get("logoUrl") || "") || null,
      primaryColor: String(formData.get("primaryColor") || "#0a0a0a"),
      accentColor: String(formData.get("accentColor") || "#16a34a"),
      customDomain: String(formData.get("customDomain") || "") || null
    }
  });
  redirect("/app/white-label?saved=1");
}

export async function sendRegisteredLetter(formData: FormData): Promise<ActionResult<{ providerId?: string }>> {
  try {
    const user = await getCurrentUser();
    const accessibleUserIds = await getAccessibleUserIds(user.id);
    const documentId = String(formData.get("documentId"));
    const document = await prisma.generatedDocument.findFirst({
      where: { id: documentId, rentCase: { userId: { in: accessibleUserIds } } },
      include: { rentCase: { include: { tenant: true } } }
    });
    if (!document) throw new NotFoundError("Document introuvable");
    const tenant = document.rentCase.tenant;
    if (!tenant.email) throw new DomainError("Email locataire manquant pour l'envoi recommandé électronique.");
    const billingUser = document.rentCase.userId === user.id ? user : await prisma.user.findUniqueOrThrow({ where: { id: document.rentCase.userId } });
    const allowance = await getRegisteredLetterAllowance(billingUser);
    const paidOrder = allowance.remaining > 0
      ? null
      : await prisma.addOnOrder.findFirst({
          where: {
            userId: billingUser.id,
            type: "REGISTERED_LETTER",
            status: "PAID",
            OR: [
              { documentId },
              { rentCaseId: document.rentCaseId },
              { documentId: null, rentCaseId: null }
            ]
          },
          orderBy: { createdAt: "asc" }
        });
    if (allowance.remaining <= 0 && !paidOrder) {
      throw new DomainError("Quota de recommandés inclus utilisé. Achetez un envoi recommandé avant l'expédition.");
    }
    const landlord = await prisma.landlordProfile.findUnique({ where: { userId: document.rentCase.userId } });
    const result = await sendRegisteredLetterProvider({
      documentTitle: document.title,
      contentHtml: document.contentHtml,
      senderEmail: landlord?.email ?? billingUser.email,
      senderName: landlord?.fullName ?? billingUser.name,
      recipientEmail: tenant.email,
      recipientName: `${tenant.firstName} ${tenant.lastName}`
    });
    await prisma.registeredLetter.create({
      data: {
        documentId,
        provider: "AR24",
        providerId: result.id ?? null,
        status: "SENT",
        recipientEmail: tenant.email,
        recipientName: `${tenant.firstName} ${tenant.lastName}`,
        receiptUrl: result.trackingUrl ?? null
      }
    });
    if (paidOrder) {
      await prisma.addOnOrder.update({ where: { id: paidOrder.id }, data: { status: "COMPLETED" } });
    } else {
      await prisma.addOnOrder.create({
        data: {
          userId: billingUser.id,
          rentCaseId: document.rentCaseId,
          documentId,
          type: "REGISTERED_LETTER",
          status: "COMPLETED",
          amountCents: 0,
          providerCostCents: ADD_ONS.REGISTERED_LETTER.providerCostCents,
          metadata: { includedInPlan: true, allowanceIncluded: allowance.included }
        }
      });
    }
    return { ok: true, data: { providerId: result.id } };
  } catch (error) {
    return toActionError(error);
  }
}

export async function requestSignature(formData: FormData): Promise<ActionResult<{ providerId?: string; signatureUrl?: string }>> {
  try {
    const user = await getCurrentUser();
    const accessibleUserIds = await getAccessibleUserIds(user.id);
    const documentId = String(formData.get("documentId"));
    const document = await prisma.generatedDocument.findFirst({
      where: { id: documentId, rentCase: { userId: { in: accessibleUserIds } } },
      include: { rentCase: { include: { tenant: true } } }
    });
    if (!document) throw new NotFoundError("Document introuvable");
    if (document.type !== "REPAYMENT_PLAN") throw new DomainError("La signature électronique est réservée aux plans d'apurement.");
    const tenant = document.rentCase.tenant;
    if (!tenant.email) throw new DomainError("Email locataire manquant pour la signature électronique.");
    const pdfBuffer = await renderDocumentPdf({
      title: document.title,
      contentText: document.contentText
    });
    const result = await createSignatureProvider({
      documentTitle: document.title,
      pdfBase64: pdfBuffer.toString("base64"),
      signerEmail: tenant.email,
      signerName: `${tenant.firstName} ${tenant.lastName}`
    });
    await prisma.eSignatureRequest.create({
      data: {
        documentId,
        provider: "YOUSIGN",
        providerId: result.id ?? null,
        status: "SENT",
        signerEmail: tenant.email,
        signerName: `${tenant.firstName} ${tenant.lastName}`,
        signatureUrl: result.signatureUrl ?? null,
        signedDocumentUrl: null
      }
    });
    return { ok: true, data: { providerId: result.id, signatureUrl: result.signatureUrl } };
  } catch (error) {
    return toActionError(error);
  }
}

export async function requestProfessionalReferral(formData: FormData) {
  const user = await getCurrentUser();
  const rentCaseId = String(formData.get("rentCaseId"));
  const partnerId = String(formData.get("partnerId"));
  const note = String(formData.get("note") || "");
  const rentCase = await prisma.rentCase.findFirst({ where: { id: rentCaseId, userId: user.id } });
  const partner = await prisma.partnerProfessional.findUnique({ where: { id: partnerId } });
  if (!rentCase) throw new NotFoundError("Dossier introuvable");
  if (!partner) throw new NotFoundError("Partenaire introuvable");
  await prisma.professionalReferral.create({ data: { rentCaseId, partnerId, note } });
  await prisma.caseEvent.create({
    data: {
      rentCaseId,
      type: "PROFESSIONAL_FILE_PREPARED",
      title: `Mise en relation demandée : ${partner.name}`,
      description: note || `Demande transmise au partenaire ${partner.type}.`,
      eventDate: new Date()
    }
  });
  redirect(`/app/cases/${rentCaseId}?referral=requested`);
}

export async function requestGliQuote(formData: FormData) {
  const user = await getCurrentUser();
  const propertyId = String(formData.get("propertyId") || "");
  const property = propertyId ? await prisma.property.findFirst({ where: { id: propertyId, userId: user.id } }) : null;
  const profile = await prisma.landlordProfile.findUnique({ where: { userId: user.id } });
  if (!profile?.email || !profile.fullName) throw new DomainError("Profil bailleur incomplet");
  const lead = await prisma.gliLead.create({ data: { userId: user.id, propertyId: property?.id ?? null } });
  try {
    const result = await sendGliLeadProvider({
      fullName: profile.fullName,
      email: profile.email,
      propertyName: property?.name,
      rentAmountCents: property?.rentAmountCents
    });
    await prisma.gliLead.update({
      where: { id: lead.id },
      data: {
        provider: result.provider ?? null,
        status: "SENT_TO_PARTNER",
        estimatedAnnualPremiumCents: result.estimatedAnnualPremiumCents ?? null,
        commissionCents: result.commissionCents ?? null
      }
    });
  } catch {
    await prisma.gliLead.update({ where: { id: lead.id }, data: { status: "REQUESTED" } });
  }
  redirect("/app/gli?requested=1");
}

export async function createSciProfile(formData: FormData) {
  const user = await getCurrentUser();
  if (!["GESTIONNAIRE", "AGENCE"].includes(user.plan)) throw new DomainError("Le module SCI est disponible à partir du forfait Gestionnaire.");
  const legalName = String(formData.get("legalName") || "").trim();
  if (legalName.length < 2) throw new ValidationError("Nom SCI invalide");
  await prisma.organization.create({
    data: {
      name: legalName,
      type: "SCI",
      members: { create: { userId: user.id, role: "OWNER" } },
      sciProfile: {
        create: {
          legalName,
          siren: String(formData.get("siren") || "") || null,
          shareCapital: String(formData.get("shareCapital") || "") || null,
          taxRegime: String(formData.get("taxRegime") || "") || null,
          notes: String(formData.get("notes") || "")
        }
      }
    }
  });
  redirect("/app/sci?saved=1");
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { applyPaymentToLines, calculateCaseSeverity, computeLineUnpaidAmount, generateDefaultTimeline, getNextRecommendedAction } from "@/domain/rent-cases";
import { generateDocumentTemplate } from "@/domain/rent-cases/documents";
import { generateDocumentWithAI } from "./ai-documents";
import { DomainError, NotFoundError, toActionError, ValidationError, type ActionResult } from "@/lib/errors";
import { centsFromEuros } from "@/lib/utils";
import { getCurrentUser } from "./auth";
import { recalculateCase, rentCaseInclude, toDomainCase } from "./cases";
import { prisma } from "./db";
import { assertActiveSubscription, assertCanCreateActiveCase, assertCanCreateProperty, assertCanGenerateDocument } from "./entitlements";
import { PLAN_DEFINITIONS } from "@/lib/plans";
import { sendDocumentEmail, sendableDocumentTypes } from "./email";
import { getAccessibleUserIds } from "./workspace";
import { createCaseSchema, documentSchema, eventSchema, paymentSchema, propertySchema, settingsSchema, tenantSchema, unpaidLineSchema } from "./validators";

function parseFormMoney(formData: FormData, key: string) {
  const cents = centsFromEuros(formData.get(key));
  if (!Number.isFinite(cents) || cents < 0) throw new ValidationError("Montant invalide");
  return cents;
}

export async function saveProperty(formData: FormData) {
  const user = await getCurrentUser();
  const accessibleUserIds = await getAccessibleUserIds(user.id);
  const data = propertySchema.parse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    address: formData.get("address"),
    city: formData.get("city"),
    postalCode: formData.get("postalCode"),
    rentAmountCents: parseFormMoney(formData, "rentAmount"),
    chargesAmountCents: parseFormMoney(formData, "chargesAmount"),
    paymentDayOfMonth: Number(formData.get("paymentDayOfMonth")),
    leaseStartDate: formData.get("leaseStartDate"),
    hasGuarantor: formData.get("hasGuarantor") === "on",
    notes: formData.get("notes") ?? ""
  });
  if (data.id) {
    const existing = await prisma.property.findFirst({ where: { id: data.id, userId: { in: accessibleUserIds } } });
    if (!existing) throw new NotFoundError("Bien introuvable");
    await prisma.property.update({ where: { id: data.id }, data });
  } else {
    await assertCanCreateProperty(user);
    await prisma.property.create({ data: { ...data, userId: user.id } });
  }
  revalidatePath("/app/properties");
  redirect("/app/properties?flash=saved");
}

export async function saveTenant(formData: FormData) {
  const user = await getCurrentUser();
  const accessibleUserIds = await getAccessibleUserIds(user.id);
  const data = tenantSchema.parse({
    id: formData.get("id") || undefined,
    propertyId: formData.get("propertyId") || null,
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    guarantorName: formData.get("guarantorName") || null,
    guarantorEmail: formData.get("guarantorEmail") || "",
    guarantorPhone: formData.get("guarantorPhone") || null,
    notes: formData.get("notes") ?? ""
  });
  if (data.propertyId) {
    const property = await prisma.property.findFirst({ where: { id: data.propertyId, userId: { in: accessibleUserIds } } });
    if (!property) throw new NotFoundError("Bien introuvable");
  }
  if (data.id) {
    const existing = await prisma.tenant.findFirst({ where: { id: data.id, userId: { in: accessibleUserIds } } });
    if (!existing) throw new NotFoundError("Locataire introuvable");
    await prisma.tenant.update({ where: { id: data.id }, data });
  } else {
    await prisma.tenant.create({ data: { ...data, userId: user.id } });
  }
  revalidatePath("/app/tenants");
  redirect("/app/tenants?flash=saved");
}

export async function createRentCase(formData: FormData) {
  const user = await getCurrentUser();
  const accessibleUserIds = await getAccessibleUserIds(user.id);
  await assertCanCreateActiveCase(user);
  const propertyId = String(formData.get("propertyId"));
  const tenantId = String(formData.get("tenantId"));
  const property = await prisma.property.findFirst({ where: { id: propertyId, userId: { in: accessibleUserIds } } });
  const tenant = await prisma.tenant.findFirst({ where: { id: tenantId, userId: { in: accessibleUserIds } } });
  if (!property) throw new NotFoundError("Bien introuvable");
  if (!tenant) throw new NotFoundError("Locataire introuvable");

  const line = unpaidLineSchema.parse({
    periodLabel: formData.get("periodLabel"),
    dueDate: formData.get("dueDate"),
    rentDueCents: parseFormMoney(formData, "rentDue"),
    chargesDueCents: parseFormMoney(formData, "chargesDue"),
    paidAmountCents: parseFormMoney(formData, "paidAmount")
  });
  const unpaidAmountCents = computeLineUnpaidAmount(line);
  const data = createCaseSchema.parse({
    propertyId,
    tenantId,
    firstMissedPaymentDate: formData.get("firstMissedPaymentDate"),
    contactAlreadyMade: formData.get("contactAlreadyMade") === "on",
    legalDisclaimerAcknowledged: formData.get("legalDisclaimerAcknowledged") === "on",
    lines: [line]
  });
  const domainDraft = {
    status: "AMICABLE" as const,
    firstMissedPaymentDate: data.firstMissedPaymentDate,
    totalUnpaidCents: unpaidAmountCents,
    lines: [{ ...line, unpaidAmountCents, status: unpaidAmountCents === 0 ? "PAID" as const : line.paidAmountCents > 0 ? "PARTIAL" as const : "UNPAID" as const }],
    events: [],
    hasGuarantor: property.hasGuarantor || Boolean(tenant.guarantorName),
    documents: []
  };
  const nextAction = getNextRecommendedAction(domainDraft);
  const created = await prisma.rentCase.create({
    data: {
      userId: user.id,
      propertyId,
      tenantId,
      status: "AMICABLE",
      severity: calculateCaseSeverity(domainDraft),
      firstMissedPaymentDate: data.firstMissedPaymentDate,
      totalUnpaidCents: unpaidAmountCents,
      nextActionLabel: nextAction.label,
      nextActionDate: nextAction.date,
      legalDisclaimerAcknowledged: data.legalDisclaimerAcknowledged,
      lines: { create: { ...line, unpaidAmountCents, status: domainDraft.lines[0].status } },
      events: {
        create: generateDefaultTimeline({ firstMissedPaymentDate: data.firstMissedPaymentDate, hasGuarantor: domainDraft.hasGuarantor }).map((event) => ({
          ...event,
          description: event.description ?? null
        }))
      }
    }
  });
  if (data.contactAlreadyMade) {
    await prisma.caseEvent.create({ data: { rentCaseId: created.id, type: "PHONE_CALL", title: "Contact déjà réalisé", eventDate: new Date(), description: "Indiqué lors de la création du dossier." } });
  }
  await recalculateCase(created.id);
  redirect(`/app/cases/${created.id}`);
}

export async function addUnpaidRentLine(formData: FormData) {
  const user = await getCurrentUser();
  const accessibleUserIds = await getAccessibleUserIds(user.id);
  const rentCaseId = String(formData.get("rentCaseId"));
  const rentCase = await prisma.rentCase.findFirst({ where: { id: rentCaseId, userId: { in: accessibleUserIds } } });
  if (!rentCase) throw new NotFoundError();
  const line = unpaidLineSchema.parse({
    rentCaseId,
    periodLabel: formData.get("periodLabel"),
    dueDate: formData.get("dueDate"),
    rentDueCents: parseFormMoney(formData, "rentDue"),
    chargesDueCents: parseFormMoney(formData, "chargesDue"),
    paidAmountCents: parseFormMoney(formData, "paidAmount")
  });
  const unpaidAmountCents = computeLineUnpaidAmount(line);
  await prisma.unpaidRentLine.create({ data: { ...line, rentCaseId, unpaidAmountCents, status: unpaidAmountCents === 0 ? "PAID" : line.paidAmountCents > 0 ? "PARTIAL" : "UNPAID" } });
  await recalculateCase(rentCaseId);
  revalidatePath(`/app/cases/${rentCaseId}`);
}

export async function updateUnpaidRentLine(formData: FormData) {
  const user = await getCurrentUser();
  const accessibleUserIds = await getAccessibleUserIds(user.id);
  const id = String(formData.get("id"));
  const existing = await prisma.unpaidRentLine.findFirst({ where: { id, rentCase: { userId: { in: accessibleUserIds } } } });
  if (!existing) throw new NotFoundError("Ligne introuvable");
  const line = unpaidLineSchema.parse({
    id,
    periodLabel: formData.get("periodLabel"),
    dueDate: formData.get("dueDate"),
    rentDueCents: parseFormMoney(formData, "rentDue"),
    chargesDueCents: parseFormMoney(formData, "chargesDue"),
    paidAmountCents: parseFormMoney(formData, "paidAmount")
  });
  const unpaidAmountCents = computeLineUnpaidAmount(line);
  await prisma.unpaidRentLine.update({ where: { id }, data: { ...line, unpaidAmountCents, status: unpaidAmountCents === 0 ? "PAID" : line.paidAmountCents > 0 ? "PARTIAL" : "UNPAID" } });
  await recalculateCase(existing.rentCaseId);
  revalidatePath(`/app/cases/${existing.rentCaseId}`);
}

export async function addCaseEvent(formData: FormData) {
  const user = await getCurrentUser();
  const accessibleUserIds = await getAccessibleUserIds(user.id);
  const data = eventSchema.parse({
    rentCaseId: formData.get("rentCaseId"),
    type: formData.get("type"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    eventDate: formData.get("eventDate")
  });
  const rentCase = await prisma.rentCase.findFirst({ where: { id: data.rentCaseId, userId: { in: accessibleUserIds } } });
  if (!rentCase) throw new NotFoundError();
  await prisma.caseEvent.create({ data });
  await recalculateCase(data.rentCaseId);
  revalidatePath(`/app/cases/${data.rentCaseId}`);
}

export async function addPayment(formData: FormData) {
  const user = await getCurrentUser();
  const accessibleUserIds = await getAccessibleUserIds(user.id);
  const data = paymentSchema.parse({
    rentCaseId: formData.get("rentCaseId"),
    amountCents: parseFormMoney(formData, "amount"),
    paymentDate: formData.get("paymentDate"),
    note: formData.get("note") || undefined
  });
  const rentCase = await prisma.rentCase.findFirst({ where: { id: data.rentCaseId, userId: { in: accessibleUserIds } }, include: { lines: { orderBy: { dueDate: "asc" } } } });
  if (!rentCase) throw new NotFoundError();
  const updatedLines = applyPaymentToLines(rentCase.lines, data.amountCents);
  for (const line of updatedLines) {
    const original = rentCase.lines.find((item) => item.id === line.id);
    if (!original || original.paidAmountCents === line.paidAmountCents) continue;
    await prisma.unpaidRentLine.update({ where: { id: line.id }, data: { paidAmountCents: line.paidAmountCents, unpaidAmountCents: line.unpaidAmountCents, status: line.status } });
  }
  await prisma.payment.create({ data });
  await prisma.caseEvent.create({ data: { rentCaseId: data.rentCaseId, type: "PAYMENT_RECEIVED", title: "Paiement reçu", description: data.note, eventDate: data.paymentDate } });
  await recalculateCase(data.rentCaseId);
  revalidatePath(`/app/cases/${data.rentCaseId}`);
}

export async function changeCaseStatus(formData: FormData) {
  const user = await getCurrentUser();
  const accessibleUserIds = await getAccessibleUserIds(user.id);
  const rentCaseId = String(formData.get("rentCaseId"));
  const status = String(formData.get("status"));
  const rentCase = await prisma.rentCase.findFirst({ where: { id: rentCaseId, userId: { in: accessibleUserIds } } });
  if (!rentCase) throw new NotFoundError();
  await prisma.rentCase.update({ where: { id: rentCaseId }, data: { status: status as never } });
  await recalculateCase(rentCaseId);
  revalidatePath(`/app/cases/${rentCaseId}`);
}

export async function generateDocumentResult(formData: FormData): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await getCurrentUser();
    const accessibleUserIds = await getAccessibleUserIds(user.id);
    const data = documentSchema.parse({ rentCaseId: formData.get("rentCaseId"), type: formData.get("type"), customNote: formData.get("customNote") || undefined });
    const rentCase = await prisma.rentCase.findFirst({ where: { id: data.rentCaseId, userId: { in: accessibleUserIds } }, include: rentCaseInclude });
    if (!rentCase) throw new NotFoundError();
    const billingUser = rentCase.userId === user.id ? user : await prisma.user.findUniqueOrThrow({ where: { id: rentCase.userId } });
    await assertCanGenerateDocument(billingUser);
    const profile = await prisma.landlordProfile.findUnique({ where: { userId: rentCase.userId } });
    if (!profile) throw new DomainError("Impossible de générer ce document sans profil bailleur complet");
    if (!profile.fullName || !profile.email || !profile.phone || !profile.address || !profile.defaultSignature) {
      throw new DomainError("Impossible de générer ce document sans profil bailleur complet");
    }
    if (data.type === "FORMAL_NOTICE_DRAFT" && !rentCase.legalDisclaimerAcknowledged) {
      throw new DomainError("Le disclaimer juridique doit être accepté avant ce brouillon");
    }
    if (data.type === "GUARANTOR_INFORMATION_LETTER" && !rentCase.tenant.guarantorName && !rentCase.property.hasGuarantor) {
      throw new DomainError("Aucune caution n’est renseignée pour ce dossier");
    }
    const docInput = {
      type: data.type,
      landlord: profile,
      tenant: rentCase.tenant,
      property: rentCase.property,
      rentCase,
      lines: rentCase.lines,
      events: rentCase.events,
      documents: rentCase.documents,
      currentDate: new Date(),
      customNote: data.customNote
    };
    const canUseAI = process.env.ANTHROPIC_API_KEY && PLAN_DEFINITIONS[billingUser.plan].hasAI;
    const generated = canUseAI
      ? await generateDocumentWithAI(docInput).catch(() => generateDocumentTemplate(docInput))
      : generateDocumentTemplate(docInput);
    const document = await prisma.generatedDocument.create({ data: { rentCaseId: data.rentCaseId, type: data.type, ...generated } });
    await prisma.caseEvent.create({ data: { rentCaseId: data.rentCaseId, type: "DOCUMENT_GENERATED", title: `Document généré : ${generated.title}`, eventDate: new Date() } });
    await recalculateCase(data.rentCaseId);
    revalidatePath(`/app/cases/${data.rentCaseId}`);
    revalidatePath("/app/documents");
    return { ok: true, data: { id: document.id } };
  } catch (error) {
    return toActionError(error);
  }
}

export async function generateDocumentAction(formData: FormData): Promise<void> {
  const result = await generateDocumentResult(formData);
  if (!result.ok) throw new Error(result.error.message);
}

export async function deleteCase(formData: FormData) {
  const user = await getCurrentUser();
  const accessibleUserIds = await getAccessibleUserIds(user.id);
  const id = String(formData.get("id"));
  const rentCase = await prisma.rentCase.findFirst({ where: { id, userId: { in: accessibleUserIds } } });
  if (!rentCase) throw new NotFoundError("Dossier introuvable");
  await prisma.rentCase.delete({ where: { id } });
  revalidatePath("/app/cases");
  revalidatePath("/app");
  redirect("/app/cases");
}

export async function deleteDocument(formData: FormData) {
  const user = await getCurrentUser();
  const accessibleUserIds = await getAccessibleUserIds(user.id);
  const id = String(formData.get("id"));
  const document = await prisma.generatedDocument.findFirst({ where: { id, rentCase: { userId: { in: accessibleUserIds } } } });
  if (!document) throw new NotFoundError("Document introuvable");
  await prisma.generatedDocument.delete({ where: { id } });
  revalidatePath("/app/documents");
  revalidatePath(`/app/cases/${document.rentCaseId}`);
}

export async function saveSettings(formData: FormData) {
  const user = await getCurrentUser();
  const data = settingsSchema.parse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    defaultSignature: formData.get("defaultSignature")
  });
  await prisma.landlordProfile.upsert({ where: { userId: user.id }, update: data, create: { ...data, userId: user.id } });
  redirect("/app/settings?saved=1");
}

export async function sendDocumentByEmail(formData: FormData): Promise<ActionResult<{ to: string }>> {
  try {
    const user = await getCurrentUser();
    const accessibleUserIds = await getAccessibleUserIds(user.id);
    assertActiveSubscription(user);
    if (!PLAN_DEFINITIONS[user.plan].hasAutoReminders) {
      throw new DomainError("L'envoi email est disponible à partir du forfait Bailleur.");
    }
    const id = String(formData.get("id"));
    const document = await prisma.generatedDocument.findFirst({
      where: { id, rentCase: { userId: { in: accessibleUserIds } } },
      include: { rentCase: { include: { tenant: true } } }
    });
    if (!document) throw new NotFoundError("Document introuvable");
    if (!sendableDocumentTypes.has(document.type)) throw new DomainError("Ce type de document ne peut pas être envoyé par email");
    const profile = await prisma.landlordProfile.findUnique({ where: { userId: document.rentCase.userId } });
    if (!profile?.email) throw new DomainError("Complétez votre profil bailleur avant d'envoyer des emails");

    const tenant = document.rentCase.tenant;
    const isGuarantor = document.type === "GUARANTOR_INFORMATION_LETTER";
    const recipientEmail = isGuarantor ? tenant.guarantorEmail : tenant.email;
    const recipientName = isGuarantor
      ? (tenant.guarantorName ?? "Caution")
      : `${tenant.firstName} ${tenant.lastName}`;

    if (!recipientEmail) throw new DomainError(isGuarantor ? "Adresse email de la caution manquante" : "Adresse email du locataire manquante");

    const sent = await sendDocumentEmail({
      to: recipientEmail,
      toName: recipientName,
      subject: document.title,
      documentTitle: document.title,
      contentHtml: document.contentHtml,
      landlordName: profile.fullName ?? profile.email
    });

    await prisma.emailLog.create({
      data: {
        documentId: id,
        to: recipientEmail,
        subject: document.title,
        resendId: sent?.id ?? null
      }
    });

    revalidatePath("/app/documents");
    return { ok: true, data: { to: recipientEmail } };
  } catch (e) {
    return toActionError(e);
  }
}

export async function exportCaseSummary(rentCaseId: string) {
  const user = await getCurrentUser();
  const accessibleUserIds = await getAccessibleUserIds(user.id);
  const rentCase = await prisma.rentCase.findFirst({ where: { id: rentCaseId, userId: { in: accessibleUserIds } }, include: rentCaseInclude });
  if (!rentCase) throw new NotFoundError();
  return toDomainCase(rentCase);
}

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { calculateCaseSeverity, computeLineUnpaidAmount, generateDefaultTimeline, getNextRecommendedAction } from "@/domain/rent-cases";
import { generateDocumentTemplate } from "@/domain/rent-cases/documents";
import { centsFromEuros } from "@/lib/utils";
import { DomainError, ValidationError } from "@/lib/errors";
import { getCurrentUser } from "./auth";
import { recalculateCase, rentCaseInclude } from "./cases";
import { prisma } from "./db";
import { assertCanCreateActiveCase, assertCanCreateProperty } from "./entitlements";
import { propertySchema, tenantSchema, unpaidLineSchema } from "./validators";

function parseFormMoney(formData: FormData, key: string) {
  const cents = centsFromEuros(formData.get(key));
  if (!Number.isFinite(cents) || cents < 0) throw new ValidationError("Montant invalide");
  return cents;
}

export async function getOnboardingState(userId: string) {
  const [user, profile, properties, tenants, cases, documents] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { onboardingCompletedAt: true, emailVerifiedAt: true } }),
    prisma.landlordProfile.findUnique({ where: { userId } }),
    prisma.property.count({ where: { userId } }),
    prisma.tenant.count({ where: { userId } }),
    prisma.rentCase.count({ where: { userId } }),
    prisma.generatedDocument.count({ where: { rentCase: { userId } } })
  ]);

  const profileComplete = Boolean(profile?.fullName && profile.email && profile.phone && profile.address && profile.defaultSignature);
  const steps = [
    { id: "profile", title: "Profil bailleur", done: profileComplete },
    { id: "property", title: "Première propriété", done: properties > 0 },
    { id: "tenant", title: "Premier locataire", done: tenants > 0 },
    { id: "case", title: "Première ligne d'impayé", done: cases > 0 },
    { id: "document", title: "Premier document généré", done: documents > 0 }
  ];
  const completed = Boolean(user?.onboardingCompletedAt) || steps.every((step) => step.done);
  const completedCount = steps.filter((step) => step.done).length;
  return {
    completed,
    completedAt: user?.onboardingCompletedAt ?? null,
    emailVerified: true,
    completedCount,
    total: steps.length,
    progress: Math.round((completedCount / steps.length) * 100),
    steps
  };
}

export async function completeOnboarding(formData: FormData) {
  const user = await getCurrentUser();
  await assertCanCreateProperty(user);
  await assertCanCreateActiveCase(user);

  const profile = {
    fullName: String(formData.get("fullName") ?? "").trim(),
    email: String(formData.get("profileEmail") ?? "").trim().toLowerCase(),
    phone: String(formData.get("phone") ?? "").trim(),
    address: String(formData.get("landlordAddress") ?? "").trim(),
    defaultSignature: String(formData.get("defaultSignature") ?? "").trim()
  };
  if (!profile.fullName || !profile.email || !profile.phone || !profile.address || !profile.defaultSignature) {
    throw new DomainError("Complétez le profil bailleur avant de créer votre premier dossier.");
  }

  const property = propertySchema.parse({
    name: formData.get("propertyName"),
    address: formData.get("propertyAddress"),
    city: formData.get("propertyCity"),
    postalCode: formData.get("propertyPostalCode"),
    rentAmountCents: parseFormMoney(formData, "rentAmount"),
    chargesAmountCents: parseFormMoney(formData, "chargesAmount"),
    paymentDayOfMonth: Number(formData.get("paymentDayOfMonth")),
    leaseStartDate: formData.get("leaseStartDate"),
    hasGuarantor: formData.get("hasGuarantor") === "on",
    notes: ""
  });

  const tenant = tenantSchema.parse({
    propertyId: null,
    firstName: formData.get("tenantFirstName"),
    lastName: formData.get("tenantLastName"),
    email: formData.get("tenantEmail"),
    phone: formData.get("tenantPhone"),
    address: formData.get("tenantAddress"),
    guarantorName: formData.get("guarantorName") || null,
    guarantorEmail: formData.get("guarantorEmail") || "",
    guarantorPhone: formData.get("guarantorPhone") || null,
    notes: ""
  });

  const line = unpaidLineSchema.parse({
    periodLabel: formData.get("periodLabel"),
    dueDate: formData.get("dueDate"),
    rentDueCents: parseFormMoney(formData, "lineRentDue"),
    chargesDueCents: parseFormMoney(formData, "lineChargesDue"),
    paidAmountCents: parseFormMoney(formData, "paidAmount")
  });

  const legalDisclaimerAcknowledged = formData.get("legalDisclaimerAcknowledged") === "on";
  if (!legalDisclaimerAcknowledged) {
    throw new DomainError("Le rappel de prudence juridique doit être accepté.");
  }

  const unpaidAmountCents = computeLineUnpaidAmount(line);
  const domainDraft = {
    status: "AMICABLE" as const,
    firstMissedPaymentDate: line.dueDate,
    totalUnpaidCents: unpaidAmountCents,
    lines: [{ ...line, unpaidAmountCents, status: unpaidAmountCents === 0 ? "PAID" as const : line.paidAmountCents > 0 ? "PARTIAL" as const : "UNPAID" as const }],
    events: [],
    hasGuarantor: property.hasGuarantor || Boolean(tenant.guarantorName),
    documents: []
  };
  const nextAction = getNextRecommendedAction(domainDraft);

  const createdCase = await prisma.$transaction(async (tx) => {
    await tx.landlordProfile.upsert({
      where: { userId: user.id },
      update: profile,
      create: { ...profile, userId: user.id }
    });

    const createdProperty = await tx.property.create({ data: { ...property, userId: user.id } });
    const createdTenant = await tx.tenant.create({ data: { ...tenant, userId: user.id, propertyId: createdProperty.id } });
    const rentCase = await tx.rentCase.create({
      data: {
        userId: user.id,
        propertyId: createdProperty.id,
        tenantId: createdTenant.id,
        status: "AMICABLE",
        severity: calculateCaseSeverity(domainDraft),
        firstMissedPaymentDate: line.dueDate,
        totalUnpaidCents: unpaidAmountCents,
        nextActionLabel: nextAction.label,
        nextActionDate: nextAction.date,
        legalDisclaimerAcknowledged,
        lines: { create: { ...line, unpaidAmountCents, status: domainDraft.lines[0].status } },
        events: {
          create: generateDefaultTimeline({ firstMissedPaymentDate: line.dueDate, hasGuarantor: domainDraft.hasGuarantor }).map((event) => ({
            ...event,
            description: event.description ?? null
          }))
        }
      }
    });
    await tx.user.update({ where: { id: user.id }, data: { onboardingCompletedAt: new Date() } });
    return rentCase;
  });

  await recalculateCase(createdCase.id, user.id);
  const rentCase = await prisma.rentCase.findFirst({ where: { id: createdCase.id, userId: user.id }, include: rentCaseInclude });
  const landlord = await prisma.landlordProfile.findUnique({ where: { userId: user.id } });
  if (rentCase && landlord) {
    const generated = generateDocumentTemplate({
      type: "AMICABLE_REMINDER_LETTER",
      landlord,
      tenant: rentCase.tenant,
      property: rentCase.property,
      rentCase,
      lines: rentCase.lines,
      events: rentCase.events,
      documents: rentCase.documents,
      currentDate: new Date()
    });
    await prisma.generatedDocument.create({ data: { rentCaseId: rentCase.id, type: "AMICABLE_REMINDER_LETTER", ...generated } });
    await prisma.caseEvent.create({ data: { rentCaseId: rentCase.id, type: "DOCUMENT_GENERATED", title: `Document généré : ${generated.title}`, eventDate: new Date() } });
  }

  revalidatePath("/app");
  revalidatePath("/app/onboarding");
  redirect(`/app/cases/${createdCase.id}?onboarding=complete`);
}

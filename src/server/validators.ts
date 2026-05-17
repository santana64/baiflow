import { z } from "zod";

const optionalEmail = z.string().trim().email("Email invalide").or(z.literal("")).transform((value) => value || "");

export const propertySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  address: z.string().min(4),
  city: z.string().min(2),
  postalCode: z.string().min(4),
  rentAmountCents: z.number().int().nonnegative("Montant invalide"),
  chargesAmountCents: z.number().int().nonnegative("Montant invalide"),
  paymentDayOfMonth: z.number().int().min(1).max(31),
  leaseStartDate: z.coerce.date(),
  hasGuarantor: z.boolean(),
  notes: z.string().default("")
});

export const tenantSchema = z.object({
  id: z.string().optional(),
  propertyId: z.string().optional().nullable(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: optionalEmail,
  phone: z.string().min(4),
  address: z.string().min(4),
  guarantorName: z.string().optional().nullable(),
  guarantorEmail: optionalEmail.optional(),
  guarantorPhone: z.string().optional().nullable(),
  notes: z.string().default("")
});

export const unpaidLineSchema = z.object({
  id: z.string().optional(),
  rentCaseId: z.string().optional(),
  periodLabel: z.string().min(3),
  dueDate: z.coerce.date(),
  rentDueCents: z.number().int().nonnegative("Montant invalide"),
  chargesDueCents: z.number().int().nonnegative("Montant invalide"),
  paidAmountCents: z.number().int().nonnegative("Montant invalide")
});

export const createCaseSchema = z.object({
  propertyId: z.string().min(1),
  tenantId: z.string().min(1),
  firstMissedPaymentDate: z.coerce.date(),
  contactAlreadyMade: z.boolean(),
  legalDisclaimerAcknowledged: z.boolean().refine(Boolean),
  lines: z.array(unpaidLineSchema).min(1)
});

export const eventSchema = z.object({
  rentCaseId: z.string().min(1),
  type: z.enum([
    "MISSED_PAYMENT",
    "PHONE_CALL",
    "EMAIL_SENT",
    "SIMPLE_LETTER_SENT",
    "REGISTERED_LETTER_PREPARED",
    "REPAYMENT_PLAN_PROPOSED",
    "REPAYMENT_PLAN_ACCEPTED",
    "GUARANTOR_CONTACTED",
    "DOCUMENT_GENERATED",
    "PROFESSIONAL_FILE_PREPARED",
    "PAYMENT_RECEIVED",
    "NOTE",
    "CUSTOM"
  ]),
  title: z.string().min(2),
  description: z.string().optional(),
  eventDate: z.coerce.date()
});

export const paymentSchema = z.object({
  rentCaseId: z.string().min(1),
  amountCents: z.number().int().positive("Montant invalide"),
  paymentDate: z.coerce.date(),
  note: z.string().optional()
});

export const documentSchema = z.object({
  rentCaseId: z.string().min(1),
  type: z.enum([
    "AMICABLE_REMINDER_EMAIL",
    "AMICABLE_REMINDER_LETTER",
    "FORMAL_NOTICE_DRAFT",
    "REPAYMENT_PLAN",
    "GUARANTOR_INFORMATION_LETTER",
    "CASE_SUMMARY",
    "PROFESSIONAL_ESCALATION_FILE"
  ]),
  customNote: z.string().optional()
});

export const settingsSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(4),
  address: z.string().min(6),
  defaultSignature: z.string().min(2)
});

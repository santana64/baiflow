export type CaseStatus =
  | "DRAFT"
  | "AMICABLE"
  | "FORMAL_NOTICE"
  | "REPAYMENT_PLAN"
  | "PROFESSIONAL_ESCALATION"
  | "RESOLVED"
  | "CLOSED";

export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type RentLineStatus = "UNPAID" | "PARTIAL" | "PAID";

export type EventType =
  | "MISSED_PAYMENT"
  | "PHONE_CALL"
  | "EMAIL_SENT"
  | "SIMPLE_LETTER_SENT"
  | "REGISTERED_LETTER_PREPARED"
  | "REPAYMENT_PLAN_PROPOSED"
  | "REPAYMENT_PLAN_ACCEPTED"
  | "GUARANTOR_CONTACTED"
  | "DOCUMENT_GENERATED"
  | "PROFESSIONAL_FILE_PREPARED"
  | "PAYMENT_RECEIVED"
  | "NOTE"
  | "CUSTOM";

export type DocumentType =
  | "AMICABLE_REMINDER_EMAIL"
  | "AMICABLE_REMINDER_LETTER"
  | "FORMAL_NOTICE_DRAFT"
  | "REPAYMENT_PLAN"
  | "GUARANTOR_INFORMATION_LETTER"
  | "CASE_SUMMARY"
  | "PROFESSIONAL_ESCALATION_FILE"
  | "RENT_RECEIPT";

export type RentLineLike = {
  periodLabel: string;
  dueDate: Date;
  rentDueCents: number;
  chargesDueCents: number;
  paidAmountCents: number;
  unpaidAmountCents: number;
  status: RentLineStatus;
};

export type EventLike = {
  type: EventType;
  title: string;
  description?: string | null;
  eventDate: Date;
};

export type RentCaseLike = {
  status: CaseStatus;
  firstMissedPaymentDate: Date;
  totalUnpaidCents: number;
  legalDisclaimerAcknowledged?: boolean;
  lines: RentLineLike[];
  events: EventLike[];
  hasGuarantor?: boolean;
  documents?: { type: DocumentType }[];
};

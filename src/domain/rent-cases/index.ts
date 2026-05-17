import { addDays, differenceInCalendarDays, format } from "date-fns";
import { fr } from "date-fns/locale";
import type { EventLike, RentCaseLike, RentLineLike, Severity } from "./types";

export function calculateUnpaidAmount(lines: Pick<RentLineLike, "unpaidAmountCents">[]) {
  return lines.reduce((total, line) => total + Math.max(0, line.unpaidAmountCents), 0);
}

export function computeLineUnpaidAmount(line: Pick<RentLineLike, "rentDueCents" | "chargesDueCents" | "paidAmountCents">) {
  return Math.max(0, line.rentDueCents + line.chargesDueCents - line.paidAmountCents);
}

export function applyPaymentToLines<T extends RentLineLike>(lines: T[], amountCents: number): T[] {
  let remaining = Math.max(0, amountCents);
  return lines
    .slice()
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .map((line) => {
      if (remaining <= 0 || line.unpaidAmountCents <= 0) return line;
      const applied = Math.min(remaining, line.unpaidAmountCents);
      remaining -= applied;
      const paidAmountCents = line.paidAmountCents + applied;
      const unpaidAmountCents = computeLineUnpaidAmount({ ...line, paidAmountCents });
      return {
        ...line,
        paidAmountCents,
        unpaidAmountCents,
        status: unpaidAmountCents === 0 ? "PAID" : "PARTIAL"
      } as T;
    });
}

export function computeOldestUnpaidMonth(lines: RentLineLike[]) {
  const unpaid = lines
    .filter((line) => line.unpaidAmountCents > 0)
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  return unpaid[0]?.periodLabel ?? "Aucun impayé";
}

export function calculateCaseSeverity(rentCase: RentCaseLike): Severity {
  const unpaidLines = rentCase.lines.filter((line) => line.unpaidAmountCents > 0);
  const fullUnpaidMonths = unpaidLines.filter((line) => line.paidAmountCents === 0).length;
  const repeatedPartials = unpaidLines.filter((line) => line.paidAmountCents > 0).length >= 2;
  const daysSinceFirstMiss = differenceInCalendarDays(new Date(), rentCase.firstMissedPaymentDate);
  const noContact = !rentCase.events.some((event) =>
    ["PHONE_CALL", "EMAIL_SENT", "SIMPLE_LETTER_SENT", "REGISTERED_LETTER_PREPARED", "REPAYMENT_PLAN_PROPOSED"].includes(event.type),
  );

  if (fullUnpaidMonths >= 3 || (noContact && rentCase.totalUnpaidCents >= 250000 && daysSinceFirstMiss >= 30)) return "CRITICAL";
  if (fullUnpaidMonths >= 2 || repeatedPartials) return "HIGH";
  if (fullUnpaidMonths === 1 || unpaidLines.length >= 1) return "MEDIUM";
  return "LOW";
}

export function getNextRecommendedAction(rentCase: RentCaseLike) {
  const eventTypes = new Set(rentCase.events.map((event) => event.type));
  const unpaidMonths = rentCase.lines.filter((line) => line.unpaidAmountCents > 0).length;
  const hasFormalDraft = rentCase.documents?.some((document) => document.type === "FORMAL_NOTICE_DRAFT") ?? false;

  if (rentCase.status === "RESOLVED" || rentCase.status === "CLOSED") {
    return { label: "Archiver les pièces et conserver l’historique", date: null as Date | null };
  }
  if (!eventTypes.has("PHONE_CALL") && !eventTypes.has("EMAIL_SENT")) {
    return { label: "Contacter le locataire et conserver une trace écrite", date: addDays(rentCase.firstMissedPaymentDate, 2) };
  }
  if (!eventTypes.has("SIMPLE_LETTER_SENT")) {
    return { label: "Envoyer une relance amiable écrite", date: addDays(rentCase.firstMissedPaymentDate, 7) };
  }
  if (rentCase.hasGuarantor && unpaidMonths >= 1 && !eventTypes.has("GUARANTOR_CONTACTED")) {
    return { label: "Informer prudemment la caution selon la situation", date: addDays(rentCase.firstMissedPaymentDate, 10) };
  }
  if (!eventTypes.has("REPAYMENT_PLAN_PROPOSED")) {
    return { label: "Proposer un plan d’apurement écrit", date: addDays(rentCase.firstMissedPaymentDate, 14) };
  }
  if (unpaidMonths >= 2 && !hasFormalDraft) {
    return { label: "Préparer un brouillon de mise en demeure à faire vérifier", date: addDays(rentCase.firstMissedPaymentDate, 30) };
  }
  if (unpaidMonths >= 2) {
    return { label: "Préparer le dossier à transmettre à un commissaire de justice ou conseil juridique", date: addDays(rentCase.firstMissedPaymentDate, 45) };
  }
  return { label: "Suivre l’échéance convenue et documenter chaque échange", date: addDays(new Date(), 7) };
}

export function generateDefaultTimeline(rentCase: Pick<RentCaseLike, "firstMissedPaymentDate" | "hasGuarantor">) {
  const first = rentCase.firstMissedPaymentDate;
  const items: EventLike[] = [
    { type: "MISSED_PAYMENT", title: "Échéance impayée constatée", eventDate: first },
    { type: "EMAIL_SENT", title: "Relance amiable recommandée", description: "Contact calme, factuel, avec trace écrite.", eventDate: addDays(first, 2) },
    { type: "SIMPLE_LETTER_SENT", title: "Courrier simple recommandé", description: "Rappeler le montant et proposer un échange.", eventDate: addDays(first, 7) },
    { type: "REPAYMENT_PLAN_PROPOSED", title: "Plan d’apurement à proposer", description: "Échéancier écrit si le locataire répond.", eventDate: addDays(first, 14) },
    { type: "REGISTERED_LETTER_PREPARED", title: "Brouillon de mise en demeure à vérifier", description: "Document préparatoire, conseil juridique recommandé.", eventDate: addDays(first, 30) },
    { type: "PROFESSIONAL_FILE_PREPARED", title: "Dossier préparatoire professionnel", description: "Pièces à vérifier avec ADIL, commissaire de justice ou conseil.", eventDate: addDays(first, 45) }
  ];
  if (rentCase.hasGuarantor) {
    items.splice(3, 0, {
      type: "GUARANTOR_CONTACTED",
      title: "Information prudente de la caution",
      description: "Selon le bail et la situation, garder un écrit factuel.",
      eventDate: addDays(first, 10)
    });
  }
  return items;
}

export function formatMoney(cents: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
}

export function formatFrenchDate(date: Date) {
  return format(date, "d MMMM yyyy", { locale: fr });
}

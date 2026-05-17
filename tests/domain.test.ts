import { describe, expect, it } from "vitest";
import { applyPaymentToLines, calculateCaseSeverity, calculateUnpaidAmount, computeLineUnpaidAmount, computeOldestUnpaidMonth, getNextRecommendedAction } from "@/domain/rent-cases";
import { generateDocumentTemplate } from "@/domain/rent-cases/documents";
import type { RentCaseLike, RentLineLike } from "@/domain/rent-cases/types";
import { pdfFileName, renderDocumentPdf } from "@/server/pdf";

const lines: RentLineLike[] = [
  { periodLabel: "Janvier 2026", dueDate: new Date("2026-01-05"), rentDueCents: 70000, chargesDueCents: 5000, paidAmountCents: 0, unpaidAmountCents: 75000, status: "UNPAID" },
  { periodLabel: "Février 2026", dueDate: new Date("2026-02-05"), rentDueCents: 70000, chargesDueCents: 5000, paidAmountCents: 30000, unpaidAmountCents: 45000, status: "PARTIAL" }
];

function rentCase(overrides: Partial<RentCaseLike> = {}): RentCaseLike {
  return {
    status: "AMICABLE",
    firstMissedPaymentDate: new Date("2026-01-05"),
    totalUnpaidCents: 120000,
    lines,
    events: [],
    hasGuarantor: true,
    documents: [],
    ...overrides
  };
}

describe("rent case domain", () => {
  it("calculates unpaid amount", () => {
    expect(calculateUnpaidAmount(lines)).toBe(120000);
  });

  it("calculates line unpaid amount", () => {
    expect(computeLineUnpaidAmount({ rentDueCents: 80000, chargesDueCents: 5000, paidAmountCents: 20000 })).toBe(65000);
  });

  it("calculates severity", () => {
    expect(calculateCaseSeverity(rentCase())).toBe("MEDIUM");
    expect(calculateCaseSeverity(rentCase({ lines: [...lines, { ...lines[0], periodLabel: "Mars 2026" }], totalUnpaidCents: 195000 }))).toBe("HIGH");
  });

  it("recommends next action", () => {
    expect(getNextRecommendedAction(rentCase()).label).toContain("Contacter");
    expect(getNextRecommendedAction(rentCase({ events: [{ type: "PHONE_CALL", title: "Appel", eventDate: new Date() }, { type: "SIMPLE_LETTER_SENT", title: "Courrier", eventDate: new Date() }] })).label).toContain("caution");
  });

  it("detects oldest unpaid month", () => {
    expect(computeOldestUnpaidMonth(lines)).toBe("Janvier 2026");
  });

  it("updates unpaid totals when a payment is applied", () => {
    const updated = applyPaymentToLines(lines, 80000);
    expect(calculateUnpaidAmount(updated)).toBe(40000);
    expect(updated[0].status).toBe("PAID");
    expect(updated[1].unpaidAmountCents).toBe(40000);
  });

  it("generates documents with parties and amounts", () => {
    const doc = generateDocumentTemplate({
      type: "CASE_SUMMARY",
      landlord: { fullName: "Claire Martin", email: "c@example.fr", phone: "0600", address: "Lyon", defaultSignature: "Claire" },
      tenant: { firstName: "Nadia", lastName: "Bernard", email: "n@example.fr", phone: "0601", address: "Lyon" },
      property: { name: "Appartement", address: "Rue", city: "Lyon", postalCode: "69000", rentAmountCents: 70000, chargesAmountCents: 5000, paymentDayOfMonth: 5, leaseStartDate: new Date("2025-01-01") },
      rentCase: { totalUnpaidCents: 120000, firstMissedPaymentDate: new Date("2026-01-05"), nextActionLabel: "Relancer" },
      lines,
      events: [],
      currentDate: new Date("2026-03-01")
    });
    expect(doc.contentText).toContain("Nadia Bernard");
    expect(doc.contentText).toContain("1 200,00");
  });

  it("renders a deterministic PDF export", async () => {
    const pdf = await renderDocumentPdf({ title: "Synthèse du dossier", contentText: "Claire Martin\n\nNadia Bernard\n\n1 200,00 EUR" });
    expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
    expect(pdfFileName("Synthèse du dossier")).toBe("synthese-du-dossier.pdf");
  });
});

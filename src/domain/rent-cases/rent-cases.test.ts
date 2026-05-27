import { describe, expect, it } from "vitest";
import {
  calculateUnpaidAmount,
  computeLineUnpaidAmount,
  applyPaymentToLines,
  computeOldestUnpaidMonth,
  calculateCaseSeverity,
  getNextRecommendedAction,
  formatMoney,
} from "./index";
import type { RentCaseLike, RentLineLike } from "./types";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeLine(overrides: Partial<RentLineLike> & { dueDate: Date }): RentLineLike {
  return {
    id: Math.random().toString(),
    periodLabel: "Janvier 2026",
    rentDueCents: 80000,
    chargesDueCents: 10000,
    paidAmountCents: 0,
    unpaidAmountCents: 90000,
    status: "UNPAID",
    ...overrides,
  };
}

function makeCase(overrides: Partial<RentCaseLike>): RentCaseLike {
  return {
    status: "AMICABLE",
    totalUnpaidCents: 0,
    firstMissedPaymentDate: new Date("2026-01-01"),
    hasGuarantor: false,
    events: [],
    lines: [],
    documents: [],
    ...overrides,
  };
}

// ─── calculateUnpaidAmount ────────────────────────────────────────────────────

describe("calculateUnpaidAmount", () => {
  it("sums unpaid amounts across all lines", () => {
    const lines = [
      makeLine({ dueDate: new Date("2026-01-01"), unpaidAmountCents: 90000 }),
      makeLine({ dueDate: new Date("2026-02-01"), unpaidAmountCents: 45000 }),
    ];
    expect(calculateUnpaidAmount(lines)).toBe(135000);
  });

  it("returns 0 for empty lines", () => {
    expect(calculateUnpaidAmount([])).toBe(0);
  });

  it("ignores negative unpaid amounts (floor at 0)", () => {
    const lines = [makeLine({ dueDate: new Date(), unpaidAmountCents: -500 })];
    expect(calculateUnpaidAmount(lines)).toBe(0);
  });

  it("handles fully paid lines (unpaidAmountCents = 0)", () => {
    const lines = [
      makeLine({ dueDate: new Date(), unpaidAmountCents: 0 }),
      makeLine({ dueDate: new Date(), unpaidAmountCents: 50000 }),
    ];
    expect(calculateUnpaidAmount(lines)).toBe(50000);
  });
});

// ─── computeLineUnpaidAmount ──────────────────────────────────────────────────

describe("computeLineUnpaidAmount", () => {
  it("returns rent + charges - paid when positive", () => {
    expect(computeLineUnpaidAmount({ rentDueCents: 80000, chargesDueCents: 10000, paidAmountCents: 40000 })).toBe(50000);
  });

  it("returns 0 when fully paid", () => {
    expect(computeLineUnpaidAmount({ rentDueCents: 80000, chargesDueCents: 10000, paidAmountCents: 90000 })).toBe(0);
  });

  it("returns 0 when overpaid (no negative unpaid)", () => {
    expect(computeLineUnpaidAmount({ rentDueCents: 80000, chargesDueCents: 10000, paidAmountCents: 100000 })).toBe(0);
  });

  it("works with zero charges", () => {
    expect(computeLineUnpaidAmount({ rentDueCents: 70000, chargesDueCents: 0, paidAmountCents: 0 })).toBe(70000);
  });
});

// ─── applyPaymentToLines ──────────────────────────────────────────────────────

describe("applyPaymentToLines", () => {
  it("applies full payment to a single line", () => {
    const lines = [makeLine({ dueDate: new Date("2026-01-01"), unpaidAmountCents: 90000 })];
    const result = applyPaymentToLines(lines, 90000);
    expect(result[0].unpaidAmountCents).toBe(0);
    expect(result[0].status).toBe("PAID");
  });

  it("applies partial payment to a single line", () => {
    const lines = [makeLine({ dueDate: new Date("2026-01-01"), unpaidAmountCents: 90000 })];
    const result = applyPaymentToLines(lines, 45000);
    expect(result[0].unpaidAmountCents).toBe(45000);
    expect(result[0].status).toBe("PARTIAL");
  });

  it("applies payment chronologically (oldest first)", () => {
    const lines = [
      makeLine({ dueDate: new Date("2026-02-01"), unpaidAmountCents: 90000, periodLabel: "Février" }),
      makeLine({ dueDate: new Date("2026-01-01"), unpaidAmountCents: 90000, periodLabel: "Janvier" }),
    ];
    const result = applyPaymentToLines(lines, 90000);
    const jan = result.find((l) => l.periodLabel === "Janvier")!;
    const feb = result.find((l) => l.periodLabel === "Février")!;
    expect(jan.status).toBe("PAID");
    expect(feb.status).toBe("UNPAID");
  });

  it("distributes payment across multiple lines", () => {
    const lines = [
      makeLine({ dueDate: new Date("2026-01-01"), unpaidAmountCents: 90000 }),
      makeLine({ dueDate: new Date("2026-02-01"), unpaidAmountCents: 90000 }),
    ];
    const result = applyPaymentToLines(lines, 135000);
    expect(result[0].status).toBe("PAID");
    expect(result[1].status).toBe("PARTIAL");
    expect(result[1].unpaidAmountCents).toBe(45000);
  });

  it("ignores already-paid lines", () => {
    const lines = [
      makeLine({ dueDate: new Date("2026-01-01"), unpaidAmountCents: 0, status: "PAID" }),
      makeLine({ dueDate: new Date("2026-02-01"), unpaidAmountCents: 90000 }),
    ];
    const result = applyPaymentToLines(lines, 90000);
    expect(result.find((l) => l.dueDate.getTime() === new Date("2026-02-01").getTime())!.status).toBe("PAID");
  });

  it("does not mutate original lines array", () => {
    const lines = [makeLine({ dueDate: new Date(), unpaidAmountCents: 90000 })];
    const original = lines[0].paidAmountCents;
    applyPaymentToLines(lines, 45000);
    expect(lines[0].paidAmountCents).toBe(original);
  });

  it("handles zero payment gracefully", () => {
    const lines = [makeLine({ dueDate: new Date(), unpaidAmountCents: 90000 })];
    const result = applyPaymentToLines(lines, 0);
    expect(result[0].unpaidAmountCents).toBe(90000);
  });
});

// ─── computeOldestUnpaidMonth ──────────────────────────────────────────────────

describe("computeOldestUnpaidMonth", () => {
  it("returns the period label of the oldest unpaid line", () => {
    const lines = [
      makeLine({ dueDate: new Date("2026-02-01"), periodLabel: "Février 2026", unpaidAmountCents: 90000 }),
      makeLine({ dueDate: new Date("2026-01-01"), periodLabel: "Janvier 2026", unpaidAmountCents: 90000 }),
    ];
    expect(computeOldestUnpaidMonth(lines)).toBe("Janvier 2026");
  });

  it("returns 'Aucun impayé' when all lines are paid", () => {
    const lines = [makeLine({ dueDate: new Date(), unpaidAmountCents: 0 })];
    expect(computeOldestUnpaidMonth(lines)).toBe("Aucun impayé");
  });

  it("returns 'Aucun impayé' for empty array", () => {
    expect(computeOldestUnpaidMonth([])).toBe("Aucun impayé");
  });
});

// ─── calculateCaseSeverity ────────────────────────────────────────────────────

describe("calculateCaseSeverity", () => {
  it("returns LOW when all lines are fully paid (no unpaid amount)", () => {
    const rentCase = makeCase({
      totalUnpaidCents: 0,
      firstMissedPaymentDate: new Date(),
      lines: [makeLine({ dueDate: new Date(), unpaidAmountCents: 0, paidAmountCents: 90000 })],
    });
    expect(calculateCaseSeverity(rentCase)).toBe("LOW");
  });

  it("returns MEDIUM for a partial payment (still has unpaid balance)", () => {
    const rentCase = makeCase({
      totalUnpaidCents: 45000,
      firstMissedPaymentDate: new Date(),
      lines: [makeLine({ dueDate: new Date(), unpaidAmountCents: 45000, paidAmountCents: 45000 })],
    });
    expect(calculateCaseSeverity(rentCase)).toBe("MEDIUM");
  });

  it("returns MEDIUM for 1 fully unpaid month", () => {
    const rentCase = makeCase({
      totalUnpaidCents: 90000,
      firstMissedPaymentDate: new Date(),
      lines: [makeLine({ dueDate: new Date(), unpaidAmountCents: 90000, paidAmountCents: 0 })],
    });
    expect(calculateCaseSeverity(rentCase)).toBe("MEDIUM");
  });

  it("returns HIGH for 2 fully unpaid months", () => {
    const rentCase = makeCase({
      totalUnpaidCents: 180000,
      firstMissedPaymentDate: new Date("2026-01-01"),
      lines: [
        makeLine({ dueDate: new Date("2026-01-01"), unpaidAmountCents: 90000, paidAmountCents: 0 }),
        makeLine({ dueDate: new Date("2026-02-01"), unpaidAmountCents: 90000, paidAmountCents: 0 }),
      ],
    });
    expect(calculateCaseSeverity(rentCase)).toBe("HIGH");
  });

  it("returns CRITICAL for 3+ fully unpaid months", () => {
    const rentCase = makeCase({
      totalUnpaidCents: 270000,
      firstMissedPaymentDate: new Date("2026-01-01"),
      lines: [
        makeLine({ dueDate: new Date("2026-01-01"), unpaidAmountCents: 90000, paidAmountCents: 0 }),
        makeLine({ dueDate: new Date("2026-02-01"), unpaidAmountCents: 90000, paidAmountCents: 0 }),
        makeLine({ dueDate: new Date("2026-03-01"), unpaidAmountCents: 90000, paidAmountCents: 0 }),
      ],
    });
    expect(calculateCaseSeverity(rentCase)).toBe("CRITICAL");
  });
});

// ─── getNextRecommendedAction ─────────────────────────────────────────────────

describe("getNextRecommendedAction", () => {
  it("recommends contacting tenant first when no contact made", () => {
    const rentCase = makeCase({ events: [], lines: [] });
    const action = getNextRecommendedAction(rentCase);
    expect(action.label).toContain("Contacter");
  });

  it("recommends simple letter after first contact", () => {
    const rentCase = makeCase({
      events: [{ type: "EMAIL_SENT" }],
      lines: [],
    });
    const action = getNextRecommendedAction(rentCase);
    expect(action.label.toLowerCase()).toContain("relance");
  });

  it("recommends repayment plan after simple letter", () => {
    const rentCase = makeCase({
      events: [{ type: "EMAIL_SENT" }, { type: "SIMPLE_LETTER_SENT" }],
      lines: [makeLine({ dueDate: new Date(), unpaidAmountCents: 90000 })],
    });
    const action = getNextRecommendedAction(rentCase);
    expect(action.label.toLowerCase()).toContain("plan");
  });

  it("returns archive recommendation for resolved cases", () => {
    const rentCase = makeCase({ status: "RESOLVED", events: [], lines: [] });
    const action = getNextRecommendedAction(rentCase);
    expect(action.label.toLowerCase()).toContain("archiver");
  });

  it("returns archive recommendation for closed cases", () => {
    const rentCase = makeCase({ status: "CLOSED", events: [], lines: [] });
    const action = getNextRecommendedAction(rentCase);
    expect(action.label.toLowerCase()).toContain("archiver");
  });
});

// ─── formatMoney ──────────────────────────────────────────────────────────────

describe("formatMoney", () => {
  it("formats cents as euros", () => {
    const result = formatMoney(90000);
    expect(result).toContain("900");
    expect(result).toContain("€");
  });

  it("formats zero as 0 euros", () => {
    const result = formatMoney(0);
    expect(result).toContain("0");
    expect(result).toContain("€");
  });

  it("formats fractional euros correctly", () => {
    const result = formatMoney(50);
    expect(result).toContain("0,50");
  });
});

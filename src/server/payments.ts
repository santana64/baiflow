import { applyPaymentToLines } from "@/domain/rent-cases";
import { recalculateCase } from "./cases";
import { prisma } from "./db";

export async function recordPaymentAndRecalculate(input: {
  rentCaseId: string;
  userId: string;
  amountCents: number;
  paymentDate: Date;
  note?: string | null;
}) {
  const rentCase = await prisma.rentCase.findFirst({
    where: { id: input.rentCaseId, userId: input.userId },
    include: { lines: { orderBy: { dueDate: "asc" } } }
  });
  if (!rentCase) return null;

  const updatedLines = applyPaymentToLines(rentCase.lines, input.amountCents);
  for (const line of updatedLines) {
    const original = rentCase.lines.find((item) => item.id === line.id);
    if (!original || original.paidAmountCents === line.paidAmountCents) continue;
    await prisma.unpaidRentLine.update({
      where: { id: line.id },
      data: {
        paidAmountCents: line.paidAmountCents,
        unpaidAmountCents: line.unpaidAmountCents,
        status: line.status
      }
    });
  }

  const payment = await prisma.payment.create({
    data: {
      rentCaseId: input.rentCaseId,
      amountCents: input.amountCents,
      paymentDate: input.paymentDate,
      note: input.note ?? null
    }
  });
  await prisma.caseEvent.create({
    data: {
      rentCaseId: input.rentCaseId,
      type: "PAYMENT_RECEIVED",
      title: "Paiement reçu",
      description: input.note ?? null,
      eventDate: input.paymentDate
    }
  });
  await recalculateCase(input.rentCaseId, input.userId);
  return payment;
}

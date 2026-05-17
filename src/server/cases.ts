import type { Prisma } from "@prisma/client";
import { calculateCaseSeverity, calculateUnpaidAmount, getNextRecommendedAction } from "@/domain/rent-cases";
import type { RentCaseLike } from "@/domain/rent-cases/types";
import { prisma } from "./db";

export const rentCaseInclude = {
  property: true,
  tenant: true,
  lines: { orderBy: { dueDate: "asc" } },
  events: { orderBy: { eventDate: "asc" } },
  documents: { orderBy: { createdAt: "desc" } },
  payments: { orderBy: { paymentDate: "desc" } }
} satisfies Prisma.RentCaseInclude;

export type FullRentCase = Prisma.RentCaseGetPayload<{ include: typeof rentCaseInclude }>;

export function toDomainCase(rentCase: FullRentCase): RentCaseLike {
  return {
    status: rentCase.status,
    firstMissedPaymentDate: rentCase.firstMissedPaymentDate,
    totalUnpaidCents: rentCase.totalUnpaidCents,
    lines: rentCase.lines,
    events: rentCase.events,
    hasGuarantor: rentCase.property.hasGuarantor || Boolean(rentCase.tenant.guarantorName),
    documents: rentCase.documents
  };
}

export async function recalculateCase(rentCaseId: string, userId?: string) {
  const rentCase = userId
    ? await prisma.rentCase.findFirstOrThrow({ where: { id: rentCaseId, userId }, include: rentCaseInclude })
    : await prisma.rentCase.findUniqueOrThrow({ where: { id: rentCaseId }, include: rentCaseInclude });
  const totalUnpaidCents = calculateUnpaidAmount(rentCase.lines);
  const domainCase = toDomainCase({ ...rentCase, totalUnpaidCents });
  const severity = calculateCaseSeverity(domainCase);
  const nextAction = getNextRecommendedAction(domainCase);
  return prisma.rentCase.update({
    where: { id: rentCaseId },
    data: {
      totalUnpaidCents,
      severity,
      nextActionLabel: nextAction.label,
      nextActionDate: nextAction.date
    },
    include: rentCaseInclude
  });
}

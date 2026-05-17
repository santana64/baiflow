import { NextResponse } from "next/server";
import { generateDocumentTemplate } from "@/domain/rent-cases/documents";
import { prisma } from "@/server/db";
import { rentCaseInclude } from "@/server/cases";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const since = new Date();
  since.setDate(since.getDate() - 1);

  const recentPayments = await prisma.payment.findMany({
    where: { createdAt: { gte: since } },
    include: { rentCase: { include: rentCaseInclude } },
    orderBy: { createdAt: "desc" }
  });

  let generated = 0;
  for (const payment of recentPayments) {
    const rentCase = payment.rentCase;
    const existing = await prisma.generatedDocument.findFirst({
      where: { rentCaseId: rentCase.id, type: "RENT_RECEIPT", createdAt: { gte: since } }
    });
    if (existing) continue;

    const landlord = await prisma.landlordProfile.findUnique({ where: { userId: rentCase.userId } });
    if (!landlord) continue;

    const doc = generateDocumentTemplate({
      type: "RENT_RECEIPT",
      landlord,
      tenant: rentCase.tenant,
      property: rentCase.property,
      rentCase,
      lines: rentCase.lines,
      events: rentCase.events,
      documents: rentCase.documents,
      currentDate: new Date()
    });

    await prisma.generatedDocument.create({
      data: { rentCaseId: rentCase.id, type: "RENT_RECEIPT", ...doc }
    });
    generated++;
  }

  return NextResponse.json({ generated });
}

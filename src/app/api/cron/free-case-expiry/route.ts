import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const threshold = new Date();
  threshold.setDate(threshold.getDate() - 30);

  const staleCases = await prisma.rentCase.findMany({
    where: {
      user: { plan: "FREE" },
      status: { notIn: ["RESOLVED", "CLOSED"] },
      updatedAt: { lt: threshold }
    },
    select: { id: true }
  });

  if (staleCases.length === 0) return NextResponse.json({ closed: 0 });

  const ids = staleCases.map((rentCase) => rentCase.id);
  await prisma.$transaction([
    prisma.rentCase.updateMany({ where: { id: { in: ids } }, data: { status: "CLOSED", nextActionLabel: "Dossier archivé - forfait Solo" } }),
    prisma.caseEvent.createMany({
      data: ids.map((rentCaseId) => ({
        rentCaseId,
        type: "NOTE",
        title: "Dossier archivé automatiquement",
        description: "Forfait Solo : dossier actif fermé après 30 jours sans action.",
        eventDate: new Date()
      }))
    })
  ]);

  return NextResponse.json({ closed: ids.length });
}

import { NextResponse } from "next/server";
import { getApiUser } from "@/server/api-auth";
import { prisma } from "@/server/db";
import { PLAN_DEFINITIONS } from "@/lib/plans";
import { getAccessibleUserIds } from "@/server/workspace";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getApiUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!PLAN_DEFINITIONS[user.plan].hasApiAccess) {
    return NextResponse.json({ error: "API access requires Gestionnaire or Agence" }, { status: 403 });
  }
  const accessibleUserIds = await getAccessibleUserIds(user.id);
  const cases = await prisma.rentCase.findMany({
    where: { userId: { in: accessibleUserIds } },
    include: {
      property: true,
      tenant: true,
      lines: true,
      events: { orderBy: { eventDate: "desc" }, take: 20 },
      documents: { select: { id: true, type: true, title: true, createdAt: true } }
    },
    orderBy: { updatedAt: "desc" },
    take: 100
  });
  return NextResponse.json({ data: cases });
}

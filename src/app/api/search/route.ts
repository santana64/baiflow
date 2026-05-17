import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { getAccessibleUserIds } from "@/server/workspace";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  const accessibleUserIds = await getAccessibleUserIds(user.id);
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) return NextResponse.json({ cases: [], tenants: [], properties: [] });

  const [cases, tenants, properties] = await Promise.all([
    prisma.rentCase.findMany({
      where: {
        userId: { in: accessibleUserIds },
        OR: [
          { tenant: { firstName: { contains: q, mode: "insensitive" } } },
          { tenant: { lastName: { contains: q, mode: "insensitive" } } },
          { property: { name: { contains: q, mode: "insensitive" } } }
        ]
      },
      include: { tenant: true, property: true },
      take: 5
    }),
    prisma.tenant.findMany({
      where: {
        userId: { in: accessibleUserIds },
        OR: [
          { firstName: { contains: q, mode: "insensitive" } },
          { lastName: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } }
        ]
      },
      take: 4
    }),
    prisma.property.findMany({
      where: {
        userId: { in: accessibleUserIds },
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { address: { contains: q, mode: "insensitive" } },
          { city: { contains: q, mode: "insensitive" } }
        ]
      },
      take: 4
    })
  ]);

  return NextResponse.json({ cases, tenants, properties });
}

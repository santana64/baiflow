import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth";
import { prisma } from "@/server/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  const data = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      name: true,
      plan: true,
      subscriptionStatus: true,
      createdAt: true,
      updatedAt: true,
      profile: true,
      properties: true,
      tenants: true,
      rentCases: {
        include: {
          property: true,
          tenant: true,
          lines: true,
          events: true,
          documents: true,
          payments: true
        }
      }
    }
  });
  return NextResponse.json(data, {
    headers: {
      "Content-Disposition": `attachment; filename="bailflow-export-${user.id}.json"`,
      "Cache-Control": "private, no-store"
    }
  });
}

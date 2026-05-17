import { createHash } from "node:crypto";
import { prisma } from "./db";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function getTenantPortalCase(rawToken: string) {
  const access = await prisma.tenantPortalAccess.findUnique({
    where: { tokenHash: hashToken(rawToken) },
    include: {
      rentCase: {
        include: {
          property: true,
          tenant: true,
          lines: { orderBy: { dueDate: "asc" } },
          payments: { orderBy: { paymentDate: "desc" } },
          documents: { where: { type: { in: ["REPAYMENT_PLAN", "AMICABLE_REMINDER_LETTER", "AMICABLE_REMINDER_EMAIL"] } }, orderBy: { createdAt: "desc" } }
        }
      }
    }
  });
  if (!access || access.revokedAt || access.expiresAt < new Date()) return null;
  await prisma.tenantPortalAccess.update({ where: { id: access.id }, data: { lastViewedAt: new Date() } });
  return access;
}

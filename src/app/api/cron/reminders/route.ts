import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { sendDocumentEmail } from "@/server/email";
import { formatMoney } from "@/domain/rent-cases";
import { userPlanIsActive, PLAN_DEFINITIONS } from "@/lib/plans";

export const dynamic = "force-dynamic";

const ACTIVE_STATUSES = ["AMICABLE", "FORMAL_NOTICE", "REPAYMENT_PLAN", "PROFESSIONAL_ESCALATION"];
const REMINDER_INTERVAL_DAYS = 7;

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const since = new Date();
  since.setDate(since.getDate() - REMINDER_INTERVAL_DAYS);

  const cases = await prisma.rentCase.findMany({
    where: {
      status: { in: ACTIVE_STATUSES as never[] },
      tenant: { email: { not: "" } },
      events: { none: { type: "EMAIL_SENT", eventDate: { gte: since } } }
    },
    include: {
      tenant: true,
      property: true,
      user: { include: { profile: true } }
    }
  });

  const results: { caseId: string; tenant: string; sent: boolean; error?: string }[] = [];

  for (const rentCase of cases) {
    const profile = rentCase.user.profile;
    if (!rentCase.user.emailVerifiedAt) continue;
    if (!userPlanIsActive(rentCase.user)) continue;
    if (!PLAN_DEFINITIONS[rentCase.user.plan].hasAutoReminders) continue;
    if (!profile?.fullName || !profile.email) continue;

    const tenantName = `${rentCase.tenant.firstName} ${rentCase.tenant.lastName}`;
    const propertyLine = `${rentCase.property.address}, ${rentCase.property.postalCode} ${rentCase.property.city}`;
    const total = formatMoney(rentCase.totalUnpaidCents);

    const body = `
<p>Bonjour ${tenantName},</p>
<p>Nous vous rappelons qu'un solde impayé de <strong>${total}</strong> est enregistré pour le logement situé ${propertyLine}.</p>
<p>Nous vous invitons à régulariser cette situation dans les plus brefs délais ou à nous contacter pour convenir d'un arrangement.</p>
<p>Cordialement,<br>${profile.fullName}</p>`;

    try {
      await sendDocumentEmail({
        to: rentCase.tenant.email,
        toName: tenantName,
        subject: `Rappel de loyer impayé — ${rentCase.property.name}`,
        documentTitle: "Rappel automatique de loyer impayé",
        contentHtml: body,
        landlordName: profile.fullName
      });

      await prisma.caseEvent.create({
        data: {
          rentCaseId: rentCase.id,
          type: "EMAIL_SENT",
          title: "Relance automatique envoyée par email",
          description: `Rappel automatique envoyé à ${rentCase.tenant.email}`,
          eventDate: new Date()
        }
      });

      results.push({ caseId: rentCase.id, tenant: tenantName, sent: true });
    } catch (error) {
      results.push({ caseId: rentCase.id, tenant: tenantName, sent: false, error: String(error) });
    }
  }

  return NextResponse.json({ processed: cases.length, results });
}

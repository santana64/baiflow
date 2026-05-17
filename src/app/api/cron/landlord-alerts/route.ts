import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { sendDocumentEmail } from "@/server/email";
import { formatMoney } from "@/domain/rent-cases";
import { userPlanIsActive, PLAN_DEFINITIONS } from "@/lib/plans";

export const dynamic = "force-dynamic";

const ACTIVE_STATUSES = ["AMICABLE", "FORMAL_NOTICE", "REPAYMENT_PLAN", "PROFESSIONAL_ESCALATION"];
const NO_ACTION_DAYS = 14;

const statusLabel: Record<string, string> = {
  AMICABLE: "Relance amiable",
  FORMAL_NOTICE: "Mise en demeure",
  REPAYMENT_PLAN: "Plan d'apurement",
  PROFESSIONAL_ESCALATION: "Escalade professionnelle"
};

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const staleThreshold = new Date();
  staleThreshold.setDate(staleThreshold.getDate() - NO_ACTION_DAYS);

  const users = await prisma.user.findMany({
    where: {
      rentCases: { some: { status: { in: ACTIVE_STATUSES as never[] } } }
    },
    include: {
      profile: true,
      rentCases: {
        where: { status: { in: ACTIVE_STATUSES as never[] } },
        include: {
          tenant: true,
          property: true,
          events: { orderBy: { eventDate: "desc" }, take: 1 }
        }
      }
    }
  });

  const results: { userId: string; email: string; sent: boolean; error?: string }[] = [];

  for (const user of users) {
    const profile = user.profile;
    if (!user.emailVerifiedAt) continue;
    if (!userPlanIsActive(user)) continue;
    if (!PLAN_DEFINITIONS[user.plan].hasAutoReminders) continue;
    if (!profile?.email || !profile.fullName) continue;

    const activeCases = user.rentCases;
    if (activeCases.length === 0) continue;

    const staleCases = activeCases.filter((c) => {
      const lastEvent = c.events[0];
      if (!lastEvent) return true;
      return lastEvent.eventDate < staleThreshold;
    });

    const totalUnpaid = activeCases.reduce((sum, c) => sum + c.totalUnpaidCents, 0);

    const caseRows = activeCases
      .map((c) => {
        const isStale = staleCases.some((s) => s.id === c.id);
        const staleFlag = isStale
          ? ` <span style="color:#e53e3e;font-weight:600;">⚠ Aucune action depuis +${NO_ACTION_DAYS}j</span>`
          : "";
        return `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e8e4db;">${c.tenant.firstName} ${c.tenant.lastName}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e8e4db;">${c.property.name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e8e4db;">${statusLabel[c.status] ?? c.status}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e8e4db;font-weight:600;color:#c53030;">${formatMoney(c.totalUnpaidCents)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e8e4db;">${staleFlag || "—"}</td>
        </tr>`;
      })
      .join("");

    const staleBlock =
      staleCases.length > 0
        ? `<p style="margin:0 0 16px;padding:12px 16px;background:#fff5f5;border-left:4px solid #e53e3e;border-radius:4px;color:#742a2a;font-size:14px;">
            <strong>⚠ ${staleCases.length} dossier${staleCases.length > 1 ? "s" : ""} sans action depuis plus de ${NO_ACTION_DAYS} jours.</strong>
            Pensez à enregistrer une action ou à générer un document pour chacun.
          </p>`
        : "";

    const body = `
<p>Bonjour ${profile.fullName},</p>
<p>Voici le récapitulatif hebdomadaire de vos dossiers d'impayés actifs sur BailFlow.</p>

${staleBlock}

<table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px;">
  <thead>
    <tr style="background:#f4f4f0;">
      <th style="padding:8px 12px;text-align:left;font-weight:600;color:#0a0a0a;">Locataire</th>
      <th style="padding:8px 12px;text-align:left;font-weight:600;color:#0a0a0a;">Bien</th>
      <th style="padding:8px 12px;text-align:left;font-weight:600;color:#0a0a0a;">Stade</th>
      <th style="padding:8px 12px;text-align:left;font-weight:600;color:#0a0a0a;">Impayé</th>
      <th style="padding:8px 12px;text-align:left;font-weight:600;color:#0a0a0a;">Alerte</th>
    </tr>
  </thead>
  <tbody>${caseRows}</tbody>
  <tfoot>
    <tr style="background:#f4f4f0;">
      <td colspan="3" style="padding:8px 12px;font-weight:600;color:#0a0a0a;">Total</td>
      <td colspan="2" style="padding:8px 12px;font-weight:700;color:#c53030;">${formatMoney(totalUnpaid)}</td>
    </tr>
  </tfoot>
</table>

<p>Connectez-vous à votre espace BailFlow pour gérer vos dossiers.</p>
<p>Cordialement,<br>L'équipe BailFlow</p>`;

    try {
      await sendDocumentEmail({
        to: profile.email,
        toName: profile.fullName,
        subject: `BailFlow — Récap hebdomadaire : ${activeCases.length} dossier${activeCases.length > 1 ? "s" : ""} actif${activeCases.length > 1 ? "s" : ""} (${formatMoney(totalUnpaid)})`,
        documentTitle: "Récapitulatif hebdomadaire",
        contentHtml: body,
        landlordName: profile.fullName
      });
      results.push({ userId: user.id, email: profile.email, sent: true });
    } catch (error) {
      results.push({ userId: user.id, email: profile.email, sent: false, error: String(error) });
    }
  }

  return NextResponse.json({ processed: users.length, results });
}

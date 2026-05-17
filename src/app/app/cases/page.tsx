import { CaseStatusBadge, EmptyState, LinkButton, PageHeader, SeverityBadge } from "@/components/ui";
import { computeOldestUnpaidMonth, formatMoney } from "@/domain/rent-cases";
import { getCurrentUser } from "@/server/auth";
import { rentCaseInclude } from "@/server/cases";
import { prisma } from "@/server/db";
import { getAccessibleUserIds } from "@/server/workspace";
import type { CaseStatus, Severity } from "@prisma/client";
import Link from "next/link";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  DRAFT: "Brouillon",
  AMICABLE: "Amiable",
  FORMAL_NOTICE: "Mise en demeure",
  REPAYMENT_PLAN: "Plan d'apurement",
  PROFESSIONAL_ESCALATION: "Escalade pro",
  RESOLVED: "Résolu",
  CLOSED: "Clos"
};

export default async function CasesPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string; severity?: string }>;
}) {
  const user = await getCurrentUser();
  const accessibleUserIds = await getAccessibleUserIds(user.id);
  const filters = await searchParams;
  const statuses: CaseStatus[] = [
    "DRAFT",
    "AMICABLE",
    "FORMAL_NOTICE",
    "REPAYMENT_PLAN",
    "PROFESSIONAL_ESCALATION",
    "RESOLVED",
    "CLOSED"
  ];
  const severities: Severity[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
  const status = statuses.includes(filters.status as CaseStatus)
    ? (filters.status as CaseStatus)
    : undefined;
  const severity = severities.includes(filters.severity as Severity)
    ? (filters.severity as Severity)
    : undefined;

  const cases = await prisma.rentCase.findMany({
    where: { userId: { in: accessibleUserIds }, status, severity },
    include: rentCaseInclude,
    orderBy: { updatedAt: "desc" }
  });

  if (!cases.length) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Dossiers d'impayés"
          subtitle="Gérez et suivez tous vos dossiers depuis cette page."
          action={<LinkButton href="/app/cases/new">Nouveau dossier</LinkButton>}
        />
        <EmptyState
          title="Aucun dossier"
          text="Créez votre premier dossier d'impayé depuis la page de création. Vous aurez besoin d'un bien et d'un locataire enregistrés."
          href="/app/cases/new"
          cta="Créer un dossier"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dossiers d'impayés"
        subtitle={`${cases.length} dossier${cases.length > 1 ? "s" : ""} ${status ? `· ${statusLabels[status] ?? status}` : ""}${severity ? ` · ${severity}` : ""}`}
        action={<LinkButton href="/app/cases/new">Nouveau dossier</LinkButton>}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/app/cases"
          className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
            !status && !severity
              ? "border-navy bg-navy text-white"
              : "border-line bg-white text-ink/60 hover:border-navy/30 hover:text-navy"
          }`}
        >
          Tous
        </Link>
        {statuses.slice(0, 5).map((s) => (
          <Link
            key={s}
            href={`/app/cases?status=${s}`}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              status === s
                ? "border-navy bg-navy text-white"
                : "border-line bg-white text-ink/60 hover:border-navy/30 hover:text-navy"
            }`}
          >
            {statusLabels[s]}
          </Link>
        ))}
      </div>

      <div className="space-y-4">
        {cases.map((rentCase) => (
          <Link
            key={rentCase.id}
            href={`/app/cases/${rentCase.id}`}
            className="block rounded-xl border border-line bg-white p-5 shadow-card transition-colors hover:bg-paper"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold text-navy">
                  {rentCase.tenant.firstName} {rentCase.tenant.lastName}
                </h2>
                <p className="mt-0.5 text-sm text-ink/55">
                  {rentCase.property.name}
                  {" · "}Plus ancien impayé :{" "}
                  {computeOldestUnpaidMonth(rentCase.lines)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <CaseStatusBadge status={rentCase.status} />
                <SeverityBadge severity={rentCase.severity} />
              </div>
            </div>
            <div className="mt-4 grid gap-4 border-t border-line pt-4 text-sm sm:grid-cols-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink/40">
                  Impayé
                </p>
                <p className="mt-1 font-bold tabular-nums text-navy">
                  {formatMoney(rentCase.totalUnpaidCents)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink/40">
                  Statut
                </p>
                <p className="mt-1 font-medium text-navy">
                  {statusLabels[rentCase.status] ?? rentCase.status}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink/40">
                  Action recommandée
                </p>
                <p className="mt-1 text-navy/80">{rentCase.nextActionLabel ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink/40">
                  Prochaine échéance
                </p>
                <p className="mt-1 text-navy/80">
                  {rentCase.nextActionDate?.toLocaleDateString("fr-FR") ?? "À vérifier"}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

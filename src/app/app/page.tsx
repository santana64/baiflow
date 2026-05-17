import { addDays, formatDistanceToNow, isBefore, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { AlertTriangle, FileText, FolderOpen, TrendingDown } from "lucide-react";
import { PaymentsChart, type MonthlyChartData } from "@/components/payments-chart";
import {
  CaseStatusBadge,
  LinkButton,
  OnboardingSteps,
  PageHeader,
  PriorityActionCard,
  SeverityBadge,
  StatCard
} from "@/components/ui";
import { formatMoney } from "@/domain/rent-cases";
import { getCurrentUser } from "@/server/auth";
import { rentCaseInclude } from "@/server/cases";
import { prisma } from "@/server/db";
import { getAccessibleUserIds } from "@/server/workspace";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const accessibleUserIds = await getAccessibleUserIds(user.id);

  const sixMonthsAgo = subMonths(new Date(), 5);

  const [cases, documents, propertiesCount, tenantsCount, recentPayments] = await Promise.all([
    prisma.rentCase.findMany({
      where: { userId: { in: accessibleUserIds } },
      include: rentCaseInclude,
      orderBy: { updatedAt: "desc" }
    }),
    prisma.generatedDocument.findMany({
      where: { rentCase: { userId: { in: accessibleUserIds } } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { rentCase: { include: { tenant: true } } }
    }),
    prisma.property.count({ where: { userId: { in: accessibleUserIds } } }),
    prisma.tenant.count({ where: { userId: { in: accessibleUserIds } } }),
    prisma.payment.findMany({
      where: { rentCase: { userId: { in: accessibleUserIds } }, paymentDate: { gte: startOfMonth(sixMonthsAgo) } },
      orderBy: { paymentDate: "asc" }
    })
  ]);

  const activeCases = cases.filter((c) => !["RESOLVED", "CLOSED"].includes(c.status));

  const chartData: MonthlyChartData[] = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(new Date(), 5 - i);
    const label = d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
    const start = startOfMonth(d);
    const end = endOfMonth(d);
    const encaissé = recentPayments
      .filter((p) => p.paymentDate >= start && p.paymentDate <= end)
      .reduce((s, p) => s + p.amountCents / 100, 0);
    const impayé = i === 5
      ? activeCases.reduce((s, c) => s + c.totalUnpaidCents / 100, 0)
      : 0;
    return { month: label, encaissé, impayé };
  });
  const totalUnpaid = activeCases.reduce((sum, c) => sum + c.totalUnpaidCents, 0);
  const dueSoon = activeCases.filter(
    (c) => c.nextActionDate && isBefore(c.nextActionDate, addDays(new Date(), 7))
  );
  const urgent = activeCases.filter(
    (c) =>
      c.events.length <= 1 ||
      dueSoon.includes(c) ||
      ["HIGH", "CRITICAL"].includes(c.severity)
  );
  const resolvedAmount = cases
    .flatMap((c) => c.payments)
    .reduce((sum, p) => sum + p.amountCents, 0);

  const activeCaseCount = activeCases.length;
  const totalCaseCount = cases.length;

  // ── Smart onboarding (no cases yet) ──────────────────────────────────────
  if (cases.length === 0) {
    const steps = [
      {
        n: 1,
        title: "Enregistrer un bien",
        description:
          "Adresse, loyer, charges, caution — les informations du logement seront utilisées dans vos courriers.",
        done: propertiesCount > 0,
        href: "/app/properties",
        cta: "Créer un bien"
      },
      {
        n: 2,
        title: "Ajouter le locataire",
        description:
          "Identité, coordonnées et caution. Le locataire sera lié au bien et apparaîtra dans les documents.",
        done: tenantsCount > 0,
        href: "/app/tenants",
        cta: "Créer un locataire"
      },
      {
        n: 3,
        title: "Ouvrir le dossier d'impayé",
        description:
          "Déclarez la première échéance manquante. La chronologie initiale est générée automatiquement.",
        done: false,
        href: propertiesCount > 0 && tenantsCount > 0 ? "/app/cases/new" : undefined,
        cta: "Créer un dossier"
      }
    ];

    return (
      <div className="space-y-6">
        <PageHeader
          title="Tableau de bord"
          subtitle={`Bienvenue${user.name ? `, ${user.name.split(" ")[0]}` : ""} — commencez par configurer votre espace.`}
        />
        <OnboardingSteps steps={steps} />
      </div>
    );
  }

  // ── Summary sentence ─────────────────────────────────────────────────────
  const summaryText =
    activeCaseCount === 0
      ? "Tous vos dossiers sont résolus ou clos. Bien joué."
      : `${activeCaseCount} dossier${activeCaseCount > 1 ? "s" : ""} actif${activeCaseCount > 1 ? "s" : ""}${urgent.length > 0 ? ` · ${urgent.length} nécessite${urgent.length > 1 ? "nt" : ""} une attention immédiate` : " · tout est à jour"}.`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title={`Tableau de bord${user.name ? ` · ${user.name.split(" ")[0]}` : ""}`}
        subtitle={summaryText}
        action={<LinkButton href="/app/cases/new">Créer un dossier</LinkButton>}
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Dossiers actifs"
          value={String(activeCaseCount)}
          hint={`${totalCaseCount} au total`}
          icon={<FolderOpen className="h-4 w-4 shrink-0 text-navy/40" />}
          accent="navy"
        />
        <StatCard
          label="Montant impayé"
          value={formatMoney(totalUnpaid)}
          hint="Dossiers actifs uniquement"
          icon={<TrendingDown className={`h-4 w-4 shrink-0 ${totalUnpaid > 0 ? "text-danger/60" : "text-sage/60"}`} />}
          accent={totalUnpaid > 0 ? "danger" : "sage"}
        />
        <StatCard
          label="Actions sous 7 jours"
          value={String(dueSoon.length)}
          hint={dueSoon.length > 0 ? "À traiter en priorité" : "Aucune urgence immédiate"}
          icon={<AlertTriangle className={`h-4 w-4 shrink-0 ${dueSoon.length > 0 ? "text-warning/60" : "text-sage/60"}`} />}
          accent={dueSoon.length > 0 ? "warning" : "sage"}
        />
        <StatCard
          label="Documents générés"
          value={String(documents.length)}
          hint="5 derniers affichés"
          icon={<FileText className="h-4 w-4 shrink-0 text-ink/25" />}
        />
        <StatCard
          label="Paiements reçus"
          value={formatMoney(resolvedAmount)}
          hint="Total encaissé"
          accent="sage"
        />
      </div>

      {/* Chart */}
      <section className="rounded-xl border border-line bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-navy">Encaissements vs impayés</h2>
            <p className="mt-0.5 text-xs text-ink/45">6 derniers mois</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-ink/50">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-sage inline-block" />Encaissé</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-danger inline-block" />Impayé</span>
          </div>
        </div>
        <PaymentsChart data={chartData} />
      </section>

      {/* Main layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Cases list */}
        <section className="rounded-xl border border-line bg-white p-6 shadow-card">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold text-navy">Dossiers actifs</h2>
              <p className="mt-0.5 text-sm text-ink/50">
                {activeCaseCount} dossier{activeCaseCount > 1 ? "s" : ""} en cours
              </p>
            </div>
            <LinkButton href="/app/cases" variant="secondary" size="sm">
              Tous les dossiers
            </LinkButton>
          </div>

          {activeCases.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line bg-paper py-10 text-center">
              <FolderOpen className="mx-auto h-8 w-8 text-sage/50" />
              <p className="mt-3 text-sm font-medium text-navy">Aucun dossier actif</p>
              <p className="mt-1 text-xs text-ink/45">
                Vos dossiers résolus et clos sont visibles ci-dessous.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeCases.map((rentCase) => (
                <a
                  key={rentCase.id}
                  href={`/app/cases/${rentCase.id}`}
                  className="flex items-center justify-between gap-4 rounded-xl border border-line p-4 transition-colors hover:bg-paper"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-navy">
                        {rentCase.tenant.firstName} {rentCase.tenant.lastName}
                      </p>
                      <SeverityBadge severity={rentCase.severity} />
                    </div>
                    <p className="mt-0.5 truncate text-sm text-ink/55">
                      {rentCase.property.name}
                      {rentCase.nextActionLabel ? ` · ${rentCase.nextActionLabel}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <p className="text-sm font-bold tabular-nums text-navy">
                      {formatMoney(rentCase.totalUnpaidCents)}
                    </p>
                    <CaseStatusBadge status={rentCase.status} />
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>

        {/* Right column */}
        <div className="space-y-6">
          {/* Priority actions */}
          <section className="rounded-xl border border-line bg-white p-6 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-navy">Actions prioritaires</h2>
              {urgent.length > 0 && (
                <span className="rounded-full bg-warning/15 px-2 py-0.5 text-xs font-bold text-warning">
                  {urgent.length}
                </span>
              )}
            </div>
            {urgent.length === 0 ? (
              <div className="rounded-lg border border-sage/20 bg-sage/5 px-4 py-3">
                <p className="text-sm font-medium text-sage">Aucune action urgente</p>
                <p className="mt-0.5 text-xs text-ink/50">Tous vos dossiers sont à jour.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {urgent.slice(0, 5).map((c) => (
                  <PriorityActionCard
                    key={c.id}
                    caseName={c.property.name}
                    tenantName={`${c.tenant.firstName} ${c.tenant.lastName}`}
                    reason={c.nextActionLabel ?? "Vérifier le dossier"}
                    dueLabel={
                      c.nextActionDate
                        ? `Échéance ${formatDistanceToNow(c.nextActionDate, {
                            addSuffix: true,
                            locale: fr
                          })}`
                        : undefined
                    }
                    href={`/app/cases/${c.id}`}
                    severity={c.severity}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Recent documents */}
          <section className="rounded-xl border border-line bg-white p-6 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-navy">Documents récents</h2>
              <LinkButton href="/app/documents" variant="secondary" size="sm">
                Tous
              </LinkButton>
            </div>
            {documents.length === 0 ? (
              <p className="text-sm text-ink/45">Aucun document généré pour le moment.</p>
            ) : (
              <div className="space-y-3">
                {documents.map((d) => (
                  <div key={d.id} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-paper">
                      <FileText className="h-3.5 w-3.5 text-ink/50" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-navy">{d.title}</p>
                      <p className="text-xs text-ink/45">
                        {d.rentCase.tenant.lastName} ·{" "}
                        {d.createdAt.toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short"
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Resolved / closed cases */}
      {cases.some((c) => ["RESOLVED", "CLOSED"].includes(c.status)) && (
        <section className="rounded-xl border border-line bg-white p-6 shadow-card">
          <h2 className="mb-4 font-semibold text-navy">Dossiers résolus et clos</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cases
              .filter((c) => ["RESOLVED", "CLOSED"].includes(c.status))
              .map((rentCase) => (
                <a
                  key={rentCase.id}
                  href={`/app/cases/${rentCase.id}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-line p-3 transition-colors hover:bg-paper"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-navy">
                      {rentCase.tenant.firstName} {rentCase.tenant.lastName}
                    </p>
                    <p className="truncate text-xs text-ink/50">{rentCase.property.name}</p>
                  </div>
                  <CaseStatusBadge status={rentCase.status} />
                </a>
              ))}
          </div>
        </section>
      )}
    </div>
  );
}

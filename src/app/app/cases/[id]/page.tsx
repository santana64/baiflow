import { notFound } from "next/navigation";
import {
  AlertTriangle,
  Calendar,
  CheckSquare,
  Euro,
  FileText,
  FolderOpen,
  Link as LinkIcon,
  Plus
} from "lucide-react";
import {
  ActionChecklist,
  Breadcrumbs,
  Card,
  CaseStatusBadge,
  DocumentPreview,
  LegalDisclaimerBox,
  LinkButton,
  SeverityBadge,
  StatCard,
  Timeline,
  WarningNotice
} from "@/components/ui";
import { computeOldestUnpaidMonth, formatMoney } from "@/domain/rent-cases";
import {
  addCaseEvent,
  addPayment,
  addUnpaidRentLine,
  changeCaseStatus,
  deleteCase,
  generateDocumentAction
} from "@/server/actions";
import { generateTenantPortalLink, markAddOnPaidForDev, startAddOnCheckout } from "@/server/growth-actions";
import { ConfirmDeleteForm } from "@/components/confirm-delete-form";
import { getCurrentUser } from "@/server/auth";
import { rentCaseInclude } from "@/server/cases";
import { prisma } from "@/server/db";
import { getAccessibleUserIds } from "@/server/workspace";

export const dynamic = "force-dynamic";

export default async function CaseDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tenantPortal?: string; addon?: string }>;
}) {
  const user = await getCurrentUser();
  const accessibleUserIds = await getAccessibleUserIds(user.id);
  const { id } = await params;
  const query = await searchParams;
  const rentCase = await prisma.rentCase.findFirst({
    where: { id, userId: { in: accessibleUserIds } },
    include: rentCaseInclude
  });
  if (!rentCase) notFound();

  const hasGuarantor =
    rentCase.property.hasGuarantor || Boolean(rentCase.tenant.guarantorName);

  const lineStatusLabel: Record<string, string> = {
    UNPAID: "Impayé",
    PARTIAL: "Partiel",
    PAID: "Payé"
  };
  const lineStatusClass: Record<string, string> = {
    UNPAID: "text-danger font-semibold",
    PARTIAL: "text-warning font-semibold",
    PAID: "text-sage"
  };

  return (
    <div className="space-y-6">
      {/* ── Breadcrumb ── */}
      <Breadcrumbs
        items={[
          { label: "Tableau de bord", href: "/app" },
          { label: "Dossiers", href: "/app/cases" },
          {
            label: `${rentCase.tenant.firstName} ${rentCase.tenant.lastName} · ${rentCase.property.name}`
          }
        ]}
      />

      {/* ── Case Header ── */}
      <div className="rounded-xl border border-line bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink/40">
              Dossier d'impayé
            </p>
            <h1 className="mt-1.5 text-2xl font-bold text-navy">
              {rentCase.tenant.firstName} {rentCase.tenant.lastName}
            </h1>
            <p className="mt-0.5 text-base text-ink/60">{rentCase.property.name}</p>
            {rentCase.nextActionLabel && (
              <p className="mt-2 text-sm font-medium text-ink/70">
                Action recommandée :{" "}
                <span className="text-navy">{rentCase.nextActionLabel}</span>
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <CaseStatusBadge status={rentCase.status} />
            <SeverityBadge severity={rentCase.severity} />
          </div>
        </div>

        {/* Summary stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total impayé"
            value={formatMoney(rentCase.totalUnpaidCents)}
            icon={<Euro className={`h-4 w-4 shrink-0 ${rentCase.totalUnpaidCents > 0 ? "text-danger/60" : "text-sage/60"}`} />}
            accent={rentCase.totalUnpaidCents > 0 ? "danger" : "sage"}
          />
          <StatCard
            label="Plus ancien mois"
            value={computeOldestUnpaidMonth(rentCase.lines)}
            icon={<Calendar className="h-4 w-4 shrink-0 text-ink/25" />}
          />
          <StatCard
            label="Prochaine échéance"
            value={
              rentCase.nextActionDate
                ? rentCase.nextActionDate.toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long"
                  })
                : "À vérifier"
            }
            icon={<Calendar className={`h-4 w-4 shrink-0 ${rentCase.nextActionDate ? "text-warning/60" : "text-ink/25"}`} />}
            accent={rentCase.nextActionDate ? "warning" : undefined}
          />
          <StatCard
            label="Documents"
            value={String(rentCase.documents.length)}
            icon={<FileText className="h-4 w-4 shrink-0 text-ink/25" />}
          />
        </div>
      </div>

      {/* ── 2-column main layout ── */}
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        {/* ── LEFT COLUMN ── */}
        <div className="space-y-6">
          {/* Plan d'action */}
          <Card>
            <div className="mb-5 flex items-center gap-2.5">
              <CheckSquare className="h-5 w-5 text-sage" />
              <h2 className="font-semibold text-navy">Plan d'action recommandé</h2>
            </div>
            <ActionChecklist hasGuarantor={hasGuarantor} />
            <WarningNotice>
              <p>
                <strong>À noter :</strong> certaines actions (mise en demeure, saisine
                d'un commissaire de justice) ont des effets juridiques importants. Faites
                vérifier vos documents par un professionnel avant envoi.
              </p>
            </WarningNotice>
          </Card>

          {/* Chronologie */}
          <Card>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <FolderOpen className="h-5 w-5 text-sage" />
                <h2 className="font-semibold text-navy">Chronologie du dossier</h2>
              </div>
            </div>
            <Timeline events={rentCase.events} />
          </Card>

          {/* Ajouter un événement */}
          <Card>
            <div className="mb-5 flex items-center gap-2.5">
              <Plus className="h-5 w-5 text-sage" />
              <h2 className="font-semibold text-navy">Documenter une action</h2>
            </div>
            <form action={addCaseEvent} className="grid gap-4 md:grid-cols-2">
              <input type="hidden" name="rentCaseId" value={rentCase.id} />
              <div>
                <label>Type d'action</label>
                <select name="type">
                  <option value="PHONE_CALL">Appel téléphonique</option>
                  <option value="EMAIL_SENT">Email envoyé</option>
                  <option value="SIMPLE_LETTER_SENT">Courrier simple</option>
                  <option value="REPAYMENT_PLAN_PROPOSED">Plan d'apurement proposé</option>
                  <option value="GUARANTOR_CONTACTED">Caution informée</option>
                  <option value="NOTE">Note interne</option>
                  <option value="CUSTOM">Autre événement</option>
                </select>
              </div>
              <div>
                <label>Date</label>
                <input name="eventDate" type="date" required />
              </div>
              <div className="md:col-span-2">
                <label>Titre de l'action</label>
                <input name="title" placeholder="Ex : Appel sans réponse" required />
              </div>
              <div className="md:col-span-2">
                <label>Description (facultatif)</label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Détails complémentaires…"
                />
              </div>
              <div>
                <button className="rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-80">
                  Documenter l'action
                </button>
              </div>
            </form>
          </Card>

          {/* Table financière */}
          <Card>
            <div className="mb-5 flex items-center gap-2.5">
              <Euro className="h-5 w-5 text-sage" />
              <h2 className="font-semibold text-navy">Détail des impayés</h2>
            </div>
            {rentCase.lines.length === 0 ? (
              <p className="text-sm text-ink/45">Aucune ligne enregistrée.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[700px]">
                  <thead>
                    <tr>
                      <th>Mois</th>
                      <th>Échéance</th>
                      <th>Loyer</th>
                      <th>Charges</th>
                      <th>Payé</th>
                      <th>Impayé</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rentCase.lines.map((line) => (
                      <tr key={line.id} className="hover:bg-paper/60">
                        <td className="font-medium">{line.periodLabel}</td>
                        <td className="text-ink/60">
                          {line.dueDate.toLocaleDateString("fr-FR")}
                        </td>
                        <td className="tabular-nums">{formatMoney(line.rentDueCents)}</td>
                        <td className="tabular-nums">
                          {formatMoney(line.chargesDueCents)}
                        </td>
                        <td className="tabular-nums text-sage">
                          {formatMoney(line.paidAmountCents)}
                        </td>
                        <td className="tabular-nums font-semibold text-danger">
                          {formatMoney(line.unpaidAmountCents)}
                        </td>
                        <td>
                          <span
                            className={lineStatusClass[line.status] ?? "text-ink/60"}
                          >
                            {lineStatusLabel[line.status] ?? line.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-line bg-paper/40">
                      <td colSpan={5} className="font-semibold text-navy">
                        Total impayé
                      </td>
                      <td className="font-bold tabular-nums text-danger">
                        {formatMoney(rentCase.totalUnpaidCents)}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </Card>

          {/* Ajouter une ligne */}
          <Card>
            <div className="mb-5 flex items-center gap-2.5">
              <Plus className="h-5 w-5 text-sage" />
              <h2 className="font-semibold text-navy">Ajouter une ligne impayée</h2>
            </div>
            <form
              action={addUnpaidRentLine}
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            >
              <input type="hidden" name="rentCaseId" value={rentCase.id} />
              <div>
                <label>Période</label>
                <input name="periodLabel" placeholder="Avril 2026" required />
              </div>
              <div>
                <label>Date d'échéance</label>
                <input name="dueDate" type="date" required />
              </div>
              <div>
                <label>Loyer dû (€)</label>
                <input
                  name="rentDue"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Ex : 850"
                  required
                />
              </div>
              <div>
                <label>Charges dues (€)</label>
                <input
                  name="chargesDue"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Ex : 80"
                  required
                />
              </div>
              <div>
                <label>Montant déjà payé (€)</label>
                <input
                  name="paidAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  required
                />
              </div>
              <div className="flex items-end">
                <button className="rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-80">
                  Ajouter la ligne
                </button>
              </div>
            </form>
          </Card>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="space-y-6">
          {query.tenantPortal && (
            <Card>
              <h2 className="mb-2 flex items-center gap-2 font-semibold text-navy">
                <LinkIcon className="h-4 w-4 text-sage" />
                Lien portail locataire créé
              </h2>
              <p className="text-sm text-ink/60">Lien valable 30 jours :</p>
              <code className="mt-2 block break-all rounded-lg bg-paper p-3 text-xs text-navy">
                {`${process.env.NEXT_PUBLIC_APP_URL ?? ""}/tenant/${query.tenantPortal}`}
              </code>
            </Card>
          )}

          {/* Documents */}
          <Card>
            <div className="mb-4 flex items-center gap-2.5">
              <FileText className="h-5 w-5 text-sage" />
              <h2 className="font-semibold text-navy">Générer un document</h2>
            </div>
            <LegalDisclaimerBox />
            <form action={generateDocumentAction} className="mt-4 space-y-3">
              <input type="hidden" name="rentCaseId" value={rentCase.id} />
              <div>
                <label>Type de document</label>
                <select name="type">
                  <option value="AMICABLE_REMINDER_EMAIL">Relance amiable (email)</option>
                  <option value="AMICABLE_REMINDER_LETTER">Relance amiable (courrier)</option>
                  <option value="FORMAL_NOTICE_DRAFT">
                    Brouillon mise en demeure ⚠
                  </option>
                  <option value="REPAYMENT_PLAN">Plan d'apurement</option>
                  <option value="GUARANTOR_INFORMATION_LETTER">Courrier à la caution</option>
                  <option value="CASE_SUMMARY">Synthèse du dossier</option>
                  <option value="PROFESSIONAL_ESCALATION_FILE">Dossier préparatoire pro</option>
                </select>
              </div>
              <div>
                <label>Note personnalisée (facultatif)</label>
                <textarea
                  name="customNote"
                  rows={2}
                  placeholder="Précisions à intégrer dans le document…"
                />
              </div>
              <button className="w-full rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-80">
                Générer et sauvegarder
              </button>
            </form>

            {/* Saved documents */}
            {rentCase.documents.length > 0 && (
              <div className="mt-5 border-t border-line pt-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink/40">
                  Documents sauvegardés
                </p>
                <div className="space-y-2">
                  {rentCase.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-line p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-navy">
                          {doc.title}
                        </p>
                        <p className="text-[11px] text-ink/40">
                          {doc.createdAt.toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <a
                        href={`/app/documents/${doc.id}/pdf`}
                        className="shrink-0 rounded-md border border-line px-2.5 py-1.5 text-xs font-semibold text-navy hover:bg-paper"
                      >
                        PDF
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Card>
            <div className="mb-4 flex items-center gap-2.5">
              <LinkIcon className="h-5 w-5 text-sage" />
              <h2 className="font-semibold text-navy">Portail locataire</h2>
            </div>
            <p className="mb-4 text-sm text-ink/55">
              Génère un lien sécurisé pour que le locataire consulte son solde, les lignes d'impayés et les documents partagés.
            </p>
            <form action={generateTenantPortalLink}>
              <input type="hidden" name="rentCaseId" value={rentCase.id} />
              <button className="w-full rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white">
                Créer un lien 30 jours
              </button>
            </form>
          </Card>

          <Card>
            <div className="mb-4 flex items-center gap-2.5">
              <Euro className="h-5 w-5 text-sage" />
              <h2 className="font-semibold text-navy">Add-ons dossier</h2>
            </div>
            <div className="space-y-2">
              {([
                ["REGISTERED_LETTER", "Recommandé électronique", "4,90€"],
                ["ELECTRONIC_SIGNATURE", "Signature électronique", "3,90€"],
                ["PROFESSIONAL_FILE", "Dossier huissier complet", "19,90€"],
                ["LEGAL_ARCHIVE_10Y", "Archivage 10 ans", "19,90€"]
              ] as const).map(([type, label, price]) => (
                <form key={type} action={process.env.NODE_ENV === "production" ? startAddOnCheckout : markAddOnPaidForDev} className="flex items-center justify-between gap-2 rounded-lg border border-line p-2">
                  <input type="hidden" name="rentCaseId" value={rentCase.id} />
                  <input type="hidden" name="type" value={type} />
                  <span className="text-xs font-semibold text-navy">{label}</span>
                  <button className="rounded-md bg-navy px-2.5 py-1.5 text-xs font-semibold text-white">{price}</button>
                </form>
              ))}
            </div>
          </Card>

          {/* Dossier préparatoire */}
          <Card>
            <div className="mb-4 flex items-center gap-2.5">
              <FolderOpen className="h-5 w-5 text-sage" />
              <h2 className="font-semibold text-navy">Dossier préparatoire</h2>
            </div>
            <p className="mb-4 text-sm text-ink/55">
              État de complétude pour un éventuel passage à un professionnel.
            </p>
            <ul className="space-y-2">
              {[
                {
                  label: "Profil bailleur",
                  ok: true
                },
                {
                  label: "Adresse du bien",
                  ok: Boolean(rentCase.property.address)
                },
                {
                  label: "Contact locataire",
                  ok: Boolean(rentCase.tenant.email || rentCase.tenant.phone)
                },
                {
                  label: "Lignes d'impayé",
                  ok: rentCase.lines.length > 0
                },
                {
                  label: "Chronologie",
                  ok: rentCase.events.length > 0
                },
                {
                  label: "Documents générés",
                  ok: rentCase.documents.length > 0
                }
              ].map(({ label, ok }) => (
                <li key={label} className="flex items-center gap-2.5 text-sm">
                  <span
                    className={`h-4 w-4 rounded-full text-center text-[10px] leading-4 font-bold ${ok ? "bg-sage/15 text-sage" : "bg-warning/15 text-warning"}`}
                  >
                    {ok ? "✓" : "!"}
                  </span>
                  <span className={ok ? "text-ink/70" : "font-medium text-ink"}>{label}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Paiement reçu */}
          <Card>
            <div className="mb-4 flex items-center gap-2.5">
              <Euro className="h-5 w-5 text-sage" />
              <h2 className="font-semibold text-navy">Enregistrer un paiement</h2>
            </div>
            <form action={addPayment} className="space-y-3">
              <input type="hidden" name="rentCaseId" value={rentCase.id} />
              <div>
                <label>Montant reçu (€)</label>
                <input
                  name="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Ex : 500"
                  required
                />
              </div>
              <div>
                <label>Date du paiement</label>
                <input name="paymentDate" type="date" required />
              </div>
              <div>
                <label>Note (facultatif)</label>
                <input name="note" placeholder="Ex : Virement reçu" />
              </div>
              <button className="w-full rounded-lg bg-sage px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90">
                Enregistrer le paiement
              </button>
            </form>
          </Card>

          {/* Statut */}
          <Card>
            <div className="mb-4 flex items-center gap-2.5">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <h2 className="font-semibold text-navy">Modifier le statut</h2>
            </div>
            <form action={changeCaseStatus} className="space-y-3">
              <input type="hidden" name="rentCaseId" value={rentCase.id} />
              <div>
                <label>Statut du dossier</label>
                <select name="status" defaultValue={rentCase.status}>
                  <option value="AMICABLE">Amiable</option>
                  <option value="FORMAL_NOTICE">Mise en demeure</option>
                  <option value="REPAYMENT_PLAN">Plan d'apurement</option>
                  <option value="PROFESSIONAL_ESCALATION">Escalade professionnelle</option>
                  <option value="RESOLVED">Résolu</option>
                  <option value="CLOSED">Clos</option>
                </select>
              </div>
              <button className="w-full rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-paper">
                Appliquer le statut
              </button>
            </form>
          </Card>

          {/* Delete case */}
          <div className="rounded-xl border border-danger/20 bg-danger/4 p-4">
            <p className="mb-3 text-xs font-semibold text-danger">Zone de suppression</p>
            <p className="mb-3 text-xs text-ink/55">
              Supprime définitivement le dossier, la chronologie, les documents générés et les paiements associés.
            </p>
            <ConfirmDeleteForm action={deleteCase} message="Supprimer définitivement ce dossier et toutes ses données associées ?">
              <input type="hidden" name="id" value={rentCase.id} />
              <button className="w-full rounded-lg border border-danger/30 bg-white px-4 py-2 text-sm font-semibold text-danger transition-colors hover:bg-danger/8">
                Supprimer ce dossier
              </button>
            </ConfirmDeleteForm>
          </div>

          {/* Back to cases */}
          <LinkButton href="/app/cases" variant="ghost" className="w-full justify-center text-ink/60">
            ← Tous les dossiers
          </LinkButton>
        </div>
      </div>

      {/* ── Last document preview ── */}
      {rentCase.documents[0] ? (
        <Card>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-navy">Dernier document généré</h2>
              <p className="mt-0.5 text-sm text-ink/50">{rentCase.documents[0].title}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href={`/app/documents/${rentCase.documents[0].id}/pdf`}
                className="rounded-lg border border-line px-3 py-2 text-sm font-semibold text-navy hover:bg-paper"
              >
                PDF
              </a>
              {rentCase.documents.length > 1 && (
                <a
                  href={`/api/cases/${rentCase.id}/export-zip`}
                  className="rounded-lg border border-navy/20 bg-navy/5 px-3 py-2 text-sm font-semibold text-navy hover:bg-navy/10"
                >
                  ZIP ({rentCase.documents.length} docs)
                </a>
              )}
              <LinkButton href="/app/documents" variant="secondary" size="sm">
                Tous les documents
              </LinkButton>
            </div>
          </div>
          <DocumentPreview html={rentCase.documents[0].contentHtml} />
        </Card>
      ) : null}
    </div>
  );
}

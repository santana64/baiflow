import { notFound } from "next/navigation";
import { CheckCircle2, CreditCard, FileText, Home } from "lucide-react";
import { formatMoney } from "@/domain/rent-cases";
import { getTenantPortalCase } from "@/server/tenant-portal";

export const dynamic = "force-dynamic";

export default async function TenantPortalPage({
  params,
  searchParams
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ payment?: string }>;
}) {
  const { token } = await params;
  const query = await searchParams;
  const access = await getTenantPortalCase(token);
  if (!access) notFound();
  const rentCase = access.rentCase;

  return (
    <main className="min-h-screen bg-paper px-4 py-8 text-ink">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-xl border border-line bg-white p-6 shadow-card">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink/40">Portail locataire securise</p>
              <h1 className="mt-1 text-2xl font-bold text-navy">{rentCase.property.name}</h1>
              <p className="mt-1 text-sm text-ink/60">
                {rentCase.property.address}, {rentCase.property.postalCode} {rentCase.property.city}
              </p>
            </div>
            <div className="rounded-lg bg-danger/8 px-4 py-3 text-right">
              <p className="text-xs font-semibold uppercase tracking-wider text-danger/60">Solde restant</p>
              <p className="text-2xl font-bold tabular-nums text-danger">{formatMoney(rentCase.totalUnpaidCents)}</p>
            </div>
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="rounded-xl border border-line bg-white p-6 shadow-card">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-navy">
              <CreditCard className="h-4 w-4 text-sage" />
              Detail du solde
            </h2>
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Periode</th>
                    <th>Echeance</th>
                    <th>Du</th>
                    <th>Paye</th>
                    <th>Restant</th>
                  </tr>
                </thead>
                <tbody>
                  {rentCase.lines.map((line) => (
                    <tr key={line.id}>
                      <td>{line.periodLabel}</td>
                      <td>{line.dueDate.toLocaleDateString("fr-FR")}</td>
                      <td>{formatMoney(line.rentDueCents + line.chargesDueCents)}</td>
                      <td className="text-sage">{formatMoney(line.paidAmountCents)}</td>
                      <td className="font-semibold text-danger">{formatMoney(line.unpaidAmountCents)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-ink/45">
              Ce portail affiche les informations communiquees par le bailleur. En cas de desaccord, contactez directement le bailleur et conservez une trace ecrite.
            </p>
          </div>

          <aside className="space-y-4">
            <div className="rounded-xl border border-line bg-white p-5 shadow-card">
              <h2 className="flex items-center gap-2 font-semibold text-navy">
                <Home className="h-4 w-4 text-sage" />
                Paiement
              </h2>
              {query.payment === "success" ? (
                <div className="mt-3 rounded-lg border border-sage/20 bg-sage/6 px-3 py-2 text-sm font-semibold text-sage">
                  Paiement recu. Le solde sera mis a jour automatiquement.
                </div>
              ) : null}
              {query.payment === "cancelled" ? (
                <div className="mt-3 rounded-lg border border-warning/25 bg-warning/8 px-3 py-2 text-sm font-semibold text-warning">
                  Paiement annule.
                </div>
              ) : null}
              <p className="mt-2 text-sm text-ink/60">
                Reglez le solde affiche par carte bancaire via Stripe. Un evenement de paiement est ajoute au dossier apres confirmation.
              </p>
              {rentCase.totalUnpaidCents > 0 ? (
                <form action={`/api/tenant/${encodeURIComponent(token)}/checkout`} method="post" className="mt-4 space-y-3">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-ink/45">Montant a regler (EUR)</label>
                    <input
                      name="amount"
                      type="number"
                      min="1"
                      max={(rentCase.totalUnpaidCents / 100).toFixed(2)}
                      step="0.01"
                      defaultValue={(rentCase.totalUnpaidCents / 100).toFixed(2)}
                    />
                  </div>
                  <button className="w-full rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">
                    Payer par carte
                  </button>
                </form>
              ) : (
                <button disabled className="mt-4 w-full rounded-lg bg-sage/10 px-4 py-2 text-sm font-semibold text-sage">
                  Solde regle
                </button>
              )}
            </div>

            <div className="rounded-xl border border-line bg-white p-5 shadow-card">
              <h2 className="flex items-center gap-2 font-semibold text-navy">
                <FileText className="h-4 w-4 text-sage" />
                Documents
              </h2>
              <div className="mt-3 space-y-2">
                {rentCase.documents.length ? rentCase.documents.map((doc) => (
                  <div key={doc.id} className="rounded-lg border border-line px-3 py-2 text-sm text-navy">
                    {doc.title}
                  </div>
                )) : (
                  <p className="text-sm text-ink/45">Aucun document partage.</p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-sage/20 bg-sage/6 p-5">
              <p className="flex items-start gap-2 text-sm text-ink/70">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sage" />
                Les consultations de ce portail sont horodatees pour conserver une trace claire.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

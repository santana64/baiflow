import { Building2, Calendar, CreditCard, Pencil } from "lucide-react";
import { Breadcrumbs, EmptyState, FormSection, LinkButton, PageHeader } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { FlashMessage } from "@/components/flash-message";
import { formatMoney } from "@/domain/rent-cases";
import { saveProperty } from "@/server/actions";
import { getCurrentUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { getAccessibleUserIds } from "@/server/workspace";

export const dynamic = "force-dynamic";

export default async function PropertiesPage({
  searchParams
}: {
  searchParams: Promise<{ edit?: string; flash?: string }>;
}) {
  const user = await getCurrentUser();
  const accessibleUserIds = await getAccessibleUserIds(user.id);
  const params = await searchParams;

  const [properties] = await Promise.all([
    prisma.property.findMany({ where: { userId: { in: accessibleUserIds } }, orderBy: { createdAt: "desc" } })
  ]);

  const editing = params.edit
    ? properties.find((p) => p.id === params.edit) ?? null
    : null;

  return (
    <div className="space-y-6">
      <FlashMessage flash={params.flash} />
      <Breadcrumbs items={[{ label: "Tableau de bord", href: "/app" }, { label: "Biens" }]} />

      <PageHeader
        title="Biens"
        subtitle="Enregistrez les informations utiles au bail et à la génération des courriers."
        action={
          properties.length > 0 ? (
            <LinkButton href="/app/tenants" variant="secondary">Créer un locataire</LinkButton>
          ) : undefined
        }
      />

      <FormSection
        title={editing ? `Modifier — ${editing.name}` : "Ajouter un bien"}
        subtitle="Ces informations seront intégrées dans les courriers générés."
      >
        <form action={saveProperty} className="contents">
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <div>
            <label>Nom du bien</label>
            <input name="name" required placeholder="Ex : Appartement Lyon 3ème" defaultValue={editing?.name ?? ""} />
          </div>
          <div>
            <label>Adresse complète</label>
            <input name="address" required placeholder="Ex : 12 rue de la Paix" defaultValue={editing?.address ?? ""} />
          </div>
          <div>
            <label>Ville</label>
            <input name="city" required placeholder="Ex : Lyon" defaultValue={editing?.city ?? ""} />
          </div>
          <div>
            <label>Code postal</label>
            <input name="postalCode" required placeholder="Ex : 69003" defaultValue={editing?.postalCode ?? ""} />
          </div>
          <div>
            <label>Loyer mensuel (€)</label>
            <input name="rentAmount" type="number" min="0" step="0.01" required placeholder="Ex : 850"
              defaultValue={editing ? (editing.rentAmountCents / 100).toFixed(2) : ""} />
          </div>
          <div>
            <label>Charges mensuelles (€)</label>
            <input name="chargesAmount" type="number" min="0" step="0.01" required placeholder="Ex : 80"
              defaultValue={editing ? (editing.chargesAmountCents / 100).toFixed(2) : ""} />
          </div>
          <div>
            <label>Jour d'échéance du loyer</label>
            <input name="paymentDayOfMonth" type="number" min="1" max="31" required placeholder="Ex : 5"
              defaultValue={editing?.paymentDayOfMonth ?? ""} />
          </div>
          <div>
            <label>Date de début du bail</label>
            <input name="leaseStartDate" type="date" required
              defaultValue={editing ? editing.leaseStartDate.toISOString().split("T")[0] : ""} />
          </div>
          <label className="flex cursor-pointer items-center gap-2.5 md:col-span-2">
            <input name="hasGuarantor" type="checkbox" className="h-4 w-4 accent-sage"
              defaultChecked={editing?.hasGuarantor ?? false} />
            <span className="text-sm font-medium text-ink/80">Une caution (garant) est prévue au dossier</span>
          </label>
          <div className="md:col-span-2">
            <label>Notes internes (facultatif)</label>
            <textarea name="notes" rows={3} placeholder="Remarques sur le bien, le bail, etc."
              defaultValue={editing?.notes ?? ""} />
          </div>
          <div className="flex items-center gap-3">
            <SubmitButton className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink disabled:opacity-60">
              {editing ? "Mettre à jour" : "Créer le bien"}
            </SubmitButton>
            {editing && (
              <a href="/app/properties" className="text-sm text-ink/50 hover:text-ink transition-colors">
                Annuler
              </a>
            )}
          </div>
        </form>
      </FormSection>

      {properties.length === 0 ? (
        <EmptyState
          title="Aucun bien enregistré"
          text="Enregistrez votre premier bien pour commencer à créer des dossiers d'impayé."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {properties.map((property) => (
            <section key={property.id} className="rounded-xl border border-line bg-white p-5 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-paper">
                      <Building2 className="h-4 w-4 text-navy/60" />
                    </div>
                    <h2 className="font-semibold text-navy">{property.name}</h2>
                  </div>
                  <p className="mt-2 text-sm text-ink/55">
                    {property.address}, {property.postalCode} {property.city}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {property.hasGuarantor && (
                    <span className="rounded-full bg-sage/10 px-2.5 py-1 text-xs font-semibold text-sage">Caution</span>
                  )}
                  <a
                    href={`/app/properties?edit=${property.id}`}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-line text-ink/40 transition-colors hover:border-navy/30 hover:text-navy"
                    title="Modifier"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-line pt-4">
                <div className="flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5 text-ink/35" />
                  <div>
                    <p className="text-[11px] text-ink/40">Loyer</p>
                    <p className="text-sm font-semibold tabular-nums text-navy">{formatMoney(property.rentAmountCents)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5 text-ink/35" />
                  <div>
                    <p className="text-[11px] text-ink/40">Charges</p>
                    <p className="text-sm font-semibold tabular-nums text-navy">{formatMoney(property.chargesAmountCents)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-ink/35" />
                  <div>
                    <p className="text-[11px] text-ink/40">Échéance</p>
                    <p className="text-sm font-semibold text-navy">Jour {property.paymentDayOfMonth}</p>
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

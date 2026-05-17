import { Mail, Pencil, Phone, ShieldCheck, User } from "lucide-react";
import { Breadcrumbs, EmptyState, FormSection, LinkButton, PageHeader } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { saveTenant } from "@/server/actions";
import { FlashMessage } from "@/components/flash-message";
import { getCurrentUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { getAccessibleUserIds } from "@/server/workspace";

export const dynamic = "force-dynamic";

export default async function TenantsPage({
  searchParams
}: {
  searchParams: Promise<{ edit?: string; flash?: string }>;
}) {
  const user = await getCurrentUser();
  const accessibleUserIds = await getAccessibleUserIds(user.id);
  const params = await searchParams;

  const [tenants, properties] = await Promise.all([
    prisma.tenant.findMany({ where: { userId: { in: accessibleUserIds } }, include: { property: true }, orderBy: { createdAt: "desc" } }),
    prisma.property.findMany({ where: { userId: { in: accessibleUserIds } }, orderBy: { name: "asc" } })
  ]);

  const editing = params.edit
    ? tenants.find((t) => t.id === params.edit) ?? null
    : null;

  return (
    <div className="space-y-6">
      <FlashMessage flash={params.flash} />
      <Breadcrumbs items={[{ label: "Tableau de bord", href: "/app" }, { label: "Locataires" }]} />

      <PageHeader
        title="Locataires"
        subtitle="Associez chaque locataire à un bien et renseignez la caution si elle existe."
        action={
          properties.length > 0 && tenants.length > 0 ? (
            <LinkButton href="/app/cases/new">Créer un dossier</LinkButton>
          ) : undefined
        }
      />

      {properties.length === 0 ? (
        <EmptyState
          title="Commencez par créer un bien"
          text="Un locataire doit être associé à un bien. Créez d'abord le logement concerné."
          href="/app/properties"
          cta="Créer un bien"
        />
      ) : (
        <>
          <FormSection
            title={editing ? `Modifier — ${editing.firstName} ${editing.lastName}` : "Ajouter un locataire"}
            subtitle="Ces informations apparaîtront dans les courriers générés."
          >
            <form action={saveTenant} className="contents">
              {editing && <input type="hidden" name="id" value={editing.id} />}
              <div>
                <label>Prénom</label>
                <input name="firstName" required placeholder="Ex : Jean" defaultValue={editing?.firstName ?? ""} />
              </div>
              <div>
                <label>Nom</label>
                <input name="lastName" required placeholder="Ex : Dupont" defaultValue={editing?.lastName ?? ""} />
              </div>
              <div>
                <label>Email</label>
                <input name="email" type="email" placeholder="jean.dupont@email.fr" defaultValue={editing?.email ?? ""} />
              </div>
              <div>
                <label>Téléphone</label>
                <input name="phone" required placeholder="Ex : 06 12 34 56 78" defaultValue={editing?.phone ?? ""} />
              </div>
              <div className="md:col-span-2">
                <label>Adresse postale du locataire</label>
                <input name="address" required placeholder="Adresse actuelle (si différente du bien)"
                  defaultValue={editing?.address ?? ""} />
              </div>
              <div>
                <label>Bien lié</label>
                <select name="propertyId" defaultValue={editing?.propertyId ?? ""}>
                  <option value="">Non associé à un bien</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Nom de la caution (facultatif)</label>
                <input name="guarantorName" placeholder="Ex : Marie Dupont" defaultValue={editing?.guarantorName ?? ""} />
              </div>
              <div>
                <label>Email de la caution</label>
                <input name="guarantorEmail" type="email" placeholder="marie.dupont@email.fr"
                  defaultValue={editing?.guarantorEmail ?? ""} />
              </div>
              <div>
                <label>Téléphone de la caution</label>
                <input name="guarantorPhone" placeholder="Ex : 06 98 76 54 32" defaultValue={editing?.guarantorPhone ?? ""} />
              </div>
              <div className="md:col-span-2">
                <label>Notes internes (facultatif)</label>
                <textarea name="notes" rows={3} placeholder="Remarques sur le locataire, le bail, la situation…"
                  defaultValue={editing?.notes ?? ""} />
              </div>
              <div className="flex items-center gap-3">
                <SubmitButton className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink disabled:opacity-60">
                  {editing ? "Mettre à jour" : "Créer le locataire"}
                </SubmitButton>
                {editing && (
                  <a href="/app/tenants" className="text-sm text-ink/50 hover:text-ink transition-colors">
                    Annuler
                  </a>
                )}
              </div>
            </form>
          </FormSection>

          {tenants.length === 0 ? (
            <EmptyState
              title="Aucun locataire enregistré"
              text="Ajoutez votre premier locataire pour pouvoir créer un dossier d'impayé."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {tenants.map((tenant) => (
                <section key={tenant.id} className="rounded-xl border border-line bg-white p-5 shadow-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-paper">
                        <User className="h-5 w-5 text-navy/50" />
                      </div>
                      <div>
                        <h2 className="font-semibold text-navy">{tenant.firstName} {tenant.lastName}</h2>
                        {tenant.property && (
                          <p className="mt-0.5 text-xs text-ink/50">{tenant.property.name}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {tenant.guarantorName && (
                        <span className="rounded-full bg-sage/10 px-2.5 py-1 text-xs font-semibold text-sage">Caution</span>
                      )}
                      <a
                        href={`/app/tenants?edit=${tenant.id}`}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-line text-ink/40 transition-colors hover:border-navy/30 hover:text-navy"
                        title="Modifier"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 border-t border-line pt-4">
                    {tenant.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3.5 w-3.5 shrink-0 text-ink/35" />
                        <span className="text-ink/65">{tenant.email}</span>
                      </div>
                    )}
                    {tenant.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3.5 w-3.5 shrink-0 text-ink/35" />
                        <span className="text-ink/65">{tenant.phone}</span>
                      </div>
                    )}
                    {tenant.guarantorName && (
                      <div className="flex items-center gap-2 text-sm">
                        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-sage/70" />
                        <span className="font-medium text-sage">Caution : {tenant.guarantorName}</span>
                      </div>
                    )}
                  </div>
                </section>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

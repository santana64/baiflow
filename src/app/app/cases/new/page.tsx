import { AlertTriangle } from "lucide-react";
import { EmptyState, LegalDisclaimerBox, LinkButton, PageHeader } from "@/components/ui";
import { createRentCase } from "@/server/actions";
import { getCurrentUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { getAccessibleUserIds } from "@/server/workspace";

export const dynamic = "force-dynamic";

export default async function NewCasePage() {
  const user = await getCurrentUser();
  const accessibleUserIds = await getAccessibleUserIds(user.id);
  const [properties, tenants] = await Promise.all([
    prisma.property.findMany({ where: { userId: { in: accessibleUserIds } }, orderBy: { name: "asc" } }),
    prisma.tenant.findMany({ where: { userId: { in: accessibleUserIds } }, orderBy: { lastName: "asc" } })
  ]);

  if (properties.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Créer un dossier d'impayé"
          subtitle="Commencez par enregistrer le bien concerné."
        />
        <EmptyState
          title="Créez d'abord un bien"
          text="Un dossier d'impayé doit être lié à un logement. Ajoutez le bien concerné avant de créer le dossier."
          href="/app/properties"
          cta="Créer un bien"
        />
      </div>
    );
  }

  if (tenants.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Créer un dossier d'impayé"
          subtitle="Commencez par enregistrer le locataire concerné."
        />
        <EmptyState
          title="Créez d'abord un locataire"
          text="Un dossier d'impayé doit être lié à un locataire. Ajoutez le locataire concerné avant de créer le dossier."
          href="/app/tenants"
          cta="Créer un locataire"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Créer un dossier d'impayé"
        subtitle="Renseignez la première échéance impayée. Vous pourrez ajouter d'autres lignes ensuite."
      />

      {/* Quick nav */}
      <div className="flex flex-wrap gap-2">
        <LinkButton href="/app/properties" variant="secondary" size="sm">
          Gérer les biens
        </LinkButton>
        <LinkButton href="/app/tenants" variant="secondary" size="sm">
          Gérer les locataires
        </LinkButton>
      </div>

      <LegalDisclaimerBox />

      <form
        action={createRentCase}
        className="rounded-xl border border-line bg-white p-6 shadow-card"
      >
        {/* Section: Dossier */}
        <div className="mb-6 border-b border-line pb-4">
          <h2 className="font-semibold text-navy">Informations du dossier</h2>
          <p className="mt-1 text-sm text-ink/55">Liez le dossier à un bien et un locataire.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label>Bien concerné</label>
            <select name="propertyId" required>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Locataire concerné</label>
            <select name="tenantId" required>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.firstName} {t.lastName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Date du premier loyer manquant</label>
            <input name="firstMissedPaymentDate" type="date" required />
          </div>
        </div>

        {/* Section: Première ligne */}
        <div className="mb-6 mt-8 border-b border-line pb-4">
          <h2 className="font-semibold text-navy">Première échéance impayée</h2>
          <p className="mt-1 text-sm text-ink/55">
            Vous pourrez ajouter d'autres mois depuis la page du dossier.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label>Période</label>
            <input name="periodLabel" placeholder="Ex : Mars 2026" required />
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
              required
              placeholder="Ex : 850"
            />
          </div>
          <div>
            <label>Charges dues (€)</label>
            <input
              name="chargesDue"
              type="number"
              min="0"
              step="0.01"
              required
              placeholder="Ex : 80"
            />
          </div>
          <div className="md:col-span-2">
            <label>Montant déjà payé (€)</label>
            <input
              name="paidAmount"
              type="number"
              min="0"
              step="0.01"
              defaultValue="0"
              required
            />
          </div>
        </div>

        {/* Section: Contexte */}
        <div className="mb-6 mt-8 border-b border-line pb-4">
          <h2 className="font-semibold text-navy">Contexte</h2>
        </div>
        <div className="space-y-3">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              name="contactAlreadyMade"
              type="checkbox"
              className="mt-0.5 h-4 w-4 accent-sage"
            />
            <span className="text-sm font-medium text-ink/80">
              Un premier contact avec le locataire a déjà été réalisé
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-warning/25 bg-warning/5 p-4">
            <input
              name="legalDisclaimerAcknowledged"
              type="checkbox"
              required
              className="mt-0.5 h-4 w-4 accent-sage"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span className="text-sm font-semibold text-ink">
                  Limite administrative de BailFlow
                </span>
              </div>
              <p className="mt-1 text-sm text-ink/65">
                Je comprends que BailFlow est un outil d'aide à la documentation et ne
                remplace pas les conseils d'un professionnel du droit.
              </p>
            </div>
          </label>
        </div>

        <div className="mt-8 flex items-center justify-between gap-4 border-t border-line pt-6">
          <LinkButton href="/app" variant="ghost" className="text-ink/55">
            ← Retour au tableau de bord
          </LinkButton>
          <button className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80">
            Ouvrir le dossier et générer la timeline
          </button>
        </div>
      </form>
    </div>
  );
}

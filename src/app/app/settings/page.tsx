import { FileText, MessageSquare, Shield, User } from "lucide-react";
import { Breadcrumbs, LegalDisclaimerBox, PageHeader } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { FlashMessage } from "@/components/flash-message";
import { saveSettings } from "@/server/actions";
import { getCurrentUser } from "@/server/auth";
import { prisma } from "@/server/db";

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  searchParams
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const user = await getCurrentUser();
  const params = await searchParams;
  const profile = await prisma.landlordProfile.findUnique({ where: { userId: user.id } });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Breadcrumbs items={[{ label: "Tableau de bord", href: "/app" }, { label: "Réglages" }]} />

      <PageHeader
        title="Réglages"
        subtitle="Ces informations sont utilisées dans vos courriers et documents générés."
      />

      <FlashMessage flash={params.saved} />

      <LegalDisclaimerBox />

      <form action={saveSettings} className="space-y-0">
        {/* ── Section 1 : Identité bailleur ── */}
        <div className="rounded-t-xl border border-b-0 border-line bg-white px-6 py-5">
          <div className="mb-5 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-paper">
              <User className="h-4 w-4 text-navy" />
            </div>
            <div>
              <h2 className="font-semibold text-navy">Identité bailleur</h2>
              <p className="text-xs text-ink/50">Apparaît dans l'en-tête de vos courriers et documents</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label>Nom complet (bailleur)</label>
              <input name="fullName" defaultValue={profile?.fullName ?? ""} required placeholder="Ex : Jean-Pierre Dupont" />
            </div>
            <div>
              <label>Signature par défaut</label>
              <input name="defaultSignature" defaultValue={profile?.defaultSignature ?? ""} required
                placeholder="Ex : J.-P. Dupont, propriétaire bailleur" />
            </div>
            <div className="md:col-span-2">
              <label>Adresse postale du bailleur</label>
              <input name="address" defaultValue={profile?.address ?? ""} required
                placeholder="Ex : 5 allée des Pins, 69003 Lyon" />
            </div>
          </div>
        </div>

        {/* ── Section 2 : Coordonnées ── */}
        <div className="border border-b-0 border-line bg-white px-6 py-5">
          <div className="mb-5 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-paper">
              <Shield className="h-4 w-4 text-navy" />
            </div>
            <div>
              <h2 className="font-semibold text-navy">Coordonnées</h2>
              <p className="text-xs text-ink/50">Utilisées pour les en-têtes et pied de courrier</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label>Email de contact</label>
              <input name="email" type="email" defaultValue={profile?.email ?? ""} required placeholder="vous@exemple.fr" />
            </div>
            <div>
              <label>Téléphone</label>
              <input name="phone" defaultValue={profile?.phone ?? ""} required placeholder="Ex : 06 12 34 56 78" />
            </div>
          </div>
        </div>

        {/* ── Section 3 : Préférences documents ── */}
        <div className="rounded-b-xl border border-line bg-white px-6 py-5">
          <div className="mb-5 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-paper">
              <FileText className="h-4 w-4 text-navy" />
            </div>
            <div>
              <h2 className="font-semibold text-navy">Préférences de documents</h2>
              <p className="text-xs text-ink/50">Paramètres appliqués à la génération des courriers</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label>Ton par défaut des courriers</label>
              <select name="defaultTone" defaultValue="calm">
                <option value="calm">Calme et factuel</option>
                <option value="formal">Plus formel</option>
              </select>
              <p className="mt-1 text-xs text-ink/45">Le ton formel convient mieux aux mises en demeure et escalades.</p>
            </div>
            <div className="flex flex-col justify-center">
              <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" name="includeDisclaimer" defaultChecked className="mt-0.5 h-4 w-4 accent-sage" />
                <div>
                  <span className="font-medium text-ink/80">Inclure le disclaimer légal dans les documents sensibles</span>
                  <p className="mt-0.5 text-xs text-ink/45">Recommandé — apparaît en pied de mise en demeure et dossier pro</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* ── Submit ── */}
        <div className="flex items-center justify-between gap-4 pt-5">
          <p className="flex items-center gap-1.5 text-xs text-ink/40">
            <MessageSquare className="h-3.5 w-3.5" />
            Ces informations apparaîtront dans vos futurs documents générés.
          </p>
          <SubmitButton
            loadingText="Enregistrement…"
            className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink disabled:opacity-60"
          >
            Enregistrer les réglages
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}

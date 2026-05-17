import Link from "next/link";
import { CheckCircle2, FileText, Home, MailCheck, Shield, UserRound } from "lucide-react";
import { Card, LegalDisclaimerBox, PageHeader } from "@/components/ui";
import { resendVerificationEmail } from "@/server/account-actions";
import { getCurrentUser } from "@/server/auth";
import { getBillingOverview } from "@/server/entitlements";
import { completeOnboarding, getOnboardingState } from "@/server/onboarding";

export const dynamic = "force-dynamic";

export default async function OnboardingPage({
  searchParams
}: {
  searchParams: Promise<{ registered?: string }>;
}) {
  const user = await getCurrentUser();
  const state = await getOnboardingState(user.id);
  const billing = await getBillingOverview(user);
  const query = await searchParams;

  if (state.completed) {
    return (
      <div className="space-y-6">
        <PageHeader title="Vous êtes prêt à agir" subtitle="Votre profil, votre bien, votre locataire et votre premier dossier sont configurés." />
        <Card>
          <div className="flex items-start gap-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sage/10">
              <CheckCircle2 className="h-6 w-6 text-sage" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-ink">Dossier actif — prochaine étape</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-cinder">
                Votre première relance amiable a été générée. Vérifiez-la dans vos documents, adaptez-la si besoin, puis documentez chaque action dans la chronologie.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/app" className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-80">
                  Tableau de bord
                </Link>
                <Link href="/app/cases" className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-powder">
                  Voir mon dossier
                </Link>
                <Link href="/app/documents" className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-powder">
                  Documents générés
                </Link>
              </div>
            </div>
          </div>
        </Card>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { href: "/app/cases", icon: "📁", title: "Gérer le dossier", desc: "Ajoutez des événements, enregistrez les paiements partiels, suivez l'évolution." },
            { href: "/app/documents", icon: "📄", title: "Générer des courriers", desc: "Plan d'apurement, mise en demeure, lettre à la caution — au bon stade." },
            { href: "/app/account", icon: "⚙️", title: "Profil bailleur", desc: "Vérifiez vos coordonnées qui alimentent tous les documents générés." }
          ].map((item) => (
            <Link key={item.href} href={item.href} className="group rounded-2xl border border-line bg-white p-5 shadow-card transition-shadow hover:shadow-soft">
              <div className="text-2xl mb-3">{item.icon}</div>
              <p className="font-semibold text-ink">{item.title}</p>
              <p className="mt-1 text-sm text-cinder">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  if (!state.emailVerified) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Activez votre essai BailFlow"
          subtitle="Votre essai Bailleur de 14 jours est prêt. Confirmez votre email pour créer votre premier dossier."
        />
        {query.registered && (
          <div className="rounded-xl border border-sage/20 bg-sage/8 p-4 text-sm text-sage">
            Compte créé. En local, le lien de confirmation est affiché dans la console du serveur sous `[BailFlow email dev]`.
          </div>
        )}
        <Card>
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/12">
              <MailCheck className="h-5 w-5 text-warning" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-navy">Email à confirmer</h2>
              <p className="mt-1 text-sm leading-relaxed text-ink/60">
                Cette étape évite les comptes fantômes et débloque la création de biens, dossiers et documents.
              </p>
              <form action={resendVerificationEmail} className="mt-4">
                <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-80">
                  Renvoyer l'email de confirmation
                </button>
              </form>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Créez votre premier dossier"
        subtitle={`Essai Bailleur actif${billing.trialDaysRemaining ? ` encore ${billing.trialDaysRemaining} jour${billing.trialDaysRemaining > 1 ? "s" : ""}` : ""}. Objectif: générer un premier courrier exploitable en moins de 20 minutes.`}
      />

      <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
        <div className="mb-3 flex items-center justify-between gap-4">
          <p className="text-sm font-semibold text-ink">Configuration du premier dossier</p>
          <span className="rounded-full bg-sage/10 px-2.5 py-0.5 text-xs font-semibold text-sage">
            {state.completedCount}/{state.total}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-powder">
          <div className="h-full rounded-full bg-sage transition-all duration-500" style={{ width: `${state.progress}%` }} />
        </div>
        <div className="mt-4 grid gap-2 md:grid-cols-5">
          {state.steps.map((step) => (
            <div key={step.id} className="flex items-center gap-2">
              <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${step.done ? "bg-sage" : "border border-line bg-white"}`}>
                {step.done && <CheckCircle2 className="h-2.5 w-2.5 text-white" />}
              </div>
              <span className={`text-xs ${step.done ? "font-medium text-ink" : "text-stone"}`}>{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      <form action={completeOnboarding} className="space-y-6">
        <Card>
          <div className="mb-5 flex items-center gap-3 border-b border-line pb-4">
            <Shield className="h-5 w-5 text-sage" />
            <div>
              <h2 className="font-semibold text-navy">1. Profil bailleur</h2>
              <p className="text-sm text-ink/55">Ces informations alimentent les courriers.</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nom complet"><input name="fullName" defaultValue={user.name} required /></Field>
            <Field label="Email bailleur"><input name="profileEmail" type="email" defaultValue={user.email} required /></Field>
            <Field label="Téléphone"><input name="phone" required /></Field>
            <Field label="Signature par défaut"><input name="defaultSignature" defaultValue={user.name} required /></Field>
            <Field label="Adresse postale" className="md:col-span-2"><textarea name="landlordAddress" required /></Field>
          </div>
        </Card>

        <Card>
          <div className="mb-5 flex items-center gap-3 border-b border-line pb-4">
            <Home className="h-5 w-5 text-sage" />
            <div>
              <h2 className="font-semibold text-navy">2. Première propriété</h2>
              <p className="text-sm text-ink/55">Renseignez le logement concerné par le retard.</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nom du bien"><input name="propertyName" placeholder="Appartement Lyon 3" required /></Field>
            <Field label="Adresse"><input name="propertyAddress" required /></Field>
            <Field label="Ville"><input name="propertyCity" required /></Field>
            <Field label="Code postal"><input name="propertyPostalCode" required /></Field>
            <Field label="Loyer hors charges"><input name="rentAmount" inputMode="decimal" placeholder="850" required /></Field>
            <Field label="Charges"><input name="chargesAmount" inputMode="decimal" placeholder="80" required /></Field>
            <Field label="Jour de paiement"><input name="paymentDayOfMonth" type="number" min={1} max={31} defaultValue={5} required /></Field>
            <Field label="Début du bail"><input name="leaseStartDate" type="date" required /></Field>
            <label className="flex items-center gap-2 text-sm font-medium text-navy">
              <input name="hasGuarantor" type="checkbox" className="h-4 w-4 accent-sage" />
              Caution / garant prévu au bail
            </label>
          </div>
        </Card>

        <Card>
          <div className="mb-5 flex items-center gap-3 border-b border-line pb-4">
            <UserRound className="h-5 w-5 text-sage" />
            <div>
              <h2 className="font-semibold text-navy">3. Locataire et impayé</h2>
              <p className="text-sm text-ink/55">Une seule ligne suffit pour ouvrir un dossier actionnable.</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Prénom locataire"><input name="tenantFirstName" required /></Field>
            <Field label="Nom locataire"><input name="tenantLastName" required /></Field>
            <Field label="Email locataire"><input name="tenantEmail" type="email" /></Field>
            <Field label="Téléphone locataire"><input name="tenantPhone" required /></Field>
            <Field label="Adresse locataire" className="md:col-span-2"><textarea name="tenantAddress" required /></Field>
            <Field label="Nom caution"><input name="guarantorName" /></Field>
            <Field label="Email caution"><input name="guarantorEmail" type="email" /></Field>
            <Field label="Téléphone caution"><input name="guarantorPhone" /></Field>
            <Field label="Mois impayé"><input name="periodLabel" placeholder="Mai 2026" required /></Field>
            <Field label="Date d'échéance"><input name="dueDate" type="date" required /></Field>
            <Field label="Loyer dû"><input name="lineRentDue" inputMode="decimal" placeholder="850" required /></Field>
            <Field label="Charges dues"><input name="lineChargesDue" inputMode="decimal" placeholder="80" required /></Field>
            <Field label="Déjà payé"><input name="paidAmount" inputMode="decimal" defaultValue="0" required /></Field>
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-3">
            <FileText className="h-5 w-5 text-sage" />
            <div>
              <h2 className="font-semibold text-navy">4. Premier document</h2>
              <p className="text-sm text-ink/55">BailFlow générera une relance amiable prête à vérifier.</p>
            </div>
          </div>
          <LegalDisclaimerBox />
          <label className="mt-4 flex items-start gap-2 text-sm text-ink/70">
            <input name="legalDisclaimerAcknowledged" type="checkbox" required className="mt-0.5 h-4 w-4 accent-sage" />
            Je comprends que BailFlow est un outil administratif et documentaire, et que les documents sensibles doivent être vérifiés avant usage.
          </label>
          <button type="submit" className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80">
            Créer mon dossier et générer la première relance
          </button>
        </Card>
      </form>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={className}>
      <span>{label}</span>
      {children}
    </label>
  );
}

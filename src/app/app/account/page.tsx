import { AlertTriangle, CheckCircle2, CreditCard, Download, Shield, Trash2 } from "lucide-react";
import { Card, LegalDisclaimerBox, PageHeader } from "@/components/ui";
import { PLAN_DEFINITIONS } from "@/lib/plans";
import { deleteAccount, resendVerificationEmail, updateAccount, updatePassword } from "@/server/account-actions";
import { getCurrentUser } from "@/server/auth";
import { getBillingOverview } from "@/server/entitlements";

export const dynamic = "force-dynamic";

const subscriptionStatusLabels: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "Actif", color: "text-sage" },
  TRIALING: { label: "Période d'essai", color: "text-blue" },
  PAST_DUE: { label: "Paiement en retard", color: "text-warning" },
  CANCELED: { label: "Annulé", color: "text-danger" },
  UNPAID: { label: "Impayé", color: "text-danger" },
  INCOMPLETE: { label: "Incomplet", color: "text-warning" },
  INCOMPLETE_EXPIRED: { label: "Expiré", color: "text-danger" },
  PAUSED: { label: "En pause", color: "text-ink/50" }
};

const planLabels: Record<string, string> = {
  FREE: "Solo",
  BAILLEUR: "Bailleur",
  PREMIUM: "Premium",
  GESTIONNAIRE: "Gestionnaire",
  AGENCE: "Agence"
};

function UsageMeter({
  label,
  value,
  max
}: {
  label: string;
  value: number;
  max: number | null;
}) {
  const pct = max === null ? 0 : Math.min(100, Math.round((value / max) * 100));
  const isHigh = max !== null && pct >= 80;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-medium text-ink/60">{label}</span>
        <span className="text-xs font-semibold text-navy">
          {value}
          {max !== null ? <span className="font-normal text-ink/40"> / {max}</span> : ""}
          {max === null && <span className="font-normal text-ink/40"> (illimité)</span>}
        </span>
      </div>
      {max !== null && (
        <div className="h-1.5 overflow-hidden rounded-full bg-paper">
          <div
            className={`h-full rounded-full transition-all ${isHigh ? "bg-warning" : "bg-sage"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default async function AccountPage({
  searchParams
}: {
  searchParams: Promise<{ billing?: string; registered?: string; email?: string }>;
}) {
  const user = await getCurrentUser();
  const billing = await getBillingOverview(user);
  const query = await searchParams;

  const statusInfo =
    subscriptionStatusLabels[billing.subscriptionStatus] ?? {
      label: billing.subscriptionStatus,
      color: "text-ink/60"
    };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compte et facturation"
        subtitle="Gérez vos informations personnelles et votre abonnement."
      />

      {/* Flash messages */}
      {query.registered && (
        <div className="flex items-center gap-3 rounded-lg border border-sage/25 bg-sage/8 px-4 py-3 text-sm text-sage">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Compte créé avec succès. Choisissez un abonnement ci-dessous pour activer BailFlow.
        </div>
      )}
      {query.billing === "success" && (
        <div className="flex items-center gap-3 rounded-lg border border-sage/25 bg-sage/8 px-4 py-3 text-sm text-sage">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Paiement confirmé. Votre abonnement sera activé par Stripe dans quelques instants.
        </div>
      )}
      {query.billing === "missing-price" && (
        <div className="flex items-center gap-3 rounded-lg border border-warning/25 bg-warning/8 px-4 py-3 text-sm text-warning">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Identifiant de prix Stripe manquant dans la configuration environnement.
        </div>
      )}
      {query.email === "verified" && (
        <div className="flex items-center gap-3 rounded-lg border border-sage/25 bg-sage/8 px-4 py-3 text-sm text-sage">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Adresse email confirmée. Votre compte est prêt pour les créations.
        </div>
      )}
      {query.email === "verification-sent" && (
        <div className="flex items-center gap-3 rounded-lg border border-sage/25 bg-sage/8 px-4 py-3 text-sm text-sage">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Email de confirmation renvoyé. Vérifiez votre boîte de réception.
        </div>
      )}
      {!billing.subscriptionActive && !query.registered && (
        <div className="flex items-start gap-3 rounded-lg border border-warning/25 bg-warning/8 px-4 py-3 text-sm text-warning">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Votre abonnement n'est pas actif ({statusInfo.label.toLowerCase()}). Les créations sont
            désactivées jusqu'à activation d'un forfait.
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* ── Left column ── */}
        <div className="space-y-5">
          {/* Infos compte */}
          <Card>
            <h2 className="mb-5 flex items-center gap-2 border-b border-line pb-4 font-semibold text-navy">
              <Shield className="h-4 w-4 text-sage" />
              Informations du compte
            </h2>
            <form action={updateAccount} className="space-y-4">
              <div>
                <label>Nom affiché</label>
                <input name="name" defaultValue={user.name} required />
              </div>
              <div>
                <label>Adresse email</label>
                <input name="email" type="email" defaultValue={user.email} required />
              </div>
              <button className="rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-80">
                Enregistrer les modifications
              </button>
            </form>
          </Card>

          <Card>
            <h2 className="mb-4 font-semibold text-navy">Sécurité email</h2>
            {user.emailVerifiedAt ? (
              <p className="text-sm text-sage">Adresse confirmée le {user.emailVerifiedAt.toLocaleDateString("fr-FR")}.</p>
            ) : (
              <div className="space-y-3">
                <p className="text-sm leading-relaxed text-ink/60">
                  Confirmez votre email pour débloquer la création de biens, dossiers et documents.
                </p>
                <form action={resendVerificationEmail}>
                  <button className="rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-80">
                    Renvoyer l’email de confirmation
                  </button>
                </form>
              </div>
            )}
          </Card>

          <Card>
            <h2 className="mb-4 font-semibold text-navy">Parrainage</h2>
            <p className="mb-3 text-sm leading-relaxed text-ink/60">
              Parrainez un autre bailleur : vous recevez 2 mois de credit lorsque son compte est cree avec votre lien.
            </p>
            <code className="block break-all rounded-lg bg-paper p-3 text-xs text-navy">
              {`${process.env.NEXT_PUBLIC_APP_URL ?? ""}/auth/sign-up?ref=${user.referralCode ?? ""}`}
            </code>
            <p className="mt-2 text-xs font-semibold text-sage">
              Credits acquis : {user.referralCreditMonths} mois
            </p>
          </Card>

          {/* Mot de passe */}
          <Card>
            <h2 className="mb-5 border-b border-line pb-4 font-semibold text-navy">
              Mot de passe
            </h2>
            <form action={updatePassword} className="space-y-4">
              <div>
                <label>Nouveau mot de passe</label>
                <input
                  name="password"
                  type="password"
                  minLength={8}
                  required
                  placeholder="8 caractères minimum"
                  autoComplete="new-password"
                />
              </div>
              <button className="rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-80">
                Mettre à jour le mot de passe
              </button>
            </form>
          </Card>

          {/* Export comptable */}
          <Card>
            <h2 className="mb-4 font-semibold text-navy">Export comptable</h2>
            <p className="mb-4 text-sm leading-relaxed text-ink/60">
              Téléchargez un fichier CSV de tous vos paiements encaissés et impayés en cours, prêt à ouvrir dans Excel pour votre déclaration fiscale.
            </p>
            <a
              href="/api/reports/comptable"
              className="inline-flex items-center gap-2 rounded-lg border border-sage/30 bg-sage/5 px-4 py-2.5 text-sm font-semibold text-sage transition-colors hover:bg-sage/10"
            >
              <Download className="h-4 w-4" />
              Télécharger le rapport CSV
            </a>
            <a
              href="/api/reports/fiscal-2044"
              className="mt-2 inline-flex items-center gap-2 rounded-lg border border-navy/20 bg-navy/5 px-4 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-navy/10 sm:ml-2 sm:mt-0"
            >
              <Download className="h-4 w-4" />
              Rapport fiscal 2044 PDF
            </a>
          </Card>

          {/* Export RGPD */}
          <Card>
            <h2 className="mb-4 font-semibold text-navy">Données personnelles</h2>
            <p className="mb-4 text-sm leading-relaxed text-ink/60">
              Exportez une copie JSON complète de vos données BailFlow pour vos archives ou
              une demande d'accès RGPD.
            </p>
            <a
              href="/app/account/export"
              className="inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-paper"
            >
              <Download className="h-4 w-4" />
              Exporter mes données (JSON)
            </a>
          </Card>

          {/* Suppression */}
          <Card>
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-danger">
              <Trash2 className="h-4 w-4" />
              Suppression du compte
            </h2>
            <p className="mb-4 text-sm leading-relaxed text-ink/60">
              Suppression définitive et irréversible de votre compte, biens, locataires,
              dossiers, documents et paiements enregistrés.
            </p>
            <div className="rounded-lg border border-danger/15 bg-danger/4 p-4">
              <form action={deleteAccount} className="space-y-3">
                <div>
                  <label className="text-danger/80">
                    Tapez <span className="font-bold text-danger">SUPPRIMER</span> pour confirmer
                  </label>
                  <input
                    name="confirmation"
                    required
                    placeholder="SUPPRIMER"
                    className="mt-1"
                  />
                </div>
                <button className="rounded-lg bg-danger px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90">
                  Supprimer définitivement mon compte
                </button>
              </form>
            </div>
          </Card>
        </div>

        {/* ── Right column ── */}
        <div className="space-y-5">
          {/* Abonnement actuel */}
          <Card>
            <h2 className="mb-5 flex items-center gap-2 border-b border-line pb-4 font-semibold text-navy">
              <CreditCard className="h-4 w-4 text-sage" />
              Abonnement actuel
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink/40">
                  Forfait
                </p>
                <p className="mt-1.5 font-bold text-navy">
                  {planLabels[billing.plan.code] ?? billing.plan.name}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink/40">
                  Statut
                </p>
                <p className={`mt-1.5 font-bold ${statusInfo.color}`}>{statusInfo.label}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink/40">
                  Renouvellement
                </p>
                <p className="mt-1.5 font-semibold text-navy">
                  {billing.trialActive
                    ? `Essai - ${billing.trialDaysRemaining}j restants`
                    : billing.currentPeriodEnd?.toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      }) ?? "À confirmer"}
                </p>
              </div>
            </div>

            {/* Usage meters */}
            <div className="mt-5 space-y-3 rounded-lg bg-paper p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink/40">
                Utilisation du forfait
              </p>
              <UsageMeter
                label="Biens enregistrés"
                value={billing.usage.properties}
                max={billing.plan.propertyLimit}
              />
              <UsageMeter
                label="Dossiers actifs"
                value={billing.usage.activeCases}
                max={billing.plan.activeCaseLimit}
              />
              <UsageMeter
                label="Documents générés ce mois"
                value={billing.usage.generatedDocumentsThisMonth}
                max={billing.plan.monthlyDocumentLimit}
              />
            </div>

            <form action="/api/billing/portal" method="post" className="mt-5">
              <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-paper">
                <CreditCard className="h-4 w-4" />
                Ouvrir le portail de facturation Stripe
              </button>
            </form>
          </Card>

          {/* Plan cards */}
          <div className="space-y-3">
            <p className="px-1 text-sm font-semibold text-navy">Changer de forfait</p>
            {Object.values(PLAN_DEFINITIONS).map((plan) => {
              const isCurrent = plan.code === user.plan;
              return (
                <div
                  key={plan.code}
                  className={`rounded-xl border p-5 transition-colors ${
                    isCurrent
                      ? "border-sage bg-sage/4"
                      : "border-line bg-white hover:border-navy/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-navy">{plan.name}</h3>
                        {isCurrent && (
                          <span className="rounded-full bg-sage/15 px-2 py-0.5 text-xs font-semibold text-sage">
                            Actuel
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xl font-bold tabular-nums text-navy">
                        {plan.monthlyPriceLabel}
                      </p>
                      {plan.annualPriceLabel && (
                        <p className="mt-0.5 text-xs font-semibold text-sage">
                          {plan.annualPriceLabel} · {plan.annualSavingsLabel}
                        </p>
                      )}
                    </div>
                    {plan.code === "FREE" ? (
                      <span className="rounded-lg border border-line px-3 py-2 text-xs font-semibold text-ink/50">
                        {isCurrent ? "Actif" : "Inclus"}
                      </span>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <form action="/api/billing/checkout" method="post">
                          <input type="hidden" name="plan" value={plan.code} />
                          <input type="hidden" name="interval" value="MONTHLY" />
                          <button className="w-full rounded-full bg-ink px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-80">
                            Mensuel
                          </button>
                        </form>
                        <form action="/api/billing/checkout" method="post">
                          <input type="hidden" name="plan" value={plan.code} />
                          <input type="hidden" name="interval" value="ANNUAL" />
                          <button className="w-full rounded-lg border border-sage/30 bg-sage/8 px-3 py-2 text-xs font-semibold text-sage transition-colors hover:bg-sage/12">
                            Annuel
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                  <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-1.5 text-xs text-ink/60">
                        <CheckCircle2 className="h-3 w-3 shrink-0 text-sage" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {!billing.subscriptionActive && <LegalDisclaimerBox />}
        </div>
      </div>
    </div>
  );
}

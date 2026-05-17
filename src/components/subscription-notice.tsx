import Link from "next/link";
import { AlertTriangle, Zap } from "lucide-react";
import { getCurrentUser } from "@/server/auth";
import { getBillingOverview } from "@/server/entitlements";

const problemStatuses: Record<string, string> = {
  CANCELED: "annulé",
  PAST_DUE: "en retard de paiement",
  UNPAID: "impayé",
  INCOMPLETE: "incomplet",
  INCOMPLETE_EXPIRED: "expiré",
  PAUSED: "en pause"
};

export async function SubscriptionNotice() {
  const user = await getCurrentUser();
  const billing = await getBillingOverview(user);

  if (billing.trialActive) {
    return (
      <div className="mb-6 rounded-xl border border-blue/20 bg-blue/6 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <Zap className="mt-0.5 h-4 w-4 shrink-0 text-blue" />
            <p className="text-sm text-ink">
              Essai Bailleur actif — {billing.trialDaysRemaining} jour{billing.trialDaysRemaining > 1 ? "s" : ""} restant{billing.trialDaysRemaining > 1 ? "s" : ""}.{" "}
              <span className="text-ink/60">Passez à l'annuel pour conserver les dossiers illimités et économiser.</span>
            </p>
          </div>
          <Link href="/app/account" className="shrink-0 rounded-full bg-ink px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-80">
            Voir les forfaits
          </Link>
        </div>
      </div>
    );
  }

  if (billing.subscriptionActive) return null;

  const isProblem = billing.subscriptionStatus in problemStatuses;

  if (!isProblem && billing.plan.code === "FREE") {
    return (
      <div className="mb-6 rounded-xl border border-navy/15 bg-navy/4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <Zap className="mt-0.5 h-4 w-4 shrink-0 text-navy/60" />
            <p className="text-sm text-ink">
              Forfait Solo — {billing.plan.propertyLimit} bien, {billing.plan.monthlyDocumentLimit} documents templates/mois, dossiers actifs verrouillés.{" "}
              <span className="text-ink/60">Activez Bailleur pour l'IA, les relances auto et les dossiers illimités.</span>
            </p>
          </div>
          <Link href="/app/account" className="shrink-0 rounded-full bg-ink px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-80">
            Passer au Bailleur
          </Link>
        </div>
      </div>
    );
  }

  const statusLabel = problemStatuses[billing.subscriptionStatus] ?? "inactif";
  return (
    <div className="mb-6 rounded-xl border border-warning/30 bg-warning/8 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <p className="text-sm text-ink">
            Abonnement {statusLabel} — les créations sont désactivées.{" "}
            <span className="text-ink/60">Réactivez votre forfait pour créer des biens, dossiers et documents.</span>
          </p>
        </div>
        <Link href="/app/account" className="shrink-0 rounded-full bg-ink px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-80">
          Réactiver
        </Link>
      </div>
    </div>
  );
}

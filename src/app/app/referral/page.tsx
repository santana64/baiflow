import { Gift, Users } from "lucide-react";
import { Card, PageHeader, StatCard } from "@/components/ui";
import { CopyButton } from "@/components/copy-button";
import { getCurrentUser } from "@/server/auth";
import { getAppUrl } from "@/lib/env";
import { prisma } from "@/server/db";

export const dynamic = "force-dynamic";

export default async function ReferralPage() {
  const user = await getCurrentUser();
  const referralLink = user.referralCode
    ? `${getAppUrl()}/auth/sign-up?ref=${user.referralCode}`
    : null;

  const [referredCount, pendingCredit] = await Promise.all([
    prisma.user.count({ where: { referredById: user.id } }),
    Promise.resolve(user.referralCreditMonths)
  ]);

  const convertedCount = await prisma.user.count({
    where: { referredById: user.id, plan: { not: "FREE" } }
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Programme de parrainage"
        subtitle="Parrainez un bailleur — vous recevez 2 mois offerts, il reçoit 1 mois offert."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Filleuls inscrits" value={String(referredCount)} icon={<Users className="h-4 w-4" />} accent="sage" />
        <StatCard label="Filleuls convertis" value={String(convertedCount)} icon={<Gift className="h-4 w-4" />} accent="blue" />
        <StatCard label="Mois de crédit" value={String(pendingCredit)} icon={<Gift className="h-4 w-4" />} accent="warning" hint="Crédits applicables à votre prochain renouvellement" />
      </div>

      <Card>
        <h2 className="mb-1 font-semibold text-navy">Votre lien de parrainage</h2>
        <p className="mb-4 text-sm text-ink/55">Partagez ce lien. Dès que votre filleul souscrit un forfait payant, vous recevez automatiquement 2 mois offerts sur votre abonnement.</p>
        {referralLink ? (
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg border border-line bg-powder px-3 py-2.5 text-sm font-mono text-ink/80 select-all break-all">
              {referralLink}
            </code>
            <CopyButton text={referralLink} />
          </div>
        ) : (
          <p className="text-sm text-ink/45">Votre code de parrainage est en cours de génération.</p>
        )}
      </Card>

      <Card>
        <h2 className="mb-4 font-semibold text-navy">Comment ça fonctionne</h2>
        <div className="space-y-4">
          {[
            { n: 1, title: "Partagez votre lien", desc: "Envoyez votre lien à un bailleur qui a besoin de gérer un impayé." },
            { n: 2, title: "Il s'inscrit et démarre son essai", desc: "Son compte est automatiquement lié au vôtre. Il bénéficie de 14 jours d'essai gratuit." },
            { n: 3, title: "Il souscrit un forfait payant", desc: "Dès sa première souscription, vous recevez 2 mois offerts et lui 1 mois offert." },
            { n: 4, title: "Les crédits sont appliqués", desc: "Les mois offerts s'appliquent à votre prochain renouvellement automatiquement." }
          ].map((step) => (
            <div key={step.n} className="flex items-start gap-4">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">{step.n}</div>
              <div>
                <p className="font-semibold text-navy">{step.title}</p>
                <p className="mt-0.5 text-sm text-ink/60">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {user.referralCreditMonths > 0 && (
        <div className="rounded-xl border border-sage/25 bg-sage/6 p-5">
          <p className="font-semibold text-sage">
            Vous avez {user.referralCreditMonths} mois de crédit en attente — merci pour votre confiance.
          </p>
          <p className="mt-1 text-sm text-sage/70">Ces crédits seront appliqués automatiquement à votre prochain renouvellement d'abonnement.</p>
        </div>
      )}
    </div>
  );
}

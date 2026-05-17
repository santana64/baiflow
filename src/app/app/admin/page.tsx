import { notFound } from "next/navigation";
import { Activity, CreditCard, Euro, Users } from "lucide-react";
import { Card, PageHeader, StatCard } from "@/components/ui";
import { formatMoney } from "@/domain/rent-cases";
import { PLAN_DEFINITIONS } from "@/lib/plans";
import { getCurrentUser } from "@/server/auth";
import { prisma } from "@/server/db";

export const dynamic = "force-dynamic";

function isAdminEmail(email: string) {
  const configured = process.env.BAILFLOW_ADMIN_EMAILS?.split(",").map((item) => item.trim().toLowerCase()).filter(Boolean) ?? [];
  if (!configured.length) return false;
  return configured.includes(email.toLowerCase());
}

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!isAdminEmail(user.email)) notFound();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const [users, addOns, payments, cases, documents, trials] = await Promise.all([
    prisma.user.findMany({ select: { plan: true, subscriptionInterval: true, subscriptionStatus: true, trialEndsAt: true, createdAt: true } }),
    prisma.addOnOrder.findMany({ where: { status: { in: ["PAID", "COMPLETED"] }, createdAt: { gte: monthStart } } }),
    prisma.tenantPayment.findMany({ where: { status: "PAID", paidAt: { gte: monthStart } } }),
    prisma.rentCase.count(),
    prisma.generatedDocument.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.user.count({ where: { subscriptionStatus: "TRIALING", trialEndsAt: { gt: now } } })
  ]);

  const activePaidUsers = users.filter((item) => item.plan !== "FREE" && ["ACTIVE", "TRIALING"].includes(item.subscriptionStatus));
  const estimatedMrrCents = activePaidUsers.reduce((sum, item) => {
    const plan = PLAN_DEFINITIONS[item.plan];
    const monthly = item.subscriptionInterval === "ANNUAL" && plan.annualPrice ? plan.annualPrice / 12 : plan.monthlyPrice;
    return sum + Math.round(monthly * 100);
  }, 0);
  const addOnRevenueCents = addOns.reduce((sum, order) => sum + order.amountCents, 0);
  const tenantPaymentVolumeCents = payments.reduce((sum, payment) => sum + payment.amountCents, 0);
  const conversionBase = users.filter((item) => item.createdAt >= thirtyDaysAgo).length;
  const activeRecent = activePaidUsers.filter((item) => item.createdAt >= thirtyDaysAgo).length;

  const planCounts = Object.keys(PLAN_DEFINITIONS).map((plan) => ({
    plan,
    count: users.filter((item) => item.plan === plan).length
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Admin BailFlow" subtitle="Vue operateur minimale pour piloter le lancement commercial." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="MRR estime" value={formatMoney(estimatedMrrCents)} icon={<Euro className="h-4 w-4" />} accent="sage" />
        <StatCard label="Trials actifs" value={String(trials)} icon={<Activity className="h-4 w-4" />} accent="blue" />
        <StatCard label="Add-ons ce mois" value={formatMoney(addOnRevenueCents)} icon={<CreditCard className="h-4 w-4" />} accent="navy" />
        <StatCard label="Volume locataire" value={formatMoney(tenantPaymentVolumeCents)} icon={<Euro className="h-4 w-4" />} accent="warning" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-semibold text-navy">Funnel 30 jours</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-line pb-2"><span>Nouveaux comptes</span><strong>{conversionBase}</strong></div>
            <div className="flex justify-between border-b border-line pb-2"><span>Nouveaux comptes payants/trial</span><strong>{activeRecent}</strong></div>
            <div className="flex justify-between"><span>Documents generes ce mois</span><strong>{documents}</strong></div>
          </div>
        </Card>
        <Card>
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-navy"><Users className="h-4 w-4 text-sage" /> Plans</h2>
          <div className="space-y-2">
            {planCounts.map((item) => (
              <div key={item.plan} className="flex justify-between rounded-lg border border-line px-3 py-2 text-sm">
                <span>{PLAN_DEFINITIONS[item.plan as keyof typeof PLAN_DEFINITIONS].name}</span>
                <strong>{item.count}</strong>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="mb-3 font-semibold text-navy">Sante produit</h2>
        <div className="grid gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-lg border border-line p-3"><span className="text-ink/45">Dossiers total</span><p className="mt-1 text-xl font-bold text-navy">{cases}</p></div>
          <div className="rounded-lg border border-line p-3"><span className="text-ink/45">Utilisateurs total</span><p className="mt-1 text-xl font-bold text-navy">{users.length}</p></div>
          <div className="rounded-lg border border-line p-3"><span className="text-ink/45">Paiements portail ce mois</span><p className="mt-1 text-xl font-bold text-navy">{payments.length}</p></div>
        </div>
      </Card>
    </div>
  );
}

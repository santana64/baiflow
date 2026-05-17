import type { BillingInterval, BillingPlan, SubscriptionStatus, User } from "@prisma/client";

export type PlanCode = BillingPlan;
export type PlanInterval = BillingInterval;

export type PlanDefinition = {
  code: PlanCode;
  name: string;
  shortName: string;
  monthlyPrice: number;
  annualPrice: number | null;
  monthlyPriceLabel: string;
  annualPriceLabel: string | null;
  annualSavingsLabel: string | null;
  propertyLimit: number | null;
  activeCaseLimit: number | null;
  monthlyDocumentLimit: number | null;
  includedRegisteredLetters: number;
  includedSignatures: number;
  userLimit: number | null;
  hasAI: boolean;
  hasAutoReminders: boolean;
  hasFiscalExport: boolean;
  hasTenantPortal: boolean;
  hasApiAccess: boolean;
  hasWhiteLabel: boolean;
  supportLabel: string;
  features: string[];
  monthlyStripePriceEnv: string | null;
  annualStripePriceEnv: string | null;
};

export const PLAN_DEFINITIONS: Record<PlanCode, PlanDefinition> = {
  FREE: {
    code: "FREE",
    name: "Solo",
    shortName: "Solo",
    monthlyPrice: 0,
    annualPrice: null,
    monthlyPriceLabel: "0€/mois",
    annualPriceLabel: null,
    annualSavingsLabel: null,
    propertyLimit: 1,
    activeCaseLimit: 0,
    monthlyDocumentLimit: 3,
    includedRegisteredLetters: 0,
    includedSignatures: 0,
    userLimit: 1,
    hasAI: false,
    hasAutoReminders: false,
    hasFiscalExport: false,
    hasTenantPortal: true,
    hasApiAccess: false,
    hasWhiteLabel: false,
    supportLabel: "Base de connaissance",
    monthlyStripePriceEnv: null,
    annualStripePriceEnv: null,
    features: [
      "1 propriété",
      "Dossiers archivés en lecture seule",
      "3 documents templates/mois",
      "Pas d'envoi email ni IA"
    ]
  },
  BAILLEUR: {
    code: "BAILLEUR",
    name: "Bailleur",
    shortName: "Bailleur",
    monthlyPrice: 34,
    annualPrice: 299,
    monthlyPriceLabel: "34€/mois",
    annualPriceLabel: "299€/an",
    annualSavingsLabel: "Économisez 109€",
    propertyLimit: 3,
    activeCaseLimit: null,
    monthlyDocumentLimit: null,
    includedRegisteredLetters: 2,
    includedSignatures: 0,
    userLimit: 1,
    hasAI: true,
    hasAutoReminders: true,
    hasFiscalExport: false,
    hasTenantPortal: false,
    hasApiAccess: false,
    hasWhiteLabel: false,
    supportLabel: "Support chat",
    monthlyStripePriceEnv: "STRIPE_PRICE_BAILLEUR_MONTHLY",
    annualStripePriceEnv: "STRIPE_PRICE_BAILLEUR_ANNUAL",
    features: [
      "3 propriétés",
      "Dossiers illimités",
      "Documents IA illimités",
      "Envoi email intégré",
      "2 recommandés électroniques/mois inclus",
      "Support chat"
    ]
  },
  PREMIUM: {
    code: "PREMIUM",
    name: "Premium",
    shortName: "Premium",
    monthlyPrice: 69,
    annualPrice: 599,
    monthlyPriceLabel: "69€/mois",
    annualPriceLabel: "599€/an",
    annualSavingsLabel: "Économisez 229€",
    propertyLimit: null,
    activeCaseLimit: null,
    monthlyDocumentLimit: null,
    includedRegisteredLetters: 10,
    includedSignatures: 10,
    userLimit: 1,
    hasAI: true,
    hasAutoReminders: true,
    hasFiscalExport: true,
    hasTenantPortal: false,
    hasApiAccess: false,
    hasWhiteLabel: false,
    supportLabel: "Support prioritaire",
    monthlyStripePriceEnv: "STRIPE_PRICE_PREMIUM_MONTHLY",
    annualStripePriceEnv: "STRIPE_PRICE_PREMIUM_ANNUAL",
    features: [
      "Propriétés illimitées",
      "10 recommandés électroniques/mois inclus",
      "Signature électronique des plans",
      "Portail locataire avec paiement en ligne",
      "Export comptable 2044",
      "Dossier commissaire pré-formaté",
      "Support prioritaire"
    ]
  },
  GESTIONNAIRE: {
    code: "GESTIONNAIRE",
    name: "Gestionnaire",
    shortName: "Gestionnaire",
    monthlyPrice: 149,
    annualPrice: 1290,
    monthlyPriceLabel: "149€/mois",
    annualPriceLabel: "1290€/an",
    annualSavingsLabel: "Économisez 498€",
    propertyLimit: 50,
    activeCaseLimit: null,
    monthlyDocumentLimit: null,
    includedRegisteredLetters: 25,
    includedSignatures: 25,
    userLimit: 3,
    hasAI: true,
    hasAutoReminders: true,
    hasFiscalExport: true,
    hasTenantPortal: true,
    hasApiAccess: true,
    hasWhiteLabel: false,
    supportLabel: "Account manager",
    monthlyStripePriceEnv: "STRIPE_PRICE_GESTIONNAIRE_MONTHLY",
    annualStripePriceEnv: "STRIPE_PRICE_GESTIONNAIRE_ANNUAL",
    features: [
      "Jusqu'à 3 utilisateurs",
      "50 propriétés",
      "Portail locataire branded",
      "Accès API",
      "Dashboard multi-propriétaires",
      "Account manager dédié"
    ]
  },
  AGENCE: {
    code: "AGENCE",
    name: "Agence",
    shortName: "Agence",
    monthlyPrice: 399,
    annualPrice: 3490,
    monthlyPriceLabel: "399€/mois",
    annualPriceLabel: "3490€/an",
    annualSavingsLabel: "Économisez 1298€",
    propertyLimit: null,
    activeCaseLimit: null,
    monthlyDocumentLimit: null,
    includedRegisteredLetters: 100,
    includedSignatures: 100,
    userLimit: null,
    hasAI: true,
    hasAutoReminders: true,
    hasFiscalExport: true,
    hasTenantPortal: true,
    hasApiAccess: true,
    hasWhiteLabel: true,
    supportLabel: "SLA 99.9%",
    monthlyStripePriceEnv: "STRIPE_PRICE_AGENCE_MONTHLY",
    annualStripePriceEnv: "STRIPE_PRICE_AGENCE_ANNUAL",
    features: [
      "Utilisateurs illimités",
      "Propriétés illimitées",
      "White label logo et couleurs",
      "Intégrations CRM",
      "Formation équipe incluse",
      "SLA contractuel 99.9%"
    ]
  }
};

export const PAID_PLAN_CODES: PlanCode[] = ["BAILLEUR", "PREMIUM", "GESTIONNAIRE", "AGENCE"];
export const ACTIVE_SUBSCRIPTION_STATUSES: SubscriptionStatus[] = ["ACTIVE", "TRIALING"];

export function isSubscriptionActive(status: SubscriptionStatus) {
  return ACTIVE_SUBSCRIPTION_STATUSES.includes(status);
}

export function isTrialActive(user: Pick<User, "trialEndsAt">) {
  return Boolean(user.trialEndsAt && user.trialEndsAt > new Date());
}

export function getTrialDaysRemaining(user: Pick<User, "trialEndsAt">) {
  if (!user.trialEndsAt) return 0;
  const remainingMs = user.trialEndsAt.getTime() - Date.now();
  return Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60 * 24)));
}

export function userPlanIsActive(
  user: Pick<User, "plan" | "subscriptionStatus" | "trialEndsAt" | "subscriptionCurrentPeriodEnd">
) {
  if (user.plan === "FREE") return true;
  if (isTrialActive(user)) return true;
  if (!isSubscriptionActive(user.subscriptionStatus)) return false;
  if (user.subscriptionCurrentPeriodEnd && user.subscriptionCurrentPeriodEnd < new Date()) return false;
  return true;
}

export function planIsActive(plan: PlanCode, status: SubscriptionStatus) {
  if (plan === "FREE") return true;
  return isSubscriptionActive(status);
}

export function getPlanPriceId(plan: PlanCode, interval: PlanInterval = "MONTHLY") {
  const definition = PLAN_DEFINITIONS[plan];
  const env = interval === "ANNUAL" ? definition.annualStripePriceEnv : definition.monthlyStripePriceEnv;
  if (!env) return null;
  const value = process.env[env];
  if (value) return value;
  if (interval === "MONTHLY" && plan === "BAILLEUR") return process.env.STRIPE_PRICE_BAILLEUR ?? null;
  if (interval === "MONTHLY" && plan === "PREMIUM") return process.env.STRIPE_PRICE_PREMIUM ?? null;
  return null;
}

export function priceIdToPlan(priceId: string | null | undefined): { plan: PlanCode; interval: PlanInterval } | null {
  if (!priceId) return null;
  for (const definition of Object.values(PLAN_DEFINITIONS)) {
    if (definition.monthlyStripePriceEnv && process.env[definition.monthlyStripePriceEnv] === priceId) {
      return { plan: definition.code, interval: "MONTHLY" };
    }
    if (definition.annualStripePriceEnv && process.env[definition.annualStripePriceEnv] === priceId) {
      return { plan: definition.code, interval: "ANNUAL" };
    }
  }
  if (process.env.STRIPE_PRICE_BAILLEUR === priceId) return { plan: "BAILLEUR", interval: "MONTHLY" };
  if (process.env.STRIPE_PRICE_PREMIUM === priceId) return { plan: "PREMIUM", interval: "MONTHLY" };
  return null;
}

export function planFromPriceId(priceId: string | null | undefined): PlanCode | null {
  return priceIdToPlan(priceId)?.plan ?? null;
}

export function intervalFromPriceId(priceId: string | null | undefined): PlanInterval | null {
  return priceIdToPlan(priceId)?.interval ?? null;
}

import type { User } from "@prisma/client";
import { DomainError } from "@/lib/errors";
import { getTrialDaysRemaining, isTrialActive, PLAN_DEFINITIONS, userPlanIsActive } from "@/lib/plans";
import { prisma } from "./db";

export async function getUsage(userId: string) {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [properties, activeCases, generatedDocuments, generatedDocumentsThisMonth] = await Promise.all([
    prisma.property.count({ where: { userId } }),
    prisma.rentCase.count({ where: { userId, status: { notIn: ["RESOLVED", "CLOSED"] } } }),
    prisma.generatedDocument.count({ where: { rentCase: { userId } } }),
    prisma.generatedDocument.count({ where: { rentCase: { userId }, createdAt: { gte: monthStart } } })
  ]);

  return { properties, activeCases, generatedDocuments, generatedDocumentsThisMonth };
}

export function getMonthStart(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export async function getRegisteredLetterUsage(userId: string, date = new Date()) {
  return prisma.registeredLetter.count({
    where: {
      createdAt: { gte: getMonthStart(date) },
      document: { rentCase: { userId } }
    }
  });
}

export function assertAccountReady(_user: User) {
  // Email verification disabled — users can use the app immediately after sign-up
}

export function assertActiveSubscription(user: User) {
  assertAccountReady(user);
  if (!userPlanIsActive(user)) {
    throw new DomainError("Votre essai est terminé ou votre abonnement n'est pas actif. Choisissez un forfait pour continuer.");
  }
}

export async function assertCanCreateProperty(user: User) {
  assertActiveSubscription(user);
  const plan = PLAN_DEFINITIONS[user.plan];
  if (plan.propertyLimit === null) return;
  const usage = await getUsage(user.id);
  if (usage.properties >= plan.propertyLimit) {
    throw new DomainError(`Votre forfait ${plan.name} est limité à ${plan.propertyLimit} bien${plan.propertyLimit > 1 ? "s" : ""}. Passez au forfait supérieur pour en ajouter davantage.`);
  }
}

export async function assertCanCreateActiveCase(user: User) {
  assertActiveSubscription(user);
  const plan = PLAN_DEFINITIONS[user.plan];
  if (plan.activeCaseLimit === null) return;
  const usage = await getUsage(user.id);
  if (usage.activeCases >= plan.activeCaseLimit) {
    throw new DomainError(`Votre forfait ${plan.name} ne permet pas de créer de nouveau dossier actif. Démarrez l'essai ou activez Bailleur.`);
  }
}

export async function assertCanGenerateDocument(user: User) {
  assertActiveSubscription(user);
  const plan = PLAN_DEFINITIONS[user.plan];
  if (plan.monthlyDocumentLimit === null) return;
  const usage = await getUsage(user.id);
  if (usage.generatedDocumentsThisMonth >= plan.monthlyDocumentLimit) {
    throw new DomainError(`Votre forfait ${plan.name} est limité à ${plan.monthlyDocumentLimit} documents par mois. Activez Bailleur pour générer sans limite.`);
  }
}

export function assertHasFiscalExport(user: User) {
  assertActiveSubscription(user);
  if (!PLAN_DEFINITIONS[user.plan].hasFiscalExport) {
    throw new DomainError("Rapport fiscal réservé au forfait Premium.");
  }
}

export async function getRegisteredLetterAllowance(user: User) {
  assertActiveSubscription(user);
  const included = PLAN_DEFINITIONS[user.plan].includedRegisteredLetters;
  const used = await getRegisteredLetterUsage(user.id);
  return {
    included,
    used,
    remaining: Math.max(0, included - used)
  };
}

export async function getBillingOverview(user: User) {
  const usage = await getUsage(user.id);
  return {
    plan: PLAN_DEFINITIONS[user.plan],
    subscriptionActive: userPlanIsActive(user),
    subscriptionStatus: user.subscriptionStatus,
    subscriptionInterval: user.subscriptionInterval,
    currentPeriodEnd: user.subscriptionCurrentPeriodEnd,
    cancelAtPeriodEnd: user.cancelAtPeriodEnd,
    trialActive: isTrialActive(user),
    trialEndsAt: user.trialEndsAt,
    trialDaysRemaining: getTrialDaysRemaining(user),
    usage
  };
}

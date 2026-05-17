CREATE TYPE "BillingInterval" AS ENUM ('MONTHLY', 'ANNUAL');
CREATE TYPE "NurtureEmailStatus" AS ENUM ('PENDING', 'SENT', 'SKIPPED', 'FAILED');

ALTER TYPE "BillingPlan" ADD VALUE IF NOT EXISTS 'GESTIONNAIRE';
ALTER TYPE "BillingPlan" ADD VALUE IF NOT EXISTS 'AGENCE';

ALTER TABLE "User"
  ADD COLUMN "subscriptionInterval" "BillingInterval" NOT NULL DEFAULT 'MONTHLY',
  ADD COLUMN "trialEndsAt" TIMESTAMP(3),
  ADD COLUMN "onboardingCompletedAt" TIMESTAMP(3);

CREATE TABLE "NurtureEmail" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "step" INTEGER NOT NULL,
  "subject" TEXT NOT NULL,
  "bodyHtml" TEXT NOT NULL,
  "bodyText" TEXT NOT NULL,
  "sendAfter" TIMESTAMP(3) NOT NULL,
  "sentAt" TIMESTAMP(3),
  "status" "NurtureEmailStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "NurtureEmail_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "NurtureEmail_userId_step_key" ON "NurtureEmail"("userId", "step");
CREATE INDEX "NurtureEmail_status_sendAfter_idx" ON "NurtureEmail"("status", "sendAfter");
CREATE INDEX "NurtureEmail_userId_idx" ON "NurtureEmail"("userId");

ALTER TABLE "NurtureEmail" ADD CONSTRAINT "NurtureEmail_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TYPE "CaseStatus" AS ENUM ('DRAFT', 'AMICABLE', 'FORMAL_NOTICE', 'REPAYMENT_PLAN', 'PROFESSIONAL_ESCALATION', 'RESOLVED', 'CLOSED');
CREATE TYPE "Severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "RentLineStatus" AS ENUM ('UNPAID', 'PARTIAL', 'PAID');
CREATE TYPE "CaseEventType" AS ENUM ('MISSED_PAYMENT', 'PHONE_CALL', 'EMAIL_SENT', 'SIMPLE_LETTER_SENT', 'REGISTERED_LETTER_PREPARED', 'REPAYMENT_PLAN_PROPOSED', 'REPAYMENT_PLAN_ACCEPTED', 'GUARANTOR_CONTACTED', 'DOCUMENT_GENERATED', 'PROFESSIONAL_FILE_PREPARED', 'PAYMENT_RECEIVED', 'NOTE', 'CUSTOM');
CREATE TYPE "DocumentType" AS ENUM ('AMICABLE_REMINDER_EMAIL', 'AMICABLE_REMINDER_LETTER', 'FORMAL_NOTICE_DRAFT', 'REPAYMENT_PLAN', 'GUARANTOR_INFORMATION_LETTER', 'CASE_SUMMARY', 'PROFESSIONAL_ESCALATION_FILE');
CREATE TYPE "BillingPlan" AS ENUM ('STARTER', 'BAILLEUR', 'PREMIUM');
CREATE TYPE "SubscriptionStatus" AS ENUM ('NONE', 'INCOMPLETE', 'INCOMPLETE_EXPIRED', 'TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'UNPAID', 'PAUSED');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "plan" "BillingPlan" NOT NULL DEFAULT 'STARTER',
  "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'NONE',
  "stripeCustomerId" TEXT,
  "stripeSubscriptionId" TEXT,
  "stripePriceId" TEXT,
  "subscriptionCurrentPeriodEnd" TIMESTAMP(3),
  "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LandlordProfile" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "defaultSignature" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LandlordProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Property" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "postalCode" TEXT NOT NULL,
  "rentAmountCents" INTEGER NOT NULL,
  "chargesAmountCents" INTEGER NOT NULL,
  "paymentDayOfMonth" INTEGER NOT NULL,
  "leaseStartDate" TIMESTAMP(3) NOT NULL,
  "hasGuarantor" BOOLEAN NOT NULL DEFAULT false,
  "notes" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Tenant" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "propertyId" TEXT,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "guarantorName" TEXT,
  "guarantorEmail" TEXT,
  "guarantorPhone" TEXT,
  "notes" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RentCase" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "propertyId" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "status" "CaseStatus" NOT NULL DEFAULT 'AMICABLE',
  "severity" "Severity" NOT NULL DEFAULT 'MEDIUM',
  "firstMissedPaymentDate" TIMESTAMP(3) NOT NULL,
  "totalUnpaidCents" INTEGER NOT NULL DEFAULT 0,
  "nextActionLabel" TEXT NOT NULL,
  "nextActionDate" TIMESTAMP(3),
  "legalDisclaimerAcknowledged" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RentCase_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UnpaidRentLine" (
  "id" TEXT NOT NULL,
  "rentCaseId" TEXT NOT NULL,
  "periodLabel" TEXT NOT NULL,
  "dueDate" TIMESTAMP(3) NOT NULL,
  "rentDueCents" INTEGER NOT NULL,
  "chargesDueCents" INTEGER NOT NULL,
  "paidAmountCents" INTEGER NOT NULL,
  "unpaidAmountCents" INTEGER NOT NULL,
  "status" "RentLineStatus" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UnpaidRentLine_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CaseEvent" (
  "id" TEXT NOT NULL,
  "rentCaseId" TEXT NOT NULL,
  "type" "CaseEventType" NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "eventDate" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CaseEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GeneratedDocument" (
  "id" TEXT NOT NULL,
  "rentCaseId" TEXT NOT NULL,
  "type" "DocumentType" NOT NULL,
  "title" TEXT NOT NULL,
  "contentHtml" TEXT NOT NULL,
  "contentText" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GeneratedDocument_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Payment" (
  "id" TEXT NOT NULL,
  "rentCaseId" TEXT NOT NULL,
  "amountCents" INTEGER NOT NULL,
  "paymentDate" TIMESTAMP(3) NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");
CREATE UNIQUE INDEX "User_stripeSubscriptionId_key" ON "User"("stripeSubscriptionId");
CREATE UNIQUE INDEX "LandlordProfile_userId_key" ON "LandlordProfile"("userId");

ALTER TABLE "LandlordProfile" ADD CONSTRAINT "LandlordProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Property" ADD CONSTRAINT "Property_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "RentCase" ADD CONSTRAINT "RentCase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RentCase" ADD CONSTRAINT "RentCase_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RentCase" ADD CONSTRAINT "RentCase_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "UnpaidRentLine" ADD CONSTRAINT "UnpaidRentLine_rentCaseId_fkey" FOREIGN KEY ("rentCaseId") REFERENCES "RentCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CaseEvent" ADD CONSTRAINT "CaseEvent_rentCaseId_fkey" FOREIGN KEY ("rentCaseId") REFERENCES "RentCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GeneratedDocument" ADD CONSTRAINT "GeneratedDocument_rentCaseId_fkey" FOREIGN KEY ("rentCaseId") REFERENCES "RentCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_rentCaseId_fkey" FOREIGN KEY ("rentCaseId") REFERENCES "RentCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

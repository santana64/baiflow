CREATE TYPE "OrganizationType" AS ENUM ('SCI', 'AGENCY', 'INVESTOR');
CREATE TYPE "OrganizationRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'ACCOUNTANT');
CREATE TYPE "AddOnType" AS ENUM ('REGISTERED_LETTER', 'ELECTRONIC_SIGNATURE', 'FISCAL_REPORT', 'PROFESSIONAL_FILE', 'REGISTERED_LETTER_PACK_10', 'LEGAL_CONSULTATION', 'LEGAL_ARCHIVE_10Y');
CREATE TYPE "AddOnOrderStatus" AS ENUM ('PENDING_PAYMENT', 'PAID', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELED');
CREATE TYPE "ExternalRequestStatus" AS ENUM ('PENDING', 'SENT', 'SIGNED', 'DELIVERED', 'FAILED', 'CANCELED');
CREATE TYPE "PartnerProfessionalType" AS ENUM ('COMMISSAIRE_JUSTICE', 'AVOCAT', 'RECOUVREMENT', 'EXPERT_COMPTABLE');
CREATE TYPE "ReferralStatus" AS ENUM ('REQUESTED', 'CONTACTED', 'ACCEPTED', 'DECLINED', 'CLOSED');
CREATE TYPE "GliLeadStatus" AS ENUM ('REQUESTED', 'SENT_TO_PARTNER', 'QUOTED', 'WON', 'LOST');

CREATE TABLE "Organization" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" "OrganizationType" NOT NULL DEFAULT 'SCI',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OrganizationMember" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "role" "OrganizationRole" NOT NULL DEFAULT 'OWNER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OrganizationMember_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SciProfile" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "legalName" TEXT NOT NULL,
  "siren" TEXT,
  "shareCapital" TEXT,
  "taxRegime" TEXT,
  "notes" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SciProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SciShareholder" (
  "id" TEXT NOT NULL,
  "sciProfileId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT,
  "sharesBps" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SciShareholder_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AddOnOrder" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "rentCaseId" TEXT,
  "documentId" TEXT,
  "type" "AddOnType" NOT NULL,
  "status" "AddOnOrderStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
  "amountCents" INTEGER NOT NULL,
  "providerCostCents" INTEGER,
  "stripeSessionId" TEXT,
  "stripePaymentIntentId" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AddOnOrder_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RegisteredLetter" (
  "id" TEXT NOT NULL,
  "documentId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerId" TEXT,
  "status" "ExternalRequestStatus" NOT NULL DEFAULT 'PENDING',
  "recipientEmail" TEXT NOT NULL,
  "recipientName" TEXT NOT NULL,
  "receiptUrl" TEXT,
  "error" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RegisteredLetter_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ESignatureRequest" (
  "id" TEXT NOT NULL,
  "documentId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerId" TEXT,
  "status" "ExternalRequestStatus" NOT NULL DEFAULT 'PENDING',
  "signerEmail" TEXT NOT NULL,
  "signerName" TEXT NOT NULL,
  "signatureUrl" TEXT,
  "signedDocumentUrl" TEXT,
  "error" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ESignatureRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TenantPortalAccess" (
  "id" TEXT NOT NULL,
  "rentCaseId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastViewedAt" TIMESTAMP(3),
  CONSTRAINT "TenantPortalAccess_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PartnerProfessional" (
  "id" TEXT NOT NULL,
  "type" "PartnerProfessionalType" NOT NULL,
  "name" TEXT NOT NULL,
  "department" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "website" TEXT,
  "description" TEXT NOT NULL,
  "verified" BOOLEAN NOT NULL DEFAULT false,
  "premiumPlacement" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PartnerProfessional_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProfessionalReferral" (
  "id" TEXT NOT NULL,
  "rentCaseId" TEXT NOT NULL,
  "partnerId" TEXT NOT NULL,
  "status" "ReferralStatus" NOT NULL DEFAULT 'REQUESTED',
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProfessionalReferral_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ApiKey" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "keyHash" TEXT NOT NULL,
  "prefix" TEXT NOT NULL,
  "lastUsedAt" TIMESTAMP(3),
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WhiteLabelSetting" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "brandName" TEXT NOT NULL,
  "logoUrl" TEXT,
  "primaryColor" TEXT NOT NULL DEFAULT '#172b4d',
  "accentColor" TEXT NOT NULL DEFAULT '#5d7d6a',
  "customDomain" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WhiteLabelSetting_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GliLead" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "propertyId" TEXT,
  "provider" TEXT,
  "status" "GliLeadStatus" NOT NULL DEFAULT 'REQUESTED',
  "estimatedAnnualPremiumCents" INTEGER,
  "commissionCents" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GliLead_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OrganizationMember_organizationId_userId_key" ON "OrganizationMember"("organizationId", "userId");
CREATE INDEX "OrganizationMember_userId_idx" ON "OrganizationMember"("userId");
CREATE UNIQUE INDEX "SciProfile_organizationId_key" ON "SciProfile"("organizationId");
CREATE INDEX "AddOnOrder_userId_idx" ON "AddOnOrder"("userId");
CREATE INDEX "AddOnOrder_rentCaseId_idx" ON "AddOnOrder"("rentCaseId");
CREATE INDEX "AddOnOrder_status_idx" ON "AddOnOrder"("status");
CREATE UNIQUE INDEX "TenantPortalAccess_tokenHash_key" ON "TenantPortalAccess"("tokenHash");
CREATE INDEX "TenantPortalAccess_rentCaseId_idx" ON "TenantPortalAccess"("rentCaseId");
CREATE INDEX "PartnerProfessional_department_type_idx" ON "PartnerProfessional"("department", "type");
CREATE UNIQUE INDEX "ApiKey_keyHash_key" ON "ApiKey"("keyHash");
CREATE INDEX "ApiKey_userId_idx" ON "ApiKey"("userId");
CREATE UNIQUE INDEX "WhiteLabelSetting_userId_key" ON "WhiteLabelSetting"("userId");
CREATE INDEX "GliLead_userId_idx" ON "GliLead"("userId");

ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SciProfile" ADD CONSTRAINT "SciProfile_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SciShareholder" ADD CONSTRAINT "SciShareholder_sciProfileId_fkey" FOREIGN KEY ("sciProfileId") REFERENCES "SciProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AddOnOrder" ADD CONSTRAINT "AddOnOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AddOnOrder" ADD CONSTRAINT "AddOnOrder_rentCaseId_fkey" FOREIGN KEY ("rentCaseId") REFERENCES "RentCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AddOnOrder" ADD CONSTRAINT "AddOnOrder_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "GeneratedDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "RegisteredLetter" ADD CONSTRAINT "RegisteredLetter_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "GeneratedDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ESignatureRequest" ADD CONSTRAINT "ESignatureRequest_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "GeneratedDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TenantPortalAccess" ADD CONSTRAINT "TenantPortalAccess_rentCaseId_fkey" FOREIGN KEY ("rentCaseId") REFERENCES "RentCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProfessionalReferral" ADD CONSTRAINT "ProfessionalReferral_rentCaseId_fkey" FOREIGN KEY ("rentCaseId") REFERENCES "RentCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProfessionalReferral" ADD CONSTRAINT "ProfessionalReferral_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "PartnerProfessional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WhiteLabelSetting" ADD CONSTRAINT "WhiteLabelSetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GliLead" ADD CONSTRAINT "GliLead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Referral program
ALTER TABLE "User"
  ADD COLUMN "referralCode" TEXT,
  ADD COLUMN "referredById" TEXT,
  ADD COLUMN "referralCreditMonths" INTEGER NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");
CREATE INDEX "User_referredById_idx" ON "User"("referredById");

ALTER TABLE "User"
  ADD CONSTRAINT "User_referredById_fkey"
  FOREIGN KEY ("referredById") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Team invitations for Gestionnaire / Agence workspaces
CREATE TABLE "WorkspaceInvitation" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "invitedByUserId" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "role" "OrganizationRole" NOT NULL DEFAULT 'MEMBER',
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "acceptedAt" TIMESTAMP(3),
  "acceptedUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "WorkspaceInvitation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WorkspaceInvitation_tokenHash_key" ON "WorkspaceInvitation"("tokenHash");
CREATE INDEX "WorkspaceInvitation_organizationId_idx" ON "WorkspaceInvitation"("organizationId");
CREATE INDEX "WorkspaceInvitation_email_idx" ON "WorkspaceInvitation"("email");
CREATE INDEX "WorkspaceInvitation_invitedByUserId_idx" ON "WorkspaceInvitation"("invitedByUserId");

ALTER TABLE "WorkspaceInvitation"
  ADD CONSTRAINT "WorkspaceInvitation_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WorkspaceInvitation"
  ADD CONSTRAINT "WorkspaceInvitation_invitedByUserId_fkey"
  FOREIGN KEY ("invitedByUserId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WorkspaceInvitation"
  ADD CONSTRAINT "WorkspaceInvitation_acceptedUserId_fkey"
  FOREIGN KEY ("acceptedUserId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Tenant portal payments
CREATE TYPE "TenantPaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'CANCELED');

CREATE TABLE "TenantPayment" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "rentCaseId" TEXT NOT NULL,
  "tenantPortalAccessId" TEXT,
  "amountCents" INTEGER NOT NULL,
  "status" "TenantPaymentStatus" NOT NULL DEFAULT 'PENDING',
  "stripeSessionId" TEXT,
  "stripePaymentIntentId" TEXT,
  "payerEmail" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "paidAt" TIMESTAMP(3),

  CONSTRAINT "TenantPayment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TenantPayment_stripeSessionId_key" ON "TenantPayment"("stripeSessionId");
CREATE INDEX "TenantPayment_userId_idx" ON "TenantPayment"("userId");
CREATE INDEX "TenantPayment_rentCaseId_idx" ON "TenantPayment"("rentCaseId");
CREATE INDEX "TenantPayment_status_idx" ON "TenantPayment"("status");

ALTER TABLE "TenantPayment"
  ADD CONSTRAINT "TenantPayment_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TenantPayment"
  ADD CONSTRAINT "TenantPayment_rentCaseId_fkey"
  FOREIGN KEY ("rentCaseId") REFERENCES "RentCase"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TenantPayment"
  ADD CONSTRAINT "TenantPayment_tenantPortalAccessId_fkey"
  FOREIGN KEY ("tenantPortalAccessId") REFERENCES "TenantPortalAccess"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

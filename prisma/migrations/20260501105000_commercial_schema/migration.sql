ALTER TABLE "User" ALTER COLUMN "plan" DROP DEFAULT;

CREATE TYPE "BillingPlan_new" AS ENUM ('FREE', 'BAILLEUR', 'PREMIUM');

ALTER TABLE "User"
  ALTER COLUMN "plan" TYPE "BillingPlan_new"
  USING (
    CASE
      WHEN "plan"::text = 'STARTER' THEN 'FREE'
      ELSE "plan"::text
    END
  )::"BillingPlan_new";

ALTER TYPE "BillingPlan" RENAME TO "BillingPlan_old";
ALTER TYPE "BillingPlan_new" RENAME TO "BillingPlan";
DROP TYPE "BillingPlan_old";

ALTER TABLE "User" ALTER COLUMN "plan" SET DEFAULT 'FREE';

CREATE TABLE IF NOT EXISTS "EmailLog" (
  "id" TEXT NOT NULL,
  "documentId" TEXT NOT NULL,
  "to" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "resendId" TEXT,
  "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "GeneratedDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

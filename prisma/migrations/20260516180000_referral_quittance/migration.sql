-- Add RENT_RECEIPT to DocumentType enum
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'RENT_RECEIPT';

-- referralCode is already in schema from previous migration; ensure unique index exists
CREATE UNIQUE INDEX IF NOT EXISTS "User_referralCode_key" ON "User"("referralCode");

-- Backfill referral codes for existing users
UPDATE public_user SET "referralCode" = 'REF-' || upper(substring(md5(random()::text), 1, 6)) WHERE "referralCode" IS NULL;

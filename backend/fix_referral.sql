UPDATE public_users SET referral_code = 'REF-' || upper(substring(md5(random()::text), 1, 6)) WHERE referral_code IS NULL;

-- ============================================n-- MIGRATION: 000009_security_lint_fixesn-- Resolves Supabase security/performance lint warningsn-- ============================================

-- 1. Fix search_path on all flagged functions
--    Prevents search_path injection attacks
DO $$
DECLARE
    func record;
BEGIN
    FOR func IN
        SELECT n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public'
        AND p.prokind = 'f'
        AND p.prosecdef = false
        AND p.proconfig IS NULL
        AND p.proname IN (
            'log_activity',
            'update_updated_at_column',
            'generate_referral_code',
            'generate_partnership_code',
            'calculate_garment_earnings',
            'calculate_earnings_with_recoup',
            'create_referral_on_artist_apply',
            'calculate_referral_commission',
            'calculate_garment_pricing',
            'can_garment_go_live',
            'update_production_status',
            'update_updated_at',
            'increment_preset_usage',
            'increment_design_usage',
            'get_artist_mockup_stats',
            'search_mockup_presets',
            'update_fulfillment_partner_timestamp',
            'update_timestamp'
        )
    LOOP
        EXECUTE format('ALTER FUNCTION %I.%I(%s) SET search_path = ''public'';', func.nspname, func.proname, func.args);
    END LOOP;
END $$;

-- 2. Revoke public EXECUTE on SECURITY DEFINER log_activity function
--    It should only be called internally or by service role
REVOKE EXECUTE ON FUNCTION public.log_activity(UUID, TEXT, TEXT, TEXT, JSONB) FROM anon, authenticated;

-- 3. Fix overly permissive RLS policies on referrals/referral_earnings
--    INSERT on referrals is restricted to the referred artist themselves
--    UPDATE/INSERT on referral tables is restricted to service role (false)

-- referrals: users can only create their own referral record
DROP POLICY IF EXISTS "System can create referrals" ON referrals;
CREATE POLICY "Users can create their own referral record" ON referrals
    FOR INSERT WITH CHECK (auth.uid() = referred_artist_id);

-- referrals: updates only via service role (backend webhook)
DROP POLICY IF EXISTS "System can update referrals" ON referrals;
CREATE POLICY "Service role can update referrals" ON referrals
    FOR UPDATE USING (false);

-- referral_earnings: inserts only via service role (backend webhook)
DROP POLICY IF EXISTS "System can create referral earnings" ON referral_earnings;
CREATE POLICY "Service role can create referral earnings" ON referral_earnings
    FOR INSERT WITH CHECK (false);

-- referral_earnings: updates only via service role (backend webhook)
DROP POLICY IF EXISTS "System can update referral earnings" ON referral_earnings;
CREATE POLICY "Service role can update referral earnings" ON referral_earnings
    FOR UPDATE USING (false);

-- 4. Fix public storage bucket listing
--    Public buckets don't need a broad SELECT policy for URL access
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;

-- 5. Move pg_trgm extension out of public schema
--    Safe because ALTER EXTENSION updates internal catalog references
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm' AND extnamespace = 'public'::regnamespace) THEN
        CREATE SCHEMA IF NOT EXISTS extensions;
        ALTER EXTENSION pg_trgm SET SCHEMA extensions;
    END IF;
END $$;

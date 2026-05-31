-- Fix remaining log_activity warnings

-- 1. Set search_path (excluded from dynamic block because it's SECURITY DEFINER)
ALTER FUNCTION public.log_activity(UUID, TEXT, TEXT, TEXT, JSONB) SET search_path = 'public';

-- 2. Revoke EXECUTE from public (which cascades to anon/authenticated)
REVOKE EXECUTE ON FUNCTION public.log_activity(UUID, TEXT, TEXT, TEXT, JSONB) FROM public;

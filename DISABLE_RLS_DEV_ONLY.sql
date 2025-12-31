-- ============================================
-- DEVELOPMENT ONLY: Disable RLS temporarily
-- ⚠️ DO NOT USE IN PRODUCTION
-- ============================================

-- This completely disables RLS on communication_templates
-- Use this ONLY if you're using the bypass login (admin/superadmin)
-- and just want to test the app quickly

ALTER TABLE public.communication_templates DISABLE ROW LEVEL SECURITY;

-- To re-enable RLS later, run:
-- ALTER TABLE public.communication_templates ENABLE ROW LEVEL SECURITY;
-- Then run RUN_THIS_NOW.sql to add proper policies


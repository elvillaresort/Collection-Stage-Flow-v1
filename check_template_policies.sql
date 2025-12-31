-- Check current RLS policies on communication_templates table
-- Run this to see what policies currently exist

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'communication_templates'
ORDER BY policyname;


-- Script d'application pour corriger les erreurs API Supabase
-- À exécuter dans le SQL Editor de Supabase Dashboard
-- OU via: psql -h db.xxx.supabase.co -U postgres -d postgres -f apply_rls_fix.sql

-- Ce script applique la migration: 20251107000001_fix_rls_policies_complete.sql

\i migrations/20251107000001_fix_rls_policies_complete.sql

-- Vérification post-migration
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
WHERE tablename IN ('registration_requests', 'users', 'mini_sites', 'time_slots', 'news_articles', 'exhibitors', 'products', 'partners')
ORDER BY tablename, policyname;

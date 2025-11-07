-- Script d'application pour corriger les erreurs API Supabase
-- À exécuter dans le SQL Editor de Supabase Dashboard
-- OU via: psql -h db.xxx.supabase.co -U postgres -d postgres -f apply_rls_fix.sql

-- VERSION 2.0 - Inclut création des tables manquantes

-- Ce script applique la migration complète: 20251107000002_complete_fix_with_tables.sql
-- Il crée les tables manquantes ET applique les politiques RLS

\i migrations/20251107000002_complete_fix_with_tables.sql

-- Vérification que les tables existent
SELECT
    table_name,
    CASE
      WHEN table_type = 'BASE TABLE' THEN '✅ Table exists'
      ELSE '❌ Missing'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('registration_requests', 'users', 'mini_sites', 'time_slots', 'news_articles', 'exhibitors', 'products', 'partners')
ORDER BY table_name;

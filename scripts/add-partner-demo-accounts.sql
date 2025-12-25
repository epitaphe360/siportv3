-- =====================================================
-- SCRIPT POUR AJOUTER LES COMPTES PARTENAIRES DE DÉMO
-- À exécuter dans Supabase SQL Editor
-- =====================================================
--
-- ÉTAPE 1: Créer les comptes dans Supabase Auth Dashboard
-- =========================================================
-- 1. Aller dans Supabase Dashboard > Authentication > Users
-- 2. Cliquer sur "Add user" > "Create new user"
-- 3. Créer chaque compte avec:
--    - Email: voir liste ci-dessous
--    - Password: Test@123456
--    - Auto Confirm User: ✓ (coché)
--
-- COMPTES PARTENAIRES À CRÉER:
--    partner-museum@test.siport.com    (🏛️ Musée - $20,000)
--    partner-silver@test.siport.com    (🥈 Silver - $48,000)
--    partner-gold@test.siport.com      (🥇 Gold - $68,000)
--    partner-platinium@test.siport.com (💎 Platinium - $98,000)
--
-- ÉTAPE 2: Exécuter ce script SQL
-- =========================================================

-- =====================================================
-- Mise à jour des utilisateurs partenaires
-- =====================================================

-- Partenaire Musée (🏛️)
UPDATE public.users SET
  name = 'Partenaire Musée Demo',
  role = 'partner',
  type = 'partner',
  partner_tier = 'museum',
  status = 'active',
  is_active = true
WHERE email = 'partner-museum@test.siport.com';

-- Partenaire Silver (🥈)
UPDATE public.users SET
  name = 'Partenaire Silver Demo',
  role = 'partner',
  type = 'partner',
  partner_tier = 'silver',
  status = 'active',
  is_active = true
WHERE email = 'partner-silver@test.siport.com';

-- Partenaire Gold (🥇)
UPDATE public.users SET
  name = 'Partenaire Gold Demo',
  role = 'partner',
  type = 'partner',
  partner_tier = 'gold',
  status = 'active',
  is_active = true
WHERE email = 'partner-gold@test.siport.com';

-- Partenaire Platinium (💎)
UPDATE public.users SET
  name = 'Partenaire Platinium Demo',
  role = 'partner',
  type = 'partner',
  partner_tier = 'platinium',
  status = 'active',
  is_active = true
WHERE email = 'partner-platinium@test.siport.com';

-- =====================================================
-- Création des profils partenaires
-- =====================================================

-- Partenaire Musée
INSERT INTO public.partner_profiles (user_id, company_name, contact_name, contact_email, contact_phone, description, website, country, partnership_level)
SELECT
  id,
  'Musée Maritime du Maroc',
  'Hassan Alami',
  'partner-museum@test.siport.com',
  '+212 5 22 00 00 01',
  'Musée national dédié à l''histoire maritime du Maroc, présentant des collections uniques d''instruments de navigation et de maquettes de navires.',
  'https://musee-maritime.ma',
  'Maroc',
  'museum'
FROM public.users WHERE email = 'partner-museum@test.siport.com'
ON CONFLICT (user_id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  contact_name = EXCLUDED.contact_name,
  contact_email = EXCLUDED.contact_email,
  contact_phone = EXCLUDED.contact_phone,
  description = EXCLUDED.description,
  website = EXCLUDED.website,
  country = EXCLUDED.country,
  partnership_level = EXCLUDED.partnership_level;

-- Partenaire Silver
INSERT INTO public.partner_profiles (user_id, company_name, contact_name, contact_email, contact_phone, description, website, country, partnership_level)
SELECT
  id,
  'Port Solutions Maroc',
  'Fatima Bennani',
  'partner-silver@test.siport.com',
  '+212 5 22 00 00 02',
  'Leader marocain des solutions portuaires innovantes, spécialisé dans l''optimisation des opérations de manutention.',
  'https://portsolutions.ma',
  'Maroc',
  'silver'
FROM public.users WHERE email = 'partner-silver@test.siport.com'
ON CONFLICT (user_id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  contact_name = EXCLUDED.contact_name,
  contact_email = EXCLUDED.contact_email,
  contact_phone = EXCLUDED.contact_phone,
  description = EXCLUDED.description,
  website = EXCLUDED.website,
  country = EXCLUDED.country,
  partnership_level = EXCLUDED.partnership_level;

-- Partenaire Gold
INSERT INTO public.partner_profiles (user_id, company_name, contact_name, contact_email, contact_phone, description, website, country, partnership_level)
SELECT
  id,
  'Tanger Med Logistics',
  'Ahmed El Fassi',
  'partner-gold@test.siport.com',
  '+212 5 39 00 00 03',
  'Partenaire logistique premium du port de Tanger Med, offrant des services de stockage et de distribution internationaux.',
  'https://tangermedlogistics.ma',
  'Maroc',
  'gold'
FROM public.users WHERE email = 'partner-gold@test.siport.com'
ON CONFLICT (user_id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  contact_name = EXCLUDED.contact_name,
  contact_email = EXCLUDED.contact_email,
  contact_phone = EXCLUDED.contact_phone,
  description = EXCLUDED.description,
  website = EXCLUDED.website,
  country = EXCLUDED.country,
  partnership_level = EXCLUDED.partnership_level;

-- Partenaire Platinium
INSERT INTO public.partner_profiles (user_id, company_name, contact_name, contact_email, contact_phone, description, website, country, partnership_level)
SELECT
  id,
  'Royal Maritime Group',
  'Youssef Tazi',
  'partner-platinium@test.siport.com',
  '+212 5 22 00 00 04',
  'Groupe maritime d''excellence, sponsor principal de SIPORTS 2026. Leader dans le transport maritime et les services portuaires en Afrique.',
  'https://royalmaritime.ma',
  'Maroc',
  'platinium'
FROM public.users WHERE email = 'partner-platinium@test.siport.com'
ON CONFLICT (user_id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  contact_name = EXCLUDED.contact_name,
  contact_email = EXCLUDED.contact_email,
  contact_phone = EXCLUDED.contact_phone,
  description = EXCLUDED.description,
  website = EXCLUDED.website,
  country = EXCLUDED.country,
  partnership_level = EXCLUDED.partnership_level;

-- =====================================================
-- Vérification
-- =====================================================

SELECT
  u.email,
  u.name,
  u.role,
  u.type,
  u.partner_tier,
  u.status,
  u.is_active,
  pp.company_name,
  pp.partnership_level
FROM public.users u
LEFT JOIN public.partner_profiles pp ON pp.user_id = u.id
WHERE u.type = 'partner'
ORDER BY u.partner_tier;

-- =====================================================
-- RÉSUMÉ DES COMPTES PARTENAIRES
-- =====================================================
--
-- 🏛️ Musée ($20,000):
--    Email: partner-museum@test.siport.com
--    Password: Test@123456
--    Quotas: 20 RDV, 5 events, 10 média, 3 team members
--
-- 🥈 Silver ($48,000):
--    Email: partner-silver@test.siport.com
--    Password: Test@123456
--    Quotas: 50 RDV, 10 events, 30 média, 5 team members
--
-- 🥇 Gold ($68,000):
--    Email: partner-gold@test.siport.com
--    Password: Test@123456
--    Quotas: 100 RDV, 20 events, 75 média, 10 team members
--
-- 💎 Platinium ($98,000):
--    Email: partner-platinium@test.siport.com
--    Password: Test@123456
--    Quotas: ILLIMITÉ RDV, events, 200 média, 20 team members
-- =====================================================

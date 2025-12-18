-- ========================================
-- DONNÉES DE TEST SIPORT 2026
-- ========================================
-- Créer des comptes de test pour chaque type de dashboard
-- Password pour tous les comptes: Test@123456
-- ========================================

-- Nettoyer les données de test existantes (seulement les emails de test)
DELETE FROM leads WHERE scanner_id IN (
  SELECT id FROM users WHERE email LIKE '%@test.siport.com'
);
DELETE FROM quota_usage WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE '%@test.siport.com'
);
DELETE FROM user_upgrades WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE '%@test.siport.com'
);
DELETE FROM user_badges WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE '%@test.siport.com'
);
DELETE FROM exhibitor_profiles WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE '%@test.siport.com'
);
DELETE FROM partner_profiles WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE '%@test.siport.com'
);
DELETE FROM visitor_profiles WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE '%@test.siport.com'
);
DELETE FROM users WHERE email LIKE '%@test.siport.com';

-- ========================================
-- 1. VISITEURS (2 comptes: FREE + VIP)
-- ========================================

-- Visiteur FREE (0 rendez-vous, badge only)
INSERT INTO users (
  id,
  email,
  role,
  type,
  visitor_level,
  is_active,
  email_verified,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'visitor-free@test.siport.com',
  'visitor',
  'visitor',
  'free',
  true,
  true,
  now()
);

INSERT INTO visitor_profiles (
  user_id,
  first_name,
  last_name,
  company,
  position,
  phone,
  country,
  visitor_type,
  pass_type,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Jean',
  'Dupont',
  'Tech Solutions Inc',
  'Directeur Technique',
  '+33612345678',
  'France',
  'company',
  'free',
  now()
);

-- Visiteur VIP (10 rendez-vous actifs)
INSERT INTO users (
  id,
  email,
  role,
  type,
  visitor_level,
  is_active,
  email_verified,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000002',
  'visitor-vip@test.siport.com',
  'visitor',
  'visitor',
  'premium',
  true,
  true,
  now()
);

INSERT INTO visitor_profiles (
  user_id,
  first_name,
  last_name,
  company,
  position,
  phone,
  country,
  visitor_type,
  pass_type,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000002',
  'Marie',
  'Martin',
  'Global Maritime Group',
  'CEO',
  '+33687654321',
  'France',
  'company',
  'vip',
  now()
);

-- Historique upgrade VIP
INSERT INTO user_upgrades (
  user_id,
  user_type,
  previous_level,
  new_level,
  payment_amount,
  payment_currency,
  payment_method,
  payment_transaction_id,
  upgraded_at
) VALUES (
  'a0000000-0000-0000-0000-000000000002',
  'visitor',
  'free',
  'premium',
  700,
  'EUR',
  'stripe',
  'test_ch_visitor_vip_001',
  now()
);

-- Quota usage pour VIP (3 RDV utilisés sur 10)
INSERT INTO quota_usage (
  user_id,
  quota_type,
  current_usage,
  period,
  reset_at
) VALUES (
  'a0000000-0000-0000-0000-000000000002',
  'appointments',
  3,
  'lifetime',
  NULL
);

-- ========================================
-- 2. PARTENAIRES (4 comptes: Museum, Silver, Gold, Platinium)
-- ========================================

-- Partner Museum ($20k)
INSERT INTO users (
  id,
  email,
  role,
  type,
  partner_tier,
  is_active,
  email_verified,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000003',
  'partner-museum@test.siport.com',
  'partner',
  'partner',
  'museum',
  true,
  true,
  now()
);

INSERT INTO partner_profiles (
  user_id,
  company_name,
  contact_name,
  contact_email,
  contact_phone,
  description,
  logo_url,
  website,
  country,
  partnership_level,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000003',
  'Maritime Museum Foundation',
  'Pierre Leclerc',
  'contact@museumfoundation.org',
  '+33145678901',
  'Fondation dédiée à la préservation du patrimoine maritime mondial',
  'https://via.placeholder.com/200x200?text=Museum',
  'https://museumfoundation.org',
  'France',
  'museum',
  now()
);

-- Quota Museum (5 RDV sur 20)
INSERT INTO quota_usage (
  user_id,
  quota_type,
  current_usage,
  period,
  reset_at
) VALUES (
  'a0000000-0000-0000-0000-000000000003',
  'appointments',
  5,
  'monthly',
  date_trunc('month', now()) + interval '1 month'
);

-- Partner Silver ($48k)
INSERT INTO users (
  id,
  email,
  role,
  type,
  partner_tier,
  is_active,
  email_verified,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000004',
  'partner-silver@test.siport.com',
  'partner',
  'partner',
  'silver',
  true,
  true,
  now()
);

INSERT INTO partner_profiles (
  user_id,
  company_name,
  contact_name,
  contact_email,
  contact_phone,
  description,
  logo_url,
  website,
  country,
  partnership_level,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000004',
  'Port Tech Solutions',
  'Ahmed Benali',
  'contact@porttechsolutions.ma',
  '+212661234567',
  'Solutions technologiques pour ports et terminaux maritimes',
  'https://via.placeholder.com/200x200?text=Silver',
  'https://porttechsolutions.ma',
  'Morocco',
  'silver',
  now()
);

-- Quota Silver (15 RDV sur 50)
INSERT INTO quota_usage (
  user_id,
  quota_type,
  current_usage,
  period,
  reset_at
) VALUES (
  'a0000000-0000-0000-0000-000000000004',
  'appointments',
  15,
  'monthly',
  date_trunc('month', now()) + interval '1 month'
);

-- Partner Gold ($68k)
INSERT INTO users (
  id,
  email,
  role,
  type,
  partner_tier,
  is_active,
  email_verified,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000005',
  'partner-gold@test.siport.com',
  'partner',
  'partner',
  'gold',
  true,
  true,
  now()
);

INSERT INTO partner_profiles (
  user_id,
  company_name,
  contact_name,
  contact_email,
  contact_phone,
  description,
  logo_url,
  website,
  country,
  partnership_level,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000005',
  'Global Shipping Alliance',
  'Carlos Rodriguez',
  'contact@globalshipping.com',
  '+34912345678',
  'Alliance internationale de compagnies maritimes et portuaires',
  'https://via.placeholder.com/200x200?text=Gold',
  'https://globalshipping.com',
  'Spain',
  'gold',
  now()
);

-- Quota Gold (45 RDV sur 100)
INSERT INTO quota_usage (
  user_id,
  quota_type,
  current_usage,
  period,
  reset_at
) VALUES (
  'a0000000-0000-0000-0000-000000000005',
  'appointments',
  45,
  'monthly',
  date_trunc('month', now()) + interval '1 month'
);

-- Partner Platinium ($98k - Illimité)
INSERT INTO users (
  id,
  email,
  role,
  type,
  partner_tier,
  is_active,
  email_verified,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000006',
  'partner-platinium@test.siport.com',
  'partner',
  'partner',
  'platinium',
  true,
  true,
  now()
);

INSERT INTO partner_profiles (
  user_id,
  company_name,
  contact_name,
  contact_email,
  contact_phone,
  description,
  logo_url,
  website,
  country,
  partnership_level,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000006',
  'Maersk International',
  'Henrik Nielsen',
  'contact@maersk.com',
  '+4533633333',
  'Leader mondial du transport maritime et de la logistique',
  'https://via.placeholder.com/200x200?text=Platinium',
  'https://maersk.com',
  'Denmark',
  'platinium',
  now()
);

-- Quota Platinium (250 RDV - Illimité)
INSERT INTO quota_usage (
  user_id,
  quota_type,
  current_usage,
  period,
  reset_at
) VALUES (
  'a0000000-0000-0000-0000-000000000006',
  'appointments',
  250,
  'monthly',
  date_trunc('month', now()) + interval '1 month'
);

-- ========================================
-- 3. EXPOSANTS (4 comptes: 9m², 18m², 36m², 54m²+)
-- ========================================

-- Exposant 9m² Basic
INSERT INTO users (
  id,
  email,
  role,
  type,
  is_active,
  email_verified,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000007',
  'exhibitor-9m@test.siport.com',
  'exhibitor',
  'exhibitor',
  true,
  true,
  now()
);

INSERT INTO exhibitor_profiles (
  user_id,
  company_name,
  first_name,
  last_name,
  email,
  phone,
  description,
  logo_url,
  website,
  country,
  sector,
  category,
  stand_number,
  stand_area,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000007',
  'StartUp Port Innovations',
  'Thomas',
  'Dubois',
  'contact@startupportinno.com',
  '+33678901234',
  'Startup innovante en solutions IoT pour ports intelligents',
  'https://via.placeholder.com/200x200?text=9m2',
  'https://startupportinno.com',
  'France',
  'Technology',
  'startup',
  'A1-001',
  9.0,
  now()
);

-- Quota 9m² (7 RDV sur 15)
INSERT INTO quota_usage (
  user_id,
  quota_type,
  current_usage,
  period,
  reset_at
) VALUES (
  'a0000000-0000-0000-0000-000000000007',
  'appointments',
  7,
  'lifetime',
  NULL
);

-- Exposant 18m² Standard
INSERT INTO users (
  id,
  email,
  role,
  type,
  is_active,
  email_verified,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000008',
  'exhibitor-18m@test.siport.com',
  'exhibitor',
  'exhibitor',
  true,
  true,
  now()
);

INSERT INTO exhibitor_profiles (
  user_id,
  company_name,
  first_name,
  last_name,
  email,
  phone,
  description,
  logo_url,
  website,
  country,
  sector,
  category,
  stand_number,
  stand_area,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000008',
  'Maritime Equipment Co',
  'Sophie',
  'Lefebvre',
  'contact@maritimeequip.fr',
  '+33656789012',
  'Fabricant d''équipements maritimes et portuaires de qualité',
  'https://via.placeholder.com/200x200?text=18m2',
  'https://maritimeequip.fr',
  'France',
  'Equipment',
  'equipment',
  'B2-015',
  18.0,
  now()
);

-- Quota 18m² (22 RDV sur 40)
INSERT INTO quota_usage (
  user_id,
  quota_type,
  current_usage,
  period,
  reset_at
) VALUES (
  'a0000000-0000-0000-0000-000000000008',
  'appointments',
  22,
  'lifetime',
  NULL
);

-- Exposant 36m² Premium
INSERT INTO users (
  id,
  email,
  role,
  type,
  is_active,
  email_verified,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000009',
  'exhibitor-36m@test.siport.com',
  'exhibitor',
  'exhibitor',
  true,
  true,
  now()
);

INSERT INTO exhibitor_profiles (
  user_id,
  company_name,
  first_name,
  last_name,
  email,
  phone,
  description,
  logo_url,
  website,
  country,
  sector,
  category,
  stand_number,
  stand_area,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000009',
  'Advanced Port Systems',
  'David',
  'Chen',
  'contact@advancedportsys.cn',
  '+8613800138000',
  'Systèmes automatisés et IA pour optimisation portuaire',
  'https://via.placeholder.com/200x200?text=36m2',
  'https://advancedportsys.cn',
  'China',
  'Technology',
  'automation',
  'C3-027',
  36.0,
  now()
);

-- Quota 36m² (58 RDV sur 100)
INSERT INTO quota_usage (
  user_id,
  quota_type,
  current_usage,
  period,
  reset_at
) VALUES (
  'a0000000-0000-0000-0000-000000000009',
  'appointments',
  58,
  'lifetime',
  NULL
);

-- Exposant 54m²+ Elite (Illimité)
INSERT INTO users (
  id,
  email,
  role,
  type,
  is_active,
  email_verified,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000010',
  'exhibitor-54m@test.siport.com',
  'exhibitor',
  'exhibitor',
  true,
  true,
  now()
);

INSERT INTO exhibitor_profiles (
  user_id,
  company_name,
  first_name,
  last_name,
  email,
  phone,
  description,
  logo_url,
  website,
  country,
  sector,
  category,
  stand_number,
  stand_area,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000010',
  'ABB Marine & Ports',
  'Lars',
  'Svensson',
  'contact@abb.com',
  '+46102424000',
  'Leader mondial en automatisation et électrification marine',
  'https://via.placeholder.com/200x200?text=60m2',
  'https://abb.com',
  'Sweden',
  'Technology',
  'major_brand',
  'D4-050',
  60.0,
  now()
);

-- Quota 54m²+ (350 RDV - Illimité)
INSERT INTO quota_usage (
  user_id,
  quota_type,
  current_usage,
  period,
  reset_at
) VALUES (
  'a0000000-0000-0000-0000-000000000010',
  'appointments',
  350,
  'lifetime',
  NULL
);

-- ========================================
-- 4. BADGES POUR TOUS LES COMPTES
-- ========================================

-- Les badges seront auto-générés par le trigger après insertion des users

-- ========================================
-- RÉSUMÉ DES COMPTES CRÉÉS
-- ========================================

-- Afficher le résumé
DO $$
BEGIN
  RAISE NOTICE '
========================================
✅ COMPTES DE TEST CRÉÉS AVEC SUCCÈS
========================================

📧 VISITEURS:
  - visitor-free@test.siport.com (FREE - 0 RDV)
  - visitor-vip@test.siport.com (VIP - 10 RDV, 3 utilisés)

🤝 PARTENAIRES:
  - partner-museum@test.siport.com (Museum $20k - 20 RDV, 5 utilisés)
  - partner-silver@test.siport.com (Silver $48k - 50 RDV, 15 utilisés)
  - partner-gold@test.siport.com (Gold $68k - 100 RDV, 45 utilisés)
  - partner-platinium@test.siport.com (Platinium $98k - Illimité, 250 utilisés)

🏢 EXPOSANTS:
  - exhibitor-9m@test.siport.com (9m² Basic - 15 RDV, 7 utilisés)
  - exhibitor-18m@test.siport.com (18m² Standard - 40 RDV, 22 utilisés)
  - exhibitor-36m@test.siport.com (36m² Premium - 100 RDV, 58 utilisés)
  - exhibitor-54m@test.siport.com (60m² Elite - Illimité, 350 utilisés)

🔑 Mot de passe pour tous: Test@123456

========================================
';
END $$;

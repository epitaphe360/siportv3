-- ========================================
-- DONNÉES DE TEST SIPORT 2026
-- ========================================
-- Créer des comptes de test pour chaque type de dashboard
-- Password pour tous les comptes: Test@123456
-- ========================================
-- IMPORTANT: Ce fichier nécessite que TOUTES les migrations soient appliquées avant exécution
-- Exécuter: supabase db push
-- ========================================

-- Temporarily disable triggers that might cause errors during seed
-- These triggers try to auto-generate badges but reference tables that might not exist
DO $$
BEGIN
  -- Disable badge auto-generation triggers if they exist
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_auto_generate_badge_on_insert') THEN
    ALTER TABLE users DISABLE TRIGGER trigger_auto_generate_badge_on_insert;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_auto_generate_badge_on_update') THEN
    ALTER TABLE users DISABLE TRIGGER trigger_auto_generate_badge_on_update;
  END IF;

  RAISE NOTICE 'Triggers temporairement désactivés pour le seed';
END $$;

-- Nettoyer les données de test existantes (seulement les emails de test)
-- Utiliser DO block pour gérer les tables qui n'existent pas encore
DO $$
BEGIN
  -- Nettoyer leads si la table existe
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'leads') THEN
    DELETE FROM leads WHERE scanner_id IN (
      SELECT id FROM users WHERE email LIKE '%@test.siport.com'
    );
  END IF;

  -- Nettoyer quota_usage si la table existe
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'quota_usage') THEN
    DELETE FROM quota_usage WHERE user_id IN (
      SELECT id FROM users WHERE email LIKE '%@test.siport.com'
    );
  END IF;

  -- Nettoyer user_upgrades si la table existe
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_upgrades') THEN
    DELETE FROM user_upgrades WHERE user_id IN (
      SELECT id FROM users WHERE email LIKE '%@test.siport.com'
    );
  END IF;

  -- Nettoyer user_badges si la table existe
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_badges') THEN
    DELETE FROM user_badges WHERE user_id IN (
      SELECT id FROM users WHERE email LIKE '%@test.siport.com'
    );
  END IF;

  -- Nettoyer exhibitor_profiles
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'exhibitor_profiles') THEN
    DELETE FROM exhibitor_profiles WHERE user_id IN (
      SELECT id FROM users WHERE email LIKE '%@test.siport.com'
    );
  END IF;

  -- Nettoyer partner_profiles
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'partner_profiles') THEN
    DELETE FROM partner_profiles WHERE user_id IN (
      SELECT id FROM users WHERE email LIKE '%@test.siport.com'
    );
  END IF;

  -- Nettoyer visitor_profiles
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'visitor_profiles') THEN
    DELETE FROM visitor_profiles WHERE user_id IN (
      SELECT id FROM users WHERE email LIKE '%@test.siport.com'
    );
  END IF;

  -- Nettoyer users
  DELETE FROM users WHERE email LIKE '%@test.siport.com';

  RAISE NOTICE 'Nettoyage des données de test terminé';
END $$;

-- ========================================
-- 1. VISITEURS (2 comptes: FREE + VIP)
-- ========================================

-- Visiteur FREE (0 rendez-vous, badge only)
INSERT INTO users (
  id,
  email,
  name,
  type,
  visitor_level,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'visitor-free@test.siport.com',
  'Jean Dupont',
  'visitor',
  'free',
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
  name,
  type,
  visitor_level,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000002',
  'visitor-vip@test.siport.com',
  'Marie Martin',
  'visitor',
  'premium',
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

-- Historique upgrade VIP (seulement si la table existe)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_upgrades') THEN
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
  END IF;
END $$;

-- Quota usage pour VIP (3 RDV utilisés sur 10)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'quota_usage') THEN
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
  END IF;
END $$;

-- ========================================
-- 2. PARTENAIRES (4 comptes: Museum, Silver, Gold, Platinium)
-- ========================================

-- Partner Museum ($20k)
INSERT INTO users (
  id,
  email,
  name,
  type,
  partner_tier,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000003',
  'partner-museum@test.siport.com',
  'Pierre Leclerc',
  'partner',
  'museum',
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
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%238b5cf6" width="200" height="200"/%3E%3Ctext fill="%23fff" font-family="Arial" font-size="20" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EMuseum%3C/text%3E%3C/svg%3E',
  'https://museumfoundation.org',
  'France',
  'museum',
  now()
);

-- Quota Museum (5 RDV sur 20)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'quota_usage') THEN
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
  END IF;
END $$;

-- Partner Silver ($48k)
INSERT INTO users (
  id,
  email,
  name,
  type,
  partner_tier,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000004',
  'partner-silver@test.siport.com',
  'Ahmed Benali',
  'partner',
  'silver',
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
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23c0c0c0" width="200" height="200"/%3E%3Ctext fill="%23fff" font-family="Arial" font-size="20" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ESilver%3C/text%3E%3C/svg%3E',
  'https://porttechsolutions.ma',
  'Morocco',
  'silver',
  now()
);

-- Quota Silver (15 RDV sur 50)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'quota_usage') THEN
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
  END IF;
END $$;

-- Partner Gold ($68k)
INSERT INTO users (
  id,
  email,
  name,
  type,
  partner_tier,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000005',
  'partner-gold@test.siport.com',
  'Carlos Rodriguez',
  'partner',
  'gold',
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
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ffd700" width="200" height="200"/%3E%3Ctext fill="%23fff" font-family="Arial" font-size="20" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EGold%3C/text%3E%3C/svg%3E',
  'https://globalshipping.com',
  'Spain',
  'gold',
  now()
);

-- Quota Gold (45 RDV sur 100)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'quota_usage') THEN
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
  END IF;
END $$;

-- Partner Platinium ($98k - Illimité)
INSERT INTO users (
  id,
  email,
  name,
  type,
  partner_tier,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000006',
  'partner-platinium@test.siport.com',
  'Henrik Nielsen',
  'partner',
  'platinium',
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
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e5e4e2" width="200" height="200"/%3E%3Ctext fill="%23333" font-family="Arial" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EPlatinum%3C/text%3E%3C/svg%3E',
  'https://maersk.com',
  'Denmark',
  'platinium',
  now()
);

-- Quota Platinium (250 RDV - Illimité)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'quota_usage') THEN
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
  END IF;
END $$;

-- ========================================
-- 3. EXPOSANTS (4 comptes: 9m², 18m², 36m², 54m²+)
-- ========================================

-- Exposant 9m² Basic
INSERT INTO users (
  id,
  email,
  name,
  type,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000007',
  'exhibitor-9m@test.siport.com',
  'Thomas Dubois',
  'exhibitor',
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
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%233b82f6" width="200" height="200"/%3E%3Ctext fill="%23fff" font-family="Arial" font-size="20" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E9m%C2%B2%3C/text%3E%3C/svg%3E',
  'https://startupportinno.com',
  'France',
  'Technology',
  'startup',
  'A1-001',
  9.0,
  now()
);

-- Quota 9m² (7 RDV sur 15)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'quota_usage') THEN
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
  END IF;
END $$;

-- Exposant 18m² Standard
INSERT INTO users (
  id,
  email,
  name,
  type,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000008',
  'exhibitor-18m@test.siport.com',
  'Sophie Lefebvre',
  'exhibitor',
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
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%2310b981" width="200" height="200"/%3E%3Ctext fill="%23fff" font-family="Arial" font-size="20" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E18m²%3C/text%3E%3C/svg%3E',
  'https://maritimeequip.fr',
  'France',
  'Equipment',
  'equipment',
  'B2-015',
  18.0,
  now()
);

-- Quota 18m² (22 RDV sur 40)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'quota_usage') THEN
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
  END IF;
END $$;

-- Exposant 36m² Premium
INSERT INTO users (
  id,
  email,
  name,
  type,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000009',
  'exhibitor-36m@test.siport.com',
  'David Chen',
  'exhibitor',
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
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f59e0b" width="200" height="200"/%3E%3Ctext fill="%23fff" font-family="Arial" font-size="20" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E36m²%3C/text%3E%3C/svg%3E',
  'https://advancedportsys.cn',
  'China',
  'Technology',
  'automation',
  'C3-027',
  36.0,
  now()
);

-- Quota 36m² (58 RDV sur 100)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'quota_usage') THEN
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
  END IF;
END $$;

-- Exposant 54m²+ Elite (Illimité)
INSERT INTO users (
  id,
  email,
  name,
  type,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000010',
  'exhibitor-54m@test.siport.com',
  'Lars Svensson',
  'exhibitor',
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
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ef4444" width="200" height="200"/%3E%3Ctext fill="%23fff" font-family="Arial" font-size="20" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E60m²%3C/text%3E%3C/svg%3E',
  'https://abb.com',
  'Sweden',
  'Technology',
  'major_brand',
  'D4-050',
  60.0,
  now()
);

-- Quota 54m²+ (350 RDV - Illimité)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'quota_usage') THEN
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
  END IF;
END $$;

-- ========================================
-- 4. BADGES POUR TOUS LES COMPTES
-- ========================================

-- Les badges seront auto-générés par le trigger après insertion des users
-- Si le trigger n'est pas activé, créer manuellement les badges ici

-- ========================================
-- RÉSUMÉ DES COMPTES CRÉÉS
-- ========================================

-- Re-enable triggers that were disabled at the start
DO $$
BEGIN
  -- Re-enable badge auto-generation triggers if they exist
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_auto_generate_badge_on_insert') THEN
    ALTER TABLE users ENABLE TRIGGER trigger_auto_generate_badge_on_insert;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_auto_generate_badge_on_update') THEN
    ALTER TABLE users ENABLE TRIGGER trigger_auto_generate_badge_on_update;
  END IF;

  RAISE NOTICE 'Triggers ré-activés';
END $$;

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

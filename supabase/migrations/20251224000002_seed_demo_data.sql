/*
  # Seed Demo Data for Presentation
  
  This migration populates all tables with realistic demo data:
  - Users (admin, exhibitors, partners, visitors)
  - Exhibitors & Partners profiles
  - Visitor profiles
  - Events
  - News articles
  - Appointments & Time slots
  - Connections
  - Messages
  - Pavilions
*/

-- Recréer les tables de profils avec la bonne structure (nécessaires pour le trigger)
DROP TABLE IF EXISTS public.exhibitor_profiles CASCADE;
CREATE TABLE public.exhibitor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  company_name text,
  first_name text,
  last_name text,
  email text,
  phone text,
  description text,
  logo_url text,
  website text,
  country text,
  sector text,
  category text,
  stand_number text,
  stand_area numeric DEFAULT 9.0 CHECK (stand_area > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_exhibitor_profiles_user_id ON public.exhibitor_profiles(user_id);

DROP TABLE IF EXISTS public.partner_profiles CASCADE;
CREATE TABLE public.partner_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  company_name text,
  contact_name text,
  contact_email text,
  contact_phone text,
  description text,
  logo_url text,
  website text,
  country text,
  partnership_level text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_partner_profiles_user_id ON public.partner_profiles(user_id);

-- Ajouter la colonne stand_number à exhibitors si elle n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'exhibitors' 
    AND column_name = 'stand_number'
  ) THEN
    ALTER TABLE public.exhibitors ADD COLUMN stand_number text;
  END IF;
END $$;

-- Créer la table pavilions si elle n'existe pas
CREATE TABLE IF NOT EXISTS pavilions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE,
  description text NOT NULL,
  color text DEFAULT '#3b82f6',
  icon text DEFAULT 'Anchor',
  order_index integer DEFAULT 0,
  featured boolean DEFAULT false,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Créer le type event_type si il n'existe pas
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_type') THEN
    CREATE TYPE event_type AS ENUM ('conference', 'workshop', 'networking', 'exhibition');
  END IF;
END $$;

-- Note: ALTER TYPE ADD VALUE ne peut pas être utilisé dans la même transaction
-- Les valeurs doivent déjà exister dans l'enum ou on utilise des valeurs texte

-- Créer la table events si elle n'existe pas
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  event_type event_type NOT NULL DEFAULT 'conference',
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  location text,
  pavilion_id uuid,
  organizer_id uuid REFERENCES users(id),
  capacity integer,
  registered integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  image_url text,
  registration_url text,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ajouter la colonne event_type à events si elle n'existe pas
DO $$ 
BEGIN
  -- event_type
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'event_type') THEN
    ALTER TABLE public.events ADD COLUMN event_type text DEFAULT 'conference';
  END IF;
  -- start_date
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'start_date') THEN
    ALTER TABLE public.events ADD COLUMN start_date timestamptz DEFAULT now();
  END IF;
  -- end_date
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'end_date') THEN
    ALTER TABLE public.events ADD COLUMN end_date timestamptz DEFAULT now();
  END IF;
  -- location
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'location') THEN
    ALTER TABLE public.events ADD COLUMN location text;
  END IF;
  -- pavilion_id
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'pavilion_id') THEN
    ALTER TABLE public.events ADD COLUMN pavilion_id uuid;
  END IF;
  -- organizer_id
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'organizer_id') THEN
    ALTER TABLE public.events ADD COLUMN organizer_id uuid;
  END IF;
  -- capacity
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'capacity') THEN
    ALTER TABLE public.events ADD COLUMN capacity integer;
  END IF;
  -- registered
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'registered') THEN
    ALTER TABLE public.events ADD COLUMN registered integer DEFAULT 0;
  END IF;
  -- is_featured
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'is_featured') THEN
    ALTER TABLE public.events ADD COLUMN is_featured boolean DEFAULT false;
  END IF;
END $$;

-- =====================================================
-- 1. INSERT DEMO USERS
-- =====================================================

-- Admin user
INSERT INTO users (id, email, name, type, status, profile, created_at)
VALUES 
  (
    '00000000-0000-0000-0000-000000000001',
    'admin@siports.com',
    'Admin SIPORTS',
    'admin',
    'active',
    '{"role": "administrator", "avatar": "https://ui-avatars.com/api/?name=Admin+SIPORTS"}',
    NOW()
  )
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  status = EXCLUDED.status,
  profile = EXCLUDED.profile;

-- Exhibitor users
INSERT INTO users (id, email, name, type, status, profile, created_at)
VALUES 
  (
    '00000000-0000-0000-0000-000000000002',
    'expo.tech@example.com',
    'TechExpo Solutions',
    'exhibitor',
    'active',
    '{"company": "TechExpo Solutions", "sector": "Technologie", "avatar": "https://ui-avatars.com/api/?name=TechExpo"}',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'agri.innov@example.com',
    'AgriInnov',
    'exhibitor',
    'active',
    '{"company": "AgriInnov", "sector": "Agriculture", "avatar": "https://ui-avatars.com/api/?name=AgriInnov"}',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    'mode.design@example.com',
    'ModeDesign Paris',
    'exhibitor',
    'active',
    '{"company": "ModeDesign Paris", "sector": "Mode", "avatar": "https://ui-avatars.com/api/?name=ModeDesign"}',
    NOW()
  )
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  status = EXCLUDED.status,
  profile = EXCLUDED.profile;

-- Partner users
INSERT INTO users (id, email, name, type, status, profile, created_at)
VALUES 
  (
    '00000000-0000-0000-0000-000000000005',
    'partner.gold@example.com',
    'Gold Partner Industries',
    'partner',
    'active',
    '{"company": "Gold Partner Industries", "tier": "gold", "avatar": "https://ui-avatars.com/api/?name=Gold+Partner"}',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000006',
    'partner.silver@example.com',
    'Silver Tech Group',
    'partner',
    'active',
    '{"company": "Silver Tech Group", "tier": "silver", "avatar": "https://ui-avatars.com/api/?name=Silver+Tech"}',
    NOW()
  )
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  status = EXCLUDED.status,
  profile = EXCLUDED.profile;

-- Visitor users
INSERT INTO users (id, email, name, type, visitor_level, status, profile, created_at)
VALUES 
  (
    '00000000-0000-0000-0000-000000000007',
    'visitor.vip@example.com',
    'Jean Dupont',
    'visitor',
    'vip',
    'active',
    '{"firstName": "Jean", "lastName": "Dupont", "company": "Dupont Consulting", "avatar": "https://ui-avatars.com/api/?name=Jean+Dupont"}',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000008',
    'visitor.premium@example.com',
    'Marie Martin',
    'visitor',
    'premium',
    'active',
    '{"firstName": "Marie", "lastName": "Martin", "company": "Martin & Associés", "avatar": "https://ui-avatars.com/api/?name=Marie+Martin"}',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000009',
    'visitor.basic@example.com',
    'Pierre Dubois',
    'visitor',
    'basic',
    'active',
    '{"firstName": "Pierre", "lastName": "Dubois", "avatar": "https://ui-avatars.com/api/?name=Pierre+Dubois"}',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000010',
    'visitor.free@example.com',
    'Sophie Bernard',
    'visitor',
    'free',
    'active',
    '{"firstName": "Sophie", "lastName": "Bernard", "avatar": "https://ui-avatars.com/api/?name=Sophie+Bernard"}',
    NOW()
  )
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  visitor_level = EXCLUDED.visitor_level,
  status = EXCLUDED.status,
  profile = EXCLUDED.profile;

-- =====================================================
-- 2. INSERT EXHIBITOR PROFILES
-- =====================================================
INSERT INTO exhibitors (id, user_id, company_name, category, sector, description, website, logo_url, created_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000002',
    'TechExpo Solutions',
    'port-industry',
    'Innovation',
    'Leader mondial en solutions technologiques innovantes pour les salons professionnels. Nous proposons des solutions de réalité virtuelle, d''affichage interactif et de gestion d''événements.',
    'https://techexpo-solutions.example.com',
    'https://ui-avatars.com/api/?name=TechExpo&size=200',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000103',
    '00000000-0000-0000-0000-000000000003',
    'AgriInnov',
    'port-operations',
    'Agritech',
    'Spécialiste des technologies agricoles durables et intelligentes. Nos solutions IoT et d''agriculture de précision révolutionnent le secteur agricole.',
    'https://agri-innov.example.com',
    'https://ui-avatars.com/api/?name=AgriInnov&size=200',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000104',
    '00000000-0000-0000-0000-000000000004',
    'ModeDesign Paris',
    'institutional',
    'Luxury',
    'Maison de haute couture parisienne reconnue internationalement. Collections exclusives et sur-mesure pour une clientèle prestigieuse.',
    'https://mode-design-paris.example.com',
    'https://ui-avatars.com/api/?name=ModeDesign&size=200',
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  category = EXCLUDED.category,
  sector = EXCLUDED.sector,
  description = EXCLUDED.description,
  website = EXCLUDED.website,
  logo_url = EXCLUDED.logo_url;

-- =====================================================
-- 3. INSERT PARTNER PROFILES (dans partner_profiles)
-- =====================================================
INSERT INTO partner_profiles (id, user_id, company_name, contact_name, contact_email, description, website, logo_url, country, partnership_level, created_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000105',
    '00000000-0000-0000-0000-000000000005',
    'Gold Partner Industries',
    'Marie Laurent',
    'contact@gold-partner.example.com',
    'Partenaire stratégique majeur offrant des services premium et un accompagnement personnalisé. Sponsor principal de l''événement SIPORTS 2025.',
    'https://gold-partner.example.com',
    'https://ui-avatars.com/api/?name=Gold+Partner&size=200',
    'France',
    'gold',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000106',
    '00000000-0000-0000-0000-000000000006',
    'Silver Tech Group',
    'Pierre Martin',
    'info@silver-tech.example.com',
    'Expert en solutions technologiques pour événements professionnels. Support technique et innovation digitale.',
    'https://silver-tech.example.com',
    'https://ui-avatars.com/api/?name=Silver+Tech&size=200',
    'France',
    'silver',
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  contact_name = EXCLUDED.contact_name,
  contact_email = EXCLUDED.contact_email,
  description = EXCLUDED.description,
  website = EXCLUDED.website,
  logo_url = EXCLUDED.logo_url,
  partnership_level = EXCLUDED.partnership_level;

-- =====================================================
-- 4. INSERT VISITOR PROFILES
-- =====================================================
INSERT INTO visitor_profiles (user_id, first_name, last_name, company, position, phone, country, visitor_type, pass_type, created_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000007',
    'Jean',
    'Dupont',
    'Dupont Consulting',
    'Directeur Innovation',
    '+33612345678',
    'France',
    'professional',
    'vip',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000008',
    'Marie',
    'Martin',
    'Martin & Associés',
    'Chef de Projet',
    '+33612345679',
    'France',
    'professional',
    'standard',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000009',
    'Pierre',
    'Dubois',
    NULL,
    'Entrepreneur',
    '+33612345680',
    'France',
    'entrepreneur',
    'standard',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000010',
    'Sophie',
    'Bernard',
    NULL,
    'Étudiante',
    '+33612345681',
    'France',
    'student',
    'student',
    NOW()
  )
ON CONFLICT (user_id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  company = EXCLUDED.company,
  position = EXCLUDED.position;

-- =====================================================
-- 5. INSERT PAVILIONS
-- =====================================================
INSERT INTO pavilions (id, name, slug, description, color, icon, order_index, featured, created_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000201',
    'Pavillon Innovation',
    'innovation',
    'Espace dédié aux technologies innovantes et startups du futur',
    '#3b82f6',
    'Zap',
    1,
    true,
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000202',
    'Pavillon Agritech',
    'agritech',
    'Solutions agricoles intelligentes et développement durable',
    '#10b981',
    'Sprout',
    2,
    false,
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000203',
    'Pavillon Luxe & Mode',
    'luxe-mode',
    'Haute couture et accessoires de luxe',
    '#ec4899',
    'Sparkles',
    3,
    false,
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 6. INSERT EVENTS
-- =====================================================
INSERT INTO events (id, title, description, type, start_date, end_date, location, pavilion_id, organizer_id, capacity, registered, is_featured, created_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000301',
    'Conférence Innovation 2025',
    'Les dernières tendances en matière d''innovation technologique et digitale. Intervenants internationaux et sessions de networking.',
    'conference',
    NOW() + INTERVAL '2 days',
    NOW() + INTERVAL '2 days' + INTERVAL '4 hours',
    'Salle Plenière A',
    '00000000-0000-0000-0000-000000000201',
    '00000000-0000-0000-0000-000000000001',
    200,
    87,
    true,
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000302',
    'Atelier Agriculture Durable',
    'Workshop pratique sur les techniques d''agriculture de précision et l''utilisation de l''IoT dans les exploitations.',
    'conference',
    NOW() + INTERVAL '3 days',
    NOW() + INTERVAL '3 days' + INTERVAL '3 hours',
    'Salle Workshop B1',
    '00000000-0000-0000-0000-000000000202',
    '00000000-0000-0000-0000-000000000001',
    50,
    32,
    false,
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000303',
    'Défilé Mode & Innovation',
    'Présentation exclusive des collections 2025 avec intégration de technologies wearables.',
    'conference',
    NOW() + INTERVAL '5 days',
    NOW() + INTERVAL '5 days' + INTERVAL '2 hours',
    'Podium Principal',
    '00000000-0000-0000-0000-000000000203',
    '00000000-0000-0000-0000-000000000001',
    300,
    156,
    true,
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000304',
    'Networking Business Leaders',
    'Session de networking exclusif pour dirigeants et décideurs. Cocktail et échanges professionnels.',
    'conference',
    NOW() + INTERVAL '4 days',
    NOW() + INTERVAL '4 days' + INTERVAL '3 hours',
    'Salon VIP',
    NULL,
    '00000000-0000-0000-0000-000000000001',
    100,
    67,
    true,
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 7. INSERT NEWS ARTICLES
-- =====================================================
INSERT INTO news_articles (id, title, content, excerpt, author_id, published, category, tags, image_url, created_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000401',
    'SIPORTS 2025 : Record d''affluence attendu',
    'Le salon SIPORTS 2025 s''annonce comme l''édition la plus importante de son histoire avec plus de 500 exposants confirmés et 50 000 visiteurs attendus. Cette année, l''accent est mis sur l''innovation durable et les technologies vertes...',
    'Le salon SIPORTS 2025 bat tous les records avec 500 exposants et 50 000 visiteurs attendus.',
    '00000000-0000-0000-0000-000000000001',
    true,
    'Événement',
    ARRAY['SIPORTS', 'Salon', 'Innovation'],
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    NOW() - INTERVAL '2 days'
  ),
  (
    '00000000-0000-0000-0000-000000000402',
    'TechExpo Solutions dévoile sa nouvelle plateforme VR',
    'L''exposant TechExpo Solutions présentera en exclusivité sa nouvelle plateforme de réalité virtuelle destinée aux salons professionnels. Une révolution dans l''expérience visiteur...',
    'TechExpo Solutions lance une plateforme VR révolutionnaire pour les salons.',
    '00000000-0000-0000-0000-000000000001',
    true,
    'Technologie',
    ARRAY['Innovation', 'Réalité Virtuelle', 'TechExpo'],
    'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800',
    NOW() - INTERVAL '5 days'
  ),
  (
    '00000000-0000-0000-0000-000000000403',
    'Agriculture de demain : Les innovations d''AgriInnov',
    'AgriInnov présente ses dernières solutions IoT pour l''agriculture de précision. Des capteurs intelligents et des systèmes d''irrigation automatisés qui réduisent la consommation d''eau de 40%...',
    'AgriInnov révolutionne l''agriculture avec des solutions IoT innovantes.',
    '00000000-0000-0000-0000-000000000001',
    true,
    'Agriculture',
    ARRAY['AgriTech', 'Innovation', 'Développement Durable'],
    'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800',
    NOW() - INTERVAL '1 day'
  ),
  (
    '00000000-0000-0000-0000-000000000404',
    'ModeDesign Paris : La haute couture rencontre la tech',
    'La maison ModeDesign Paris fusionne tradition et innovation avec sa nouvelle collection intégrant des textiles intelligents et des accessoires connectés...',
    'ModeDesign Paris présente une collection alliant haute couture et technologies.',
    '00000000-0000-0000-0000-000000000001',
    true,
    'Mode',
    ARRAY['Mode', 'Innovation', 'Luxe'],
    'https://images.unsplash.com/photo-1558769132-cb1aea1f1c77?w=800',
    NOW() - INTERVAL '3 days'
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 8. INSERT TIME SLOTS (Plus de créneaux pour calendriers)
-- =====================================================
INSERT INTO time_slots (id, exhibitor_id, slot_date, start_time, end_time, duration, type, max_bookings, current_bookings, available, location, created_at)
VALUES
  -- TechExpo Solutions - Aujourd'hui
  (
    '00000000-0000-0000-0000-000000000501',
    '00000000-0000-0000-0000-000000000102',
    CURRENT_DATE,
    '09:00:00',
    '09:30:00',
    30,
    'in-person',
    3,
    2,
    true,
    'Stand A12 - Hall Innovation',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000502',
    '00000000-0000-0000-0000-000000000102',
    CURRENT_DATE,
    '10:00:00',
    '10:30:00',
    30,
    'in-person',
    3,
    1,
    true,
    'Stand A12 - Hall Innovation',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000503',
    '00000000-0000-0000-0000-000000000102',
    CURRENT_DATE,
    '14:00:00',
    '14:30:00',
    30,
    'virtual',
    5,
    3,
    true,
    'Salle VR - Démo en ligne',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000508',
    '00000000-0000-0000-0000-000000000102',
    CURRENT_DATE,
    '15:00:00',
    '15:30:00',
    30,
    'in-person',
    3,
    0,
    true,
    'Stand A12 - Hall Innovation',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000509',
    '00000000-0000-0000-0000-000000000102',
    CURRENT_DATE,
    '16:00:00',
    '16:30:00',
    30,
    'virtual',
    5,
    1,
    true,
    'Salle VR - Démo en ligne',
    NOW()
  ),
  -- TechExpo Solutions - Demain
  (
    '00000000-0000-0000-0000-000000000510',
    '00000000-0000-0000-0000-000000000102',
    CURRENT_DATE + INTERVAL '1 day',
    '09:00:00',
    '09:30:00',
    30,
    'in-person',
    3,
    1,
    true,
    'Stand A12 - Hall Innovation',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000511',
    '00000000-0000-0000-0000-000000000102',
    CURRENT_DATE + INTERVAL '1 day',
    '11:00:00',
    '11:30:00',
    30,
    'in-person',
    3,
    0,
    true,
    'Stand A12 - Hall Innovation'
  );

-- =====================================================
-- APPOINTMENTS (Rendez-vous)
-- =====================================================
INSERT INTO appointments (id, exhibitor_id, visitor_id, time_slot_id, status, notes, meeting_type, created_at)
VALUES
  -- Rendez-vous AUJOURD''HUI pour Jean Dupont (VIP Visitor)
  (
    '00000000-0000-0000-0000-000000000601',
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000501',
    'confirmed',
    'Intéressé par la solution VR pour notre prochain salon. Discussion approfondie prévue.',
    'in-person',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000610',
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000502',
    'confirmed',
    'Suite de notre discussion sur l''implémentation VR',
    'in-person',
    NOW()
  ),
  -- Rendez-vous AUJOURD'HUI pour Marie Martin (Premium Visitor)
  (
    '00000000-0000-0000-0000-000000000602',
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000503',
    'confirmed',
    'Démo de la plateforme VR complète avec cas d''usage agricole',
    'virtual',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000603',
    '00000000-0000-0000-0000-000000000103',
    '00000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000504',
    'confirmed',
    'Discussion sur les solutions IoT pour exploitation agricole - capteurs et automatisation',
    'in-person',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000611',
    '00000000-0000-0000-0000-000000000103',
    '00000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000513',
    'confirmed',
    'Démonstration des capteurs IoT en conditions réelles',
    'in-person',
    NOW()
  ),
  -- Rendez-vous AUJOURD'HUI pour Pierre Dubois (Basic Visitor)
  (
    '00000000-0000-0000-0000-000000000604',
    '00000000-0000-0000-0000-000000000104',
    '00000000-0000-0000-0000-000000000009',
    '00000000-0000-0000-0000-000000000506',
    'confirmed',
    'Présentation collection exclusive automne-hiver 2025',
    'in-person',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000612',
    '00000000-0000-0000-0000-000000000104',
    '00000000-0000-0000-0000-000000000009',
    '00000000-0000-0000-0000-000000000517',
    'confirmed',
    'Suite - Sélection de pièces sur-mesure',
    'in-person',
    NOW()
  ),
  -- Rendez-vous AUJOURD'HUI pour Sophie Bernard (Free Visitor)
  (
    '00000000-0000-0000-0000-000000000613',
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000509',
    'confirmed',
    'Découverte des technologies VR pour étudiants',
    'virtual',
    NOW()
  ),
  -- Rendez-vous DEMAIN pour Jean Dupont
  (
    '00000000-0000-0000-0000-000000000614',
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000510',
    'confirmed',
    'Point final sur le projet VR - prise de décision',
    'in-person',
    NOW()
  ),
  -- Rendez-vous DEMAIN pour Marie Martin
  (
    '00000000-0000-0000-0000-000000000615',
    '00000000-0000-0000-0000-000000000103',
    '00000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000505',
    'confirmed',
    'Analyse des données IoT collectées - rapport personnalisé',
    'in-person',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000616',
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000512',
    'pending',
    'Webinaire complet sur la transformation digitale',
    'virtual',
    NOW()
  ),
  -- Rendez-vous DEMAIN pour Pierre Dubois
  (
    '00000000-0000-0000-0000-000000000617',
    '00000000-0000-0000-0000-000000000104',
    '00000000-0000-0000-0000-000000000009',
    '00000000-0000-0000-0000-000000000507',
    'pending',
    'Essayage final et validation commande',
    'in-person',
    NOW()
  ),
  -- Rendez-vous passé (hier) - pour historique
  (
    '00000000-0000-0000-0000-000000000605',
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000009',
    NULL,
    'completed',
    'Première prise de contact - très intéressant',
    'in-person',
    NOW() - INTERVAL '1 day'
  ),
  (
    '00000000-0000-0000-0000-000000000606',
    '00000000-0000-0000-0000-000000000103',
    '00000000-0000-0000-0000-000000000007',
    NULL,
    'completed',
    'Présentation des solutions AgriInnov - excellente session',
    'in-person',
    NOW() - INTERVAL '2 days'
  ),
  -- Rendez-vous annulé
  (
    '00000000-0000-0000-0000-000000000607',
    '00000000-0000-0000-0000-000000000104',
    '00000000-0000-0000-0000-000000000010',
    NULL,
    'cancelled',
    'Annulé à la demande du visiteur',
    'in-person',
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 8.5. INSERT MORE TIME SLOTS (AgriInnov & ModeDesign)
-- =====================================================
INSERT INTO time_slots (id, exhibitor_id, slot_date, start_time, end_time, duration, type, max_bookings, current_bookings, available, location, created_at)
VALUES
  -- AgriInnov - Aujourd'hui
  (
    '00000000-0000-0000-0000-000000000504',
    '00000000-0000-0000-0000-000000000103',
    CURRENT_DATE,
    '11:00:00',
    '11:30:00',
    30,
    'in-person',
    2,
    0,
    true,
    'Stand B07 - Hall Agritech',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000513',
    '00000000-0000-0000-0000-000000000103',
    CURRENT_DATE,
    '14:00:00',
    '14:30:00',
    30,
    'in-person',
    2,
    1,
    true,
    'Stand B07 - Hall Agritech',
    NOW()
  ),
  -- AgriInnov - Demain
  (
    '00000000-0000-0000-0000-000000000505',
    '00000000-0000-0000-0000-000000000103',
    CURRENT_DATE + INTERVAL '1 day',
    '10:00:00',
    '10:30:00',
    30,
    'in-person',
    2,
    1,
    true,
    'Stand B07 - Hall Agritech',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000515',
    '00000000-0000-0000-0000-000000000103',
    CURRENT_DATE + INTERVAL '1 day',
    '14:00:00',
    '14:30:00',
    30,
    'virtual',
    3,
    0,
    true,
    'Présentation IoT en ligne',
    NOW()
  ),
  -- ModeDesign Paris - Aujourd'hui
  (
    '00000000-0000-0000-0000-000000000506',
    '00000000-0000-0000-0000-000000000104',
    CURRENT_DATE,
    '10:00:00',
    '10:45:00',
    45,
    'in-person',
    1,
    1,
    false,
    'Showroom C12 - Luxe',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000516',
    '00000000-0000-0000-0000-000000000104',
    CURRENT_DATE,
    '11:30:00',
    '12:15:00',
    45,
    'in-person',
    1,
    0,
    true,
    'Showroom C12 - Luxe',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000517',
    '00000000-0000-0000-0000-000000000104',
    CURRENT_DATE,
    '15:00:00',
    '15:45:00',
    45,
    'in-person',
    1,
    1,
    false,
    'Showroom C12 - Luxe',
    NOW()
  ),
  -- ModeDesign Paris - Demain
  (
    '00000000-0000-0000-0000-000000000507',
    '00000000-0000-0000-0000-000000000104',
    CURRENT_DATE + INTERVAL '1 day',
    '13:00:00',
    '13:45:00',
    45,
    'in-person',
    1,
    0,
    true,
    'Showroom C12 - Luxe',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000518',
    '00000000-0000-0000-0000-000000000104',
    CURRENT_DATE + INTERVAL '1 day',
    '16:00:00',
    '16:45:00',
    45,
    'in-person',
    1,
    0,
    true,
    'Showroom C12 - Luxe',
    NOW()
  ),
  -- Créneaux pour dans 2 jours
  (
    '00000000-0000-0000-0000-000000000519',
    '00000000-0000-0000-0000-000000000102',
    CURRENT_DATE + INTERVAL '2 days',
    '10:00:00',
    '10:30:00',
    30,
    'in-person',
    3,
    0,
    true,
    'Stand A12 - Hall Innovation',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000520',
    '00000000-0000-0000-0000-000000000103',
    CURRENT_DATE + INTERVAL '2 days',
    '11:00:00',
    '11:30:00',
    30,
    'in-person',
    2,
    0,
    true,
    'Stand B07 - Hall Agritech',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000521',
    '00000000-0000-0000-0000-000000000104',
    CURRENT_DATE + INTERVAL '2 days',
    '14:00:00',
    '14:45:00',
    45,
    'in-person',
    1,
    0,
    true,
    'Showroom C12 - Luxe',
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 10. INSERT CONNECTIONS (Visibles dans calendriers via rendez-vous)
-- =====================================================
INSERT INTO connections (id, requester_id, addressee_id, status, message, created_at)
VALUES
  -- Jean Dupont (VIP) connecté avec Marie Martin (Premium)
  (
    '00000000-0000-0000-0000-000000000701',
    '00000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000008',
    'accepted',
    'Ravi de vous rencontrer au salon. Échangeons sur nos projets communs en innovation.',
    NOW() - INTERVAL '1 day'
  ),
  -- Jean Dupont connecté avec TechExpo (Exposant)
  (
    '00000000-0000-0000-0000-000000000702',
    '00000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000002',
    'accepted',
    'Très intéressé par vos solutions technologiques VR. Discussion approfondie nécessaire.',
    NOW() - INTERVAL '2 days'
  ),
  -- Marie Martin connectée avec AgriInnov (Exposant)
  (
    '00000000-0000-0000-0000-000000000703',
    '00000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000003',
    'accepted',
    'Vos solutions IoT correspondent parfaitement à nos besoins en agriculture durable.',
    NOW() - INTERVAL '3 days'
  ),
  -- Pierre Dubois connecté avec ModeDesign (Exposant)
  (
    '00000000-0000-0000-0000-000000000704',
    '00000000-0000-0000-0000-000000000009',
    '00000000-0000-0000-0000-000000000004',
    'accepted',
    'Collaboration potentielle dans le domaine de la mode innovante.',
    NOW() - INTERVAL '1 day'
  ),
  -- Sophie Bernard connectée avec Jean Dupont (Networking)
  (
    '00000000-0000-0000-0000-000000000705',
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000007',
    'accepted',
    'Networking étudiant-professionnel. Merci pour vos conseils!',
    NOW() - INTERVAL '2 days'
  ),
  -- Marie Martin connectée avec Pierre Dubois
  (
    '00000000-0000-0000-0000-000000000706',
    '00000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000009',
    'accepted',
    'Intérêts communs en innovation et design durable',
    NOW() - INTERVAL '1 day'
  ),
  -- Jean Dupont connecté avec AgriInnov
  (
    '00000000-0000-0000-0000-000000000707',
    '00000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000003',
    'accepted',
    'Exploration de synergies entre technologie et agriculture',
    NOW() - INTERVAL '4 days'
  ),
  -- Sophie Bernard connectée avec TechExpo
  (
    '00000000-0000-0000-0000-000000000708',
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000002',
    'accepted',
    'Opportunité de stage - merci pour votre accueil!',
    NOW() - INTERVAL '1 day'
  ),
  -- Pierre Dubois connecté avec Jean Dupont
  (
    '00000000-0000-0000-0000-000000000709',
    '00000000-0000-0000-0000-000000000009',
    '00000000-0000-0000-0000-000000000007',
    'pending',
    'J''aimerais échanger sur votre expérience en consulting',
    NOW()
  ),
  -- Marie Martin connectée avec Gold Partner
  (
    '00000000-0000-0000-0000-000000000710',
    '00000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000005',
    'accepted',
    'Partenariat stratégique pour projets agricoles innovants',
    NOW() - INTERVAL '5 days'
  ),
  -- Exposants connectés entre eux
  (
    '00000000-0000-0000-0000-000000000711',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003',
    'accepted',
    'Collaboration TechExpo x AgriInnov - solutions VR pour agriculture',
    NOW() - INTERVAL '6 days'
  ),
  (
    '00000000-0000-0000-0000-000000000712',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000004',
    'accepted',
    'Innovation mode & tech - projet wearables',
    NOW() - INTERVAL '4 days'
  ),
  -- Partenaires et exposants
  (
    '00000000-0000-0000-0000-000000000713',
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000002',
    'accepted',
    'Gold Partner sponsoring TechExpo Solutions',
    NOW() - INTERVAL '10 days'
  ),
  (
    '00000000-0000-0000-0000-000000000714',
    '00000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000003',
    'accepted',
    'Support technique Silver Tech pour AgriInnov',
    NOW() - INTERVAL '7 days'
  ),
  -- Connexions en attente
  (
    '00000000-0000-0000-0000-000000000715',
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000004',
    'pending',
    'Étudiante intéressée par le secteur de la mode',
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 11. INSERT CONVERSATIONS
-- =====================================================
INSERT INTO conversations (id, type, participants, created_by, created_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000801',
    'direct',
    ARRAY['00000000-0000-0000-0000-000000000007'::uuid, '00000000-0000-0000-0000-000000000008'::uuid],
    '00000000-0000-0000-0000-000000000007',
    NOW() - INTERVAL '2 days'
  ),
  (
    '00000000-0000-0000-0000-000000000802',
    'direct',
    ARRAY['00000000-0000-0000-0000-000000000007'::uuid, '00000000-0000-0000-0000-000000000002'::uuid],
    '00000000-0000-0000-0000-000000000007',
    NOW() - INTERVAL '1 day'
  ),
  (
    '00000000-0000-0000-0000-000000000803',
    'direct',
    ARRAY['00000000-0000-0000-0000-000000000008'::uuid, '00000000-0000-0000-0000-000000000003'::uuid],
    '00000000-0000-0000-0000-000000000008',
    NOW() - INTERVAL '3 hours'
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 12. INSERT MESSAGES
-- =====================================================
INSERT INTO messages (id, conversation_id, sender_id, content, created_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000901',
    '00000000-0000-0000-0000-000000000801',
    '00000000-0000-0000-0000-000000000007',
    'Bonjour Marie, ravi de vous avoir rencontrée au salon !',
    NOW() - INTERVAL '2 days'
  ),
  (
    '00000000-0000-0000-0000-000000000902',
    '00000000-0000-0000-0000-000000000801',
    '00000000-0000-0000-0000-000000000008',
    'Bonjour Jean, moi de même. Votre présentation était très intéressante.',
    NOW() - INTERVAL '2 days' + INTERVAL '15 minutes'
  ),
  (
    '00000000-0000-0000-0000-000000000903',
    '00000000-0000-0000-0000-000000000801',
    '00000000-0000-0000-0000-000000000007',
    'Merci ! On pourrait organiser une réunion la semaine prochaine ?',
    NOW() - INTERVAL '2 days' + INTERVAL '30 minutes'
  ),
  (
    '00000000-0000-0000-0000-000000000904',
    '00000000-0000-0000-0000-000000000802',
    '00000000-0000-0000-0000-000000000007',
    'Bonjour, je suis intéressé par votre solution VR.',
    NOW() - INTERVAL '1 day'
  ),
  (
    '00000000-0000-0000-0000-000000000905',
    '00000000-0000-0000-0000-000000000802',
    '00000000-0000-0000-0000-000000000002',
    'Bonjour ! Nous serions ravis de vous faire une démonstration. Êtes-vous disponible demain ?',
    NOW() - INTERVAL '1 day' + INTERVAL '2 hours'
  ),
  (
    '00000000-0000-0000-0000-000000000906',
    '00000000-0000-0000-0000-000000000803',
    '00000000-0000-0000-0000-000000000008',
    'Bonjour AgriInnov, vos solutions IoT m''intéressent beaucoup.',
    NOW() - INTERVAL '3 hours'
  ),
  (
    '00000000-0000-0000-0000-000000000907',
    '00000000-0000-0000-0000-000000000803',
    '00000000-0000-0000-0000-000000000003',
    'Merci pour votre intérêt ! Nous avons plusieurs solutions adaptées à différents types d''exploitations.',
    NOW() - INTERVAL '2 hours'
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 13. INSERT USER FAVORITES
-- =====================================================
INSERT INTO user_favorites (user_id, entity_type, entity_id, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000007', 'exhibitor', '00000000-0000-0000-0000-000000000102', NOW()),
  ('00000000-0000-0000-0000-000000000007', 'exhibitor', '00000000-0000-0000-0000-000000000103', NOW()),
  ('00000000-0000-0000-0000-000000000007', 'event', '00000000-0000-0000-0000-000000000301', NOW()),
  ('00000000-0000-0000-0000-000000000008', 'exhibitor', '00000000-0000-0000-0000-000000000103', NOW()),
  ('00000000-0000-0000-0000-000000000008', 'event', '00000000-0000-0000-0000-000000000302', NOW()),
  ('00000000-0000-0000-0000-000000000009', 'exhibitor', '00000000-0000-0000-0000-000000000104', NOW()),
  ('00000000-0000-0000-0000-000000000009', 'event', '00000000-0000-0000-0000-000000000303', NOW())
ON CONFLICT (user_id, entity_type, entity_id) DO NOTHING;

-- =====================================================
-- 14. INSERT DAILY QUOTAS
-- =====================================================
INSERT INTO daily_quotas (user_id, quota_date, connections_used, messages_used, meetings_used, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000007', CURRENT_DATE, 2, 5, 1, NOW()),
  ('00000000-0000-0000-0000-000000000008', CURRENT_DATE, 1, 3, 2, NOW()),
  ('00000000-0000-0000-0000-000000000009', CURRENT_DATE, 1, 1, 1, NOW()),
  ('00000000-0000-0000-0000-000000000010', CURRENT_DATE, 0, 0, 0, NOW())
ON CONFLICT (user_id, quota_date) DO UPDATE SET
  connections_used = EXCLUDED.connections_used,
  messages_used = EXCLUDED.messages_used,
  meetings_used = EXCLUDED.meetings_used;

-- =====================================================
-- 15. INSERT MINI-SITES (Pages exposants avec sections hero, about, contact)
-- =====================================================
INSERT INTO mini_sites (id, exhibitor_id, theme, custom_colors, sections, published, views, created_at)
VALUES
  -- TechExpo Solutions Mini-Site
  (
    '00000000-0000-0000-0000-000000001001',
    '00000000-0000-0000-0000-000000000102',
    'modern',
    '{"primary": "#1e40af", "secondary": "#3b82f6", "accent": "#60a5fa"}',
    '[
      {"type": "hero", "title": "TechExpo Solutions", "subtitle": "Leader mondial en solutions technologiques innovantes", "image": "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200", "cta_text": "Découvrir nos solutions", "cta_link": "#products"},
      {"type": "about", "title": "À propos de nous", "content": "TechExpo Solutions est le leader mondial en solutions technologiques innovantes pour les salons professionnels. Depuis 2010, nous proposons des solutions de réalité virtuelle, d''affichage interactif et de gestion d''événements qui transforment l''expérience visiteur.", "image": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800"},
      {"type": "contact", "title": "Contactez-nous", "email": "contact@techexpo-solutions.example.com", "phone": "+33 1 23 45 67 89", "address": "123 Avenue de l''Innovation, 75008 Paris", "form_enabled": true}
    ]',
    true,
    1456,
    NOW()
  ),
  -- AgriInnov Mini-Site
  (
    '00000000-0000-0000-0000-000000001002',
    '00000000-0000-0000-0000-000000000103',
    'nature',
    '{"primary": "#16a34a", "secondary": "#22c55e", "accent": "#4ade80"}',
    '[
      {"type": "hero", "title": "AgriInnov", "subtitle": "L''agriculture intelligente de demain", "image": "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200", "cta_text": "Explorer nos solutions IoT", "cta_link": "#products"},
      {"type": "about", "title": "Notre mission", "content": "AgriInnov est spécialiste des technologies agricoles durables et intelligentes. Nos solutions IoT et d''agriculture de précision révolutionnent le secteur agricole en réduisant la consommation d''eau de 40% et en optimisant les rendements.", "image": "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800"},
      {"type": "contact", "title": "Nous contacter", "email": "contact@agri-innov.example.com", "phone": "+33 4 56 78 90 12", "address": "45 Route des Champs, 69000 Lyon", "form_enabled": true}
    ]',
    true,
    892,
    NOW()
  ),
  -- ModeDesign Paris Mini-Site
  (
    '00000000-0000-0000-0000-000000001003',
    '00000000-0000-0000-0000-000000000104',
    'elegant',
    '{"primary": "#7c3aed", "secondary": "#8b5cf6", "accent": "#a78bfa"}',
    '[
      {"type": "hero", "title": "ModeDesign Paris", "subtitle": "L''excellence de la haute couture parisienne", "image": "https://images.unsplash.com/photo-1558769132-cb1aea1f1c77?w=1200", "cta_text": "Découvrir la collection 2025", "cta_link": "#products"},
      {"type": "about", "title": "Notre maison", "content": "ModeDesign Paris est une maison de haute couture parisienne reconnue internationalement depuis 1985. Nos collections exclusives et sur-mesure allient tradition artisanale et innovation textile pour une clientèle prestigieuse exigeante.", "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"},
      {"type": "contact", "title": "Prendre rendez-vous", "email": "contact@mode-design-paris.example.com", "phone": "+33 1 42 68 53 00", "address": "8 Avenue Montaigne, 75008 Paris", "form_enabled": true}
    ]',
    true,
    2341,
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  theme = EXCLUDED.theme,
  custom_colors = EXCLUDED.custom_colors,
  sections = EXCLUDED.sections,
  published = EXCLUDED.published,
  views = EXCLUDED.views;

-- =====================================================
-- 16. INSERT PRODUCTS (Produits des exposants)
-- =====================================================
INSERT INTO products (id, exhibitor_id, name, description, category, images, price, featured, created_at)
VALUES
  -- TechExpo Solutions Products
  (
    '00000000-0000-0000-0000-000000002001',
    '00000000-0000-0000-0000-000000000102',
    'VR Event Platform',
    'Plateforme de réalité virtuelle complète pour événements professionnels. Permet aux visiteurs de naviguer dans un salon virtuel immersif.',
    'Réalité Virtuelle',
    ARRAY['https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=600'],
    15000,
    true,
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000002002',
    '00000000-0000-0000-0000-000000000102',
    'Interactive Display Hub',
    'Solution d''affichage interactif tactile pour stands d''exposition. Écrans 4K avec analytics intégrés.',
    'Affichage',
    ARRAY['https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600'],
    8500,
    true,
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000002003',
    '00000000-0000-0000-0000-000000000102',
    'Event Analytics Suite',
    'Suite complète d''analytics pour mesurer l''engagement visiteurs, les flux de circulation et le ROI de votre présence.',
    'Analytics',
    ARRAY['https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600'],
    2500,
    false,
    NOW()
  ),
  -- AgriInnov Products
  (
    '00000000-0000-0000-0000-000000002004',
    '00000000-0000-0000-0000-000000000103',
    'Smart Soil Sensor Kit',
    'Kit de capteurs connectés pour analyse des sols en temps réel. Mesure humidité, pH, nutriments et température.',
    'Capteurs IoT',
    ARRAY['https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600'],
    890,
    true,
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000002005',
    '00000000-0000-0000-0000-000000000103',
    'AutoIrrig Pro',
    'Système d''irrigation automatisé intelligent. Réduit la consommation d''eau de 40% grâce à l''IA.',
    'Irrigation',
    ARRAY['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600'],
    4500,
    true,
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000002006',
    '00000000-0000-0000-0000-000000000103',
    'FarmDashboard Cloud',
    'Tableau de bord cloud pour piloter toute votre exploitation. Visualisez les données, planifiez les actions, optimisez les rendements.',
    'Logiciel',
    ARRAY['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600'],
    199,
    false,
    NOW()
  ),
  -- ModeDesign Paris Products
  (
    '00000000-0000-0000-0000-000000002007',
    '00000000-0000-0000-0000-000000000104',
    'Collection Automne-Hiver 2025',
    'Notre dernière collection haute couture mêlant tradition parisienne et technologies textiles innovantes.',
    'Haute Couture',
    ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'],
    NULL,
    true,
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000002008',
    '00000000-0000-0000-0000-000000000104',
    'Smart Fabric Collection',
    'Ligne exclusive de vêtements intégrant des textiles connectés: thermorégulation, suivi biométrique, éclairage LED.',
    'Innovation',
    ARRAY['https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600'],
    3500,
    true,
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000002009',
    '00000000-0000-0000-0000-000000000104',
    'Service Sur-Mesure VIP',
    'Création entièrement personnalisée avec nos maîtres artisans. Rendez-vous privé, choix des matières, essayages exclusifs.',
    'Services',
    ARRAY['https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600'],
    NULL,
    false,
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  images = EXCLUDED.images,
  price = EXCLUDED.price,
  featured = EXCLUDED.featured;

-- =====================================================
-- FINAL COMMENTS
-- =====================================================
COMMENT ON COLUMN users.visitor_level IS 'Visitor subscription level: free, basic, premium, vip';
COMMENT ON TABLE exhibitors IS 'Exhibitor company profiles and information';
COMMENT ON TABLE partners IS 'Partner company profiles with tier levels';
COMMENT ON TABLE visitor_profiles IS 'Detailed visitor profile information';
COMMENT ON TABLE events IS 'Salon events, conferences, and workshops';
COMMENT ON TABLE news_articles IS 'News articles and announcements';
COMMENT ON TABLE appointments IS 'Scheduled appointments between visitors and exhibitors';
COMMENT ON TABLE connections IS 'Professional connections and networking requests';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Demo data successfully seeded for presentation!';
  RAISE NOTICE 'Created: 10 users (1 admin, 3 exhibitors, 2 partners, 4 visitors)';
  RAISE NOTICE 'Created: 3 exhibitor profiles, 2 partner profiles, 4 visitor profiles';
  RAISE NOTICE 'Created: 3 pavilions, 4 events, 4 news articles';
  RAISE NOTICE 'Created: 22 time slots (today + tomorrow + day after)';
  RAISE NOTICE 'Created: 15 appointments (confirmed, pending, completed, cancelled)';
  RAISE NOTICE 'Created: 15 professional connections (exposants, visiteurs, partenaires)';
  RAISE NOTICE 'Created: 3 conversations, 7 messages, favorites, quotas';
  RAISE NOTICE 'Created: 3 mini-sites complets avec sections (hero, about, contact)';
  RAISE NOTICE 'Created: 9 produits de démonstration (3 par exposant)';
  RAISE NOTICE '';
  RAISE NOTICE '📅 CALENDRIERS REMPLIS:';
  RAISE NOTICE '  - Jean Dupont (VIP): 3 RDV aujourd''hui, 1 demain';
  RAISE NOTICE '  - Marie Martin (Premium): 3 RDV aujourd''hui, 2 demain';
  RAISE NOTICE '  - Pierre Dubois (Basic): 2 RDV aujourd''hui, 1 demain';
  RAISE NOTICE '  - Sophie Bernard (Free): 1 RDV aujourd''hui';
  RAISE NOTICE '  - TechExpo Solutions: 8 créneaux disponibles';
  RAISE NOTICE '  - AgriInnov: 6 créneaux disponibles';
  RAISE NOTICE '  - ModeDesign Paris: 6 créneaux disponibles';
  RAISE NOTICE '';
  RAISE NOTICE '🌐 MINI-SITES EXPOSANTS:';
  RAISE NOTICE '  - TechExpo Solutions: /minisite/00000000-0000-0000-0000-000000000102';
  RAISE NOTICE '  - AgriInnov: /minisite/00000000-0000-0000-0000-000000000103';
  RAISE NOTICE '  - ModeDesign Paris: /minisite/00000000-0000-0000-0000-000000000104';
  RAISE NOTICE '';
  RAISE NOTICE '🤝 CONNEXIONS PROFESSIONNELLES:';
  RAISE NOTICE '  - 12 connexions acceptées (visibles dans tous les calendriers)';
  RAISE NOTICE '  - 3 connexions en attente';
  RAISE NOTICE '  - Réseau complet entre exposants, visiteurs et partenaires';
END $$;

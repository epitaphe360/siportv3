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
    'Technology',
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
    'Agriculture',
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
    'Fashion',
    'Luxury',
    'Maison de haute couture parisienne reconnue internationalement. Collections exclusives et sur-mesure pour une clientèle prestigieuse.',
    'https://mode-design-paris.example.com',
    'https://ui-avatars.com/api/?name=ModeDesign&size=200',
    NOW()
  )
ON CONFLICT (user_id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  category = EXCLUDED.category,
  sector = EXCLUDED.sector,
  description = EXCLUDED.description,
  website = EXCLUDED.website,
  logo_url = EXCLUDED.logo_url;

-- =====================================================
-- 3. INSERT PARTNER PROFILES
-- =====================================================
INSERT INTO partners (id, user_id, company_name, tier, description, website, logo_url, contact_email, created_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000105',
    '00000000-0000-0000-0000-000000000005',
    'Gold Partner Industries',
    'gold',
    'Partenaire stratégique majeur offrant des services premium et un accompagnement personnalisé. Sponsor principal de l''événement SIPORTS 2025.',
    'https://gold-partner.example.com',
    'https://ui-avatars.com/api/?name=Gold+Partner&size=200',
    'contact@gold-partner.example.com',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000106',
    '00000000-0000-0000-0000-000000000006',
    'Silver Tech Group',
    'silver',
    'Expert en solutions technologiques pour événements professionnels. Support technique et innovation digitale.',
    'https://silver-tech.example.com',
    'https://ui-avatars.com/api/?name=Silver+Tech&size=200',
    'info@silver-tech.example.com',
    NOW()
  )
ON CONFLICT (user_id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  tier = EXCLUDED.tier,
  description = EXCLUDED.description,
  website = EXCLUDED.website,
  logo_url = EXCLUDED.logo_url,
  contact_email = EXCLUDED.contact_email;

-- =====================================================
-- 4. INSERT VISITOR PROFILES
-- =====================================================
INSERT INTO visitor_profiles (id, user_id, first_name, last_name, company, job_title, interests, created_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000107',
    '00000000-0000-0000-0000-000000000007',
    'Jean',
    'Dupont',
    'Dupont Consulting',
    'Directeur Innovation',
    ARRAY['Technologie', 'Innovation', 'Networking'],
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000108',
    '00000000-0000-0000-0000-000000000008',
    'Marie',
    'Martin',
    'Martin & Associés',
    'Chef de Projet',
    ARRAY['Agriculture', 'Développement durable'],
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000109',
    '00000000-0000-0000-0000-000000000009',
    'Pierre',
    'Dubois',
    NULL,
    'Entrepreneur',
    ARRAY['Mode', 'Design'],
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000110',
    '00000000-0000-0000-0000-000000000010',
    'Sophie',
    'Bernard',
    NULL,
    'Étudiante',
    ARRAY['Innovation', 'Startups'],
    NOW()
  )
ON CONFLICT (user_id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  company = EXCLUDED.company,
  job_title = EXCLUDED.job_title,
  interests = EXCLUDED.interests;

-- =====================================================
-- 5. INSERT PAVILIONS
-- =====================================================
INSERT INTO pavilions (id, name, description, location, capacity, exhibitor_count, created_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000201',
    'Pavillon Innovation',
    'Espace dédié aux technologies innovantes et startups du futur',
    'Hall A - Niveau 1',
    500,
    15,
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000202',
    'Pavillon Agritech',
    'Solutions agricoles intelligentes et développement durable',
    'Hall B - Niveau 1',
    400,
    12,
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000203',
    'Pavillon Luxe & Mode',
    'Haute couture et accessoires de luxe',
    'Hall C - Niveau 2',
    300,
    8,
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 6. INSERT EVENTS
-- =====================================================
INSERT INTO events (id, title, description, event_type, start_date, end_date, location, pavilion_id, organizer_id, capacity, registered, is_featured, created_at)
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
    'workshop',
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
    'exhibition',
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
    'networking',
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
INSERT INTO news_articles (id, title, content, summary, author_id, published, featured, category, tags, image_url, created_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000401',
    'SIPORTS 2025 : Record d''affluence attendu',
    'Le salon SIPORTS 2025 s''annonce comme l''édition la plus importante de son histoire avec plus de 500 exposants confirmés et 50 000 visiteurs attendus. Cette année, l''accent est mis sur l''innovation durable et les technologies vertes...',
    'Le salon SIPORTS 2025 bat tous les records avec 500 exposants et 50 000 visiteurs attendus.',
    '00000000-0000-0000-0000-000000000001',
    true,
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
    false,
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
    false,
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
    'Stand A12 - Hall Inn (Visibles dans calendriers personnels)
-- =====================================================
INSERT INTO appointments (id, exhibitor_id, visitor_id, time_slot_id, status, notes, meeting_type, created_at)
VALUES
  -- Rendez-vous AUJOURD'HUI pour Jean Dupont (VIP Visitor)
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
    'in-person',
    2,
    0,
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
-- 9. INSERT APPOINTMENTS
-- =====================================================
INSERT INTO appointments (id, exhibitor_id, visitor_id, time_slot_id, status, notes, meeting_type, created_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000601',
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000501',
    'confirmed',
    'Intéressé par la solution VR pour notre prochain salon',
    'in-person',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000602',
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000503',
    'confirmed',
    'Démo de la plateforme VR complète',
    'virtual',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000603',
    '00000000-0000-0000-0000-000000000103',
    '00000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000504',
    'confirmed',
    'Discussion sur les solutions IoT pour exploitation agricole',
    'in-person',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000604',
    '00000000-0000-0000-0000-000000000104',
    '00000000-0000-0000-0000-000000000009',
    '00000000-0000-0000-0000-000000000507',
    'confirmed',
    'Présentation collection exclusive',
    'in-person',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000605',
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000009',
    '00000000-0000-0000-0000-000000000503',
    'pending',
    'Demande d''information sur les tarifs',
    'virtual',
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
INSERT INTO conversations (id, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000801', NOW() - INTERVAL '2 days'),
  ('00000000-0000-0000-0000-000000000802', NOW() - INTERVAL '1 day'),
  ('00000000-0000-0000-0000-000000000803', NOW() - INTERVAL '3 hours')
ON CONFLICT (id) DO NOTHING;

-- Link users to conversations (if conversation_participants table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversation_participants') THEN
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES
      ('00000000-0000-0000-0000-000000000801', '00000000-0000-0000-0000-000000000007'),
      ('00000000-0000-0000-0000-000000000801', '00000000-0000-0000-0000-000000000008'),
      ('00000000-0000-0000-0000-000000000802', '00000000-0000-0000-0000-000000000007'),
      ('00000000-0000-0000-0000-000000000802', '00000000-0000-0000-0000-000000000002'),
      ('00000000-0000-0000-0000-000000000803', '00000000-0000-0000-0000-000000000008'),
      ('00000000-0000-0000-0000-000000000803', '00000000-0000-0000-0000-000000000003')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

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
  RAISE NOTICE '🤝 CONNEXIONS PROFESSIONNELLES:';
  RAISE NOTICE '  - 12 connexions acceptées (visibles dans tous les calendriers)';
  RAISE NOTICE '  - 3 connexions en attente';
  RAISE NOTICE '  - Réseau complet entre exposants, visiteurs et partenaires';
END $$;

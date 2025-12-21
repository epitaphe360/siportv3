-- Seed Data pour les Fonctionnalités Médias
-- Exemples de données pour tester les fonctionnalités

BEGIN;

-- ============================================================================
-- SEED: WEBINAIRES
-- ============================================================================

-- Webinaire 1: Innovation Portuaire 2025
INSERT INTO media_contents (
  type, 
  title, 
  description, 
  thumbnail_url, 
  video_url, 
  duration, 
  speakers, 
  tags, 
  category,
  status,
  published_at
) VALUES (
  'webinar',
  'Innovation Portuaire 2025 : Les Technologies qui Transforment le Secteur',
  'Découvrez les dernières innovations technologiques qui révolutionnent l''industrie portuaire. Des experts internationaux partagent leurs insights sur l''automatisation, l''IoT et l''intelligence artificielle dans les ports modernes.',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  3600,
  '[
    {"name": "Dr. Marie Laurent", "title": "Directrice Innovation", "company": "Port du Havre", "photo_url": "https://randomuser.me/api/portraits/women/1.jpg"},
    {"name": "Jean Dupont", "title": "CTO", "company": "Maritime Tech Solutions", "photo_url": "https://randomuser.me/api/portraits/men/1.jpg"}
  ]'::jsonb,
  ARRAY['innovation', 'technologie', 'port', 'automatisation'],
  'Technologie',
  'published',
  NOW() - INTERVAL '7 days'
);

-- Webinaire 2: Logistique Verte
INSERT INTO media_contents (
  type, 
  title, 
  description, 
  thumbnail_url, 
  video_url, 
  duration, 
  speakers, 
  tags, 
  category,
  status,
  published_at
) VALUES (
  'webinar',
  'Logistique Verte : Vers des Ports Durables et Éco-Responsables',
  'Comment les ports s''adaptent aux enjeux environnementaux. Stratégies de décarbonation, énergies renouvelables et certifications écologiques.',
  'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  2700,
  '[
    {"name": "Sophie Martin", "title": "Responsable Développement Durable", "company": "Port de Marseille", "photo_url": "https://randomuser.me/api/portraits/women/2.jpg"},
    {"name": "Pierre Legrand", "title": "Consultant Environnemental", "company": "EcoPort Consulting", "photo_url": "https://randomuser.me/api/portraits/men/2.jpg"}
  ]'::jsonb,
  ARRAY['développement durable', 'écologie', 'port vert'],
  'Environnement',
  'published',
  NOW() - INTERVAL '14 days'
);

-- ============================================================================
-- SEED: PODCASTS
-- ============================================================================

-- Podcast Episode 1
INSERT INTO media_contents (
  type, 
  title, 
  description, 
  thumbnail_url, 
  audio_url, 
  duration, 
  speakers, 
  tags, 
  category,
  status,
  published_at
) VALUES (
  'podcast',
  'SIPORT Talks #1 - L''Avenir de la Logistique Maritime avec Ahmed Hassan',
  'Dans ce premier épisode, nous recevons Ahmed Hassan, CEO de Maritime Logistics International. Il nous parle de sa vision pour l''avenir du transport maritime et des défis à venir.',
  'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  2400,
  '[
    {"name": "Ahmed Hassan", "title": "CEO", "company": "Maritime Logistics International", "photo_url": "https://randomuser.me/api/portraits/men/3.jpg"}
  ]'::jsonb,
  ARRAY['podcast', 'logistique', 'maritime', 'leadership'],
  'Business',
  'published',
  NOW() - INTERVAL '5 days'
);

-- Podcast Episode 2
INSERT INTO media_contents (
  type, 
  title, 
  description, 
  thumbnail_url, 
  audio_url, 
  duration, 
  speakers, 
  tags, 
  category,
  status,
  published_at
) VALUES (
  'podcast',
  'SIPORT Talks #2 - Innovation et Digitalisation avec Clara Dubois',
  'Clara Dubois, Directrice de l''Innovation chez PortTech, partage son parcours et les projets innovants qui transforment les opérations portuaires.',
  'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  1800,
  '[
    {"name": "Clara Dubois", "title": "Directrice Innovation", "company": "PortTech", "photo_url": "https://randomuser.me/api/portraits/women/3.jpg"}
  ]'::jsonb,
  ARRAY['podcast', 'innovation', 'digital', 'technologie'],
  'Innovation',
  'published',
  NOW() - INTERVAL '12 days'
);

-- ============================================================================
-- SEED: CAPSULES "INSIDE SIPORT"
-- ============================================================================

-- Capsule 1
INSERT INTO media_contents (
  type, 
  title, 
  description, 
  thumbnail_url, 
  video_url, 
  duration, 
  tags, 
  category,
  status,
  published_at
) VALUES (
  'capsule_inside',
  'Inside SIPORT - Découverte du Pavillon Innovation',
  'Plongez au cœur du Pavillon Innovation de SIPORT 2026. Découvrez les exposants et leurs solutions révolutionnaires.',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  180,
  ARRAY['siport', 'pavillon', 'innovation', 'découverte'],
  'Événement',
  'published',
  NOW() - INTERVAL '3 days'
);

-- Capsule 2
INSERT INTO media_contents (
  type, 
  title, 
  description, 
  thumbnail_url, 
  video_url, 
  duration, 
  tags, 
  category,
  status,
  published_at
) VALUES (
  'capsule_inside',
  'Inside SIPORT - Les Coulisses de l''Organisation',
  'Rencontrez l''équipe qui organise SIPORT et découvrez les coulisses de cet événement d''envergure internationale.',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  240,
  ARRAY['siport', 'organisation', 'équipe', 'coulisses'],
  'Événement',
  'published',
  NOW() - INTERVAL '10 days'
);

-- ============================================================================
-- SEED: LIVE STUDIO "MEET THE LEADERS"
-- ============================================================================

-- Interview Live Studio 1
INSERT INTO media_contents (
  type, 
  title, 
  description, 
  thumbnail_url, 
  video_url, 
  duration, 
  speakers, 
  tags, 
  category,
  status,
  published_at
) VALUES (
  'live_studio',
  'Meet The Leaders - Interview avec François Mercier, PDG de SeaConnect',
  'Une discussion exclusive avec François Mercier sur l''avenir du secteur maritime et les opportunités de croissance en Afrique.',
  'https://images.unsplash.com/photo-1560438718-eb61ede255eb?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  1200,
  '[
    {"name": "François Mercier", "title": "PDG", "company": "SeaConnect", "photo_url": "https://randomuser.me/api/portraits/men/4.jpg"}
  ]'::jsonb,
  ARRAY['interview', 'leadership', 'maritime', 'afrique'],
  'Leadership',
  'published',
  NOW() - INTERVAL '2 days'
);

-- ============================================================================
-- SEED: BEST MOMENTS
-- ============================================================================

-- Best Moments 1
INSERT INTO media_contents (
  type, 
  title, 
  description, 
  thumbnail_url, 
  video_url, 
  duration, 
  tags, 
  category,
  status,
  published_at
) VALUES (
  'best_moments',
  'SIPORT 2025 - Les Meilleurs Moments Jour 1',
  'Revivez les temps forts de la première journée de SIPORT 2025 : inaugurations, rencontres et moments marquants.',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  300,
  ARRAY['siport', 'highlights', 'événement', 'résumé'],
  'Événement',
  'published',
  NOW() - INTERVAL '30 days'
);

-- ============================================================================
-- SEED: TESTIMONIALS
-- ============================================================================

-- Testimonial 1
INSERT INTO media_contents (
  type, 
  title, 
  description, 
  thumbnail_url, 
  video_url, 
  duration, 
  speakers, 
  tags, 
  category,
  status,
  published_at
) VALUES (
  'testimonial',
  'Témoignage - Port Autonome de Dakar',
  'Découvrez l''expérience du Port Autonome de Dakar en tant que partenaire Gold de SIPORT et les bénéfices de cette collaboration.',
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  120,
  '[
    {"name": "Mamadou Diallo", "title": "Directeur Général", "company": "Port Autonome de Dakar", "photo_url": "https://randomuser.me/api/portraits/men/5.jpg"}
  ]'::jsonb,
  ARRAY['témoignage', 'partenaire', 'dakar', 'port'],
  'Témoignage',
  'published',
  NOW() - INTERVAL '15 days'
);

-- Testimonial 2
INSERT INTO media_contents (
  type, 
  title, 
  description, 
  thumbnail_url, 
  video_url, 
  duration, 
  speakers, 
  tags, 
  category,
  status,
  published_at
) VALUES (
  'testimonial',
  'Témoignage - TechMarine Solutions',
  'TechMarine Solutions partage son retour d''expérience après 2 ans de partenariat avec SIPORT et les résultats obtenus.',
  'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  90,
  '[
    {"name": "Sarah Johnson", "title": "VP Marketing", "company": "TechMarine Solutions", "photo_url": "https://randomuser.me/api/portraits/women/4.jpg"}
  ]'::jsonb,
  ARRAY['témoignage', 'partenaire', 'technologie', 'résultats'],
  'Témoignage',
  'published',
  NOW() - INTERVAL '20 days'
);

-- ============================================================================
-- SEED: ÉVÉNEMENTS LIVE (À VENIR)
-- ============================================================================

-- Prochain Live Event
-- Utilisation de WITH pour capturer l'ID
WITH new_media AS (
  INSERT INTO media_contents (
    type, 
    title, 
    description, 
    thumbnail_url, 
    duration, 
    speakers, 
    tags, 
    category,
    status
  ) VALUES (
    'live_studio',
    'Live Q&A - L''Avenir de l''Énergie dans les Ports avec Emma Rousseau',
    'Session questions-réponses en direct avec Emma Rousseau, experte en énergies renouvelables pour les infrastructures portuaires.',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200',
    3600,
    '[
      {"name": "Emma Rousseau", "title": "Consultante Énergie", "company": "GreenPort Energy", "photo_url": "https://randomuser.me/api/portraits/women/5.jpg"}
    ]'::jsonb,
    ARRAY['live', 'énergie', 'port', 'renouvelable'],
    'Environnement',
    'draft'
  ) RETURNING id
)
-- Créer l'événement live correspondant
INSERT INTO live_events (
  media_content_id,
  event_date,
  duration_minutes,
  live_stream_url,
  chat_enabled,
  registration_required,
  max_participants,
  status
) 
SELECT 
  id,
  NOW() + INTERVAL '7 days',
  60,
  'https://stream.example.com/live/event-123',
  true,
  false,
  1000,
  'scheduled'
FROM new_media;

-- ============================================================================
-- SEED: INTERACTIONS (Exemples)
-- ============================================================================

-- Note: Remplacer les UUIDs par de vrais IDs d'utilisateurs et de médias
-- Exemple d'interaction "view"
-- INSERT INTO media_interactions (user_id, media_content_id, action, watch_time, completed)
-- VALUES ('<user_uuid>', '<media_uuid>', 'view', 1800, true);

COMMIT;

-- ============================================================================
-- NOTES D'UTILISATION
-- ============================================================================

-- Pour voir tous les webinaires :
-- SELECT * FROM media_contents WHERE type = 'webinar' AND status = 'published';

-- Pour voir les prochains lives :
-- SELECT le.*, mc.title 
-- FROM live_events le
-- JOIN media_contents mc ON le.media_content_id = mc.id
-- WHERE le.event_date > NOW() AND le.status = 'scheduled';

-- Pour obtenir les statistiques d'un média :
-- SELECT 
--   mc.*,
--   COUNT(DISTINCT mi.user_id) FILTER (WHERE mi.action = 'view') as unique_viewers,
--   AVG(mi.watch_time) as avg_watch_time
-- FROM media_contents mc
-- LEFT JOIN media_interactions mi ON mc.id = mi.media_content_id
-- WHERE mc.id = '<media_uuid>'
-- GROUP BY mc.id;

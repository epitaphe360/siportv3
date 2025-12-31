-- =====================================================
-- SCRIPT DE MIGRATION INTELLIGENT
-- Ajoute UNIQUEMENT ce qui manque, ne supprime RIEN
-- =====================================================

-- Activer l'extension UUID si nécessaire
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- SÉCURITÉ: Crée une table `profiles` minimale si elle n'existe pas (évite l'erreur 42P01)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles'
  ) THEN
    CREATE TABLE profiles (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID UNIQUE,
      full_name TEXT,
      avatar_url TEXT,
      company TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    RAISE NOTICE '✅ Table profiles créée (minimale)';
  ELSE
    RAISE NOTICE 'ℹ️ Table profiles déjà présente, aucune action';
  END IF;
END $$;

-- =====================================================
-- ÉTAPE 1: CRÉER OU MODIFIER LES TABLES
-- =====================================================

-- Table: mini_sites (créer si n'existe pas, sinon ajouter colonnes manquantes)
CREATE TABLE IF NOT EXISTS mini_sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exhibitor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ajouter les colonnes manquantes à mini_sites
DO $$ 
BEGIN
  -- Ajouter slug si n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mini_sites' AND column_name = 'slug'
  ) THEN
    ALTER TABLE mini_sites ADD COLUMN slug TEXT;
    -- Générer des slugs pour les lignes existantes
    UPDATE mini_sites SET slug = id::text WHERE slug IS NULL;
    -- Rendre la colonne unique et NOT NULL après remplissage
    ALTER TABLE mini_sites ALTER COLUMN slug SET NOT NULL;
    CREATE UNIQUE INDEX IF NOT EXISTS idx_mini_sites_slug_unique ON mini_sites(slug);
    RAISE NOTICE '✅ Colonne slug ajoutée à mini_sites';
  END IF;

  -- Ajouter sections si n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mini_sites' AND column_name = 'sections'
  ) THEN
    ALTER TABLE mini_sites ADD COLUMN sections JSONB DEFAULT '[]'::jsonb;
    RAISE NOTICE '✅ Colonne sections ajoutée à mini_sites';
  END IF;

  -- Ajouter seo si n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mini_sites' AND column_name = 'seo'
  ) THEN
    ALTER TABLE mini_sites ADD COLUMN seo JSONB DEFAULT '{}'::jsonb;
    RAISE NOTICE '✅ Colonne seo ajoutée à mini_sites';
  END IF;

  -- Ajouter published si n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mini_sites' AND column_name = 'published'
  ) THEN
    ALTER TABLE mini_sites ADD COLUMN published BOOLEAN DEFAULT false;
    RAISE NOTICE '✅ Colonne published ajoutée à mini_sites';
  END IF;
END $$;

-- Index pour mini_sites
CREATE INDEX IF NOT EXISTS idx_mini_sites_exhibitor ON mini_sites(exhibitor_id);
CREATE INDEX IF NOT EXISTS idx_mini_sites_slug ON mini_sites(slug);
CREATE INDEX IF NOT EXISTS idx_mini_sites_published ON mini_sites(published);

-- Table: site_templates
CREATE TABLE IF NOT EXISTS site_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  thumbnail TEXT,
  sections JSONB NOT NULL,
  premium BOOLEAN DEFAULT false,
  popularity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_templates_category ON site_templates(category);
CREATE INDEX IF NOT EXISTS idx_site_templates_popularity ON site_templates(popularity DESC);

-- Table: site_images
CREATE TABLE IF NOT EXISTS site_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exhibitor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  name TEXT NOT NULL,
  size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_images_exhibitor ON site_images(exhibitor_id);

-- Table: user_profiles (utilise la table profiles existante, ajoute colonnes manquantes)
-- On ajoute juste les colonnes pour le networking si elles n'existent pas
DO $$ 
BEGIN
  -- Ajouter interests si n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'interests'
  ) THEN
    ALTER TABLE profiles ADD COLUMN interests TEXT[] DEFAULT '{}';
    RAISE NOTICE '✅ Colonne interests ajoutée à profiles';
  END IF;

  -- Ajouter looking_for si n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'looking_for'
  ) THEN
    ALTER TABLE profiles ADD COLUMN looking_for TEXT[] DEFAULT '{}';
    RAISE NOTICE '✅ Colonne looking_for ajoutée à profiles';
  END IF;

  -- Ajouter offering si n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'offering'
  ) THEN
    ALTER TABLE profiles ADD COLUMN offering TEXT[] DEFAULT '{}';
    RAISE NOTICE '✅ Colonne offering ajoutée à profiles';
  END IF;

  -- Ajouter linkedin si n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'linkedin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN linkedin TEXT;
    RAISE NOTICE '✅ Colonne linkedin ajoutée à profiles';
  END IF;

  -- Ajouter bio si n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'bio'
  ) THEN
    ALTER TABLE profiles ADD COLUMN bio TEXT;
    RAISE NOTICE '✅ Colonne bio ajoutée à profiles';
  END IF;

  -- Ajouter industry si n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'industry'
  ) THEN
    ALTER TABLE profiles ADD COLUMN industry TEXT;
    RAISE NOTICE '✅ Colonne industry ajoutée à profiles';
  END IF;

  -- Ajouter location si n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'location'
  ) THEN
    ALTER TABLE profiles ADD COLUMN location TEXT;
    RAISE NOTICE '✅ Colonne location ajoutée à profiles';
  END IF;
END $$;

-- Index sur profiles (ajout seulement si manquants)
CREATE INDEX IF NOT EXISTS idx_profiles_industry ON profiles(industry);
CREATE INDEX IF NOT EXISTS idx_profiles_interests ON profiles USING GIN(interests);

-- Table: networking_interactions
CREATE TABLE IF NOT EXISTS networking_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Ajouter la contrainte CHECK si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'networking_interactions_type_check'
  ) THEN
    ALTER TABLE networking_interactions 
    ADD CONSTRAINT networking_interactions_type_check 
    CHECK (type IN ('view', 'like', 'message', 'meeting', 'connection'));
    RAISE NOTICE '✅ Contrainte CHECK ajoutée sur networking_interactions.type';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_networking_from_user ON networking_interactions(from_user_id);
CREATE INDEX IF NOT EXISTS idx_networking_to_user ON networking_interactions(to_user_id);
CREATE INDEX IF NOT EXISTS idx_networking_type ON networking_interactions(type);
CREATE INDEX IF NOT EXISTS idx_networking_timestamp ON networking_interactions(timestamp DESC);

-- Table: match_scores
CREATE TABLE IF NOT EXISTS match_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id_1 UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_id_2 UUID REFERENCES profiles(id) ON DELETE CASCADE,
  score_boost INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ajouter la contrainte UNIQUE si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'match_scores_user_id_1_user_id_2_key'
  ) THEN
    ALTER TABLE match_scores ADD CONSTRAINT match_scores_user_id_1_user_id_2_key UNIQUE (user_id_1, user_id_2);
    RAISE NOTICE '✅ Contrainte UNIQUE ajoutée sur match_scores';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_match_scores_user1 ON match_scores(user_id_1);
CREATE INDEX IF NOT EXISTS idx_match_scores_user2 ON match_scores(user_id_2);

-- Table: speed_networking_sessions
CREATE TABLE IF NOT EXISTS speed_networking_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL,
  max_participants INTEGER DEFAULT 20,
  participants UUID[] DEFAULT '{}',
  status TEXT DEFAULT 'scheduled',
  matches JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ajouter la contrainte CHECK si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'speed_networking_sessions_status_check'
  ) THEN
    ALTER TABLE speed_networking_sessions 
    ADD CONSTRAINT speed_networking_sessions_status_check 
    CHECK (status IN ('scheduled', 'active', 'completed'));
    RAISE NOTICE '✅ Contrainte CHECK ajoutée sur speed_networking_sessions.status';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_speed_networking_event ON speed_networking_sessions(event_id);
CREATE INDEX IF NOT EXISTS idx_speed_networking_status ON speed_networking_sessions(status);
CREATE INDEX IF NOT EXISTS idx_speed_networking_start_time ON speed_networking_sessions(start_time);

-- Table: networking_rooms
CREATE TABLE IF NOT EXISTS networking_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sector TEXT NOT NULL,
  description TEXT,
  capacity INTEGER DEFAULT 50,
  participants UUID[] DEFAULT '{}',
  moderator TEXT,
  status TEXT DEFAULT 'open',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ajouter la contrainte CHECK si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'networking_rooms_status_check'
  ) THEN
    ALTER TABLE networking_rooms 
    ADD CONSTRAINT networking_rooms_status_check 
    CHECK (status IN ('open', 'full', 'closed'));
    RAISE NOTICE '✅ Contrainte CHECK ajoutée sur networking_rooms.status';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_networking_rooms_event ON networking_rooms(event_id);
CREATE INDEX IF NOT EXISTS idx_networking_rooms_sector ON networking_rooms(sector);
CREATE INDEX IF NOT EXISTS idx_networking_rooms_status ON networking_rooms(status);

-- =====================================================
-- ÉTAPE 2: STORAGE BUCKET
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'site-images',
  'site-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

-- =====================================================
-- ÉTAPE 3: ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE mini_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE networking_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE speed_networking_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE networking_rooms ENABLE ROW LEVEL SECURITY;

-- Fonction helper pour créer une policy si elle n'existe pas
CREATE OR REPLACE FUNCTION create_policy_if_not_exists(
  p_table_name text,
  p_policy_name text,
  p_command text,
  p_using text DEFAULT NULL,
  p_with_check text DEFAULT NULL
) RETURNS void AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = p_table_name AND policyname = p_policy_name
  ) THEN
    EXECUTE format('CREATE POLICY %I ON %I FOR %s USING (%s)',
      p_policy_name, p_table_name, p_command, p_using);
    IF p_with_check IS NOT NULL THEN
      EXECUTE format('CREATE POLICY %I ON %I FOR %s WITH CHECK (%s)',
        p_policy_name, p_table_name, p_command, p_with_check);
    END IF;
    RAISE NOTICE '✅ Policy % créée sur %', p_policy_name, p_table_name;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- POLICIES: mini_sites
DO $$
BEGIN
  PERFORM create_policy_if_not_exists(
    'mini_sites',
    'Public can view published mini sites',
    'SELECT',
    'published = true'
  );

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mini_sites' AND policyname = 'Exhibitors can view own mini sites') THEN
    CREATE POLICY "Exhibitors can view own mini sites" ON mini_sites FOR SELECT
    USING (auth.uid() IN (SELECT user_id FROM profiles WHERE id = exhibitor_id));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mini_sites' AND policyname = 'Exhibitors can create own mini sites') THEN
    CREATE POLICY "Exhibitors can create own mini sites" ON mini_sites FOR INSERT
    WITH CHECK (auth.uid() IN (SELECT user_id FROM profiles WHERE id = exhibitor_id));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mini_sites' AND policyname = 'Exhibitors can update own mini sites') THEN
    CREATE POLICY "Exhibitors can update own mini sites" ON mini_sites FOR UPDATE
    USING (auth.uid() IN (SELECT user_id FROM profiles WHERE id = exhibitor_id));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mini_sites' AND policyname = 'Exhibitors can delete own mini sites') THEN
    CREATE POLICY "Exhibitors can delete own mini sites" ON mini_sites FOR DELETE
    USING (auth.uid() IN (SELECT user_id FROM profiles WHERE id = exhibitor_id));
  END IF;
END $$;

-- POLICIES: site_templates
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_templates' AND policyname = 'Anyone can view templates') THEN
    CREATE POLICY "Anyone can view templates" ON site_templates FOR SELECT
    TO authenticated USING (true);
  END IF;
END $$;

-- POLICIES: site_images
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_images' AND policyname = 'Exhibitors can view own images') THEN
    CREATE POLICY "Exhibitors can view own images" ON site_images FOR SELECT
    USING (auth.uid() IN (SELECT user_id FROM profiles WHERE id = exhibitor_id));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_images' AND policyname = 'Exhibitors can upload images') THEN
    CREATE POLICY "Exhibitors can upload images" ON site_images FOR INSERT
    WITH CHECK (auth.uid() IN (SELECT user_id FROM profiles WHERE id = exhibitor_id));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_images' AND policyname = 'Exhibitors can delete own images') THEN
    CREATE POLICY "Exhibitors can delete own images" ON site_images FOR DELETE
    USING (auth.uid() IN (SELECT user_id FROM profiles WHERE id = exhibitor_id));
  END IF;
END $$;

-- POLICIES: profiles (table existante)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Anyone can view profiles') THEN
    CREATE POLICY "Anyone can view profiles" ON profiles FOR SELECT
    TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can create own profile') THEN
    CREATE POLICY "Users can create own profile" ON profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile') THEN
    CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- POLICIES: networking_interactions
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'networking_interactions' AND policyname = 'Users can view own interactions') THEN
    CREATE POLICY "Users can view own interactions" ON networking_interactions FOR SELECT
    USING (auth.uid() IN (SELECT user_id FROM profiles WHERE id = from_user_id OR id = to_user_id));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'networking_interactions' AND policyname = 'Users can create interactions') THEN
    CREATE POLICY "Users can create interactions" ON networking_interactions FOR INSERT
    WITH CHECK (auth.uid() IN (SELECT user_id FROM profiles WHERE id = from_user_id));
  END IF;
END $$;

-- POLICIES: match_scores
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'match_scores' AND policyname = 'Users can view own match scores') THEN
    CREATE POLICY "Users can view own match scores" ON match_scores FOR SELECT
    USING (auth.uid() IN (SELECT user_id FROM profiles WHERE id = user_id_1 OR id = user_id_2));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'match_scores' AND policyname = 'System can manage match scores') THEN
    CREATE POLICY "System can manage match scores" ON match_scores FOR ALL
    USING (true) WITH CHECK (true);
  END IF;
END $$;

-- POLICIES: speed_networking_sessions
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'speed_networking_sessions' AND policyname = 'Anyone can view sessions') THEN
    CREATE POLICY "Anyone can view sessions" ON speed_networking_sessions FOR SELECT
    TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'speed_networking_sessions' AND policyname = 'Admins can create sessions') THEN
    CREATE POLICY "Admins can create sessions" ON speed_networking_sessions FOR INSERT
    TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'organizer')));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'speed_networking_sessions' AND policyname = 'Admins can update sessions') THEN
    CREATE POLICY "Admins can update sessions" ON speed_networking_sessions FOR UPDATE
    TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'organizer')));
  END IF;
END $$;

-- POLICIES: networking_rooms
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'networking_rooms' AND policyname = 'Anyone can view open rooms') THEN
    CREATE POLICY "Anyone can view open rooms" ON networking_rooms FOR SELECT
    TO authenticated USING (status IN ('open', 'full'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'networking_rooms' AND policyname = 'Admins can create rooms') THEN
    CREATE POLICY "Admins can create rooms" ON networking_rooms FOR INSERT
    TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'organizer')));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'networking_rooms' AND policyname = 'Admins can update rooms') THEN
    CREATE POLICY "Admins can update rooms" ON networking_rooms FOR UPDATE
    TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'organizer')));
  END IF;
END $$;

-- STORAGE POLICIES
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Public read access for site images') THEN
    CREATE POLICY "Public read access for site images" ON storage.objects FOR SELECT
    USING (bucket_id = 'site-images');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Authenticated users can upload site images') THEN
    CREATE POLICY "Authenticated users can upload site images" ON storage.objects FOR INSERT
    TO authenticated WITH CHECK (bucket_id = 'site-images' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Users can delete own site images') THEN
    CREATE POLICY "Users can delete own site images" ON storage.objects FOR DELETE
    TO authenticated USING (bucket_id = 'site-images' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
END $$;

-- =====================================================
-- ÉTAPE 4: FUNCTIONS & TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer les triggers s'ils n'existent pas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_mini_sites_updated_at') THEN
    CREATE TRIGGER update_mini_sites_updated_at
      BEFORE UPDATE ON mini_sites
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    RAISE NOTICE '✅ Trigger update_mini_sites_updated_at créé';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
    CREATE TRIGGER update_profiles_updated_at
      BEFORE UPDATE ON profiles
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    RAISE NOTICE '✅ Trigger update_profiles_updated_at créé';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_match_scores_updated_at') THEN
    CREATE TRIGGER update_match_scores_updated_at
      BEFORE UPDATE ON match_scores
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    RAISE NOTICE '✅ Trigger update_match_scores_updated_at créé';
  END IF;
END $$;

-- =====================================================
-- MIGRATION TERMINÉE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ MIGRATION TERMINÉE AVEC SUCCÈS !';
  RAISE NOTICE '================================================';
  RAISE NOTICE '📦 Tables vérifiées/créées :';
  RAISE NOTICE '   ✓ mini_sites (colonnes manquantes ajoutées)';
  RAISE NOTICE '   ✓ site_templates';
  RAISE NOTICE '   ✓ site_images';
  RAISE NOTICE '   ✓ profiles (colonnes networking ajoutées)';
  RAISE NOTICE '   ✓ networking_interactions';
  RAISE NOTICE '   ✓ match_scores';
  RAISE NOTICE '   ✓ speed_networking_sessions';
  RAISE NOTICE '   ✓ networking_rooms';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 RLS policies ajoutées (si manquantes)';
  RAISE NOTICE '📁 Storage bucket configuré';
  RAISE NOTICE '⚡ Index et triggers créés';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  AUCUNE DONNÉE SUPPRIMÉE !';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Prochaine étape : npm run seed:templates';
  RAISE NOTICE '================================================';
END $$;

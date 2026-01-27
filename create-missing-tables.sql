-- Script SQL pour créer les tables manquantes nécessaires au dashboard admin

-- Table pour les logs d'API (optionnel - pour les métriques de performance)
CREATE TABLE IF NOT EXISTS api_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  response_time INTEGER, -- en millisecondes
  status_code INTEGER,
  user_id UUID REFERENCES users(id),
  ip_address TEXT,
  user_agent TEXT
);

-- Table pour les vues de page (pour le trafic)
CREATE TABLE IF NOT EXISTS page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  page_url TEXT NOT NULL,
  user_id UUID REFERENCES users(id),
  session_id TEXT,
  unique_view BOOLEAN DEFAULT false, -- true si c'est la première visite de la session
  referrer TEXT,
  ip_address TEXT,
  user_agent TEXT
);

-- Table pour les logs d'activité admin
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  admin_user TEXT NOT NULL,
  action_type TEXT NOT NULL, -- 'account_validation', 'content_moderation', 'system_alert', etc.
  description TEXT NOT NULL,
  severity TEXT DEFAULT 'info', -- 'success', 'warning', 'error', 'info'
  target_id UUID, -- ID de l'entité concernée
  target_type TEXT, -- Type de l'entité (user, exhibitor, article, etc.)
  metadata JSONB -- Données supplémentaires
);

-- Ajouter un champ last_seen à la table users si inexistant
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'last_seen'
  ) THEN
    ALTER TABLE users ADD COLUMN last_seen TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());
  END IF;
END $$;

-- Ajouter un champ file_size à la table media_content si la table existe
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'media_content'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'media_content' AND column_name = 'file_size'
    ) THEN
      ALTER TABLE media_content ADD COLUMN file_size BIGINT DEFAULT 0;
    END IF;
  END IF;
END $$;

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON api_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_unique ON page_views(unique_view) WHERE unique_view = true;
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON users(last_seen DESC) WHERE type = 'exhibitor';
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Créer une fonction pour mettre à jour automatiquement last_seen
CREATE OR REPLACE FUNCTION update_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_seen = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer un trigger pour mettre à jour last_seen automatiquement
DROP TRIGGER IF EXISTS trigger_update_last_seen ON users;
CREATE TRIGGER trigger_update_last_seen
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_last_seen();

-- Ajouter quelques logs d'exemple pour tester
INSERT INTO admin_logs (admin_user, action_type, description, severity, created_at)
VALUES 
  ('System', 'system_alert', 'Système démarré avec succès', 'success', NOW() - INTERVAL '2 hours'),
  ('Admin', 'account_validation', 'Validation du compte exposant TechMarine Solutions', 'success', NOW() - INTERVAL '4 hours'),
  ('Modérateur', 'content_moderation', 'Modération du contenu mini-site OceanLogistics', 'info', NOW() - INTERVAL '6 hours')
ON CONFLICT DO NOTHING;

-- Ajouter des vues de page d'exemple
INSERT INTO page_views (page_url, unique_view, created_at)
SELECT 
  '/exhibitors',
  (random() > 0.5)::boolean,
  NOW() - (random() * INTERVAL '7 days')
FROM generate_series(1, 100)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE api_logs IS 'Logs des appels API pour le monitoring de performance';
COMMENT ON TABLE page_views IS 'Suivi des vues de pages pour les statistiques de trafic';
COMMENT ON TABLE admin_logs IS 'Journal des actions administratives pour l''audit';

-- ========================================
-- Script pour insérer les VRAIS articles de siportevent.com
-- À exécuter dans le SQL Editor de Supabase
-- ========================================

-- 1. Supprimer les anciens articles génériques
DELETE FROM news_articles WHERE author = 'Équipe SIPORTS';

-- 2. Vérifier et ajouter les colonnes manquantes
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'news_articles' AND column_name = 'source_url'
  ) THEN
    ALTER TABLE news_articles ADD COLUMN source_url text;
  END IF;
END $$;

-- 2. S'assurer que RLS permet la lecture publique
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Allow public read access to published news" ON news_articles;
DROP POLICY IF EXISTS "news_articles_public_read" ON news_articles;

-- Créer une politique pour lecture publique (tous les articles avec published_at non null)
CREATE POLICY "news_articles_public_read" ON news_articles
  FOR SELECT
  USING (published_at IS NOT NULL);

-- Politique pour insertion/modification par les admins
DROP POLICY IF EXISTS "news_articles_admin_all" ON news_articles;
CREATE POLICY "news_articles_admin_all" ON news_articles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.type = 'admin'
    )
  );

-- 3. Insérer les VRAIS articles de siportevent.com
INSERT INTO news_articles (title, content, excerpt, category, tags, image_url, published_at, views, author, source_url)
VALUES 
(
  'Financements des ports africains : Faut-il changer de modèle ?',
  'Les ports africains sont des infrastructures clés pour le commerce, l''intégration régionale et la compétitivité. Face aux défis de financement, de nouveaux modèles émergent : PPP, blended finance et investissements durables. Cet article analyse les différentes options pour moderniser et développer les infrastructures portuaires du continent africain.',
  'Les ports africains sont des infrastructures clés pour le commerce, l''intégration régionale et la compétitivité.',
  'Actualités Portuaires',
  ARRAY['financement', 'ports africains', 'PPP', 'infrastructure'],
  'https://siportevent.com/wp-content/uploads/2024/gouvernance-ports.jpg',
  NOW() - INTERVAL '2 days',
  0,
  'SIPORTS Event',
  'https://siportevent.com/financement-ports-africains-ppp-blended-finance/'
),
(
  'Crise des Compétences dans les Ports Atlantiques : L''Urgence de la Transition Expertise-Digital',
  'Dans les salles de contrôle des ports de l''Atlantique, une transition silencieuse mais critique est en cours. La crise des compétences menace la performance opérationnelle. Entre départs à la retraite massifs et digitalisation accélérée, les ports doivent repenser leur gestion des talents et investir dans la formation continue.',
  'Dans les salles de contrôle des ports de l''Atlantique, une transition silencieuse mais critique est en cours.',
  'Actualités Portuaires',
  ARRAY['compétences', 'digital', 'formation', 'ports atlantiques', 'RH'],
  'https://siportevent.com/wp-content/uploads/2024/formation-realite-virtuelle.jpg',
  NOW() - INTERVAL '5 days',
  0,
  'SIPORTS Event',
  'https://siportevent.com/siportevent-com-blog-crise-competences-ports-atlantique-expertise-digital-2026/'
),
(
  'Casablanca : Développement de son complexe portuaire pour 5 MMDH',
  'Plus de 5 milliards de dirhams d''investissements mobilisés pour la restructuration et le développement du complexe portuaire de Casablanca. Ce projet ambitieux vise à moderniser les infrastructures, améliorer la compétitivité et positionner le port comme hub majeur en Méditerranée.',
  'Plus de 5 milliards de dirhams d''investissements mobilisés pour la restructuration et le développement du complexe portuaire.',
  'Actualités Portuaires',
  ARRAY['Casablanca', 'Maroc', 'investissement', 'modernisation', 'infrastructure'],
  'https://siportevent.com/wp-content/uploads/2024/port-casablanca.jpg',
  NOW() - INTERVAL '8 days',
  0,
  'SIPORTS Event',
  'https://siportevent.com/modernisation-complexe-portuaire-de-casablanca/'
),
(
  'Glossaire portuaire : comprendre le langage maritime et logistique',
  'Les ports sont des hubs stratégiques pour le commerce mondial. Mais derrière cette efficacité se cache un vocabulaire technique spécifique. Ce glossaire complet vous permet de maîtriser les termes essentiels du secteur portuaire et maritime : TEU, transbordement, tirant d''eau, et bien plus.',
  'Les ports sont des hubs stratégiques pour le commerce mondial. Mais derrière cette efficacité se cache un vocabulaire technique.',
  'Actualités Portuaires',
  ARRAY['glossaire', 'vocabulaire', 'maritime', 'logistique', 'formation'],
  'https://siportevent.com/wp-content/uploads/2024/vocabulaire-port.jpg',
  NOW() - INTERVAL '12 days',
  0,
  'SIPORTS Event',
  'https://siportevent.com/glossaire-portuaire/'
),
(
  'Gouvernance portuaire en Afrique : autonomie ou centralisation, quel avenir ?',
  'La gouvernance est le nerf de la guerre portuaire. Entre centralisation étatique, autonomie locale et partenariats public-privé, les modèles de gestion varient considérablement d''un pays à l''autre en Afrique. Analyse des différentes approches et de leurs impacts sur la performance portuaire.',
  'La gouvernance est le nerf de la guerre portuaire. Entre centralisation étatique, autonomie locale et PPP.',
  'Actualités Portuaires',
  ARRAY['gouvernance', 'Afrique', 'gestion portuaire', 'politique'],
  'https://siportevent.com/wp-content/uploads/2024/gouvernance-ports.jpg',
  NOW() - INTERVAL '15 days',
  0,
  'SIPORTS Event',
  'https://siportevent.com/gouvernance-portuaire-en-afrique/'
),
(
  'IA Portuaire : Comment l''Intelligence Artificielle Résout les Défis Logistiques des Ports',
  'Les ports sont les artères vitales du commerce mondial. Pourtant, ces hubs logistiques complexes sont confrontés à des défis croissants : congestion, optimisation des flux, maintenance prédictive. L''intelligence artificielle apporte des solutions concrètes pour améliorer l''efficacité opérationnelle.',
  'Les ports sont les artères vitales du commerce mondial. L''IA apporte des solutions aux défis logistiques.',
  'Actualités Portuaires',
  ARRAY['IA', 'intelligence artificielle', 'logistique', 'innovation', 'technologie'],
  'https://siportevent.com/wp-content/uploads/2024/ia-portuaire.jpg',
  NOW() - INTERVAL '18 days',
  0,
  'SIPORTS Event',
  'https://siportevent.com/ia-portuaire-defis-logistiques-ports/'
)
ON CONFLICT (id) DO NOTHING;

-- Vérifier le résultat
SELECT COUNT(*) as total_articles FROM news_articles;
SELECT title, author, source_url FROM news_articles ORDER BY published_at DESC;

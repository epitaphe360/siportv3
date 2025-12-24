-- Script pour remplacer toutes les références à l'Algérie par le Maroc
-- À exécuter dans Supabase SQL Editor

-- 1. Mettre à jour media_contents
UPDATE media_contents SET 
  title = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(title, 
    'Algérie', 'Maroc'), 
    'algérie', 'Maroc'), 
    'algérienne', 'marocaine'), 
    'algérien', 'marocain'), 
    'algériens', 'marocains'), 
    'algériennes', 'marocaines'),
  description = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(description, 
    'Algérie', 'Maroc'), 
    'algérie', 'Maroc'), 
    'algérienne', 'marocaine'), 
    'algérien', 'marocain'), 
    'algériens', 'marocains'), 
    'algériennes', 'marocaines')
WHERE title ILIKE '%algéri%' OR description ILIKE '%algéri%';

-- 2. Mettre à jour les speakers dans media_contents (JSONB)
UPDATE media_contents SET 
  speakers = REPLACE(speakers::text, 'Algérie Ports', 'Marsa Maroc')::jsonb
WHERE speakers::text ILIKE '%Algérie%';

UPDATE media_contents SET 
  speakers = REPLACE(speakers::text, 'PortTech DZ', 'PortTech Maroc')::jsonb
WHERE speakers::text ILIKE '%DZ%';

-- 3. Mettre à jour salon_config
UPDATE salon_config SET 
  location = REPLACE(REPLACE(location, 'Alger', 'Casablanca'), 'Algérie', 'Maroc'),
  description = REPLACE(description, 'Algérie', 'Maroc')
WHERE location ILIKE '%algéri%' OR description ILIKE '%algéri%' OR location ILIKE '%Alger%';

-- 4. Mettre à jour events
UPDATE events SET 
  title = REPLACE(REPLACE(REPLACE(title, 'Algérie', 'Maroc'), 'algérienne', 'marocaine'), 'algérien', 'marocain'),
  description = REPLACE(REPLACE(REPLACE(description, 'Algérie', 'Maroc'), 'algérienne', 'marocaine'), 'algérien', 'marocain')
WHERE title ILIKE '%algéri%' OR description ILIKE '%algéri%';

-- 5. Mettre à jour news_articles
UPDATE news_articles SET 
  title = REPLACE(REPLACE(REPLACE(title, 'Algérie', 'Maroc'), 'algérienne', 'marocaine'), 'algérien', 'marocain'),
  content = REPLACE(REPLACE(REPLACE(content, 'Algérie', 'Maroc'), 'algérienne', 'marocaine'), 'algérien', 'marocain')
WHERE title ILIKE '%algéri%' OR content ILIKE '%algéri%';

-- 6. Vérification des modifications
SELECT 'media_contents avec Algérie:' as check_table, COUNT(*) as count FROM media_contents WHERE title ILIKE '%algéri%' OR description ILIKE '%algéri%'
UNION ALL
SELECT 'events avec Algérie:', COUNT(*) FROM events WHERE title ILIKE '%algéri%' OR description ILIKE '%algéri%'
UNION ALL
SELECT 'news_articles avec Algérie:', COUNT(*) FROM news_articles WHERE title ILIKE '%algéri%' OR content ILIKE '%algéri%';

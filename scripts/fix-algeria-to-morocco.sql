-- Script pour remplacer toutes les références à l'Algérie par le Maroc
-- À exécuter dans Supabase SQL Editor

-- 1. Mettre à jour media_contents
UPDATE media_contents SET 
  title = REPLACE(title, 'Algérie', 'Maroc'),
  title = REPLACE(title, 'algérie', 'Maroc'),
  title = REPLACE(title, 'algérienne', 'marocaine'),
  title = REPLACE(title, 'algérien', 'marocain'),
  title = REPLACE(title, 'algériens', 'marocains'),
  title = REPLACE(title, 'algériennes', 'marocaines'),
  description = REPLACE(description, 'Algérie', 'Maroc'),
  description = REPLACE(description, 'algérie', 'Maroc'),
  description = REPLACE(description, 'algérienne', 'marocaine'),
  description = REPLACE(description, 'algérien', 'marocain'),
  description = REPLACE(description, 'algériens', 'marocains'),
  description = REPLACE(description, 'algériennes', 'marocaines')
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
  location = REPLACE(location, 'Alger', 'Casablanca'),
  location = REPLACE(location, 'Algérie', 'Maroc'),
  description = REPLACE(description, 'Algérie', 'Maroc')
WHERE location ILIKE '%algéri%' OR description ILIKE '%algéri%' OR location ILIKE '%Alger%';

-- 4. Mettre à jour events
UPDATE events SET 
  title = REPLACE(title, 'Algérie', 'Maroc'),
  title = REPLACE(title, 'algérienne', 'marocaine'),
  title = REPLACE(title, 'algérien', 'marocain'),
  description = REPLACE(description, 'Algérie', 'Maroc'),
  description = REPLACE(description, 'algérienne', 'marocaine'),
  description = REPLACE(description, 'algérien', 'marocain')
WHERE title ILIKE '%algéri%' OR description ILIKE '%algéri%';

-- 5. Mettre à jour news_articles
UPDATE news_articles SET 
  title = REPLACE(title, 'Algérie', 'Maroc'),
  title = REPLACE(title, 'algérienne', 'marocaine'),
  title = REPLACE(title, 'algérien', 'marocain'),
  content = REPLACE(content, 'Algérie', 'Maroc'),
  content = REPLACE(content, 'algérienne', 'marocaine'),
  content = REPLACE(content, 'algérien', 'marocain')
WHERE title ILIKE '%algéri%' OR content ILIKE '%algéri%';

-- 6. Vérification des modifications
SELECT 'media_contents avec Algérie:' as check_table, COUNT(*) as count FROM media_contents WHERE title ILIKE '%algéri%' OR description ILIKE '%algéri%'
UNION ALL
SELECT 'events avec Algérie:', COUNT(*) FROM events WHERE title ILIKE '%algéri%' OR description ILIKE '%algéri%'
UNION ALL
SELECT 'news_articles avec Algérie:', COUNT(*) FROM news_articles WHERE title ILIKE '%algéri%' OR content ILIKE '%algéri%';

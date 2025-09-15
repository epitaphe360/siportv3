/*
INSTRUCTIONS POUR FIXER LES POLITIQUES RLS DANS L'INTERFACE SUPABASE

1. Connectez-vous à votre tableau de bord Supabase
2. Allez dans l'onglet "SQL Editor"
3. Créez une nouvelle requête
4. Copiez et collez tout le code ci-dessous
5. Exécutez la requête
*/

DO $$ 
BEGIN
  -- 1. Fixer les politiques RLS pour les actualités (news_articles)
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'news_articles') THEN
    -- Désactiver RLS temporairement
    ALTER TABLE news_articles DISABLE ROW LEVEL SECURITY;
    
    -- Supprimer les anciennes politiques si elles existent
    DROP POLICY IF EXISTS "Anyone can read news_articles" ON news_articles;
    DROP POLICY IF EXISTS "Public can read news_articles" ON news_articles;
    
    -- Réactiver RLS
    ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
    
    -- Créer une nouvelle politique permettant à tous de lire les actualités publiées
    CREATE POLICY "Public can read news_articles"
      ON news_articles
      FOR SELECT
      TO public
      USING (published_at IS NOT NULL);
      
    RAISE NOTICE 'Politiques RLS pour news_articles mises à jour avec succès';
  ELSE
    RAISE NOTICE 'Table news_articles non trouvée';
  END IF;
  
  -- 2. Fixer les politiques RLS pour les produits (products)
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'products') THEN
    -- Désactiver RLS temporairement
    ALTER TABLE products DISABLE ROW LEVEL SECURITY;
    
    -- Supprimer les anciennes politiques si elles existent
    DROP POLICY IF EXISTS "Anyone can read products" ON products;
    DROP POLICY IF EXISTS "Public can read products" ON products;
    
    -- Réactiver RLS
    ALTER TABLE products ENABLE ROW LEVEL SECURITY;
    
    -- Créer une nouvelle politique permettant à tous de lire les produits publiés
    CREATE POLICY "Public can read products"
      ON products
      FOR SELECT
      TO public
      USING (featured = true);
      
    RAISE NOTICE 'Politiques RLS pour products mises à jour avec succès';
  ELSE
    RAISE NOTICE 'Table products non trouvée';
  END IF;
  
  -- 3. Fixer les politiques RLS pour les mini-sites (mini_sites)
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'mini_sites') THEN
    -- Désactiver RLS temporairement
    ALTER TABLE mini_sites DISABLE ROW LEVEL SECURITY;
    
    -- Supprimer les anciennes politiques si elles existent
    DROP POLICY IF EXISTS "Anyone can read mini-sites" ON mini_sites;
    DROP POLICY IF EXISTS "Public can read mini-sites" ON mini_sites;
    DROP POLICY IF EXISTS "Anyone can read published mini-sites" ON mini_sites;
    
    -- Réactiver RLS
    ALTER TABLE mini_sites ENABLE ROW LEVEL SECURITY;
    
    -- Créer une nouvelle politique permettant à tous de lire les mini-sites publiés
    CREATE POLICY "Public can read mini-sites"
      ON mini_sites
      FOR SELECT
      TO public
      USING (published = true);
      
    RAISE NOTICE 'Politiques RLS pour mini_sites mises à jour avec succès';
  ELSE
    RAISE NOTICE 'Table mini_sites non trouvée';
  END IF;
  
  RAISE NOTICE 'Toutes les politiques RLS ont été mises à jour';
END $$;

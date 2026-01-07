-- ============================================================================
-- CRÉATION TABLE SITE_TEMPLATES ET INSERTION DES TEMPLATES
-- Date: 4 Janvier 2026
-- Description: Créer la table et insérer les 10 templates de mini-sites
-- ============================================================================

-- 📌 INSTRUCTIONS:
-- 1. Allez sur https://supabase.com/dashboard
-- 2. Sélectionnez votre projet (eqjoqgpbxhsfgcovipgu)
-- 3. Cliquez sur "SQL Editor" dans le menu de gauche
-- 4. Cliquez sur "New query"
-- 5. Copiez tout ce fichier et collez-le
-- 6. Cliquez sur "Run" (ou Ctrl+Enter)
-- 7. Attendez le message de succès
-- 8. Les templates seront immédiatement disponibles!

BEGIN;

-- ============================================================================
-- 1. CRÉATION DE LA TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.site_templates (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN (
    'corporate', 'ecommerce', 'portfolio', 'event',
    'landing', 'startup', 'agency', 'product', 'blog', 'minimal'
  )),
  thumbnail text,
  sections jsonb DEFAULT '[]'::jsonb,
  premium boolean DEFAULT false,
  popularity integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_site_templates_category ON public.site_templates(category);
CREATE INDEX IF NOT EXISTS idx_site_templates_popularity ON public.site_templates(popularity DESC);
CREATE INDEX IF NOT EXISTS idx_site_templates_premium ON public.site_templates(premium);

-- RLS (Row Level Security)
ALTER TABLE public.site_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view site templates" ON public.site_templates;
CREATE POLICY "Anyone can view site templates" ON public.site_templates
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage site templates" ON public.site_templates;
CREATE POLICY "Admins can manage site templates" ON public.site_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND (users.type = 'admin' OR users.role = 'admin')
    )
  );

-- ============================================================================
-- 2. INSERTION DES 10 TEMPLATES
-- ============================================================================

-- Template 1: Corporate Professional
INSERT INTO public.site_templates (id, name, description, category, thumbnail, sections, premium, popularity)
VALUES (
  'template-corporate-1',
  'Corporate Professional',
  'Template professionnel pour entreprises établies avec sections complètes',
  'corporate',
  'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600',
  '[
    {"id": "hero-1", "type": "hero", "content": {"title": "Solutions d''Excellence pour l''Industrie Maritime", "subtitle": "Leader mondial en technologie portuaire depuis 1995", "backgroundImage": "", "ctaText": "Découvrir nos solutions", "ctaLink": "#products"}, "order": 0, "visible": true},
    {"id": "about-1", "type": "about", "content": {"title": "Notre Expertise", "description": "Avec plus de 25 ans d''expérience, nous accompagnons les ports du monde entier dans leur transformation digitale.", "image": ""}, "order": 1, "visible": true},
    {"id": "products-1", "type": "products", "content": {"title": "Nos Solutions", "items": []}, "order": 2, "visible": true},
    {"id": "contact-1", "type": "contact", "content": {"title": "Contactez-nous", "email": "contact@example.com", "phone": "+212 5XX XXX XXX", "address": "", "formFields": ["name", "email", "company", "message"]}, "order": 3, "visible": true}
  ]'::jsonb,
  false,
  250
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  sections = EXCLUDED.sections,
  popularity = EXCLUDED.popularity;

-- Template 2: Startup Moderne
INSERT INTO public.site_templates (id, name, description, category, thumbnail, sections, premium, popularity)
VALUES (
  'template-startup-1',
  'Startup Moderne',
  'Design moderne et dynamique pour startups innovantes',
  'startup',
  'https://images.pexels.com/photos/3183153/pexels-photo-3183153.jpeg?auto=compress&cs=tinysrgb&w=600',
  '[
    {"id": "hero-1", "type": "hero", "content": {"title": "Innovation Maritime 🚀", "subtitle": "La prochaine génération de solutions portuaires intelligentes", "backgroundImage": "", "ctaText": "Rejoignez la révolution", "ctaLink": "#about"}, "order": 0, "visible": true},
    {"id": "about-1", "type": "about", "content": {"title": "Notre Mission", "description": "Révolutionner l''industrie maritime avec l''IA et l''IoT pour créer des ports plus efficaces et durables.", "image": ""}, "order": 1, "visible": true}
  ]'::jsonb,
  false,
  180
)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sections = EXCLUDED.sections;

-- Template 3: E-commerce Pro
INSERT INTO public.site_templates (id, name, description, category, thumbnail, sections, premium, popularity)
VALUES (
  'template-ecommerce-1',
  'E-commerce Pro',
  'Template optimisé pour la vente en ligne avec galerie produits',
  'ecommerce',
  'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=600',
  '[
    {"id": "hero-1", "type": "hero", "content": {"title": "Équipements Maritimes Premium", "subtitle": "Livraison mondiale • Garantie 5 ans • Support 24/7", "backgroundImage": "", "ctaText": "Voir le catalogue", "ctaLink": "#products"}, "order": 0, "visible": true},
    {"id": "products-1", "type": "products", "content": {"title": "Nos Produits Phares", "items": []}, "order": 1, "visible": true}
  ]'::jsonb,
  true,
  320
)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sections = EXCLUDED.sections;

-- Template 4: Landing Page Impact
INSERT INTO public.site_templates (id, name, description, category, thumbnail, sections, premium, popularity)
VALUES (
  'template-landing-1',
  'Landing Page Impact',
  'Page d''atterrissage avec fort taux de conversion',
  'landing',
  'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=600',
  '[
    {"id": "hero-1", "type": "hero", "content": {"title": "Transformez Votre Port en Hub Intelligent", "subtitle": "Augmentez l''efficacité de 40% dès le premier mois", "backgroundImage": "", "ctaText": "Demander une démo gratuite", "ctaLink": "#contact"}, "order": 0, "visible": true},
    {"id": "contact-1", "type": "contact", "content": {"title": "Démarrez Maintenant", "email": "demo@example.com", "phone": "+212 5XX XXX XXX", "address": "", "formFields": ["name", "email", "company", "phone"]}, "order": 2, "visible": true}
  ]'::jsonb,
  false,
  200
)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sections = EXCLUDED.sections;

-- Template 5: Portfolio Créatif
INSERT INTO public.site_templates (id, name, description, category, thumbnail, sections, premium, popularity)
VALUES (
  'template-portfolio-1',
  'Portfolio Créatif',
  'Présentez vos réalisations de manière élégante',
  'portfolio',
  'https://images.pexels.com/photos/3184296/pexels-photo-3184296.jpeg?auto=compress&cs=tinysrgb&w=600',
  '[
    {"id": "hero-1", "type": "hero", "content": {"title": "Nos Réalisations d''Excellence", "subtitle": "Plus de 200 projets maritimes réussis à travers le monde", "backgroundImage": "", "ctaText": "Découvrir nos projets", "ctaLink": "#products"}, "order": 0, "visible": true},
    {"id": "products-1", "type": "products", "content": {"title": "Projets Phares", "items": []}, "order": 1, "visible": true}
  ]'::jsonb,
  false,
  150
)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sections = EXCLUDED.sections;

-- Template 6: Événement Premium
INSERT INTO public.site_templates (id, name, description, category, thumbnail, sections, premium, popularity)
VALUES (
  'template-event-1',
  'Événement Premium',
  'Template pour salons et événements professionnels',
  'event',
  'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=600',
  '[
    {"id": "hero-1", "type": "hero", "content": {"title": "Salon Maritime International 2026", "subtitle": "25-28 Juin • Casablanca • Plus de 10 000 visiteurs attendus", "backgroundImage": "", "ctaText": "Réserver votre stand", "ctaLink": "#contact"}, "order": 0, "visible": true},
    {"id": "about-1", "type": "about", "content": {"title": "À Propos de l''Événement", "description": "Le plus grand rassemblement de professionnels du secteur maritime en Afrique. Rencontrez les leaders du secteur.", "image": ""}, "order": 1, "visible": true}
  ]'::jsonb,
  true,
  280
)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sections = EXCLUDED.sections;

-- Template 7: Agence Digitale
INSERT INTO public.site_templates (id, name, description, category, thumbnail, sections, premium, popularity)
VALUES (
  'template-agency-1',
  'Agence Digitale',
  'Pour agences de communication et marketing',
  'agency',
  'https://images.pexels.com/photos/3184357/pexels-photo-3184357.jpeg?auto=compress&cs=tinysrgb&w=600',
  '[
    {"id": "hero-1", "type": "hero", "content": {"title": "Votre Partenaire Marketing Maritime", "subtitle": "Stratégies digitales qui propulsent votre business", "backgroundImage": "", "ctaText": "Parlons de votre projet", "ctaLink": "#contact"}, "order": 0, "visible": true}
  ]'::jsonb,
  false,
  140
)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sections = EXCLUDED.sections;

-- Template 8: Showcase Produit
INSERT INTO public.site_templates (id, name, description, category, thumbnail, sections, premium, popularity)
VALUES (
  'template-product-1',
  'Showcase Produit',
  'Mettez en valeur un produit ou service unique',
  'product',
  'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=600',
  '[
    {"id": "hero-1", "type": "hero", "content": {"title": "Système de Gestion Portuaire NextGen", "subtitle": "L''outil ultime pour optimiser vos opérations portuaires", "backgroundImage": "", "ctaText": "Essayer gratuitement", "ctaLink": "#contact"}, "order": 0, "visible": true},
    {"id": "products-1", "type": "products", "content": {"title": "Fonctionnalités Clés", "items": []}, "order": 1, "visible": true}
  ]'::jsonb,
  false,
  190
)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sections = EXCLUDED.sections;

-- Template 9: Blog Professionnel
INSERT INTO public.site_templates (id, name, description, category, thumbnail, sections, premium, popularity)
VALUES (
  'template-blog-1',
  'Blog Professionnel',
  'Partagez votre expertise et actualités du secteur',
  'blog',
  'https://images.pexels.com/photos/3184433/pexels-photo-3184433.jpeg?auto=compress&cs=tinysrgb&w=600',
  '[
    {"id": "hero-1", "type": "hero", "content": {"title": "Actualités & Insights Maritimes", "subtitle": "Les dernières tendances et innovations du secteur", "backgroundImage": "", "ctaText": "Lire nos articles", "ctaLink": "#about"}, "order": 0, "visible": true}
  ]'::jsonb,
  false,
  120
)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sections = EXCLUDED.sections;

-- Template 10: Minimaliste Élégant
INSERT INTO public.site_templates (id, name, description, category, thumbnail, sections, premium, popularity)
VALUES (
  'template-minimal-1',
  'Minimaliste Élégant',
  'Design épuré et moderne pour un impact maximal',
  'minimal',
  'https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=600',
  '[
    {"id": "hero-1", "type": "hero", "content": {"title": "Simplicité & Performance", "subtitle": "L''essentiel, rien de plus", "backgroundImage": "", "ctaText": "En savoir plus", "ctaLink": "#about"}, "order": 0, "visible": true},
    {"id": "contact-1", "type": "contact", "content": {"title": "Contact", "email": "contact@example.com", "phone": "", "address": "", "formFields": ["name", "email", "message"]}, "order": 1, "visible": true}
  ]'::jsonb,
  false,
  160
)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sections = EXCLUDED.sections;

COMMIT;

-- ============================================================================
-- 3. VÉRIFICATION
-- ============================================================================

-- Afficher tous les templates créés
SELECT 
  id, 
  name, 
  category, 
  premium,
  popularity,
  jsonb_array_length(sections) as nb_sections
FROM public.site_templates
ORDER BY popularity DESC;

-- ============================================================================
-- ✅ SUCCÈS!
-- ============================================================================
-- Les 10 templates sont maintenant disponibles dans votre application!
-- 
-- Pour les voir:
-- 1. Connectez-vous en tant qu'exposant
-- 2. Allez sur /exhibitor/minisite/create
-- 3. Cliquez sur "Partir d'un template"
-- 4. Vous verrez les 10 templates avec leurs aperçus!
-- ============================================================================

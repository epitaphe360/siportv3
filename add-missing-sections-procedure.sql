CREATE OR REPLACE PROCEDURE add_missing_sections_to_minisites()
LANGUAGE plpgsql
AS $$
BEGIN
  -- Section Certifications
  UPDATE mini_sites
  SET 
    sections = sections || jsonb_build_array(
      jsonb_build_object(
        'type', 'certifications',
        'content', jsonb_build_object(
          'title', 'Certifications & Accréditations',
          'description', 'Nos compétences reconnues par les meilleurs organismes du secteur',
          'items', jsonb_build_array(
            jsonb_build_object(
              'name', 'ISO 9001',
              'description', 'Certification de management de la qualité',
              'image', 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=300&q=80',
              'year', '2022'
            ),
            jsonb_build_object(
              'name', 'ISO 14001',
              'description', 'Système de management environnemental',
              'image', 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=300&q=80',
              'year', '2021'
            ),
            jsonb_build_object(
              'name', 'OHSAS 18001',
              'description', 'Système de management de la santé et de la sécurité au travail',
              'image', 'https://images.unsplash.com/photo-1631815588090-d1bcbe9b4b01?auto=format&fit=crop&w=300&q=80',
              'year', '2023'
            )
          )
        )
      )
    ),
    last_updated = NOW()
  WHERE 
    NOT EXISTS (
      SELECT 1 FROM jsonb_array_elements(sections) AS section
      WHERE section->>'type' = 'certifications'
    );

  -- Section Gallery
  UPDATE mini_sites
  SET 
    sections = sections || jsonb_build_array(
      jsonb_build_object(
        'type', 'gallery',
        'content', jsonb_build_object(
          'title', 'Galerie & Réalisations',
          'description', 'Découvrez nos projets et réalisations en images',
          'images', jsonb_build_array(
            jsonb_build_object(
              'url', 'https://images.unsplash.com/photo-1520363147827-3f2a8da130e1?auto=format&fit=crop&w=800&q=80',
              'caption', 'Installation de systèmes de navigation dans le port de Rotterdam'
            ),
            jsonb_build_object(
              'url', 'https://images.unsplash.com/photo-1494412651409-8963ce7935a7?auto=format&fit=crop&w=800&q=80',
              'caption', 'Centre de contrôle du trafic maritime à Singapour'
            ),
            jsonb_build_object(
              'url', 'https://images.unsplash.com/photo-1602193290354-b5df40aa39a4?auto=format&fit=crop&w=800&q=80',
              'caption', 'Système d\'automatisation portuaire à Dubai'
            ),
            jsonb_build_object(
              'url', 'https://images.unsplash.com/photo-1574100004036-f0807f2d2ee6?auto=format&fit=crop&w=800&q=80',
              'caption', 'Installation de notre système EcoFuel à Hambourg'
            )
          )
        )
      )
    ),
    last_updated = NOW()
  WHERE 
    NOT EXISTS (
      SELECT 1 FROM jsonb_array_elements(sections) AS section
      WHERE section->>'type' = 'gallery'
    );

  -- Section Testimonials
  UPDATE mini_sites
  SET 
    sections = sections || jsonb_build_array(
      jsonb_build_object(
        'type', 'testimonials',
        'content', jsonb_build_object(
          'title', 'Témoignages Clients',
          'description', 'Ce que disent nos partenaires de nos solutions',
          'items', jsonb_build_array(
            jsonb_build_object(
              'name', 'Jean Dupont',
              'position', 'Directeur des Opérations, Port de Marseille',
              'text', 'Depuis l\'installation de leurs systèmes, nous avons constaté une amélioration de 30% de notre efficacité opérationnelle. Un investissement qui a rapidement porté ses fruits.',
              'avatar', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&h=200&q=80'
            ),
            jsonb_build_object(
              'name', 'Marie Lambert',
              'position', 'Responsable Logistique, Compagnie Maritime Internationale',
              'text', 'Leur service client est exceptionnel. Même face à des défis techniques complexes, leur équipe a toujours su trouver des solutions adaptées à nos besoins spécifiques.',
              'avatar', 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&h=200&q=80'
            ),
            jsonb_build_object(
              'name', 'Ahmed Khalil',
              'position', 'CEO, Dubai Port Authority',
              'text', 'Une collaboration fructueuse qui dure depuis plus de 5 ans. Leur capacité d\'innovation et leur compréhension des enjeux portuaires en font un partenaire stratégique incontournable.',
              'avatar', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80'
            )
          )
        )
      )
    ),
    last_updated = NOW()
  WHERE 
    NOT EXISTS (
      SELECT 1 FROM jsonb_array_elements(sections) AS section
      WHERE section->>'type' = 'testimonials'
    );
END;
$$;

-- Execute the procedure to add missing sections
CALL add_missing_sections_to_minisites();

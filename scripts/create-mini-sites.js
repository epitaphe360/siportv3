import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseKey);

const exhibitorEmails = [
  { email: 'exhibitor-9m@test.siport.com', standSize: '9m²' },
  { email: 'exhibitor-18m@test.siport.com', standSize: '18m²' },
  { email: 'exhibitor-36m@test.siport.com', standSize: '36m²' },
  { email: 'exhibitor-54m@test.siport.com', standSize: '54m²' }
];

async function createMiniSites() {
  console.log('🌐 Création des mini sites pour les exposants...\n');

  try {
    for (const { email, standSize } of exhibitorEmails) {
      console.log(`\n📧 Traitement de ${email}...`);

      // Récupérer le user
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, email, name')
        .eq('email', email)
        .single();

      if (userError || !user) {
        console.log(`   ❌ User non trouvé`);
        continue;
      }

      // Récupérer l'exhibitor
      const { data: exhibitor, error: exhibitorError } = await supabase
        .from('exhibitors')
        .select('id, company_name, description, sector')
        .eq('user_id', user.id)
        .single();

      if (exhibitorError || !exhibitor) {
        console.log(`   ❌ Exhibitor non trouvé`);
        continue;
      }

      console.log(`   ✅ Exhibitor: ${exhibitor.company_name}`);

      // Créer le slug
      const slug = exhibitor.company_name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Créer le mini site avec la structure originale
      const miniSiteData = {
        exhibitor_id: exhibitor.id,
        theme: 'modern',
        custom_colors: {
          primary: '#1e40af',
          secondary: '#3b82f6',
          accent: '#60a5fa'
        },
        sections: [
          {
            type: 'hero',
            title: `Bienvenue chez ${exhibitor.company_name}`,
            subtitle: `Stand ${standSize} - ${exhibitor.sector}`,
            content: exhibitor.description || `${exhibitor.company_name} est un acteur majeur du secteur maritime.`
          },
          {
            type: 'about',
            title: 'À propos de nous',
            content: exhibitor.description || `${exhibitor.company_name} propose des solutions innovantes pour le secteur maritime et portuaire.`
          },
          {
            type: 'products',
            title: 'Nos Produits & Services',
            content: 'Découvrez notre gamme complète de produits et services adaptés à vos besoins.'
          },
          {
            type: 'contact',
            title: 'Contactez-nous',
            content: `Email: ${email}\nTéléphone: +33 1 23 45 67 89\nAdresse: Port de Commerce, France`
          }
        ],
        published: true,
        views: 0
      };

      const { data: miniSite, error: miniSiteError } = await supabase
        .from('mini_sites')
        .insert(miniSiteData)
        .select()
        .single();

      if (miniSiteError) {
        console.log(`   ❌ Erreur création mini site:`, miniSiteError);
      } else {
        console.log(`   ✅ Mini site créé`);
        console.log(`      - Thème: ${miniSite.theme}`);
        console.log(`      - Publié: ${miniSite.published ? 'Oui' : 'Non'}`);
        console.log(`      - Sections: ${miniSite.sections.length}`);
      }
    }

    // Vérification finale
    console.log('\n\n📊 Vérification finale:');
    const { count: miniSiteCount } = await supabase
      .from('mini_sites')
      .select('*', { count: 'exact', head: true });

    console.log(`   Total mini sites: ${miniSiteCount || 0}`);

    // Lister tous les mini sites créés
    const { data: allMiniSites } = await supabase
      .from('mini_sites')
      .select('id, theme, published, sections')
      .order('created_at', { ascending: false });

    console.log('\n✅ Mini sites disponibles:');
    allMiniSites?.forEach(site => {
      const heroSection = site.sections.find(s => s.type === 'hero');
      const title = heroSection?.title || 'Mini site';
      console.log(`   - ${title} (Thème: ${site.theme}) ${site.published ? '✅' : '❌'}`);
    });

    console.log('\n🎉 Création des mini sites terminée!');

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

createMiniSites();

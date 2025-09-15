import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Récupérer les variables d'environnement pour Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Les variables d\'environnement Supabase ne sont pas définies.');
  console.error('Assurez-vous d\'avoir défini VITE_SUPABASE_URL et VITE_SUPABASE_SERVICE_ROLE_KEY dans votre fichier .env');
  process.exit(1);
}

// Créer le client Supabase avec la clé de service (admin rights)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Articles d'actualités à ajouter
const newsArticles = [
  {
    title: "Nouveau terminal de conteneurs à Rotterdam",
    excerpt: "Le port de Rotterdam inaugure un nouveau terminal de conteneurs entièrement automatisé.",
    content: "Le port de Rotterdam a inauguré aujourd'hui son nouveau terminal de conteneurs entièrement automatisé. Cette infrastructure de pointe permettra d'augmenter la capacité du port de 25% et réduira les temps d'attente pour les navires. Équipé de grues autonomes et de véhicules guidés automatiquement, ce terminal représente un investissement de 500 millions d'euros et créera 200 emplois indirects.",
    author: "Marie Dufour",
    published_at: "2023-09-18T12:30:00.000Z",
    category: "Infrastructure",
    tags: ["Rotterdam", "Automatisation", "Terminal", "Innovation"],
    featured: true,
    image: "https://images.unsplash.com/photo-1494412651409-8963ce7935a7",
    read_time: 5,
    source: "SIPORTS Magazine",
    views: 0
  },
  {
    title: "Accord historique sur la décarbonation du transport maritime",
    excerpt: "L'OMI annonce un accord historique visant à réduire les émissions de carbone du transport maritime de 50% d'ici 2050.",
    content: "L'Organisation Maritime Internationale (OMI) a annoncé aujourd'hui un accord historique entre 175 pays pour réduire les émissions de carbone du transport maritime de 50% d'ici 2050 par rapport aux niveaux de 2008. Cet accord prévoit des investissements massifs dans les technologies propres et les carburants alternatifs comme l'hydrogène et l'ammoniac. Les experts estiment que cette décision pourrait accélérer la transition énergétique du secteur maritime mondial.",
    author: "Jean Rivière",
    published_at: "2023-08-22T09:15:00.000Z",
    category: "Environnement",
    tags: ["Décarbonation", "OMI", "Transport maritime", "Développement durable"],
    featured: true,
    image: "https://images.unsplash.com/photo-1605281317010-fe5ffe798166",
    read_time: 7,
    source: "SIPORTS Magazine",
    views: 0
  },
  {
    title: "Le port de Singapour teste l'intelligence artificielle pour optimiser le trafic",
    excerpt: "Une nouvelle solution basée sur l'IA permet de réduire de 20% les temps d'attente des navires au port de Singapour.",
    content: "Le port de Singapour, l'un des plus actifs au monde, a déployé une solution d'intelligence artificielle qui a permis de réduire de 20% les temps d'attente des navires. Développée en collaboration avec l'Université Nationale de Singapour, cette technologie analyse en temps réel des milliers de variables incluant les conditions météorologiques, le trafic maritime et les capacités des terminaux pour optimiser les plannings d'accostage. Selon les autorités portuaires, cette innovation pourrait générer des économies de 30 millions de dollars par an.",
    author: "Sophia Chen",
    published_at: "2023-10-05T14:45:00.000Z",
    category: "Technologie",
    tags: ["Intelligence artificielle", "Singapour", "Optimisation", "Smart ports"],
    featured: false,
    image: "https://images.unsplash.com/photo-1542944380-3c1d5b3c5aba",
    read_time: 6,
    source: "SIPORTS Magazine",
    views: 0
  }
];

async function seedNewsArticles() {
  console.log('🌱 Seeding test news articles...');
  
  try {
    // Supprimer d'abord les articles existants pour éviter les duplications
    console.log('🧹 Nettoyage des articles existants...');
    const { error: deleteError } = await supabase
      .from('news_articles')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Condition pour s'assurer que la suppression s'applique
    
    if (deleteError) {
      console.error('❌ Erreur lors de la suppression des articles existants:', deleteError);
    } else {
      console.log('✅ Articles existants supprimés avec succès');
    }
    
    // Ajouter les nouveaux articles
    console.log('📝 Ajout des nouveaux articles...');
    const { data, error } = await supabase
      .from('news_articles')
      .insert(newsArticles)
      .select();
      
    if (error) {
      console.error('❌ Erreur lors de la création des articles:', error);
    } else {
      console.log(`✅ ${data.length} articles d'actualités créés avec succès !`);
      console.log('Articles ajoutés:');
      data.forEach(article => {
        console.log(`- ${article.title} (${article.category})`);
      });
    }
  } catch (err) {
    console.error('❌ Exception non gérée:', err);
  }
}

// Fonction pour récupérer les exposants existants
async function getExistingExhibitors() {
  const { data, error } = await supabase
    .from('exhibitors')
    .select('id, company_name')
    .limit(5);
  
  if (error) {
    console.error('❌ Erreur lors de la récupération des exposants:', error);
    return [];
  }
  
  return data || [];
}

// Créer des produits pour les exposants
async function seedProducts() {
  console.log('\n🌱 Seeding test products...');
  
  // Récupérer les exposants existants
  const exhibitors = await getExistingExhibitors();
  console.log(`📊 Exposants trouvés : ${exhibitors.length}`);
  
  if (exhibitors.length === 0) {
    console.log('❓ Aucun exposant trouvé. Vérifiez votre base de données.');
    return;
  }
  
  try {
    // Supprimer d'abord les produits existants
    console.log('🧹 Nettoyage des produits existants...');
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (deleteError) {
      console.error('❌ Erreur lors de la suppression des produits existants:', deleteError);
    } else {
      console.log('✅ Produits existants supprimés avec succès');
    }
    
    let productsCreated = 0;
    
    // Créer des produits pour chaque exposant
    for (const exhibitor of exhibitors) {
      console.log(`📦 Création de produits pour ${exhibitor.company_name}...`);
      
      // Produits adaptés à chaque exposant
      const products = [
        {
          exhibitor_id: exhibitor.id,
          name: `${Math.random().toString(36).substring(7).toUpperCase()}-Pro`,
          description: `Solution professionnelle de ${exhibitor.company_name} pour l'industrie maritime.`,
          category: "Navigation",
          images: ["https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=800&q=80"],
          specifications: "Certification de classe A, interface tactile, connectivité cloud",
          price: 9500 + Math.floor(Math.random() * 5000),
          featured: true
        },
        {
          exhibitor_id: exhibitor.id,
          name: `${Math.random().toString(36).substring(7).toUpperCase()}-Connect`,
          description: `Système de communication avancé développé par ${exhibitor.company_name}.`,
          category: "Communication",
          images: ["https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&w=800&q=80"],
          specifications: "Portée 50km, batterie 48h, résistant à l'eau",
          price: 4500 + Math.floor(Math.random() * 2000),
          featured: Math.random() > 0.5
        }
      ];
      
      // Insérer les produits
      const { data, error } = await supabase
        .from('products')
        .insert(products)
        .select();
        
      if (error) {
        console.error(`❌ Erreur lors de la création des produits pour ${exhibitor.company_name}:`, error);
      } else {
        console.log(`✅ ${data.length} produits créés pour ${exhibitor.company_name}`);
        productsCreated += data.length;
      }
    }
    
    console.log(`\n🎉 Total : ${productsCreated} produits créés avec succès !`);
  } catch (err) {
    console.error('❌ Exception non gérée:', err);
  }
}

// Créer des mini-sites pour les exposants
async function seedMiniSites() {
  console.log('\n🌱 Seeding test mini-sites...');
  
  // Récupérer les exposants existants
  const exhibitors = await getExistingExhibitors();
  console.log(`📊 Exposants trouvés : ${exhibitors.length}`);
  
  if (exhibitors.length === 0) {
    console.log('❓ Aucun exposant trouvé. Vérifiez votre base de données.');
    return;
  }
  
  try {
    // Supprimer d'abord les mini-sites existants
    console.log('🧹 Nettoyage des mini-sites existants...');
    const { error: deleteError } = await supabase
      .from('mini_sites')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (deleteError) {
      console.error('❌ Erreur lors de la suppression des mini-sites existants:', deleteError);
    } else {
      console.log('✅ Mini-sites existants supprimés avec succès');
    }
    
    let miniSitesCreated = 0;
    
    // Créer un mini-site pour chaque exposant
    for (const exhibitor of exhibitors) {
      console.log(`🏢 Création d'un mini-site pour ${exhibitor.company_name}...`);
      
      // Définir un thème et des couleurs
      const theme = Math.random() > 0.5 ? 'modern' : 'minimal';
      
      // Créer le mini-site
      const miniSite = {
        exhibitor_id: exhibitor.id,
        theme: theme,
        custom_colors: theme === 'modern' 
          ? { primary: '#1a365d', secondary: '#2b6cb0', accent: '#4299e1' }
          : { primary: '#2d3748', secondary: '#4a5568', accent: '#718096' },
        sections: [
          {
            type: 'hero',
            content: {
              title: exhibitor.company_name,
              subtitle: `Solutions innovantes pour l'industrie maritime - ${exhibitor.company_name}`,
              description: `Spécialiste des solutions maritimes et portuaires depuis plus de 15 ans.`,
              backgroundImage: 'https://images.unsplash.com/photo-1580091873836-0c109fa1e489?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwcm9maWxlLXBhZ2V8MXx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80'
            }
          },
          {
            type: 'about',
            content: {
              title: 'Notre expertise',
              text: `${exhibitor.company_name} est à la pointe de l'innovation dans l'industrie maritime. Nous développons des solutions technologiques qui permettent à nos clients d'optimiser leurs opérations, de réduire leurs coûts et d'améliorer leur empreinte environnementale.`,
              image: 'https://images.unsplash.com/photo-1534224039826-c7a0fb751ab5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80',
              values: ['Solutions innovantes', 'Expertise reconnue', 'Support technique', 'Présence internationale', 'Certifications & Accréditations']
            }
          }
        ],
        published: true,
        views: 0,
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      
      // Insérer le mini-site
      const { data, error } = await supabase
        .from('mini_sites')
        .insert(miniSite)
        .select();
        
      if (error) {
        console.error(`❌ Erreur lors de la création du mini-site pour ${exhibitor.company_name}:`, error);
      } else {
        console.log(`✅ Mini-site créé pour ${exhibitor.company_name}`);
        miniSitesCreated++;
      }
    }
    
    console.log(`\n🎉 Total : ${miniSitesCreated} mini-sites créés avec succès !`);
  } catch (err) {
    console.error('❌ Exception non gérée:', err);
  }
}

// Exécution principale
async function main() {
  try {
    await seedNewsArticles();
    await seedProducts();
    await seedMiniSites();
    
    console.log('\n✨ Seeding terminé avec succès !');
    console.log('N\'oubliez pas de redémarrer votre application pour voir les changements.');
  } catch (err) {
    console.error('❌ Erreur lors du seeding:', err);
  }
}

main();

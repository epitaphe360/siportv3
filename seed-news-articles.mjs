import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Récupérer les variables d'environnement pour Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Les variables d\'environnement Supabase ne sont pas définies.');
  process.exit(1);
}

// Créer le client Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Articles d'actualités à ajouter
const newsArticles = [
  {
    title: "Nouveau terminal de conteneurs à Rotterdam",
    excerpt: "Le port de Rotterdam inaugure un nouveau terminal de conteneurs entièrement automatisé.",
    content: "Le port de Rotterdam a inauguré aujourd'hui son nouveau terminal de conteneurs entièrement automatisé. Cette infrastructure de pointe permettra d'augmenter la capacité du port de 25% et réduira les temps d'attente pour les navires. Équipé de grues autonomes et de véhicules guidés automatiquement, ce terminal représente un investissement de 500 millions d'euros et créera 200 emplois indirects.",
    author: "Marie Dufour",
    publishedAt: "2023-09-18T12:30:00.000Z",
    category: "Infrastructure",
    tags: ["Rotterdam", "Automatisation", "Terminal", "Innovation"],
    featured: true,
    image: "https://images.unsplash.com/photo-1494412651409-8963ce7935a7",
    readTime: 5,
    source: "SIPORTS Magazine"
  },
  {
    title: "Accord historique sur la décarbonation du transport maritime",
    excerpt: "L'OMI annonce un accord historique visant à réduire les émissions de carbone du transport maritime de 50% d'ici 2050.",
    content: "L'Organisation Maritime Internationale (OMI) a annoncé aujourd'hui un accord historique entre 175 pays pour réduire les émissions de carbone du transport maritime de 50% d'ici 2050 par rapport aux niveaux de 2008. Cet accord prévoit des investissements massifs dans les technologies propres et les carburants alternatifs comme l'hydrogène et l'ammoniac. Les experts estiment que cette décision pourrait accélérer la transition énergétique du secteur maritime mondial.",
    author: "Jean Rivière",
    publishedAt: "2023-08-22T09:15:00.000Z",
    category: "Environnement",
    tags: ["Décarbonation", "OMI", "Transport maritime", "Développement durable"],
    featured: true,
    image: "https://images.unsplash.com/photo-1605281317010-fe5ffe798166",
    readTime: 7,
    source: "SIPORTS Magazine"
  },
  {
    title: "Le port de Singapour teste l'intelligence artificielle pour optimiser le trafic",
    excerpt: "Une nouvelle solution basée sur l'IA permet de réduire de 20% les temps d'attente des navires au port de Singapour.",
    content: "Le port de Singapour, l'un des plus actifs au monde, a déployé une solution d'intelligence artificielle qui a permis de réduire de 20% les temps d'attente des navires. Développée en collaboration avec l'Université Nationale de Singapour, cette technologie analyse en temps réel des milliers de variables incluant les conditions météorologiques, le trafic maritime et les capacités des terminaux pour optimiser les plannings d'accostage. Selon les autorités portuaires, cette innovation pourrait générer des économies de 30 millions de dollars par an.",
    author: "Sophia Chen",
    publishedAt: "2023-10-05T14:45:00.000Z",
    category: "Technologie",
    tags: ["Intelligence artificielle", "Singapour", "Optimisation", "Smart ports"],
    featured: false,
    image: "https://images.unsplash.com/photo-1542944380-3c1d5b3c5aba",
    readTime: 6,
    source: "SIPORTS Magazine"
  }
];

async function seedNewsArticles() {
  console.log('🌱 Seeding test news articles...');
  
  const createdArticles = [];
  
  for (const article of newsArticles) {
    const { data, error } = await supabase
      .from('news_articles')
      .insert({
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        author: article.author,
        published_at: article.publishedAt,
        category: article.category,
        tags: article.tags,
        featured: article.featured,
        image: article.image,
        read_time: article.readTime,
        source: article.source,
        source_url: article.sourceUrl,
        views: article.views || 0
      })
      .select();
      
    if (error) {
      console.error(`❌ Erreur lors de la création de l'article "${article.title}":`, error);
    } else {
      createdArticles.push(data[0]);
    }
  }
  
  console.log('✅ Articles d\'actualités créés avec succès !');
  console.log('Les articles suivants ont été ajoutés à votre base de données Supabase:');
  console.log(createdArticles);
}

// Exécuter la fonction de seeding
seedNewsArticles().catch(err => {
  console.error('❌ Une erreur est survenue:', err);
  process.exit(1);
});

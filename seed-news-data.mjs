import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Configuration Supabase manquante dans le fichier .env');
  console.error('Vérifiez VITE_SUPABASE_URL et VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Utiliser la clé service_role pour contourner les politiques RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Nouvelles actualités enrichies
const newsArticles = [
  {
    id: 'news-001',
    title: 'Nouveau partenariat avec le Port de Rotterdam',
    excerpt: 'Une collaboration stratégique majeure pour développer les technologies portuaires de demain.',
    content: `SIPORTS annonce aujourd'hui un partenariat stratégique avec le Port de Rotterdam, leader européen en matière d'innovation portuaire. Cette collaboration vise à développer conjointement des solutions technologiques avancées pour l'optimisation des opérations portuaires et la réduction de l'empreinte carbone.

Le partenariat couvre plusieurs domaines clés :

• Technologies IoT pour la surveillance en temps réel des infrastructures
• Solutions d'intelligence artificielle pour l'optimisation des flux logistiques
• Développement durable et transition énergétique des ports
• Formation et partage d'expertise technique

"Ce partenariat représente une étape majeure dans notre stratégie de développement international", déclare le Directeur Général de SIPORTS. "Le savoir-faire du Port de Rotterdam combiné à notre expertise technologique nous permettra d'offrir des solutions innovantes à l'échelle mondiale."`,
    author: 'Équipe SIPORTS',
    published_at: new Date('2024-01-14'),
    category: 'Partenariat',
    tags: ['partenariat', 'rotterdam', 'collaboration', 'innovation'],
    featured: true,
    image_url: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg',
    read_time: 4,
    source: 'siports',
    views: 2100,
    status: 'published'
  },
  {
    id: 'news-002',
    title: 'Lancement de la version 3.0 de SmartPort',
    excerpt: 'La nouvelle version révolutionne la gestion portuaire avec des fonctionnalités d\'IA avancées.',
    content: `Après deux ans de développement intensif, SIPORTS lance aujourd'hui la version 3.0 de sa plateforme SmartPort, intégrant les dernières avancées en intelligence artificielle et en analyse prédictive.

Les principales nouveautés de cette version majeure :

🚀 Intelligence Artificielle Avancée
• Prédiction des flux de conteneurs avec une précision de 95%
• Optimisation automatique des ressources portuaires
• Détection précoce des anomalies opérationnelles

📊 Analytics en Temps Réel
• Tableaux de bord personnalisables pour chaque utilisateur
• Métriques de performance en continu
• Rapports automatisés et alertes intelligentes

🔒 Sécurité Renforcée
• Chiffrement de bout en bout des données sensibles
• Authentification multi-facteurs obligatoire
• Traçabilité complète des actions utilisateurs

🌱 Développement Durable
• Calcul automatique de l'empreinte carbone
• Optimisation des consommations énergétiques
• Suivi des objectifs de développement durable

"SmartPort 3.0 représente un saut technologique majeur qui positionne SIPORTS comme leader incontesté de la digitalisation portuaire", affirme l'équipe de développement.`,
    author: 'Équipe Technique SIPORTS',
    published_at: new Date('2024-01-09'),
    category: 'Innovation',
    tags: ['smartport', 'version-3.0', 'ia', 'digitalisation'],
    featured: true,
    image_url: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg',
    read_time: 6,
    source: 'siports',
    views: 1850,
    status: 'published'
  },
  {
    id: 'news-003',
    title: 'Expansion Internationale : Ouverture de Bureaux en Asie',
    excerpt: 'SIPORTS étend sa présence mondiale avec l\'inauguration de ses premiers bureaux asiatiques.',
    content: `Dans le cadre de sa stratégie de développement international, SIPORTS annonce l'ouverture de ses premiers bureaux en Asie, situés à Singapour et Shanghai. Cette expansion stratégique vise à renforcer la présence de l'entreprise sur le marché asiatique en pleine croissance.

Les nouveaux bureaux accueilleront :

• Une équipe d'experts techniques locaux
• Un centre de formation régional
• Un showroom technologique permanent
• Des services de support 24/7 pour la zone Asie-Pacifique

Cette initiative s'inscrit dans la volonté de SIPORTS d'accompagner au plus près ses clients asiatiques et de s'adapter aux spécificités régionales du marché portuaire.`,
    author: 'Direction Internationale',
    published_at: new Date('2024-01-05'),
    category: 'Expansion',
    tags: ['expansion', 'asie', 'singapour', 'shanghai'],
    featured: false,
    image_url: 'https://images.pexels.com/photos/3184293/pexels-photo-3184293.jpeg',
    read_time: 3,
    source: 'siports',
    views: 950,
    status: 'published'
  },
  {
    id: 'news-004',
    title: 'Conférence sur la Transition Écologique des Ports',
    excerpt: 'Experts mondiaux réunis pour discuter des stratégies de décarbonation du secteur portuaire.',
    content: `SIPORTS organise une conférence internationale sur la transition écologique des ports, rassemblant plus de 200 experts et décideurs du secteur. L'événement se tiendra les 15 et 16 février 2024 à Marseille.

Les thèmes principaux abordés :

• Stratégies de réduction des émissions de CO2
• Technologies vertes pour les opérations portuaires
• Financement de la transition énergétique
• Réglementation environnementale internationale
• Cas d'usage et retours d'expérience

Cette conférence constitue une plateforme unique d'échange entre acteurs publics et privés pour accélérer la transition écologique du secteur portuaire.`,
    author: 'Comité Scientifique',
    published_at: new Date('2024-01-03'),
    category: 'Événements',
    tags: ['environnement', 'transition', 'conférence', 'développement-durable'],
    featured: false,
    image_url: 'https://images.pexels.com/photos/3184294/pexels-photo-3184294.jpeg',
    read_time: 4,
    source: 'siports',
    views: 720,
    status: 'published'
  },
  {
    id: 'news-005',
    title: 'Prix de l\'Innovation Portuaire 2024',
    excerpt: 'Découvrez les lauréats du prestigieux Prix de l\'Innovation Portuaire décerné par SIPORTS.',
    content: `Pour la troisième année consécutive, SIPORTS a décerné ses Prix de l'Innovation Portuaire lors d'une cérémonie prestigieuse. Cette année, plus de 150 candidatures ont été reçues, démontrant l'effervescence innovante du secteur.

Les lauréats 2024 :

🥇 Catégorie Technologie : "PortVision AI" - Système de vision par ordinateur pour l'inspection automatique des conteneurs
🥈 Catégorie Durabilité : "GreenPort Solutions" - Plateforme d'optimisation énergétique des terminaux
🥉 Catégorie Sécurité : "SecureHarbor" - Solution de cybersécurité intégrée pour les infrastructures portuaires

🏆 Prix Spécial du Jury : "MaritimeChain" - Blockchain pour la traçabilité des chaînes logistiques maritimes

Ces innovations témoignent de la vitalité du secteur portuaire et de son engagement dans la transformation digitale et durable.`,
    author: 'Jury des Prix',
    published_at: new Date('2023-12-20'),
    category: 'Prix',
    tags: ['prix', 'innovation', 'récompenses', 'technologie'],
    featured: false,
    image_url: 'https://images.pexels.com/photos/3184295/pexels-photo-3184295.jpeg',
    read_time: 5,
    source: 'siports',
    views: 1100,
    status: 'published'
  },
  {
    id: 'news-006',
    title: 'Formation Continue : Nouveau Programme de Certification',
    excerpt: 'SIPORTS lance un programme complet de formation et certification pour les professionnels du secteur.',
    content: `Afin de répondre aux besoins croissants en compétences techniques du secteur portuaire, SIPORTS lance un nouveau programme de formation continue et de certification professionnelle.

Le programme comprend :

📚 Modules de Formation
• Technologies portuaires avancées
• Gestion des opérations logistiques
• Cybersécurité des infrastructures critiques
• Développement durable et transition énergétique

🎓 Certifications Disponibles
• Certificat de Spécialiste SmartPort
• Certification Gestionnaire d'Opérations Portuaires
• Diplôme Expert en Technologies Portuaires

💼 Avantages
• Formation 100% en ligne avec accompagnement personnalisé
• Reconnaissance internationale des certifications
• Mise à jour continue des contenus pédagogiques
• Réseau professionnel des alumni

Les inscriptions pour la première session sont ouvertes jusqu'au 31 mars 2024.`,
    author: 'Direction Formation',
    published_at: new Date('2023-12-15'),
    category: 'Formation',
    tags: ['formation', 'certification', 'compétences', 'professionnel'],
    featured: false,
    image_url: 'https://images.pexels.com/photos/3184296/pexels-photo-3184296.jpeg',
    read_time: 4,
    source: 'siports',
    views: 680,
    status: 'published'
  }
];

async function seedNewsData() {
  console.log('📰 Insertion des actualités enrichies dans Supabase...\n');

  try {
    // D'abord, essayer de créer la table si elle n'existe pas
    console.log('🔧 Tentative de création de la table news...');

    try {
      // Cette requête peut échouer si la table existe déjà, c'est normal
      await supabase.from('news').select('id').limit(1);
      console.log('✅ Table news existe déjà');
    } catch (tableError) {
      console.log('ℹ️ Table news n\'existe pas encore - elle doit être créée manuellement dans Supabase');
      console.log('� Instructions:');
      console.log('1. Allez dans votre dashboard Supabase');
      console.log('2. Ouvrez l\'éditeur SQL');
      console.log('3. Exécutez le contenu du fichier scripts/create-news-table.sql');
      console.log('4. Relancez ce script\n');
      return;
    }

    // Insérer les actualités
    console.log('📝 Insertion des actualités...');

    for (const article of newsArticles) {
      try {
        console.log(`📄 Insertion: ${article.title}`);

        // Adapter les données pour Supabase
        const articleData = {
          id: article.id,
          title: article.title,
          excerpt: article.excerpt,
          content: article.content,
          author: article.author,
          published_at: article.published_at.toISOString(),
          category: article.category,
          tags: article.tags,
          featured: article.featured,
          image_url: article.image_url,
          read_time: article.read_time,
          source: article.source,
          views: article.views,
          status: article.status
        };

        const { error } = await supabase.from('news').upsert(articleData);

        if (error) {
          console.error(`❌ Erreur insertion article "${article.title}":`, error.message);
          console.error('Détails:', error.details);
        } else {
          console.log(`✅ Article inséré: ${article.title}`);
        }
      } catch (err) {
        console.error(`❌ Exception lors de l'insertion de "${article.title}":`, err.message);
      }
    }

    console.log('\n🎉 Actualités insérées avec succès!');
    console.log('\n📊 Statistiques des actualités:');
    console.log('================================');
    console.log(`📰 Total articles: ${newsArticles.length}`);
    console.log(`⭐ Articles featured: ${newsArticles.filter(a => a.featured).length}`);
    console.log(`👁️ Total vues: ${newsArticles.reduce((sum, a) => sum + a.views, 0)}`);
    console.log(`📖 Temps de lecture total: ${newsArticles.reduce((sum, a) => sum + a.read_time, 0)} minutes`);

    const categories = [...new Set(newsArticles.map(a => a.category))];
    console.log(`🏷️ Catégories: ${categories.join(', ')}`);

    console.log('\n🔄 Actualisez votre application pour voir les nouvelles actualités!');

  } catch (error) {
    console.error('❌ Erreur lors de l\'insertion des actualités:', error);
    console.error('Stack trace:', error.stack);
  }
}

seedNewsData();

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

// Fonction pour récupérer les exposants existants
async function getExistingExhibitors() {
  const { data, error } = await supabase
    .from('exhibitors')
    .select('id, company_name')
    .limit(5);
  
  if (error) {
    console.error('❌ Erreur lors de la récupération des exposants:', error);
    process.exit(1);
  }
  
  return data || [];
}

// Générer les données de mini-sites pour les exposants existants
async function seedMiniSites() {
  console.log('🌱 Seeding test mini-sites...');
  
  // Récupérer les exposants existants
  const exhibitors = await getExistingExhibitors();
  console.log(`📊 Exposants trouvés : ${exhibitors.length}`);
  
  if (exhibitors.length === 0) {
    console.log('❌ Aucun exposant trouvé. Veuillez d\'abord créer des exposants.');
    process.exit(1);
  }
  
  const miniSites = [];
  
  // Créer un mini-site pour chaque exposant
  for (const exhibitor of exhibitors) {
    console.log(`Création d'un mini-site pour l'exposant avec ID : ${exhibitor.id} (${exhibitor.company_name})`);
    
    // Définir un thème et des couleurs en fonction de l'exposant
    const theme = exhibitor.id.charCodeAt(0) % 2 === 0 ? 'modern' : 'minimal';
    
    // Créer un objet de mini-site
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
            subtitle: theme === 'modern' 
              ? 'Solutions innovantes pour l\'industrie maritime' 
              : 'Technologies avancées pour les ports intelligents',
            description: theme === 'modern'
              ? 'Spécialiste des systèmes de navigation et de communication pour les navires commerciaux et de plaisance'
              : 'Solutions de gestion de terminaux et d\'automatisation portuaire pour améliorer l\'efficacité opérationnelle',
            backgroundImage: theme === 'modern'
              ? 'https://images.unsplash.com/photo-1580091873836-0c109fa1e489?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwcm9maWxlLXBhZ2V8MXx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80'
              : 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80'
          }
        },
        {
          type: 'about',
          content: {
            title: theme === 'modern' ? 'À propos de nous' : 'Notre expertise',
            text: theme === 'modern'
              ? `${exhibitor.company_name} est un leader dans la fourniture de solutions technologiques innovantes pour l'industrie maritime depuis plus de 15 ans. Notre mission est de rendre la navigation plus sûre, plus efficace et plus durable grâce à des technologies de pointe.`
              : `${exhibitor.company_name} est à la pointe de la transformation digitale des ports. Nous développons des solutions d'automatisation et de gestion qui permettent aux opérateurs portuaires d'optimiser leurs opérations, de réduire les temps d'attente et d'améliorer la sécurité.`,
            image: theme === 'modern'
              ? 'https://images.unsplash.com/photo-1534224039826-c7a0fb751ab5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80'
              : 'https://images.unsplash.com/photo-1571942774253-bab381c2f5e1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80',
            values: theme === 'modern'
              ? ['Innovation', 'Sécurité', 'Durabilité', 'Excellence']
              : ['Automatisation', 'Efficacité', 'Sécurité', 'Innovation']
          }
        },
        {
          type: 'products',
          content: {
            title: theme === 'modern' ? 'Nos produits phares' : 'Nos solutions',
            description: theme === 'modern' 
              ? 'Découvrez notre gamme de produits innovants' 
              : 'Des solutions intégrées pour ports intelligents',
            items: theme === 'modern' 
              ? [
                  {
                    name: 'NaviGuard Pro',
                    description: 'Système de navigation avancé pour navires commerciaux',
                    image: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8bmF2aWdhdGlvbiUyMHN5c3RlbXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60'
                  },
                  {
                    name: 'MarineConnect',
                    description: 'Solution de communication satellite pour zones maritimes éloignées',
                    image: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8c2F0ZWxsaXRlJTIwY29tbXVuaWNhdGlvbnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60'
                  },
                  {
                    name: 'EcoFuel Monitor',
                    description: 'Système de surveillance et d\'optimisation de la consommation de carburant',
                    image: 'https://images.unsplash.com/photo-1620283085439-38dd864a1fc2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8ZnVlbCUyMG1vbml0b3J8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60'
                  }
                ]
              : [
                  {
                    name: 'PortFlow TMS',
                    description: 'Système de gestion de terminal pour optimiser les opérations portuaires',
                    image: 'https://images.unsplash.com/photo-1494412651409-8963ce7935a7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=60'
                  },
                  {
                    name: 'AutoCrane',
                    description: 'Solution d\'automatisation des grues de quai et de parc',
                    image: 'https://images.unsplash.com/photo-1599596329168-373df2037e7c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=60'
                  },
                  {
                    name: 'PortSecure',
                    description: 'Système intégré de sécurité et de contrôle d\'accès pour zones portuaires',
                    image: 'https://images.unsplash.com/photo-1582139149987-9836f2d6c67d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=60'
                  }
                ]
          }
        },
        {
          type: 'contact',
          content: {
            title: theme === 'modern' ? 'Contactez-nous' : 'Contactez notre équipe',
            address: theme === 'modern' 
              ? '123 Port Avenue, Seattle, WA 98101, USA' 
              : '456 Harbor Drive, Singapore 117456',
            email: theme === 'modern' 
              ? 'info@maritimesolutions.com' 
              : `contact@${exhibitor.company_name.toLowerCase().replace(/\s+/g, '')}s.com`,
            phone: theme === 'modern' ? '+1 (206) 555-0123' : '+65 6123 4567',
            hours: theme === 'modern' ? 'Lundi - Vendredi: 9h - 17h' : 'Lundi - Vendredi: 8h30 - 18h'
          }
        }
      ],
      published: true,
      views: 0,
      last_updated: '2023-11-15T12:00:00.000Z',
      created_at: '2023-11-15T12:00:00.000Z'
    };
    
    // Insérer le mini-site dans la base de données
    const { data, error } = await supabase
      .from('mini_sites')
      .upsert(miniSite)
      .select();
      
    if (error) {
      console.error(`❌ Erreur lors de la création du mini-site pour ${exhibitor.company_name}:`, error);
    } else {
      miniSites.push(data[0]);
    }
  }
  
  console.log('✅ Mini-sites créés avec succès !');
  console.log('Les mini-sites suivants ont été ajoutés à votre base de données Supabase:');
  console.log(miniSites);
}

// Exécuter la fonction de seeding
seedMiniSites().catch(err => {
  console.error('❌ Une erreur est survenue:', err);
  process.exit(1);
});

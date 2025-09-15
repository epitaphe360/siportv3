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

// Créer des produits pour chaque exposant
async function seedProducts() {
  console.log('🌱 Seeding test products...');
  
  // Récupérer les exposants existants
  const exhibitors = await getExistingExhibitors();
  console.log(`📊 Exposants trouvés : ${exhibitors.length}`);
  
  if (exhibitors.length === 0) {
    console.log('❌ Aucun exposant trouvé. Veuillez d\'abord créer des exposants.');
    process.exit(1);
  }
  
  const products = [];
  
  // Produits pour le premier exposant (Maritime Solutions Inc)
  if (exhibitors[0]) {
    console.log(`Création de produits pour l'exposant avec ID : ${exhibitors[0].id} (${exhibitors[0].company_name})`);
    
    const maritimeProducts = [
      {
        exhibitor_id: exhibitors[0].id,
        name: "NaviGuard Pro",
        description: "Système de navigation avancé pour navires commerciaux intégrant des cartes marines électroniques, radar et AIS avec alertes de collision et planification de route optimisée.",
        category: "Navigation",
        images: ["https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=800&q=80"],
        specifications: "Écran tactile 15\", récepteur GPS haute précision, intégration AIS, compatible ECDIS, certification IMO",
        price: 12500,
        featured: true
      },
      {
        exhibitor_id: exhibitors[0].id,
        name: "MarineConnect",
        description: "Solution de communication satellite pour zones maritimes éloignées offrant une connectivité internet fiable et des communications vocales même dans les régions les plus isolées.",
        category: "Communication",
        images: ["https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&w=800&q=80"],
        specifications: "Bande Ka/Ku, débit jusqu'à 20Mbps, antenne stabilisée, terminal durci IP67, communication vocale HD",
        price: 8750,
        featured: true
      },
      {
        exhibitor_id: exhibitors[0].id,
        name: "EcoFuel Monitor",
        description: "Système de surveillance et d'optimisation de la consommation de carburant permettant aux opérateurs de navires de réduire leur empreinte carbone et leurs coûts opérationnels.",
        category: "Énergie",
        images: ["https://images.unsplash.com/photo-1620283085439-38dd864a1fc2?auto=format&fit=crop&w=800&q=80"],
        specifications: "Capteurs de débit haute précision, analyse en temps réel, rapports détaillés, recommandations d'optimisation, interface web et mobile",
        price: 6200,
        featured: false
      }
    ];
    
    for (const product of maritimeProducts) {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select();
        
      if (error) {
        console.error(`❌ Erreur lors de la création du produit "${product.name}":`, error);
      } else {
        products.push(data[0]);
      }
    }
  }
  
  // Produits pour le deuxième exposant (Port Tech Systems)
  if (exhibitors[1]) {
    console.log(`Création de produits pour l'exposant avec ID : ${exhibitors[1].id} (${exhibitors[1].company_name})`);
    
    const portTechProducts = [
      {
        exhibitor_id: exhibitors[1].id,
        name: "PortFlow TMS",
        description: "Système complet de gestion de terminal pour optimiser toutes les opérations portuaires, de la planification des escales à la gestion des équipements et des ressources humaines.",
        category: "Logiciel",
        images: ["https://images.unsplash.com/photo-1494412651409-8963ce7935a7?auto=format&fit=crop&w=800&q=80"],
        specifications: "Solution cloud, modulaire, intégration avec les systèmes existants, tableaux de bord personnalisables, rapports en temps réel, planification prédictive",
        price: 75000,
        featured: true
      },
      {
        exhibitor_id: exhibitors[1].id,
        name: "AutoCrane",
        description: "Solution d'automatisation des grues de quai et de parc intégrant intelligence artificielle et vision par ordinateur pour une manipulation plus rapide et plus sûre des conteneurs.",
        category: "Automatisation",
        images: ["https://images.unsplash.com/photo-1599596329168-373df2037e7c?auto=format&fit=crop&w=800&q=80"],
        specifications: "Système anti-collision, détection automatique des conteneurs, planification de mouvement optimisée, interface opérateur intuitive, maintenance prédictive",
        price: 125000,
        featured: true
      },
      {
        exhibitor_id: exhibitors[1].id,
        name: "PortSecure",
        description: "Système intégré de sécurité et de contrôle d'accès pour zones portuaires combinant vidéosurveillance, reconnaissance faciale et gestion des badges d'accès.",
        category: "Sécurité",
        images: ["https://images.unsplash.com/photo-1582139149987-9836f2d6c67d?auto=format&fit=crop&w=800&q=80"],
        specifications: "Caméras haute résolution, algorithmes d'analyse vidéo, contrôle d'accès biométrique, interface centrale, conformité ISPS, rapports d'incidents",
        price: 45000,
        featured: false
      }
    ];
    
    for (const product of portTechProducts) {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select();
        
      if (error) {
        console.error(`❌ Erreur lors de la création du produit "${product.name}":`, error);
      } else {
        products.push(data[0]);
      }
    }
  }
  
  console.log('✅ Produits créés avec succès !');
  console.log('Les produits suivants ont été ajoutés à votre base de données Supabase:');
  console.log(products);
}

// Exécuter la fonction de seeding
seedProducts().catch(err => {
  console.error('❌ Une erreur est survenue:', err);
  process.exit(1);
});

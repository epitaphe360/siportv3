import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
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

async function executeSqlFile(filePath) {
  console.log(`📄 Lecture du fichier SQL: ${filePath}`);
  try {
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    console.log('✅ Fichier SQL lu avec succès');
    
    console.log('🔄 Exécution du SQL...');
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.error('❌ Erreur lors de l\'exécution du SQL:', error);
      return false;
    }
    
    console.log('✅ SQL exécuté avec succès:', data);
    return true;
  } catch (err) {
    console.error('❌ Erreur lors de la lecture ou de l\'exécution du fichier SQL:', err);
    return false;
  }
}

async function main() {
  console.log('🛠️ Correction du trigger mini_sites...');
  
  const filePath = path.resolve('fix-mini-sites-trigger.sql');
  const success = await executeSqlFile(filePath);
  
  if (success) {
    console.log('🎉 Trigger mini_sites corrigé avec succès !');
    
    // Maintenant nous pouvons essayer de mettre à jour les sections
    console.log('\n🔄 Tentative de mise à jour des sections mini-sites...');
    
    // Récupérer les mini-sites existants
    const { data: miniSites, error: getMiniSitesError } = await supabase
      .from('mini_sites')
      .select('id, sections')
      .limit(5);
    
    if (getMiniSitesError) {
      console.error('❌ Erreur lors de la récupération des mini-sites:', getMiniSitesError);
      process.exit(1);
    }
    
    console.log(`📊 ${miniSites.length} mini-sites trouvés`);
    
    let updatedCount = 0;
    
    for (const miniSite of miniSites) {
      const existingSections = miniSite.sections || [];
      const newSections = [];
      
      // Vérifier et ajouter les sections manquantes
      if (!existingSections.some(s => s.type === 'certifications')) {
        newSections.push({
          type: 'certifications',
          content: {
            title: 'Certifications & Accréditations',
            description: 'Nos compétences reconnues par les meilleurs organismes du secteur',
            items: [
              {
                name: 'ISO 9001',
                description: 'Certification de management de la qualité',
                image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=300&q=80',
                year: '2022'
              },
              {
                name: 'ISO 14001',
                description: 'Système de management environnemental',
                image: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=300&q=80',
                year: '2021'
              },
              {
                name: 'OHSAS 18001',
                description: 'Système de management de la santé et de la sécurité au travail',
                image: 'https://images.unsplash.com/photo-1631815588090-d1bcbe9b4b01?auto=format&fit=crop&w=300&q=80',
                year: '2023'
              }
            ]
          }
        });
      }
      
      if (!existingSections.some(s => s.type === 'gallery')) {
        newSections.push({
          type: 'gallery',
          content: {
            title: 'Galerie & Réalisations',
            description: 'Découvrez nos projets et réalisations en images',
            images: [
              {
                url: 'https://images.unsplash.com/photo-1520363147827-3f2a8da130e1?auto=format&fit=crop&w=800&q=80',
                caption: 'Installation de systèmes de navigation dans le port de Rotterdam'
              },
              {
                url: 'https://images.unsplash.com/photo-1494412651409-8963ce7935a7?auto=format&fit=crop&w=800&q=80',
                caption: 'Centre de contrôle du trafic maritime à Singapour'
              },
              {
                url: 'https://images.unsplash.com/photo-1602193290354-b5df40aa39a4?auto=format&fit=crop&w=800&q=80',
                caption: 'Système d\'automatisation portuaire à Dubai'
              },
              {
                url: 'https://images.unsplash.com/photo-1574100004036-f0807f2d2ee6?auto=format&fit=crop&w=800&q=80',
                caption: 'Installation de notre système EcoFuel à Hambourg'
              }
            ]
          }
        });
      }
      
      if (!existingSections.some(s => s.type === 'testimonials')) {
        newSections.push({
          type: 'testimonials',
          content: {
            title: 'Témoignages Clients',
            description: 'Ce que disent nos partenaires de nos solutions',
            items: [
              {
                name: 'Jean Dupont',
                position: 'Directeur des Opérations, Port de Marseille',
                text: 'Depuis l\'installation de leurs systèmes, nous avons constaté une amélioration de 30% de notre efficacité opérationnelle. Un investissement qui a rapidement porté ses fruits.',
                avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&h=200&q=80'
              },
              {
                name: 'Marie Lambert',
                position: 'Responsable Logistique, Compagnie Maritime Internationale',
                text: 'Leur service client est exceptionnel. Même face à des défis techniques complexes, leur équipe a toujours su trouver des solutions adaptées à nos besoins spécifiques.',
                avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&h=200&q=80'
              },
              {
                name: 'Ahmed Khalil',
                position: 'CEO, Dubai Port Authority',
                text: 'Une collaboration fructueuse qui dure depuis plus de 5 ans. Leur capacité d\'innovation et leur compréhension des enjeux portuaires en font un partenaire stratégique incontournable.',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80'
              }
            ]
          }
        });
      }
      
      // Mettre à jour le mini-site si des sections ont été ajoutées
      if (newSections.length > 0) {
        const updatedSections = [...existingSections, ...newSections];
        
        console.log(`🔄 Mise à jour du mini-site ${miniSite.id} avec ${newSections.length} nouvelles sections...`);
        
        // Utiliser une requête SQL directe pour éviter les problèmes avec le trigger
        const updateQuery = `
          UPDATE mini_sites 
          SET sections = $1::jsonb, 
              last_updated = NOW() 
          WHERE id = $2::uuid
        `;
        
        const { error: updateError } = await supabase.rpc('exec_sql', { 
          sql: updateQuery, 
          params: [JSON.stringify(updatedSections), miniSite.id] 
        });
        
        if (updateError) {
          console.error(`❌ Erreur lors de la mise à jour du mini-site ${miniSite.id}:`, updateError);
        } else {
          console.log(`✅ Mini-site ${miniSite.id} mis à jour avec succès`);
          updatedCount++;
        }
      } else {
        console.log(`ℹ️ Aucune nouvelle section à ajouter pour le mini-site ${miniSite.id}`);
      }
    }
    
    console.log(`\n🎉 ${updatedCount} mini-sites mis à jour avec succès !`);
  } else {
    console.log('❌ Échec de la correction du trigger mini_sites');
  }
}

main().catch(err => {
  console.error('❌ Erreur non gérée:', err);
  process.exit(1);
});

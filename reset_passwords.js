
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Charger les variables d'environnement
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('ERREUR: Les variables d\'environnement SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requises.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function resetPasswords() {
  console.log('🔄 Démarrage de la réinitialisation des mots de passe...');
  
  // 1. Récupérer tous les utilisateurs
  const { data: { users }, error } = await supabase.auth.admin.listUsers({
    perPage: 1000
  });

  if (error) {
    console.error('❌ Erreur lors de la récupération des utilisateurs:', error);
    return;
  }

  console.log(`ℹ️ ${users.length} utilisateurs trouvés au total.`);

  // Filtre pour les comptes de test et comptes spécifiques
  const targetDomains = ['@test.siport.com', '@siports.com'];
  const usersToReset = users.filter(u => 
    targetDomains.some(domain => u.email?.endsWith(domain)) && 
    u.email !== 'admin.siports@siports.com' // Optionnel: exclure l'admin qui marche déjà
  );

  console.log(`🎯 ${usersToReset.length} comptes identifiés pour la réinitialisation (domaine test.siport.com ou siports.com, sauf admin).`);

  let successCount = 0;
  let failCount = 0;

  for (const user of usersToReset) {
    try {
      console.log(`🔐 Réinitialisation pour: ${user.email}...`);
      
      const { data, error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        { 
          password: 'Admin123!',
          email_confirm: true,
          user_metadata: { ...user.user_metadata, email_verified: true }
        }
      );

      if (updateError) {
        console.error(`❌ Échec pour ${user.email}:`, updateError.message);
        failCount++;
      } else {
        console.log(`✅ Succès pour ${user.email}`);
        successCount++;
      }
    } catch (err) {
      console.error(`💥 Exception pour ${user.email}:`, err);
      failCount++;
    }
  }

  console.log('\n-----------------------------------');
  console.log(`🏁 Terminé. Succès: ${successCount}, Échecs: ${failCount}`);
  console.log('🔑 Le mot de passe pour tous ces comptes est maintenant : Admin123!');
  console.log('-----------------------------------');
}

resetPasswords();

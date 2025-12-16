import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createPaymentRequestsTable() {
  console.log('🚀 Création de la table payment_requests...\n');

  try {
    // Lire le fichier SQL
    const sqlScript = readFileSync('./create-payment-requests-table.sql', 'utf-8');

    // Diviser en commandes individuelles (séparées par ';')
    const commands = sqlScript
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log(`📜 ${commands.length} commandes SQL à exécuter...\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      // Ignorer les commentaires et les lignes vides
      if (command.startsWith('--') || command.trim() === '') continue;

      // Afficher un aperçu de la commande
      const preview = command.substring(0, 60).replace(/\n/g, ' ');
      console.log(`[${i + 1}/${commands.length}] Exécution: ${preview}...`);

      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql: command + ';' });
        
        if (error) {
          // Ignorer certaines erreurs non critiques
          if (error.message.includes('already exists') || 
              error.message.includes('duplicate')) {
            console.log(`  ⚠️  Déjà existant (ignoré)`);
            successCount++;
          } else {
            console.error(`  ❌ Erreur:`, error.message);
            errorCount++;
          }
        } else {
          console.log(`  ✅ Succès`);
          successCount++;
        }
      } catch (err) {
        console.error(`  ❌ Exception:`, err.message);
        errorCount++;
      }

      // Petite pause entre les commandes
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n📊 Résumé:`);
    console.log(`  ✅ Réussies: ${successCount}`);
    console.log(`  ❌ Échouées: ${errorCount}`);
    console.log(`  📊 Total: ${commands.length}`);

    if (errorCount === 0) {
      console.log('\n✅ Table payment_requests créée avec succès !');
    } else {
      console.log('\n⚠️  Certaines commandes ont échoué. Vérifiez les erreurs ci-dessus.');
    }

  } catch (error) {
    console.error('❌ Erreur lors de la lecture du fichier SQL:', error);
    process.exit(1);
  }
}

// Alternative: Exécution manuelle via SQL direct
async function createTableDirectly() {
  console.log('🚀 Création directe de la table payment_requests...\n');

  const { error: tableError } = await supabase.from('payment_requests').select('id').limit(1);
  
  if (!tableError) {
    console.log('✅ La table payment_requests existe déjà !');
    return;
  }

  console.log('📝 Création de la table...');

  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS public.payment_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      requested_level TEXT NOT NULL CHECK (requested_level IN ('free', 'premium')),
      amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      currency TEXT NOT NULL DEFAULT 'EUR',
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
      payment_method TEXT NOT NULL DEFAULT 'bank_transfer',
      payment_reference TEXT,
      payment_proof_url TEXT,
      admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      admin_notes TEXT,
      validated_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  try {
    // Note: Supabase client ne permet pas d'exécuter du SQL DDL directement
    // Il faut utiliser le SQL Editor ou REST API
    console.log('⚠️  Pour créer la table, veuillez:');
    console.log('1. Aller sur https://supabase.com → SQL Editor');
    console.log('2. Copier le contenu de create-payment-requests-table.sql');
    console.log('3. Exécuter le script SQL');
    console.log('\nOu utiliser la REST API avec la service role key.');
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exécuter
createTableDirectly();

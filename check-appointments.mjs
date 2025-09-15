import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

async function checkAppointments() {
  try {
    console.log('🔍 Vérification des RDV dans la base de données...\n');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.log('❌ Variables d\'environnement Supabase manquantes');
      return;
    }

    // Créer le client Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('📡 Connexion à Supabase établie');

    // Compter tous les RDV dans la base
    console.log('\n📊 Comptage de tous les RDV:');
    const { count: totalAppointments, error: countError } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.log('❌ Erreur lors du comptage:', countError.message);
    } else {
      console.log('✅ Nombre total de RDV dans la base:', totalAppointments || 0);
    }

    // Compter les RDV par statut
    console.log('\n📈 Répartition par statut:');
    const { data: statusData, error: statusError } = await supabase
      .from('appointments')
      .select('status');

    if (statusError) {
      console.log('❌ Erreur lors de la récupération des statuts:', statusError.message);
    } else {
      const statusCount = statusData.reduce((acc, apt) => {
        acc[apt.status] = (acc[apt.status] || 0) + 1;
        return acc;
      }, {});
      console.log('📋 Statuts des RDV:', statusCount);
    }

    // Lister quelques RDV récents
    console.log('\n📅 RDV les plus récents:');
    const { data: recentAppointments, error: recentError } = await supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentError) {
      console.log('❌ Erreur lors de la récupération des RDV récents:', recentError.message);
    } else {
      console.log('📋 RDV récents:');
      recentAppointments.forEach((apt, index) => {
        console.log(`  ${index + 1}. ID: ${apt.id} - Statut: ${apt.status} - Créé: ${new Date(apt.created_at).toLocaleString('fr-FR')}`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

checkAppointments();

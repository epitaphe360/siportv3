import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function addVisitorsActivity() {
  console.log(`
================================================================================
📊 AJOUT D'ACTIVITÉ DE VISITE POUR LES VISITEURS VIP
================================================================================

Récupération des visiteurs VIP...
`);

  // Récupérer les visiteurs VIP depuis la table users
  const { data: visitors, error: fetchError } = await supabase
    .from('users')
    .select('id, email, name, profile')
    .eq('type', 'visitor')
    .or('visitor_level.eq.vip,visitor_level.eq.premium')
    .limit(5);

  if (fetchError) {
    console.error('❌ Erreur:', fetchError);
    return;
  }

  if (!visitors || visitors.length === 0) {
    console.log('⚠️ Aucun visiteur VIP trouvé');
    return;
  }

  console.log(`✅ ${visitors.length} visiteurs VIP trouvés\n`);

  let updated = 0;

  for (const visitor of visitors) {
    // Générer des données de visite réalistes
    const exhibitorsVisited = Math.floor(Math.random() * 15) + 5; // 5-20 exposants
    const connections = Math.floor(Math.random() * 25) + 10; // 10-35 connexions
    const interactions = Math.floor(Math.random() * 40) + 20; // 20-60 interactions

    try {
      const updatedProfile = {
        ...(visitor.profile || {}),
        stats: {
          exhibitorsVisited,
          connections,
          interactions,
          lastUpdate: new Date().toISOString()
        }
      };

      const { error: updateError } = await supabase
        .from('users')
        .update({
          profile: updatedProfile,
          updated_at: new Date().toISOString()
        })
        .eq('id', visitor.id);

      if (updateError) {
        console.log(`❌ ${visitor.name || visitor.email}: ${updateError.message}`);
      } else {
        console.log(`✅ ${visitor.name || visitor.email}`);
        console.log(`   • Exposants visités: ${exhibitorsVisited}`);
        console.log(`   • Connexions: ${connections}`);
        console.log(`   • Interactions: ${interactions}`);
        updated++;
      }
    } catch (error) {
      console.error(`❌ ${visitor.email}:`, error);
    }
  }

  console.log(`
📊 Résultats:
   ✅ Visiteurs mis à jour: ${updated}/${visitors.length}
   📈 Taux: ${Math.round((updated / visitors.length) * 100)}%

================================================================================
✨ Activité de visite ajoutée - Graphiques remplis !
================================================================================
`);
}

addVisitorsActivity();

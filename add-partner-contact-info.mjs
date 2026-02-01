import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const partnerEmails = {
  'Gold Partner Industries': 'contact@goldpartner.com',
  'Silver Tech Group': 'tech@silvertech.com',
  'Platinium Global Corp': 'logistics@platinum.com',
  'PortTech Solutions': 'solutions@porttech.ma',
  'EcoMarine Solutions': 'eco@ecomarine.ma',
  'Maritime Tech Innovations': 'innovation@martech.ma',
  'Tanger Med Logistics': 'ops@tangermed.ma',
  'Global Trade Finance Corp': 'finance@globaltrade.ma',
  'Museum Cultural Center': 'info@museum.ma',
  'OceanFreight Logistics': 'logistics@oceanfreight.ma',
  'Agence Nationale de Promotion de l\'Emploi et des Compétences (ANAPEC)': 'contact@anapec.ma',
  'Blue Ocean Research': 'research@blueocean.ma',
  'Port Authority International': 'port@authority.ma',
  'African Ports Network': 'network@africaports.ma',
  'Port Solutions Maroc': 'solutions@port-maroc.ma',
  'Mediterranean Shipping Alliance': 'shipping@mediterranean.ma',
  'Casablanca Port Services': 'services@casablanc-port.ma',
  'Maritime Insurance Group': 'insurance@maritime-group.ma',
  'Royal Maritime Group': 'group@royal-maritime.ma',
  'Musée Maritime du Maroc': 'musee@maritime-maroc.ma'
};

const partnerPhones = {
  'Gold Partner Industries': '+212 5 22 12 34 56',
  'Silver Tech Group': '+212 5 22 54 32 10',
  'Platinium Global Corp': '+212 5 22 98 76 54',
  'PortTech Solutions': '+212 5 22 34 12 90',
  'EcoMarine Solutions': '+212 5 22 12 34 78',
  'Maritime Tech Innovations': '+212 5 22 56 78 90',
  'Tanger Med Logistics': '+212 5 39 34 56 78',
  'Global Trade Finance Corp': '+212 5 22 78 90 12',
  'Museum Cultural Center': '+212 5 22 11 22 33',
  'OceanFreight Logistics': '+212 5 22 44 55 66',
  'Agence Nationale de Promotion de l\'Emploi et des Compétences (ANAPEC)': '+212 5 22 33 44 55',
  'Blue Ocean Research': '+212 5 22 77 88 99',
  'Port Authority International': '+212 5 22 66 77 88',
  'African Ports Network': '+212 5 22 22 33 44',
  'Port Solutions Maroc': '+212 5 22 55 66 77',
  'Mediterranean Shipping Alliance': '+212 5 22 99 88 77',
  'Casablanca Port Services': '+212 5 22 11 00 22',
  'Maritime Insurance Group': '+212 5 22 44 33 22',
  'Royal Maritime Group': '+212 5 22 77 66 55',
  'Musée Maritime du Maroc': '+212 5 22 88 99 00'
};

async function addContactInfo() {
  console.log(`
================================================================================
📧 AJOUT DES COORDONNÉES AUX PARTENAIRES
================================================================================

Connexion à Supabase...
`);

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // Récupérer tous les partenaires
  const { data: partners, error: fetchError } = await supabase
    .from('partners')
    .select('*')
    .order('created_at', { ascending: true });

  if (fetchError) {
    console.error('❌ Erreur lors de la récupération des partenaires:', fetchError);
    return;
  }

  console.log(`✅ ${partners.length} partenaires trouvés\n`);

  let updated = 0;

  for (const partner of partners) {
    const email = partnerEmails[partner.company_name] || `contact@${partner.company_name.toLowerCase().replace(/\s+/g, '')}.ma`;
    const phone = partnerPhones[partner.company_name] || '+212 5 22 00 00 00';

    try {
      // Mise à jour avec email et téléphone
      const { error: updateError } = await supabase
        .from('partners')
        .update({
          email: email,
          phone: phone,
          verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', partner.id);

      if (updateError) {
        console.log(`❌ ${partner.company_name}: ${updateError.message}`);
      } else {
        console.log(`✅ ${partner.company_name}: Email (${email}) & Téléphone (${phone})`);
        updated++;
      }
    } catch (error) {
      console.error(`❌ ${partner.company_name}: ${error.message}`);
    }
  }

  console.log(`
📊 Résultats:
   ✅ Profils mis à jour: ${updated}/${partners.length}
   📈 Taux: ${Math.round((updated / partners.length) * 100)}%

================================================================================
✨ Ajout des coordonnées terminé !
================================================================================
`);
}

addContactInfo();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createMarketingAccount() {
  const email = 'marketing@siports.com';
  const password = 'Test123456!';
  
  console.log('📊 Création du compte Marketing...\n');

  try {
    // Vérifier si l'utilisateur existe déjà
    const { data: existingAuthUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingAuthUser = existingAuthUsers?.users?.find(u => u.email === email);

    let authId;

    if (existingAuthUser) {
      console.log(`✅ ${email} existe déjà dans Auth`);
      authId = existingAuthUser.id;
    } else {
      // Créer l'utilisateur dans auth
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });

      if (authError) throw authError;
      authId = authUser.user.id;
      console.log(`✅ Compte Auth créé: ${email} (${authId})`);
    }

    // Vérifier si le profil existe
    const { data: existingProfile } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', authId)
      .single();

    if (existingProfile) {
      console.log(`✅ Profil existe déjà (${existingProfile.id})`);
      
      // Mettre à jour le type
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ type: 'admin' })
        .eq('id', existingProfile.id);

      if (updateError) throw updateError;
      console.log(`✅ Type mis à jour: admin`);
    } else {
      // Créer le profil
      const { data: newProfile, error: profileError } = await supabaseAdmin
        .from('users')
        .insert({
          id: authId,
          email,
          name: 'Agence Marketing SIPORT',
          type: 'admin',
          profile: {
            company: 'SIPORT Marketing',
            position: 'Marketing Manager',
            phone: '+33 1 23 45 67 89'
          }
        })
        .select()
        .single();

      if (profileError) throw profileError;
      console.log(`✅ Profil créé: ${newProfile.name} (${newProfile.id})`);
    }

    console.log(`\n🎉 Compte Marketing prêt !`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Mot de passe: ${password}`);
    console.log(`🔗 URL: /marketing/dashboard`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

createMarketingAccount();

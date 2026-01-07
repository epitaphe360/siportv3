/**
 * Script de nettoyage d'urgence pour localStorage
 * À exécuter dans la console navigateur si admin auto-connecté
 */

// Nettoyage complet
function cleanupAuth() {
  console.log('🧹 Nettoyage du localStorage...');
  
  // Supprimer toutes les clés d'auth
  const keysToRemove = [
    'siport-auth-storage',
    'sb-eqjoqgpbxhsfgcovipgu-auth-token',
    'supabase.auth.token',
    'supabase.auth.refreshToken'
  ];
  
  keysToRemove.forEach(key => {
    if (localStorage.getItem(key)) {
      console.log(`  ❌ Suppression de: ${key}`);
      localStorage.removeItem(key);
    }
  });
  
  // Nettoyer sessionStorage
  sessionStorage.clear();
  console.log('  ✅ SessionStorage nettoyé');
  
  // Vérifier ce qui reste
  console.log('\n📋 Contenu localStorage restant:');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      console.log(`  - ${key}`);
    }
  }
  
  console.log('\n✅ Nettoyage terminé! Rechargez la page (F5)');
}

// Vérifier l'état actuel
function checkAuthStatus() {
  console.log('🔍 Vérification de l\'état d\'authentification...\n');
  
  const authStorage = localStorage.getItem('siport-auth-storage');
  if (authStorage) {
    try {
      const parsed = JSON.parse(authStorage);
      console.log('📦 État dans localStorage:');
      console.log('  - Authentifié:', parsed.state?.isAuthenticated);
      console.log('  - Email:', parsed.state?.user?.email);
      console.log('  - Type:', parsed.state?.user?.type);
      console.log('  - Nom:', parsed.state?.user?.name);
      
      if (parsed.state?.user?.type === 'admin') {
        console.warn('\n⚠️ ALERTE: Type admin détecté dans localStorage!');
        console.warn('Exécutez cleanupAuth() pour nettoyer');
      }
    } catch (e) {
      console.error('❌ Impossible de parser le localStorage:', e);
    }
  } else {
    console.log('ℹ️ Aucune donnée d\'authentification dans localStorage');
  }
  
  // Vérifier Supabase
  const supabaseToken = localStorage.getItem('sb-eqjoqgpbxhsfgcovipgu-auth-token');
  if (supabaseToken) {
    console.log('\n🔐 Token Supabase présent');
  } else {
    console.log('\nℹ️ Pas de token Supabase');
  }
}

// Export pour utilisation dans console
if (typeof window !== 'undefined') {
  (window as any).cleanupAuth = cleanupAuth;
  (window as any).checkAuthStatus = checkAuthStatus;
  console.log('✅ Fonctions disponibles:');
  console.log('  - checkAuthStatus() : Vérifier l\'état actuel');
  console.log('  - cleanupAuth() : Nettoyer complètement');
}

export { cleanupAuth, checkAuthStatus };

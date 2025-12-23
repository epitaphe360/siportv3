# Scripts de Test et Diagnostic - SIPORT v3

## 🧪 Scripts de Test

### `test-all-pages.ts`
**Script complet de test de toutes les pages**

Teste automatiquement:
- ✅ Toutes les pages publiques
- ✅ Toutes les pages authentifiées (visiteur, exposant, partenaire, admin)
- ✅ Capture toutes les erreurs console
- ✅ Vérifie les temps de chargement
- ✅ Prend des captures d'écran
- ✅ Génère un rapport détaillé

**Utilisation:**
```powershell
# Méthode 1: Script PowerShell automatique
.\run-full-test.ps1

# Méthode 2: Directement
npx ts-node scripts/test-all-pages.ts http://localhost:5173
```

**Sorties générées:**
- `test-reports/run-{timestamp}/report.json` - Rapport JSON complet
- `test-reports/run-{timestamp}/REPORT.md` - Rapport Markdown lisible
- `test-reports/run-{timestamp}/FIXES_NEEDED.md` - Liste des corrections à appliquer
- `test-reports/run-{timestamp}/*.png` - Captures d'écran de chaque page

### `fix-admin-auto-login.ts`
**Détection du bug admin auto-connecté**

Scanne tout le code source pour détecter:
- ❌ Définitions hardcodées de `type: 'admin'`
- ❌ `isAdmin = true` forcé
- ❌ Sessions admin créées automatiquement
- ❌ useEffect qui set un admin par défaut

**Utilisation:**
```powershell
npx ts-node scripts/fix-admin-auto-login.ts
```

**Sortie:**
- `test-reports/admin-auto-login-issues.json` - Liste des problèmes détectés

### `run-full-test.ps1`
**Script PowerShell orchestrateur**

Exécute automatiquement:
1. ✅ Vérification du serveur dev
2. ✅ Scan du bug admin
3. ✅ Compilation des scripts
4. ✅ Exécution des tests complets
5. ✅ Ouverture des rapports

**Utilisation:**
```powershell
.\run-full-test.ps1
```

## 🔧 Outils de Diagnostic

### `cleanupAuth.ts`
**Nettoyage d'urgence du localStorage**

Fonctions disponibles dans la console navigateur:
- `checkAuthStatus()` - Vérifier l'état actuel d'authentification
- `cleanupAuth()` - Nettoyer complètement le localStorage

**Utilisation dans Console (F12):**
```javascript
// Vérifier l'état
checkAuthStatus();

// Si admin détecté, nettoyer
cleanupAuth();
```

## 📊 Interprétation des Rapports

### Rapport Principal (`REPORT.md`)

#### Section Résumé
- **Pages testées**: Nombre total de pages testées
- **Succès**: Pages sans erreur
- **Warnings**: Pages avec avertissements mineurs
- **Erreurs**: Pages avec erreurs critiques
- **Erreurs critiques**: Erreurs bloquantes nécessitant correction

#### Section Détail par Page
Pour chaque page:
- ✅ Succès / ⚠️ Warning / ❌ Erreur
- URL testée
- Temps de chargement (ms)
- Liste des erreurs détectées

#### Section Erreurs Critiques
Liste des bugs à corriger en priorité avec:
- Stack trace complète
- Message d'erreur
- Contexte (page où l'erreur apparaît)

### Rapport de Corrections (`FIXES_NEEDED.md`)

Corrections suggérées automatiquement par type d'erreur:

**Erreurs réseau (404, ERR_NAME_NOT_RESOLVED):**
- Vérifier URLs
- Ajouter fallbacks
- Gestion d'erreur try-catch

**Erreurs Supabase (400, 404):**
- Vérifier noms de colonnes
- Corriger foreign keys
- Vérifier existence des tables

**Erreurs JavaScript:**
- Variables non définies → imports manquants
- Cannot read property → optional chaining
- Async/await → gestion des promesses

## 🐛 Bug Admin Auto-Connecté

### Symptômes
- Admin connecté au démarrage de l'app
- Même après logout, admin se reconnecte
- localStorage contient `type: 'admin'`

### Solutions Appliquées

#### 1. Vérification renforcée dans `initAuth.ts`
```typescript
// Détection de données suspectes
if (parsed.state?.user?.type === 'admin') {
  console.warn('⚠️ Admin détecté dans localStorage');
}

// Vérification DB pour les admins
if (userProfile.type === 'admin') {
  const { data: dbUser } = await supabase
    .from('users')
    .select('type')
    .eq('id', userProfile.id)
    .single();
    
  if (!dbUser || dbUser.type !== 'admin') {
    console.error('❌ Tentative non autorisée!');
    logout();
  }
}
```

#### 2. Nettoyage complet au logout
```typescript
// Supprimer TOUTES les clés d'auth
localStorage.removeItem('siport-auth-storage');
localStorage.removeItem('sb-eqjoqgpbxhsfgcovipgu-auth-token');
sessionStorage.clear();
```

#### 3. Vérification de session Supabase
```typescript
// Si store dit authentifié mais Supabase dit non → logout
if (!session?.user && isAuthenticated) {
  console.warn('⚠️ Session fantôme détectée');
  logout();
}
```

### Correction Manuelle d'Urgence

Si le bug persiste:

1. **Ouvrir Console (F12)**
2. **Exécuter:**
   ```javascript
   checkAuthStatus()  // Vérifier l'état
   cleanupAuth()      // Nettoyer
   location.reload()  // Recharger
   ```

3. **Vérification:**
   - Ouvrir DevTools → Application → LocalStorage
   - Vérifier qu'il n'y a plus de clé `siport-auth-storage`
   - Vérifier qu'il n'y a plus de token Supabase

## 📋 Checklist de Test

Avant chaque déploiement:

- [ ] Exécuter `run-full-test.ps1`
- [ ] Vérifier rapport: 0 erreurs critiques
- [ ] Tester connexion/déconnexion manuelle
- [ ] Vérifier que localStorage est vide après logout
- [ ] Tester avec compte visiteur
- [ ] Tester avec compte exposant
- [ ] Tester avec compte partenaire
- [ ] Tester avec compte admin (vraiment authentifié)

## 🔄 Workflow de Correction

1. **Exécuter les tests**
   ```powershell
   .\run-full-test.ps1
   ```

2. **Analyser le rapport**
   - Ouvrir `REPORT.md`
   - Identifier les erreurs critiques

3. **Appliquer les corrections**
   - Suivre les suggestions dans `FIXES_NEEDED.md`
   - Corriger le code source

4. **Re-tester**
   ```powershell
   .\run-full-test.ps1
   ```

5. **Commit et push**
   ```powershell
   git add -A
   git commit -m "Fix: Corrections des erreurs détectées par tests"
   git push origin master
   ```

## ⚡ Tests Rapides

### Tester une page spécifique
```typescript
const tester = new PageTester('http://localhost:5173');
await tester.init();
await tester.testPage({ 
  path: '/dashboard', 
  name: 'Dashboard',
  requiresAuth: true 
});
```

### Tester avec un compte spécifique
```typescript
await tester.login('visitor');  // ou 'partner', 'exhibitor', 'admin'
await tester.testPage({ path: '/profile', name: 'Profile', requiresAuth: true });
```

## 📞 Support

Si les tests révèlent des erreurs non résolues:
1. Consulter `FIXES_NEEDED.md` pour les suggestions
2. Vérifier les logs console dans les captures d'écran
3. Analyser les stack traces dans `REPORT.md`
4. Consulter la documentation Supabase pour les erreurs 400/404

## 🎯 Objectifs

- ✅ 100% des pages sans erreurs critiques
- ✅ Temps de chargement < 3 secondes
- ✅ Aucune erreur console en production
- ✅ Aucun bug d'authentification

# 🚀 Guide Rapide - Tests et Corrections SIPORT v3

## ⚡ Démarrage Rapide

### 1. Lancer les tests complets
```powershell
.\run-full-test.ps1
```

Cela va:
- ✅ Tester toutes les pages (publiques + authentifiées)
- ✅ Capturer toutes les erreurs console
- ✅ Générer des rapports détaillés
- ✅ Créer des captures d'écran
- ✅ Détecter le bug admin

### 2. Consulter les rapports
Les rapports sont dans `test-reports/run-{timestamp}/`:
- **REPORT.md** → Rapport principal
- **FIXES_NEEDED.md** → Corrections suggérées
- **report.json** → Données brutes
- ***.png** → Captures d'écran

## 🐛 Bug Admin Auto-Connecté - Solutions

### Symptôme
Vous êtes connecté en tant qu'admin au démarrage de l'application.

### Solution Immédiate

**Méthode 1: Console Navigateur (F12)**
```javascript
// Vérifier l'état
checkAuthStatus()

// Nettoyer
cleanupAuth()

// Recharger
location.reload()
```

**Méthode 2: Manuellement**
1. F12 → Application → LocalStorage
2. Supprimer toutes les clés
3. F5 pour recharger

### Corrections Appliquées

#### ✅ Vérification stricte au démarrage (`initAuth.ts`)
```typescript
// Si admin détecté dans localStorage
// → Vérifier en DB que c'est un vrai admin
// → Sinon, logout automatique
```

#### ✅ Nettoyage complet au logout (`authStore.ts`)
```typescript
// Supprime TOUT:
// - localStorage
// - sessionStorage  
// - Token Supabase
```

#### ✅ Détection de sessions fantômes
```typescript
// Si store dit "connecté" mais Supabase dit "non"
// → Logout automatique
```

## 📊 Comprendre les Rapports

### Types d'Erreurs

#### 🔴 Erreurs Critiques (à corriger en priorité)
- **Crash**: Page ne charge pas
- **Error**: Erreur JavaScript bloquante
- **Network 404/400**: Ressources manquantes

#### 🟡 Warnings (à surveiller)
- Avertissements console
- Images manquantes (avec fallback)
- Requêtes lentes

#### 🟢 Succès
- Page charge correctement
- Pas d'erreurs
- Temps < 3 secondes

### Exemple de Rapport

```markdown
### ❌ Dashboard

- **URL:** http://localhost:5173/dashboard
- **Status:** error
- **Temps de chargement:** 2341ms
- **Erreurs (3):**
  - [ERROR] Cannot read property 'name' of undefined
  - [NETWORK] Failed to load: /api/stats - 404
  - [WARNING] Deprecated API usage
```

**Correction suggérée:**
```typescript
// Avant
const name = user.profile.name;

// Après
const name = user?.profile?.name ?? 'Utilisateur';
```

## 🔧 Commandes Utiles

### Test complet
```powershell
.\run-full-test.ps1
```

### Test d'une page spécifique
```powershell
npx ts-node scripts/test-all-pages.ts http://localhost:5173
```

### Détecter le bug admin
```powershell
npx ts-node scripts/fix-admin-auto-login.ts
```

### Console navigateur
```javascript
// Vérifier auth
checkAuthStatus()

// Nettoyer auth
cleanupAuth()

// Voir le store Zustand
console.log(useAuthStore.getState())
```

## 📋 Checklist Avant Production

- [ ] Exécuter `run-full-test.ps1`
- [ ] 0 erreurs critiques dans le rapport
- [ ] Toutes les pages chargent en < 3s
- [ ] Pas de bug admin auto-connecté
- [ ] Test manuel connexion/déconnexion
- [ ] localStorage vide après logout
- [ ] Test avec 4 types de comptes:
  - [ ] Visiteur
  - [ ] Exposant
  - [ ] Partenaire
  - [ ] Admin (avec credentials réels)

## 🆘 Dépannage

### Le serveur dev ne démarre pas
```powershell
# Tuer les process Node
taskkill /F /IM node.exe /T

# Redémarrer
npm run dev
```

### Le script ne trouve pas Playwright
```powershell
npm install -D playwright
npx playwright install
```

### Erreur TypeScript
```powershell
npx tsc scripts/test-all-pages.ts --module commonjs --target es2020
```

### Admin toujours connecté après cleanup
1. Fermer TOUS les onglets du site
2. Vider le cache (Ctrl+Shift+Del)
3. Ouvrir en navigation privée
4. Re-tester

## 📞 Support

### Logs Utiles

**Console navigateur (F12):**
- Erreurs JavaScript
- Requêtes réseau
- État du store

**Console PowerShell:**
- Résultats des tests
- Erreurs de compilation
- Statut du serveur

### Fichiers Importants

- `src/lib/initAuth.ts` → Initialisation auth
- `src/store/authStore.ts` → Store d'authentification
- `src/lib/cleanupAuth.ts` → Nettoyage localStorage
- `TESTS_README.md` → Documentation complète

## 🎯 Résultats Attendus

Après corrections, vous devriez avoir:
- ✅ 100% de pages sans erreurs critiques
- ✅ Temps de chargement < 3 secondes
- ✅ Aucun admin auto-connecté
- ✅ localStorage propre après logout
- ✅ Sessions Supabase synchronisées

---

**Besoin d'aide?** Consultez `TESTS_README.md` pour la documentation complète.

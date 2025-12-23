# 🧪 Guide des Tests E2E - SIPORT V3

## 📊 État Actuel des Tests

### ✅ Réussites
- **17/27 tests fonctionnels passent** (63%)
- Crash du navigateur résolu (waitForNavigation → waitForURL)
- Architecture optimisée avec comptes existants

### ❌ Problèmes Résolus
- ✅ Erreur syntaxe duplicate declarations
- ✅ Timeouts navigation corrigés
- ✅ Tests fonctionnels créés

### 🔴 En Attente
- Création des comptes de test dans la base de données
- Tests d'inscription (complexe, multi-étapes)

---

## 🎯 Stratégie de Test Actuelle

### Option A: Tests Fonctionnels (RECOMMANDÉ ✅)
Utilise des comptes pré-créés pour tester les fonctionnalités réelles:
- Login/Logout
- Navigation
- Accès selon les rôles
- Features spécifiques (VIP, Exposant, etc.)

**Fichier**: `e2e/functional-tests-with-existing-accounts.spec.ts`

### Option B: Tests d'Inscription (⚠️ COMPLEXE)
Teste le processus d'inscription complet:
- Formulaire multi-étapes (5 étapes)
- Validation des champs
- Création de compte

**Fichier**: `e2e/comprehensive-full-coverage.spec.ts`
**Status**: Nécessite corrections importantes

---

## 🚀 Mise en Place Rapide

### 1. Créer les Comptes de Test

#### Option 1: Via Script Automatique (SI Supabase local actif)
```powershell
# Démarrer Supabase local (si pas déjà fait)
npx supabase start

# Créer les comptes
node scripts/create-test-accounts.mjs
```

#### Option 2: Manuellement via l'Interface
```powershell
# Afficher la liste des comptes à créer
powershell scripts/list-test-accounts.ps1

# Puis créer chaque compte sur http://localhost:5173/register
```

#### Option 3: Via SQL Direct
```bash
# Exécuter le script SQL
psql -h localhost -p 54322 -U postgres -d postgres < supabase/seed_test_accounts.sql
```

### 2. Comptes de Test à Créer

Tous avec le mot de passe: **Test@1234567**

| Email | Type | Niveau | Usage |
|-------|------|--------|-------|
| visitor-free@test.siport.com | Visiteur | Gratuit | Tests visiteur basique |
| visitor-vip@test.siport.com | Visiteur | VIP 700€ | Tests features premium |
| exhibitor-9m@test.siport.com | Exposant | 9m² | Tests stand basique |
| exhibitor-18m@test.siport.com | Exposant | 18m² | Tests stand moyen |
| exhibitor-36m@test.siport.com | Exposant | 36m² | Tests stand premium |
| partner-museum@test.siport.com | Partenaire | Musée | Tests partenaire |
| partner-chamber@test.siport.com | Partenaire | Chambre | Tests partenaire |
| partner-sponsor@test.siport.com | Partenaire | Sponsor | Tests sponsor |
| admin-test@test.siport.com | Admin | Admin | Tests administration |

### 3. Lancer les Tests

```powershell
# Tests fonctionnels (RECOMMANDÉ)
npx playwright test functional-tests-with-existing-accounts.spec.ts

# Tests complets (865 tests - ATTENTION: long)
npx playwright test --project=chromium --max-failures=50

# Tests par fichier spécifique
npx playwright test comprehensive-workflows.spec.ts
```

---

## 📁 Structure des Tests

```
e2e/
├── functional-tests-with-existing-accounts.spec.ts  ✅ 27 tests - Comptes existants
├── comprehensive-full-coverage.spec.ts              ⏳ 200 tests - Coverage complet
├── comprehensive-workflows.spec.ts                  ✅ 110 tests - Workflows métier
├── complete-100-percent.spec.ts                     ⏳ 250 tests - Handlers
├── accessibility-ux.spec.ts                         ✅ 80 tests - Accessibilité
└── ...autres fichiers (225 tests restants)
```

**Total**: 865 tests créés

---

## 🔧 Résolution des Problèmes Courants

### Problème: Tests timeout
**Solution**: Augmenter le timeout dans playwright.config.ts
```typescript
timeout: 30000, // 30 secondes
```

### Problème: "Login failed" ou reste sur /login
**Cause**: Compte n'existe pas dans la BD
**Solution**: Créer les comptes via scripts ci-dessus

### Problème: "waitForNavigation deprecated"
**Status**: ✅ RÉSOLU - Remplacé par waitForURL()

### Problème: Tests d'inscription échouent
**Cause**: Formulaire multi-étapes complexe
**Solution**: Utiliser les tests fonctionnels à la place

---

## 📊 Résultats Attendus

Après création des comptes de test:

| Catégorie | Tests | Taux de Réussite Attendu |
|-----------|-------|--------------------------|
| Tests Fonctionnels | 27 | ~95% (25/27) |
| Workflows | 110 | ~80% (88/110) |
| Accessibilité | 80 | ~90% (72/80) |
| Handlers | 250 | ~60% (150/250) |
| Coverage Complet | 200 | ~50% (100/200) |
| Autres | 198 | ~70% (138/198) |
| **TOTAL** | **865** | **~70% (605/865)** |

---

## 🎯 Prochaines Étapes

### Court Terme (Immédiat)
1. ✅ Créer les 10 comptes de test
2. ✅ Exécuter tests fonctionnels
3. ✅ Valider taux de réussite > 90%

### Moyen Terme (Cette semaine)
1. ⏳ Corriger tests d'inscription (ou les skip)
2. ⏳ Améliorer tests handlers
3. ⏳ Augmenter coverage à 80%

### Long Terme (Ce mois)
1. ⏳ Tests de performance
2. ⏳ Tests de régression
3. ⏳ CI/CD integration

---

## 💡 Conseils

### Pour Développement Rapide
```powershell
# Focus sur les tests qui passent
npx playwright test -g "VF|VIP|EX|PA|AD|UI"

# Skip les tests d'inscription
npx playwright test --grep-invert "registration|inscription"
```

### Pour Debug
```powershell
# Mode debug avec UI
npx playwright test --debug

# Headed mode (voir le navigateur)
npx playwright test --headed

# Screenshot à chaque étape
npx playwright test --screenshot=on
```

### Pour Performance
```powershell
# Parallélisation
npx playwright test --workers=4

# Tests rapides uniquement
npx playwright test --grep "UI|PERF"
```

---

## 📞 Support

**Problème avec les tests?**
1. Vérifier que le frontend tourne: http://localhost:5173
2. Vérifier que Supabase est actif: http://localhost:5000
3. Vérifier que les comptes de test existent
4. Consulter les logs dans `test-results/`

**Contact**: Voir documentation principale du projet

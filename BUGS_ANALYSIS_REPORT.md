# 🔴 RAPPORT D'ANALYSE APPROFONDIE - BUGS DÉTECTÉS

**Date**: Analyse approfondie du code SIPORTS
**Statut**: CORRIGÉ

---

## BUGS CRITIQUES IDENTIFIÉS

### **BUG #1 : Les comptes de test n'existent pas dans `auth.users`** ⚠️ NON CORRIGÉ (nécessite action manuelle)

**Problème :** Les tests E2E utilisent des comptes comme `visitor-free@test.siport.com` mais ces comptes :
- ✅ Sont définis dans `seed_test_accounts.sql` (table `public.users`)
- ❌ **N'existent PAS dans `auth.users`** (table d'authentification Supabase)

**Cause :** La fonction `signInWithPassword` de Supabase authentifie contre `auth.users`, pas contre `public.users`.

**Solution REQUISE :** Exécuter le script de synchronisation :
```powershell
# 1. Configurer la clé service role
$env:VITE_SUPABASE_SERVICE_ROLE_KEY = "votre-service-role-key"

# 2. Exécuter le script
node scripts/sync-test-accounts.mjs
```

---

### **BUG #2 : Incohérence du mot de passe** ✅ CORRIGÉ

| Fichier | Avant | Après |
|---------|-------|-------|
| `e2e/comprehensive-workflows.spec.ts` | `Test@123456` | `Test@1234567` |
| `scripts/sync-test-accounts.mjs` | `Test@1234567` | `Test@1234567` |

**Correction :** Mot de passe harmonisé à `Test@1234567` partout.

---

### **BUG #3 : Comptes manquants dans sync-test-accounts.mjs** ✅ CORRIGÉ

**Comptes ajoutés :**
- `partner-chamber@test.siport.com` (silver tier)
- `partner-sponsor@test.siport.com` (gold tier)
- `partner-platinum@test.siport.com` (platinum tier)
- `exhibitor-54m@test.siport.com` (exposant 54m²)

---

### **BUG #4 : Route VISITOR_SUBSCRIPTION définie deux fois** ✅ CORRIGÉ

**Problème dans `App.tsx` :**
- Ligne 180 : `<Route path={ROUTES.VISITOR_SUBSCRIPTION} element={<SubscriptionPage />} />` (PUBLIC)
- Ligne 212 : `<Route path={ROUTES.VISITOR_SUBSCRIPTION} element={<VisitorSubscriptionPage />} />` (PROTECTED)

**Correction :** La route dupliquée à la ligne 212 a été supprimée. L'import `VisitorSubscriptionPage` a été retiré.

---

### **BUG #5 : Routes hardcodées au lieu d'utiliser ROUTES** ✅ CORRIGÉ

**Routes ajoutées dans `src/lib/routes.ts` :**
```typescript
VISITOR_PAYMENT: '/visitor/payment',
VISITOR_PAYMENT_SUCCESS: '/visitor/payment-success',
VISITOR_PAYMENT_INSTRUCTIONS: '/visitor/payment-instructions',
BADGE_DIGITAL: '/badge/digital',
BADGE_SCANNER: '/badge/scanner',
SECURITY_SCANNER: '/security/scanner',
PARTNER_UPGRADE: '/partner/upgrade',
PARTNER_PAYMENT_SELECTION: '/partner/payment-selection',
PARTNER_BANK_TRANSFER: '/partner/bank-transfer',
ADMIN_PAYMENT_VALIDATION: '/admin/payment-validation',
```

**Routes mises à jour dans `App.tsx` :**
- `/dev/test-flow` → `ROUTES.DEV_TEST_FLOW`
- `/visitor/payment` → `ROUTES.VISITOR_PAYMENT`
- `/visitor/payment-success` → `ROUTES.VISITOR_PAYMENT_SUCCESS`
- `/visitor/payment-instructions` → `ROUTES.VISITOR_PAYMENT_INSTRUCTIONS`
- `/badge/digital` → `ROUTES.BADGE_DIGITAL`
- `/badge/scanner` → `ROUTES.BADGE_SCANNER`
- `/security/scanner` → `ROUTES.SECURITY_SCANNER`
- `/partner/upgrade` → `ROUTES.PARTNER_UPGRADE`
- `/partner/payment-selection` → `ROUTES.PARTNER_PAYMENT_SELECTION`
- `/partner/bank-transfer` → `ROUTES.PARTNER_BANK_TRANSFER`
- `/admin/payment-validation` → `ROUTES.ADMIN_PAYMENT_VALIDATION`
- `/admin/partners` → `ROUTES.ADMIN_PARTNERS`

---

## FLUX D'AUTHENTIFICATION ANALYSÉ

```
┌─────────────────────────────────────────────────────────────┐
│                     LOGIN FLOW                               │
├─────────────────────────────────────────────────────────────┤
│ 1. User enters email/password                                │
│ 2. LoginPage calls authStore.login(email, password)          │
│ 3. authStore.login calls SupabaseService.signIn()            │
│ 4. SupabaseService.signIn:                                   │
│    a. supabase.auth.signInWithPassword() → auth.users        │
│    b. If OK: getUserByEmail() → public.users                 │
│ 5. On success: redirect based on user.type                   │
├─────────────────────────────────────────────────────────────┤
│ PROBLEM: Step 4a fails if user not in auth.users!            │
└─────────────────────────────────────────────────────────────┘
```

---

## PROTECTED ROUTE ANALYSIS

```typescript
// ProtectedRoute vérifie:
1. isAuthenticated && user → sinon redirect /login
2. user.status === 'active' → sinon:
   - 'pending' → /pending-account
   - 'suspended'/'rejected' → /login avec erreur
3. requiredRole match → sinon /forbidden
```

---

## ACTIONS REQUISES POUR FAIRE FONCTIONNER LES TESTS

### Étape 1 : Configurer la clé Service Role
```bash
# Dans .env ou variables d'environnement
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Étape 2 : Synchroniser les comptes de test
```powershell
node scripts/sync-test-accounts.mjs
```

### Étape 3 : Vérifier les comptes
```powershell
node scripts/check-auth-users.mjs
```

### Étape 4 : Lancer les tests
```powershell
npx playwright test e2e/comprehensive-workflows.spec.ts
```

---

## FICHIERS MODIFIÉS

| Fichier | Modification |
|---------|-------------|
| `e2e/comprehensive-workflows.spec.ts` | Mot de passe corrigé de `Test@123456` à `Test@1234567` |
| `scripts/sync-test-accounts.mjs` | Ajout de 4 comptes manquants |
| `src/App.tsx` | Suppression route dupliquée, utilisation constantes ROUTES |
| `src/lib/routes.ts` | Ajout de 11 nouvelles constantes de routes |
| `src/types/index.ts` | Ajout du type `'security'` |
| `src/services/supabaseService.ts` | Ajout du type `'security'` |
| `src/lib/supabase.ts` | Ajout du type `'security'` |
| `src/utils/validationSchemas.ts` | Ajout du type `'security'` |
| `src/store/authStore.ts` | Ajout du type `'security'` |

---

## 🔴 BUG #6 CORRIGÉ : Type utilisateur 'security' non défini

**Problème :** La route `/security/scanner` requiert `requiredRole="security"` mais ce type n'existait pas.

---

## 🔴 BUGS PRÉ-EXISTANTS DANS LES PAGES MEDIA (NON CORRIGÉS)

### **BUG #7 : Import incorrect `mediaService`**
Fichiers : CapsulesPage, LiveStudioPage, BestMomentsPage, TestimonialsPage, MediaLibraryPage, MediaManagementPage, PartnerMediaUploadPage, PartnerMediaAnalyticsPage

### **BUG #8 : Propriétés incorrectes sur MediaContent**
- `view_count` → `views_count`
- `like_count` → `likes_count`

### **BUG #9 : Types MediaType incorrects**
- `'capsule'`, `'live'`, `'moment'` ne sont pas des valeurs valides

### **BUG #10 : Status 'pending' inexistant dans MediaStatus**

---

## RECOMMANDATIONS SUPPLÉMENTAIRES

1. **Créer un script de setup complet** qui vérifie et crée automatiquement tous les comptes de test avant de lancer les tests E2E

2. **Documenter les prérequis** pour exécuter les tests E2E dans le README

3. **Ajouter un healthcheck** dans les tests E2E pour vérifier que les comptes existent avant de tester le login

4. **Unifier les fichiers de configuration** - avoir une seule source de vérité pour les comptes de test

5. **Corriger les bugs Media** - Les imports et types dans les pages Media doivent être corrigés

# 📊 Logs attendus après correction PGRST116

Voici ce que vous devriez voir dans la console du navigateur (F12) après les corrections.

---

## ✅ SCÉNARIO 1: Mise à jour réussie

### Action
Cliquer sur "Sauvegarder" dans la page de profil avec des changements

### Console logs attendus
```
authStore.ts:430 🔄 Début mise à jour profil pour: 1aba9cf3-3b52-4a09-bc5d-3a6236661c60
authStore.ts:431 📊 Données à fusionner: sectors,interests,objectives,collaborationTypes
authStore.ts:433 ✅ Profil fusionné, envoi vers Supabase...
supabaseService.ts:217 🔍 Vérification de l'utilisateur avant mise à jour: 1aba9cf3-3b52-4a09-bc5d-3a6236661c60
supabaseService.ts:247 📝 Mise à jour utilisateur: 1aba9cf3-3b52-4a09-bc5d-3a6236661c60 sectors,interests,objectives,collaborationTypes,profile,updated_at
supabaseService.ts:263 ✅ Utilisateur mis à jour avec succès: 1aba9cf3-3b52-4a09-bc5d-3a6236661c60
authStore.ts:453 ✅ Profil mis à jour avec succès: {userId: "1aba9cf3-3b52-4a09-bc5d-3a6236661c60", sectors: 3, interests: 2, objectives: 2, bio: "My bio text..."}

[SUCCESS TOAST APPEARS] ✅ Profil mis à jour avec succès ! Redirection vers votre réseau...
```

### Redirection attendue
→ Redirection vers `/networking?generate=true` après 1.5 secondes

---

## ❌ SCÉNARIO 2: Utilisateur non trouvé

### Action
Cliquer sur "Sauvegarder" si l'utilisateur n'existe pas

### Console logs attendus
```
authStore.ts:430 🔄 Début mise à jour profil pour: 1aba9cf3-3b52-4a09-bc5d-3a6236661c60
authStore.ts:431 📊 Données à fusionner: sectors,interests,objectives,collaborationTypes
authStore.ts:433 ✅ Profil fusionné, envoi vers Supabase...
supabaseService.ts:217 🔍 Vérification de l'utilisateur avant mise à jour: 1aba9cf3-3b52-4a09-bc5d-3a6236661c60
supabaseService.ts:220 ❌ Erreur vérification utilisateur 1aba9cf3-3b52-4a09-bc5d-3a6236661c60: {code: "PGRST100", details: "0 rows", ...}
authStore.ts:458 ❌ Erreur mise à jour profil pour 1aba9cf3-3b52-4a09-bc5d-3a6236661c60: Utilisateur 1aba9cf3-3b52-4a09-bc5d-3a6236661c60 non trouvé ou pas d'accès (RLS)
```

### Toast attendu
```
❌ Erreur lors de la mise à jour du profil
```

### Actions recommandées
→ Exécuter: `node scripts/verify-fix-users.mjs`

---

## 🔒 SCÉNARIO 3: Problème RLS (Row Level Security)

### Action
Cliquer sur "Sauvegarder" si les permissions RLS sont incorrectes

### Console logs attendus
```
authStore.ts:430 🔄 Début mise à jour profil pour: 1aba9cf3-3b52-4a09-bc5d-3a6236661c60
authStore.ts:431 📊 Données à fusionner: sectors,interests,objectives,collaborationTypes
authStore.ts:433 ✅ Profil fusionné, envoi vers Supabase...
supabaseService.ts:217 🔍 Vérification de l'utilisateur avant mise à jour: 1aba9cf3-3b52-4a09-bc5d-3a6236661c60
supabaseService.ts:217 ✅ [vérification passe]
supabaseService.ts:247 📝 Mise à jour utilisateur: 1aba9cf3-3b52-4a09-bc5d-3a6236661c60
supabaseService.ts:254 ❌ Erreur lors de la mise à jour 1aba9cf3-3b52-4a09-bc5d-3a6236661c60: {code: "PGRST116", message: "Cannot coerce the result to a single JSON object", ...}
authStore.ts:458 ❌ Erreur mise à jour profil pour 1aba9cf3-3b52-4a09-bc5d-3a6236661c60: Erreur mise à jour: Cannot coerce the result to a single JSON object
authStore.ts:462 🔒 PROBLÈME RLS DÉTECTÉ - Vérifiez les politiques de sécurité en base de données
```

### Toast attendu
```
❌ Erreur lors de la mise à jour du profil
```

### Actions recommandées
→ Vérifier les politiques RLS en Supabase Studio
→ Exécuter en PostgreSQL:
```sql
SELECT * FROM pg_policies WHERE tablename = 'users';
```

---

## 🔍 DIAGNOSTIC CONSOLE COMPLET

Pour voir TOUS les logs, exécuter ceci dans la console:

```javascript
// Filtrer les logs de notre correction
console.log('%c LOGS DE MISE À JOUR UTILISATEUR', 'color: blue; font-weight: bold');
console.log('Recherchez:');
console.log('✅ = Étape réussie');
console.log('❌ = Erreur');
console.log('🔍 = Vérification');
console.log('📝 = Mise à jour');
console.log('🔒 = Problème RLS');
console.log('🔄 = Début du processus');
console.log('📊 = Données');
```

---

## 🎯 Vérifications supplémentaires

### 1. Vérifier que l'ID utilisateur est correct
Ouvrir la console et exécuter:
```javascript
const { user } = useAuthStore.getState();
console.log('Utilisateur connecté:', user?.id);
console.log('Email:', user?.email);
console.log('Type:', user?.type);
```

### 2. Vérifier la session Supabase
```javascript
const { data: { session } } = await supabase.auth.getSession();
console.log('Session active:', !!session);
console.log('User ID from auth:', session?.user?.id);
```

### 3. Vérifier les permissions RLS
Aller dans Supabase Studio → SQL Editor et exécuter:
```sql
-- Affiche les politiques RLS de la table users
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Affiche qui a accès
SELECT auth.uid();
```

---

## 📋 Timeline des changements

### Avant correction (❌ PGRST116)
```
User clicks "Sauvegarder"
  → authStore.updateProfile()
    → SupabaseService.updateUser()
      → .select().single()  ❌ Attend 1 résultat
        → 0 résultats retournés
          → PGRST116 ERROR
            → Toast erreur
```

### Après correction (✅ Réussie)
```
User clicks "Sauvegarder"
  → authStore.updateProfile()
    → 🔄 Console log
    → SupabaseService.updateUser()
      → 🔍 Vérify user exists
      → 📝 Update avec .select('*')
        → ✅ Vérify data.length > 0
          → Transform to User
            → 🔒 Store updated
              → ✅ Success logs
                → 🎉 Toast + Redirection
```

---

## 🐛 Troubleshooting par log

### "Cannot find [method] "
```
❌ PGRST116: Cannot coerce
↳ Solution: Les polices RLS empêchent la lecture après UPDATE
↳ Action: Vérifier que SELECT est autorisé après UPDATE dans RLS
```

### "Utilisateur non trouvé"
```
❌ Utilisateur ... n'existe pas
↳ Solution: Le profil utilisateur n'existe pas en BD
↳ Action: node scripts/verify-fix-users.mjs
```

### "Pas d'accès (RLS)"
```
❌ Utilisateur ... non trouvé ou pas d'accès (RLS)
↳ Solution: Les permissions RLS bloquent l'accès
↳ Action: Vérifier auth.uid() = id dans les politiques
```

### "aucune ligne retournée"
```
❌ PGRST116: Aucune ligne retournée après mise à jour
↳ Solution: La vérification .length échoue
↳ Action: Vérifier que update() retourne au moins 1 ligne
```

---

## ✨ Logs "good sign"

Cherchez ces signes positifs:

✅ `🔍 Vérification de l'utilisateur` → User existe
✅ `📝 Mise à jour utilisateur` → Update lancée
✅ `✅ Utilisateur mis à jour` → Données retournées
✅ `✅ Profil mis à jour avec succès` → Store updated
✅ `toast.success('✅ Profil mis...` → UI feedback

---

## 🎓 Apprentissage Supabase

Ce problème illustre:
1. **.single() vs .select()** - Gestion des résultats Supabase
2. **RLS basics** - Pourquoi les permissions comptent
3. **Error handling** - Capturer les vraies erreurs
4. **Logging patterns** - Debugging efficace

Pour en savoir plus, voir [CORRECTION_PGRST116_COMPLETE.md](./CORRECTION_PGRST116_COMPLETE.md)

---

**Dernière mise à jour**: 6 janvier 2026

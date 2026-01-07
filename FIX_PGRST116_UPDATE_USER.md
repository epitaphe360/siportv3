# Correction de l'erreur PGRST116 - Mise à jour utilisateur Supabase

## 🔴 Le problème
Erreur lors de la mise à jour du profil utilisateur:
```
PGRST116: Cannot coerce the result to a single JSON object
fetch.js:5 PATCH https://...supabase.co/rest/v1/users?id=eq.{userId}&select=* 406 (Not Acceptable)
```

## 🔍 Causes identifiées

1. **`.single()` avec résultat vide** - La requête `.select().single()` s'attend à 1 seul résultat, mais en reçoit 0
2. **Problème RLS (Row Level Security)** - Les politiques de sécurité peuvent bloquer la lecture après une mise à jour
3. **ID utilisateur inexistant** - L'utilisateur n'existe pas vraiment en base de données
4. **Permissions insuffisantes** - L'utilisateur n'a pas les droits de lire ses propres données après une mise à jour

## ✅ Corrections appliquées

### 1. **supabaseService.ts** - Amélioration de `updateUser()`

**Avant** (problématique):
```typescript
const { data, error } = await safeSupabase
  .from('users')
  .update(updateData)
  .eq('id', userId)
  .select()
  .single();  // 🔴 Attend 1 résultat exactement
```

**Après** (corrigé):
```typescript
// ✅ Étape 1: Vérifier l'existence AVANT la mise à jour
const { data: existingUser, error: checkError } = await safeSupabase
  .from('users')
  .select('id')
  .eq('id', userId)
  .single();

if (checkError) {
  throw new Error(`Utilisateur ${userId} non trouvé ou RLS: ${checkError.message}`);
}

// ✅ Étape 2: Mettre à jour
const { data, error } = await safeSupabase
  .from('users')
  .update(updateData)
  .eq('id', userId)
  .select('*');  // ✅ Select * au lieu de select()

if (!data || data.length === 0) {
  throw new Error('Pas de données retournées après mise à jour');
}

const updatedData = Array.isArray(data) ? data[0] : data;
return this.transformUserDBToUser(updatedData);
```

### 2. **authStore.ts** - Meilleur logging et gestion d'erreur

**Améliorations**:
- Ajout de logs détaillés à chaque étape
- ID utilisateur inclus dans les logs
- Détection spécifique des erreurs RLS
- Message d'erreur plus explicite

```typescript
console.log('🔄 Début mise à jour profil pour:', user.id);
console.log('📊 Données à fusionner:', Object.keys(profileData));

// ... mise à jour ...

if (errorMsg.includes('RLS') || errorMsg.includes('PGRST116')) {
  console.error('🔒 PROBLÈME RLS DÉTECTÉ - Vérifiez les politiques');
}
```

## 🔧 Diagnostic

Un script de diagnostic a été créé pour tester le problème:

```bash
node scripts/diagnose-user-update.mjs
```

Ce script:
1. ✅ Teste la connexion Supabase
2. ✅ Récupère les utilisateurs existants
3. ✅ Teste la vérification d'existence
4. ✅ Teste la mise à jour
5. ✅ Analyse les erreurs RLS si présentes

## 🛠️ Vérifications à faire

### 1. Vérifier que l'ID utilisateur existe réellement
```sql
SELECT id, email FROM users WHERE id = '1aba9cf3-3b52-4a09-bc5d-3a6236661c60';
```

### 2. Vérifier les politiques RLS sur la table `users`
```sql
SELECT * FROM pg_policies WHERE tablename = 'users';
```

### 3. Vérifier que l'utilisateur peut lire ses propres données
Politiques RLS correctes (exemple):
```sql
-- Allow users to SELECT their own data
CREATE POLICY "Users can read their own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Allow users to UPDATE their own data
CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

## 📝 Checklist de vérification

- [ ] Script de diagnostic exécuté sans erreur
- [ ] `updateUser()` in `supabaseService.ts` accepte maintenant les résultats sous forme de tableau
- [ ] Logs détaillés affichant l'ID utilisateur et les étapes
- [ ] Erreurs RLS détectées et signalées clairement
- [ ] Les permissions RLS permettent SELECT + UPDATE pour l'utilisateur

## 🚀 Prochaines étapes

1. Exécuter le diagnostic: `node scripts/diagnose-user-update.mjs`
2. Vérifier les résultats
3. Si erreur RLS: Corriger les politiques en base de données
4. Tester la mise à jour du profil dans l'appli
5. Vérifier les logs pour confirmer le succès

## 📞 Support

Si le problème persiste après ces corrections:
1. Vérifiez que `auth.uid()` retourne le bon ID (vérification d'identité)
2. Testez les requêtes SQL directement dans Supabase Studio
3. Vérifiez les logs Supabase pour les erreurs RLS
4. Considérez une remise à zéro des politiques RLS si nécessaire

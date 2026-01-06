# 🔧 Correction complète de l'erreur PGRST116 - Mise à jour utilisateur

Date: 6 janvier 2026

## 📋 Résumé des modifications

### ✅ 1. Correction de `supabaseService.ts` - Méthode `updateUser()`

**Problème**: L'erreur PGRST116 survient car `.single()` s'attend à exactement 1 résultat, mais la requête en retourne 0.

**Solutions appliquées**:

1. **Vérification d'existence AVANT mise à jour**
   - Teste que l'utilisateur existe avec un `.single()` sur SELECT uniquement
   - Capture les erreurs de RLS ou d'utilisateur inexistant
   - Évite les erreurs de `Cannot coerce`

2. **Passage de `.select()` à `.select('*')**
   - Retourne un tableau au lieu d'un objet unique
   - Gère mieux les cas avec 0 ou plusieurs résultats

3. **Vérification du contenu du résultat**
   ```typescript
   if (!data || data.length === 0) {
     throw new Error('Pas de données retournées après mise à jour');
   }
   const updatedData = Array.isArray(data) ? data[0] : data;
   ```

4. **Logging détaillé avec emojis**
   - 🔍 Vérification
   - 📝 Mise à jour
   - ❌ Erreurs avec contexte
   - ✅ Succès

**Avant** (ligne ~232):
```typescript
const { data, error } = await safeSupabase
  .from('users')
  .update(updateData)
  .eq('id', userId)
  .select()
  .single();  // ❌ PROBLÉMATIQUE
```

**Après** (ligne ~232):
```typescript
// 1. Vérification d'existence
const { data: existingUser, error: checkError } = await safeSupabase
  .from('users')
  .select('id')
  .eq('id', userId)
  .single();

if (checkError) {
  throw new Error(`Utilisateur ${userId} non trouvé ou pas d'accès (RLS)`);
}

// 2. Mise à jour avec select('*')
const { data, error } = await safeSupabase
  .from('users')
  .update(updateData)
  .eq('id', userId)
  .select('*');  // ✅ CORRECT

// 3. Vérification du résultat
if (!data || data.length === 0) {
  throw new Error(`Pas de données retournées après mise à jour de ${userId}`);
}
```

---

### ✅ 2. Amélioration de `authStore.ts` - Fonction `updateProfile()`

**Améliorations**:

1. **Logging transparent des étapes**
   ```typescript
   console.log('🔄 Début mise à jour profil pour:', user.id);
   console.log('📊 Données à fusionner:', Object.keys(profileData));
   console.log('✅ Profil fusionné, envoi vers Supabase...');
   ```

2. **Détection spécifique des erreurs RLS**
   ```typescript
   if (errorMsg.includes('RLS') || errorMsg.includes('PGRST116')) {
     console.error('🔒 PROBLÈME RLS DÉTECTÉ');
   }
   ```

3. **Inclusion de l'ID utilisateur dans tous les logs**
   ```typescript
   console.error('❌ Erreur mise à jour profil pour', user.id, ':', errorMsg);
   ```

---

## 🔍 Scripts de diagnostic créés

### 1. `scripts/diagnose-user-update.mjs`
Teste complètement le flux de mise à jour:
```bash
node scripts/diagnose-user-update.mjs
```

Vérifications:
- ✅ Connexion Supabase
- ✅ Existence des utilisateurs
- ✅ Vérification avant mise à jour
- ✅ Mise à jour avec gestion d'erreur
- ✅ Analyse des codes d'erreur (PGRST116, etc.)

### 2. `scripts/verify-fix-users.mjs`
Vérifie et corrige l'état des utilisateurs:
```bash
node scripts/verify-fix-users.mjs
```

Actions:
- ✅ Vérifie la table `users`
- ✅ Cherche l'utilisateur connecté
- ✅ Crée le profil s'il manque
- ✅ Teste la mise à jour
- ✅ Affiche un résumé

---

## 🛠️ Causes racines du PGRST116

| Cause | Symptôme | Solution |
|-------|----------|----------|
| `.single()` avec 0 résultat | PGRST116 directement | Utiliser `.select('*')` + vérifier `length` |
| RLS empêche la relecture | PGRST116 après UPDATE | Vérifier permissions SELECT après UPDATE |
| Utilisateur inexistant | Erreur SELECT | Créer le profil ou vérifier l'ID |
| ID utilisateur vide | Erreur silencieuse | Logs avec console.log(userId) |
| Permissions insuffisantes | Erreur 406 en POST | Vérifier l'authentification Supabase |

---

## 📝 Checklist de correction

- ✅ Fichier: `src/services/supabaseService.ts` (ligne ~211)
  - ✅ Ajout vérification d'existence
  - ✅ Changement `.select().single()` → `.select('*')`
  - ✅ Vérification `data.length === 0`
  - ✅ Logs détaillés avec userId

- ✅ Fichier: `src/store/authStore.ts` (ligne ~423)
  - ✅ Logs des étapes avec user.id
  - ✅ Détection RLS/PGRST116
  - ✅ Messages d'erreur détaillés

- ✅ Créé: `scripts/diagnose-user-update.mjs`
  - ✅ Diagnostic complet du flux
  - ✅ Analyse des erreurs

- ✅ Créé: `scripts/verify-fix-users.mjs`
  - ✅ Vérification de l'état
  - ✅ Création de profils manquants
  - ✅ Test de mise à jour

- ✅ Créé: `FIX_PGRST116_UPDATE_USER.md`
  - ✅ Documentation complète

---

## 🚀 Comment utiliser les corrections

### 1. Tester que tout fonctionne
```bash
npm run dev
# Aller à /profile et essayer de mettre à jour
```

### 2. Si erreur persiste, diagnoser
```bash
node scripts/verify-fix-users.mjs
# ou
node scripts/diagnose-user-update.mjs
```

### 3. Vérifier les logs
- Console du navigateur (F12)
- Rechercher `🔄`, `❌`, `✅`, `🔒`

### 4. Vérifier les politiques RLS en Supabase
```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'users';
```

---

## 📊 Détail des changements

### Fichier 1: `src/services/supabaseService.ts`

```diff
- static async updateUser(userId: string, userData: Partial<User>): Promise<User | null> {
+ static async updateUser(userId: string, userData: Partial<User>): Promise<User | null> {
    if (!this.checkSupabaseConnection()) return null;
    const safeSupabase = supabase!;
    try {
+     // ✅ Étape 1: Vérifier l'existence avant mise à jour
+     console.log('🔍 Vérification de l\'utilisateur:', userId);
+     const { data: existingUser, error: checkError } = await safeSupabase
+       .from('users')
+       .select('id')
+       .eq('id', userId)
+       .single();
+
+     if (checkError || !existingUser) {
+       throw new Error(`Utilisateur ${userId} non trouvé ou RLS: ${checkError?.message}`);
+     }
+
+     // ✅ Étape 2: Construire les données
      const updateData: Record<string, any> = {};
      if (userData.name !== undefined) updateData.name = userData.name;
      // ...
      updateData.updated_at = new Date().toISOString();
+     
+     // ✅ Étape 3: Mettre à jour
+     console.log('📝 Mise à jour utilisateur:', userId, Object.keys(updateData));
      const { data, error } = await safeSupabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
-       .select()
-       .single();
+       .select('*');
      
      if (error) {
-       throw error;
+       throw new Error(`Erreur mise à jour: ${error.message}`);
      }
+
+     // ✅ Vérifier le résultat
+     if (!data || data.length === 0) {
+       throw new Error(`Pas de données retournées pour ${userId}`);
+     }
      
-     return this.transformUserDBToUser(data);
+     const updatedData = Array.isArray(data) ? data[0] : data;
+     console.log('✅ Utilisateur mis à jour avec succès:', userId);
+     return this.transformUserDBToUser(updatedData);
    } catch (error) {
      console.error(`❌ Erreur mise à jour utilisateur ${userId}:`, error);
      throw error;
    }
  }
```

### Fichier 2: `src/store/authStore.ts`

```diff
  updateProfile: async (profileData: Partial<UserProfile>) => {
    const { user } = get();
    if (!user) throw new Error('Utilisateur non connecté');
    set({ isLoading: true });
    try {
+     console.log('🔄 Début mise à jour profil pour:', user.id);
+     console.log('📊 Données à fusionner:', Object.keys(profileData));
      const mergedProfile = { ...user.profile, ...profileData };
+     console.log('✅ Profil fusionné, envoi vers Supabase...');
      
      const updatedUser = await SupabaseService.updateUser(user.id, {
        ...user,
        profile: mergedProfile
      });
      
      if (!updatedUser) throw new Error('Impossible de mettre à jour');
      set({ user: updatedUser, isLoading: false });
      
      console.log('✅ Profil mis à jour avec succès:', {
+       userId: user.id,
        sectors: updatedUser.profile.sectors?.length || 0,
        // ...
      });
    } catch (error: unknown) {
      set({ isLoading: false });
+     const errorMsg = error instanceof Error ? error.message : String(error);
-     console.error('❌ Erreur mise à jour profil:', error);
+     console.error('❌ Erreur mise à jour profil pour', user.id, ':', errorMsg);
+     
+     if (errorMsg.includes('RLS') || errorMsg.includes('PGRST116')) {
+       console.error('🔒 PROBLÈME RLS DÉTECTÉ - Vérifiez les politiques');
+     }
      
      throw error instanceof Error ? error : new Error('Erreur mise à jour');
    }
  }
```

---

## 🎯 Résultats attendus après correction

### Console du navigateur
```
🔄 Début mise à jour profil pour: 1aba9cf3-3b52-4a09-bc5d-3a6236661c60
📊 Données à fusionner: sectors,interests,objectives
✅ Profil fusionné, envoi vers Supabase...
🔍 Vérification de l'utilisateur: 1aba9cf3-3b52-4a09-bc5d-3a6236661c60
📝 Mise à jour utilisateur: 1aba9cf3-3b52-4a09-bc5d-3a6236661c60
✅ Utilisateur mis à jour avec succès: 1aba9cf3-3b52-4a09-bc5d-3a6236661c60
✅ Profil mis à jour avec succès: { userId: ..., sectors: 3, interests: 2, ... }
```

### Interface utilisateur
- ✅ Toast de succès s'affiche
- ✅ Redirection vers /networking
- ✅ Les données sont sauvegardées

---

## 📞 Dépannage supplémentaire

### Si "PGRST116" persiste:
1. Exécuter: `node scripts/verify-fix-users.mjs`
2. Vérifier que le profil utilisateur existe
3. Vérifier les politiques RLS: `SELECT * FROM pg_policies WHERE tablename = 'users'`
4. Vérifier `auth.uid()` avec: `SELECT auth.uid()`

### Si "RLS" s'affiche:
1. L'utilisateur n'a pas les permissions SELECT/UPDATE
2. Checker la politique: `USING (auth.uid() = id)`
3. Créer ou corriger la politique en Supabase Studio

### Si "Utilisateur non connecté":
1. Vérifier `useAuthStore.user` est bien défini
2. Vérifier la session Supabase: `supabase.auth.getSession()`

---

## ✨ Améliorations à considérer pour l'avenir

1. **Cache utilisateur** - Éviter de relire en base à chaque mise à jour
2. **Retry logic** - Recommencer 1-2 fois en cas d'erreur RLS
3. **Offline mode** - Stocker localement et synchroniser plus tard
4. **Type-safe query builder** - Utiliser une librairie comme Drizzle
5. **Transactions** - Grouper plusieurs opérations


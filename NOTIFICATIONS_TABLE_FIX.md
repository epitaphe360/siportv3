# Correction de la Table Notifications - Guide d'Application

## 🔍 Problème Identifié

L'erreur `400 Bad Request` sur `/rest/v1/notifications` était causée par un décalage entre :
- **Ancien schéma** : colonnes `message`, `type`, `read`
- **Nouveau schéma** : colonnes `title`, `message`, `type`, `category`, `is_read`, `action_url`, `metadata`, `expires_at`

## 🛠️ Solution Implémentée

### 1. Code Application (✅ Déjà Corrigé)

**Fichier** : `src/services/supabaseService.ts`

La fonction `createNotification()` utilise maintenant la nouvelle structure :
```typescript
await supabase.from('notifications').insert([{
  user_id: userId,
  title: 'Nouvelle connexion',     // ✅ Ajouté
  message: message,
  type: 'info',                     // ✅ Corrigé (enum: info, success, warning, error)
  category: type,                   // ✅ Ajouté (connection, event, message, system)
  is_read: false                    // ✅ Corrigé (ancien: read)
}]);
```

### 2. Migration Base de Données (📋 À Appliquer)

**Fichier** : `supabase/migrations/20260102000001_fix_notifications_table.sql`

Cette migration :
- ✅ Renomme `read` → `is_read` si nécessaire
- ✅ Ajoute les colonnes manquantes : `title`, `category`, `action_url`, `metadata`, `expires_at`
- ✅ Configure les RLS policies correctement
- ✅ Ajoute une policy pour permettre l'insertion par les utilisateurs authentifiés
- ✅ Crée des index pour optimiser les performances

## 🚀 Application de la Correction

### Méthode 1 : Via Script Node.js (Recommandé)

```bash
# Depuis le répertoire du projet
node scripts/fix-notifications-table.mjs
```

Le script :
- Lit la migration SQL
- L'applique à Supabase
- Vérifie la structure finale
- Liste les colonnes et policies créées

### Méthode 2 : Via Supabase Dashboard

1. Aller sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionner le projet SIPORT
3. Aller dans **SQL Editor**
4. Créer une nouvelle requête
5. Copier-coller le contenu de `supabase/migrations/20260102000001_fix_notifications_table.sql`
6. Exécuter (▶️)
7. Vérifier qu'il n'y a pas d'erreurs

### Méthode 3 : Via Supabase CLI

```bash
# Si Supabase CLI est installé et configuré
supabase db push
```

## ✅ Vérification Post-Migration

### 1. Vérifier la Structure

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'notifications'
ORDER BY ordinal_position;
```

**Résultat attendu** :
```
id              | uuid          | NO
user_id         | uuid          | YES
title           | text          | NO
message         | text          | NO
type            | text          | YES
category        | text          | YES
is_read         | boolean       | YES
action_url      | text          | YES
metadata        | jsonb         | YES
created_at      | timestamptz   | YES
expires_at      | timestamptz   | YES
```

### 2. Vérifier les Policies RLS

```sql
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'notifications';
```

**Résultat attendu** :
```
Users can view own notifications              | SELECT
Users can update own notifications            | UPDATE
Authenticated users can insert notifications  | INSERT
```

### 3. Tester l'Insertion

```sql
-- Test d'insertion (remplacer <user_id> par un vrai UUID)
INSERT INTO notifications (user_id, title, message, type, category, is_read)
VALUES (
  '<user_id>',
  'Test Notification',
  'Ceci est un test',
  'info',
  'system',
  false
);
```

Si l'insertion réussit → ✅ Migration OK !

### 4. Tester dans l'Application

1. Se connecter sur l'application
2. Effectuer une action qui crée une notification (ex: demande de connexion)
3. Vérifier dans la console :
   - ✅ Pas d'erreur 400
   - ✅ Pas d'erreur dans les logs

## 🔧 Dépannage

### Erreur : "column 'read' does not exist"
➡️ La table utilise l'ancien schéma, la migration le corrigera automatiquement

### Erreur : "permission denied for table notifications"
➡️ Vérifier que la policy "Authenticated users can insert notifications" existe

### Erreur : "violates not-null constraint"
➡️ Vérifier que `title` et `message` sont bien fournis dans le code

### Test de Diagnostic

```javascript
// Depuis la console du navigateur (après connexion)
const { data, error } = await supabase.from('notifications').insert({
  user_id: '<votre-user-id>',
  title: 'Test',
  message: 'Test message',
  type: 'info',
  category: 'system',
  is_read: false
});

console.log('Résultat:', { data, error });
```

## 📊 Impact de la Correction

### Avant ❌
```
POST /rest/v1/notifications
Status: 400 Bad Request
Erreur: Invalid body, use \\"insert\\" body
```

### Après ✅
```
POST /rest/v1/notifications
Status: 201 Created
{
  "id": "uuid...",
  "user_id": "uuid...",
  "title": "Nouvelle connexion",
  "message": "...",
  "type": "info",
  "category": "connection",
  "is_read": false,
  "created_at": "2026-01-02T..."
}
```

## 📝 Notes Importantes

1. **Sauvegarde** : Recommandé de faire un backup avant d'appliquer la migration
2. **Downtime** : La migration peut prendre quelques secondes si la table contient beaucoup de données
3. **Rollback** : En cas de problème, restaurer depuis le backup
4. **Tests** : Tester en environnement de dev avant la production

## 🎯 Checklist de Déploiement

- [ ] Backup de la base de données
- [ ] Application de la migration via méthode choisie
- [ ] Vérification de la structure (11 colonnes attendues)
- [ ] Vérification des policies RLS (3 policies attendues)
- [ ] Test d'insertion manuel
- [ ] Test dans l'application
- [ ] Surveillance des logs pendant 24h
- [ ] Documentation mise à jour

---

**Date de création** : 2 janvier 2026  
**Auteur** : SIPORT Development Team  
**Fichiers modifiés** :
- `src/services/supabaseService.ts`
- `supabase/migrations/20260102000001_fix_notifications_table.sql`
- `scripts/fix-notifications-table.mjs`

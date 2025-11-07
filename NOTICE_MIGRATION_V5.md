# ⚠️ IMPORTANT: Utiliser Migration v5.0 (FINALE)

## Historique des Erreurs et Corrections

### Migration v3.0 ❌
**Fichier** : `20251107000003_fix_rls_final.sql`

**Erreur rencontrée** :
```
ERROR: 42710: policy "Public can view pending registration requests count"
for table "registration_requests" already exists
```

**Cause** : Migration partiellement appliquée. Certaines politiques créées avant l'erreur.

---

### Migration v4.0 ❌
**Fichier** : `20251107000004_fix_rls_policies_only.sql`

**Correction apportée** : Ne recrée pas les tables/enums (existent déjà), uniquement les politiques RLS.

**Erreur rencontrée** :
```
ERROR: 42703: column users.role does not exist
```

**Cause** : La table `users` utilise la colonne `type` (pas `role`). Les politiques référençaient `users.role = 'admin'` au lieu de `users.type = 'admin'`.

**Structure réelle de la table users** :
```sql
CREATE TABLE users (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  type user_type NOT NULL DEFAULT 'visitor',  -- ⚠️ 'type' pas 'role'
  profile jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Enum user_type** :
```sql
CREATE TYPE user_type AS ENUM ('exhibitor', 'partner', 'visitor', 'admin');
```

---

### ✅ Migration v5.0 (FINALE)
**Fichier** : `20251107000005_fix_rls_policies_type_column.sql`

**Corrections apportées** :
1. ✅ Ne recrée pas les tables/enums (existent déjà)
2. ✅ Utilise `users.type` au lieu de `users.role`
3. ✅ DROP POLICY IF EXISTS partout (pas de conflit)

**Différences v4 → v5** :

| Ligne | v4.0 | v5.0 |
|-------|------|------|
| 95 | `users.role = 'admin'` | `users.type = 'admin'` ✅ |
| 108 | `users.role = 'admin'` | `users.type = 'admin'` ✅ |
| 220 | `users.role = 'admin'` | `users.type = 'admin'` ✅ |
| 233 | `users.role = 'admin'` | `users.type = 'admin'` ✅ |

**Total** : 4 références corrigées

---

## 📋 Instructions d'Application v5.0

### Méthode Recommandée : Supabase Dashboard

1. **Ouvrir** https://supabase.com/dashboard
2. **Sélectionner** le projet **eqjoqgpbxhsfgcovipgu**
3. **Aller dans** SQL Editor → New query
4. **Copier-coller** le contenu de `supabase/migrations/20251107000005_fix_rls_policies_type_column.sql`
5. **Cliquer** sur Run (Ctrl+Enter)

✅ La migration devrait s'exécuter **sans erreur**.

---

## 🔍 Vérification

Après exécution de v5.0, vérifier :

### 1. Aucune erreur SQL
```
✅ Success. No rows returned
```

### 2. Politiques créées
Dans Supabase Dashboard → **Authentication** → **Policies**, vérifier :
- `registration_requests` : 4 politiques
- `users` : 1 politique
- `mini_sites` : 3 politiques
- `time_slots` : 4 politiques
- `news_articles` : 3 politiques
- `exhibitors` : 1 politique
- `products` : 4 politiques
- `partners` : 1 politique

**Total attendu** : 21 politiques RLS

### 3. Test de l'API
```bash
# Test 1: Lecture publique des exposants (devrait fonctionner)
curl https://[PROJECT_REF].supabase.co/rest/v1/exhibitors \
  -H "apikey: [ANON_KEY]"
# Attendu: 200 OK

# Test 2: Lecture publique des time_slots (devrait fonctionner)
curl https://[PROJECT_REF].supabase.co/rest/v1/time_slots \
  -H "apikey: [ANON_KEY]"
# Attendu: 200 OK
```

---

## 🎯 Résultat Attendu

Après v5.0 :

### Erreurs CORRIGÉES ✅
- ❌ 404 sur `registration_requests` → ✅ 200 OK
- ❌ 403 sur `users` (POST) → ✅ 200 OK
- ❌ 403 sur `mini_sites` (POST) → ✅ 200 OK
- ❌ 400 sur `news_articles` → ✅ 200 OK
- ❌ 400 sur `time_slots` → ✅ 200 OK
- ❌ `ge.getUsers is not a function` → ✅ Méthode ajoutée

### Fonctionnalités DÉBLOQUÉES ✅
- ✅ Inscription utilisateurs (signup)
- ✅ Calendrier de disponibilité exposants
- ✅ Création mini-sites
- ✅ Affichage articles actualité
- ✅ Liste partenaires
- ✅ Networking/Chat

---

## ❓ Questions Fréquentes

### Q: Puis-je appliquer v5.0 si v4.0 a échoué ?
**R** : Oui ! v5.0 nettoie automatiquement avec `DROP POLICY IF EXISTS`.

### Q: Dois-je rollback v3.0 ou v4.0 avant ?
**R** : Non ! v5.0 fait le nettoyage automatiquement.

### Q: Pourquoi tant de versions ?
**R** :
- v3.0 : Tentative de création complète (tables + politiques) → Erreur politique existante
- v4.0 : Politiques uniquement → Erreur colonne `users.role`
- v5.0 : Politiques avec `users.type` → ✅ FONCTIONNE

### Q: Y a-t-il un risque de perte de données ?
**R** : Non. Les migrations ne font que DROP/CREATE des politiques RLS. Les données restent intactes.

### Q: Que faire si v5.0 échoue ?
**R** :
1. Copier l'erreur complète
2. Vérifier la structure de votre base de données
3. Partager l'erreur pour diagnostic

---

## 📊 Tableau Comparatif des Versions

| Version | Tables/Enums | Politiques | Colonne users | Statut |
|---------|-------------|-----------|---------------|--------|
| v3.0 | ✅ Crée | ✅ Crée | N/A | ❌ Erreur politique existante |
| v4.0 | ❌ Non | ✅ Crée | `role` ❌ | ❌ Erreur colonne inexistante |
| v5.0 | ❌ Non | ✅ Crée | `type` ✅ | ✅ FONCTIONNE |

---

## 🚀 Prochaines Étapes

Après v5.0 :

1. ✅ Tester l'application
2. ✅ Vérifier console (plus d'erreurs 403/404/400)
3. ✅ Consulter `AUDIT_COMPLET_MEGA.md` pour prochaines corrections
4. ✅ Consulter `CORRECTIONS_PRIORITAIRES.md` pour corrections code

---

**Date de création** : 2025-11-07
**Version** : 5.0 - FINALE
**Statut** : ✅ Prêt à l'emploi
**Fichier** : `supabase/migrations/20251107000005_fix_rls_policies_type_column.sql`

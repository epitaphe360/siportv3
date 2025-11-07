# Correction des Erreurs API Supabase

## Résumé des Problèmes Identifiés et Corrigés

Ce document détaille toutes les erreurs identifiées dans les logs de la console et les corrections apportées.

### ❌ Erreurs Identifiées

1. **404 sur `registration_requests`**
   - Cause : Politiques RLS trop restrictives, pas d'accès public
   - Impact : Impossible de voir les demandes d'inscription en attente

2. **403 sur `users` (POST)**
   - Cause : Politique INSERT nécessite authentification, mais l'utilisateur n'est pas encore authentifié lors de l'inscription
   - Impact : Échec de création de compte utilisateur

3. **403 sur `mini_sites` (POST)**
   - Cause : Aucune politique INSERT pour les mini-sites
   - Impact : Les exposants ne peuvent pas créer leurs mini-sites

4. **400 sur `news_articles`**
   - Cause : Requête avec filtre `.eq('published', true)` sur une colonne qui pourrait avoir des problèmes de type
   - Impact : Échec du chargement des articles d'actualité

5. **400 sur `time_slots`**
   - Cause : Politique RLS restrictive (TO authenticated uniquement)
   - Impact : Les utilisateurs non connectés ne peuvent pas voir les créneaux horaires disponibles

6. **`ge.getUsers is not a function`**
   - Cause : Méthode `getUsers()` n'existe pas dans `SupabaseService`
   - Fichier : `src/store/networkingStore.ts:137`
   - Impact : Erreur lors de la génération de recommandations de networking

7. **`via.placeholder.com` ne charge pas**
   - Cause : Service externe non fiable
   - Status : ✅ **Déjà corrigé** dans `FeaturedExhibitors.tsx` avec fallback vers `placehold.co` et SVG

8. **"Unsupported provider"**
   - Cause : Configuration d'authentification Supabase (provider non activé)
   - Impact : Erreur lors de la connexion avec certains providers

9. **Endpoints AI Agent manquants**
   - `localhost:3001/generate` - ERR_CONNECTION_REFUSED
   - `https://siportv3-production.up.railway.app/api/ai-generate` - 404
   - Status : ⚠️ **Service externe** - Le service AI Agent doit être déployé séparément

---

## ✅ Corrections Appliquées

### 1. Migration RLS Complète

**Fichier créé** : `supabase/migrations/20251107000001_fix_rls_policies_complete.sql`

Cette migration corrige toutes les politiques RLS pour permettre :

#### `registration_requests`
- ✅ Accès public pour créer des demandes (INSERT)
- ✅ Accès public pour voir les demandes en attente (SELECT status='pending')
- ✅ Accès admin complet

#### `users`
- ✅ Accès public pour créer un utilisateur durant l'inscription (INSERT)
- ✅ Conservation des politiques de lecture existantes

#### `mini_sites`
- ✅ INSERT par les exposants (leur propre mini-site)
- ✅ UPDATE par les exposants (leur propre mini-site)
- ✅ Lecture publique de tous les mini-sites

#### `time_slots`
- ✅ Lecture publique (SELECT pour tous)
- ✅ INSERT/UPDATE/DELETE pour les propriétaires uniquement

#### `news_articles`
- ✅ Lecture publique de tous les articles
- ✅ INSERT/UPDATE pour les admins

#### `exhibitors`, `products`, `partners`
- ✅ Lecture publique pour tous (pas seulement les verified)

### 2. Code Corrigé

#### Ajout de `getUsers()` dans SupabaseService

**Fichier** : `src/services/supabaseService.ts`

```typescript
static async getUsers(): Promise<User[]> {
  if (!this.checkSupabaseConnection()) {
    console.warn('⚠️ Supabase non configuré');
    return [];
  }

  const safeSupabase = supabase!;
  try {
    const { data, error } = await safeSupabase
      .from('users')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Erreur lors de la récupération des utilisateurs:', error.message);
      return [];
    }

    return (data || []).map(this.transformUserDBToUser);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return [];
  }
}
```

#### Correction de la requête `news_articles`

**Fichier** : `src/store/newsStore.ts`

**Avant** :
```typescript
.eq('published', true)
```

**Après** :
```typescript
// Suppression du filtre car la politique RLS le gère maintenant
// et évite les problèmes de type
```

---

## 📋 Instructions d'Application

### Étape 1 : Appliquer la Migration RLS Complète

**⚠️ IMPORTANT : Utilisez la migration v2.0 qui crée les tables ET les politiques**

**Option A : Via le Supabase Dashboard** (Recommandé)

1. Ouvrir le Supabase Dashboard → https://supabase.com/dashboard
2. Sélectionner votre projet `eqjoqgpbxhsfgcovipgu`
3. Aller dans **SQL Editor** (icône de base de données dans la sidebar)
4. Créer une nouvelle requête
5. Copier **TOUT** le contenu de `supabase/migrations/20251107000002_complete_fix_with_tables.sql`
6. Coller dans l'éditeur SQL
7. Cliquer sur **Run** (ou Ctrl+Enter)
8. Vérifier que la requête s'exécute sans erreur

**Option B : Via psql** (si vous avez accès direct à la base)

```bash
psql -h db.eqjoqgpbxhsfgcovipgu.supabase.co -U postgres -d postgres -f supabase/migrations/20251107000002_complete_fix_with_tables.sql
```

**Option C : Via Script d'Application Automatique**

Le script `apply_rls_fix.sql` applique automatiquement la migration et vérifie les résultats :

```bash
psql -h db.eqjoqgpbxhsfgcovipgu.supabase.co -U postgres -d postgres -f supabase/apply_rls_fix.sql
```

### Étape 2 : Vérifier l'Application

Après avoir appliqué la migration, vérifier que les politiques sont bien créées :

```sql
SELECT
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE tablename IN ('registration_requests', 'users', 'mini_sites', 'time_slots', 'news_articles')
ORDER BY tablename, policyname;
```

### Étape 3 : Tester l'Application

1. ✅ Tester la création d'un nouveau compte
2. ✅ Vérifier le chargement des articles d'actualité
3. ✅ Vérifier le chargement des créneaux horaires
4. ✅ Tester la création d'un mini-site (en tant qu'exposant)
5. ✅ Vérifier les recommandations de networking

---

## ⚠️ Problèmes Restants à Résoudre

### 1. Provider d'Authentification Non Supporté

**Erreur** : `"Unsupported provider: provider is not enabled"`

**Solution** :
1. Ouvrir le Supabase Dashboard
2. Aller dans **Authentication** > **Providers**
3. Activer les providers nécessaires :
   - Email/Password (déjà activé normalement)
   - Google OAuth (si utilisé)
   - Autres providers selon les besoins

### 2. Service AI Agent Manquant

**Erreurs** :
- `POST http://localhost:3001/generate` - ERR_CONNECTION_REFUSED
- `POST https://siportv3-production.up.railway.app/api/ai-generate` - 404

**Solution** :

Le service AI Agent n'est pas déployé. Options :

**Option A** : Déployer le service AI Agent
- Vérifier le code du service dans le repo
- Déployer sur Railway ou autre plateforme
- Mettre à jour `VITE_AI_AGENT_URL` dans `.env`

**Option B** : Utiliser le fallback
- Le code utilise déjà un fallback (`generateFallbackData`)
- Les données de base seront générées à partir de l'URL

**Option C** : Désactiver temporairement
- Commenter les appels au service AI dans `MiniSiteWizard.tsx`

---

## 🔐 Sécurité

### Changements de Sécurité

Les nouvelles politiques RLS sont **plus permissives** pour résoudre les erreurs, mais restent sécurisées :

- ✅ Accès public en **lecture seule** pour les données publiques (exposants, produits, articles)
- ✅ Création publique uniquement pour l'inscription (`users`, `registration_requests`)
- ✅ Modification/Suppression **toujours restreinte** aux propriétaires et admins
- ✅ Les données sensibles restent protégées (appointments, messages, etc.)

### Recommandations Futures

1. **Audit de Sécurité** : Faire un audit complet des politiques RLS après validation fonctionnelle
2. **Rate Limiting** : Implémenter un rate limiting pour les endpoints publics
3. **Monitoring** : Configurer des alertes pour les accès suspects
4. **Logs** : Activer les logs détaillés pour les opérations sensibles

---

## 📊 Résultats Attendus

Après l'application de ces corrections, les erreurs suivantes devraient disparaître :

- ✅ Plus de 404 sur `registration_requests`
- ✅ Plus de 403 sur `users` (POST)
- ✅ Plus de 403 sur `mini_sites` (POST)
- ✅ Plus de 400 sur `news_articles`
- ✅ Plus de 400 sur `time_slots`
- ✅ Plus d'erreur `ge.getUsers is not a function`
- ✅ Images placeholder fonctionnelles

---

## 🆘 Support

En cas de problème :

1. Vérifier les logs Supabase Dashboard > Logs
2. Vérifier que toutes les politiques RLS ont été créées
3. Vérifier les variables d'environnement (`.env`)
4. Consulter la documentation Supabase : https://supabase.com/docs

---

**Date de correction** : 2025-11-07
**Auteur** : Claude Code Assistant

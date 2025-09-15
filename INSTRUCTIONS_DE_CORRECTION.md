# Instructions pour corriger les problèmes d'affichage des mini-sites et actualités

## 1. Problème: Actualités et mini-sites non visibles

**Cause identifiée:** Les politiques de sécurité RLS (Row Level Security) de Supabase bloquent l'accès public aux données même quand elles sont marquées comme publiées.

## 2. Solutions

### A. Exécuter les corrections RLS

Pour corriger les politiques de sécurité, vous devez exécuter un script SQL dans l'éditeur SQL de Supabase:

1. Connectez-vous à votre tableau de bord Supabase
2. Allez dans la section "SQL Editor"
3. Créez une nouvelle requête
4. Copiez et collez le contenu du fichier `FIX_RLS_POLICIES_IN_SUPABASE.sql`
5. Exécutez la requête

Ce script va:
- Supprimer les anciennes politiques RLS
- Créer de nouvelles politiques permettant l'accès public aux données publiées
- Réactiver RLS sur les tables

### B. Ajouter les sections manquantes aux mini-sites

Pour ajouter les sections "Certifications & Accréditations", "Galerie & Réalisations" et "Témoignages Clients" aux mini-sites:

1. Connectez-vous à votre tableau de bord Supabase
2. Allez dans la section "SQL Editor"
3. Créez une nouvelle requête
4. Copiez et collez le contenu du fichier `EXECUTE_IN_SUPABASE_SQL_EDITOR.sql`
5. Exécutez la requête

Ce script va:
- Créer une procédure stockée pour ajouter les sections manquantes
- Exécuter cette procédure pour mettre à jour tous les mini-sites
- Afficher les résultats pour vérification

## 3. Vérification des résultats

Après avoir exécuté ces scripts, vérifiez que:

1. Les actualités s'affichent correctement sur la page d'accueil
2. Les mini-sites affichent désormais les sections supplémentaires:
   - Certifications & Accréditations
   - Galerie & Réalisations
   - Témoignages Clients

## 4. En cas de problème persistant

Si les problèmes persistent après avoir exécuté ces scripts:

1. Vérifiez que les données existent bien dans la base de données:
   ```sql
   SELECT * FROM news_articles WHERE published = true;
   SELECT * FROM mini_sites WHERE published = true;
   ```

2. Assurez-vous que votre application est configurée pour utiliser l'accès anonyme de Supabase (anon key) et non la clé de service.

3. Redémarrez votre application pour que les changements prennent effet.

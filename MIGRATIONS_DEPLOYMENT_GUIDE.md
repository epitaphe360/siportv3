# Guide d'Application des Migrations - SIPORT v3

## 🚀 Migrations en Attente

### 1. Restriction Niveau de Sponsoring
**Fichier** : `supabase/migrations/20260101000001_restrict_partnership_level_update.sql`  
**Objectif** : Empêcher les partenaires de modifier leur propre niveau de sponsoring

### 2. Workflow d'Approbation des Médias Partenaires
**Fichier** : `supabase/migrations/20260101000002_partner_media_approval_workflow.sql`  
**Objectif** : Système complet de validation admin pour les médias soumis par les partenaires

## 📋 Méthode 1 : Via Supabase Dashboard (Recommandée)

### Étape 1 : Connexion
1. Aller sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Se connecter avec les identifiants SIPORT
3. Sélectionner le projet SIPORT Production

### Étape 2 : Accéder au SQL Editor
1. Dans le menu latéral, cliquer sur "SQL Editor"
2. Cliquer sur "New query"

### Étape 3 : Appliquer la Migration 1
1. Ouvrir le fichier `supabase/migrations/20260101000001_restrict_partnership_level_update.sql`
2. Copier tout le contenu
3. Coller dans l'éditeur SQL
4. Cliquer sur "Run" (▶️)
5. Vérifier qu'il n'y a pas d'erreurs (✅)

### Étape 4 : Appliquer la Migration 2
1. Ouvrir le fichier `supabase/migrations/20260101000002_partner_media_approval_workflow.sql`
2. Copier tout le contenu
3. Coller dans un nouvel onglet de l'éditeur SQL
4. Cliquer sur "Run" (▶️)
5. Vérifier qu'il n'y a pas d'erreurs (✅)

### Étape 5 : Vérification
```sql
-- Vérifier les policies créées
SELECT * FROM pg_policies WHERE tablename IN ('partner_profiles', 'partners', 'media_contents');

-- Vérifier les triggers
SELECT tgname, tgrelid::regclass 
FROM pg_trigger 
WHERE tgname IN ('prevent_partner_level_modification', 'auto_approve_admin_media');

-- Vérifier les fonctions
SELECT proname FROM pg_proc 
WHERE proname IN ('approve_partner_media', 'reject_partner_media');

-- Vérifier la vue
SELECT viewname FROM pg_views WHERE viewname = 'pending_partner_media';
```

## 📋 Méthode 2 : Via Supabase CLI

### Prérequis
```bash
# Installer Supabase CLI si pas déjà fait
npm install -g supabase

# Se connecter
supabase login
```

### Application des Migrations
```bash
# Aller dans le répertoire du projet
cd c:\Users\samye\OneDrive\Desktop\siportversionfinal\siportv3

# Lier le projet local au projet Supabase
supabase link --project-ref <votre-project-ref>

# Pousser les migrations
supabase db push

# Vérifier le statut
supabase db diff
```

## 🧪 Tests Post-Migration

### Test 1 : Restriction Niveau de Sponsoring

#### Comme Partenaire
1. Se connecter avec un compte partenaire
2. Aller dans "Mon Profil" → "Modifier"
3. Vérifier que le champ "Niveau de sponsoring" est désactivé (grisé)
4. Tenter de modifier via la console (doit échouer) :
```sql
UPDATE partner_profiles 
SET partnership_level = 'platinum' 
WHERE user_id = '<partner-user-id>';
-- Devrait retourner une erreur
```

#### Comme Admin
1. Se connecter avec un compte admin
2. Aller dans la gestion des partenaires
3. Modifier le niveau de sponsoring d'un partenaire (doit réussir)

### Test 2 : Approbation des Médias

#### Comme Partenaire
1. Se connecter avec un compte partenaire
2. Aller dans "Médias" → "Soumettre un média"
3. Remplir le formulaire et soumettre
4. Vérifier la notification : "Média soumis avec succès ! Il sera visible après validation"
5. Aller dans "Ma Bibliothèque"
6. Vérifier que le média apparaît avec le badge "En attente de validation"

#### Comme Admin
1. Se connecter avec un compte admin
2. Aller dans "Valider Médias Partenaires"
3. Vérifier que le média du partenaire apparaît
4. Cliquer sur "Prévisualiser"
5. Cliquer sur "Approuver"
6. Vérifier que le média disparaît de la liste

#### Vérification Partenaire
1. Retourner sur le compte partenaire
2. Aller dans "Ma Bibliothèque"
3. Vérifier que le média a maintenant le badge "Approuvé" (vert)

### Test 3 : Rejet avec Raison
1. Soumettre un nouveau média comme partenaire
2. Comme admin, aller dans "Valider Médias Partenaires"
3. Cliquer sur "Prévisualiser"
4. Remplir le champ "Raison du rejet" : "Contenu non conforme aux guidelines"
5. Cliquer sur "Rejeter"
6. Comme partenaire, vérifier que le média a le badge "Rejeté" (rouge)
7. Vérifier que la raison du rejet s'affiche

### Test 4 : Auto-Approbation Admin
1. Se connecter comme admin
2. Créer un nouveau média via "Gérer Contenus Médias" → "Créer"
3. Vérifier dans la base de données :
```sql
SELECT status, approved_at, created_by_type 
FROM media_contents 
WHERE id = '<nouveau-media-id>';
-- Devrait montrer status='approved' et approved_at renseigné
```

## 🔍 Dépannage

### Erreur : "relation does not exist"
**Cause** : La migration n'a pas été appliquée correctement  
**Solution** : Réexécuter la migration complète

### Erreur : "permission denied"
**Cause** : RLS policy bloque l'accès  
**Solution** : Vérifier que l'utilisateur a le bon rôle dans la table users

### Les médias approuvés ne s'affichent pas
**Cause** : Le statut n'est pas 'approved' ou 'published'  
**Solution** : Vérifier le statut dans la base :
```sql
SELECT id, title, status FROM media_contents WHERE created_by_type = 'partner';
```

### Le trigger ne fonctionne pas
**Vérifier** :
```sql
SELECT * FROM pg_trigger WHERE tgname = 'auto_approve_admin_media';
```
**Recréer si nécessaire** :
```sql
DROP TRIGGER IF EXISTS auto_approve_admin_media ON media_contents;
CREATE TRIGGER auto_approve_admin_media 
BEFORE INSERT ON media_contents
FOR EACH ROW EXECUTE FUNCTION auto_approve_admin_media();
```

## 📊 Requêtes Utiles

### Voir tous les médias en attente
```sql
SELECT * FROM pending_partner_media;
```

### Statistiques des médias par statut
```sql
SELECT 
  status,
  COUNT(*) as count
FROM media_contents
WHERE created_by_type = 'partner'
GROUP BY status;
```

### Médias d'un partenaire spécifique
```sql
SELECT 
  mc.title,
  mc.status,
  mc.created_at,
  mc.approved_at,
  mc.rejection_reason
FROM media_contents mc
WHERE mc.created_by_id = '<partner-user-id>'
ORDER BY mc.created_at DESC;
```

### Approuver manuellement un média
```sql
SELECT approve_partner_media('<media-id>', '<admin-user-id>');
```

### Rejeter manuellement un média
```sql
SELECT reject_partner_media('<media-id>', '<admin-user-id>', 'Raison du rejet');
```

## ✅ Checklist de Déploiement

### Avant le Déploiement
- [ ] Sauvegarder la base de données actuelle
- [ ] Tester les migrations sur un environnement de staging
- [ ] Vérifier que les comptes de test existent (admin et partenaire)
- [ ] S'assurer que personne n'utilise activement la plateforme

### Pendant le Déploiement
- [ ] Appliquer la migration 1 (Restriction niveau sponsoring)
- [ ] Vérifier qu'il n'y a pas d'erreurs
- [ ] Appliquer la migration 2 (Workflow approbation médias)
- [ ] Vérifier qu'il n'y a pas d'erreurs
- [ ] Exécuter les requêtes de vérification

### Après le Déploiement
- [ ] Tester la restriction du niveau de sponsoring (partenaire)
- [ ] Tester la soumission d'un média (partenaire)
- [ ] Tester l'approbation d'un média (admin)
- [ ] Tester le rejet d'un média avec raison (admin)
- [ ] Vérifier que les médias approuvés sont visibles publiquement
- [ ] Vérifier que les médias en attente ne sont pas visibles publiquement
- [ ] Surveiller les logs pour détecter d'éventuelles erreurs

### Communication
- [ ] Informer les partenaires du nouveau processus de validation
- [ ] Envoyer un guide d'utilisation aux partenaires
- [ ] Former l'équipe admin au processus d'approbation
- [ ] Mettre à jour la documentation utilisateur

## 📞 Support

En cas de problème lors de l'application des migrations :

1. **Erreur SQL** : Copier le message d'erreur complet et consulter les logs Supabase
2. **Conflit de nommage** : Vérifier si les policies/triggers existent déjà avec `\dp` et `\d+`
3. **Rollback** : Si nécessaire, les migrations peuvent être annulées en supprimant manuellement les objets créés

---

**Date de création** : 2026-01-01  
**Dernière mise à jour** : 2026-01-01  
**Version** : 1.0  
**Auteur** : SIPORT Development Team

# 🚀 GUIDE D'INSTALLATION - Mini-Site Builder & Networking Matchmaking

## 📋 Prérequis

- Compte Supabase actif
- Projet Supabase créé
- Clés API Supabase (`SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY`)
- Node.js installé (v18+)

---

## 🔧 ÉTAPE 1 : Configuration Supabase

### Option A : Via l'interface Supabase (Recommandé)

1. **Connectez-vous à Supabase** : https://app.supabase.com
2. **Sélectionnez votre projet**
3. **Accédez à l'éditeur SQL** : Menu latéral > SQL Editor
4. **Exécutez le script SQL** :
   - Cliquez sur "New Query"
   - Copiez le contenu de `supabase/setup-mini-site-networking.sql`
   - Collez dans l'éditeur
   - Cliquez sur "Run"
   - ✅ Attendez le message de confirmation

### Option B : Via la CLI Supabase

```bash
# Installer la CLI Supabase (si pas déjà fait)
npm install -g supabase

# Se connecter à Supabase
supabase login

# Exécuter le script
supabase db push --file supabase/setup-mini-site-networking.sql
```

### Option C : Via psql (Utilisateurs avancés)

```bash
# Connexion directe à PostgreSQL
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"

# Exécuter le fichier
\i supabase/setup-mini-site-networking.sql
```

---

## 📦 ÉTAPE 2 : Vérification de l'installation

### Vérifier les tables créées

Dans l'éditeur SQL Supabase, exécutez :

```sql
-- Lister toutes les tables créées
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'mini_sites',
  'site_templates',
  'site_images',
  'user_profiles',
  'networking_interactions',
  'match_scores',
  'speed_networking_sessions',
  'networking_rooms'
)
ORDER BY table_name;
```

**Résultat attendu** : 8 lignes retournées

### Vérifier le bucket Storage

1. Menu latéral > **Storage**
2. Vous devriez voir le bucket **`site-images`**
3. Cliquez dessus pour confirmer qu'il est public

### Vérifier les RLS Policies

```sql
-- Compter les policies actives
SELECT schemaname, tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
  'mini_sites',
  'site_templates',
  'site_images',
  'user_profiles',
  'networking_interactions',
  'match_scores',
  'speed_networking_sessions',
  'networking_rooms'
)
GROUP BY schemaname, tablename
ORDER BY tablename;
```

**Résultat attendu** : Chaque table doit avoir au moins 1 policy

---

## 🌱 ÉTAPE 3 : Seeder les templates

### Via Node.js (Méthode recommandée)

```bash
# Installer les dépendances si nécessaire
npm install

# Exécuter le script de seeding
npm run seed:templates
```

### OU via le script PowerShell

```powershell
# Depuis la racine du projet
.\setup-database.ps1
```

### OU manuellement avec tsx

```bash
# Avec tsx (plus rapide)
npx tsx scripts/seed-site-templates.ts

# OU avec ts-node
npx ts-node scripts/seed-site-templates.ts
```

### Vérification du seeding

Dans Supabase SQL Editor :

```sql
-- Vérifier les templates insérés
SELECT id, name, category, premium, popularity 
FROM site_templates 
ORDER BY popularity DESC;
```

**Résultat attendu** : 10 templates

---

## 🔐 ÉTAPE 4 : Configuration des variables d'environnement

### Fichier `.env` à la racine du projet

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_anon_key_ici
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key_ici
```

### Où trouver ces clés ?

1. **Dans Supabase Dashboard** :
   - Menu latéral > **Settings** > **API**
   - `URL` → `VITE_SUPABASE_URL`
   - `anon public` → `VITE_SUPABASE_ANON_KEY`
   - `service_role` (⚠️ Secret) → `SUPABASE_SERVICE_ROLE_KEY`

---

## ✅ ÉTAPE 5 : Test de l'installation

### Test 1 : Build de l'application

```bash
npm run build
```

**Résultat attendu** : Build réussi sans erreurs

### Test 2 : Lancer le serveur de développement

```bash
npm run dev
```

**Résultat attendu** : Serveur démarre sur `http://localhost:9323`

### Test 3 : Créer un mini-site (dans l'app)

1. Connectez-vous en tant qu'exposant
2. Accédez à **"Créer un Mini-Site"**
3. Sélectionnez un template
4. Vérifiez que l'éditeur se charge correctement
5. Essayez de drag & drop des sections
6. Testez l'upload d'une image

### Test 4 : Tester le matchmaking (dans l'app)

1. Connectez-vous avec un compte
2. Accédez à **"Networking"**
3. Vérifiez que le dashboard s'affiche
4. Testez les recommendations
5. Rejoignez une salle de networking

---

## 📊 ÉTAPE 6 : Monitoring et maintenance

### Requêtes utiles

```sql
-- Nombre de mini-sites créés
SELECT COUNT(*) as total_sites, 
       SUM(CASE WHEN published THEN 1 ELSE 0 END) as published_sites
FROM mini_sites;

-- Templates les plus populaires
SELECT name, category, popularity, premium
FROM site_templates
ORDER BY popularity DESC
LIMIT 5;

-- Statistiques de networking
SELECT type, COUNT(*) as count
FROM networking_interactions
GROUP BY type
ORDER BY count DESC;

-- Salles les plus actives
SELECT name, sector, array_length(participants, 1) as participant_count
FROM networking_rooms
WHERE status = 'open'
ORDER BY participant_count DESC;

-- Sessions de speed networking
SELECT name, status, max_participants, array_length(participants, 1) as registered
FROM speed_networking_sessions
ORDER BY start_time DESC;
```

### Maintenance régulière

```sql
-- Nettoyer les interactions anciennes (optionnel, > 6 mois)
DELETE FROM networking_interactions
WHERE timestamp < NOW() - INTERVAL '6 months';

-- Réinitialiser les salles fermées après événement
UPDATE networking_rooms
SET participants = '{}', status = 'open'
WHERE status = 'closed' 
AND created_at < NOW() - INTERVAL '7 days';
```

---

## 🐛 Dépannage

### Erreur : "relation does not exist"

**Solution** : Les tables n'ont pas été créées. Réexécutez le script SQL.

```sql
-- Vérifier l'existence des tables
\dt
```

### Erreur : "RLS policy violation"

**Solution** : Les policies RLS ne sont pas configurées correctement.

```sql
-- Vérifier les policies
SELECT * FROM pg_policies 
WHERE schemaname = 'public';
```

### Erreur : "bucket does not exist"

**Solution** : Le bucket Storage n'a pas été créé.

```sql
-- Créer manuellement le bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-images', 'site-images', true)
ON CONFLICT DO NOTHING;
```

### Le seeding des templates échoue

**Causes possibles** :
1. Variables d'environnement manquantes
2. Permissions insuffisantes
3. Table `site_templates` n'existe pas

**Solution** :

```bash
# Vérifier les variables
echo $env:VITE_SUPABASE_URL
echo $env:VITE_SUPABASE_ANON_KEY

# Réexécuter avec plus de logs
npx tsx scripts/seed-site-templates.ts
```

---

## 📚 Ressources additionnelles

### Documentation

- **Guide complet** : `MINI_SITE_NETWORKING_COMPLETE.md`
- **Récapitulatif** : `RECAP_FINAL_DEVELOPMENT.md`
- **API Supabase** : https://supabase.com/docs

### Support

- **Issues GitHub** : [Créer une issue](https://github.com/epitaphe360/siportv3/issues)
- **Documentation Supabase** : https://supabase.com/docs
- **Discord SIPORTS** : [Lien Discord]

---

## 🎉 Installation terminée !

Votre base de données est maintenant configurée avec :

- ✅ 8 tables SQL créées
- ✅ Bucket Storage `site-images` configuré
- ✅ RLS Policies activées pour la sécurité
- ✅ 10 templates professionnels seedés
- ✅ Indexes optimisés pour les performances
- ✅ Triggers pour updated_at automatique
- ✅ Vues SQL pour les statistiques

### Prochaines étapes

1. **Tester l'application** : `npm run dev`
2. **Créer votre premier mini-site**
3. **Configurer un événement**
4. **Inviter des utilisateurs**
5. **Profiter du networking IA !**

---

**Besoin d'aide ?** Consultez la documentation complète ou créez une issue sur GitHub.

🚀 **Happy coding!**

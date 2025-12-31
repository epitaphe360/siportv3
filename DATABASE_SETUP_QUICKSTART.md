# 🚀 Configuration Base de Données - GUIDE RAPIDE

## ⚡ Installation automatique (Recommandé)

### Windows PowerShell

```powershell
# Depuis la racine du projet
.\setup-database.ps1
```

Le script vous guidera à travers toutes les étapes :
1. ✅ Vérification des prérequis
2. 📦 Installation des dépendances
3. 🗄️ Configuration de la base de données
4. 🌱 Seeding des 10 templates
5. 🔍 Vérification finale

---

## 📋 Installation manuelle

### Étape 1 : Créer les tables Supabase

1. Ouvrez [app.supabase.com](https://app.supabase.com)
2. Sélectionnez votre projet
3. Menu > **SQL Editor** > **New Query**
4. Copiez le contenu de `supabase/setup-mini-site-networking.sql`
5. Collez et cliquez sur **Run**

### Étape 2 : Seeder les templates

```bash
npm run seed:templates
```

---

## 📦 Ce qui sera créé

### 🗄️ 8 Tables SQL

| Table | Description |
|-------|-------------|
| `mini_sites` | Mini-sites des exposants |
| `site_templates` | 10 templates préconçus |
| `site_images` | Bibliothèque d'images |
| `user_profiles` | Profils pour matchmaking |
| `networking_interactions` | Historique interactions |
| `match_scores` | Scores de compatibilité |
| `speed_networking_sessions` | Sessions de speed networking |
| `networking_rooms` | Salles thématiques |

### 📁 Storage Bucket

- **`site-images`** : Stockage public pour images (5MB max par fichier)

### 🔐 RLS Policies

- Sécurité Row Level Security configurée sur toutes les tables
- Permissions basées sur les rôles utilisateurs
- Isolation des données par utilisateur

### 🌱 Templates

10 templates professionnels :
- Corporate Pro
- E-commerce Modern
- Portfolio Créatif
- Event Summit
- SaaS Landing
- Startup Tech
- Creative Agency
- Product Launch
- Blog Magazine
- Minimal & Elegant

---

## ✅ Vérification

### Vérifier les tables

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%mini%' OR table_name LIKE '%networking%'
ORDER BY table_name;
```

### Vérifier les templates

```sql
SELECT id, name, category, premium 
FROM site_templates 
ORDER BY popularity DESC;
```

### Vérifier le bucket Storage

Menu Supabase > **Storage** > devrait afficher `site-images`

---

## 🐛 Dépannage

### Le seeding échoue ?

```bash
# Vérifiez vos variables d'environnement
cat .env

# Variables requises :
# VITE_SUPABASE_URL=https://xxx.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJxxx...
# SUPABASE_SERVICE_ROLE_KEY=eyJxxx... (pour seeding)
```

### Erreur "relation does not exist" ?

Les tables n'ont pas été créées. Réexécutez le script SQL dans Supabase.

### Erreur "bucket does not exist" ?

Le bucket Storage n'a pas été créé. Exécutez cette requête SQL :

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-images', 'site-images', true)
ON CONFLICT DO NOTHING;
```

---

## 📚 Documentation complète

Pour plus de détails, consultez :
- **Guide d'installation complet** : `INSTALLATION_GUIDE.md`
- **Documentation technique** : `MINI_SITE_NETWORKING_COMPLETE.md`
- **Récapitulatif du développement** : `RECAP_FINAL_DEVELOPMENT.md`

---

## 🎯 Prochaines étapes

Une fois la base de données configurée :

1. **Lancez l'application** :
   ```bash
   npm run dev
   ```

2. **Testez les fonctionnalités** :
   - Créez un mini-site
   - Uploadez des images
   - Testez le matchmaking
   - Rejoignez une salle de networking

3. **Déployez en production** :
   ```bash
   npm run build
   ```

---

**Besoin d'aide ?** Créez une issue sur GitHub ou consultez la documentation complète.

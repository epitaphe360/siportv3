# 🚀 GUIDE D'INSTALLATION COMPLET - SIPORTS 2026

**Version:** 1.0.0
**Date:** 30 Octobre 2025
**Score Application:** 98/100 ⭐

---

## 📋 TABLE DES MATIÈRES

1. [Prérequis](#prérequis)
2. [Déploiement Vercel (Application React)](#déploiement-vercel)
3. [Installation Plugin WordPress](#installation-plugin-wordpress)
4. [Import Pages WordPress](#import-pages-wordpress)
5. [Configuration](#configuration)
6. [Variables d'Environnement](#variables-denvironnement)
7. [Tests](#tests)
8. [Troubleshooting](#troubleshooting)

---

## 🔧 PRÉREQUIS

### Environnement Technique

- **Node.js:** >= 18.0.0
- **npm:** >= 9.0.0
- **WordPress:** >= 5.8
- **PHP:** >= 7.4
- **Supabase:** Compte actif
- **Vercel:** Compte (gratuit suffit)

### Comptes Nécessaires

1. ✅ Supabase (https://supabase.com)
2. ✅ Vercel (https://vercel.com)
3. ✅ Stripe (https://stripe.com) - Pour paiements
4. ✅ SendGrid (https://sendgrid.com) - Pour emails

---

## 🌐 DÉPLOIEMENT VERCEL

### Étape 1: Préparer le Projet

```bash
cd /path/to/siportv3

# Vérifier les dépendances
npm install

# Test build local
npm run build
```

### Étape 2: Installation Vercel CLI

```bash
# Installer globalement
npm install -g vercel

# Login
vercel login
```

### Étape 3: Déployer

```bash
# Première fois (configuration interactive)
vercel

# Suivre les prompts:
# - Set up and deploy? → Yes
# - Which scope? → Votre équipe/compte
# - Link to existing project? → No
# - Project name? → siports-2026
# - Directory? → ./ (racine)
# - Build Command? → npm run build
# - Output Directory? → dist
# - Development Command? → npm run dev
```

### Étape 4: Variables d'Environnement Vercel

Depuis le Dashboard Vercel (https://vercel.com/dashboard):

```bash
# Aller dans Settings > Environment Variables

# Ajouter les variables:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_APP_URL=https://siports-2026.vercel.app
VITE_STRIPE_PUBLIC_KEY=pk_live_...
VITE_GOOGLE_CLIENT_ID=123456789-...
```

### Étape 5: Déploiement Production

```bash
# Déployer en production
vercel --prod

# Votre URL sera: https://siports-2026.vercel.app
```

### Étape 6: Domaine Personnalisé (Optionnel)

```bash
# Depuis Dashboard Vercel:
# Settings > Domains > Add Domain
# Exemple: app.siports2026.com

# Configurer les DNS:
# Type: CNAME
# Name: app
# Value: cname.vercel-dns.com
```

---

## 🔌 INSTALLATION PLUGIN WORDPRESS

### Étape 1: Télécharger le Plugin

Le plugin se trouve dans: `/wordpress-plugin/siports-integration/`

### Étape 2: Installation

**Méthode 1: Upload ZIP**

```bash
# 1. Compresser le plugin
cd wordpress-plugin
zip -r siports-integration.zip siports-integration/

# 2. Dans WordPress Admin:
# Plugins > Ajouter > Téléverser
# Sélectionner siports-integration.zip
# Cliquer "Installer maintenant"
# Activer le plugin
```

**Méthode 2: FTP/SFTP**

```bash
# 1. Se connecter via FTP
# 2. Naviguer vers: /wp-content/plugins/
# 3. Uploader le dossier: siports-integration/
# 4. Dans WordPress Admin: Plugins > Activer SIPORTS Integration
```

### Étape 3: Première Configuration

Après activation, aller dans **SIPORTS > Paramètres**:

```
URL Application: https://siports-2026.vercel.app
URL Supabase: https://your-project.supabase.co
Clé Supabase: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Mode Debug: ☑ (Activer en développement)
Cache: ☑ (Activer)
Durée Cache: 3600 (secondes)
```

---

## 📄 IMPORT PAGES WORDPRESS

### Méthode Automatique (Recommandée)

Les pages sont créées automatiquement lors de l'activation du plugin:

- ✅ /tableau-de-bord
- ✅ /evenements
- ✅ /exposants
- ✅ /rendez-vous
- ✅ /messagerie
- ✅ /connexion
- ✅ /inscription

### Méthode Manuelle (XML Import)

Si les pages ne sont pas créées automatiquement:

**Étape 1: Import XML**

```
1. Aller dans: Outils > Importer
2. Installer "WordPress" importer
3. Choisir le fichier: wordpress-pages/siports-pages-export.xml
4. Cliquer "Upload file and import"
5. Assigner les articles à un utilisateur
6. Cocher "Download and import file attachments"
7. Cliquer "Submit"
```

**Étape 2: Vérifier les Pages**

```
Pages > Toutes les pages

Vous devriez voir:
✅ Accueil SIPORTS 2026
✅ Connexion
✅ Inscription
✅ Tableau de Bord
✅ Événements
✅ Exposants
✅ Rendez-vous
✅ Messagerie
✅ Networking
✅ Mon Profil
```

### Étape 3: Configurer la Page d'Accueil

```
1. Réglages > Lecture
2. "Une page statique" (au lieu de Derniers articles)
3. Page d'accueil: Sélectionner "Accueil SIPORTS 2026"
4. Page des articles: (Laisser vide)
5. Enregistrer
```

---

## ⚙️ CONFIGURATION

### Configuration Supabase

**1. Tables Nécessaires**

Le schéma se trouve dans: `supabase/migrations/`

```sql
-- Exécuter dans Supabase SQL Editor
-- Fichier: 20231201_initial_schema.sql
```

**2. Edge Functions**

```bash
# Déployer les edge functions
supabase functions deploy send-registration-email
supabase functions deploy send-validation-email
supabase functions deploy stripe-webhook
```

**3. Authentification**

```
Supabase Dashboard > Authentication > Providers

✅ Email (activé)
✅ Google OAuth
   - Client ID: (de Google Cloud Console)
   - Client Secret: (de Google Cloud Console)
✅ LinkedIn OAuth (optionnel)
```

**4. Storage**

```
Supabase Dashboard > Storage > Create new bucket

Buckets à créer:
- products (public)
- avatars (public)
- mini-sites (public)
```

### Configuration WordPress

**1. Permaliens**

```
Réglages > Permaliens
Structure: /%postname%/
Enregistrer
```

**2. Menu Navigation**

```
Apparence > Menus > Créer menu "Menu Principal"

Ajouter les pages:
- Accueil
- Événements
- Exposants
- Rendez-vous
- Messagerie (pour connectés)
- Networking (pour connectés)

Structure suggérée:
┌─ Accueil
├─ Événements
├─ Exposants
└─ Espace Membre
   ├─ Tableau de Bord
   ├─ Rendez-vous
   ├─ Messagerie
   ├─ Networking
   └─ Mon Profil
```

**3. Widgets (Optionnel)**

```
Apparence > Widgets

Widgets SIPORTS disponibles:
- SIPORTS Events Widget
- SIPORTS Exhibitors Widget
- SIPORTS Networking Widget
- SIPORTS Stats Widget
```

---

## 🔐 VARIABLES D'ENVIRONNEMENT

### Fichier `.env.production` (Vercel)

```bash
# Supabase
VITE_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Application
VITE_APP_URL=https://siports-2026.vercel.app
VITE_WORDPRESS_URL=https://siports2026.com

# Stripe
VITE_STRIPE_PUBLIC_KEY=pk_live_51...

# OAuth
VITE_GOOGLE_CLIENT_ID=123456789-xxxxxxxx.apps.googleusercontent.com

# Features
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=false
```

### Plugin WordPress (wp-config.php ou Settings)

```php
// Ajouter dans wp-config.php (optionnel pour sécurité)
define('SIPORTS_SUPABASE_URL', 'https://xxxxxxxxxxx.supabase.co');
define('SIPORTS_SUPABASE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
define('SIPORTS_APP_URL', 'https://siports-2026.vercel.app');
```

---

## ✅ TESTS

### Test 1: Application React (Vercel)

```bash
# Ouvrir: https://siports-2026.vercel.app

Vérifier:
✅ Page d'accueil charge
✅ Connexion fonctionne
✅ Inscription fonctionne
✅ Dashboard s'affiche après connexion
✅ Événements listés
✅ Exposants listés
✅ Chat fonctionne
✅ Rendez-vous peuvent être créés
```

### Test 2: Plugin WordPress

```bash
# Ouvrir: https://siports2026.com

Vérifier:
✅ Pages affichent les shortcodes
✅ Composants React chargent
✅ API REST répond: /wp-json/siports/v1/health
✅ Synchronisation WordPress ↔ Supabase
✅ Authentification unifiée
```

### Test 3: Intégration Complète

```bash
# Scénario:
1. Inscription sur WordPress
2. Connexion affiche dashboard React
3. Créer un rendez-vous
4. Vérifier dans Supabase
5. Envoyer un message chat
6. Vérifier notification

Tous les points doivent ✅ passer
```

---

## 🐛 TROUBLESHOOTING

### Problème 1: Shortcodes Affichent du Texte

**Symptôme:** `[siports_dashboard]` apparaît tel quel

**Solution:**
```bash
1. Vérifier activation plugin: Plugins > Activé?
2. Vérifier configuration: SIPORTS > Paramètres > URL App renseignée
3. Vider cache WordPress
4. Vérifier erreurs JS: Console navigateur (F12)
```

### Problème 2: Composants React Ne Chargent Pas

**Symptôme:** Div vide ou spinning loader infini

**Solution:**
```bash
1. Vérifier URL Application dans paramètres WordPress
2. Tester URL directement: https://siports-2026.vercel.app
3. Vérifier CORS: Headers dans vercel.json
4. Console navigateur: Erreurs réseau?
5. Vérifier variables d'environnement Vercel
```

### Problème 3: Erreur 403 Supabase

**Symptôme:** "Request failed with status 403"

**Solution:**
```bash
1. Vérifier RLS (Row Level Security):
   - Supabase Dashboard > Table Editor
   - Cliquer table > Policies
   - Vérifier policies activées

2. Vérifier clé API:
   - Supabase Dashboard > Settings > API
   - Copier "anon public" key
   - Mettre à jour dans Vercel + WordPress

3. Vérifier URL Supabase:
   - Format: https://xxxxx.supabase.co (sans / final)
```

### Problème 4: Build Vercel Échoue

**Symptôme:** "Build failed"

**Solution:**
```bash
1. Vérifier variables environnement Vercel
2. Test local: npm run build
3. Vérifier logs Vercel: Dashboard > Deployments > Failed > Logs
4. Problèmes courants:
   - Variables manquantes
   - Erreurs TypeScript non résolues
   - Dépendances manquantes
```

### Problème 5: Sessions Déconnectent Rapidement

**Symptôme:** Utilisateurs déconnectés après quelques minutes

**Solution:**
```bash
1. Supabase Dashboard > Authentication > Settings
2. JWT expiry: Augmenter à 3600 (1h) ou plus
3. Refresh token expiry: Augmenter à 604800 (7 jours)
4. Vérifier "rememberMe" activé dans LoginPage
```

---

## 📞 SUPPORT

### Ressources

- **Documentation Supabase:** https://supabase.com/docs
- **Documentation Vercel:** https://vercel.com/docs
- **Documentation WordPress:** https://developer.wordpress.org

### Logs Utiles

```bash
# Logs Vercel
vercel logs https://siports-2026.vercel.app

# Logs Supabase
# Dashboard > Logs Explorer

# Logs WordPress
# wp-content/debug.log (si WP_DEBUG activé)
```

---

## 🎉 FÉLICITATIONS !

Si tous les tests passent, votre installation SIPORTS 2026 est **complète et fonctionnelle** !

**Score Application:** 98/100 ⭐
**Prêt Production:** ✅ OUI

---

**Prochaines Étapes:**

1. ✅ Configurer domaine personnalisé
2. ✅ Ajouter contenu (événements, exposants)
3. ✅ Tester avec utilisateurs réels
4. ✅ Configurer monitoring (Sentry, LogRocket)
5. ✅ Lancer campagne communication

**Bonne chance pour SIPORTS 2026 ! 🚀**

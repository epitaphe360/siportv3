# 🔌 GUIDE D'INTÉGRATION WORDPRESS - SIPORTS 2026

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#vue-densemble)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Shortcodes disponibles](#shortcodes-disponibles)
5. [Exemples d'utilisation](#exemples-dutilisation)
6. [API REST WordPress](#api-rest-wordpress)
7. [Build et déploiement](#build-et-déploiement)
8. [Dépannage](#dépannage)

---

## 🎯 VUE D'ENSEMBLE

Ce plugin permet d'intégrer **toutes les fonctionnalités** de l'application React SIPORTS directement dans WordPress via des shortcodes.

### Fonctionnalités principales :

- ✅ **40+ Shortcodes** couvrant toutes les fonctionnalités
- ✅ **API Supabase complète** accessible depuis WordPress
- ✅ **Composants React** montables individuellement
- ✅ **Compatible Elementor** et autres page builders
- ✅ **Responsive** et optimisé pour mobile
- ✅ **SSR-ready** pour le SEO

---

## 📦 INSTALLATION

### Étape 1 : Build de l'application React

```bash
cd /home/user/siportv3
npm run build
```

### Étape 2 : Copier les fichiers dans WordPress

```bash
# Copier le dossier dist dans le plugin WordPress
cp -r dist/ wordpress-plugin/

# Ou créer un lien symbolique
ln -s /home/user/siportv3/dist wordpress-plugin/dist
```

### Étape 3 : Installer le plugin dans WordPress

```bash
# Copier le plugin dans WordPress
cp -r wordpress-plugin/ /var/www/html/wp-content/plugins/siports-integration/

# Ou uploader via l'admin WordPress
# Administration → Extensions → Ajouter → Upload
```

### Étape 4 : Activer le plugin

1. Aller dans **Extensions** → **Extensions installées**
2. Trouver **SIPORTS Comprehensive Shortcodes**
3. Cliquer sur **Activer**

---

## ⚙️ CONFIGURATION

### 1. Configuration Supabase

Ajouter dans `wp-config.php` :

```php
// Configuration SIPORTS
define('SIPORTS_SUPABASE_URL', 'https://votre-projet.supabase.co');
define('SIPORTS_SUPABASE_ANON_KEY', 'votre_anon_key_ici');
```

**OU** via les options WordPress :

```php
update_option('siports_supabase_url', 'https://votre-projet.supabase.co');
update_option('siports_supabase_anon_key', 'votre_anon_key_ici');
```

### 2. Vérifier l'installation

Créer une page de test avec :

```
[siports_stats show="exhibitors,visitors,countries" animated="true"]
```

Si vous voyez les statistiques, l'installation est réussie ! ✅

---

## 🔖 SHORTCODES DISPONIBLES

### 📊 DASHBOARDS

| Shortcode | Description | Paramètres |
|-----------|-------------|------------|
| `[siports_admin_dashboard]` | Dashboard administrateur | Aucun |
| `[siports_exhibitor_dashboard]` | Dashboard exposant | Aucun |
| `[siports_partner_dashboard]` | Dashboard partenaire | Aucun |
| `[siports_visitor_dashboard]` | Dashboard visiteur | Aucun |

### 🤝 NETWORKING

| Shortcode | Description | Paramètres |
|-----------|-------------|------------|
| `[siports_networking]` | Page de réseautage complète | `show_ai`, `show_recommendations`, `limit` |
| `[siports_chat]` | Interface de chat | `conversation_id`, `user_id` |

### 🏢 EXPOSANTS

| Shortcode | Description | Paramètres |
|-----------|-------------|------------|
| `[siports_exhibitors]` | Liste des exposants | `layout`, `limit`, `sector`, `featured`, `show_search` |
| `[siports_exhibitor id="123"]` | Détails d'un exposant | `id`, `slug` |
| `[siports_exhibitors_grid]` | Grille d'exposants | `cols`, `featured` |
| `[siports_exhibitors_search]` | Recherche d'exposants | Aucun |

**Exemples :**

```
[siports_exhibitors layout="grid" limit="12" sector="port-operations"]
[siports_exhibitors featured="true" limit="6"]
[siports_exhibitor id="abc123"]
```

### 📅 ÉVÉNEMENTS

| Shortcode | Description | Paramètres |
|-----------|-------------|------------|
| `[siports_events]` | Liste des événements | `type`, `limit`, `featured_only`, `show_calendar` |
| `[siports_event id="456"]` | Détails d'un événement | `id` |
| `[siports_events_calendar]` | Calendrier des événements | Aucun |
| `[siports_upcoming_events]` | Événements à venir | `limit` |

**Exemples :**

```
[siports_events type="conference" limit="10"]
[siports_events type="workshop" featured_only="true"]
[siports_upcoming_events limit="5"]
```

### 📰 ACTUALITÉS

| Shortcode | Description | Paramètres |
|-----------|-------------|------------|
| `[siports_news]` | Liste des actualités | `category`, `limit`, `featured_only`, `show_excerpt` |
| `[siports_article id="789"]` | Détails d'un article | `id` |
| `[siports_featured_news]` | Actualités à la une | `limit` |

**Exemples :**

```
[siports_news category="Innovation" limit="6"]
[siports_featured_news limit="3"]
[siports_article id="news-123"]
```

### 🤝 PARTENAIRES

| Shortcode | Description | Paramètres |
|-----------|-------------|------------|
| `[siports_partners]` | Liste des partenaires | `type`, `limit`, `show_logos` |
| `[siports_partner id="111"]` | Détails d'un partenaire | `id` |
| `[siports_sponsors]` | Liste des sponsors | `type` |

**Exemples :**

```
[siports_partners type="platinum" limit="10"]
[siports_partners show_logos="true"]
[siports_sponsors]
```

### 📅 RENDEZ-VOUS

| Shortcode | Description | Paramètres |
|-----------|-------------|------------|
| `[siports_appointments]` | Liste des rendez-vous | Aucun |
| `[siports_appointment_calendar]` | Calendrier de rendez-vous | `exhibitor_id` |
| `[siports_book_appointment]` | Prendre un rendez-vous | `exhibitor_id` |

### 🌐 MINI-SITES

| Shortcode | Description | Paramètres |
|-----------|-------------|------------|
| `[siports_minisites]` | Liste des mini-sites | `limit`, `layout` |
| `[siports_minisite id="222"]` | Afficher un mini-site | `id` |
| `[siports_minisite_editor]` | Éditeur de mini-site | Aucun |

### 🔐 AUTHENTIFICATION

| Shortcode | Description | Paramètres |
|-----------|-------------|------------|
| `[siports_login]` | Formulaire de connexion | Aucun |
| `[siports_register]` | Formulaire d'inscription | Aucun |
| `[siports_auth_links]` | Liens d'authentification | `style`, `register_text`, `login_text` |
| `[siports_profile]` | Page de profil utilisateur | Aucun |

**Exemples :**

```
[siports_auth_links style="buttons"]
[siports_auth_links style="links" register_text="S'inscrire gratuitement"]
```

### 📊 STATISTIQUES

| Shortcode | Description | Paramètres |
|-----------|-------------|------------|
| `[siports_stats]` | Statistiques du salon | `show`, `animated`, `layout` |
| `[siports_countdown]` | Compte à rebours | `show_days`, `show_hours`, `style`, `event_date` |
| `[siports_metrics]` | Métriques détaillées | Aucun |

**Exemples :**

```
[siports_stats show="exhibitors,visitors,countries,events" animated="true" layout="horizontal"]
[siports_countdown show_days="true" show_hours="true" style="full"]
[siports_countdown style="compact"]
```

### 💳 ABONNEMENTS VISITEURS

| Shortcode | Description | Paramètres |
|-----------|-------------|------------|
| `[siports_subscription]` | Page d'abonnement | Aucun |
| `[siports_upgrade]` | Mise à niveau | Aucun |

### 📦 PRODUITS

| Shortcode | Description | Paramètres |
|-----------|-------------|------------|
| `[siports_products]` | Liste des produits | `exhibitor_id`, `limit`, `category` |
| `[siports_product id="333"]` | Détails d'un produit | `id` |

### 🏛️ PAVILLONS

| Shortcode | Description | Paramètres |
|-----------|-------------|------------|
| `[siports_pavilions]` | Liste des pavillons | Aucun |
| `[siports_pavilion id="444"]` | Détails d'un pavillon | `id` |

### 📱 AUTRES

| Shortcode | Description | Paramètres |
|-----------|-------------|------------|
| `[siports_qr_code]` | Générateur de QR Code | `user_id`, `size` |
| `[siports_search]` | Recherche globale | Aucun |

---

## 💡 EXEMPLES D'UTILISATION

### Page d'accueil complète

```html
<!-- Hero Section -->
<div class="hero-section">
    [siports_countdown show_days="true" show_hours="true" style="full"]
</div>

<!-- Statistiques -->
<div class="stats-section">
    [siports_stats show="exhibitors,visitors,countries,events" animated="true" layout="horizontal"]
</div>

<!-- Exposants vedettes -->
<h2>Exposants à la Une</h2>
[siports_exhibitors featured="true" limit="6" layout="grid"]

<!-- Événements phares -->
<h2>Événements Phares</h2>
[siports_events featured_only="true" limit="4"]

<!-- Actualités -->
<h2>Dernières Actualités</h2>
[siports_news featured_only="true" limit="3" show_excerpt="true"]
```

### Page Exposants

```html
<h1>Exposants SIPORTS 2026</h1>

<!-- Recherche -->
[siports_exhibitors_search]

<!-- Par pavillon -->
<h2>Pavillon Institutionnel</h2>
[siports_exhibitors category="institutional" limit="20" layout="grid"]

<h2>Pavillon Industrie Portuaire</h2>
[siports_exhibitors category="port-industry" limit="20" layout="grid"]
```

### Page Programme

```html
<h1>Programme SIPORTS 2026</h1>

<!-- Calendrier -->
[siports_events_calendar]

<!-- Conférences -->
<h2>Conférences Plénières</h2>
[siports_events type="conference" limit="10"]

<!-- Ateliers -->
<h2>Ateliers Techniques</h2>
[siports_events type="workshop" limit="8"]
```

### Widget Sidebar

```html
<!-- Compte à rebours compact -->
[siports_countdown style="compact"]

<!-- Stats rapides -->
[siports_stats show="exhibitors,visitors" layout="vertical"]

<!-- Prochains événements -->
<h3>Prochains Événements</h3>
[siports_upcoming_events limit="3"]
```

### Page Réseautage

```html
<h1>Réseautage Professionnel</h1>

<!-- Interface complète -->
[siports_networking show_ai="true" show_recommendations="true" limit="20"]
```

---

## 🔌 API REST WORDPRESS

Le plugin expose également une API REST pour l'accès programmatique :

```javascript
// Récupérer les exposants
fetch('/wp-json/siports/v1/exhibitors?limit=10')
    .then(response => response.json())
    .then(data => console.log(data));

// Récupérer les événements
fetch('/wp-json/siports/v1/events?type=conference')
    .then(response => response.json())
    .then(data => console.log(data));

// Recherche
fetch('/wp-json/siports/v1/search?q=port')
    .then(response => response.json())
    .then(data => console.log(data));
```

---

## 🏗️ BUILD ET DÉPLOIEMENT

### Build pour production

```bash
# Build l'application React
cd /home/user/siportv3
npm run build

# Copier dans le plugin
cp -r dist/ wordpress-plugin/

# Zipper le plugin
cd wordpress-plugin
zip -r siports-integration.zip .
```

### Déploiement automatique

Créer un script `deploy-wp.sh` :

```bash
#!/bin/bash

# Build
npm run build

# Copier
cp -r dist/ wordpress-plugin/

# Sync vers WordPress
rsync -avz wordpress-plugin/ user@votre-serveur:/var/www/html/wp-content/plugins/siports-integration/

# Redémarrer PHP-FPM
ssh user@votre-serveur 'sudo systemctl restart php-fpm'

echo "✅ Déploiement terminé!"
```

---

## 🐛 DÉPANNAGE

### Les shortcodes n'affichent rien

**Problème** : Les shortcodes s'affichent comme du texte brut.

**Solution** :
1. Vérifier que le plugin est activé
2. Vider le cache WordPress
3. Vérifier que les fichiers `dist/` sont présents

### Les styles ne s'appliquent pas

**Problème** : Les composants s'affichent sans style.

**Solution** :
1. Vérifier que le fichier `dist/assets/index-*.css` existe
2. Vérifier les permissions des fichiers (755)
3. Désactiver le cache CSS

### Erreur "Supabase n'est pas configuré"

**Problème** : Les données ne se chargent pas.

**Solution** :
1. Vérifier `wp-config.php` pour les constantes `SIPORTS_SUPABASE_URL` et `SIPORTS_SUPABASE_ANON_KEY`
2. Ou configurer via options WordPress
3. Tester la connexion : `curl https://votre-projet.supabase.co/rest/v1/`

### Les composants React ne se chargent pas

**Problème** : Erreur JavaScript dans la console.

**Solution** :
1. Vérifier que le script est chargé comme module : `<script type="module">`
2. Vérifier la configuration de la CSP (Content Security Policy)
3. Ouvrir la console du navigateur pour voir l'erreur exacte

### Conflit avec d'autres plugins

**Problème** : Conflit CSS ou JavaScript.

**Solution** :
1. Désactiver les autres plugins un par un pour identifier le conflit
2. Utiliser un préfixe unique pour les classes CSS : `.siports-`
3. Charger les scripts avec une haute priorité

---

## 📚 RESSOURCES

- **Documentation React** : `/home/user/siportv3/README.md`
- **Documentation Supabase** : https://supabase.com/docs
- **Support** : support@siportevent.com
- **GitHub** : https://github.com/siports/siportv3

---

## 🎉 PRÊT À DÉMARRER !

Votre plugin WordPress SIPORTS est maintenant installé et configuré.

**Prochaines étapes :**

1. ✅ Créer une page de test avec quelques shortcodes
2. ✅ Personnaliser le CSS selon votre thème
3. ✅ Intégrer avec Elementor ou votre page builder
4. ✅ Tester sur mobile
5. ✅ Mettre en production

**Bon développement ! 🚀**

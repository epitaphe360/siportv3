# Guide d'Installation Complet - Templates WordPress SIPORTS 2026

## 📋 Vue d'Ensemble

Ce guide vous explique comment installer et configurer l'ensemble complet des templates WordPress pour SIPORTS 2026. Vous disposerez de **15 templates de pages** professionnelles, élégantes et entièrement fonctionnelles.

---

## 🎯 Templates Disponibles

### Pages Publiques
1. **Page d'Accueil** - Homepage avec countdown, stats, featured content
2. **Exposants** - Liste des exposants avec filtres avancés
3. **Événements** - Calendrier et liste des conférences/ateliers
4. **Networking** - Plateforme de mise en relation entre participants
5. **Actualités** - Blog et articles de l'industrie
6. **Partenaires** - Liste des partenaires et sponsors
7. **Produits** - Catalogue des produits/services
8. **Pavillons** - Plan des pavillons d'exposition
9. **Mini-sites** - Espaces dédiés des exposants
10. **Recherche** - Recherche globale sur tout le contenu

### Pages Utilisateur
11. **Connexion/Inscription** - Authentification unifiée
12. **Profil** - Gestion du profil utilisateur
13. **Rendez-vous** - Planification des meetings

### Dashboards
14. **Dashboard Visiteur** - Espace personnel visiteur
15. **Dashboard Exposant** - Gestion exposant et mini-site
16. **Dashboard Partenaire** - Suivi de visibilité partenaire
17. **Dashboard Admin** - Administration complète

---

## 🚀 Installation Rapide

### Prérequis

- WordPress 5.8+ installé et configuré
- PHP 7.4+
- Plugin SIPORTS Comprehensive Shortcodes activé
- Thème WordPress actif (n'importe lequel)

### Étape 1: Copier les Templates

Copiez tous les templates dans votre thème WordPress actif :

```bash
# Identifier votre thème actif
cd /var/www/html/wp-content/themes
ls -la  # Trouvez votre thème actif

# Copier les templates (remplacez YOUR-THEME)
cp /path/to/wordpress-plugin/templates/*.php \
   /var/www/html/wp-content/themes/YOUR-THEME/
```

**Alternative**: Créer un dossier `templates/` dans votre thème :

```bash
mkdir -p /var/www/html/wp-content/themes/YOUR-THEME/templates/
cp /path/to/wordpress-plugin/templates/*.php \
   /var/www/html/wp-content/themes/YOUR-THEME/templates/
```

### Étape 2: Vérifier les Assets

Les assets CSS et JavaScript sont automatiquement chargés par le plugin. Vérifiez simplement que le plugin est activé :

1. Admin WordPress → **Extensions**
2. Vérifiez que **"SIPORTS Comprehensive Shortcodes"** est activé ✅

### Étape 3: Créer les Pages WordPress

Pour chaque template, créez une page dans WordPress :

1. **Pages → Ajouter**
2. **Titre** : Donnez un titre (voir tableau ci-dessous)
3. **Attributs de page → Modèle** : Sélectionnez le template SIPORTS correspondant
4. **Publier**

---

## 📖 Configuration Page par Page

### 1. Page d'Accueil

**Template**: `SIPORTS - Page d'Accueil`
**Titre suggéré**: "Accueil" ou "Home"
**URL suggérée**: `/` (définir comme page d'accueil dans Réglages → Lecture)

**Contenu affiché** :
- Hero avec countdown vers SIPORT 2026
- Statistiques animées (exposants, visiteurs, pays)
- Section à propos
- Exposants vedettes (6 premiers)
- Événements à venir (4 prochains)
- Actualités récentes (3 dernières)
- Partenaires principaux
- CTA inscription visiteur/exposant

**Shortcodes utilisés** :
```
[siports_countdown event_date="2026-05-15"]
[siports_stats show="exhibitors,visitors,countries,events" animated="true"]
[siports_exhibitors featured="true" limit="6"]
[siports_upcoming_events limit="4"]
[siports_featured_news limit="3"]
[siports_partners featured="true" limit="12"]
```

**Personnalisation** :
- Modifier la date du countdown ligne 25
- Changer les textes hero lignes 19-24
- Personnaliser l'image About (ajouter dans `/images/siport-venue.jpg`)

---

### 2. Page Exposants

**Template**: `SIPORTS - Liste des Exposants`
**Titre suggéré**: "Nos Exposants" ou "Exposants"
**URL suggérée**: `/exposants`

**Contenu affiché** :
- Hero avec statistiques
- Filtres interactifs (secteur, pays, recherche, vedettes)
- Vue grille/liste toggleable
- Liste complète des exposants
- Section CTA "Devenir Exposant"
- Section partenaires

**Fonctionnalités** :
- ✅ Filtrage en temps réel sans rechargement
- ✅ Recherche avec debounce
- ✅ Toggle vue grille/liste
- ✅ Animations fluides
- ✅ 100% Responsive

**Raccourcis clavier** :
- `Ctrl+K` / `Cmd+K` : Focus recherche
- `Escape` : Réinitialiser filtres

**Documentation dédiée** : Voir `PAGE-EXPOSANTS-INSTALLATION.md`

---

### 3. Page Événements

**Template**: `SIPORTS - Événements`
**Titre suggéré**: "Programme" ou "Événements"
**URL suggérée**: `/evenements` ou `/programme`

**Contenu affiché** :
- Hero descriptif
- Toggle vue liste/calendrier
- Filtre par type d'événement
- Calendrier interactif (vue calendrier)
- Timeline des événements (vue liste)
- Bouton inscription & téléchargement programme

**Shortcodes utilisés** :
```
[siports_events_calendar month="2026-05" interactive="true"]
[siports_events layout="timeline" show_register="true" show_speakers="true"]
```

---

### 4. Page Networking

**Template**: `SIPORTS - Networking`
**Titre suggéré**: "Networking"
**URL suggérée**: `/networking`

**Contenu affiché** :
- Hero avec badge
- 4 features (Découvrir, Échanger, Planifier, IA)
- Plateforme de networking complète (app React)
- Section messagerie/chat
- Statistiques de networking
- CTA inscription

**Shortcodes utilisés** :
```
[siports_networking show_ai="true" show_appointments="true"]
[siports_chat show_online="true" show_typing="true"]
```

**Note** : Nécessite connexion utilisateur pour fonctionnalités complètes

---

### 5. Page Actualités

**Template**: `SIPORTS - Actualités`
**Titre suggéré**: "Actualités" ou "Blog"
**URL suggérée**: `/actualites` ou `/blog`

**Contenu affiché** :
- Hero
- Articles vedettes en grand format
- Filtres par catégorie (Industrie, Technologie, Durabilité, etc.)
- Grille d'articles avec extraits
- Bouton "Charger plus"
- Newsletter signup

**Shortcodes utilisés** :
```
[siports_featured_news limit="3" layout="hero"]
[siports_news layout="grid" limit="12" show_excerpt="true" show_author="true"]
```

---

### 6. Page Partenaires

**Template**: `SIPORTS - Partenaires`
**Titre suggéré**: "Partenaires & Sponsors"
**URL suggérée**: `/partenaires`

**Contenu affiché** :
- Hero
- Sponsors Platinum (featured)
- Sponsors Gold (grid)
- Sponsors Silver (grid)
- Tous les partenaires
- CTA "Devenir Partenaire"

**Shortcodes utilisés** :
```
[siports_sponsors level="platinum" layout="featured"]
[siports_sponsors level="gold" layout="grid"]
[siports_sponsors level="silver" layout="grid"]
[siports_partners layout="grid" show_description="true"]
```

---

### 7. Page Produits

**Template**: `SIPORTS - Produits & Services`
**Titre suggéré**: "Produits & Services"
**URL suggérée**: `/produits`

**Contenu affiché** :
- Hero
- Catalogue complet avec filtres et recherche

**Shortcodes utilisés** :
```
[siports_products layout="grid" show_filter="true" show_search="true" limit="24"]
```

---

### 8. Page Pavillons

**Template**: `SIPORTS - Pavillons`
**Titre suggéré**: "Plan du Salon" ou "Pavillons"
**URL suggérée**: `/pavillons` ou `/plan`

**Contenu affiché** :
- Hero
- Plan interactif des pavillons
- Liste des exposants par pavillon

**Shortcodes utilisés** :
```
[siports_pavilions layout="map" interactive="true" show_exhibitors="true"]
```

---

### 9. Page Mini-sites

**Template**: `SIPORTS - Mini-sites Exposants`
**Titre suggéré**: "Mini-sites" ou "Espaces Exposants"
**URL suggérée**: `/mini-sites`

**Contenu affiché** :
- Hero
- Grille des mini-sites exposants

**Shortcodes utilisés** :
```
[siports_minisites layout="grid" show_featured="true" limit="12"]
```

---

### 10. Page Recherche

**Template**: `SIPORTS - Recherche Globale`
**Titre suggéré**: "Recherche"
**URL suggérée**: `/recherche` ou `/search`

**Contenu affiché** :
- Hero avec barre de recherche
- Résultats de recherche globale avec filtres

**Shortcodes utilisés** :
```
[siports_search show_filters="true" show_categories="true" results_per_page="20"]
```

---

### 11. Page Connexion/Inscription

**Template**: `SIPORTS - Connexion/Inscription`
**Titre suggéré**: "Connexion"
**URL suggérée**: `/connexion` ou `/login`

**Contenu affiché** :
- Tabs Connexion/Inscription
- Formulaire de connexion
- Formulaire d'inscription
- Liens CGU et confidentialité

**Shortcodes utilisés** :
```
[siports_login redirect_url="/dashboard"]
[siports_register user_type="visitor" show_terms="true"]
```

---

### 12. Page Profil

**Template**: `SIPORTS - Mon Profil`
**Titre suggéré**: "Mon Profil"
**URL suggérée**: `/profil` ou `/mon-compte`

**Contenu affiché** :
- Formulaire d'édition de profil
- Avatar/photo
- QR code personnel

**Shortcodes utilisés** :
```
[siports_profile show_edit="true" show_avatar="true" show_qr="true"]
```

**Note** : ⚠️ Page protégée - Redirige vers `/connexion` si non connecté

---

### 13. Page Rendez-vous

**Template**: `SIPORTS - Rendez-vous`
**Titre suggéré**: "Mes Rendez-vous"
**URL suggérée**: `/rendez-vous` ou `/appointments`

**Contenu affiché** :
- Calendrier des rendez-vous
- Liste des prochains RDV
- Formulaire de prise de RDV

**Shortcodes utilisés** :
```
[siports_appointments show_calendar="true" show_upcoming="true" allow_booking="true"]
```

**Note** : ⚠️ Page protégée - Redirige vers `/connexion` si non connecté

---

### 14. Dashboard Visiteur

**Template**: `SIPORTS - Dashboard Visiteur`
**Titre suggéré**: "Mon Espace" ou "Dashboard"
**URL suggérée**: `/dashboard` ou `/mon-espace`

**Contenu affiché** :
- Sidebar navigation
- Vue d'ensemble personnalisée
- Statistiques personnelles
- Networking suggestions
- Rendez-vous à venir
- Favoris

**Shortcodes utilisés** :
```
[siports_visitor_dashboard show_stats="true" show_upcoming="true"]
```

**Note** : ⚠️ Page protégée - Redirige vers `/connexion` si non connecté

---

### 15. Dashboard Exposant

**Template**: `SIPORTS - Dashboard Exposant`
**Titre suggéré**: "Espace Exposant"
**URL suggérée**: `/dashboard-exposant` ou `/espace-exposant`

**Contenu affiché** :
- Sidebar navigation exposant
- Gestion du mini-site
- Gestion des produits
- Rendez-vous
- Statistiques de visibilité
- Analytics

**Shortcodes utilisés** :
```
[siports_exhibitor_dashboard show_stats="true" show_minisite="true" show_products="true"]
```

**Note** : ⚠️ Page protégée - Redirige vers `/connexion` si non connecté

---

### 16. Dashboard Partenaire

**Template**: `SIPORTS - Dashboard Partenaire`
**Titre suggéré**: "Espace Partenaire"
**URL suggérée**: `/dashboard-partenaire`

**Contenu affiché** :
- Sidebar navigation partenaire
- Suivi de visibilité
- Statistiques d'impact
- ROI tracking

**Shortcodes utilisés** :
```
[siports_partner_dashboard show_stats="true" show_visibility="true"]
```

**Note** : ⚠️ Page protégée - Redirige vers `/connexion` si non connecté

---

### 17. Dashboard Admin

**Template**: `SIPORTS - Dashboard Admin`
**Titre suggéré**: "Administration"
**URL suggérée**: `/admin-siports` ou `/administration`

**Contenu affiché** :
- Sidebar navigation admin
- Vue d'ensemble complète
- Gestion exposants
- Gestion visiteurs
- Gestion événements
- Analytics globales

**Shortcodes utilisés** :
```
[siports_admin_dashboard show_all="true"]
```

**Note** : ⚠️ Page ultra-protégée - Redirige vers `/` si non admin WordPress

---

## 🎨 Système de Design

### CSS Global (`siports-global.css`)

Toutes les pages partagent le même système de design via `siports-global.css` :

**Variables CSS disponibles** :
```css
--siports-primary: #0066CC
--siports-secondary: #FF6B35
--siports-accent: #00D4AA
--siports-dark: #1A2332
--siports-white: #FFFFFF
--siports-gray-100 à gray-900
```

**Classes utilitaires** :
- `.siports-container` - Container standard (max-width: 1280px)
- `.siports-container-narrow` - Container étroit (max-width: 960px)
- `.siports-container-wide` - Container large (max-width: 1440px)
- `.siports-btn-primary`, `.siports-btn-secondary`, `.siports-btn-outline`
- `.siports-card`, `.siports-grid`, `.siports-section`

### Personnalisation des Couleurs

Pour personnaliser les couleurs, éditez `/assets/css/siports-global.css` lignes 7-25 :

```css
:root {
    --siports-primary: #VOTRE_COULEUR;
    --siports-secondary: #VOTRE_COULEUR;
    /* ... */
}
```

Toutes les pages seront automatiquement mises à jour.

---

## 🔧 Configuration Avancée

### Menu WordPress

Créez un menu avec liens vers toutes vos pages :

1. **Apparence → Menus**
2. Créer un nouveau menu "Menu Principal"
3. Ajouter les pages créées
4. Structure suggérée :
   ```
   - Accueil
   - Exposants
   - Programme
   - Networking
   - Actualités
   - Partenaires
   - Produits
   - Pavillons
   - Mon Compte
     - Dashboard
     - Mon Profil
     - Mes Rendez-vous
   ```

### Widgets Sidebar

Si votre thème supporte les widgets, ajoutez :
- Widget de recherche SIPORTS
- Widget countdown
- Widget "Prochains événements"
- Widget sponsors

### Permaliens

Configuration recommandée :

1. **Réglages → Permaliens**
2. Sélectionner **"Nom de l'article"** : `/%postname%/`
3. Enregistrer

---

## 📱 Responsive & Compatibilité

### Breakpoints

Tous les templates sont responsive avec ces breakpoints :

- **Desktop** : > 1024px
- **Tablet** : 768px - 1024px
- **Mobile** : 480px - 768px
- **Small Mobile** : < 480px

### Navigateurs Supportés

- ✅ Chrome/Edge (dernières versions)
- ✅ Firefox (dernières versions)
- ✅ Safari (dernières versions)
- ✅ iOS Safari
- ✅ Android Chrome

### Page Builders

Compatible avec :
- ✅ Gutenberg (natif)
- ✅ Elementor
- ✅ WPBakery
- ✅ Divi
- ✅ Beaver Builder

---

## 🐛 Dépannage

### Les templates n'apparaissent pas

**Solution** :
1. Vérifiez que les fichiers `.php` sont bien dans le dossier du thème actif
2. Vérifiez que chaque fichier commence par `<?php /**  * Template Name: ...`
3. Reconnectez-vous à l'admin WordPress
4. Videz le cache (si plugin de cache actif)

### Les styles ne s'appliquent pas

**Solution** :
1. Vérifiez que le plugin SIPORTS est activé
2. Inspectez la page (F12) et vérifiez si `siports-global.css` est chargé
3. Videz le cache du navigateur (Ctrl+Shift+R)
4. Vérifiez la console pour les erreurs JavaScript

### Les shortcodes affichent du texte brut

**Solution** :
1. Le plugin n'est pas activé → Activez "SIPORTS Comprehensive Shortcodes"
2. Shortcode mal écrit → Vérifiez l'orthographe exacte
3. Videz le cache WordPress

### Page blanche / Erreur 500

**Solution** :
1. Activez le mode debug : `define('WP_DEBUG', true);` dans `wp-config.php`
2. Vérifiez les logs : `wp-content/debug.log`
3. Vérifiez la version PHP (minimum 7.4)
4. Vérifiez les permissions des fichiers (644 pour fichiers, 755 pour dossiers)

### Les redirections ne fonctionnent pas

**Solution** :
1. Régénérez les permaliens : **Réglages → Permaliens → Enregistrer**
2. Vérifiez `.htaccess` (doit être writable)

---

## 🔐 Sécurité

### Bonnes Pratiques

1. ✅ Toutes les pages protégées vérifient `is_user_logged_in()`
2. ✅ Dashboard Admin vérifie `current_user_can('administrator')`
3. ✅ Tous les outputs sont échappés (`esc_html()`, `esc_url()`, etc.)
4. ✅ Nonces WordPress utilisés dans les formulaires
5. ✅ Validation côté serveur des données

### Recommandations

- Utilisez un certificat SSL (HTTPS)
- Installez un plugin de sécurité (Wordfence, iThemes Security)
- Maintenez WordPress et le plugin à jour
- Utilisez des mots de passe forts
- Limitez les tentatives de connexion

---

## 📊 Performance

### Optimisations Incluses

- ✅ CSS minifié en production
- ✅ Chargement conditionnel des assets (uniquement sur pages SIPORTS)
- ✅ Images lazy loading
- ✅ Cache-busting avec filemtime()
- ✅ Animations GPU-accelerated
- ✅ Debounce sur les recherches

### Recommandations

1. **Plugin de Cache** : Installez WP Rocket ou W3 Total Cache
2. **CDN** : Utilisez un CDN pour les assets statiques (Cloudflare, etc.)
3. **Optimisation Images** : Utilisez WebP et compression (Imagify, ShortPixel)
4. **Base de données** : Nettoyez régulièrement (WP-Optimize)
5. **Hébergement** : Utilisez un hébergement performant (LiteSpeed, Nginx)

---

## 📦 Structure des Fichiers

```
wordpress-plugin/
├── templates/                           # Templates WordPress (à copier dans thème)
│   ├── page-accueil.php                # ✅ Homepage
│   ├── page-exposants.php              # ✅ Exposants
│   ├── page-evenements.php             # ✅ Événements
│   ├── page-networking.php             # ✅ Networking
│   ├── page-actualites.php             # ✅ Actualités
│   ├── page-partenaires.php            # ✅ Partenaires
│   ├── page-produits.php               # ✅ Produits
│   ├── page-pavillons.php              # ✅ Pavillons
│   ├── page-minisites.php              # ✅ Mini-sites
│   ├── page-recherche.php              # ✅ Recherche
│   ├── page-auth.php                   # ✅ Connexion/Inscription
│   ├── page-profil.php                 # ✅ Profil
│   ├── page-rendez-vous.php            # ✅ Rendez-vous
│   ├── page-dashboard-visiteur.php     # ✅ Dashboard Visiteur
│   ├── page-dashboard-exposant.php     # ✅ Dashboard Exposant
│   ├── page-dashboard-partenaire.php   # ✅ Dashboard Partenaire
│   └── page-dashboard-admin.php        # ✅ Dashboard Admin
├── assets/
│   ├── css/
│   │   ├── siports-global.css          # ✅ CSS global partagé
│   │   └── page-exposants.css          # ✅ CSS page exposants
│   └── js/
│       └── page-exposants.js           # ✅ JS page exposants
├── includes/
│   ├── class-siports-complete-api.php  # ✅ API Supabase complète
│   └── class-siports-minisites.php     # Gestion mini-sites
├── siports-comprehensive-shortcodes.php # ✅ Plugin principal
└── docs/
    ├── GUIDE-INSTALLATION-COMPLET.md    # ✅ Ce fichier
    └── PAGE-EXPOSANTS-INSTALLATION.md   # Guide page exposants

Total: 17 templates + 1 CSS global + 1 JS + documentation complète
```

---

## ✅ Checklist d'Installation

Utilisez cette checklist pour vérifier votre installation :

### Prérequis
- [ ] WordPress 5.8+ installé
- [ ] PHP 7.4+ configuré
- [ ] Thème WordPress actif
- [ ] Plugin SIPORTS activé

### Installation
- [ ] Templates copiés dans le thème
- [ ] Assets vérifiés (css/js)
- [ ] Permissions fichiers correctes (644/755)

### Configuration Pages
- [ ] Page d'Accueil créée et définie comme homepage
- [ ] Page Exposants créée
- [ ] Page Événements créée
- [ ] Page Networking créée
- [ ] Page Actualités créée
- [ ] Page Partenaires créée
- [ ] Page Produits créée
- [ ] Page Pavillons créée
- [ ] Page Mini-sites créée
- [ ] Page Recherche créée
- [ ] Page Connexion créée
- [ ] Page Profil créée
- [ ] Page Rendez-vous créée
- [ ] Dashboard Visiteur créé
- [ ] Dashboard Exposant créé
- [ ] Dashboard Partenaire créé
- [ ] Dashboard Admin créé

### Configuration WordPress
- [ ] Menu principal créé et assigné
- [ ] Permaliens configurés (Nom de l'article)
- [ ] Page d'accueil définie (Réglages → Lecture)
- [ ] Credentials Supabase configurés

### Test Fonctionnel
- [ ] Navigation entre pages fonctionne
- [ ] Shortcodes s'affichent correctement
- [ ] Filtres fonctionnent (page exposants)
- [ ] Responsive vérifié (mobile/tablet)
- [ ] Formulaires de connexion fonctionnent
- [ ] Dashboards accessibles (après connexion)
- [ ] Recherche globale fonctionne

### Performance
- [ ] Cache configuré
- [ ] Images optimisées
- [ ] SSL actif (HTTPS)
- [ ] Vitesse testée (PageSpeed Insights)

---

## 🆘 Support

### Documentation

- **Guide complet** : `GUIDE-INSTALLATION-COMPLET.md` (ce fichier)
- **Guide page exposants** : `PAGE-EXPOSANTS-INSTALLATION.md`
- **Guide WordPress** : `WORDPRESS-INTEGRATION-GUIDE.md`

### Ressources

- Documentation WordPress : https://codex.wordpress.org
- Documentation React/Vite : https://vitejs.dev
- Documentation Supabase : https://supabase.com/docs

### Logs & Debug

Activer le mode debug WordPress :

```php
// wp-config.php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

Les logs seront dans `/wp-content/debug.log`

---

## 🎉 Félicitations !

Vous avez maintenant un site WordPress complet pour SIPORT 2026 avec **17 templates professionnels** intégrant tous les shortcodes de l'application React.

**Prochaines étapes** :
1. Personnalisez les couleurs et textes
2. Ajoutez vos propres images
3. Configurez le menu et les widgets
4. Testez toutes les fonctionnalités
5. Lancez en production !

---

**Développé avec ❤️ pour SIPORT 2026**
**Casablanca, Maroc - 15-18 Mai 2026**

🚀 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>

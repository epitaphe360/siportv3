=== SIPORTS 2026 Integration ===
Contributors: siports-team
Tags: events, exhibitions, networking, ports, maritime, salon, b2b
Requires at least: 5.0
Tested up to: 6.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Intégration complète de la plateforme SIPORTS 2026 dans WordPress avec shortcodes et API.

== Description ==

Le plugin SIPORTS 2026 Integration permet d'intégrer facilement la plateforme du Salon International des Ports dans votre site WordPress.

**Fonctionnalités principales :**

* 🏢 **Affichage des exposants** avec filtres par catégorie et secteur
* 📅 **Gestion des événements** et inscriptions en ligne
* 🤝 **Système de réseautage** avec recommandations IA
* 📰 **Actualités portuaires** synchronisées automatiquement
* 🏛️ **Pavillons thématiques** avec statistiques
* 📊 **Statistiques du salon** en temps réel
* ⏰ **Compte à rebours** jusqu'au salon
* 🎨 **Design responsive** et personnalisable

**8 Shortcodes disponibles :**

1. `[siports_exhibitors]` - Liste des exposants
2. `[siports_events]` - Événements et conférences
3. `[siports_networking]` - Réseautage professionnel
4. `[siports_news]` - Actualités portuaires
5. `[siports_partners]` - Partenaires officiels
6. `[siports_pavilions]` - Pavillons thématiques
7. `[siports_stats]` - Statistiques du salon
8. `[siports_countdown]` - Compte à rebours
9. `[siports_auth_links]` - Liens inscription/connexion

**API REST complète :**

* `/wp-json/siports/v1/exhibitors` - Données des exposants
* `/wp-json/siports/v1/events` - Événements programmés
* `/wp-json/siports/v1/stats` - Statistiques globales

== Installation ==

1. **Téléchargez** le plugin depuis le répertoire WordPress ou uploadez le dossier dans `/wp-content/plugins/`
2. **Activez** le plugin dans l'administration WordPress
3. **Configurez** les paramètres dans SIPORTS → Paramètres
4. **Utilisez** les shortcodes dans vos pages et articles
5. **Consultez** le guide des shortcodes dans SIPORTS → Shortcodes

== Utilisation des Shortcodes ==

**Exposants :**
```
[siports_exhibitors category="port-operations" limit="12" layout="grid"]
[siports_exhibitors featured="true" limit="6"]
```

**Événements :**
```
[siports_events type="conference" limit="6" featured_only="true"]
[siports_events category="Digital Transformation"]
```

**Réseautage :**
```
[siports_networking recommendations="6" show_ai="true"]
```

**Actualités :**
```
[siports_news category="Innovation" limit="4" show_excerpt="true"]
[siports_news featured_only="true"]
```

**Partenaires :**
```
[siports_partners type="platinum" limit="8"]
[siports_partners show_logos="true"]
```

**Pavillons :**
```
[siports_pavilions show_stats="true"]
```

**Statistiques :**
```
[siports_stats show="exhibitors,visitors,countries,events"]
[siports_stats animated="true" layout="horizontal"]
```

**Compte à rebours :**
```
[siports_countdown show_days="true" show_hours="true"]
[siports_countdown style="compact"]
```

**Liens d'authentification :**
```
[siports_auth_links] 
[siports_auth_links style="banner"]
[siports_auth_links style="links" register_text="Inscription Gratuite"]
[siports_auth_links show_register="true" show_login="false"]
```

== Paramètres Disponibles ==

**Paramètres généraux :**
* URL de l'API SIPORTS
* Clé d'authentification API
* Langue par défaut (FR/EN/AR)
* Durée de mise en cache

**Personnalisation :**
* Couleurs du thème
* Polices de caractères
* Layouts responsive
* Animations et transitions

== API REST ==

Le plugin expose une API REST complète :

**Endpoints disponibles :**
* `GET /wp-json/siports/v1/exhibitors` - Liste des exposants
* `GET /wp-json/siports/v1/events` - Événements programmés
* `GET /wp-json/siports/v1/stats` - Statistiques globales

**Paramètres de requête :**
* `category` - Filtrer par catégorie
* `limit` - Nombre d'éléments
* `featured` - Éléments vedettes uniquement
* `search` - Recherche textuelle

== Frequently Asked Questions ==

= Comment synchroniser les données avec la plateforme SIPORTS ? =

Rendez-vous dans SIPORTS → Tableau de Bord et cliquez sur "Synchroniser les Données". La synchronisation se fait automatiquement toutes les heures.

= Puis-je personnaliser l'apparence des shortcodes ? =

Oui, le plugin inclut des classes CSS que vous pouvez surcharger dans votre thème. Consultez le fichier `assets/siports.css` pour les classes disponibles.

= Les shortcodes sont-ils responsive ? =

Oui, tous les shortcodes sont entièrement responsive et s'adaptent automatiquement aux différentes tailles d'écran.

= Comment obtenir une clé API ? =

Contactez l'équipe SIPORTS à contact@siportevent.com pour obtenir vos identifiants API.

== Screenshots ==

1. Interface d'administration du plugin
2. Shortcode des exposants en action
3. Affichage des événements avec inscription
4. Système de réseautage IA
5. Compte à rebours animé
6. Statistiques du salon

== Changelog ==

= 1.0.0 =
* Version initiale du plugin
* 8 shortcodes complets
* API REST intégrée
* Interface d'administration
* Synchronisation automatique
* Design responsive
* Support multilingue (FR/EN/AR)
* Cache intelligent
* Données de démonstration

== Upgrade Notice ==

= 1.0.0 =
Version initiale stable du plugin SIPORTS 2026 Integration.

== Support ==

Pour toute question ou support technique :

* **Email :** support@siportevent.com
* **Site officiel :** https://siportevent.com
* **Documentation :** https://siportevent.com/docs/wordpress-plugin

== Crédits ==

Développé par l'équipe SIPORTS pour le Salon International des Ports 2026.

**Partenaires technologiques :**
* React + TypeScript pour l'interface
* WordPress REST API
* Tailwind CSS pour le design
* Intelligence Artificielle pour le matching

== Licence ==

Ce plugin est distribué sous licence GPL v2 ou ultérieure.
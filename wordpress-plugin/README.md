# SIPORTS WordPress Integration Plugin

## 🎯 Description

Plugin WordPress complet pour intégrer l'application React SIPORTS 2026 dans n'importe quel site WordPress.

**40+ shortcodes disponibles** couvrant toutes les fonctionnalités :
- Dashboards (Admin, Exposant, Partenaire, Visiteur)
- Networking & Chat
- Exposants & Mini-sites
- Événements & Calendrier
- Actualités
- Partenaires
- Rendez-vous
- Abonnements
- Et bien plus...

## 🚀 Installation Rapide

```bash
# 1. Build l'application React
cd /home/user/siportv3
npm run build

# 2. Copier dist dans le plugin
cp -r dist/ wordpress-plugin/

# 3. Copier le plugin dans WordPress
cp -r wordpress-plugin/ /var/www/html/wp-content/plugins/siports-integration/

# 4. Activer via l'admin WordPress
```

## ⚙️ Configuration

Ajouter dans `wp-config.php` :

```php
define('SIPORTS_SUPABASE_URL', 'https://votre-projet.supabase.co');
define('SIPORTS_SUPABASE_ANON_KEY', 'votre_anon_key');
```

## 📖 Documentation

Consultez `WORDPRESS-INTEGRATION-GUIDE.md` pour la documentation complète.

## 💡 Exemples

```
<!-- Statistiques -->
[siports_stats show="exhibitors,visitors,countries" animated="true"]

<!-- Exposants -->
[siports_exhibitors layout="grid" limit="12" featured="true"]

<!-- Événements -->
[siports_events type="conference" limit="10"]

<!-- Compte à rebours -->
[siports_countdown style="full"]
```

## 📁 Structure

```
wordpress-plugin/
├── siports-comprehensive-shortcodes.php  # Plugin principal
├── siports-integration.php                # Alternative (ancien)
├── includes/
│   ├── class-siports-complete-api.php    # API Supabase complète
│   ├── class-siports-supabase-api.php    # API Supabase basique
│   └── class-siports-minisites.php       # Gestion mini-sites
├── templates/
│   ├── exhibitors-list.php
│   ├── events-list.php
│   ├── news-list.php
│   └── ... (autres templates)
├── dist/                                  # Build React (à copier)
│   ├── assets/
│   │   ├── index-*.js
│   │   └── index-*.css
│   └── index.html
├── WORDPRESS-INTEGRATION-GUIDE.md         # Documentation complète
└── README.md                              # Ce fichier
```

## 🔧 Fichiers Principaux

| Fichier | Description |
|---------|-------------|
| `siports-comprehensive-shortcodes.php` | **Utilisez ce fichier** - Système complet de shortcodes |
| `siports-integration.php` | Ancien système (compatible) |
| `includes/class-siports-complete-api.php` | API Supabase étendue (toutes les tables) |
| `includes/class-siports-minisites.php` | Gestion spécifique des mini-sites |

## 🎨 Shortcodes Principaux

### Dashboards
- `[siports_admin_dashboard]`
- `[siports_exhibitor_dashboard]`
- `[siports_partner_dashboard]`
- `[siports_visitor_dashboard]`

### Networking
- `[siports_networking]`
- `[siports_chat]`

### Exposants
- `[siports_exhibitors layout="grid" limit="12"]`
- `[siports_exhibitor id="123"]`
- `[siports_exhibitors_search]`

### Événements
- `[siports_events type="conference"]`
- `[siports_events_calendar]`
- `[siports_upcoming_events]`

### Actualités
- `[siports_news category="Innovation"]`
- `[siports_featured_news]`

### Partenaires
- `[siports_partners type="platinum"]`

### Statistiques
- `[siports_stats show="exhibitors,visitors,countries"]`
- `[siports_countdown style="full"]`

Voir `WORDPRESS-INTEGRATION-GUIDE.md` pour la liste complète.

## 🔌 API REST

Le plugin expose aussi une API REST :

```
GET /wp-json/siports/v1/exhibitors
GET /wp-json/siports/v1/events
GET /wp-json/siports/v1/news
GET /wp-json/siports/v1/partners
GET /wp-json/siports/v1/search?q=query
```

## 📦 Compatible Avec

- ✅ WordPress 5.8+
- ✅ PHP 7.4+
- ✅ Elementor
- ✅ Gutenberg
- ✅ WPBakery
- ✅ Divi Builder
- ✅ Tous les page builders majeurs

## 🐛 Dépannage

### Les shortcodes ne fonctionnent pas
→ Vérifier que le plugin est activé et que `dist/` est présent

### Pas de données affichées
→ Vérifier la configuration Supabase dans `wp-config.php`

### Erreur de style
→ Vérifier que `dist/assets/index-*.css` est bien chargé

## 📞 Support

- **Email** : support@siportevent.com
- **Documentation** : WORDPRESS-INTEGRATION-GUIDE.md
- **Issues** : GitHub Issues

## 📄 Licence

Propriétaire - SIPORTS 2026

---

**Version** : 2.0.0
**Dernière mise à jour** : 2025-01-24
**Auteur** : SIPORTS Team

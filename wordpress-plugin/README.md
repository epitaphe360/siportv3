# SIPORTS Integration - Plugin WordPress

**Version:** 1.0.0  
**Testé jusqu'à:** WordPress 6.4  
**Licence:** GPL v2 ou ultérieure  
**Auteur:** SIPORTS Team

## Description

Plugin WordPress officiel pour intégrer l'application SIPORTS 2026 dans votre site WordPress. Ce plugin permet d'afficher tous les composants React de l'application SIPORTS directement dans vos pages WordPress via des shortcodes.

## Fonctionnalités

✅ **14 Shortcodes** pour tous les composants SIPORTS  
✅ **API REST** complète pour synchronisation WordPress ↔ Supabase  
✅ **Création automatique** de pages lors de l'activation  
✅ **Interface d'administration** intuitive  
✅ **Configuration Supabase** intégrée  
✅ **Cache intelligent** pour optimiser les performances  
✅ **Compatible** avec tous les thèmes WordPress modernes  

## Installation

### Méthode 1: Upload ZIP

1. Compresser le dossier `siports-integration/`
2. Dans WordPress Admin: **Plugins > Ajouter > Téléverser**
3. Sélectionner le fichier ZIP
4. Cliquer "Installer maintenant"
5. Activer le plugin

### Méthode 2: FTP

1. Uploader le dossier `siports-integration/` vers `/wp-content/plugins/`
2. Dans WordPress Admin: **Plugins > Plugins installés**
3. Activer "SIPORTS Integration"

## Configuration

Après activation, aller dans **SIPORTS > Paramètres** et renseigner:

- **URL Application React**: `https://siports-2026.vercel.app`
- **URL Supabase**: `https://xxxxx.supabase.co`
- **Clé Supabase Anon**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Shortcodes Disponibles

### Dashboard et Navigation

```
[siports_dashboard]
```
Affiche le tableau de bord complet de l'utilisateur connecté.

```
[siports_navigation]
```
Menu de navigation responsive avec profil utilisateur.

### Événements

```
[siports_events]
[siports_events category="networking" limit="6"]
[siports_events featured="true" view="list"]
```
**Attributs:**
- `category` - Filtrer par catégorie
- `featured` - Afficher uniquement les événements mis en avant
- `limit` - Nombre d'événements (défaut: 12)
- `view` - Type d'affichage: grid, list, carousel

```
[siports_event_detail id="123"]
```
Affiche les détails d'un événement spécifique.

```
[siports_event_form]
[siports_event_form id="123"]
```
Formulaire de création ou édition d'événement.

### Exposants

```
[siports_exhibitors]
[siports_exhibitors category="tech" featured="true"]
```
Liste des exposants avec filtres.

```
[siports_exhibitor_detail id="456"]
```
Profil détaillé d'un exposant.

### Rendez-vous

```
[siports_appointments]
[siports_appointments view="calendar"]
```
**Attributs:**
- `view` - calendar ou list

```
[siports_appointment_booking exhibitor_id="789"]
```
Interface de réservation de rendez-vous.

### Communication

```
[siports_chat]
```
Messagerie instantanée complète.

```
[siports_networking]
```
Module de networking avec suggestions de connexions.

### Authentification

```
[siports_login]
[siports_login redirect="/tableau-de-bord"]
```

```
[siports_register]
[siports_register user_type="visitor"]
```

```
[siports_profile]
```
Formulaire d'édition de profil utilisateur.

## API REST Endpoints

Le plugin expose plusieurs endpoints REST:

### Health Check
```
GET /wp-json/siports/v1/health
```

### Synchronisation Utilisateur
```
POST /wp-json/siports/v1/user/sync
```

### Événements
```
GET /wp-json/siports/v1/events
GET /wp-json/siports/v1/events/{id}
POST /wp-json/siports/v1/events
PUT /wp-json/siports/v1/events/{id}
DELETE /wp-json/siports/v1/events/{id}
```

### Exposants
```
GET /wp-json/siports/v1/exhibitors
GET /wp-json/siports/v1/exhibitors/{id}
```

### Rendez-vous
```
GET /wp-json/siports/v1/appointments
POST /wp-json/siports/v1/appointments
```

## Widgets WordPress

Le plugin inclut 4 widgets pour vos sidebars:

- **SIPORTS Events Widget** - Événements à venir
- **SIPORTS Exhibitors Widget** - Exposants mis en avant
- **SIPORTS Networking Widget** - Suggestions de connexions
- **SIPORTS Stats Widget** - Statistiques utilisateur

## Structure des Fichiers

```
siports-integration/
├── siports-integration.php      # Fichier principal
├── includes/
│   ├── class-shortcodes.php     # Gestion des shortcodes
│   ├── class-api.php            # API REST
│   ├── class-enqueue.php        # Scripts & styles
│   └── class-widgets.php        # Widgets WordPress
├── admin/
│   ├── class-admin.php          # Interface admin
│   └── class-settings.php       # Page de paramètres
└── README.md                    # Ce fichier
```

## Développement

### Hooks Disponibles

**Actions:**
```php
do_action('siports_before_component_render', $component_id, $atts);
do_action('siports_after_component_render', $component_id, $atts);
do_action('siports_user_synced', $user_id, $supabase_user);
```

**Filtres:**
```php
apply_filters('siports_component_atts', $atts, $component_id);
apply_filters('siports_api_response', $response, $endpoint);
apply_filters('siports_cache_duration', 3600);
```

### Exemple d'Extension

```php
// Modifier les attributs d'un composant
add_filter('siports_component_atts', function($atts, $component_id) {
    if ($component_id === 'events') {
        $atts['limit'] = 20; // Afficher 20 événements au lieu de 12
    }
    return $atts;
}, 10, 2);

// Ajouter des actions après synchronisation
add_action('siports_user_synced', function($user_id, $supabase_user) {
    // Envoyer un email de bienvenue
    wp_mail($supabase_user['email'], 'Bienvenue!', 'Votre compte est synchronisé.');
}, 10, 2);
```

## Troubleshooting

### Les shortcodes affichent du texte

**Problème:** `[siports_dashboard]` apparaît tel quel  
**Solution:** 
1. Vérifier que le plugin est activé
2. Vider le cache WordPress
3. Vérifier la configuration dans SIPORTS > Paramètres

### Composants React ne chargent pas

**Problème:** Div vide ou loader infini  
**Solution:**
1. Vérifier l'URL de l'application dans les paramètres
2. Tester l'URL directement dans le navigateur
3. Vérifier la console navigateur (F12) pour erreurs CORS
4. Vérifier que les variables d'environnement Vercel sont correctes

### Erreur 403 Supabase

**Problème:** "Request failed with status 403"  
**Solution:**
1. Vérifier la clé Supabase dans les paramètres
2. Vérifier les RLS (Row Level Security) policies dans Supabase
3. S'assurer que la clé est bien la clé "anon public" et non la clé service

### Cache problématique

**Problème:** Les données ne se mettent pas à jour  
**Solution:**
```php
// Vider le cache SIPORTS
delete_transient('siports_events');
delete_transient('siports_exhibitors');
```

## Prérequis

- **WordPress:** >= 5.8
- **PHP:** >= 7.4
- **Extensions PHP:** json, curl
- **Application React SIPORTS:** Déployée sur Vercel
- **Supabase:** Compte actif avec tables configurées

## Support

- **Documentation complète:** Voir `INSTALLATION_COMPLETE.md` à la racine du projet
- **Problèmes:** Vérifier la section Troubleshooting dans la documentation

## Changelog

### 1.0.0 - 2025-10-30
- ✅ Version initiale
- ✅ 14 shortcodes complets
- ✅ API REST v1
- ✅ Interface d'administration
- ✅ Création automatique de pages
- ✅ Système de cache
- ✅ 4 widgets WordPress

## Licence

Ce plugin est sous licence GPL v2 ou ultérieure.

---

**Développé pour SIPORTS 2026** 🚀

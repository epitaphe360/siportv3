# Programme des Conférences SIPORTS 2026 - WordPress

Ce dossier contient tous les fichiers nécessaires pour intégrer le programme des conférences SIPORTS 2026 dans votre site WordPress.

## 📁 Contenu du dossier

```
wordpress/
├── README.md                                    # Ce fichier
├── GUIDE-IMPORT-ELEMENTOR.md                   # Guide détaillé d'importation
├── programme-conferences-elementor.html        # Page HTML complète
└── siports-conference-shortcode.php            # Plugin WordPress avec shortcodes
```

## 🚀 Démarrage rapide

### Option 1 : Import HTML direct (Plus rapide)
1. Ouvrez le fichier `programme-conferences-elementor.html`
2. Copiez tout le contenu
3. Dans WordPress : Pages → Ajouter → Éditeur de code
4. Collez le contenu et publiez

### Option 2 : Utiliser le plugin shortcode (Plus flexible)
1. Téléchargez le fichier `siports-conference-shortcode.php`
2. Uploadez-le dans `/wp-content/plugins/siports-programme/`
3. Activez le plugin dans WordPress
4. Utilisez les shortcodes dans vos pages :
   - `[siports_programme]` - Programme complet
   - `[siports_jour numero="1"]` - Jour 1 uniquement
   - `[siports_stats]` - Statistiques du programme

### Option 3 : Construction avec Elementor (Plus personnalisable)
Consultez le fichier `GUIDE-IMPORT-ELEMENTOR.md` pour les instructions détaillées.

## 📋 Shortcodes disponibles

### `[siports_programme]`
Affiche le programme complet des 3 jours.

**Paramètres :**
- `jour` : 'all' (défaut), '1', '2', '3'
- `style` : 'cards' (défaut), 'list', 'timeline'

**Exemples :**
```php
// Programme complet
[siports_programme]

// Seulement le jour 2
[siports_programme jour="2"]

// Jour 3 en style liste
[siports_programme jour="3" style="list"]
```

### `[siports_jour]`
Affiche une journée spécifique.

**Paramètres :**
- `numero` : '1', '2', '3'

**Exemples :**
```php
// Jour 1
[siports_jour numero="1"]

// Jour 3
[siports_jour numero="3"]
```

### `[siports_stats]`
Affiche les statistiques du programme (nombre de jours, sessions, intervenants).

**Exemple :**
```php
[siports_stats]
```

## 🎨 Personnalisation

### Couleurs principales
Les couleurs utilisées dans le design :

| Élément | Couleur | Code Hex |
|---------|---------|----------|
| Bleu principal | ![#003366](https://via.placeholder.com/15/003366/003366.png) | `#003366` |
| Bleu secondaire | ![#0066cc](https://via.placeholder.com/15/0066cc/0066cc.png) | `#0066cc` |
| Or Premium | ![#D4AF37](https://via.placeholder.com/15/D4AF37/D4AF37.png) | `#D4AF37` |
| Fond clair | ![#f5f8fc](https://via.placeholder.com/15/f5f8fc/f5f8fc.png) | `#f5f8fc` |

### Modifier les couleurs

**Dans le fichier HTML :**
Trouvez la section `:root` (lignes 8-17) et modifiez les variables CSS :

```css
:root {
    --primary-color: #003366;      /* Votre couleur principale */
    --secondary-color: #0066cc;    /* Votre couleur secondaire */
    --accent-gold: #D4AF37;        /* Votre couleur accent */
    /* ... */
}
```

**Dans le plugin shortcode :**
Créez un fichier CSS personnalisé dans `/wp-content/plugins/siports-programme/assets/css/custom.css`

## 📱 Responsive

La page est entièrement responsive et s'adapte automatiquement à tous les écrans :
- 📱 Mobile (< 768px)
- 📱 Tablette (768px - 1024px)
- 💻 Desktop (> 1024px)

## 🔌 Installation du plugin

### Méthode 1 : Upload manuel
1. Créez un dossier `siports-programme` dans `/wp-content/plugins/`
2. Copiez `siports-conference-shortcode.php` dans ce dossier
3. Renommez-le en `siports-programme.php`
4. Allez dans WordPress → Extensions → Installer
5. Activez "SIPORTS Programme des Conférences"

### Méthode 2 : FTP
1. Connectez-vous à votre serveur via FTP
2. Naviguez vers `/wp-content/plugins/`
3. Créez un dossier `siports-programme`
4. Uploadez `siports-conference-shortcode.php`
5. Renommez en `siports-programme.php`
6. Activez le plugin dans WordPress

## 📊 Structure des données

Le programme est structuré ainsi :

```php
array(
    'date' => '1 Avril 2026',
    'jour_numero' => 1,
    'sessions' => array(
        array(
            'time' => '09:00 – 10:30',
            'title' => 'Titre de la session',
            'type' => 'session',        // session, panel, ceremony, lunch, visit, opening, break
            'premium' => true           // optionnel
        ),
        // ...
    )
)
```

## 🎯 Types de sessions

| Type | Description | Couleur |
|------|-------------|---------|
| `session` | Session classique | Bleu `#0066cc` |
| `panel` | Panel ministériel | Or `#D4AF37` |
| `opening` | Ouverture officielle | Violet `#9333EA` |
| `ceremony` | Cérémonie | Rouge `#DC2626` |
| `lunch` | Déjeuner networking | Vert `#059669` |
| `visit` | Visite | Orange `#EA580C` |
| `break` | Pause | Violet clair `#7C3AED` |

## 🛠️ Modification du programme

### Ajouter une nouvelle session

**Dans le plugin shortcode :**
Modifiez la fonction `siports_get_programme_data()` :

```php
array(
    'time' => '16:00 – 17:30',
    'title' => 'Nouvelle session sur la blockchain maritime',
    'type' => 'session',
    'premium' => false
)
```

**Dans le fichier HTML :**
Copiez une carte de session existante et modifiez :

```html
<div class="session-card session">
    <span class="session-type">Session</span>
    <div class="session-time">⏰ 16:00 – 17:30</div>
    <h3 class="session-title">Nouvelle session sur la blockchain maritime</h3>
</div>
```

### Modifier une session existante
1. Trouvez la session dans le code
2. Modifiez les valeurs (time, title, type)
3. Sauvegardez et actualisez la page

## 🔒 Sécurité

Le plugin inclut :
- ✅ Protection contre l'accès direct
- ✅ Échappement des sorties (`esc_html`, `esc_attr`)
- ✅ Validation des shortcodes
- ✅ Sanitization des paramètres

## 📈 Performances

### Optimisations incluses :
- CSS inline pour réduire les requêtes HTTP
- Chargement conditionnel des styles (seulement si shortcode présent)
- Pas de dépendances externes (jQuery, etc.)
- Images en SVG ou emojis (pas de fichiers lourds)

### Pour améliorer les performances :
1. Activez la mise en cache WordPress
2. Utilisez un CDN
3. Minifiez le CSS si nécessaire
4. Utilisez lazy loading pour les images (si ajoutées)

## 🌐 Compatibilité

### WordPress
- ✅ WordPress 5.0+
- ✅ WordPress 6.0+
- ✅ Gutenberg
- ✅ Classic Editor

### Thèmes
- ✅ Astra
- ✅ GeneratePress
- ✅ OceanWP
- ✅ Divi
- ✅ Avada
- ✅ Tout thème standard WordPress

### Plugins
- ✅ Elementor
- ✅ WPBakery
- ✅ Beaver Builder
- ✅ Yoast SEO
- ✅ Rank Math

## 📝 Exemples d'utilisation

### Sur la page d'accueil
```php
<h2>Découvrez notre programme</h2>
[siports_stats]
<p>Consultez le programme détaillé ci-dessous :</p>
[siports_programme]
```

### Page dédiée par jour
```php
<!-- page-jour-1.php -->
<h1>Programme du 1er Avril 2026</h1>
[siports_jour numero="1"]
<a href="/programme-complet">Voir le programme complet</a>
```

### Dans une sidebar
```php
<!-- sidebar.php -->
<div class="widget">
    <h3>Événement SIPORTS 2026</h3>
    [siports_stats]
    <a href="/programme">Voir le programme →</a>
</div>
```

## 🐛 Dépannage

### Le shortcode ne fonctionne pas
1. Vérifiez que le plugin est activé
2. Vérifiez l'orthographe du shortcode
3. Vérifiez les paramètres (jour="1" et non jour=1)
4. Désactivez les autres plugins pour tester les conflits

### Les styles ne s'appliquent pas
1. Videz le cache WordPress
2. Vérifiez que le CSS n'est pas écrasé par votre thème
3. Ajoutez `!important` aux styles si nécessaire
4. Vérifiez la console du navigateur pour les erreurs

### La page est lente
1. Activez un plugin de cache
2. Optimisez les images
3. Utilisez un CDN
4. Vérifiez les autres plugins lourds

## 📞 Support

Pour toute question ou problème :
1. Consultez d'abord le `GUIDE-IMPORT-ELEMENTOR.md`
2. Vérifiez la section Dépannage ci-dessus
3. Contactez l'équipe technique SIPORTS

## 📄 Licence

Ce code est fourni sous licence GPL v2 ou ultérieure.

## 🔄 Changelog

### Version 1.0.0 (Décembre 2025)
- ✨ Création initiale
- ✅ Programme complet 1-3 Avril 2026
- ✅ Support shortcodes
- ✅ Design responsive
- ✅ Compatible Elementor

---

**Créé pour SIPORTS 2026** 🚢
*Salon International des Ports d'Afrique*

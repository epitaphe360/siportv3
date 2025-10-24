# Page Exposants - Guide d'Installation Complet

## 📋 Vue d'ensemble

Cette page WordPress élégante affiche la liste complète des exposants SIPORT 2026 avec :
- ✅ Design moderne et professionnel
- ✅ Filtres interactifs (secteur, pays, recherche, exposants vedettes)
- ✅ Vues multiples (grille/liste)
- ✅ Animations fluides
- ✅ 100% Responsive
- ✅ Intégration automatique avec vos données Supabase

---

## 🚀 Installation Rapide

### Étape 1: Copier le Template

Copiez le template dans votre thème WordPress actif :

```bash
# Depuis le dossier du plugin
cp wordpress-plugin/templates/page-exposants.php /path/to/wp-content/themes/YOUR-THEME/

# Ou créez un dossier templates dans votre thème si nécessaire
mkdir -p /path/to/wp-content/themes/YOUR-THEME/templates/
cp wordpress-plugin/templates/page-exposants.php /path/to/wp-content/themes/YOUR-THEME/templates/
```

**Note:** Remplacez `YOUR-THEME` par le nom de votre thème actif (par exemple: `twentytwentyfour`, `astra`, `oceanwp`, etc.)

### Étape 2: Vérifier les Assets

Les assets CSS et JavaScript sont automatiquement chargés par le plugin. Assurez-vous que le plugin SIPORTS est activé.

Vérifiez que ces fichiers existent :
```
wordpress-plugin/
├── assets/
│   ├── css/
│   │   └── page-exposants.css
│   └── js/
│       └── page-exposants.js
```

### Étape 3: Créer la Page dans WordPress

1. Connectez-vous à l'admin WordPress
2. Allez dans **Pages → Ajouter**
3. Donnez un titre : **"Nos Exposants"** ou **"Liste des Exposants"**
4. Dans la sidebar droite, sous **Attributs de page**, sélectionnez le template : **"SIPORTS - Liste des Exposants"**
5. Publiez la page

**C'est tout !** La page est maintenant prête et fonctionnelle.

---

## 🎨 Personnalisation

### Modifier les Couleurs

Éditez `/wordpress-plugin/assets/css/page-exposants.css` et modifiez les variables CSS :

```css
:root {
    --siports-primary: #0066CC;        /* Couleur principale */
    --siports-secondary: #FF6B35;      /* Couleur secondaire */
    --siports-accent: #00D4AA;         /* Couleur accent */
    --siports-dark: #1A2332;           /* Couleur sombre */
}
```

### Modifier le Hero Section

Éditez `/templates/page-exposants.php` ligne 14-35 :

```php
<h1 class="hero-title">Nos Exposants</h1>
<p class="hero-subtitle">
    Découvrez les leaders de l'industrie portuaire...
</p>
```

### Ajouter des Filtres Personnalisés

Dans `/templates/page-exposants.php`, ajoutez un nouveau groupe de filtres :

```php
<div class="filter-group">
    <label for="custom-filter" class="filter-label">
        Votre Filtre
    </label>
    <select id="custom-filter" class="filter-select">
        <option value="">Tous</option>
        <option value="option1">Option 1</option>
    </select>
</div>
```

Puis ajoutez la logique dans `/assets/js/page-exposants.js` :

```javascript
// Ajouter dans state.filters
customFilter: ''

// Ajouter le gestionnaire
function handleCustomFilterChange(e) {
    state.filters.customFilter = e.target.value;
    applyFilters();
}

// Attacher l'événement
document.querySelector('#custom-filter')
    .addEventListener('change', handleCustomFilterChange);
```

---

## 📊 Configuration des Données

### Exposants avec Secteurs

Pour que les filtres de secteur fonctionnent, vos exposants dans Supabase doivent avoir un champ `sector` :

```sql
-- Exemple de structure
ALTER TABLE exhibitors ADD COLUMN sector VARCHAR(100);
UPDATE exhibitors SET sector = 'port-operations' WHERE ...;
```

Secteurs disponibles par défaut :
- `port-operations` - Opérations Portuaires
- `logistics` - Logistique & Transport
- `maritime-services` - Services Maritimes
- `equipment` - Équipements & Technologies
- `consulting` - Conseil & Formation
- `digital` - Digital & Innovation
- `security` - Sécurité & Sûreté
- `environment` - Environnement & Durabilité

### Exposants avec Pays

Ajoutez un champ `country` :

```sql
ALTER TABLE exhibitors ADD COLUMN country VARCHAR(100);
UPDATE exhibitors SET country = 'Maroc' WHERE ...;
```

### Exposants Vedettes

Ajoutez un champ `featured` pour marquer les exposants vedettes :

```sql
ALTER TABLE exhibitors ADD COLUMN featured BOOLEAN DEFAULT false;
UPDATE exhibitors SET featured = true WHERE id IN (1, 5, 12, ...);
```

---

## 🔧 Intégration avec le Shortcode

Le template utilise le shortcode `[siports_exhibitors]` en interne. Vous pouvez personnaliser ses paramètres :

```php
<!-- Dans page-exposants.php, ligne ~102 -->
<?php echo do_shortcode('[siports_exhibitors layout="grid" limit="100" show_search="false"]'); ?>
```

Paramètres disponibles :
- `layout` : `grid` ou `list`
- `limit` : Nombre d'exposants à afficher
- `sector` : Filtrer par secteur
- `category` : Filtrer par catégorie
- `featured` : `true` pour afficher uniquement les vedettes
- `show_search` : `true` ou `false`

---

## 🎯 Fonctionnalités Avancées

### Raccourcis Clavier

La page inclut des raccourcis clavier pratiques :

- **Ctrl+K** ou **Cmd+K** : Focus sur la recherche
- **Escape** : Réinitialiser les filtres ou quitter la recherche

### API JavaScript Publique

Vous pouvez contrôler la page via JavaScript :

```javascript
// Réinitialiser tous les filtres
SIPORTSExhibitors.resetFilters();

// Appliquer un filtre personnalisé
SIPORTSExhibitors.applyCustomFilter(function(card) {
    // Retourner true pour afficher, false pour masquer
    return card.getAttribute('data-company').includes('port');
});

// Obtenir l'état actuel
const state = SIPORTSExhibitors.getState();
console.log(state.filters);
```

### Ajouter des Data Attributes aux Cartes

Pour améliorer le filtrage, ajoutez des attributs aux cartes d'exposants.

Modifiez le template `/wordpress-plugin/templates/exhibitors-list.php` :

```php
<div class="siports-exhibitor-card"
     data-sector="<?php echo esc_attr($exhibitor['sector']); ?>"
     data-country="<?php echo esc_attr($exhibitor['country']); ?>"
     data-featured="<?php echo $exhibitor['featured'] ? 'true' : 'false'; ?>">
    <!-- Contenu de la carte -->
</div>
```

---

## 📱 Responsive Design

La page est entièrement responsive avec des breakpoints :

- **Desktop** : > 1024px (vue grille complète)
- **Tablet** : 768px - 1024px (vue grille adaptée)
- **Mobile** : < 768px (vue liste empilée)
- **Small Mobile** : < 480px (vue optimisée)

### Tester le Responsive

Testez sur différents appareils ou utilisez les DevTools :

1. Ouvrez Chrome DevTools (F12)
2. Cliquez sur l'icône mobile (Ctrl+Shift+M)
3. Testez différentes tailles d'écran

---

## 🔍 SEO et Performance

### Optimisations Incluses

✅ **HTML Sémantique** - Balises appropriées pour le SEO
✅ **Schema.org** - Métadonnées structurées (à ajouter si besoin)
✅ **Lazy Loading** - Images chargées à la demande
✅ **CSS Optimisé** - Fichiers minifiés en production
✅ **Animations Performantes** - GPU-accelerated transforms

### Ajouter Schema.org

Pour améliorer le SEO, ajoutez des données structurées :

```php
<!-- À ajouter dans page-exposants.php -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Exposants SIPORT 2026",
  "description": "Liste des exposants au salon SIPORT 2026",
  "numberOfItems": <?php echo count($exhibitors); ?>,
  "itemListElement": [
    <?php foreach ($exhibitors as $index => $exhibitor): ?>
    {
      "@type": "Organization",
      "position": <?php echo $index + 1; ?>,
      "name": "<?php echo esc_js($exhibitor['company_name']); ?>",
      "url": "<?php echo esc_url($exhibitor['website']); ?>"
    }<?php if ($index < count($exhibitors) - 1) echo ','; ?>
    <?php endforeach; ?>
  ]
}
</script>
```

---

## 🐛 Dépannage

### Les Filtres ne Fonctionnent Pas

**Cause** : Le JavaScript n'est pas chargé correctement.

**Solution** :
1. Vérifiez que le plugin SIPORTS est activé
2. Ouvrez la console du navigateur (F12) et cherchez des erreurs
3. Vérifiez que `/assets/js/page-exposants.js` existe
4. Videz le cache du navigateur (Ctrl+Shift+R)

### Les Styles ne s'Appliquent Pas

**Cause** : Conflit avec le thème ou le CSS n'est pas chargé.

**Solution** :
1. Vérifiez que `/assets/css/page-exposants.css` existe
2. Inspectez l'élément (F12) et vérifiez si les classes CSS sont présentes
3. Augmentez la spécificité CSS si nécessaire :
   ```css
   body .siports-exposants-page .hero-title {
       /* Vos styles */
   }
   ```
4. Désactivez temporairement les autres plugins pour identifier les conflits

### Les Données ne s'Affichent Pas

**Cause** : Problème de connexion Supabase ou shortcode mal configuré.

**Solution** :
1. Vérifiez les credentials Supabase dans `wp-config.php`
2. Testez le shortcode seul sur une page de test :
   ```
   [siports_exhibitors limit="5"]
   ```
3. Vérifiez les logs d'erreur PHP : `wp-content/debug.log`
4. Activez le mode debug WordPress :
   ```php
   define('WP_DEBUG', true);
   define('WP_DEBUG_LOG', true);
   ```

### Le Template n'Apparaît Pas dans la Liste

**Cause** : Le fichier n'est pas au bon endroit ou le cache de WordPress.

**Solution** :
1. Vérifiez que le fichier est bien dans `/wp-content/themes/YOUR-THEME/`
2. Le fichier doit commencer par :
   ```php
   <?php
   /**
    * Template Name: SIPORTS - Liste des Exposants
    */
   ```
3. Reconnectez-vous à l'admin WordPress
4. Videz le cache si vous utilisez un plugin de cache

---

## 🎨 Exemples d'Utilisation

### Exemple 1 : Page Simple

```php
<!-- Utilisation minimale -->
<?php
/*
 * Template Name: Exposants Simple
 */
get_header();
?>

<div class="container">
    <h1>Nos Exposants</h1>
    <?php echo do_shortcode('[siports_exhibitors layout="grid" limit="12"]'); ?>
</div>

<?php get_footer(); ?>
```

### Exemple 2 : Page avec Sidebar

```php
<!-- Page avec sidebar WordPress -->
<?php get_header(); ?>

<div class="content-sidebar-wrap">
    <main class="content">
        <?php echo do_shortcode('[siports_exhibitors]'); ?>
    </main>

    <aside class="sidebar">
        <?php dynamic_sidebar('primary-sidebar'); ?>
    </aside>
</div>

<?php get_footer(); ?>
```

### Exemple 3 : Intégration Elementor

Si vous utilisez Elementor :

1. Créez une nouvelle page avec Elementor
2. Ajoutez un widget **Shortcode**
3. Insérez : `[siports_exhibitors layout="grid" limit="20"]`
4. Stylisez avec les options Elementor

---

## 📦 Structure des Fichiers

```
wordpress-plugin/
├── templates/
│   └── page-exposants.php          # Template principal à copier dans votre thème
├── assets/
│   ├── css/
│   │   └── page-exposants.css      # Styles élégants
│   └── js/
│       └── page-exposants.js       # Interactions et filtres
├── includes/
│   └── class-siports-complete-api.php  # API Supabase
├── siports-comprehensive-shortcodes.php  # Plugin principal
└── docs/
    └── PAGE-EXPOSANTS-INSTALLATION.md   # Ce fichier
```

---

## 🔄 Mises à Jour

### Mettre à Jour le Template

Quand vous mettez à jour le plugin :

1. **Sauvegardez** vos personnalisations
2. Comparez l'ancien et le nouveau template :
   ```bash
   diff /theme/templates/page-exposants.php /plugin/templates/page-exposants.php
   ```
3. Fusionnez les modifications importantes
4. Testez sur un environnement de staging

### Versionning Recommandé

Ajoutez un commentaire de version dans votre template :

```php
/**
 * Template Name: SIPORTS - Liste des Exposants
 * Version: 1.0.0
 * Last Updated: 2024-01-15
 */
```

---

## 💡 Conseils Pro

### Performance

1. **Limitez le nombre d'exposants** affichés initialement (50-100 max)
2. **Implémentez la pagination** pour grandes listes
3. **Utilisez un CDN** pour les images des logos
4. **Optimisez les images** (WebP, compression)
5. **Activez le cache** WordPress (W3 Total Cache, WP Rocket)

### UX

1. **Ajoutez des filtres pertinents** pour votre audience
2. **Affichez le nombre de résultats** après filtrage
3. **Sauvegardez les filtres** dans l'URL pour partage
4. **Ajoutez un export PDF/CSV** des exposants filtrés
5. **Intégrez Google Analytics** pour tracker les filtres populaires

### Accessibilité

1. **Testez avec un lecteur d'écran** (NVDA, JAWS)
2. **Assurez-vous du contraste** des couleurs (WCAG AA)
3. **Navigation au clavier** complète
4. **Labels ARIA** sur les filtres interactifs
5. **Textes alternatifs** sur toutes les images

---

## 📞 Support

Si vous rencontrez des problèmes :

1. **Consultez la FAQ** ci-dessus
2. **Vérifiez la console** du navigateur (F12)
3. **Activez le mode debug** WordPress
4. **Contactez l'équipe** technique SIPORTS

---

## 📝 Changelog

### Version 1.0.0 (2024-01-15)
- ✅ Première version de la page exposants
- ✅ Design élégant et professionnel
- ✅ Filtres interactifs complets
- ✅ Vue grille et liste
- ✅ Responsive design complet
- ✅ Animations fluides
- ✅ API JavaScript publique

---

**Développé avec ❤️ pour SIPORT 2026 - Casablanca, Maroc**

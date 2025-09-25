# Guide de Dépannage WordPress pour SIPORTS

## Problème Actuel
Chaque plugin SIPORTS cause une "erreur critique" sur le site WordPress.

## Solutions à Essayer

### 1. Vérifier la Configuration PHP

WordPress nécessite PHP 7.4 ou supérieur. Votre hébergement utilise peut-être une version trop ancienne.

**Comment vérifier:**
- Créez un fichier `phpinfo.php` avec ce contenu:
```php
<?php phpinfo(); ?>
```
- Téléchargez-le sur votre serveur et visitez-le dans votre navigateur
- Vérifiez la version de PHP (elle doit être au moins 7.4)

### 2. Activer le Mode Debug WordPress

Ajoutez ces lignes dans votre fichier `wp-config.php` juste avant la ligne `/* That's all, stop editing! */`:

```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true); 
define('WP_DEBUG_DISPLAY', false);
```

Ensuite, essayez d'activer à nouveau le plugin minimal. Les erreurs seront enregistrées dans `wp-content/debug.log`.

### 3. Problèmes d'Accès Fichiers

Parfois, WordPress ne peut pas créer ou lire certains fichiers en raison des permissions.

**Solution:**
- Vérifiez que le dossier `wp-content/plugins` a les permissions 755
- Vérifiez que les fichiers du plugin ont les permissions 644

### 4. Problèmes de Mémoire PHP

WordPress peut manquer de mémoire PHP.

**Solution:**
Ajoutez cette ligne dans votre `wp-config.php`:

```php
define('WP_MEMORY_LIMIT', '256M');
```

### 5. Problèmes avec les Formats de Texte

Parfois, des caractères invisibles dans les fichiers PHP causent des erreurs.

**Solution:**
- Assurez-vous que tous les fichiers PHP sont enregistrés au format UTF-8 sans BOM

### 6. Faire un Test Direct

Créez un plugin qui affiche juste "Hello World" et testez-le.

```php
<?php
/**
 * Plugin Name: Hello Test
 * Description: Simple test
 * Version: 1.0
 */

function hello_test_shortcode() {
    return 'Hello World';
}
add_shortcode('hello_test', 'hello_test_shortcode');
?>
```

### 7. Contacter Votre Hébergeur

Si aucune des solutions ci-dessus ne fonctionne, contactez votre hébergeur pour:
- Vérifier les logs d'erreurs du serveur
- Confirmer que PHP est correctement configuré
- Vérifier si des restrictions de sécurité bloquent certaines fonctionnalités

## Informations à Partager

Lorsque vous obtenez le fichier `debug.log`, partagez-le pour obtenir une aide plus spécifique.

# SIPORTS WordPress Integration - Guide de dépannage

## 🚨 Erreur critique détectée

Si vous voyez l'erreur "Il y a eu une erreur critique sur ce site", suivez ce guide pour diagnostiquer et résoudre le problème.

## 📋 Outils de diagnostic inclus

Le plugin mis à jour inclut maintenant plusieurs outils de diagnostic :

### 1. Mode Debug
Ajoutez `?siports_debug=1` à n'importe quelle URL pour voir :
- Informations système détaillées
- Erreurs PHP capturées
- État des assets
- Configuration Supabase

### 2. Mode Recovery
Ajoutez `?siports_recovery=1` à n'importe quelle URL pour :
- Désactiver temporairement le plugin SIPORTS
- Restaurer l'accès au site
- Réactiver plus tard

### 3. Script de diagnostic
Exécutez `diagnose.php` depuis la racine WordPress pour un rapport complet.

## 🔍 Causes communes d'erreur critique

### 1. **Version PHP incompatible**
- **Symptôme** : Erreur fatale au chargement
- **Solution** : PHP 8.1+ requis
- **Vérification** : Ajoutez `?siports_debug=1` pour voir la version PHP

### 2. **Assets manquants**
- **Symptôme** : Plugin actif mais interface vide
- **Solution** : Reconstruire et copier les assets
```bash
npm run build
cp -r dist/* wordpress-plugin/dist/
```

### 3. **Mémoire insuffisante**
- **Symptôme** : Erreur "Allowed memory size exhausted"
- **Solution** : Augmenter la mémoire dans wp-config.php
```php
define('WP_MEMORY_LIMIT', '256M');
define('WP_MAX_MEMORY_LIMIT', '512M');
```

### 4. **Configuration Supabase manquante**
- **Symptôme** : App se charge mais affiche erreur Supabase
- **Solution** : Définir les constantes dans wp-config.php
```php
define('SIPORTS_SUPABASE_URL', 'https://votre-project.supabase.co');
define('SIPORTS_SUPABASE_ANON_KEY', 'votre-cle-anon');
```

### 5. **Conflit avec d'autres plugins**
- **Symptôme** : Erreur après activation d'un autre plugin
- **Solution** : Désactiver temporairement avec `?siports_recovery=1`

## 🛠️ Procédure de dépannage étape par étape

### Étape 1 : Accès d'urgence
1. Ajoutez `?siports_recovery=1` à votre URL d'admin
2. Cela désactive temporairement SIPORTS
3. Votre site redevient accessible

### Étape 2 : Diagnostic
1. Ajoutez `?siports_debug=1` à une page
2. Notez toutes les informations affichées
3. Vérifiez particulièrement :
   - Version PHP
   - Présence des assets
   - Configuration Supabase
   - Erreurs PHP

### Étape 3 : Correction
Selon les erreurs trouvées :

**Si PHP < 8.1 :**
- Contactez votre hébergeur pour mettre à jour PHP

**Si assets manquants :**
```bash
cd votre-projet-siports
npm install
npm run build
cp -r dist/* wordpress-plugin/dist/
```

**Si mémoire insuffisante :**
Ajoutez à wp-config.php :
```php
define('WP_MEMORY_LIMIT', '256M');
define('WP_MAX_MEMORY_LIMIT', '512M');
```

**Si config Supabase manquante :**
Ajoutez à wp-config.php :
```php
define('SIPORTS_SUPABASE_URL', 'https://votre-project.supabase.co');
define('SIPORTS_SUPABASE_ANON_KEY', 'votre-cle-anon');
```

### Étape 4 : Test
1. Supprimez les paramètres `?siports_debug=1` et `?siports_recovery=1`
2. Rechargez le plugin SIPORTS
3. Testez les shortcodes `[siports_networking]` et `[siports_exhibitor_dashboard]`

## 📁 Fichiers de log

Les erreurs sont automatiquement loggées dans :
- `wp-content/debug.log` (erreurs WordPress générales)
- `wp-content/siports-errors.log` (erreurs spécifiques à SIPORTS)

## 🚑 Support d'urgence

Si le problème persiste :

1. **Désactivez complètement SIPORTS** avec `?siports_recovery=1`
2. **Vérifiez les logs** pour les erreurs détaillées
3. **Contactez le support** avec :
   - Le rapport de diagnostic (`?siports_debug=1`)
   - Les logs d'erreur
   - Votre configuration PHP/WordPress

## 📦 Contenu du plugin mis à jour

- `siports-integration.php` - Plugin principal
- `siports-recovery.php` - Outils de debug et recovery
- `diagnose.php` - Script de diagnostic rapide
- `wp-config-example.php` - Configuration recommandée
- `dist/` - Assets React compilés

## 🔄 Mise à jour du plugin

1. Téléchargez `siports-integration-with-debug.zip`
2. Désactivez l'ancien plugin SIPORTS
3. Supprimez l'ancien plugin
4. Installez le nouveau ZIP
5. Activez le nouveau plugin

---

**Note importante** : Le mode recovery (`?siports_recovery=1`) est temporaire. Supprimez ce paramètre pour réactiver SIPORTS une fois les problèmes résolus.

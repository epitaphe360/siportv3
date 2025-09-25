# Guide d'intégration des shortcodes SIPORTS dans Elementor

Ce guide explique comment insérer correctement les shortcodes SIPORTS dans un site WordPress utilisant Elementor.

## Étape 1: Installation du plugin SIPORTS

1. Dans le panneau d'administration WordPress, allez à **Plugins > Ajouter**
2. Cliquez sur **Importer** et sélectionnez le fichier `siports-elementor.zip`
3. Activez le plugin après l'installation

## Étape 2: Ajout des shortcodes dans Elementor

1. Éditez la page où vous souhaitez ajouter l'application SIPORTS avec Elementor
2. **Important**: Utilisez le widget **"Shortcode"** d'Elementor:
   - Cherchez "Shortcode" dans la liste des widgets
   - Glissez-le dans votre section ou colonne

3. Pour l'application de networking:
   - Insérez `[siports_networking]` dans le champ du widget Shortcode
   
4. Pour le tableau de bord exposant:
   - Insérez `[siports_exhibitor_dashboard]` dans le champ du widget Shortcode

![Exemple d'insertion de shortcode](https://example.com/shortcode-elementor.jpg)

## Étape 3: Configuration avancée d'Elementor (important)

Pour assurer le bon fonctionnement des scripts React:

1. Allez dans **Elementor > Réglages > Avancé**
2. Activez l'option **"Scripts jQuery en pied de page"**
3. Désactivez les options de minification CSS/JS si activées
4. Enregistrez les changements

## Étape 4: Vérification

1. Prévisualisez la page pour vérifier que l'application SIPORTS s'affiche correctement
2. Vérifiez la console du navigateur (F12) pour détecter d'éventuelles erreurs
3. Si l'application ne s'affiche pas, essayez d'ajouter le shortcode directement dans un bloc HTML standard

## Dépannage

Si vous rencontrez des problèmes:

1. **L'application ne s'affiche pas**: 
   - Vérifiez que vous utilisez bien le widget Shortcode d'Elementor
   - Vérifiez que le shortcode est correctement tapé `[siports_networking]`

2. **Erreur critique WordPress**:
   - Activez le mode debug WordPress (wp-config.php)
   - Vérifiez la version PHP (doit être 7.4+)
   - Assurez-vous qu'Elementor est à jour

3. **Scripts non chargés**:
   - Essayez de désactiver les plugins de cache/optimisation
   - Vérifiez que les fichiers React sont bien présents dans le dossier dist/assets

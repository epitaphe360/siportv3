# Guide d'import du fichier JSON Elementor

## 📋 Instructions d'importation

### Prérequis
- ✅ WordPress installé
- ✅ Plugin Elementor installé et activé (version gratuite suffit)
- ✅ Accès administrateur WordPress

---

## 🚀 Méthode d'import du fichier JSON

### Étape 1 : Télécharger le fichier JSON
1. Localisez le fichier `programme-conferences-elementor.json`
2. Téléchargez-le sur votre ordinateur

### Étape 2 : Créer une nouvelle page
1. Connectez-vous à votre tableau de bord WordPress
2. Allez dans **Pages** → **Ajouter**
3. Donnez un titre : "Programme des Conférences SIPORTS 2026"
4. Cliquez sur **Modifier avec Elementor**

### Étape 3 : Importer le template
1. Dans l'éditeur Elementor, cliquez sur l'icône **dossier** (📁) en bas à gauche
2. Cliquez sur l'onglet **Modèles** (Templates)
3. Cliquez sur le bouton **Importer des modèles** en haut
4. Sélectionnez le fichier `programme-conferences-elementor.json`
5. Cliquez sur **Importer maintenant**

### Étape 4 : Appliquer le template
1. Une fois importé, le template apparaîtra dans votre bibliothèque
2. Cherchez "Programme des Conférences SIPORTS 2026"
3. Cliquez sur **Insérer**
4. Le template sera appliqué à votre page

### Étape 5 : Publier
1. Vérifiez que tout s'affiche correctement
2. Cliquez sur **Mettre à jour** ou **Publier**
3. Votre page est prête ! 🎉

---

## 🎨 Personnalisation après import

### Modifier les couleurs

1. **Sélectionner une section**
   - Cliquez sur la section que vous voulez modifier
   - Dans le panneau de gauche, allez dans **Style** → **Arrière-plan**

2. **Changer les couleurs principales**
   - Bleu principal : `#003366` → Votre couleur
   - Bleu secondaire : `#0066cc` → Votre couleur
   - Or Premium : `#D4AF37` → Votre couleur

3. **Modifier les dégradés**
   - Section Hero : Style → Arrière-plan → Type : Dégradé
   - Couleur A : `#003366`
   - Couleur B : `#0066cc`
   - Angle : 135°

### Modifier les textes

1. **Cliquer sur le texte** à modifier
2. **Éditer directement** dans le panneau de gauche
3. **Sauvegarder** les modifications

### Ajouter/Supprimer des sessions

1. **Dupliquer une carte de session**
   - Survolez la carte
   - Clic droit → Dupliquer
   - Modifier le contenu

2. **Supprimer une session**
   - Survolez la carte
   - Clic droit → Supprimer

### Modifier le lien du bouton CTA

1. Cliquez sur le bouton "OBTENIR MON PASS PREMIUM"
2. Dans le panneau de gauche, section **Contenu**
3. Modifiez le **Lien** : `/visitor/subscription`
4. Changez en votre URL d'inscription

---

## 📱 Paramètres responsive

Le template est déjà responsive, mais vous pouvez ajuster :

### Mode Mobile
1. Cliquez sur l'icône **responsive** en bas de l'éditeur
2. Sélectionnez **Mobile**
3. Ajustez les tailles de police, espacements, etc.

### Mode Tablette
1. Cliquez sur l'icône **responsive**
2. Sélectionnez **Tablette**
3. Ajustez si nécessaire

---

## 🔧 Résolution de problèmes

### Le fichier JSON ne s'importe pas

**Problème** : Message d'erreur lors de l'import

**Solutions** :
1. Vérifiez que vous utilisez Elementor (pas un autre page builder)
2. Mettez à jour Elementor à la dernière version
3. Vérifiez que le fichier n'est pas corrompu
4. Essayez de réimporter
5. Utilisez la méthode HTML alternative (voir `GUIDE-IMPORT-ELEMENTOR.md`)

### Les styles ne s'appliquent pas correctement

**Problème** : Les couleurs ou espacements sont différents

**Solutions** :
1. Videz le cache WordPress (WP Super Cache, W3 Total Cache, etc.)
2. Videz le cache Elementor : Elementor → Outils → Régénérer CSS
3. Vérifiez que votre thème n'écrase pas les styles
4. Ajoutez `!important` aux CSS personnalisés si nécessaire

### Les boutons "JOUR X" ne s'affichent pas comme des badges

**Problème** : Les badges apparaissent comme des boutons normaux

**Solutions** :
1. Sélectionnez le widget bouton
2. Allez dans **Avancé** → **CSS personnalisé**
3. Ajoutez :
```css
selector {
    pointer-events: none;
    cursor: default;
}
```

### Les cartes de session ne sont pas alignées

**Problème** : Les cartes semblent désalignées

**Solutions** :
1. Vérifiez la largeur des colonnes (devrait être 100%)
2. Ajustez les marges : Avancé → Marge → Définir manuellement
3. Vérifiez le padding de la section

---

## 📊 Structure du JSON

Le fichier JSON contient :

```
Programme Complet
├── Hero Section (En-tête bleu dégradé)
│   ├── Titre principal
│   ├── Sous-titre
│   ├── Dates
│   └── Localisation
├── Intro Section (Texte de présentation)
├── Jour 1 Section (1 Avril 2026)
│   ├── Badge "JOUR 1"
│   ├── Date
│   └── 5 Sessions/Événements
├── Jour 2 Section (2 Avril 2026)
│   ├── Badge "JOUR 2"
│   ├── Date
│   └── 6 Sessions/Événements
├── Jour 3 Section (3 Avril 2026)
│   ├── Badge "JOUR 3"
│   ├── Date
│   └── 5 Sessions/Événements
└── CTA Section (Call-to-Action)
    ├── Titre
    ├── Description
    └── Bouton Premium
```

---

## 🎯 Types de widgets utilisés

| Widget | Utilisation |
|--------|-------------|
| **Heading** | Titres de sections, dates |
| **Text Editor** | Descriptions, cartes de sessions (HTML) |
| **Button** | Badges journées, bouton CTA |
| **Section** | Conteneurs principaux |
| **Column** | Colonnes de mise en page |

---

## 💾 Exporter vos modifications

Si vous avez modifié le template et voulez le sauvegarder :

1. Dans l'éditeur Elementor, cliquez sur l'icône **flèche vers le haut** (↑)
2. Cliquez sur **Exporter le template**
3. Choisissez un nom
4. Téléchargez le fichier JSON
5. Conservez-le en sécurité

---

## 🔄 Mettre à jour le programme

### Pour ajouter une nouvelle session :

1. **Localisez le jour** concerné dans l'éditeur
2. **Dupliquez une carte** de session existante
3. **Modifiez le contenu** :
   - Type de session (badge)
   - Horaire
   - Titre
4. **Ajustez la couleur** de la bordure si nécessaire
5. **Sauvegardez**

### Codes couleur des bordures :

```css
Session normale : #0066cc
Panel ministériel : #D4AF37
Ouverture officielle : #9333EA
Cérémonie : #DC2626
Déjeuner networking : #059669
Visite : #EA580C
Pause : #7C3AED
```

Pour changer la couleur :
1. Éditez le HTML de la carte
2. Trouvez `border-left: 5px solid #COULEUR`
3. Remplacez `#COULEUR` par le code souhaité

---

## 🌐 SEO et Métadonnées

Après import, n'oubliez pas de configurer :

### Yoast SEO / Rank Math
1. **Meta Title** : "Programme des Conférences SIPORTS 2026 | El Jadida"
2. **Meta Description** : "Découvrez le programme complet du Salon International des Ports d'Afrique 2026. 3 jours de conférences, panels ministériels et networking (1-3 Avril, El Jadida, Maroc)"
3. **URL** : `/programme-conferences` ou `/programme`
4. **Mot-clé principal** : "programme SIPORTS 2026"

### Open Graph (réseaux sociaux)
1. **Titre OG** : Programme des Conférences SIPORTS 2026
2. **Description OG** : 3 jours d'échanges stratégiques sur l'avenir des ports africains
3. **Image OG** : Ajoutez une image de couverture (1200x630px)

---

## ✅ Checklist post-import

- [ ] Le template s'affiche correctement sur Desktop
- [ ] Le template s'affiche correctement sur Mobile
- [ ] Le template s'affiche correctement sur Tablette
- [ ] Toutes les couleurs sont correctes
- [ ] Les textes sont sans fautes
- [ ] Le bouton CTA pointe vers la bonne URL
- [ ] Les badges Premium sont visibles sur les déjeuners
- [ ] Les métadonnées SEO sont configurées
- [ ] Le cache a été vidé
- [ ] La page se charge rapidement (< 3 secondes)
- [ ] Testé sur différents navigateurs (Chrome, Firefox, Safari)

---

## 🆘 Alternatives si l'import JSON échoue

### Option 1 : Import HTML
Utilisez le fichier `programme-conferences-elementor.html`
- Consultez le guide `GUIDE-IMPORT-ELEMENTOR.md`

### Option 2 : Construction manuelle
Reconstruisez la page manuellement avec Elementor
- Consultez le guide `GUIDE-IMPORT-ELEMENTOR.md` section "Méthode 2"

### Option 3 : Plugin shortcode
Utilisez le plugin WordPress avec shortcodes
- Consultez `README.md` pour l'installation

---

## 📞 Support

Pour toute question concernant l'import :
1. Vérifiez la documentation Elementor officielle
2. Consultez les autres guides dans ce dossier
3. Contactez le support technique SIPORTS

---

## 🔐 Compatibilité

### Versions testées :
- ✅ WordPress 5.8+
- ✅ WordPress 6.0+
- ✅ Elementor Free 3.0+
- ✅ Elementor Pro 3.0+ (optionnel)

### Thèmes compatibles :
- ✅ Astra
- ✅ GeneratePress
- ✅ OceanWP
- ✅ Hello Elementor (recommandé)
- ✅ Kadence
- ✅ Neve

---

**Créé pour SIPORTS 2026** 🚢
*Import facile en 5 minutes !*

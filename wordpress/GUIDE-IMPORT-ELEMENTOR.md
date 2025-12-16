# Guide d'importation de la page Programme des Conférences dans WordPress Elementor

## 📋 Table des matières
1. [Méthode 1 : Import HTML direct dans Elementor](#méthode-1--import-html-direct)
2. [Méthode 2 : Construction manuelle avec Elementor](#méthode-2--construction-manuelle)
3. [Méthode 3 : Utilisation du code HTML personnalisé](#méthode-3--code-html-personnalisé)

---

## Méthode 1 : Import HTML direct dans Elementor

### Étape 1 : Créer une nouvelle page
1. Connectez-vous à votre tableau de bord WordPress
2. Allez dans **Pages** → **Ajouter**
3. Donnez le titre : "Programme des Conférences SIPORTS 2026"
4. Cliquez sur **Modifier avec Elementor**

### Étape 2 : Ajouter le HTML
1. Dans l'éditeur Elementor, cherchez le widget **HTML**
2. Glissez-déposez le widget HTML sur la page
3. Ouvrez le fichier `programme-conferences-elementor.html`
4. Copiez tout le contenu du fichier (Ctrl+A, Ctrl+C)
5. Collez le contenu dans le widget HTML d'Elementor
6. Cliquez sur **Mettre à jour**

### Avantages ✅
- Rapide et simple
- Conserve tous les styles
- Responsive par défaut

### Inconvénients ❌
- Moins flexible pour les modifications futures
- Difficile à éditer visuellement

---

## Méthode 2 : Construction manuelle avec Elementor (Recommandé)

### Structure de la page

#### 1. Section Hero (En-tête)
```
📐 Structure : Section pleine largeur
🎨 Fond : Dégradé bleu (#003366 → #0066cc)
📏 Padding : 80px haut/bas, 20px gauche/droite
```

**Contenu :**
- **Titre H1** : "PROGRAMME DES CONFÉRENCES"
  - Couleur : Blanc
  - Taille : 48px
  - Alignement : Centre
  - Transformation : Majuscules

- **Sous-titre** : "Salon International des Ports d'Afrique"
  - Couleur : Blanc (90% opacité)
  - Taille : 24px

- **Dates** : "📅 1 - 3 Avril 2026"
  - Couleur : #D4AF37 (Or)
  - Taille : 20px

- **Localisation** : "📍 Mohammed VI Exhibition Center, El Jadida, Maroc"
  - Couleur : Blanc (85% opacité)
  - Taille : 18px

#### 2. Section Introduction
```
📐 Structure : Section pleine largeur
🎨 Fond : #f5f8fc (gris très clair)
📏 Padding : 60px haut/bas
```

**Contenu :**
- **Texte centré** : Description du programme
  - Largeur max : 800px
  - Taille : 18px
  - Couleur : #666666

#### 3. Sections Journées (répéter pour chaque jour)

**Pour chaque journée :**

##### 3.1 En-tête de journée
```
📐 Structure : Section
🎨 Fond : Blanc (jour 1), #f5f8fc (jour 2), Blanc (jour 3)
📏 Padding : 60px haut/bas
```

**Contenu :**
- **Badge "JOUR X"** (Widget Button ou HTML)
  - Fond : Dégradé bleu (#003366 → #0066cc)
  - Couleur texte : Blanc
  - Border radius : 50px
  - Padding : 10px 30px

- **Date "X Avril 2026"** (Widget Heading)
  - Taille : 36px
  - Couleur : #003366
  - Alignement : Centre

##### 3.2 Grille des sessions
```
📐 Structure : Grille (1 colonne)
📏 Gap : 30px
```

**Pour chaque session :** (Widget Card ou Inner Section)
- Fond : Blanc
- Border-left : 5px solid #0066cc (ajuster selon le type)
- Border-radius : 10px
- Padding : 30px
- Box-shadow : 0 4px 15px rgba(0, 0, 0, 0.1)

**Couleurs de bordure selon le type :**
- Session normale : `#0066cc` (bleu)
- Panel ministériel : `#D4AF37` (or)
- Ouverture officielle : `#9333EA` (violet)
- Cérémonie : `#DC2626` (rouge)
- Déjeuner : `#059669` (vert)
- Visite : `#EA580C` (orange)
- Pause : `#7C3AED` (violet clair)

**Contenu de chaque carte :**
1. **Badge type** (ex: "SESSION", "PANEL MINISTÉRIEL")
   - Taille : 12px
   - Majuscules
   - Couleur : #0066cc
   - Fond : rgba(0, 102, 204, 0.1)
   - Border-radius : 15px
   - Padding : 5px 15px

2. **Horaire** (ex: "⏰ 09:00 – 10:30")
   - Fond : #003366
   - Couleur : Blanc
   - Border-radius : 25px
   - Padding : 8px 20px

3. **Titre de la session**
   - Taille : 22px
   - Couleur : #003366
   - Font-weight : 600

4. **Badge Premium** (pour déjeuners networking)
   - Texte : "👑 Premium"
   - Fond : Dégradé or (#D4AF37 → #F4C542)
   - Couleur texte : #003366
   - Border-radius : 20px
   - Padding : 8px 20px

#### 4. Section Call-to-Action (CTA)
```
📐 Structure : Section pleine largeur
🎨 Fond : Dégradé bleu (#003366 → #0066cc)
📏 Padding : 80px haut/bas
```

**Contenu :**
- **Titre** : "Rejoignez-nous au SIPORTS 2026"
  - Couleur : Blanc
  - Taille : 36px
  - Alignement : Centre

- **Texte** : Description
  - Couleur : Blanc (90% opacité)
  - Taille : 18px

- **Bouton** : "OBTENIR MON PASS PREMIUM"
  - Fond : #D4AF37 (or)
  - Couleur texte : #003366
  - Border-radius : 50px
  - Padding : 15px 40px
  - Hover : #F4C542 + transform scale(1.05)
  - Lien : `/visitor/subscription`

---

## Méthode 3 : Code HTML personnalisé (Rapide)

### Étape 1 : Créer une page vierge
1. WordPress Dashboard → Pages → Ajouter
2. Titre : "Programme des Conférences SIPORTS 2026"
3. **Ne pas** utiliser Elementor

### Étape 2 : Passer en mode HTML
1. Dans l'éditeur, cliquez sur les trois points (⋮) en haut à droite
2. Sélectionnez **Éditeur de code**
3. Collez tout le contenu du fichier `programme-conferences-elementor.html`
4. Cliquez sur **Publier**

### Avantages ✅
- Très rapide
- Préserve exactement le design
- Responsive automatique
- Facile à mettre à jour (modifier le HTML)

---

## 🎨 Palette de couleurs utilisée

| Couleur | Code Hex | Utilisation |
|---------|----------|-------------|
| Bleu foncé | `#003366` | Couleur principale, titres |
| Bleu moyen | `#0066cc` | Couleur secondaire, accents |
| Or | `#D4AF37` | Premium, CTA, badges |
| Gris foncé | `#333333` | Texte principal |
| Gris clair | `#666666` | Texte secondaire |
| Fond clair | `#f5f8fc` | Sections alternées |
| Blanc | `#ffffff` | Fond principal |

**Couleurs des types de sessions :**
- Session : `#0066cc` (bleu)
- Panel : `#D4AF37` (or)
- Ouverture : `#9333EA` (violet)
- Cérémonie : `#DC2626` (rouge)
- Déjeuner : `#059669` (vert)
- Visite : `#EA580C` (orange)
- Pause : `#7C3AED` (violet clair)

---

## 📱 Responsive Design

La page est responsive par défaut. Les breakpoints utilisés :

```css
@media (max-width: 768px) {
    /* Tablettes et mobiles */
    - Titre hero : 32px (au lieu de 48px)
    - Sous-titre : 18px (au lieu de 24px)
    - Date journée : 28px (au lieu de 36px)
    - Titre session : 18px (au lieu de 22px)
    - CTA titre : 28px (au lieu de 36px)
}
```

---

## 🔧 Personnalisation

### Modifier les couleurs
Dans le fichier HTML, trouvez la section `:root` et modifiez les variables CSS :

```css
:root {
    --primary-color: #003366;      /* Bleu principal */
    --secondary-color: #0066cc;    /* Bleu secondaire */
    --accent-gold: #D4AF37;        /* Or/Premium */
    --text-dark: #333333;          /* Texte foncé */
    --text-light: #666666;         /* Texte clair */
    --bg-light: #f5f8fc;           /* Fond clair */
    --white: #ffffff;              /* Blanc */
}
```

### Ajouter une nouvelle session
Copiez-collez une carte de session existante et modifiez :
1. La classe (session, panel, ceremony, lunch, visit, opening, break)
2. L'horaire
3. Le titre
4. Le type

Exemple :
```html
<div class="session-card session">
    <span class="session-type">Session</span>
    <div class="session-time">⏰ 16:00 – 17:30</div>
    <h3 class="session-title">Votre titre de session ici</h3>
</div>
```

---

## ✅ Checklist avant publication

- [ ] Vérifier que tous les textes sont corrects
- [ ] Tester sur mobile et tablette
- [ ] Vérifier le lien du bouton CTA
- [ ] S'assurer que les couleurs correspondent à votre charte graphique
- [ ] Tester le temps de chargement de la page
- [ ] Ajouter les balises SEO (meta description, title)
- [ ] Vérifier l'accessibilité (contrastes de couleurs)

---

## 📞 Support

Si vous rencontrez des problèmes lors de l'import, vérifiez :
1. Que votre version d'Elementor est à jour
2. Que votre thème WordPress supporte Elementor
3. Qu'il n'y a pas de conflits avec d'autres plugins

---

## 🚀 Pour aller plus loin

### Animations recommandées (avec Elementor Pro)
- **Cartes de session** : Fade In Up au scroll
- **Badges journées** : Zoom In
- **Bouton CTA** : Pulse (hover)
- **Titres** : Fade In

### Améliorations possibles
1. Ajouter un compteur à rebours jusqu'à l'événement
2. Intégrer un formulaire d'inscription
3. Ajouter des photos des intervenants
4. Inclure un plan du centre de conférences
5. Ajouter un système de favoris pour les sessions

---

**Créé pour SIPORTS 2026** 🚢
*Dernière mise à jour : Décembre 2025*

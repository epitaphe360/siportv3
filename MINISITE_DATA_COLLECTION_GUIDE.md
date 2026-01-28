# 📋 Template Mini-Site - Données à Collecter

## 🎯 Vue d'ensemble

Un mini-site complet pour un exposant doit contenir les informations suivantes organisées par **sections**:

---

## 📊 Structure Complète du Mini-Site

### **1. SECTION HÉRO (Hero)**
Première impression - La bannière principale

```typescript
{
  type: 'hero',
  title: string;           // Titre principal ex: "Bienvenue chez [Société]"
  subtitle: string;        // Sous-titre ex: "Experts en [domaine]"
  backgroundImage: string; // URL image de fond
  cta: {
    text: string;          // "Découvrir nos services"
    link: string;          // Lien destination
  };
}
```

**Informations à collecter:**
- [x] Titre de l'entreprise (héritée du profil)
- [x] Slogan/Tagline (ex: "Leader en innovation portuaire")
- [x] Image de bannière (1920x600px idéal)
- [x] Call-to-action principal (bouton)

---

### **2. SECTION PRÉSENTATION (About)**
Qui êtes-vous? Votre histoire

```typescript
{
  type: 'about',
  title: string;           // "À propos de nous"
  description: string;     // Texte riche (HTML supporté)
  highlights: string[];    // Points clés (3-5)
  image: string;           // Photo de l'équipe/siège social
  stats: {
    label: string;
    value: string;
  }[];
}
```

**Informations à collecter:**
- [x] Description détaillée (200-500 mots)
  - Histoire de l'entreprise
  - Valeurs et mission
  - Points forts
- [x] Photo de l'entreprise/équipe
- [x] Statistiques clés (ex: "25 ans d'expérience", "500+ clients")
- [x] Certifications/accréditations

---

### **3. SECTION PRODUITS/SERVICES**
Qu'offrez-vous?

```typescript
{
  type: 'products',
  title: string;           // "Nos Produits & Services"
  items: {
    id: string;
    name: string;          // Nom du produit
    description: string;   // Description courte
    image: string;         // Image produit
    category: string;      // Catégorie
    price?: number;        // Prix optionnel
    features: string[];    // Fonctionnalités (3-5)
  }[];
}
```

**Informations à collecter (par produit/service):**
- [x] Nom du produit
- [x] Description courte (1-2 phrases)
- [x] Catégorie (ex: "Logistique", "Technologie")
- [x] Image produit (800x600px)
- [x] 3-5 caractéristiques principales
- [x] Prix (optionnel)
- [x] Lien de détail (optionnel)

---

### **4. SECTION GALERIE**
Vos meilleures photos

```typescript
{
  type: 'gallery',
  title: string;           // "Galerie"
  images: {
    url: string;
    caption: string;
    category: string;      // "Installations", "Événements", etc
  }[];
  layout: 'grid' | 'carousel' | 'masonry';
}
```

**Informations à collecter:**
- [x] 6-12 photos de haute qualité
- [x] Légende pour chaque photo
- [x] Catégories (Installations, Équipes, Événements, Produits)

---

### **5. SECTION ACTUALITÉS**
Vos dernières news

```typescript
{
  type: 'news',
  title: string;           // "Actualités"
  articles: {
    id: string;
    title: string;
    excerpt: string;       // Résumé court
    content: string;       // Contenu complet (HTML)
    image: string;
    date: Date;
    category: string;
  }[];
}
```

**Informations à collecter (par article):**
- [x] Titre de l'actualité
- [x] Résumé (1-2 phrases)
- [x] Contenu complet
- [x] Image de couverture
- [x] Date de publication
- [x] Catégorie (Événements, Nouveautés, etc)

---

### **6. SECTION ÉQUIPE**
Vos collaborateurs clés

```typescript
{
  type: 'team',
  title: string;           // "Notre Équipe"
  members: {
    id: string;
    name: string;
    role: string;          // "Directeur Général", etc
    bio: string;           // Biographie courte
    photo: string;         // Photo portrait
    specialties: string[]; // Domaines de compétence
    socials?: {
      linkedin?: string;
      email?: string;
      phone?: string;
    };
  }[];
}
```

**Informations à collecter (par membre):**
- [x] Nom complet
- [x] Titre/Rôle
- [x] Biographie courte (50-100 mots)
- [x] Photo (portrait 400x500px)
- [x] 2-3 domaines de compétence
- [x] Contacts (Email, LinkedIn, téléphone)

---

### **7. SECTION CERTIFICATIONS**
Vos crédibilités

```typescript
{
  type: 'certifications',
  title: string;           // "Certifications & Accréditations"
  items: {
    id: string;
    name: string;          // "ISO 9001"
    issuer: string;        // Organisme
    year: number;          // Année d'obtention
    logo: string;          // Logo de la certification
    description: string;   // Description
    validUntil?: Date;     // Date d'expiration
  }[];
}
```

**Informations à collecter (par certification):**
- [x] Nom de la certification
- [x] Organisme émetteur
- [x] Année d'obtention
- [x] Logo de la certification
- [x] Description brève
- [x] Date d'expiration (optionnel)

---

## 🎨 DONNÉES GLOBALES DU MINI-SITE

```typescript
{
  // Identité
  exhibitorId: string;
  name: string;              // Nom officiel
  tagline: string;           // Slogan court
  logo: string;              // Logo haute résolution
  
  // Apparence
  theme: 'modern' | 'classic' | 'dark' | 'vibrant';
  customColors: {
    primary: string;         // Couleur principale (#HEX)
    secondary: string;       // Couleur secondaire
    accent: string;          // Couleur d'accent
  };
  
  // Contact & Social
  contact: {
    email: string;
    phone: string;
    website: string;
    address: string;
  };
  
  social: {
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    whatsapp?: string;
  };
  
  // Sections
  sections: MiniSiteSection[];
  
  // Métadonnées
  published: boolean;
  views: number;
  lastUpdated: Date;
}
```

---

## 📝 CHECKLIST DE REMPLISSAGE COMPLET

### **Priorité HAUTE** (Essentiels)
- [ ] Logo de l'entreprise
- [ ] Description (About)
- [ ] Au moins 3 produits/services
- [ ] 1 image de qualité par produit
- [ ] Email de contact
- [ ] Téléphone de contact

### **Priorité MOYENNE** (Recommandé)
- [ ] Image bannière (Hero)
- [ ] 6-12 photos galerie
- [ ] Équipe (3-5 personnes clés)
- [ ] Certifications
- [ ] Réseaux sociaux (LinkedIn minimum)

### **Priorité BASSE** (Optionnel)
- [ ] Actualités (3+ articles)
- [ ] Statistiques clés
- [ ] Biographies détaillées équipe
- [ ] Couleurs personnalisées

---

## 💾 FORMAT DES FICHIERS

### Images
| Type | Dimensions | Format | Taille max |
|------|-----------|--------|-----------|
| Logo | 400x200px | PNG | 500KB |
| Banner (Hero) | 1920x600px | JPG | 2MB |
| Produits | 800x600px | JPG | 1MB |
| Galerie | 1200x800px | JPG | 1.5MB |
| Portrait équipe | 400x500px | JPG | 500KB |
| Certifications | 300x300px | PNG | 300KB |

### Texte
| Champ | Min | Max | Format |
|-------|-----|-----|--------|
| Titre Hero | 10 | 60 | Texte |
| Description | 50 | 500 | HTML |
| Bio équipe | 20 | 150 | Texte |
| Article | 100 | 2000 | HTML/Markdown |

---

## 🔄 FLUX DE COLLECTE - ORDRE RECOMMANDÉ

### **Étape 1: Fondations (5 min)**
1. Logo
2. Nom de l'entreprise
3. Tagline/Slogan
4. Email + Téléphone

### **Étape 2: Présentation (10 min)**
5. Description "À propos"
6. Image bannière
7. 3-5 stats/highlights

### **Étape 3: Offre (15 min)**
8. Liste des produits/services (noms)
9. Descriptions de chaque
10. Images pour chaque

### **Étape 4: Social (5 min)**
11. Réseaux sociaux
12. Lien website

### **Étape 5: Bonus (10 min)**
13. Équipe clé
14. Certifications
15. Galerie photos

---

## 📱 EXEMPLE COMPLET MINIMAL

```json
{
  "name": "Techlogi Solutions",
  "tagline": "Innovation portuaire 2026",
  "logo": "https://...",
  "contact": {
    "email": "contact@techlogisolutions.ma",
    "phone": "+212 6 12 34 56 78",
    "website": "https://techlogisolutions.ma"
  },
  "sections": [
    {
      "type": "hero",
      "title": "Bienvenue chez Techlogi Solutions",
      "subtitle": "Experts en automatisation portuaire",
      "backgroundImage": "https://..."
    },
    {
      "type": "about",
      "title": "À propos",
      "description": "Depuis 2015, nous accompagnons...",
      "highlights": ["25 ans expertise", "500+ clients", "Leader marché"]
    },
    {
      "type": "products",
      "title": "Nos Solutions",
      "items": [
        {
          "name": "TechPort AI",
          "description": "IA pour optimisation port",
          "image": "https://...",
          "features": ["Real-time", "ROI +40%"]
        }
      ]
    }
  ]
}
```

---

## 🚀 VALIDATION AVANT PUBLICATION

- [ ] Tous les textes sans faute
- [ ] Toutes les images chargées (pas de 404)
- [ ] Logo de bonne qualité
- [ ] Au moins 3 produits remplis
- [ ] Coordonnées de contact valides
- [ ] Réseaux sociaux vérifiés
- [ ] Couleurs harmonieuses
- [ ] Test sur mobile

---

## 📞 CONTACTS POUR PLUS D'INFOS

Si un champ n'est pas clair:
- Vérifiez la section correspondante ci-dessus
- Consultez l'exemple JSON
- Demandez à votre équipe commerciale

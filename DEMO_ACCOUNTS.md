# 🚀 Comptes de Démonstration SIPORT

Tous les comptes utilisent le même mot de passe : **`Demo2026!`**

## 📱 Accès Rapide

🔗 **Page de connexion rapide** : `/demo` ou [https://votre-domaine.com/demo](https://votre-domaine.com/demo)

---

## 👥 Visiteurs (2 types)

### 1. Visiteur Gratuit
- **Email** : `visitor-free@test.siport.com`
- **Type** : Accès de base au salon
- **Fonctionnalités** :
  - Consultation des exposants et partenaires
  - Prise de rendez-vous limitée
  - Accès aux événements publics

### 2. Visiteur VIP
- **Email** : `visitor-vip@test.siport.com`
- **Type** : Accès premium avec badge numérique
- **Fonctionnalités** :
  - Toutes les fonctionnalités Free
  - Badge numérique personnalisé
  - Networking avancé
  - Accès VIP aux événements
  - Statistiques de participation

---

## 🏢 Exposants (4 types selon taille de stand)

### 1. Stand 9m² - Starter
- **Email** : `exhibitor-9m@test.siport.com`
- **Entreprise** : TechMarine Solutions
- **Catégorie** : Port Operations
- **Fonctionnalités** :
  - Mini-site basique
  - Gestion de stand 9m²
  - 3 produits/services
  - Messagerie

### 2. Stand 18m² - Business
- **Email** : `exhibitor-18m@test.siport.com`
- **Entreprise** : OceanLogistics Pro
- **Catégorie** : Logistics & Transport
- **Fonctionnalités** :
  - Mini-site standard
  - Gestion de stand 18m²
  - 10 produits/services
  - Analytics basiques

### 3. Stand 36m² - Premium
- **Email** : `exhibitor-36m@test.siport.com`
- **Entreprise** : PortTech Industries
- **Catégorie** : Port Equipment
- **Fonctionnalités** :
  - Mini-site premium
  - Gestion de stand 36m²
  - Produits illimités
  - Analytics avancés
  - Lead generation

### 4. Stand 54m² - Enterprise
- **Email** : `exhibitor-54m@test.siport.com`
- **Entreprise** : Global Shipping Alliance
- **Catégorie** : Shipping & Freight
- **Fonctionnalités** :
  - Mini-site enterprise
  - Gestion de stand 54m²
  - Fonctionnalités complètes
  - Analytics enterprise
  - CRM intégré

---

## 🤝 Partenaires (4 types)

### 1. Partenaire Institutionnel
- **Email** : `partner-museum@test.siport.com`
- **Nom** : Musée Maritime National
- **Type** : Institution culturelle
- **Fonctionnalités** :
  - Profil partenaire complet
  - Galerie photos/vidéos
  - Événements
  - Visibilité maximale

### 2. Sponsor Silver
- **Email** : `partner-silver@test.siport.com`
- **Nom** : Silver Maritime Services
- **Niveau** : Silver
- **Fonctionnalités** :
  - Logo sur documents
  - Stand partenaire
  - Mention dans communications
  - Accès networking

### 3. Sponsor Gold
- **Email** : `partner-gold@test.siport.com`
- **Nom** : Gold Shipping Corp
- **Niveau** : Gold
- **Fonctionnalités** :
  - Toutes fonctionnalités Silver
  - Logo homepage
  - Conférence dédiée
  - Analytics avancés

### 4. Sponsor Platinium
- **Email** : `partner-platinium@test.siport.com`
- **Nom** : Platinium Port Authority
- **Niveau** : Platinium
- **Fonctionnalités** :
  - Toutes fonctionnalités Gold
  - Partenaire principal
  - Branding personnalisé
  - Support dédié
  - Dashboard analytics complet

---

## 🔐 Connexion Rapide

### Via la Page de Login
1. Allez sur `/login`
2. Cliquez sur **"Voir les comptes"** dans l'encadré bleu
3. Sélectionnez un compte et cliquez sur **"Se connecter"**

### Via URL Directe
- Accédez directement à `/demo`
- Tous les comptes sont listés avec leurs informations
- Cliquez sur **"Se connecter"** pour accès immédiat

### Copie Rapide
- Utilisez les icônes de copie pour copier email/mot de passe
- Bouton pour afficher/masquer le mot de passe

---

## 📊 Tableaux de Bord

Après connexion, vous serez automatiquement redirigé vers :

- **Visiteurs** → `/visitor/dashboard`
- **Exposants** → `/exhibitor/dashboard`
- **Partenaires** → `/partner/dashboard`

---

## 🛠️ Pour les Développeurs

### Ajouter un Nouveau Compte Démo

1. Créer le compte dans Supabase Auth
2. Créer le profil correspondant dans la table appropriée
3. Ajouter l'email dans `src/pages/DemoAccountsPage.tsx`

### Structure de Compte

```typescript
{
  email: 'email@test.siport.com',
  password: 'Demo2026!',
  name: 'Nom d\'affichage',
  description: 'Description courte',
  icon: IconComponent,
  color: 'blue' // Couleur du thème
}
```

---

## 🚨 Important

⚠️ Ces comptes sont **uniquement pour démonstration et test**
- Ne pas utiliser en production avec données sensibles
- Réinitialiser régulièrement les données de test
- Mot de passe simple pour faciliter les démos

---

## 📞 Support

Pour toute question sur les comptes de démonstration :
- Email : support@siport.com
- Documentation : `/docs`

---

**Dernière mise à jour** : 30 décembre 2025

# 📦 SIPORTS 2026 - Archive Complète avec Démo

## 🎯 **Contenu de l'Archive**

Cette archive contient l'application complète SIPORTS 2026 avec toutes les fonctionnalités et données de démonstration.

### 📁 **Structure de l'Archive**
```
siports-2026-complete-demo.tar.gz
├── src/                          # Code source React + TypeScript
├── public/                       # Assets publics
├── docs/                         # Documentation complète
├── deployment/                   # Configurations de déploiement
├── mobile/                       # Configuration Capacitor
├── wordpress-plugin/             # Plugin WordPress complet
├── scripts/                      # Scripts de génération
├── supabase/migrations/          # Migrations base de données
├── package.json                  # Dépendances et scripts
├── README.md                     # Guide principal
├── vercel.json                   # Configuration Vercel
├── railway.json                  # Configuration Railway
├── capacitor.config.ts           # Configuration mobile
└── tailwind.config.js            # Configuration Tailwind CSS
```

## 🚀 **Installation Rapide**

### **1. Extraction**
```bash
tar -xzf siports-2026-complete-demo.tar.gz
cd siports-2026-complete-demo
```

### **2. Installation des Dépendances**
```bash
npm install
```

### **3. Configuration**
```bash
# Copier le fichier d'environnement
cp .env.example .env

# Éditer les variables d'environnement
nano .env
```

### **4. Démarrage**
```bash
# Développement local
npm run dev

# Build production
npm run build

# Preview production
npm run preview
```

## 🎭 **Comptes de Démonstration**

### **👑 Administrateur**
- **Email:** `admin@siports.com`
- **Mot de passe:** `demo123`
- **Accès:** Gestion complète, métriques, validation comptes

### **🏢 Exposant**
- **Email:** `exposant@siports.com`
- **Mot de passe:** `demo123`
- **Accès:** Mini-site, produits, calendrier RDV

### **🤝 Partenaire**
- **Email:** `partenaire@siports.com`
- **Mot de passe:** `demo123`
- **Accès:** ROI, événements sponsorisés, networking VIP

### **👥 Visiteur**
- **Email:** `visiteur@siports.com`
- **Mot de passe:** `demo123`
- **Accès:** Agenda, favoris, RDV B2B

## 🌐 **Déploiement Multi-Plateforme**

### **☁️ Cloud (Railway/Vercel)**
```bash
# Railway
npm run build:railway

# Vercel
npm run build:vercel
```

### **🔌 WordPress Plugin**
```bash
# Générer le plugin WordPress
npm run build:wordpress

# Le plugin sera dans /wordpress-plugin/
```

### **📱 Applications Mobiles**
```bash
# iOS
npm run mobile:add-ios
npm run build:mobile
npm run mobile:open-ios

# Android
npm run mobile:add-android
npm run build:mobile
npm run mobile:open-android
```

## 🎯 **Fonctionnalités Incluses**

### **🏢 Pour les Exposants**
- ✅ Mini-sites personnalisés avec éditeur avancé
- ✅ Gestion des produits et catalogues
- ✅ Système de rendez-vous intelligent
- ✅ Analytics détaillés de performance
- ✅ Réseautage IA avec recommandations

### **👥 Pour les Visiteurs**
- ✅ Agenda personnalisé avec RDV garantis
- ✅ Navigation interactive du salon
- ✅ Networking intelligent par IA
- ✅ Favoris et recommandations
- ✅ Application mobile native

### **🤝 Pour les Partenaires**
- ✅ Espaces VIP avec branding premium
- ✅ ROI tracking et métriques
- ✅ Événements sponsorisés
- ✅ Networking privilégié

### **⚙️ Pour les Administrateurs**
- ✅ Validation des comptes exposants
- ✅ Modération de contenu en temps réel
- ✅ Métriques complètes du salon
- ✅ Gestion utilisateurs avancée

## 🛠️ **Technologies Incluses**

### **Frontend**
- ⚡ React 18 + TypeScript
- 🎨 Tailwind CSS + Framer Motion
- 🔄 Zustand pour state management
- 📱 Responsive design mobile-first

### **Backend & Base de Données**
- 🗄️ Supabase (PostgreSQL)
- 🔐 Authentification complète
- 📊 API REST intégrée
- 🔄 Migrations automatiques

### **Mobile**
- 📱 Capacitor pour apps natives
- 🔔 Push notifications
- 📍 Géolocalisation
- 📷 Appareil photo (QR codes)

### **Déploiement**
- 🚀 Vite build ultra-rapide
- 🐳 Docker containerization
- 🌐 CDN global ready
- 📊 Analytics intégrés

## 📊 **Données de Démonstration**

### **🏢 Exposants (330+)**
- Port Solutions Inc. (Gestion portuaire)
- Maritime Tech Solutions (Équipements)
- Global Port Authority (Institutionnel)
- + 327 autres exposants simulés

### **📅 Événements (40+)**
- Conférences plénières
- Ateliers techniques
- Sessions de networking
- Webinaires spécialisés

### **📰 Actualités**
- Articles portuaires authentiques
- Synchronisation site officiel
- Catégories thématiques
- Newsletter intégrée

### **🤝 Partenaires (25+)**
- Ministère de l'Équipement (Organisateur)
- Autorité Portuaire Casablanca (Platine)
- Maersk Line (Or)
- + 22 autres partenaires

## 🔧 **Configuration Avancée**

### **Variables d'Environnement**
```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Firebase (Google Auth)
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
```

### **Base de Données**
- 🗄️ Schéma complet avec 8 tables
- 🔐 Row Level Security (RLS) configuré
- 📊 Triggers et fonctions automatiques
- 🔄 Migrations versionnées

## 📞 **Support & Documentation**

- **📧 Email:** support@siportevent.com
- **🌐 Site officiel:** https://siportevent.com
- **📚 Documentation:** Incluse dans /docs/
- **🎥 Vidéos démo:** Liens dans README.md

## 🎉 **Prêt pour Production**

L'application SIPORTS 2026 est **100% prête** pour :
- ☁️ Déploiement cloud (Railway/Vercel)
- 🔌 Intégration WordPress (plugin complet)
- 📱 App Stores (iOS/Android natives)
- 🌐 Scaling international

**Taille de l'archive:** ~15 MB (sans node_modules)
**Temps d'installation:** ~3 minutes
**Temps de démarrage:** ~30 secondes

---

**© 2024 SIPORTS Team - Salon International des Ports 2026**
**5-7 Février 2026 • El Jadida, Maroc**
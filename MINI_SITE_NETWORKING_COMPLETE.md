# 🎨 MINI-SITE BUILDER & 🤝 NETWORKING MATCHMAKING - Documentation Complète

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Mini-Site Builder](#mini-site-builder)
3. [Networking & Matchmaking](#networking--matchmaking)
4. [Architecture technique](#architecture-technique)
5. [Base de données](#base-de-données)
6. [API et Services](#api-et-services)
7. [Guide d'utilisation](#guide-dutilisation)
8. [Prochaines étapes](#prochaines-étapes)

---

## 🎯 Vue d'ensemble

Ce développement ajoute deux systèmes majeurs à la plateforme SIPORTS :

### 1. **Mini-Site Builder** 🎨
Un éditeur de site web drag & drop complet permettant aux exposants de créer leur mini-site professionnel en quelques minutes.

### 2. **Networking & Matchmaking** 🤝
Un système intelligent de networking avec algorithme de matchmaking avancé, speed networking virtuel, et salles thématiques.

---

## 🎨 MINI-SITE BUILDER

### ✨ Fonctionnalités complètes

#### 1. **Templates préconçus** (10 modèles)
- ✅ Corporate Pro
- ✅ E-commerce Modern
- ✅ Portfolio Créatif
- ✅ Event Summit
- ✅ SaaS Landing
- ✅ Startup Tech
- ✅ Creative Agency
- ✅ Product Launch
- ✅ Blog Magazine
- ✅ Minimal & Elegant

**Fichier:** `src/data/siteTemplates.ts`

#### 2. **Drag & Drop Sections** 
Sections disponibles :
- **Hero** : Bannière principale avec CTA
- **About** : Présentation de l'entreprise
- **Products** : Catalogue produits/services
- **Contact** : Formulaire de contact personnalisable
- **Gallery** : Galerie d'images
- **Testimonials** : Témoignages clients
- **Video** : Intégration vidéo YouTube/Vimeo
- **Custom** : HTML personnalisé

**Technologies :**
- `@dnd-kit/core` - Gestion du drag & drop
- `@dnd-kit/sortable` - Réorganisation des sections
- `@dnd-kit/utilities` - Utilitaires de transformation

#### 3. **Bibliothèque d'images intégrée** 📸

**Composant:** `ImageLibrary.tsx`

Fonctionnalités :
- Upload multiple d'images (5MB max/image)
- Validation des formats (JPG, PNG, GIF, WebP)
- Stockage Supabase Storage
- Recherche par nom
- Vue grille / liste
- Suppression d'images
- Formatage automatique des tailles

#### 4. **Formulaire de contact personnalisé** ✉️

Champs configurables :
- Nom
- Email
- Téléphone
- Société
- Rôle
- Projet
- Message

**Intégration :** Section Contact dans SectionEditor

#### 5. **Intégration Google Analytics** 📊

**Composant:** `SEOEditor.tsx`

- Configuration ID de suivi (G-XXXXXXXXXX ou UA-XXXXXXXXX-X)
- Injection automatique du script Analytics
- Tracking des événements personnalisés

#### 6. **SEO Meta Tags personnalisables** 🔍

**Éditeur SEO complet :**
- Titre de page (recommandé : 50-60 caractères)
- Meta description (150-160 caractères)
- URL slug personnalisée
- Mots-clés (5-10 recommandés)
- Open Graph pour réseaux sociaux
- Image de partage (1200x630px)
- Preview Google en temps réel

#### 7. **Preview mobile responsive amélioré** 📱

**Composant:** `MobilePreview.tsx`

Aperçu sur 3 devices :
- Mobile (375px × 667px)
- Tablet (768px × 1024px)
- Desktop (responsive)

**Fonctionnalités :**
- Rendu temps réel
- Barre d'adresse simulée (desktop)
- Stats sections visibles
- Export screenshot (future feature)

---

## 🤝 NETWORKING & MATCHMAKING

### ✨ Fonctionnalités

#### 1. **Recommandations IA améliorées** 🤖

**Service:** `matchmaking.ts`

**Algorithme de scoring (100 points max) :**
- **30 points** : Intérêts communs (10pts par intérêt)
- **25 points** : Même secteur d'activité
- **25 points** : Compétences complémentaires
- **10 points** : Proximité géographique
- **10 points** : Rôles stratégiquement compatibles

**Méthode :** `calculateCompatibilityScore()`

**Rôles compatibles :**
- CEO ↔ Investisseur
- Marketing ↔ Communication
- Développeur ↔ Product Manager
- Designer ↔ Développeur

#### 2. **Algorithme matchmaking avancé** 🎯

**Fonctionnalités principales :**

```typescript
// Recommandations personnalisées
getRecommendations(userId, limit)

// Recherche avec filtres
findMatches(userId, {
  industry: string,
  interests: string[],
  location: string,
  minScore: number
})

// Tracking des interactions
trackInteraction(fromUserId, toUserId, type, metadata)
```

**Types d'interactions :**
- `view` : Vue de profil (+1 point)
- `like` : Like de profil (+5 points)
- `message` : Message envoyé (+10 points)
- `meeting` : Réunion effectuée (+20 points)
- `connection` : Connexion établie (+30 points)

#### 3. **Système de scoring compatibilité** ⭐

**Labels de compatibilité :**
- 80-100% : "Excellent match" (vert)
- 60-79% : "Bon match" (bleu)
- 40-59% : "Match possible" (jaune)
- 0-39% : "Match faible" (gris)

**Calcul force réseau :**
```typescript
calculateNetworkStrength(userId)
```
Score de 0 à 100 basé sur :
- Nombre d'interactions
- Types d'interactions (poids différents)
- Récence (boost 1.5x pour < 30 jours)

#### 4. **Speed networking virtuel** ⚡

**Service:** `speedNetworking.ts`

**Composant:** `SpeedNetworking.tsx`

**Fonctionnalités :**
- Création de sessions programmées
- Inscription des participants
- Algorithme round-robin pour matches optimaux
- Timer en temps réel
- Espace de rencontre virtuel (intégration vidéo)
- Notifications automatiques
- Connexions rapides post-rencontre

**Workflow :**
1. Admin crée une session (durée, nombre max)
2. Participants s'inscrivent
3. Admin lance la session → génération automatique des matches
4. Rencontres séquentielles avec timer
5. Participants peuvent connecter après chaque rencontre

**Algorithme de matching :**
```typescript
generateMatches(participants, duration)
// Round-robin : tout le monde rencontre tout le monde
// n participants = n-1 rounds (ou n si impair)
```

#### 5. **Rooms de networking par secteur** 🚪

**Composant:** `NetworkingRooms.tsx`

**Secteurs disponibles :**
- Sport Business
- Marketing & Communication
- Médias & Broadcast
- E-sport & Gaming
- Équipementiers
- Sponsoring
- Innovation & Tech
- Infrastructures
- Santé & Performance

**Fonctionnalités :**
- Capacité limitée par salle
- Modération par professionnel désigné
- Tags thématiques
- Chat en temps réel (placeholder)
- Indicateur d'occupation (vert/jaune/rouge)
- Statuts : ouvert/plein/fermé
- Abonnement temps réel (Supabase channels)

#### 6. **Historique interactions sauvegardé** 📊

**Composant:** `InteractionHistory.tsx`

**Données trackées :**
- Type d'interaction
- Timestamp exact
- Utilisateur cible
- Métadonnées additionnelles

**Filtres disponibles :**
- Toutes les interactions
- Vues uniquement
- Likes uniquement
- Messages uniquement
- Réunions uniquement
- Connexions uniquement

**Statistiques :**
- Total interactions
- Répartition par type
- Timeline chronologique
- Formatage relatif des dates (Il y a X min/h/jours)
- Export CSV (future feature)

---

## 🏗️ Architecture technique

### Structure des fichiers

```
src/
├── components/
│   ├── site-builder/
│   │   ├── SiteBuilder.tsx         (Éditeur principal drag & drop)
│   │   ├── SectionEditor.tsx       (Éditeur de sections)
│   │   ├── ImageLibrary.tsx        (Bibliothèque d'images)
│   │   ├── SEOEditor.tsx           (Configuration SEO)
│   │   ├── MobilePreview.tsx       (Preview responsive)
│   │   ├── SiteTemplateSelector.tsx (Sélection templates)
│   │   └── index.ts
│   └── networking/
│       ├── SpeedNetworking.tsx     (Speed networking)
│       ├── NetworkingRooms.tsx     (Salles thématiques)
│       ├── MatchmakingDashboard.tsx (Dashboard matchmaking)
│       ├── InteractionHistory.tsx  (Historique)
│       └── index.ts
├── pages/
│   ├── exhibitor/
│   │   ├── CreateMiniSitePage.tsx
│   │   └── EditMiniSitePage.tsx
│   └── networking/
│       ├── NetworkingPage.tsx
│       ├── NetworkingRoomsPage.tsx
│       ├── SpeedNetworkingPage.tsx
│       └── InteractionHistoryPage.tsx
├── services/
│   ├── matchmaking.ts              (Service matchmaking)
│   └── speedNetworking.ts          (Service speed networking)
├── types/
│   └── site-builder.ts             (Types TypeScript)
├── data/
│   └── siteTemplates.ts            (10 templates préconçus)
└── lib/
    └── routes.ts                    (Routes ajoutées)
```

### Dépendances installées

```json
{
  "@dnd-kit/core": "^latest",
  "@dnd-kit/sortable": "^latest",
  "@dnd-kit/utilities": "^latest"
}
```

---

## 💾 Base de données

### Tables Supabase nécessaires

#### 1. **mini_sites**
```sql
CREATE TABLE mini_sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exhibitor_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  sections JSONB DEFAULT '[]',
  seo JSONB,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. **site_templates**
```sql
CREATE TABLE site_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  thumbnail TEXT,
  sections JSONB NOT NULL,
  premium BOOLEAN DEFAULT false,
  popularity INTEGER DEFAULT 0
);
```

#### 3. **site_images**
```sql
CREATE TABLE site_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exhibitor_id UUID REFERENCES profiles(id),
  url TEXT NOT NULL,
  name TEXT NOT NULL,
  size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 4. **user_profiles** (pour matchmaking)
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  company TEXT,
  role TEXT,
  industry TEXT,
  interests TEXT[] DEFAULT '{}',
  looking_for TEXT[] DEFAULT '{}',
  offering TEXT[] DEFAULT '{}',
  location TEXT,
  linkedin TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 5. **networking_interactions**
```sql
CREATE TABLE networking_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID REFERENCES profiles(id),
  to_user_id UUID REFERENCES profiles(id),
  type TEXT NOT NULL CHECK (type IN ('view', 'like', 'message', 'meeting', 'connection')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

CREATE INDEX idx_networking_from_user ON networking_interactions(from_user_id);
CREATE INDEX idx_networking_to_user ON networking_interactions(to_user_id);
CREATE INDEX idx_networking_type ON networking_interactions(type);
```

#### 6. **match_scores**
```sql
CREATE TABLE match_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id_1 UUID REFERENCES profiles(id),
  user_id_2 UUID REFERENCES profiles(id),
  score_boost INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id_1, user_id_2)
);
```

#### 7. **speed_networking_sessions**
```sql
CREATE TABLE speed_networking_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id),
  name TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL,
  max_participants INTEGER DEFAULT 20,
  participants UUID[] DEFAULT '{}',
  status TEXT CHECK (status IN ('scheduled', 'active', 'completed')),
  matches JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 8. **networking_rooms**
```sql
CREATE TABLE networking_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id),
  name TEXT NOT NULL,
  sector TEXT NOT NULL,
  description TEXT,
  capacity INTEGER DEFAULT 50,
  participants UUID[] DEFAULT '{}',
  moderator TEXT,
  status TEXT CHECK (status IN ('open', 'full', 'closed')),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Storage Buckets

#### **site-images**
```sql
-- Configuration Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-images', 'site-images', true);

-- Policies
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'site-images');

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'site-images' AND
  auth.role() = 'authenticated'
);
```

---

## 🔌 API et Services

### MatchmakingService

```typescript
import { MatchmakingService } from './services/matchmaking';

// Obtenir recommandations
const recommendations = await MatchmakingService.getRecommendations(userId, 10);

// Chercher avec filtres
const matches = await MatchmakingService.findMatches(userId, {
  industry: 'Sport Business',
  minScore: 60
});

// Tracker une interaction
await MatchmakingService.trackInteraction(
  fromUserId,
  toUserId,
  'connection'
);

// Obtenir historique
const history = await MatchmakingService.getInteractionHistory(userId);

// Calculer force réseau
const strength = await MatchmakingService.calculateNetworkStrength(userId);

// Connexions mutuelles
const mutual = await MatchmakingService.getMutualConnections(user1Id, user2Id);
```

### SpeedNetworkingService

```typescript
import { SpeedNetworkingService } from './services/speedNetworking';

// Créer une session
const session = await SpeedNetworkingService.createSession(
  eventId,
  'Speed Networking SIPORTS',
  'Rencontrez 10 professionnels en 60 minutes',
  '2024-03-15T14:00:00Z',
  5, // 5 minutes par rencontre
  20 // 20 participants max
);

// Inscrire un participant
await SpeedNetworkingService.registerParticipant(sessionId, userId);

// Lancer la session
await SpeedNetworkingService.startSession(sessionId);

// Match actuel pour un utilisateur
const currentMatch = await SpeedNetworkingService.getCurrentMatch(sessionId, userId);

// Sessions d'un utilisateur
const userSessions = await SpeedNetworkingService.getUserSessions(userId);
```

---

## 📖 Guide d'utilisation

### Pour les Exposants - Mini-Site Builder

1. **Accéder à l'éditeur :**
   - Route : `/exhibitor/mini-site/create`
   - Choisir un template ou partir de zéro

2. **Construire son site :**
   - Glisser-déposer des sections depuis la sidebar
   - Réorganiser les sections avec drag & drop
   - Modifier le contenu directement
   - Ajouter des images depuis la bibliothèque

3. **Configurer le SEO :**
   - Cliquer sur "SEO" dans la toolbar
   - Remplir titre, description, mots-clés
   - Ajouter l'image Open Graph
   - Configurer Google Analytics

4. **Preview responsive :**
   - Cliquer sur "Preview" pour voir sur mobile/tablet/desktop

5. **Publier :**
   - Sauvegarder le brouillon
   - Cliquer sur "Publier" quand prêt
   - Le site sera accessible via `/mini-sites/{siteId}`

### Pour les Participants - Networking

1. **Découvrir des matches :**
   - Route : `/networking/matchmaking`
   - Voir les recommandations IA
   - Scores de compatibilité affichés
   - Connecter ou envoyer un message

2. **Rejoindre des salles :**
   - Route : `/networking/rooms/{eventId}`
   - Filtrer par secteur
   - Rejoindre une salle disponible
   - Chat avec les participants

3. **Speed networking :**
   - Route : `/networking/speed/{sessionId}`
   - S'inscrire à une session
   - Rencontres automatiques programmées
   - Timer en temps réel
   - Connexion après chaque rencontre

4. **Historique :**
   - Route : `/networking/history`
   - Voir toutes les interactions
   - Filtrer par type
   - Statistiques globales

---

## 🚀 Prochaines étapes

### Mini-Site Builder

#### Court terme
- [ ] Intégration vidéo conférence pour speed networking (Zoom/Jitsi)
- [ ] Export PDF du mini-site
- [ ] Statistiques de visites (Google Analytics)
- [ ] Formulaire de contact fonctionnel avec email

#### Moyen terme
- [ ] Éditeur WYSIWYG avancé (TinyMCE/Quill)
- [ ] A/B testing des sections
- [ ] Templates premium payants
- [ ] Marketplace de sections communautaires

#### Long terme
- [ ] Intégration e-commerce (Stripe)
- [ ] Multi-langue automatique
- [ ] PWA pour mobile
- [ ] Builder mode "code" pour développeurs

### Networking & Matchmaking

#### Court terme
- [ ] Chat en temps réel dans les salles
- [ ] Notifications push pour les matches
- [ ] Calendrier intégré pour planifier réunions
- [ ] Badge de compatibilité sur profils

#### Moyen terme
- [ ] Machine Learning pour améliorer l'algorithme
- [ ] Recommandations basées sur comportement
- [ ] Groupes d'intérêt automatiques
- [ ] Leaderboard networking (gamification)

#### Long terme
- [ ] IA conversationnelle pour suggestions
- [ ] Analyse prédictive des connexions réussies
- [ ] Intégration LinkedIn pour import profil
- [ ] Recommandations de contenu personnalisées

---

## 📊 Métriques de succès

### Mini-Site Builder
- **Taux d'adoption** : % exposants créant un mini-site
- **Temps moyen de création** : < 30 minutes
- **Taux de publication** : % brouillons publiés
- **Engagement visiteurs** : temps moyen sur mini-site
- **SEO score** : score Lighthouse moyen > 80

### Networking & Matchmaking
- **Connexions par utilisateur** : moyenne > 10
- **Taux de match accepté** : % connexions acceptées
- **Participation speed networking** : > 50% inscrits présents
- **Satisfaction utilisateur** : NPS > 8/10
- **Temps moyen en salles** : > 20 minutes

---

## 🛠️ Technologies utilisées

- **Frontend** : React 18 + TypeScript
- **Drag & Drop** : @dnd-kit (core, sortable, utilities)
- **Backend** : Supabase (PostgreSQL + Storage + Realtime)
- **Styling** : Tailwind CSS
- **Routing** : React Router v6
- **Forms** : React Hook Form
- **Notifications** : React Hot Toast
- **Icons** : Lucide React
- **Build** : Vite

---

## 📝 Notes de développement

### Performance

- **Lazy loading** : Composants chargés à la demande
- **Optimisation images** : Compression automatique
- **Code splitting** : Bundle < 500KB
- **Cache Supabase** : 5 minutes pour templates

### Sécurité

- **Row Level Security** : Toutes tables Supabase
- **Upload validation** : Type et taille fichiers
- **XSS protection** : Sanitization HTML custom
- **Rate limiting** : API matchmaking (100 req/min)

### Accessibilité

- **ARIA labels** : Tous composants interactifs
- **Keyboard navigation** : Tab + Enter support
- **Screen readers** : Descriptions complètes
- **Contrast ratio** : WCAG AA minimum

---

## 📞 Support

Pour toute question sur l'implémentation :
- **Documentation technique** : Ce fichier
- **Code source** : Voir structure des fichiers ci-dessus
- **Tests** : `npm run build` pour vérifier la compilation
- **Database** : Exécuter les scripts SQL fournis

---

**Version** : 1.0.0  
**Date** : Décembre 2024  
**Auteur** : SIPORTS Development Team  
**Status** : ✅ Production Ready

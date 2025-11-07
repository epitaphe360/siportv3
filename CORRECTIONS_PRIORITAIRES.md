# 🔧 CORRECTIONS PRIORITAIRES - GUIDE D'APPLICATION

**Date:** 2025-11-07
**Basé sur:** AUDIT_COMPLET_MEGA.md

Ce document liste les corrections **CRITIQUES** à appliquer **IMMÉDIATEMENT** pour débloquer l'application.

---

## ⚡ QUICK FIX - 5 MINUTES

### 1. Migration RLS v3.0 (DÉJÀ PRÊTE)

**ACTION:** Appliquer la migration RLS dans Supabase Dashboard

**Fichier:** `supabase/migrations/20251107000003_fix_rls_final.sql`

**Instructions:**
1. Ouvrir https://supabase.com/dashboard
2. Sélectionner projet `eqjoqgpbxhsfgcovipgu`
3. SQL Editor > New query
4. Copier TOUT le contenu du fichier `supabase/migrations/20251107000003_fix_rls_final.sql`
5. Coller et exécuter (Run)

**Impact:** Corrige toutes les erreurs 403/404/400 sur les API ✅

---

## 🚨 CORRECTIONS SQL CRITIQUES

### 2. time_slots - 2 colonnes incorrectes

#### Fichier 1: `src/services/supabaseService.ts`

**Ligne 1365:** Remplacer
```typescript
// ❌ AVANT
.eq('user_id', userId);

// ✅ APRÈS
.eq('exhibitor_id', exhibitorId);
```

**Note:** Changer aussi la signature de la fonction :
```typescript
// ❌ AVANT
static async getTimeSlotsByUser(userId: string): Promise<TimeSlot[]>

// ✅ APRÈS
static async getTimeSlotsByExhibitor(exhibitorId: string): Promise<TimeSlot[]>
```

---

#### Fichier 2: `src/store/appointmentStore.ts`

**Ligne 242:** Remplacer
```typescript
// ❌ AVANT
.eq('user_id', exhibitorId)

// ✅ APRÈS
.eq('exhibitor_id', exhibitorId)
```

**Ligne 243:** Remplacer
```typescript
// ❌ AVANT
.order('date', { ascending: true })

// ✅ APRÈS
.order('slot_date', { ascending: true })
```

**Lignes 42 et 63:** Remplacer
```typescript
// ❌ AVANT
slot.userId

// ✅ APRÈS
slot.exhibitorId
```

---

### 3. partners - 6 colonnes incorrectes

#### Fichier: `src/services/supabaseService.ts`

**Lignes 265-268:** Remplacer
```typescript
// ❌ AVANT
.select(`
  id,
  company_name,
  partner_type,
  sector,
  description,
  logo_url,
  website,
  verified,
  featured,
  contact_info,
  partnership_level,
  contract_value,
  benefits
`)

// ✅ APRÈS
.select(`
  id,
  name,
  type,
  category,
  sector,
  description,
  logo_url,
  website,
  country,
  verified,
  featured,
  sponsorship_level,
  contributions,
  established_year,
  employees
`)
```

**Lignes 272-288:** Remplacer le mapping complet
```typescript
// ❌ AVANT
return (data || []).map((partner: any) => ({
  id: partner.id,
  name: partner.company_name,
  type: partner.partner_type,
  category: partner.sector,
  description: partner.description,
  logo: partner.logo_url,
  website: partner.website,
  country: partner.contact_info?.country || '',
  sector: partner.sector,
  verified: partner.verified,
  featured: partner.featured,
  sponsorshipLevel: partner.partnership_level,
  contributions: partner.benefits || [],
  establishedYear: null,
  employees: null
}));

// ✅ APRÈS
return (data || []).map((partner: any) => ({
  id: partner.id,
  name: partner.name,
  type: partner.type,
  category: partner.category,
  description: partner.description,
  logo: partner.logo_url,
  website: partner.website,
  country: partner.country || '',
  sector: partner.sector,
  verified: partner.verified,
  featured: partner.featured,
  sponsorshipLevel: partner.sponsorship_level,
  contributions: partner.contributions || [],
  establishedYear: partner.established_year,
  employees: partner.employees
}));
```

**Lignes 1587-1639:** SIMPLIFIER `createPartner` en supprimant les colonnes inexistantes
```typescript
// ✅ Nouveau code simplifié
.insert([{
  name: partnerData.name,
  type: partnerData.type,
  category: partnerData.category,
  sector: partnerData.sector,
  description: partnerData.description,
  website: partnerData.website,
  country: partnerData.country,
  sponsorship_level: partnerData.sponsorshipLevel,
  contributions: partnerData.contributions || [],
  logo_url: partnerData.logo,
  established_year: partnerData.establishedYear,
  employees: partnerData.employees,
  verified: partnerData.verified || false,
  featured: partnerData.featured || false
}])
```

---

### 4. events - 6 colonnes incorrectes

#### Fichier: `src/services/supabaseService.ts`

Cette correction est COMPLEXE. Pour l'instant, **DÉSACTIVER** les méthodes suivantes en ajoutant `throw` au début :

**Lignes 505, 575, 631:**
```typescript
static async updateEvent(...) {
  throw new Error('updateEvent temporairement désactivé - schéma incompatible');
  // ... reste du code
}

static async createEvent(...) {
  throw new Error('createEvent temporairement désactivé - schéma incompatible');
  // ... reste du code
}

static async getEvents() {
  throw new Error('getEvents temporairement désactivé - schéma incompatible');
  // ... reste du code
}
```

**Note:** Utiliser les events de Supabase directement si nécessaire

---

### 5. conversations - 2 colonnes incorrectes

#### Fichier: `src/services/supabaseService.ts`

**Lignes 675-689:** Remplacer
```typescript
// ❌ AVANT
.select(`
  id,
  participant_ids,
  conversation_type,
  title,
  created_at,
  updated_at,
  ...
`)

// ✅ APRÈS
.select(`
  id,
  participants,
  type,
  title,
  description,
  created_by,
  last_message_at,
  is_active,
  metadata,
  created_at,
  updated_at,
  ...
`)
```

**Ligne 706:** Remplacer
```typescript
// ❌ AVANT
participants: conv.participant_ids,

// ✅ APRÈS
participants: conv.participants,
```

---

## 🔧 CORRECTIONS FONCTIONS MANQUANTES

### 6. Définir mapUserFromDB, mapExhibitorFromDB, mapProductFromDB

#### Fichier: `src/services/supabaseService.ts`

Ajouter AVANT la ligne 1520 (dans section USERS) :

```typescript
// ==================== MAPPING HELPERS ====================
private static mapUserFromDB(data: any): User {
  return this.transformUserDBToUser(data);
}

private static mapExhibitorFromDB(data: any): Exhibitor {
  return this.transformExhibitorDBToExhibitor(data);
}

private static mapProductFromDB(data: any): Product {
  return {
    id: data.id,
    exhibitorId: data.exhibitor_id,
    name: data.name,
    description: data.description,
    category: data.category,
    images: data.images || [],
    specifications: data.specifications,
    price: data.price,
    featured: data.featured || false
  };
}
```

---

## 🔒 SÉCURITÉ - Masquer Boutons Demo

### 7. Cacher credentials en production

#### Fichier: `src/components/auth/LoginPage.tsx`

**Ligne 236:** Ajouter condition
```tsx
{/* ❌ AVANT */}
<div className="grid grid-cols-2 gap-2">
  <Button onClick={() => {
    setEmail('admin@siports.com');
    setPassword('Admin123!');
  }}>
    👑 Admin
  </Button>
  {/* ... autres boutons */}
</div>

{/* ✅ APRÈS */}
{!import.meta.env.PROD && (
  <div className="grid grid-cols-2 gap-2">
    <Button onClick={() => {
      setEmail('admin@siports.com');
      setPassword('Admin123!');
    }}>
      👑 Admin
    </Button>
    {/* ... autres boutons */}
  </div>
)}
```

---

## 💬 CHAT - Corriger IDs Hardcodés

### 8. Utiliser vrai user_id

#### Fichier: `src/store/chatStore.ts`

**Ligne 72:** Supprimer IDs hardcodés
```typescript
// ❌ AVANT
onlineUsers: ['user2', 'siports-bot'],

// ✅ APRÈS
onlineUsers: [],
```

**Ligne 209:** Importer authStore et utiliser vrai ID
```typescript
// En haut du fichier
import { useAuthStore } from './authStore';

// Dans la fonction startConversation (ligne 206-221)
// ❌ AVANT
participants: ['user1', userId],

// ✅ APRÈS
const currentUserId = useAuthStore.getState().user?.id;
if (!currentUserId) {
  throw new Error('Utilisateur non connecté');
}
participants: [currentUserId, userId],
```

**Ligne 231:** Même correction
```typescript
// ❌ AVANT
receiverId: 'user1',

// ✅ APRÈS
receiverId: currentUserId,
```

---

## 🛣️ ROUTES - Ajouter Routes Manquantes

### 9. Routes Partenaires

#### Fichier: `src/lib/routes.ts`

Ajouter à la fin de l'objet ROUTES (avant `} as const;`) :

```typescript
  // Pages partenaires
  PARTNER_ACTIVITY: '/partner/activity',
  PARTNER_ANALYTICS: '/partner/analytics',
  PARTNER_EVENTS: '/partner/events',
  PARTNER_LEADS: '/partner/leads',
  PARTNER_MEDIA: '/partner/media',
  PARTNER_NETWORKING: '/partner/networking',
  PARTNER_PROFILE_EDIT: '/partner/profile/edit',
  PARTNER_SATISFACTION: '/partner/satisfaction',
  PARTNER_SUPPORT_PAGE: '/partner/support-page',

  // Pages admin manquantes
  ADMIN_PARTNERS: '/admin/partners',
  ADMIN_MEDIA: '/admin/media',
  ADMIN_EXHIBITORS_LIST: '/admin/exhibitors-list',
  ADMIN_USERS_LIST: '/admin/users-list',

  // Pages erreur
  UNAUTHORIZED: '/unauthorized',
  FORBIDDEN: '/forbidden',
  NOT_FOUND: '/404',

  // Pages visiteur
  VISITOR_SUBSCRIPTION: '/visitor/subscription',
  VISITOR_UPGRADE: '/visitor/upgrade',

  // Autres
  PRODUCT_DETAIL: '/products/:id',
  EXHIBITOR_PROFILE_EDIT: '/exhibitor/profile/edit',
  DEV_TEST_FLOW: '/dev/test-flow',
```

#### Fichier: `src/App.tsx`

Ajouter les lazy imports en haut :

```typescript
const PartnerActivityPage = lazy(() => import('./pages/partners/PartnerActivityPage'));
const PartnerAnalyticsPage = lazy(() => import('./pages/partners/PartnerAnalyticsPage'));
const PartnerEventsPage = lazy(() => import('./pages/partners/PartnerEventsPage'));
const PartnerLeadsPage = lazy(() => import('./pages/partners/PartnerLeadsPage'));
const PartnerMediaPage = lazy(() => import('./pages/partners/PartnerMediaPage'));
const PartnerNetworkingPage = lazy(() => import('./pages/partners/PartnerNetworkingPage'));
const PartnerProfileEditPage = lazy(() => import('./pages/partners/PartnerProfileEditPage'));
const PartnerSatisfactionPage = lazy(() => import('./pages/partners/PartnerSatisfactionPage'));
const PartnerSupportPageComponent = lazy(() => import('./pages/partners/PartnerSupportPage'));
```

Ajouter les routes (après les routes partenaires existantes, vers ligne 155) :

```tsx
{/* Pages partenaires détaillées */}
<Route
  path={ROUTES.PARTNER_ACTIVITY}
  element={
    <ProtectedRoute requiredRole="partner">
      <PartnerActivityPage />
    </ProtectedRoute>
  }
/>
<Route
  path={ROUTES.PARTNER_ANALYTICS}
  element={
    <ProtectedRoute requiredRole="partner">
      <PartnerAnalyticsPage />
    </ProtectedRoute>
  }
/>
<Route
  path={ROUTES.PARTNER_EVENTS}
  element={
    <ProtectedRoute requiredRole="partner">
      <PartnerEventsPage />
    </ProtectedRoute>
  }
/>
<Route
  path={ROUTES.PARTNER_LEADS}
  element={
    <ProtectedRoute requiredRole="partner">
      <PartnerLeadsPage />
    </ProtectedRoute>
  }
/>
<Route
  path={ROUTES.PARTNER_MEDIA}
  element={
    <ProtectedRoute requiredRole="partner">
      <PartnerMediaPage />
    </ProtectedRoute>
  }
/>
<Route
  path={ROUTES.PARTNER_NETWORKING}
  element={
    <ProtectedRoute requiredRole="partner">
      <PartnerNetworkingPage />
    </ProtectedRoute>
  }
/>
<Route
  path={ROUTES.PARTNER_PROFILE_EDIT}
  element={
    <ProtectedRoute requiredRole="partner">
      <PartnerProfileEditPage />
    </ProtectedRoute>
  }
/>
<Route
  path={ROUTES.PARTNER_SATISFACTION}
  element={
    <ProtectedRoute requiredRole="partner">
      <PartnerSatisfactionPage />
    </ProtectedRoute>
  }
/>
<Route
  path={ROUTES.PARTNER_SUPPORT_PAGE}
  element={
    <ProtectedRoute requiredRole="partner">
      <PartnerSupportPageComponent />
    </ProtectedRoute>
  }
/>

{/* Pages erreur */}
<Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
<Route path={ROUTES.FORBIDDEN} element={<ForbiddenPage />} />
```

---

## ✅ CHECKLIST RAPIDE

Après avoir appliqué toutes les corrections ci-dessus :

- [ ] Migration RLS v3.0 appliquée dans Supabase Dashboard
- [ ] time_slots corrigé (2 fichiers)
- [ ] partners corrigé (1 fichier, 3 sections)
- [ ] events désactivé temporairement
- [ ] conversations corrigé (1 fichier)
- [ ] Fonctions mapping ajoutées
- [ ] Boutons demo masqués en production
- [ ] chatStore IDs corrigés
- [ ] 9 routes partenaires ajoutées
- [ ] 2 routes erreur ajoutées

---

## 🧪 TESTS APRÈS CORRECTIONS

1. **Vérifier calendrier disponibilités**
   - Page: /exhibitor/availability
   - Test: Créer un créneau → devrait fonctionner

2. **Vérifier page partenaires**
   - Page: /partners
   - Test: Affichage liste → devrait fonctionner

3. **Vérifier connexion demo masquée**
   - Page: /login
   - Build: `npm run build && npm run preview`
   - Test: Boutons demo invisibles en production

4. **Vérifier chat**
   - Page: /networking > Envoyer message
   - Test: Devrait utiliser bon user ID

5. **Vérifier routes partenaires**
   - Page: /partner/activity (et toutes les autres)
   - Test: Toutes devraient charger sans 404

---

## 📊 IMPACT ATTENDU

**Avant corrections:**
- ❌ Calendrier RDV: CASSÉ
- ❌ Page partenaires: CASSÉ
- ❌ Chat: IDs incorrects
- ❌ 9 pages: INACCESSIBLES
- ⚠️ Sécurité: Credentials exposés

**Après corrections:**
- ✅ Calendrier RDV: FONCTIONNEL
- ✅ Page partenaires: FONCTIONNEL
- ✅ Chat: IDs corrects
- ✅ Toutes pages: ACCESSIBLES
- ✅ Sécurité: Credentials masqués

---

## ⏭️ PROCHAINES ÉTAPES

Une fois ces corrections appliquées, consulter `AUDIT_COMPLET_MEGA.md` pour :

- Phase 2: Corrections majeures (Semaine 2)
- Phase 3: Corrections mineures (Semaine 3)
- Recommandations long terme

---

**Temps estimé:** 2-3 heures
**Difficulté:** Moyenne
**Impact:** CRITIQUE - Débloque l'application ✅

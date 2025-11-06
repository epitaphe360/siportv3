# GUIDE DE CORRECTION - ROUTING SIPORTV3

## FIX #1: Supprimer ou protéger `/dev/test-flow` 

**Fichier:** `src/App.tsx` (ligne ~118)

### AVANT:
```typescript
<Route path="/dev/test-flow" element={<TestFlowPage />} />
```

### APRÈS (Option A - Supprimer):
```typescript
// Supprimer complètement la ligne
```

### APRÈS (Option B - Protéger en dev seulement):
```typescript
{import.meta.env.DEV && (
  <Route path="/dev/test-flow" element={<TestFlowPage />} />
)}
```

### APRÈS (Option C - Protéger en admin seulement):
```typescript
<Route 
  path="/dev/test-flow" 
  element={
    <ProtectedRoute requiredRole="admin">
      <TestFlowPage />
    </ProtectedRoute>
  } 
/>
```

**Durée:** 5-10 minutes
**Recommandation:** Option A (supprimer) ou Option C (admin only)

---

## FIX #2: Ajouter vérification du status dans ProtectedRoute

**Fichier:** `src/components/auth/ProtectedRoute.tsx`

### AVANT:
```typescript
export default function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = ROUTES.LOGIN
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

    if (!allowedRoles.includes(user.type)) {
      return <Navigate to={ROUTES.DASHBOARD} replace />;
    }
  }

  return <>{children}</>;
}
```

### APRÈS:
```typescript
export default function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = ROUTES.LOGIN
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  // Check authentication
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} replace />;
  }

  // NEW: Check account status
  if (user.status && user.status !== 'active') {
    if (user.status === 'pending') {
      return <Navigate to={ROUTES.PENDING_ACCOUNT} replace />;
    }
    // For suspended or rejected accounts
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  // Check role authorization if required
  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

    if (!allowedRoles.includes(user.type)) {
      // NEW: Redirect to Forbidden instead of Dashboard
      return <Navigate to={ROUTES.FORBIDDEN} replace />;
    }
  }

  return <>{children}</>;
}
```

**Durée:** 15-20 minutes
**Tests requis:** Tester avec user.status = pending, suspended, active

---

## FIX #3: Ajouter routes FORBIDDEN et UNAUTHORIZED

**Fichier:** `src/lib/routes.ts`

### AVANT:
```typescript
export const ROUTES = {
  HOME: '/',
  // ... autres routes ...
} as const;
```

### APRÈS:
```typescript
export const ROUTES = {
  HOME: '/',
  // ... autres routes existantes ...
  
  // Ajout: Erreurs 401/403
  UNAUTHORIZED: '/401',
  FORBIDDEN: '/403',
} as const;
```

**Durée:** 2 minutes

---

## FIX #4: Connecter les pages 403 et 401

**Fichier:** `src/App.tsx`

### BEFORE (ligne ~150):
```typescript
// Pas d'import
// Pas de route
```

### AFTER:
```typescript
// Ajouter dans les imports (haut du fichier)
const UnauthorizedPage = React.lazy(() => import('./pages/UnauthorizedPage'));
const ForbiddenPage = React.lazy(() => import('./pages/ForbiddenPage'));

// Ajouter les routes (après les routes publiques, avant le catch-all):
<Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
<Route path={ROUTES.FORBIDDEN} element={<ForbiddenPage />} />
```

**Durée:** 5 minutes

---

## FIX #5: Ajouter route hardcodée à ROUTES

**Fichier:** `src/lib/routes.ts`

### AVANT:
```typescript
ADMIN_CONTENT: '/admin/content',
CONTACT: '/contact',
// Missing: ADMIN_PARTNERS
```

### APRÈS:
```typescript
ADMIN_CONTENT: '/admin/content',
ADMIN_PARTNERS: '/admin/partners',  // NEW
CONTACT: '/contact',
```

**Fichier:** `src/App.tsx` (ligne ~143)

### AVANT:
```typescript
<Route path="/admin/partners" element={<ProtectedRoute requiredRole="admin"><AdminPartnersPage /></ProtectedRoute>} />
```

### APRÈS:
```typescript
<Route path={ROUTES.ADMIN_PARTNERS} element={<ProtectedRoute requiredRole="admin"><AdminPartnersPage /></ProtectedRoute>} />
```

**Durée:** 5 minutes

---

## FIX #6: Créer routes PARTNER de base

**Fichier:** `src/lib/routes.ts`

### AJOUT:
```typescript
// After EXHIBITOR routes, add PARTNER routes:
PARTNER_PROFILE: '/partner/profile',
PARTNER_DASHBOARD: '/partner/dashboard',
PARTNER_CONTRACTS: '/partner/contracts',
PARTNER_PROJECTS: '/partner/projects',
```

**Fichier:** `src/App.tsx`

### AJOUT (après les routes exhibitor):
```typescript
{/* Partner routes - require partner role */}
<Route 
  path={ROUTES.PARTNER_PROFILE} 
  element={<ProtectedRoute requiredRole="partner"><ProfilePage /></ProtectedRoute>} 
/>
<Route 
  path={ROUTES.PARTNER_DASHBOARD} 
  element={<ProtectedRoute requiredRole="partner"><PartnerDashboard /></ProtectedRoute>} 
/>
<Route 
  path={ROUTES.PARTNER_CONTRACTS} 
  element={<ProtectedRoute requiredRole="partner"><PartnerContractsPage /></ProtectedRoute>} 
/>
<Route 
  path={ROUTES.PARTNER_PROJECTS} 
  element={<ProtectedRoute requiredRole="partner"><PartnerProjectsPage /></ProtectedRoute>} 
/>
```

**Note:** Les pages PartnerDashboard, PartnerContractsPage, PartnerProjectsPage doivent être créées

**Durée:** 3-4 heures (création des pages)

---

## FIX #7: Supprimer routes doublons

**Fichier:** `src/lib/routes.ts`

### AVANT:
```typescript
MESSAGES: '/messages',
CHAT: '/chat',        // DUPLICATE
APPOINTMENTS: '/appointments',
CALENDAR: '/calendar', // DUPLICATE
```

### APRÈS:
```typescript
MESSAGES: '/messages',
// CHAT supprimé
APPOINTMENTS: '/appointments',
// CALENDAR supprimé
```

**Fichier:** `src/App.tsx`

### AVANT:
```typescript
<Route path={ROUTES.MESSAGES} element={<ProtectedRoute><ChatInterface /></ProtectedRoute>} />
<Route path={ROUTES.CHAT} element={<ProtectedRoute><ChatInterface /></ProtectedRoute>} />
<Route path={ROUTES.APPOINTMENTS} element={<ProtectedRoute><AppointmentCalendar /></ProtectedRoute>} />
<Route path={ROUTES.CALENDAR} element={<ProtectedRoute><AppointmentCalendar /></ProtectedRoute>} />
```

### APRÈS:
```typescript
<Route path={ROUTES.MESSAGES} element={<ProtectedRoute><ChatInterface /></ProtectedRoute>} />
<Route path={ROUTES.APPOINTMENTS} element={<ProtectedRoute><AppointmentCalendar /></ProtectedRoute>} />
```

**Durée:** 10 minutes

---

## FIX #8: Nettoyer pages orphelines

### Pages à supprimer:
```
src/pages/VisitorUpgrade.tsx
src/pages/VisitorSubscriptionPage.tsx
src/pages/EnhancedNetworkingPage.tsx
src/pages/admin/ActivityPage_refactored.tsx
src/pages/admin/MediaManagerPage.tsx (si vraiment pas utilisée)
```

### Pages à corriger:
- `VisitorSubscription.tsx` → Créer route `/visitor/subscription`
- `ProductDetailPage.tsx` → Créer route `/exhibitors/:id/products/:productId`

**Durée:** 30 minutes

---

## FIX #9: Ajouter validation de paramètres

**Fichier:** `src/hooks/useValidatedParams.ts` (NOUVEAU)

```typescript
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

export function useValidatedParams(
  validators: Record<string, (value: string) => boolean>
) {
  const params = useParams<Record<string, string>>();
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    const allValid = Object.entries(validators).every(([key, validator]) => {
      const value = params[key];
      return value ? validator(value) : false;
    });
    setIsValid(allValid);
  }, [params, validators]);

  return { params, isValid };
}

// Validators
export const validateUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

export const validateNumeric = (id: string): boolean => {
  return /^\d+$/.test(id);
};
```

**Fichier:** `src/pages/ExhibitorDetailPage.tsx`

### BEFORE:
```typescript
export default function ExhibitorDetailPage() {
  const { id } = useParams<{ id: string }>();
  // ...
}
```

### AFTER:
```typescript
import { useValidatedParams, validateUUID } from '../hooks/useValidatedParams';
import { Navigate } from 'react-router-dom';
import { ROUTES } from '../lib/routes';

export default function ExhibitorDetailPage() {
  const { params, isValid } = useValidatedParams({ id: validateUUID });
  
  if (!isValid) {
    return <Navigate to={ROUTES.HOME} replace />;
  }
  
  const id = params.id;
  // ... reste du code
}
```

**Durée:** 2-3 heures

---

## FIX #10: Ajouter redirection post-login

**Fichier:** `src/components/auth/LoginPage.tsx`

### AVANT:
```typescript
const handleLoginSuccess = (user: User) => {
  navigate(ROUTES.DASHBOARD);
};
```

### APRÈS:
```typescript
const handleLoginSuccess = (user: User) => {
  // Get redirect parameter from URL
  const params = new URLSearchParams(window.location.search);
  const redirectTo = params.get('redirect');
  
  if (redirectTo) {
    try {
      // Decode and validate redirect URL
      const decodedUrl = decodeURIComponent(redirectTo);
      // Basic validation: should start with /
      if (decodedUrl.startsWith('/') && !decodedUrl.includes('..')) {
        navigate(decodedUrl);
        return;
      }
    } catch (e) {
      console.error('Invalid redirect URL:', e);
    }
  }
  
  navigate(ROUTES.DASHBOARD);
};
```

**Durée:** 20 minutes

---

## PLAN DE DÉPLOIEMENT RECOMMANDÉ

### Jour 1 (2-3 heures)
1. ✅ FIX #1: Supprimer/protéger `/dev/test-flow`
2. ✅ FIX #2: Ajouter vérification status
3. ✅ FIX #3: Ajouter routes FORBIDDEN/UNAUTHORIZED
4. ✅ FIX #4: Connecter pages 401/403
5. ✅ FIX #5: Ajouter ADMIN_PARTNERS à ROUTES

→ **Commit:** "security: Fix critical routing vulnerabilities"

### Jour 2 (4-5 heures)
6. ✅ FIX #6: Créer routes PARTNER + pages
7. ✅ FIX #7: Supprimer routes doublons
8. ✅ FIX #8: Nettoyer pages orphelines

→ **Commit:** "refactor: Add partner routes and clean up orphaned pages"

### Jour 3+ (4-5 heures)
9. ✅ FIX #9: Ajouter validation paramètres
10. ✅ FIX #10: Ajouter redirection post-login

→ **Commit:** "feat: Add parameter validation and post-login redirects"

---

## TESTS À FAIRE APRÈS CORRECTIONS

### Test #1: Test de sécurité
```bash
# Vérifier que /dev/test-flow n'est pas accessible
curl http://localhost:5173/dev/test-flow
# Devrait: 404 ou Redirect
```

### Test #2: Test du statut pending
```
1. Register new user
2. Try to access /dashboard
3. Devrait rediriger vers /pending-account ✓
```

### Test #3: Test des rôles
```
1. Login as visitor
2. Try to access /exhibitor/dashboard
3. Devrait rediriger vers /403 ✓
```

### Test #4: Test des paramètres invalides
```
1. Access /exhibitors/invalid-uuid
2. Devrait rediriger vers home ✓
```

### Test #5: Test post-login redirect
```
1. Access /exhibitor/dashboard (pas connecté)
2. Redirection vers /login?redirect=%2Fexhibitor%2Fdashboard
3. Login
4. Devrait rediriger vers /exhibitor/dashboard ✓
```

---

## CHECKLIST DE VÉRIFICATION

- [ ] Tous les fixes compilent sans erreur
- [ ] Pas de regression sur routes existantes
- [ ] Pages 401/403 affichent correctement
- [ ] Routes doublons supprimées
- [ ] Pages orphelines nettoyées
- [ ] Routes PARTNER créées
- [ ] Tests E2E passent
- [ ] Code review approuvé
- [ ] Deployed en staging
- [ ] UAT réussie


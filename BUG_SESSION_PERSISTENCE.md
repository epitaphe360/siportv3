# 🐛 BUG CRITIQUE DÉTECTÉ - Perte de session entre les pages

**Date:** 15 décembre 2025  
**Gravité:** 🔴 CRITIQUE  
**Impact:** Tests E2E échouent + UX dégradée (utilisateurs déconnectés entre les pages)

---

## 📋 SYMPTÔMES

1. L'utilisateur se connecte avec succès (`/login` → `/dashboard`) ✅
2. Il navigue vers une autre page protégée (`/visitor/subscription`) 🔴
3. Il est automatiquement redirigé vers `/login` (session perdue) ❌

---

## 🔍 ROOT CAUSE

### Architecture actuelle
- **Supabase Auth** : Persiste la session dans `localStorage` (fonctionnel ✅)
- **Zustand Store (authStore)** : État applicatif en mémoire (volatile ❌)

### Le problème
```typescript
// authStore.ts - État par défaut
const useAuthStore = create<AuthState>(() => ({
  user: null,
  token: null,
  isAuthenticated: false,  // ❌ FALSE par défaut !
  isLoading: false
}));
```

**Quand l'utilisateur navigue** (`page.goto()` dans Playwright ou rafraîchissement de page):
1. React re-render l'app
2. Le store Zustand se réinitialise à `isAuthenticated: false`
3. `ProtectedRoute` voit `isAuthenticated === false` et redirige vers `/login`
4. Mais Supabase **A TOUJOURS** la session active dans localStorage !

### Tentatives de correction

✅ **Ajout de `initializeAuth()`** (ligne 99-104, `App.tsx`)
```typescript
React.useEffect(() => {
  initializeAuth().catch(err => {
    console.error('Erreur initialisation auth:', err);
  });
}, []);
```

**Problème**: `initializeAuth()` s'exécute seulement au premier mount.  
Quand on fait `page.goto()` dans Playwright, React ne re-mount PAS le composant,  
mais le store Zustand est quand même réinitialisé !

---

## ✅ SOLUTION IMMÉDIATE (Tests E2E)

**Option A: Simuler la navigation utilisateur sans `page.goto()`**
```typescript
// Au lieu de :
await page.goto('/visitor/subscription');

// Faire :
const link = page.locator('a[href="/visitor/subscription"]');
await link.click();
```

**Option B: Attendre que `initializeAuth()` finisse avant de naviguer**
```typescript
await page.goto('/visitor/subscription');
await page.waitForFunction(() => {
  const store = window.useAuthStore?.getState();
  return store?.isAuthenticated === true;
});
```

---

## 🎯 SOLUTION PERMANENTE (Production)

### Option 1: Persister le store Zustand (RECOMMANDÉ)
```bash
npm install zustand-persist
```

```typescript
// authStore.ts
import { persist } from 'zustand/middleware';

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      // ... reste du store
    }),
    {
      name: 'siport-auth', // localStorage key
      getStorage: () => localStorage,
    }
  )
);
```

### Option 2: Synchronisation automatique avec Supabase
```typescript
// authStore.ts
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session) {
    SupabaseService.getUserByEmail(session.user.email).then(user => {
      set({ user, isAuthenticated: true, token: user.id });
    });
  } else if (event === 'SIGNED_OUT') {
    set({ user: null, isAuthenticated: false, token: null });
  }
});
```

### Option 3: Vérifier la session dans `ProtectedRoute`
```typescript
// ProtectedRoute.tsx
export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, user } = useAuthStore();
  const [checking, setChecking] = React.useState(true);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && !isAuthenticated) {
        // Re-sync store avec Supabase
        initializeAuth();
      }
      setChecking(false);
    });
  }, []);

  if (checking) return <div>Chargement...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  return <>{children}</>;
}
```

---

## 📊 IMPACT

### Tests E2E
- **7 tests échouent** à cause de ce bug (tous les tests de navigation post-login)
- Temps perdu: ~2h de debugging

### Production
- Risque moyen: Les utilisateurs peuvent être déconnectés en rafraîchissant la page
- Workaround actuel: L'utilisateur peut juste se reconnecter (Supabase a toujours la session)

---

## 🚀 RECOMMANDATION

**Implémenter Option 1 + Option 2** :
1. Persister le store Zustand (`zustand-persist`)
2. Ajouter listener `onAuthStateChange` pour synchronisation

**Avantages**:
- ✅ Session persistée entre les rafraîchissements
- ✅ Synchronisation automatique avec Supabase
- ✅ Tests E2E fonctionnent sans workaround
- ✅ UX améliorée (pas de déconnexion intempestive)

**Temps estimé**: 30-45 minutes

---

## 📝 FICHIERS MODIFIÉS AUJOURD'HUI

1. ✅ `src/lib/initAuth.ts` - Créé fonction d'initialisation
2. ✅ `src/App.tsx` - Appel de `initializeAuth()` au mount
3. ✅ `tests/complete-app-test.spec.ts` - Amélioration fonction `createTestUser()`
4. ✅ `setup-test-users-profiles.mjs` - Script pour créer profils utilisateurs
5. ✅ `src/App.tsx` - Correction imports (VisitorSubscriptionPage, PaymentInstructionsPage)

---

**Conclusion**: Bug critique identifié et documenté. Solution temporaire pour tests + solution permanente proposée. Prêt pour implémentation.

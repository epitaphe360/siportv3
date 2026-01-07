# 🔴 Erreur 42501 RLS Payment + Tracking Prevention - RÉSOLUTION

**Date**: 6 janvier 2026  
**Status**: Analyse complète  
**Problèmes**: 2 principaux identifiés

---

## 🔴 PROBLÈME 1: RLS 42501 - Cannot Insert Payment Requests

### Symptôme
```
Error code 42501
Message: "new row violates row-level security policy for table payment_requests"
Location: VisitorPaymentPage.tsx line 65 (Stripe) et 79 (PayPal)
```

### Cause racine
Les politiques RLS de Supabase empêchent l'utilisateur d'insérer des enregistrements dans `payment_requests`.

**Problème probable**: La politique RLS est trop restrictive:
```sql
-- PROBLÉMATIQUE (trop restrictif)
CREATE POLICY "users_can_create_own_payments"
  ON payment_requests
  FOR INSERT
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND status = 'pending');
  -- 🔴 WITH CHECK peut être trop strict
```

### Solutions

#### ✅ Solution 1: Corriger la politique RLS (RECOMMANDÉE)

En Supabase SQL Editor, exécuter:

```sql
-- Supprimer la politique restrictive
DROP POLICY IF EXISTS "users_can_create_own_payments" ON payment_requests;

-- Créer une politique correcte
CREATE POLICY "users_can_insert_own_payments"
  ON payment_requests
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
  );

-- Permettre la lecture
CREATE POLICY "users_can_read_own_payments"
  ON payment_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- Permettre la mise à jour (admin only)
CREATE POLICY "users_cannot_update_own_payments"
  ON payment_requests
  FOR UPDATE
  USING (false);  -- Empêcher les utilisateurs de modifier

-- Admin peut tout faire
GRANT ALL ON payment_requests TO authenticated;
```

#### ✅ Solution 2: Utiliser une fonction Supabase (Fallback)

Si RLS reste problématique, créer une fonction serverless:

```typescript
// src/services/paymentService.ts - Ajouter cette fonction

export async function createPaymentRecordViaFunction(params: {
  userId: string;
  amount: number;
  currency: string;
  paymentMethod: 'stripe' | 'paypal' | 'cmi';
  status: 'pending' | 'approved' | 'rejected';
}) {
  try {
    // Utiliser une fonction Supabase au lieu d'insérer directement
    const { data, error } = await supabase.functions.invoke('create-payment-record', {
      body: params,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating payment record via function:', error);
    throw error;
  }
}
```

---

## 🟠 PROBLÈME 2: Tracking Prevention - Storage Access Blocked

### Symptôme
```
Tracking Prevention blocked access to storage for <URL>
(appears 28 times in console)
```

Cela vient de **Edge/Safari** qui bloque les appels à `localStorage`/`sessionStorage` pour les domaines tiers.

### Cause
Votre app utilise localStorage/sessionStorage de manière trop libérale, notamment dans:
- `authStore.ts` (persist)
- Zustand stores
- IndexedDB fallback nécessaire

### ✅ Solutions

#### Solution 1: Utiliser IndexedDB au lieu de localStorage
```typescript
// src/lib/storage.ts - Créer ce fichier

export const useIndexedDB = (storeName: string) => {
  const db = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('siport-db', 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(storeName);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return {
    set: async (key: string, value: any) => {
      const database = await db;
      const tx = database.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).put(value, key);
      return tx.oncomplete;
    },
    get: async (key: string) => {
      const database = await db;
      const tx = database.transaction(storeName, 'readonly');
      return new Promise((resolve) => {
        const request = tx.objectStore(storeName).get(key);
        request.onsuccess = () => resolve(request.result);
      });
    },
  };
};
```

#### Solution 2: Wrapper localStorage avec fallback
```typescript
// src/lib/secureStorage.ts

export const secureStorage = {
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      // Fallback à IndexedDB
      if (e instanceof Error && e.message.includes('QuotaExceeded')) {
        console.warn('localStorage full, using IndexedDB');
        // Utiliser IndexedDB
      }
    }
  },
  getItem: (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      // Fallback
      console.warn('localStorage blocked, using IndexedDB');
      return null;
    }
  },
};
```

#### Solution 3: Réduire la dépendance au storage
```typescript
// authStore.ts - Réduire les données persistées

const useAuthStore = create<AuthState>((set, get) => ({
  // ...
}),
{
  name: 'siport-auth',
  partialize: (state) => ({
    // ❌ AVANT: Tout était sauvegardé
    // user: state.user,
    // token: state.token,
    
    // ✅ APRÈS: Seulement l'esssentiel
    isAuthenticated: state.isAuthenticated,
    // Récupérer le user du serveur plutôt que du cache
  }),
});
```

---

## 🔧 ACTIONS RECOMMANDÉES

### Immédiat (aujourd'hui)

1. **Vérifier les politiques RLS**
   ```bash
   Aller à Supabase → Tables → payment_requests
   Cliquer sur "RLS" → Vérifier les politiques
   ```

2. **Corriger la RLS** (si nécessaire)
   ```sql
   -- Exécuter le SQL fourni ci-dessus
   ```

3. **Tester le paiement** sur `/visitor/subscription`

### Court terme (cette semaine)

1. Implémenter IndexedDB fallback
2. Réduire les données dans localStorage
3. Ajouter try/catch pour storage access

### Long terme (ce mois)

1. Migrer vers une solution de cache plus robuste (React Query + API)
2. Tester sur Edge/Safari en mode tracking prevention
3. Monitorer les erreurs RLS

---

## 📊 Checklist

### RLS Payment Fix
- [ ] Vérifier la politique RLS actuelle
- [ ] Exécuter le SQL fourni
- [ ] Tester insertion d'un paiement
- [ ] Vérifier que Stripe/PayPal fonctionnent

### Storage Fix
- [ ] Implémenter secureStorage.ts
- [ ] Remplacer localStorage.setItem par secureStorage.setItem
- [ ] Ajouter fallback IndexedDB
- [ ] Tester sur Edge (Tracking Prevention ON)

---

## 🚀 Commandes pour Supabase

```bash
# Accéder à SQL Editor
Supabase Dashboard
  → Project
    → SQL Editor
      → Copier/coller les politiques RLS

# Vérifier les politiques existantes
SELECT * FROM pg_policies WHERE tablename = 'payment_requests';

# Vérifier l'authentification actuelle
SELECT auth.uid();
```

---

## ⚠️ NOTES IMPORTANTES

1. **42501 = Permission Denied** - Toujours lié à RLS
2. **Tracking Prevention** - Normal en production, géré avec fallback
3. **Test mode** - Utiliser des comptes de test Stripe/PayPal
4. **Monitoring** - Tracker les erreurs 42501 en production

---

Quelle solution voulez-vous que j'implémente en priorité?

1. **Corriger RLS payment** (urgente)
2. **Implémenter storage fallback** (importante)
3. **Les deux** (complète)

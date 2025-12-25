# 💳 SYSTÈME DE PAIEMENT VISITEURS - SIPORT 2026

## 📋 Vue d'ensemble

Le système de paiement pour les visiteurs permet de passer d'un compte **GRATUIT** à un compte **VIP Premium** avec accès à des fonctionnalités exclusives.

---

## 👥 Types de Comptes Visiteurs

### 🆓 **Visiteur GRATUIT (Free)**
- **Prix** : 0€
- **Accès** :
  - ✅ Badge numérique basique
  - ✅ Accès zone exposition
  - ✅ Conférences publiques
  - ❌ Rendez-vous B2B (0 demandes)
  - ❌ Événements exclusifs
  - ❌ Ateliers spécialisés
  - ❌ Soirée gala

### 👑 **Visiteur VIP Premium**
- **Prix** : **700€** (offre de lancement au lieu de 950€)
- **Accès complet** :
  - ✅ Badge Premium avec photo et QR code sécurisé
  - ✅ Accès complet 3 jours (15-17 avril 2026)
  - ✅ **10 demandes de RDV B2B actives** (libération automatique après réponse)
  - ✅ Networking illimité
  - ✅ Invitation inauguration
  - ✅ Ateliers spécialisés
  - ✅ Soirée gala exclusive
  - ✅ Déjeuners networking
  - ✅ Conférences VIP
  - ✅ Accès lounge privé

---

## 💳 Processus de Paiement

### Étape 1 : Inscription VIP
**Page** : `/visitor/vip-registration`

L'utilisateur remplit le formulaire d'inscription VIP avec :
- Nom complet
- Email
- Téléphone
- Entreprise
- Fonction
- Type de visiteur (Individual / Freelancer / Company)

**Code backend** : `src/pages/visitor/VisitorVIPRegistration.tsx`

```typescript
// Création du compte avec statut "pending_payment"
const { data: userProfile, error: profileError } = await supabase
  .from('users')
  .insert({
    email: formData.email,
    name: formData.name,
    type: 'visitor',
    visitor_level: 'vip',        // ⚠️ Niveau VIP assigné
    status: 'pending_payment',   // ⚠️ En attente de paiement
    phone: formData.phone,
    company: formData.company,
    job_title: formData.jobTitle
  });

// Création de la demande de paiement
await supabase
  .from('payment_requests')
  .insert({
    user_id: userId,
    amount: 700,
    currency: 'EUR',
    payment_method: null,
    status: 'pending'
  });
```

### Étape 2 : Sélection du Mode de Paiement
**Page** : `/visitor/subscription`

L'utilisateur choisit parmi 3 méthodes :

#### 1️⃣ **Stripe** (Cartes Internationales)
- Visa, Mastercard, American Express
- **Paiement instantané**
- **Service** : `createStripeCheckoutSession()`
- **Endpoint** : Edge Function `create-stripe-checkout`

```typescript
export async function createStripeCheckoutSession(userId: string, userEmail: string) {
  const { data } = await supabase.functions.invoke('create-stripe-checkout', {
    body: {
      userId,
      userEmail,
      amount: 70000, // 700€ en centimes
      currency: 'eur',
      productName: 'Pass Premium VIP SIPORT 2026',
      successUrl: `${window.location.origin}/visitor/payment-success`,
      cancelUrl: `${window.location.origin}/visitor/subscription`
    }
  });
  
  // Redirection vers Stripe Checkout
  await stripe.redirectToCheckout({ sessionId: data.sessionId });
}
```

#### 2️⃣ **PayPal**
- Compte PayPal ou cartes via PayPal
- **Paiement instantané**
- **Service** : `createPayPalOrder()` + `capturePayPalOrder()`
- **Endpoint** : Edge Functions `create-paypal-order` et `capture-paypal-order`

```typescript
// 1. Créer la commande
const orderId = await createPayPalOrder(userId);

// 2. Afficher le bouton PayPal (SDK JavaScript)
<PayPalButtons
  createOrder={() => orderId}
  onApprove={async (data) => {
    await capturePayPalOrder(data.orderID, userId);
  }}
/>

// 3. Capturer le paiement
await capturePayPalOrder(orderId, userId);
```

#### 3️⃣ **CMI** (Cartes Marocaines)
- Cartes bancaires marocaines (CMI)
- **Paiement local pour le Maroc**
- **Service** : `createCMIPaymentRequest()`
- **Endpoint** : Edge Function `create-cmi-payment`

```typescript
export async function createCMIPaymentRequest(userId: string, userEmail: string) {
  const { data } = await supabase.functions.invoke('create-cmi-payment', {
    body: {
      userId,
      userEmail,
      amount: 700,
      currency: 'MAD', // Dirham marocain (conversion automatique)
      description: 'Pass Premium VIP SIPORT 2026',
      returnUrl: `${window.location.origin}/visitor/payment-success`,
      cancelUrl: `${window.location.origin}/visitor/subscription`
    }
  });
  
  // Redirection vers la passerelle CMI
  window.location.href = data.paymentUrl;
}
```

### Étape 3 : Confirmation de Paiement
**Page** : `/visitor/payment-success`

Après paiement réussi :

1. **Vérification du paiement** via webhook ou API
2. **Mise à jour du compte utilisateur** :
   - `status` : `pending_payment` → `active`
   - `visitor_level` : reste `vip`
   - Enregistrement de la transaction dans `payment_requests`

```typescript
export async function upgradeUserToVIP(userId: string, paymentDetails: any) {
  // 1. Mettre à jour le statut utilisateur
  await supabase
    .from('users')
    .update({
      status: 'active',
      visitor_level: 'vip'
    })
    .eq('id', userId);

  // 2. Enregistrer la transaction
  await supabase
    .from('payment_requests')
    .update({
      status: 'completed',
      payment_method: paymentDetails.method,
      paid_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .eq('status', 'pending');

  // 3. Envoyer email de confirmation avec badge VIP
  await supabase.functions.invoke('send-vip-confirmation-email', {
    body: { userId }
  });
}
```

3. **Génération du badge VIP**
4. **Envoi email de confirmation**

---

## 🗃️ Base de Données

### Table `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('admin', 'exhibitor', 'partner', 'visitor')),
  visitor_level TEXT CHECK (visitor_level IN ('free', 'vip')) DEFAULT 'free',
  status TEXT CHECK (status IN ('pending_payment', 'active', 'inactive')),
  phone TEXT,
  company TEXT,
  job_title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Table `payment_requests`
```sql
CREATE TABLE payment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  payment_method TEXT CHECK (payment_method IN ('stripe', 'paypal', 'cmi', 'wire_transfer')),
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔄 États du Paiement

### Statuts Utilisateur (`users.status`)
- **`pending_payment`** : Inscription VIP complétée, en attente de paiement
- **`active`** : Paiement reçu et validé, accès VIP actif
- **`inactive`** : Compte désactivé ou paiement refusé

### Statuts Transaction (`payment_requests.status`)
- **`pending`** : Demande de paiement créée, en attente
- **`processing`** : Paiement en cours de traitement (passerelle externe)
- **`completed`** : Paiement réussi et confirmé
- **`failed`** : Paiement échoué (carte refusée, fonds insuffisants, etc.)
- **`cancelled`** : Paiement annulé par l'utilisateur

---

## 📧 Emails Automatiques

### 1. Email de Confirmation d'Inscription (VIP en attente)
**Trigger** : Après inscription VIP
**Contenu** :
- Confirmation de l'inscription
- Instructions de paiement
- Lien vers la page de paiement
- Récapitulatif des avantages VIP

### 2. Email de Confirmation de Paiement
**Trigger** : Après paiement réussi
**Contenu** :
- Reçu de paiement (700€)
- Badge VIP numérique avec QR code
- Informations d'accès
- Programme de l'événement

### 3. Email de Paiement Échoué
**Trigger** : Après échec de paiement
**Contenu** :
- Notification de l'échec
- Raisons possibles (carte refusée, etc.)
- Lien pour réessayer
- Contact support

---

## 🔒 Sécurité

### Chiffrement des Paiements
- **Stripe** : PCI DSS Level 1 compliant
- **PayPal** : Sandbox et production séparés
- **CMI** : 3D Secure obligatoire

### Validation Backend
Tous les paiements sont validés côté serveur via **Edge Functions** :
- `supabase/functions/create-stripe-checkout`
- `supabase/functions/create-paypal-order`
- `supabase/functions/create-cmi-payment`
- `supabase/functions/verify-payment-webhook`

### Webhooks
Les webhooks sont configurés pour recevoir les confirmations de paiement en temps réel :
- **Stripe** : `/api/stripe-webhook`
- **PayPal** : `/api/paypal-webhook`
- **CMI** : `/api/cmi-webhook`

---

## 💡 Fonctionnalités Clés

### Upgrade En Direct (Pour Visiteurs Free)
**Page** : `/visitor/upgrade`

Un visiteur gratuit connecté peut upgrader à tout moment :

```typescript
const handleUpgrade = () => {
  if (user?.visitor_level === 'free') {
    navigate(ROUTES.VISITOR_SUBSCRIPTION);
  }
};
```

### Limitation des RDV B2B
Le système limite les demandes de RDV selon le niveau :
- **Free** : 0 demande active
- **VIP** : 10 demandes actives simultanées

```typescript
// Vérification avant création de RDV
const { count } = await supabase
  .from('appointments')
  .select('*', { count: 'exact', head: true })
  .eq('visitor_id', userId)
  .eq('status', 'pending');

if (count >= 10 && user.visitor_level === 'vip') {
  throw new Error('Limite de 10 demandes actives atteinte');
}
```

---

## 📊 Statistiques et Analytics

Les métriques de paiement sont trackées :
- Taux de conversion Free → VIP
- Méthodes de paiement préférées
- Abandons de panier
- Revenus totaux

---

## 🧪 Tests

### Comptes de Test
- **Free** : `visitor-free@test.siport.com` / `Test@123456`
- **VIP** : `visitor-vip@test.siport.com` / `Test@123456`

### Cartes de Test Stripe
- **Succès** : `4242 4242 4242 4242`
- **Échec** : `4000 0000 0000 0002`
- **3D Secure** : `4000 0027 6000 3184`

### PayPal Sandbox
- **Email** : `buyer@siport.com`
- **Password** : `test123456`

---

## 📝 Résumé des Flux

### Flux 1 : Inscription Directe VIP
```
1. Visiteur remplit formulaire VIP → /visitor/vip-registration
2. Compte créé avec status='pending_payment', visitor_level='vip'
3. Redirection vers page de paiement → /visitor/subscription
4. Sélection méthode de paiement (Stripe/PayPal/CMI)
5. Paiement validé → status='active'
6. Email confirmation + Badge VIP généré
7. Accès complet activé
```

### Flux 2 : Upgrade Visiteur Free
```
1. Visiteur Free se connecte
2. Clique sur "Passer VIP" → /visitor/upgrade
3. Redirection vers /visitor/subscription
4. Sélection méthode de paiement
5. Paiement validé → visitor_level: 'free' → 'vip'
6. Email confirmation + Badge mis à jour
7. Fonctionnalités VIP débloquées (RDV B2B, événements, etc.)
```

---

## 🛠️ Services et Fichiers Principaux

| Fichier | Description |
|---------|-------------|
| `src/services/paymentService.ts` | Service principal de paiement (Stripe, PayPal, CMI) |
| `src/pages/visitor/VisitorVIPRegistration.tsx` | Formulaire d'inscription VIP |
| `src/pages/visitor/VisitorSubscription.tsx` | Page de sélection de paiement |
| `src/pages/visitor/PaymentSuccessPage.tsx` | Page de confirmation après paiement |
| `src/pages/VisitorUpgradePage.tsx` | Page marketing pour upgrade Free→VIP |
| `supabase/functions/create-stripe-checkout/` | Edge Function Stripe |
| `supabase/functions/create-paypal-order/` | Edge Function PayPal |
| `supabase/functions/create-cmi-payment/` | Edge Function CMI |

---

## 🎯 Prochaines Améliorations

- [ ] Paiement par virement bancaire (manuel)
- [ ] Facturation automatique PDF
- [ ] Système de coupons/promos
- [ ] Paiements récurrents (abonnements annuels)
- [ ] Support Apple Pay / Google Pay
- [ ] Dashboard admin pour gérer les paiements

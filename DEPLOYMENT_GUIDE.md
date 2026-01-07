# Guide de Déploiement - SIPORT 2026

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Déploiement Edge Functions](#déploiement-edge-functions)
3. [Configuration Variables d'Environnement](#configuration-variables-denvironnement)
4. [Vérification du Déploiement](#vérification-du-déploiement)
5. [Troubleshooting](#troubleshooting)

---

## 🔧 Prérequis

### Installation Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Linux
curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar -xz
sudo mv supabase /usr/local/bin/

# Windows (PowerShell)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Login Supabase

```bash
supabase login
```

### Link au Projet

```bash
cd /home/user/siportv3
supabase link --project-ref <YOUR_PROJECT_REF>
```

---

## ⚡ Déploiement Edge Functions

### Méthode 1: CLI Supabase (Recommandée)

```bash
# Déployer toutes les fonctions en une commande
supabase functions deploy send-push-notification
supabase functions deploy generate-totp-secret
supabase functions deploy verify-totp-token

# OU déployer toutes d'un coup
supabase functions deploy
```

### Méthode 2: Dashboard Supabase (Alternative)

1. Aller sur https://app.supabase.com
2. Sélectionner votre projet
3. Aller dans **Edge Functions**
4. Cliquer sur **Create Function**
5. Pour chaque fonction:

#### send-push-notification
- **Nom:** `send-push-notification`
- **Code:** Copier le contenu de `supabase/functions/send-push-notification/index.ts`

#### generate-totp-secret
- **Nom:** `generate-totp-secret`
- **Code:** Copier le contenu de `supabase/functions/generate-totp-secret/index.ts`

#### verify-totp-token
- **Nom:** `verify-totp-token`
- **Code:** Copier le contenu de `supabase/functions/verify-totp-token/index.ts`

---

## 🔐 Configuration Variables d'Environnement

### 1. Variables Supabase (Dashboard)

Aller dans **Settings > Edge Functions > Secrets**

#### Variables Web Push (Notifications)

```bash
# Générer les clés VAPID
npm install -g web-push
web-push generate-vapid-keys
```

Ajouter dans Supabase:
```
VAPID_PUBLIC_KEY=<votre_clé_publique>
VAPID_PRIVATE_KEY=<votre_clé_privée>
VAPID_SUBJECT=mailto:admin@siports.dz
```

#### Variables existantes à vérifier

```
SUPABASE_URL=<auto_rempli>
SUPABASE_SERVICE_ROLE_KEY=<auto_rempli>
SUPABASE_ANON_KEY=<auto_rempli>
```

#### Variables Stripe (déjà configurées)

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLIC_KEY=pk_test_...
```

#### Variables PayPal (déjà configurées)

```
PAYPAL_CLIENT_ID=<votre_id>
PAYPAL_CLIENT_SECRET=<votre_secret>
PAYPAL_MODE=sandbox
```

#### Variables CMI Maroc (déjà configurées)

```
CMI_STORE_KEY=<votre_clé>
CMI_CLIENT_ID=<votre_id>
CMI_MODE=test
```

### 2. Variables Frontend (.env)

Créer/Mettre à jour `.env.local`:

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Stripe
VITE_STRIPE_PUBLIC_KEY=pk_test_...

# PayPal
VITE_PAYPAL_CLIENT_ID=your_client_id

# Google Analytics
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# App Version
VITE_APP_VERSION=1.0.0

# Mode
VITE_MODE=production
```

### 3. Configuration VAPID pour Web Push

#### Générer les clés VAPID

```bash
# Installer web-push globalement
npm install -g web-push

# Générer les clés
web-push generate-vapid-keys

# Output exemple:
# Public Key: BEl62iUYgUivxIkv69yViEuiBIa-Ib37gp
# Private Key: UUxI4O8DdXtnJDCgYUCEgA
```

#### Ajouter au service worker

Créer `public/sw.js`:

```javascript
// Service Worker pour Web Push
self.addEventListener('push', (event) => {
  const data = event.data.json();

  const options = {
    body: data.body,
    icon: data.icon || '/logo.png',
    badge: data.badge || '/badge.png',
    data: data.data,
    vibrate: [200, 100, 200],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.openWindow(urlToOpen)
  );
});
```

#### Enregistrer le service worker

Dans `src/main.tsx` ou `src/App.tsx`:

```typescript
// Enregistrer le service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then((registration) => {
      console.log('Service Worker enregistré:', registration);
    })
    .catch((error) => {
      console.error('Erreur Service Worker:', error);
    });
}
```

### 4. Variables SMS Provider (Optionnel)

Pour activer 2FA par SMS, configurer un provider (Twilio, etc.):

```bash
# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# OU autre provider (Nexmo, etc.)
SMS_PROVIDER=twilio
SMS_API_KEY=xxx
SMS_API_SECRET=xxx
```

Créer l'Edge Function `send-2fa-sms`:

```typescript
// supabase/functions/send-2fa-sms/index.ts
import { createClient } from 'npm:@supabase/supabase-js@2';

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
const TWILIO_PHONE = Deno.env.get('TWILIO_PHONE_NUMBER');

Deno.serve(async (req) => {
  const { phone, code } = await req.json();

  // Envoyer SMS via Twilio
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: phone,
        From: TWILIO_PHONE,
        Body: `Votre code 2FA SIPORTS: ${code}`,
      }),
    }
  );

  return new Response(JSON.stringify({ success: true }));
});
```

### 5. Variables Email Provider (Optionnel)

Pour les emails 2FA et notifications, utiliser Resend, SendGrid, etc.:

```bash
# Resend (recommandé)
RESEND_API_KEY=re_xxxxxxxxxxxx

# OU SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxx

# Email de l'expéditeur
EMAIL_FROM=noreply@siports.dz
```

---

## ✅ Vérification du Déploiement

### 1. Vérifier les Edge Functions

Dans le Dashboard Supabase:
1. Aller dans **Edge Functions**
2. Vérifier que les 3 fonctions sont **Deployed** (vert)
3. Tester chaque fonction avec le bouton **Invoke**

### 2. Test send-push-notification

```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/send-push-notification' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "userId": "test-user-id",
    "notification": {
      "title": "Test",
      "body": "Hello World"
    }
  }'
```

### 3. Test generate-totp-secret

```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/generate-totp-secret' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "userId": "test-user-id"
  }'
```

### 4. Test verify-totp-token

```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/verify-totp-token' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "userId": "test-user-id",
    "token": "123456"
  }'
```

### 5. Vérifier les Tables

```sql
-- Vérifier que toutes les tables existent
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'payment_transactions',
  'audit_logs',
  'two_factor_auth',
  'push_subscriptions',
  'notification_preferences',
  'search_index',
  'api_keys',
  'rate_limits',
  'feature_flags'
);

-- Vérifier les feature flags
SELECT * FROM feature_flags;

-- Vérifier une fonction
SELECT search_content('test', NULL, 5);
```

---

## 🔍 Troubleshooting

### Edge Functions ne déploient pas

**Problème:** `Error: Failed to deploy function`

**Solution:**
1. Vérifier que vous êtes connecté: `supabase login`
2. Vérifier le link: `supabase link --project-ref YOUR_REF`
3. Vérifier les permissions dans le Dashboard

### Variables d'environnement non disponibles

**Problème:** `VAPID_PUBLIC_KEY is undefined`

**Solution:**
1. Aller dans Dashboard > Settings > Edge Functions > Secrets
2. Ajouter les variables une par une
3. Redéployer les fonctions: `supabase functions deploy`

### Web Push ne fonctionne pas

**Problème:** `NotAllowedError: Registration failed`

**Solution:**
1. Vérifier que le site est en HTTPS
2. Vérifier que le service worker est enregistré
3. Vérifier les clés VAPID dans le code frontend

### TOTP QR Code ne s'affiche pas

**Problème:** `Error generating QR code`

**Solution:**
1. Vérifier que la dépendance `qrcode` est installée dans la fonction
2. Vérifier le format du secret (base32)
3. Tester avec Google Authenticator

### Rate Limiting trop strict

**Problème:** `429 Too Many Requests`

**Solution:**
```sql
-- Ajuster les limites
UPDATE rate_limits
SET max_requests = 120
WHERE identifier_type = 'user';
```

---

## 📦 Packages NPM Requis pour Edge Functions

Les Edge Functions utilisent les imports npm suivants (déjà configurés):

```typescript
// send-push-notification
import webpush from 'npm:web-push@3';

// generate-totp-secret
import * as OTPAuth from 'npm:otpauth@9';
import QRCode from 'npm:qrcode@1';

// verify-totp-token
import * as OTPAuth from 'npm:otpauth@9';

// Tous
import { createClient } from 'npm:@supabase/supabase-js@2';
```

Ces packages sont automatiquement installés par Supabase lors du déploiement.

---

## 🚀 Commandes Rapides

```bash
# Déployer tout
supabase functions deploy

# Vérifier les logs
supabase functions logs send-push-notification
supabase functions logs generate-totp-secret
supabase functions logs verify-totp-token

# Supprimer une fonction
supabase functions delete function-name

# Lister les fonctions
supabase functions list

# Tester localement
supabase functions serve send-push-notification --env-file .env.local
```

---

## 📝 Checklist de Déploiement

- [ ] Supabase CLI installé
- [ ] Login Supabase effectué
- [ ] Projet linked
- [ ] Migration SQL 20251231000001 appliquée
- [ ] 3 Edge Functions déployées
- [ ] Variables VAPID configurées
- [ ] Variables Stripe/PayPal/CMI vérifiées
- [ ] Service Worker enregistré
- [ ] Tests Edge Functions OK
- [ ] Tables vérifiées
- [ ] Feature flags vérifiés
- [ ] Documentation lue

---

## 🆘 Support

- **Documentation Supabase:** https://supabase.com/docs/guides/functions
- **Web Push API:** https://developer.mozilla.org/en-US/docs/Web/API/Push_API
- **OTPAuth:** https://github.com/hectorm/otpauth

Pour toute question, consulter `API_DOCUMENTATION.md` et `INTEGRATION_COMPLETE_2025.md`.

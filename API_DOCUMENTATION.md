# Documentation API Complète - SIPORT 2026

## Table des matières

1. [Introduction](#introduction)
2. [Authentification](#authentification)
3. [APIs Médias](#apis-médias)
4. [APIs Paiements](#apis-paiements)
5. [APIs Notifications](#apis-notifications)
6. [APIs Recherche](#apis-recherche)
7. [APIs 2FA](#apis-2fa)
8. [APIs Audit](#apis-audit)
9. [APIs Feature Flags](#apis-feature-flags)
10. [Edge Functions](#edge-functions)
11. [Webhooks](#webhooks)

---

## Introduction

Cette documentation couvre l'ensemble des APIs REST et Edge Functions disponibles dans la plateforme SIPORT 2026.

**Base URL**: `https://your-supabase-project.supabase.co`

**Format**: JSON

**Version**: 1.0

---

## Authentification

Toutes les requêtes nécessitent un token JWT valide dans le header:

```http
Authorization: Bearer <access_token>
```

### Endpoints

#### `POST /auth/v1/signup`
Créer un nouveau compte utilisateur

**Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "data": {
    "name": "John Doe",
    "type": "visitor"
  }
}
```

#### `POST /auth/v1/token`
Connexion et obtention du token

**Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

---

## APIs Médias

### Service: `mediaService`

#### Récupérer tous les médias
```typescript
mediaService.getMedia(filters?: MediaFilters): Promise<MediaContent[]>
```

**Filtres disponibles:**
- `type`: webinar | podcast | capsule_inside | live_studio | best_moments | testimonial
- `status`: draft | published | archived
- `partner_id`: UUID du partenaire sponsor
- `category`: string
- `tags`: string[]
- `search`: string
- `orderBy`: published_at | views_count | likes_count
- `order`: asc | desc
- `limit`: number
- `offset`: number

#### Créer un média
```typescript
mediaService.createMedia(data: CreateMediaRequest): Promise<MediaContent | null>
```

**Exemple:**
```typescript
const media = await mediaService.createMedia({
  type: 'webinar',
  title: 'Innovation Maritime 2026',
  description: 'Webinaire sur les innovations...',
  video_url: 'https://...',
  sponsor_partner_id: 'uuid',
  speakers: [
    {
      name: 'Dr. Smith',
      title: 'Expert Maritime',
      company: 'ACME Corp',
      photo_url: 'https://...'
    }
  ],
  status: 'published'
});
```

#### Enregistrer une interaction
```typescript
mediaService.recordInteraction(interaction: MediaInteraction): Promise<boolean>
```

**Types d'interactions:**
- `view`: Vue du média
- `like`: J'aime
- `share`: Partage
- `comment`: Commentaire
- `download`: Téléchargement

---

## APIs Paiements

### Service: `paymentService`

#### Créer une session Stripe
```typescript
createStripeCheckoutSession(userId: string, userEmail: string): Promise<{sessionId: string}>
```

#### Créer un ordre PayPal
```typescript
createPayPalOrder(userId: string): Promise<string>
```

#### Créer un paiement CMI
```typescript
createCMIPaymentRequest(userId: string, userEmail: string): Promise<{url: string}>
```

#### Vérifier le statut de paiement
```typescript
checkPaymentStatus(userId: string): Promise<{
  hasPaid: boolean;
  paymentMethod?: string;
  paidAt?: string;
}>
```

#### Historique des paiements
```typescript
getPaymentHistory(userId: string): Promise<PaymentTransaction[]>
```

---

## APIs Notifications

### Service: `notificationService`

#### Créer une notification
```typescript
notificationService.createNotification({
  user_id: string,
  title: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'error',
  category: string,
  action_url?: string,
  metadata?: Record<string, any>
}): Promise<Notification | null>
```

#### Récupérer les notifications
```typescript
notificationService.getUserNotifications(
  userId: string,
  options?: {
    unreadOnly?: boolean;
    limit?: number;
    offset?: number;
  }
): Promise<Notification[]>
```

#### S'abonner en temps réel
```typescript
notificationService.subscribeToNotifications(
  userId: string,
  callback: (notification: Notification) => void
): void
```

#### Marquer comme lu
```typescript
notificationService.markAsRead(notificationId: string): Promise<boolean>
notificationService.markAllAsRead(userId: string): Promise<boolean>
```

#### Notifications push
```typescript
// Enregistrer un abonnement push
notificationService.registerPushSubscription(
  userId: string,
  subscription: PushSubscription
): Promise<boolean>

// Envoyer une notification push
notificationService.sendPushNotification(
  userId: string,
  notification: {
    title: string;
    body: string;
    icon?: string;
    data?: Record<string, any>;
  }
): Promise<boolean>
```

---

## APIs Recherche

### Service: `searchService`

#### Recherche globale
```typescript
searchService.search(
  query: string,
  filters?: {
    entity_types?: string[];
    limit?: number;
    offset?: number;
  }
): Promise<SearchResult[]>
```

#### Recherches spécialisées
```typescript
searchService.searchExhibitors(query: string): Promise<SearchResult[]>
searchService.searchProducts(query: string): Promise<SearchResult[]>
searchService.searchEvents(query: string): Promise<SearchResult[]>
searchService.searchArticles(query: string): Promise<SearchResult[]>
searchService.searchMedia(query: string): Promise<SearchResult[]>
```

#### Suggestions
```typescript
searchService.getSuggestions(query: string, limit?: number): Promise<string[]>
```

#### Indexation
```typescript
// Indexer un contenu
searchService.indexContent({
  entityType: string,
  entityId: string,
  title: string,
  content?: string,
  keywords?: string[],
  boostScore?: number
}): Promise<boolean>

// Réindexer tous les contenus
searchService.reindexAll(): Promise<{
  exhibitors: number;
  events: number;
  articles: number;
  media: number;
  total: number;
}>
```

---

## APIs 2FA

### Service: `twoFactorAuthService`

#### TOTP (Google Authenticator)
```typescript
// Générer un secret TOTP
twoFactorAuthService.generateTOTPSecret(userId: string): Promise<{
  secret: string;
  qrCode: string;
}>

// Vérifier et activer TOTP
twoFactorAuthService.verifyAndEnableTOTP(
  userId: string,
  token: string
): Promise<{
  success: boolean;
  backupCodes?: string[];
}>

// Vérifier un token TOTP
twoFactorAuthService.verifyTOTP(
  userId: string,
  token: string
): Promise<boolean>

// Désactiver TOTP
twoFactorAuthService.disableTOTP(userId: string): Promise<boolean>
```

#### SMS
```typescript
// Envoyer un code par SMS
twoFactorAuthService.sendSMSCode(
  userId: string,
  phone: string
): Promise<boolean>

// Vérifier le code SMS
twoFactorAuthService.verifySMSCode(
  userId: string,
  code: string
): Promise<boolean>

// Activer 2FA par SMS
twoFactorAuthService.enableSMS(
  userId: string,
  phone: string
): Promise<boolean>
```

#### Email
```typescript
// Envoyer un code par email
twoFactorAuthService.sendEmailCode(
  userId: string,
  email: string
): Promise<boolean>

// Vérifier le code email
twoFactorAuthService.verifyEmailCode(
  userId: string,
  code: string
): Promise<boolean>
```

#### Codes de backup
```typescript
// Vérifier un code de backup
twoFactorAuthService.verifyBackupCode(
  userId: string,
  code: string
): Promise<boolean>
```

---

## APIs Audit

### Service: `auditService`

#### Logger une action
```typescript
auditService.log({
  userId?: string,
  actorId?: string,
  action: string,
  entityType: string,
  entityId?: string,
  oldValues?: Record<string, any>,
  newValues?: Record<string, any>,
  ipAddress?: string,
  severity?: 'debug' | 'info' | 'warning' | 'error' | 'critical'
}): Promise<string | null>
```

#### Récupérer les logs
```typescript
auditService.getLogs(filters?: {
  user_id?: string;
  action?: string;
  entity_type?: string;
  severity?: string[];
  start_date?: string;
  end_date?: string;
  limit?: number;
}): Promise<AuditLog[]>
```

#### Logs pré-définis
```typescript
auditService.logLogin(userId: string, ipAddress?: string): Promise<void>
auditService.logLogout(userId: string): Promise<void>
auditService.logPasswordChange(userId: string): Promise<void>
auditService.logPayment(userId: string, transactionId: string, amount: number): Promise<void>
auditService.logSecurityEvent(userId: string, event: string, severity: string): Promise<void>
```

---

## APIs Feature Flags

### Service: `featureFlagService`

#### Vérifier si une fonctionnalité est activée
```typescript
featureFlagService.isEnabled(
  flagKey: string,
  userId?: string
): Promise<boolean>
```

#### Gérer les flags
```typescript
// Créer un flag
featureFlagService.createFlag({
  key: string,
  name: string,
  description?: string,
  is_enabled?: boolean,
  rollout_percentage?: number
}): Promise<FeatureFlag | null>

// Activer/Désactiver
featureFlagService.enableFlag(flagKey: string): Promise<boolean>
featureFlagService.disableFlag(flagKey: string): Promise<boolean>

// Définir le rollout
featureFlagService.setRolloutPercentage(
  flagKey: string,
  percentage: number
): Promise<boolean>

// Ajouter des utilisateurs/rôles spécifiques
featureFlagService.addUserToFlag(flagKey: string, userId: string): Promise<boolean>
featureFlagService.addRoleToFlag(flagKey: string, role: string): Promise<boolean>
```

---

## Edge Functions

### Liste des Edge Functions disponibles

#### `stripe-webhook`
Traite les webhooks Stripe pour les paiements

**Endpoint:** `/functions/v1/stripe-webhook`

#### `cmi-webhook`
Traite les webhooks CMI pour les paiements locaux Maroc

**Endpoint:** `/functions/v1/cmi-webhook`

#### `paypal-webhook`
Traite les webhooks PayPal

**Endpoint:** `/functions/v1/paypal-webhook`

#### `send-push-notification`
Envoie des notifications push Web Push

**Endpoint:** `/functions/v1/send-push-notification`

**Body:**
```json
{
  "userId": "uuid",
  "notification": {
    "title": "Titre",
    "body": "Message",
    "icon": "/icon.png",
    "data": {}
  }
}
```

#### `generate-totp-secret`
Génère un secret TOTP pour 2FA

**Endpoint:** `/functions/v1/generate-totp-secret`

**Body:**
```json
{
  "userId": "uuid"
}
```

**Response:**
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCodeUrl": "data:image/png;base64,..."
}
```

#### `verify-totp-token`
Vérifie un token TOTP

**Endpoint:** `/functions/v1/verify-totp-token`

**Body:**
```json
{
  "userId": "uuid",
  "token": "123456"
}
```

**Response:**
```json
{
  "valid": true
}
```

---

## Webhooks

### Stripe Webhook

**Event:** `checkout.session.completed`

**Actions automatiques:**
1. Mise à jour du `visitor_level` de l'utilisateur
2. Génération du badge visiteur
3. Envoi de l'email de confirmation
4. Activation du compte
5. Création d'une notification
6. Enregistrement de la transaction

### CMI Webhook

**Event:** Callback de paiement

**Paramètres:**
- `oid`: Order ID
- `tranid`: Transaction ID
- `response`: Approved | Declined
- `AuthCode`: Code d'autorisation
- `amount`: Montant
- `HASH`: Signature de sécurité

**Actions automatiques:** Identiques à Stripe

### PayPal Webhook

**Event:** `PAYMENT.CAPTURE.COMPLETED`

**Actions automatiques:** Identiques à Stripe

---

## Codes d'erreur

| Code | Description |
|------|-------------|
| 400 | Requête invalide |
| 401 | Non authentifié |
| 403 | Non autorisé |
| 404 | Ressource introuvable |
| 429 | Rate limit dépassé |
| 500 | Erreur serveur |

---

## Rate Limiting

- **Visiteurs anonymes:** 60 requêtes/minute
- **Utilisateurs authentifiés:** 120 requêtes/minute
- **API Keys:** 1000 requêtes/heure

---

## Exemples d'utilisation

### Créer et envoyer une notification

```typescript
// 1. Créer la notification
const notification = await notificationService.createNotification({
  user_id: '123e4567-e89b-12d3-a456-426614174000',
  title: 'Nouveau message',
  message: 'Vous avez reçu un nouveau message',
  type: 'info',
  category: 'message',
  action_url: '/messages/456'
});

// 2. Envoyer par push (automatique si abonné)
// La notification push est envoyée automatiquement lors de la création
```

### Recherche full-text

```typescript
// Recherche globale
const results = await searchService.search('innovation maritime', {
  entity_types: ['exhibitor', 'event', 'media_content'],
  limit: 20
});

// Recherche spécialisée
const exhibitors = await searchService.searchExhibitors('maritime');
```

### Activer 2FA

```typescript
// 1. Générer le secret
const { secret, qrCode } = await twoFactorAuthService.generateTOTPSecret(userId);

// 2. Afficher le QR code à l'utilisateur
// L'utilisateur scanne avec Google Authenticator

// 3. Vérifier le premier token
const { success, backupCodes } = await twoFactorAuthService.verifyAndEnableTOTP(
  userId,
  '123456' // Token entré par l'utilisateur
);

// 4. Sauvegarder les codes de backup
if (success) {
  console.log('Codes de backup:', backupCodes);
}
```

### Feature flags

```typescript
// Vérifier si une fonctionnalité est activée
const isEnabled = await featureFlagService.isEnabled('networking_ai', userId);

if (isEnabled) {
  // Afficher la fonctionnalité AI
  showAINetworking();
}
```

---

## Support

Pour toute question ou problème, contactez:
- Email: dev@siports.dz
- Docs: https://docs.siports.dz
- GitHub: https://github.com/siports/api

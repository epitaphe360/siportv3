# Système de Badge avec QR Code - SIPORTS 2026

## Vue d'ensemble

Ce système implémente des badges numériques avec QR code pour **tous les types d'utilisateurs** :
- 👥 **Visiteurs** (Pass Gratuit et Pass Premium VIP)
- 🏢 **Exposants**
- 🤝 **Partenaires**
- 🔑 **Administrateurs**

## Architecture

### 1. Base de données

**Table : `user_badges`**
- Stocke les informations du badge pour chaque utilisateur
- QR code unique généré automatiquement
- Niveaux d'accès différenciés (standard, vip, exhibitor, partner, admin)
- Système de scan avec compteur
- Dates de validité configurables

**Fonctions SQL :**
- `generate_badge_code(user_id)` : Génère un code unique pour le QR
- `upsert_user_badge(...)` : Crée ou met à jour un badge
- `scan_badge(badge_code)` : Scanne un badge (incrémente le compteur)

**Triggers automatiques :**
- Génération automatique du badge lors de la création d'un utilisateur actif
- Mise à jour automatique lors du changement de `visitor_level`
- Synchronisation avec les tables `exhibitors` et `partners`

### 2. Services

**`src/services/badgeService.ts`**

Fonctions principales :
```typescript
getUserBadge(userId)              // Récupère le badge d'un utilisateur
generateBadgeFromUser(userId)     // Génère automatiquement un badge
upsertUserBadge(params)           // Crée ou met à jour un badge
verifyBadgeByCode(badgeCode)      // Vérifie la validité d'un badge
scanBadge(badgeCode)              // Scanne un badge (entrée salon)
getBadgeColor(accessLevel)        // Couleur du badge selon le niveau
getAccessLevelLabel(accessLevel)  // Libellé du niveau d'accès
```

### 3. Interface utilisateur

**Page : `/badge`** (`src/pages/BadgePage.tsx`)

Fonctionnalités :
- ✅ Affichage du badge personnel avec QR code
- ✅ Téléchargement en PNG (via html2canvas)
- ✅ Impression du badge
- ✅ Régénération du badge
- ✅ Statistiques de scan
- ✅ Instructions d'utilisation

## Types de Pass Visiteur

### Pass Gratuit (free)
```
- Accès : Zone exposition, conférences publiques
- Networking : 0 rendez-vous B2B (quota = 0)
- Badge : Niveau "standard" (vert)
- Inscription : Gratuite, validation automatique
```

### Pass Premium VIP (premium, 700€)
```
- Accès : Complet 3 jours, événements VIP
- Networking : Illimité (quota = ∞)
- Badge : Niveau "vip" (or)
- Inscription : Paiement par virement bancaire
- Avantages :
  * Invitation inauguration
  * RDV B2B illimités
  * Ateliers spécialisés
  * Soirée gala exclusive
  * Déjeuners networking
```

## Workflow d'inscription

### 1. Inscription visiteur

```
Utilisateur s'inscrit
    ↓
Compte créé (status = 'active' pour visiteurs)
    ↓
Trigger DB détecte nouvelle inscription
    ↓
Badge généré automatiquement
    ↓
Utilisateur peut accéder à /badge
```

### 2. Inscription exposant/partenaire

```
Utilisateur s'inscrit
    ↓
Demande de validation créée (registration_requests)
    ↓
Admin valide le compte
    ↓
Status passe à 'active'
    ↓
Trigger DB génère le badge
    ↓
Création du profil exhibitor/partner
    ↓
Trigger DB met à jour le badge avec infos entreprise
```

### 3. Upgrade Pass Visiteur (Free → Premium)

```
Visiteur sur /visitor/subscription
    ↓
Sélectionne Pass Premium (700€)
    ↓
Crée payment_request (virement bancaire)
    ↓
Redirigé vers /visitor/payment-instructions
    ↓
Soumet preuve de paiement
    ↓
Admin valide le paiement
    ↓
visitor_level passe de 'free' à 'premium'
    ↓
Trigger DB met à jour le badge (niveau vip)
```

## Niveaux d'accès Badge

| Access Level | Type utilisateur | Couleur | Accès |
|-------------|------------------|---------|-------|
| `standard` | Visiteur Free | Vert | Zone exposition, conférences publiques |
| `vip` | Visiteur Premium | Or | Accès complet + événements VIP |
| `exhibitor` | Exposant | Bleu | Zone exposants + stand |
| `partner` | Partenaire | Violet | Zones partenaires + événements |
| `admin` | Administrateur | Rouge | Accès illimité |

## Données QR Code

Le QR code contient (JSON encodé) :
```json
{
  "code": "A1B2C3-D4E5F6",
  "userId": "uuid",
  "type": "visitor|exhibitor|partner|admin",
  "level": "standard|vip|exhibitor|partner|admin",
  "validUntil": "2026-XX-XXTXX:XX:XX.XXXZ"
}
```

## Utilisation

### Pour l'utilisateur

1. **Accéder au badge** : `/badge`
2. **Télécharger** : Clic sur "Télécharger PNG"
3. **Imprimer** : Clic sur "Imprimer" (format optimisé)
4. **À l'entrée** : Présenter le QR code pour scan

### Pour le personnel (scan)

```typescript
import { scanBadge, verifyBadgeByCode } from '@/services/badgeService';

// Vérifier sans scanner
const badge = await verifyBadgeByCode(qrCodeValue);

// Scanner (incrémente compteur)
const badge = await scanBadge(qrCodeValue);
```

## Corrections apportées

### Networking - Incohérence des quotas

**Problème** : NetworkingPage définissait ses propres quotas différents de `quotas.ts`

**Solution** : Utilisation centralisée via `getVisitorQuota()` depuis `@/config/quotas`

Avant :
```typescript
const quotas = { free: 0, basic: 2, premium: 5, vip: 99 }; // ❌ Incohérent
```

Après :
```typescript
import { getVisitorQuota } from '@/config/quotas';
const quota = getVisitorQuota(level); // ✅ Centralisé
```

## Migrations SQL

### Appliquer les migrations

#### Option 1 : Script automatique
```bash
node scripts/apply-badge-migrations.mjs
```

#### Option 2 : Manuel (Supabase Dashboard)
1. Ouvrir Supabase SQL Editor
2. Copier le contenu de `/tmp/badge_migrations.sql`
3. Exécuter

#### Option 3 : CLI Supabase
```bash
supabase db push
```

### Fichiers de migration

1. `20251217000001_create_user_badges.sql`
   - Crée la table `user_badges`
   - Fonctions de génération et scan
   - Politiques RLS

2. `20251217000002_auto_generate_badges.sql`
   - Triggers automatiques
   - Synchronisation multi-tables

## Dépendances

```json
{
  "qrcode.react": "^4.2.0",      // Génération QR code
  "html2canvas": "^1.4.1"         // Export PNG du badge
}
```

## Routes

| Route | Protection | Description |
|-------|-----------|-------------|
| `/badge` | Authentifié | Page du badge personnel |
| `/visitor/subscription` | Visiteur | Choix du pass |
| `/visitor/payment-instructions` | Visiteur | Instructions paiement Premium |

## Sécurité

### RLS (Row Level Security)

- ✅ Les utilisateurs voient uniquement leur propre badge
- ✅ Les admins peuvent voir tous les badges
- ✅ Création restreinte à son propre badge
- ✅ Modification restreinte à son propre badge

### Validation

- ✅ Codes badge uniques garantis
- ✅ Vérification de validité (dates)
- ✅ Vérification du statut (active/expired/revoked)
- ✅ Protection contre les scans multiples

## Tests recommandés

1. **Inscription visiteur free** : Badge généré automatiquement
2. **Upgrade vers premium** : Badge mis à jour (couleur or)
3. **Téléchargement badge** : PNG généré correctement
4. **QR code** : Scannable et contient bonnes données
5. **Quotas networking** : Pass free bloqué à 0 RDV, Premium illimité

## Support

En cas de problème :
- Vérifier que les migrations sont appliquées
- Vérifier que l'utilisateur a `status = 'active'`
- Consulter les logs de trigger dans Supabase
- Régénérer le badge manuellement si nécessaire

---

**Créé le** : 17 décembre 2025
**Version** : 1.0.0
**Auteur** : Claude Agent pour SIPORTS 2026

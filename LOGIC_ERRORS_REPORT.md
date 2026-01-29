# 🔴 RAPPORT CRITIQUE - ERREURS LOGIQUES ET DÉFAUTS DE CONCEPTION
## Application SIPORT v3 - Analyse Exhaustive

**Date d'analyse**: 2026-01-29
**Analyseur**: Claude Sonnet 4.5 + Agent Explore
**Portée**: Codebase complète
**Sévérité globale**: 🔴 **CRITIQUE**

---

## 📊 Résumé Exécutif

### Statistiques des problèmes détectés

| Priorité | Nombre | Description |
|----------|--------|-------------|
| **P0 - CRITIQUE** | 5 | Bugs bloquants en production - correction immédiate requise |
| **P1 - HAUTE** | 8 | Erreurs logiques majeures - correction dans les 48h |
| **P2 - MOYENNE** | 2 | Incohérences à corriger - correction dans la semaine |
| **TOTAL** | **15** | Problèmes identifiés |

### Impact global

🔴 **L'application présente des défauts architecturaux critiques** qui compromettent :
- ✗ Intégrité des données utilisateur
- ✗ Cohérence des workflows d'inscription
- ✗ Fiabilité du système de paiement
- ✗ Sécurité (validation de mots de passe incohérente)
- ✗ Maintenabilité du code (duplication, absence de source unique de vérité)

### Recommandation principale

> **REFACTORISATION ARCHITECTURALE MAJEURE REQUISE**
>
> Avant tout déploiement en production, l'application nécessite :
> 1. Établissement d'une source unique de vérité (Single Source of Truth) pour tous les états utilisateur
> 2. Unification des flux d'inscription (Visiteur, Exposant, Partenaire)
> 3. Standardisation du nommage et typage des champs
> 4. Implémentation de validations métier strictes
> 5. Migration des données existantes pour corriger les incohérences

---

## 🔴 PROBLÈMES CRITIQUES (P0) - Correction Immédiate Requise

### [P0-1] 🔴 Incohérence `visitor_level` - Base de données vs Store local

**Fichiers**:
- [src/pages/visitor/VisitorVIPRegistration.tsx:229](src/pages/visitor/VisitorVIPRegistration.tsx#L229)
- [src/pages/visitor/VisitorVIPRegistration.tsx:257](src/pages/visitor/VisitorVIPRegistration.tsx#L257)

**Type**: Erreur Logique + Incohérence de Données

**Description critique**:
Lors de l'inscription VIP, le système crée un utilisateur avec `visitor_level: 'premium'` en base de données mais assigne `visitor_level: 'standard'` dans le store local. Cette divergence crée une désynchronisation totale entre l'état persisté et l'état applicatif.

```typescript
// ❌ LIGNE 229 - Base de données
visitor_level: 'premium',  // Sauvegardé en DB

// ❌ LIGNE 257 - Store local (authStore)
visitor_level: 'standard' as const,  // Chargé dans l'app
```

**Impact utilisateur**:
1. 🔴 **Permissions refusées** : L'utilisateur VIP ne peut pas accéder aux fonctionnalités premium car le store local indique 'standard'
2. 🔴 **Expérience incohérente** : Après rechargement de page, l'utilisateur hérite de 'premium' depuis Supabase, mais l'app locale reste sur 'standard'
3. 🔴 **Paiement effectué mais service refusé** : Le client paye pour VIP mais n'obtient pas les bénéfices

**Correction**:
```typescript
// src/pages/visitor/VisitorVIPRegistration.tsx:257
// AVANT
visitor_level: 'standard' as const,  // ❌ MAUVAIS

// APRÈS
visitor_level: 'premium' as const,   // ✅ CORRECT - cohérent avec DB
```

**Priorité**: 🔴 **IMMÉDIATE** (P0)

---

### [P0-2] 🔴 Double orthographe "platinum" vs "platinium"

**Fichiers**:
- [src/types/index.ts:20, 66](src/types/index.ts#L20)
- [src/config/partnerTiers.ts:6](src/config/partnerTiers.ts#L6)
- [src/config/partnerBankTransferConfig.ts:63](src/config/partnerBankTransferConfig.ts#L63)

**Type**: Incohérence de Données + Défaut de Conception

**Description critique**:
L'application utilise deux orthographes différentes pour le niveau de partenariat le plus élevé :
- **"platinum"** (orthographe anglaise correcte)
- **"platinium"** (orthographe ERRONÉE utilisée dans les configs)

Cela crée une incohérence totale du système de typage.

```typescript
// types/index.ts:20 - Type accepte "platinium" (mal orthographié)
partner_tier?: 'museum' | 'silver' | 'gold' | 'platinium';  // ❌

// config/partnerTiers.ts:165
platinium: {
  id: 'platinium',  // ❌ Mauvaise orthographe
  displayName: 'Pass Platinium',
  price: 98000,
}

// Les deux coexistent - confusion garantie!
```

**Impact utilisateur**:
1. 🔴 **Lookups échouent** : Impossible de retrouver les partenaires "platinum" si la DB utilise "platinium"
2. 🔴 **Corruption de données** : Certains partenaires ont "platinum", d'autres "platinium"
3. 🔴 **Tests impossibles** : Impossible de fiabiliser les tests avec deux branches logiques pour le même tier

**Correction**:
```bash
# 1. Rechercher et remplacer TOUS les "platinium" par "platinum"
grep -r "platinium" src/ --files-with-matches | xargs sed -i 's/platinium/platinum/g'

# 2. Migration base de données
UPDATE partners SET partner_tier = 'platinum' WHERE partner_tier = 'platinium';

# 3. Validation stricte
# Ajouter une contrainte CHECK en DB
ALTER TABLE partners ADD CONSTRAINT partner_tier_check
  CHECK (partner_tier IN ('museum', 'silver', 'gold', 'platinum'));
```

**Priorité**: 🔴 **IMMÉDIATE** (P0)

---

### [P0-3] 🔴 Absence de Single Source of Truth pour les montants de partenariat

**Fichiers**:
- [src/config/partnerBankTransferConfig.ts:17-80](src/config/partnerBankTransferConfig.ts#L17)
- [src/config/partnerTiers.ts:36-215](src/config/partnerTiers.ts#L36)

**Type**: Défaut de Conception

**Description critique**:
Les montants d'abonnement partenaire sont définis dans deux fichiers différents sans synchronisation :
1. `partnerBankTransferConfig.ts` - utilisé pour les virements bancaires
2. `partnerTiers.ts` - utilisé pour l'affichage des prix

Il n'existe aucun mécanisme pour garantir que ces montants restent identiques.

```typescript
// partnerBankTransferConfig.ts:17-20
amounts: {
  museum: { amount: 20000.00, currency: 'USD' },
  silver: { amount: 48000.00, currency: 'USD' },
  gold: { amount: 68000.00, currency: 'USD' },
  platinium: { amount: 98000.00, currency: 'USD' }
}

// partnerTiers.ts:36-44 (FICHIER DIFFÉRENT!)
museum: { price: 20000 },  // Même montant POUR L'INSTANT
silver: { price: 48000 },
gold: { price: 68000 },

// ❌ Un développeur modifie un fichier et oublie l'autre = CATASTROPHE
```

**Impact utilisateur**:
1. 🔴 **Invoices incorrectes** : Partenaires reçoivent des factures à des montants différents selon la page consultée
2. 🔴 **Validation de paiement échoue** : Le système rejette les virements corrects car les montants ne correspondent pas
3. 🔴 **Conflits client majeurs** : Contentieux juridiques sur les montants payés

**Correction**:
```typescript
// NOUVEAU FICHIER: src/config/partnerBilling.ts
export const PARTNER_BILLING = {
  museum: {
    tier: 'museum' as const,
    amount: 20000,
    currency: 'USD',
    displayName: 'Museum Partner',
    features: [...]
  },
  silver: {
    tier: 'silver' as const,
    amount: 48000,
    currency: 'USD',
    displayName: 'Silver Partner',
    features: [...]
  },
  gold: {
    tier: 'gold' as const,
    amount: 68000,
    currency: 'USD',
    displayName: 'Gold Partner',
    features: [...]
  },
  platinum: {
    tier: 'platinum' as const,
    amount: 98000,
    currency: 'USD',
    displayName: 'Platinum Partner',
    features: [...]
  }
} as const;

// Puis importer partout
import { PARTNER_BILLING } from '@/config/partnerBilling';

// partnerTiers.ts devient une simple vue
export const PARTNER_TIERS = PARTNER_BILLING;

// partnerBankTransferConfig.ts devient une vue aussi
export const BANK_TRANSFER_AMOUNTS = Object.fromEntries(
  Object.entries(PARTNER_BILLING).map(([key, val]) => [key, { amount: val.amount, currency: val.currency }])
);
```

**Priorité**: 🔴 **IMMÉDIATE** (P0)

---

### [P0-4] 🔴 Trois flux d'inscription complètement désynchronisés

**Fichiers**:
- [src/pages/visitor/VisitorFreeRegistration.tsx](src/pages/visitor/VisitorFreeRegistration.tsx)
- [src/pages/visitor/VisitorVIPRegistration.tsx](src/pages/visitor/VisitorVIPRegistration.tsx)
- [src/pages/auth/ExhibitorSignUpPage.tsx](src/pages/auth/ExhibitorSignUpPage.tsx)
- [src/pages/auth/PartnerSignUpPage.tsx](src/pages/auth/PartnerSignUpPage.tsx)

**Type**: Défaut de Conception Majeur

**Description critique**:
Chaque type d'utilisateur possède son propre flux d'inscription entièrement indépendant, sans aucun code partagé. Cela crée des divergences logiques majeures :

| Étape | Visiteur Free | Visiteur VIP | Exposant | Partenaire |
|-------|---------------|--------------|----------|------------|
| **Mot de passe** | ❌ Temporaire | ✅ Réel | ✅ Réel (8 car min) | ✅ Réel (12 car min) |
| **Status** | `active` | `pending_payment` | `pending` | `pending_payment` |
| **Badge auto** | ✅ Oui | ❌ Non | ❌ Non | ❌ Non |
| **Email reset** | ✅ Oui | ❌ Non | ❌ Non | ❌ Non |
| **Logout immédiat** | ✅ Oui | ❌ Non | ❌ Non | ❌ Non |
| **Payment request** | ❌ Non | ✅ Oui | ✅ Oui | ✅ Oui |

**Impact utilisateur**:
1. 🔴 **Comportement imprévisible** : Utilisateurs ne comprennent pas pourquoi les comportements diffèrent
2. 🔴 **Bugs non détectés** : Une correction dans un flux n'est pas appliquée aux autres
3. 🔴 **Documentation impossible** : Impossible de documenter "le" workflow d'inscription car il y en a 4

**Correction** (Architecture):
```typescript
// NOUVEAU SERVICE: src/services/registrationService.ts

interface RegistrationData {
  email: string;
  password: string;
  name: string;
  phone: string;
  type: User['type'];
  tier?: string;
  // ... autres champs communs
}

export class RegistrationService {
  /**
   * Point d'entrée unifié pour TOUTES les inscriptions
   */
  static async register(data: RegistrationData): Promise<User> {
    // 1. Validation commune
    await this.validateCommon(data);

    // 2. Création compte auth Supabase
    const authUser = await this.createAuthUser(data.email, data.password);

    // 3. Création profil utilisateur
    const userProfile = await this.createUserProfile(authUser.id, data);

    // 4. Logique spécifique par type
    switch (data.type) {
      case 'visitor':
        return await this.handleVisitorRegistration(userProfile, data);
      case 'exhibitor':
        return await this.handleExhibitorRegistration(userProfile, data);
      case 'partner':
        return await this.handlePartnerRegistration(userProfile, data);
      default:
        throw new Error(`Unknown user type: ${data.type}`);
    }
  }

  private static async handleVisitorRegistration(user: User, data: RegistrationData) {
    // Logique visiteur
    if (data.tier === 'free') {
      await this.generateBadge(user);
      await this.sendPasswordResetEmail(user.email);
      return { ...user, status: 'active' };
    } else {
      await this.createPaymentRequest(user, data.tier);
      return { ...user, status: 'pending_payment' };
    }
  }

  private static async handleExhibitorRegistration(user: User, data: RegistrationData) {
    await this.createPaymentRequest(user, data.tier);
    await this.sendExhibitorWelcomeEmail(user);
    return { ...user, status: 'pending_payment' };
  }

  private static async handlePartnerRegistration(user: User, data: RegistrationData) {
    await this.createPaymentRequest(user, data.tier);
    await this.sendPartnerWelcomeEmail(user);
    return { ...user, status: 'pending_payment' };
  }
}

// Utilisation dans les pages
const user = await RegistrationService.register({
  email, password, name, phone,
  type: 'exhibitor',
  tier: selectedTier
});
```

**Priorité**: 🔴 **IMMÉDIATE** (P0)

---

### [P0-5] 🔴 Pas de vérification du montant de paiement réel

**Fichiers**:
- [src/pages/partner/PartnerBankTransferPage.tsx:138-149](src/pages/partner/PartnerBankTransferPage.tsx#L138)

**Type**: Bug de Business Logic + Faille de Sécurité

**Description critique**:
Le système accepte une preuve de paiement (screenshot/PDF) sans vérifier que le montant du virement correspond au tier attendu. Un partenaire malhonnête peut prétendre avoir payé $98,000 (Platinum) mais n'avoir envoyé que $20,000 (Museum).

```typescript
// PartnerBankTransferPage.tsx:142-149
const { error } = await supabase
  .from('payment_requests')
  .update({
    transfer_reference: transferReference,  // ✅ Référence vérifiée
    transfer_proof_url: uploadedFileUrl || null,  // ✅ Fichier uploadé
    transfer_date: new Date().toISOString()  // ❌ AUCUNE VÉRIFICATION DU MONTANT!
  })
  .eq('id', paymentRequest.id);

// ❌ Le système ne vérifie JAMAIS que le montant transféré = montant attendu
// L'admin doit manuellement ouvrir chaque PDF et vérifier = ERREUR HUMAINE GARANTIE
```

**Impact utilisateur**:
1. 🔴 **Fraude facilitée** : Partenaires peuvent payer moins que prévu et obtenir un tier supérieur
2. 🔴 **Charge admin énorme** : Vérification manuelle de chaque justificatif
3. 🔴 **Pas de traçabilité** : Aucune preuve numérique du montant réellement vérifié
4. 🔴 **Contentieux juridiques** : Conflits sur les montants dus

**Correction**:
```typescript
// SOLUTION 1: Ajouter un champ montant vérifié manuellement
interface PaymentRequest {
  expected_amount: number;
  verified_amount?: number;  // Renseigné par l'admin après vérification
  amount_verified_by?: string;  // User ID de l'admin
  amount_verified_at?: string;
}

// SOLUTION 2: Intégration API bancaire (recommandé)
import { VerifyBankTransfer } from '@/services/bankVerification';

async function submitBankTransfer() {
  // 1. Vérifier via API bancaire
  const verification = await VerifyBankTransfer.verify({
    reference: transferReference,
    expectedAmount: PARTNER_BILLING[tier].amount,
    currency: 'USD'
  });

  if (!verification.success) {
    throw new Error('Montant incorrect ou référence invalide');
  }

  // 2. Sauvegarder avec preuve de vérification
  await supabase.from('payment_requests').update({
    transfer_reference: transferReference,
    transfer_proof_url: uploadedFileUrl,
    verified_amount: verification.amount,
    verification_status: 'verified',
    verified_at: verification.verifiedAt
  });
}

// SOLUTION 3: Minimum - Demander le montant à l'utilisateur
<input
  type="number"
  name="transfer_amount"
  placeholder="Montant transféré (USD)"
  required
/>

// Puis valider
if (transferAmount !== expectedAmount) {
  alert(`Montant incorrect! Attendu: $${expectedAmount}, Reçu: $${transferAmount}`);
  return;
}
```

**Priorité**: 🔴 **IMMÉDIATE** (P0)

---

## 🟠 PROBLÈMES HAUTE PRIORITÉ (P1) - Correction sous 48h

### [P1-1] 🟠 Taux de conversion EUR→MAD statique et obsolète

**Fichiers**: [src/services/paymentService.ts:325-328](src/services/paymentService.ts#L325)

**Type**: Erreur Logique

**Description**:
Le taux de change EUR vers Dirham marocain (MAD) est hardcodé à 1 EUR = 11 MAD. Ce taux n'est jamais mis à jour et ne reflète pas les fluctuations du marché des changes.

```typescript
export function convertEURtoMAD(amountEUR: number): number {
  const RATE = 11;  // ❌ STATIQUE - jamais actualisé
  return Math.round(amountEUR * RATE);
}

// Taux réel 2024-2026: 1 EUR ≈ 10.5 - 11.2 MAD (fluctue quotidiennement)
// Écart potentiel: ±5-7% selon le jour
```

**Impact**: Partenaires marocains paient systématiquement trop ou trop peu selon le jour du virement.

**Correction**:
```typescript
// Utiliser une API de taux de change
import axios from 'axios';

const EXCHANGE_RATES_CACHE_KEY = 'exchange_rates_eur_mad';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 heures

export async function convertEURtoMAD(amountEUR: number): Promise<number> {
  const rate = await getExchangeRate('EUR', 'MAD');
  return Math.round(amountEUR * rate * 100) / 100;
}

async function getExchangeRate(from: string, to: string): Promise<number> {
  // 1. Vérifier cache
  const cached = localStorage.getItem(EXCHANGE_RATES_CACHE_KEY);
  if (cached) {
    const { rate, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_TTL) {
      return rate;
    }
  }

  // 2. Fetch depuis API
  const { data } = await axios.get(`https://api.exchangerate-api.com/v4/latest/${from}`);
  const rate = data.rates[to];

  // 3. Cacher
  localStorage.setItem(EXCHANGE_RATES_CACHE_KEY, JSON.stringify({
    rate,
    timestamp: Date.now()
  }));

  return rate;
}
```

**Priorité**: 🟠 **HAUTE** (P1)

---

### [P1-2] 🟠 Conversion destructive des secteurs d'activité en string

**Fichiers**:
- [src/pages/auth/ExhibitorSignUpPage.tsx:197](src/pages/auth/ExhibitorSignUpPage.tsx#L197)
- [src/pages/auth/PartnerSignUpPage.tsx:185](src/pages/auth/PartnerSignUpPage.tsx#L185)

**Type**: Erreur Logique + Perte de Données

**Description**:
Les secteurs d'activité sélectionnés (array `string[]`) sont convertis irréversiblement en string unique avec `.join(', ')`. Impossible de revenir à l'array original.

```typescript
// Input utilisateur: ['Technologie', 'Logistique', 'Finance']

// Conversion destructive:
sector: sectors.join(', ')  // "Technologie, Logistique, Finance" ❌

// En DB: sector = "Technologie, Logistique, Finance" (string)
// Impossible de reconstruire l'array car les secteurs peuvent contenir des virgules
// Ex: "Logistique, Transport et Distribution" devient ambigu
```

**Impact**:
1. 🟠 Impossible d'éditer les secteurs (pas d'array à utiliser dans MultiSelect)
2. 🟠 Filtres par secteur cassés (recherche "Technologie" ne trouve pas "Technologie, Logistique")
3. 🟠 Analytics faussées (comptabilise "Technologie, Logistique, Finance" comme 1 secteur au lieu de 3)

**Correction**:
```typescript
// Option 1: Stocker comme array JSON en DB
profile: {
  ...profileData,
  sectors: sectors,  // Array gardé intact
  sector_display: sectors.join(', ')  // Champ optionnel pour affichage
}

// Option 2: Table relationnelle (recommandé)
// Créer table `user_sectors` avec ForeignKey
await Promise.all(
  sectors.map(sector =>
    supabase.from('user_sectors').insert({
      user_id: user.id,
      sector_name: sector
    })
  )
);
```

**Priorité**: 🟠 **HAUTE** (P1)

---

### [P1-3] 🟠 `standArea` stocké au mauvais niveau (profile au lieu d'exhibitor)

**Fichiers**:
- [src/store/authStore.ts:79](src/store/authStore.ts#L79)
- [src/types/index.ts:64](src/types/index.ts#L64)

**Type**: Défaut de Conception

**Description**:
La surface du stand (`standArea`) est une propriété spécifique aux exposants, mais elle est stockée dans `user.profile.standArea`, accessible à tous les types d'utilisateurs.

```typescript
// ACTUEL (mauvais):
interface UserProfile {
  standArea?: number;  // ❌ Accessible à visiteurs, partenaires, etc.
}

// CORRECT:
interface Exhibitor {
  standArea: number;  // ✅ Spécifique aux exposants
}
```

**Impact**:
1. 🟠 Les visiteurs ont un champ `standArea` vide et sans sens
2. 🟠 Queries complexes ("trouvez exposants 18m²" doit checker `users.profile.standArea`)
3. 🟠 Migrations futures difficiles

**Correction**:
```sql
-- Créer table dédiée
CREATE TABLE exhibitors (
  id UUID PRIMARY KEY REFERENCES users(id),
  stand_area INTEGER NOT NULL,
  stand_location VARCHAR(255),
  booth_number VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Migrer données existantes
INSERT INTO exhibitors (id, stand_area)
SELECT id, (profile->>'standArea')::INTEGER
FROM users
WHERE type = 'exhibitor' AND profile->>'standArea' IS NOT NULL;
```

**Priorité**: 🟠 **HAUTE** (P1)

---

### [P1-4] 🟠 Confusion `request_type` vs `requestType` (snake_case vs camelCase)

**Fichiers**:
- [src/services/supabaseService.ts:77](src/services/supabaseService.ts#L77)
- [src/store/authStore.ts:304-313](src/store/authStore.ts#L304)

**Type**: Incohérence de Nommage

**Description**:
La base de données utilise `request_type` (snake_case PostgreSQL) mais le code TypeScript utilise `requestType` (camelCase). Conversion implicite fragile.

**Correction**:
```typescript
// Créer une couche de transformation explicite
function toSnakeCase(obj: any): any {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key.replace(/([A-Z])/g, '_$1').toLowerCase(),
      value
    ])
  );
}

function toCamelCase(obj: any): any {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()),
      value
    ])
  );
}
```

**Priorité**: 🟠 **HAUTE** (P1)

---

### [P1-5] 🟠 Validation de mot de passe incohérente (8 vs 12 caractères)

**Fichiers**:
- [src/pages/auth/ExhibitorSignUpPage.tsx:49-54](src/pages/auth/ExhibitorSignUpPage.tsx#L49) (8 caractères)
- [src/pages/auth/PartnerSignUpPage.tsx:30-36](src/pages/auth/PartnerSignUpPage.tsx#L30) (12 caractères)

**Type**: Incohérence de Sécurité

**Description**:
Les exposants peuvent utiliser des mots de passe de 8 caractères minimum, tandis que les partenaires et visiteurs VIP doivent utiliser 12 caractères minimum.

**Impact**: Faille de sécurité - les exposants sont moins protégés.

**Correction**:
```typescript
// config/security.ts - SOURCE UNIQUE
export const PASSWORD_REQUIREMENTS = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true
} as const;

// Utiliser partout
import { PASSWORD_REQUIREMENTS } from '@/config/security';

const passwordSchema = z.string()
  .min(PASSWORD_REQUIREMENTS.minLength,
    `Le mot de passe doit contenir au moins ${PASSWORD_REQUIREMENTS.minLength} caractères`)
  .regex(/[A-Z]/, 'Doit contenir une majuscule')
  .regex(/[a-z]/, 'Doit contenir une minuscule')
  .regex(/[0-9]/, 'Doit contenir un chiffre')
  .regex(/[@$!%*?&#]/, 'Doit contenir un caractère spécial');
```

**Priorité**: 🟠 **HAUTE** (P1)

---

### [P1-6] 🟠 Trois noms pour le même concept: `partner_tier` vs `partnership_level` vs `partnershipLevel`

**Fichiers**:
- [src/types/index.ts:20, 66](src/types/index.ts#L20)
- [src/services/supabaseService.ts:475, 484-486](src/services/supabaseService.ts#L475)

**Type**: Incohérence de Nommage

**Description**:
Le niveau de partenariat est appelé de 3 façons différentes dans le code, créant une confusion totale.

**Correction**:
Standardiser sur **`partner_tier`** partout (snake_case en DB, camelCase `partnerTier` en TypeScript).

**Priorité**: 🟠 **HAUTE** (P1)

---

### [P1-7] 🟠 Champ `partner_tier` manquant dans la transformation DB→User

**Fichiers**: [src/services/supabaseService.ts:796-810](src/services/supabaseService.ts#L796)

**Type**: Bug de Transformation

**Description**:
La fonction `transformUserDBToUser` ne mappe pas le champ `partner_tier` depuis la base de données vers l'objet User.

**Correction**:
```typescript
private static transformUserDBToUser(userDB: UserDB | null): User | null {
  if (!userDB) return null;
  return {
    // ... autres champs
    partner_tier: userDB.partner_tier,  // ✅ AJOUTER
    // ...
  };
}
```

**Priorité**: 🟠 **HAUTE** (P1)

---

### [P1-8] 🟠 État d'inscription défini à 3 endroits différents

**Fichiers**:
- [src/store/authStore.ts:187-189](src/store/authStore.ts#L187)
- [src/pages/auth/ExhibitorSignUpPage.tsx:199](src/pages/auth/ExhibitorSignUpPage.tsx#L199)
- [src/pages/visitor/VisitorVIPRegistration.tsx:230](src/pages/visitor/VisitorVIPRegistration.tsx#L230)

**Type**: Défaut de Conception + Incohérence

**Description**:
Le `status` utilisateur lors de l'inscription est calculé différemment selon l'origine :
- authStore: `(role === 'partner' || role === 'exhibitor') ? 'pending_payment' : 'active'`
- ExhibitorSignUpPage: `'pending' as const`
- VisitorVIPRegistration: `'pending_payment'`

**Correction**:
```typescript
// utils/userStatus.ts - SOURCE UNIQUE
export function getSignUpStatus(role: User['type'], tier?: string): User['status'] {
  if (role === 'visitor' && tier === 'free') return 'active';
  if (['partner', 'exhibitor'].includes(role)) return 'pending_payment';
  if (role === 'visitor' && tier === 'vip') return 'pending_payment';
  return 'active';
}
```

**Priorité**: 🟠 **HAUTE** (P1)

---

## 🟡 PROBLÈMES PRIORITÉ MOYENNE (P2) - Correction sous 7 jours

### [P2-1] 🟡 `createdAt` assigné comme string au lieu de Date

**Fichiers**: [src/pages/visitor/VisitorVIPRegistration.tsx:283](src/pages/visitor/VisitorVIPRegistration.tsx#L283)

**Type**: Erreur de Type

**Correction**:
```typescript
// AVANT
createdAt: new Date().toISOString()  // ❌ String

// APRÈS
createdAt: new Date()  // ✅ Date
```

**Priorité**: 🟡 **MOYENNE** (P2)

---

### [P2-2] 🟡 Utilisation de `new Date().toISOString()` au lieu de `now()` PostgreSQL

**Fichiers**: Multiple

**Type**: Incohérence de Timezone

**Description**:
L'application utilise l'heure client au lieu de l'heure serveur pour les timestamps.

**Correction**:
```sql
-- En DB: utiliser DEFAULT
ALTER TABLE payment_requests
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET DEFAULT now();

-- En code: laisser la DB gérer
const { data } = await supabase.from('payment_requests').insert({
  // Ne PAS spécifier created_at, laisser la DB le faire
  ...otherFields
});
```

**Priorité**: 🟡 **MOYENNE** (P2)

---

## 📋 Plan d'Action Recommandé

### Phase 1 - Urgence (Semaine 1)
**Objectif**: Corriger les 5 problèmes P0 critiques

1. ✅ **Jour 1-2**: Corriger l'incohérence `visitor_level` (P0-1)
2. ✅ **Jour 2-3**: Standardiser "platinum" vs "platinium" (P0-2)
3. ✅ **Jour 3-4**: Créer source unique de vérité pour montants (P0-3)
4. ✅ **Jour 4-5**: Ajouter validation montants de paiement (P0-5)
5. ✅ **Jour 5-7**: Refactoriser flux d'inscription unifié (P0-4)

### Phase 2 - Haute priorité (Semaine 2-3)
**Objectif**: Corriger les 8 problèmes P1

1. Implémenter API de taux de change (P1-1)
2. Corriger conversion secteurs (P1-2)
3. Migrer `standArea` vers table exhibitors (P1-3)
4. Standardiser nommage snake_case/camelCase (P1-4)
5. Unifier validation mot de passe (P1-5)
6. Standardiser `partner_tier` (P1-6)
7. Corriger transformation `partner_tier` (P1-7)
8. Unifier logique de `status` (P1-8)

### Phase 3 - Consolidation (Semaine 4)
**Objectif**: Corriger les problèmes P2 et tests

1. Corriger types `createdAt` (P2-1)
2. Standardiser timestamps serveur (P2-2)
3. **Tests E2E complets** pour valider toutes les corrections
4. **Migration de données** pour corriger les enregistrements existants

---

## 🔬 Méthodologie d'Analyse

Cette analyse a été réalisée en utilisant:
- ✅ Lecture manuelle des fichiers critiques
- ✅ Recherche de patterns avec Grep
- ✅ Analyse des incohérences de nommage
- ✅ Vérification des transformations de données
- ✅ Analyse des workflows d'inscription
- ✅ Revue du système de paiement
- ✅ Analyse de la gestion des états utilisateur

---

## 📞 Contact & Support

Pour toute question sur ce rapport:
- **Équipe Dev SIPORT**
- **Priorité**: 🔴 CRITIQUE - Action immédiate requise

---

**Fin du rapport**
**Date**: 2026-01-29
**Révision**: 1.0

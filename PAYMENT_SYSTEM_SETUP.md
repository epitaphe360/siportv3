# 🎯 GUIDE D'EXÉCUTION - Système de Paiement par Virement

## 📋 RÉSUMÉ

Système de paiement par virement bancaire pour le Pass Premium VIP (700€) avec validation administrateur.

---

## 🚀 ÉTAPES D'INSTALLATION

### 1️⃣ Créer la table dans Supabase

**Option A: Via SQL Editor (RECOMMANDÉ)**

1. Aller sur https://supabase.com
2. Sélectionner votre projet
3. Menu: **SQL Editor** → **New Query**
4. Copier TOUT le contenu de `create-payment-requests-table.sql`
5. Cliquer sur **Run** (ou Ctrl+Enter)
6. Vérifier les résultats:
   - ✅ "Success. No rows returned"
   - ✅ Table créée: **Table Editor** → chercher `payment_requests`

**Option B: Via script Node.js**

```bash
node migrate-payment-requests.mjs
```

*(Note: Peut nécessiter des permissions spéciales)*

---

### 2️⃣ Vérifier la table créée

Dans **Table Editor** de Supabase, vérifier:

✅ Table `payment_requests` visible  
✅ Colonnes:
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → auth.users)
- `requested_level` (text: 'free' ou 'premium')
- `amount` (numeric: 700.00)
- `status` (text: 'pending', 'approved', 'rejected')
- `payment_reference` (text)
- `admin_id` (UUID)
- `validated_at` (timestamptz)
- etc.

✅ **RLS Policies** actives:
- "Visiteurs peuvent voir leurs demandes"
- "Visiteurs peuvent créer des demandes"
- "Admins peuvent voir toutes les demandes"
- "Admins peuvent valider les demandes"

---

### 3️⃣ Tester le système

```bash
# Relancer les tests d'abonnement
npx playwright test --grep "💳 Système" --reporter=line --workers=1
```

**Résultats attendus:**
- ✅ 2.1 - Affichage page abonnements
- ✅ 2.2 - Inscription gratuite
- ✅ 2.3 - Demande Pass Premium ← devrait passer maintenant
- ✅ 2.4 - Vérification infos bancaires ← devrait passer maintenant
- ✅ 2.5 - Soumission référence virement ← devrait passer maintenant
- ✅ 2.6 - Demande en double bloquée ← devrait passer maintenant

---

## 🔄 WORKFLOW COMPLET

### Côté Visiteur

1. **Demande de Pass Premium**
   - Va sur `/visitor/subscription`
   - Clique sur "Demander le Pass Premium"
   - Une demande est créée avec `status='pending'`

2. **Effectue le virement**
   - Reçoit les informations bancaires:
     ```
     IBAN: FR76 1234 5678 9012 3456 7890 123
     BIC: BICFRPPXXX
     Montant: 700,00 EUR
     Référence: SIPORT-{USER_ID}-{REQUEST_ID}-{TIMESTAMP}
     ```
   - Effectue le virement depuis sa banque
   - Conserve la preuve (screenshot/PDF)

3. **Soumet la référence**
   - Va sur `/visitor/payment-instructions?request_id={ID}`
   - Entre la référence de virement
   - (Optionnel) Upload la preuve de paiement
   - Soumet le formulaire

4. **Attend la validation**
   - Status visible dans son profil: "En attente de validation"
   - Reçoit une notification quand validé/rejeté

### Côté Admin

1. **Voir les demandes pending**
   - Va sur `/admin/payment-validation`
   - Voit toutes les demandes avec `status='pending'`
   - Filtre par date, montant, etc.

2. **Valider une demande**
   - Vérifie le virement dans la banque
   - Clique sur "Approuver"
   - Ajoute des notes (optionnel)
   - Fonction `approve_payment_request()` est appelée:
     - Met `status='approved'`
     - Met `admin_id={ADMIN_ID}`
     - Met `validated_at=NOW()`
     - **Met à jour** `users.visitor_level='premium'` ✅

3. **Rejeter une demande**
   - Clique sur "Rejeter"
   - Ajoute des notes (raison du rejet)
   - Fonction `reject_payment_request()` est appelée:
     - Met `status='rejected'`
     - Envoie notification au visiteur

---

## 📊 STRUCTURE DE LA TABLE

```sql
payment_requests (
  id                 UUID PRIMARY KEY
  user_id            UUID → auth.users(id)
  requested_level    TEXT ('free' | 'premium')
  amount             DECIMAL(10,2) -- 700.00
  currency           TEXT -- 'EUR'
  status             TEXT ('pending' | 'approved' | 'rejected')
  payment_method     TEXT -- 'bank_transfer'
  payment_reference  TEXT -- Référence fournie par visiteur
  payment_proof_url  TEXT -- URL screenshot/PDF
  admin_id           UUID → auth.users(id)
  admin_notes        TEXT
  validated_at       TIMESTAMPTZ
  created_at         TIMESTAMPTZ DEFAULT NOW()
  updated_at         TIMESTAMPTZ DEFAULT NOW()
)
```

---

## 🔐 SÉCURITÉ (RLS Policies)

### Visiteurs
- ✅ Peuvent **voir** leurs propres demandes
- ✅ Peuvent **créer** des demandes
- ✅ Peuvent **modifier** leurs demandes (seulement si `status='pending'`)
- ❌ Ne peuvent PAS voir les demandes des autres
- ❌ Ne peuvent PAS approuver/rejeter

### Admins
- ✅ Peuvent **voir** toutes les demandes
- ✅ Peuvent **modifier** toutes les demandes
- ✅ Peuvent appeler `approve_payment_request()`
- ✅ Peuvent appeler `reject_payment_request()`

---

## 🛠️ FONCTIONS SQL DISPONIBLES

### `approve_payment_request(request_id, admin_user_id, notes)`

```sql
SELECT approve_payment_request(
  '123e4567-e89b-12d3-a456-426614174000'::UUID, -- request_id
  '987fcdeb-51a2-43d7-b321-fedcba987654'::UUID, -- admin_id
  'Virement vérifié et validé'                   -- notes
);
```

**Retour:**
```json
{
  "success": true,
  "request_id": "123e4567-...",
  "user_id": "456e7890-...",
  "new_level": "premium"
}
```

### `reject_payment_request(request_id, admin_user_id, notes)`

```sql
SELECT reject_payment_request(
  '123e4567-e89b-12d3-a456-426614174000'::UUID,
  '987fcdeb-51a2-43d7-b321-fedcba987654'::UUID,
  'Montant incorrect (699.00 au lieu de 700.00)'
);
```

---

## 📝 INFORMATIONS BANCAIRES

**Fichier:** `src/config/bankTransferConfig.ts`

```typescript
BANK_TRANSFER_INFO = {
  bankName: 'Banque Internationale de Commerce',
  accountHolder: 'SIPORT - Salon International des Technologies',
  iban: 'FR76 1234 5678 9012 3456 7890 123',
  bic: 'BICFRPPXXX',
  amounts: {
    premium: { amount: 700.00, currency: 'EUR' }
  }
}
```

**⚠️ À MODIFIER** avec vos vraies coordonnées bancaires avant la production !

---

## ✅ CHECKLIST FINALE

Avant de passer en production:

- [ ] Table `payment_requests` créée dans Supabase
- [ ] RLS policies actives et testées
- [ ] Fonctions `approve_payment_request` et `reject_payment_request` testées
- [ ] **MODIFIER les infos bancaires** dans `bankTransferConfig.ts`
- [ ] Tester le workflow complet:
  - [ ] Visiteur crée une demande
  - [ ] Visiteur soumet référence
  - [ ] Admin valide → `visitor_level` mis à jour
  - [ ] Admin rejette → visiteur notifié
- [ ] Tests E2E passent (2.3, 2.4, 2.5, 2.6)
- [ ] Interface admin `/admin/payment-validation` fonctionnelle
- [ ] Emails de notification configurés (optionnel)

---

## 🎯 PROCHAINES ÉTAPES

1. **Exécuter le SQL** dans Supabase SQL Editor
2. **Relancer les tests** E2E
3. **Vérifier** que les 4 tests d'abonnement passent
4. **Créer l'interface admin** `/admin/payment-validation` (si pas déjà fait)
5. **Modifier les infos bancaires** en production
6. **Déployer** ! 🚀

---

**Questions/Support:** Voir `SESSION_REPORT_15DEC2025.md` pour le contexte complet

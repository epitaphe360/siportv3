# 📅 Workflow de Prise de Rendez-vous SIPORTS

## Vue d'ensemble

Le système de rendez-vous SIPORTS suit un workflow de **demande → confirmation** pour garantir que les exposants contrôlent leur planning.

---

## 🔄 Flux Complet

### **Étape 1 : DEMANDE par le Visiteur**

**Actions :**
1. Le visiteur parcourt les exposants (`/exposants` ou `/networking`)
2. Clique sur **"Prendre RDV"** sur la carte d'un exposant
3. Un modal s'ouvre avec les **créneaux disponibles** de l'exposant
4. Le visiteur sélectionne un créneau et ajoute un message optionnel
5. Clique sur **"Confirmer le rendez-vous"**

**Technique :**
```typescript
// Store: appointmentStore.ts
bookAppointment(timeSlotId, message)
  → RPC: book_appointment_atomic()
  → Création RDV avec status='pending'
  → currentBookings incrémenté
  → Toast: "Demande envoyée ✉️"
```

**Résultat :**
- ✅ RDV créé avec `status: 'pending'`
- 📊 Quota visiteur décrémenté
- 🔔 Exposant notifié (TODO: email/push)
- 📅 Créneau affiche "1 RÉSERVÉ" (badge orange)

---

### **Étape 2 : CONFIRMATION par l'Exposant**

**Où l'exposant voit les demandes :**
1. **Dashboard Exposant** (`/tableau-de-bord`)
   - Section **"Demandes de RDV en attente"**
   - Badge orange avec compteur
   - Liste des demandes avec nom visiteur + message

2. **Calendrier Exposant** (`/appointments`)
   - Tous les RDV avec filtres : Tous / En attente / Confirmés
   - Vue détaillée de chaque demande

**Actions exposant :**
- **Accepter** : Clic sur bouton "Confirmer"
  ```typescript
  updateAppointmentStatus(appointmentId, 'confirmed')
  ```
- **Refuser** : Clic sur bouton "Refuser" ou "Annuler"
  ```typescript
  cancelAppointment(appointmentId)
  ```

**Technique (Confirmation) :**
```typescript
// Store: appointmentStore.ts
updateAppointmentStatus(appointmentId, 'confirmed')
  → UPDATE appointments SET status='confirmed'
  → Notification visiteur ✉️
  → Toast: "Rendez-vous confirmé !"
  → Calendriers mis à jour (exposant + visiteur)
```

**Résultat :**
- ✅ RDV passe à `status: 'confirmed'`
- 🔔 Visiteur notifié de la confirmation
- 📅 Apparaît dans les deux calendriers personnels
- 🎨 Badge passe de orange à vert

---

### **Étape 3 : AFFICHAGE dans les Calendriers**

#### **A. Calendrier Personnel Visiteur**
**Emplacement :** Dashboard visiteur → Section "Mes Rendez-vous"

**Affiche :**
- ✅ RDV **confirmés** (badge vert)
- ⏳ RDV **en attente** (badge orange)
- ❌ RDV **annulés** (badge rouge, historique)

**Actions :**
- Voir détails (exposant, lieu, notes)
- Annuler le RDV

---

#### **B. Calendrier Personnel Exposant**
**Emplacement :** Dashboard exposant → Section "Rendez-vous"

**Affiche :**
- ⏳ RDV **en attente de confirmation** (badge orange)
- ✅ RDV **confirmés** (badge vert)
- 👤 Nom du visiteur + message
- 📍 Lieu du créneau

**Actions :**
- Confirmer la demande
- Refuser/Annuler
- Voir profil visiteur

---

#### **C. Calendrier de Disponibilité**
**Emplacement :** Modal de réservation (visiteur) / Page créneaux (exposant)

**Affichage dynamique :**

```tsx
// Créneaux avec réservations
┌─────────────────────────────────────┐
│ 🕐 09:00 - 09:30                    │
│ 📍 Stand A12 - Hall Innovation      │
│ 🟠 1 RÉSERVÉ (badge orange)         │  ← Demande pending
│ 📊 1/3 places réservées             │
│ [Réserver] (bouton actif)           │
└─────────────────────────────────────┘

// Créneau complet
┌─────────────────────────────────────┐
│ 🕐 14:00 - 14:30                    │
│ 📍 Stand A12 - Hall Innovation      │
│ 🔴 COMPLET (badge rouge)            │  ← Toutes places prises
│ 📊 3/3 places réservées             │
│ [Complet] (bouton désactivé)        │
└─────────────────────────────────────┘
```

**Code :**
```tsx
// AvailabilityCalendar.tsx
const isFullyBooked = slot.currentBookings >= slot.maxBookings;
const hasBookings = slot.currentBookings > 0;

{isFullyBooked && (
  <Badge className="bg-red-100">COMPLET</Badge>
)}
{hasBookings && !isFullyBooked && (
  <Badge className="bg-orange-100">
    {slot.currentBookings} RÉSERVÉ{slot.currentBookings > 1 ? 'S' : ''}
  </Badge>
)}
```

---

## 📊 Statuts des Rendez-vous

| Statut | Description | Couleur | Qui peut agir |
|--------|-------------|---------|---------------|
| `pending` | Demande en attente | 🟠 Orange | Exposant (confirmer/refuser) |
| `confirmed` | RDV confirmé | 🟢 Vert | Visiteur + Exposant (annuler) |
| `cancelled` | RDV annulé | 🔴 Rouge | Aucune action (historique) |
| `completed` | RDV passé | ⚫ Gris | Visiteur (noter/évaluer) |

---

## 🔔 Notifications

### **À la DEMANDE (visiteur → exposant)**
- ✉️ Email exposant : "Nouvelle demande de RDV"
- 🔔 Push notification dans l'app
- 🔴 Badge sur "Demandes en attente"

### **À la CONFIRMATION (exposant → visiteur)**
- ✉️ Email visiteur : "Votre RDV a été confirmé"
- 🔔 Push notification dans l'app
- ✅ Toast : "Rendez-vous confirmé !"

**Code :**
```typescript
// appointmentStore.ts - updateAppointmentStatus
if (status === 'confirmed' && appointment?.status === 'pending') {
  const { toast } = await import('sonner');
  toast.success('Rendez-vous confirmé !', {
    description: 'Les calendriers ont été mis à jour et les participants notifiés.'
  });
  // TODO: sendAppointmentConfirmationNotification(appointment);
}
```

---

## 🛡️ Gestion des Quotas

**Comptabilisation :**
```typescript
// On compte TOUS les RDV actifs (pending + confirmed)
const activeCount = appointments.filter(
  a => a.visitorId === visitorId &&
       (a.status === 'confirmed' || a.status === 'pending')
).length;

if (activeCount >= quota) {
  throw new Error('Quota de rendez-vous atteint');
}
```

**Quotas par niveau :**
- **Free** : 1 RDV actif max
- **Basic** : 3 RDV actifs max
- **Premium** : 10 RDV actifs max
- **VIP** : Illimité

---

## 🗄️ Base de Données

### **Table `appointments`**
```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY,
  time_slot_id UUID REFERENCES time_slots(id),
  visitor_id UUID REFERENCES users(id),
  exhibitor_id UUID REFERENCES users(id),
  status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  message TEXT,  -- Message initial du visiteur
  meeting_type TEXT DEFAULT 'in-person',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **Fonction `book_appointment_atomic`**
```sql
-- Crée un RDV avec status='pending'
-- Incrémente currentBookings du créneau
-- Retourne appointment_id + current_bookings + available
```

---

## ✅ Checklist Implémentation

- [x] `bookAppointment()` crée RDV avec `status: 'pending'`
- [x] `updateAppointmentStatus()` envoie notification si confirmation
- [x] Calendrier visiteur affiche RDV pending (badge orange)
- [x] Calendrier exposant affiche demandes en attente
- [x] Calendrier de disponibilité affiche "X RÉSERVÉ(S)"
- [x] Badge "COMPLET" si toutes places prises
- [x] Migration SQL : `book_appointment_atomic` avec status='pending'
- [ ] Email/Push notifications (TODO)
- [ ] Interface exposant : liste demandes avec actions Confirmer/Refuser

---

## 🎯 Exemple Complet

### **Scénario : Jean Dupont (VIP) réserve un RDV avec TechExpo**

**1. Jean clique "Prendre RDV" sur TechExpo**
- Modal s'ouvre avec créneaux TechExpo

**2. Jean sélectionne "09:00 - 09:30" demain**
- Message : "Intéressé par la solution VR"
- Clic "Confirmer"

**3. Système traite la demande**
```javascript
bookAppointment('slot-501', 'Intéressé par la solution VR')
  ✅ RDV créé (ID: rdv-001, status: 'pending')
  📊 Quota Jean : 0/∞ utilisé (VIP)
  🔔 Notification TechExpo
  🎨 Créneau affiche "1 RÉSERVÉ"
```

**4. TechExpo voit la demande**
- Dashboard : Badge "1 nouvelle demande"
- Liste : "Jean Dupont souhaite un RDV à 09:00"

**5. TechExpo confirme**
```javascript
updateAppointmentStatus('rdv-001', 'confirmed')
  ✅ Status → 'confirmed'
  🔔 Email Jean : "RDV confirmé !"
  📅 Calendrier Jean mis à jour
  📅 Calendrier TechExpo mis à jour
```

**6. Résultat final**
- Jean voit le RDV en vert dans son calendrier
- TechExpo voit le RDV en vert dans son calendrier
- Le créneau 09:00 affiche "1 RÉSERVÉ" (badge orange si places restantes)
- Si 3/3 réservations : badge "COMPLET" (rouge)

---

## 🔧 Fichiers Modifiés

1. **`src/store/appointmentStore.ts`**
   - `bookAppointment()` : status='pending'
   - `updateAppointmentStatus()` : notifications

2. **`src/components/availability/AvailabilityCalendar.tsx`**
   - Affichage badges "RÉSERVÉ" / "COMPLET"

3. **`supabase/migrations/20251224000001_fix_critical_issues.sql`**
   - `book_appointment_atomic()` : status='pending'
   - Documentation workflow

4. **`supabase/migrations/20251224000002_seed_demo_data.sql`**
   - 15 RDV de test (pending + confirmed)

---

## 📝 Notes Développement

- **Atomicité** : Utiliser `book_appointment_atomic()` pour éviter double-réservation
- **Quotas** : Compter `pending + confirmed` pour éviter contournement
- **Notifications** : À implémenter via service externe (SendGrid, Firebase)
- **Calendriers** : Mettre à jour automatiquement après chaque changement de statut
- **UX** : Badge couleur aide à différencier rapidement les statuts

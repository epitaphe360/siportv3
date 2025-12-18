# 🐛 RAPPORT DE BUGS RÉELS - SYSTÈME B2B

**Date:** 2024-12-18
**Analysé par:** Claude Code - Analyse Pratique
**Gravité:** 🔴 **CRITIQUE** - Le système B2B ne peut pas fonctionner

---

## ❌ BUG CRITIQUE #1: Incohérence de Schéma Database

###Description
Il y a une **incohérence majeure** entre le schéma PostgreSQL et le code TypeScript concernant l'identification des exposants.

### Schéma Database (PostgreSQL)
```sql
-- supabase/migrations/20250930112332_20250930_complete_schema.sql
CREATE TABLE IF NOT EXISTS time_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibitor_id uuid REFERENCES exhibitors(id) ON DELETE CASCADE,  -- ⚠️ Référence exhibitors.id
  slot_date date NOT NULL,
  start_time time NOT NULL,
  ...
);

CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibitor_id uuid REFERENCES exhibitors(id) ON DELETE CASCADE,  -- ⚠️ Référence exhibitors.id
  visitor_id uuid REFERENCES users(id) ON DELETE CASCADE,
  time_slot_id uuid REFERENCES time_slots(id) ON DELETE CASCADE,
  ...
);
```

### Code TypeScript
```typescript
// src/store/appointmentStore.ts ligne 245-246
const transformedSlots = (data || []).map((slot: any) => ({
  id: slot.id,
  userId: slot.user_id,  // ❌ Cherche user_id qui n'existe PAS
  date: new Date(slot.date),
  ...
}));

// ligne 333
const exhibitorIdForSlot = slot?.userId || slot?.exhibitorId || null;  // ❌ userId undefined!

// ligne 349-352
const { data, error } = await supabase.rpc('book_appointment_atomic', {
  p_time_slot_id: timeSlotId,
  p_visitor_id: visitorId,
  p_exhibitor_id: exhibitorIdForSlot,  // ❌ Envoie undefined ou mauvais ID
  p_notes: message || null
});
```

### Impact
- ❌ **Réservations impossibles**: `exhibitorIdForSlot` est `undefined` ou incorrect
- ❌ **Foreign key violations**: `exhibitors.id ≠ users.id`
- ❌ **Time slots non récupérables**: `slot.user_id` n'existe pas dans la DB

### Cause Racine
Il y a **deux modèles de données différents**:
1. **Modèle DB**: Utilise `exhibitors` table (id separé de users)
2. **Modèle Code**: Assume que exhibitor_id = user.id directement

### Tables Concernées
```sql
users (id uuid)              -- Authentification
exhibitors (id uuid, user_id uuid)  -- Référence users.id
time_slots (exhibitor_id uuid)      -- ❌ Référence exhibitors.id, PAS users.id
appointments (exhibitor_id uuid)    -- ❌ Référence exhibitors.id, PAS users.id
```

---

## ❌ BUG CRITIQUE #2: Mapping Incorrect dans fetchTimeSlots

### Fichier
`src/store/appointmentStore.ts` lignes 232-260

### Code Bugué
```typescript
if (supabaseClient) {
  const { data, error } = await supabaseClient
    .from('time_slots')
    .select('*')
    .eq('exhibitor_id', exhibitorId)  // ✅ Query OK
    .order('slot_date', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) throw error;

  const transformedSlots = (data || []).map((slot: any) => ({
    id: slot.id,
    userId: slot.user_id,  // ❌ ERREUR: user_id n'existe PAS dans time_slots
    date: new Date(slot.date),
    startTime: slot.start_time,
    endTime: slot.end_time,
    duration: slot.duration,
    type: slot.type || 'in-person',
    maxBookings: slot.max_bookings || 1,
    currentBookings: slot.current_bookings || 0,
    available: (slot.current_bookings || 0) < (slot.max_bookings || 1),
    location: slot.location
  }));
}
```

### Problème
- La table `time_slots` a `exhibitor_id`, PAS `user_id`
- Le mapping crée `userId: slot.user_id` qui sera **undefined**
- Quand on essaye de booker, `slot.userId` est undefined

### Fix Requis
```typescript
const transformedSlots = (data || []).map((slot: any) => ({
  id: slot.id,
  exhibitorId: slot.exhibitor_id,  // ✅ Correct
  // Optionnel: récupérer user_id via JOIN
  date: new Date(slot.slot_date),   // ✅ Correct nom de colonne
  startTime: slot.start_time,
  ...
}));
```

---

## ❌ BUG CRITIQUE #3: bookAppointment Envoie Mauvais ID

### Fichier
`src/store/appointmentStore.ts` lignes 327-354

### Code Bugué
```typescript
// ligne 327-328
const slot = timeSlots.find(s => s.id === timeSlotId);
if (!slot) {
  throw new Error('Créneau non trouvé. Veuillez actualiser la page.');
}

// ligne 333
const exhibitorIdForSlot = slot?.userId || slot?.exhibitorId || null;
// ❌ slot.userId est undefined (Bug #2)
// ❌ slot.exhibitorId pourrait être exhibitors.id, PAS users.id

// ligne 349-354
const { data, error } = await supabase.rpc('book_appointment_atomic', {
  p_time_slot_id: timeSlotId,
  p_visitor_id: visitorId,
  p_exhibitor_id: exhibitorIdForSlot,  // ❌ undefined ou mauvais ID
  p_notes: message || null
});
```

### Fonction RPC Attend
```sql
-- supabase/migrations/atomic_appointment_booking.sql ligne 124
CREATE OR REPLACE FUNCTION book_appointment_atomic(
  p_time_slot_id UUID,
  p_visitor_id UUID,
  p_exhibitor_id UUID,  -- ⚠️ Attend exhibitors.id
  p_notes TEXT DEFAULT NULL
)
```

### Mais Insert dans Appointments
```sql
-- ligne 68-77
INSERT INTO appointments (
  id,
  time_slot_id,
  visitor_id,
  exhibitor_id,  -- ❌ FK vers exhibitors(id), pas users(id)
  status,
  notes,
  created_at,
  updated_at
)
```

### Impact
Si on passe `user.id` au lieu de `exhibitors.id`:
```sql
ERROR: insert or update on table "appointments" violates foreign key constraint
DETAIL: Key (exhibitor_id)=(xxx) is not present in table "exhibitors"
```

---

## ❌ BUG CRITIQUE #4: cancelAppointment - Mauvaise Vérification

### Fichier
`src/store/appointmentStore.ts` lignes 148-151

### Code Bugué
```typescript
// ligne 148-151
IF v_appointment.visitor_id != p_user_id AND
   v_appointment.exhibitor_id NOT IN (
     SELECT id FROM exhibitors WHERE user_id = p_user_id
   ) THEN
```

### Problème
C'est correct dans la fonction SQL, MAIS le code TypeScript n'envoie pas le bon user_id.

---

## ❌ BUG MAJEUR #5: Types TypeScript Incomplets

### Fichier
`src/types/index.ts` (assumed)

### Problème
L'interface `TimeSlot` TypeScript ne correspond pas au schéma DB:

```typescript
// Types actuels (assumés)
interface TimeSlot {
  id: string;
  userId: string;  // ❌ N'existe pas dans DB
  date: Date;
  startTime: string;
  endTime: string;
  duration: number;
  type: MeetingType;
  maxBookings: number;
  currentBookings: number;
  available: boolean;
  location?: string;
}
```

### Types Corrects Requis
```typescript
interface TimeSlot {
  id: string;
  exhibitorId: string;  // ✅ Correspond à time_slots.exhibitor_id
  slotDate: Date;       // ✅ Correspond à time_slots.slot_date
  startTime: string;
  endTime: string;
  duration: number;
  type: MeetingType;
  maxBookings: number;
  currentBookings: number;
  available: boolean;
  location?: string;
  // Optionnel pour usage client:
  exhibitor?: {
    id: string;
    userId: string;  // Le vrai users.id via JOIN
    companyName: string;
  };
}
```

---

## 🔧 SOLUTIONS REQUISES

### Solution 1: Changer Code pour Suivre Schema DB (RECOMMANDÉ)

#### A. Modifier fetchTimeSlots
```typescript
// ligne 234-240
const { data, error } = await supabaseClient
  .from('time_slots')
  .select(`
    *,
    exhibitor:exhibitors!exhibitor_id(
      id,
      user_id,
      company_name
    )
  `)
  .eq('exhibitor_id', exhibitorId)
```

#### B. Corriger Mapping
```typescript
const transformedSlots = (data || []).map((slot: any) => ({
  id: slot.id,
  exhibitorId: slot.exhibitor_id,  // ✅ Correct
  slotDate: new Date(slot.slot_date),  // ✅ Nom correct
  startTime: slot.start_time,
  endTime: slot.end_time,
  duration: slot.duration,
  type: slot.type || 'in-person',
  maxBookings: slot.max_bookings || 1,
  currentBookings: slot.current_bookings || 0,
  available: (slot.current_bookings || 0) < (slot.max_bookings || 1),
  location: slot.location,
  exhibitor: slot.exhibitor ? {
    id: slot.exhibitor.id,
    userId: slot.exhibitor.user_id,
    companyName: slot.exhibitor.company_name
  } : undefined
}));
```

#### C. Corriger bookAppointment
```typescript
// ligne 333
const exhibitorIdForSlot = slot.exhibitorId;  // ✅ Simple

// Ou si besoin du user_id:
const exhibitorUserId = slot.exhibitor?.userId;
```

### Solution 2: Changer Schema DB (NON RECOMMANDÉ)

Modifier le schema pour utiliser `user_id` au lieu de `exhibitor_id`:
```sql
ALTER TABLE time_slots
  DROP COLUMN exhibitor_id,
  ADD COLUMN user_id uuid REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE appointments
  DROP COLUMN exhibitor_id,
  ADD COLUMN exhibitor_user_id uuid REFERENCES users(id) ON DELETE CASCADE;
```

⚠️ **NON RECOMMANDÉ** car cela casse la normalisation et les foreign keys existantes.

---

## 📋 CHECKLIST DE FIX

- [ ] Fix `fetchTimeSlots` mapping (userId → exhibitorId)
- [ ] Fix column name `slot.date` → `slot.slot_date`
- [ ] Add JOIN pour récupérer exhibitor.user_id
- [ ] Fix `bookAppointment` exhibitorIdForSlot
- [ ] Fix TypeScript interfaces TimeSlot
- [ ] Fix Appointment interface si nécessaire
- [ ] Tester booking flow complet
- [ ] Tester cancel flow complet
- [ ] Vérifier tous les usages de slot.userId
- [ ] Vérifier tous les usages de appointment.exhibitorId

---

## 🧪 TESTS REQUIS

### Test 1: Fetch Time Slots
```typescript
await appointmentStore.fetchTimeSlots(exhibitorId);
const slots = appointmentStore.timeSlots;
console.assert(slots[0].exhibitorId !== undefined, 'exhibitorId doit exister');
console.assert(slots[0].exhibitor?.userId !== undefined, 'exhibitor.userId doit exister');
```

### Test 2: Book Appointment
```typescript
const slot = appointmentStore.timeSlots[0];
await appointmentStore.bookAppointment(slot.id, 'Test message');
// Devrait réussir sans erreur FK
```

### Test 3: Cancel Appointment
```typescript
const appointment = appointmentStore.appointments[0];
await appointmentStore.cancelAppointment(appointment.id);
// Devrait décrémenter slot.currentBookings
```

---

## 📊 ÉVALUATION DE GRAVITÉ

| Bug | Gravité | Impact | Bloquant |
|-----|---------|--------|----------|
| #1 Schema Mismatch | 🔴 Critique | Système B2B non fonctionnel | ✅ OUI |
| #2 fetchTimeSlots | 🔴 Critique | Données invalides | ✅ OUI |
| #3 bookAppointment | 🔴 Critique | FK violations | ✅ OUI |
| #4 cancelAppointment | 🟠 Majeur | Peut fonctionner si exhibitorId correct | ⚠️ Partiel |
| #5 Types TypeScript | 🟠 Majeur | IntelliSense incorrect | ❌ NON |

---

## 💡 CONCLUSION

**Le système B2B ne peut PAS fonctionner actuellement** en raison de:
1. Mapping incorrect des IDs (userId vs exhibitorId)
2. Noms de colonnes incorrects (date vs slot_date)
3. Foreign key mismatch (exhibitors.id vs users.id)

**Temps estimé de fix:** 2-4 heures
**Priorité:** 🔴 **URGENT**

---

**Rapport généré le:** 2024-12-18
**Validé par tests:** ❌ Non (tests impossibles tant que bugs non fixés)

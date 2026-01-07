# 🔧 Correction: Erreur de clé étrangère time_slots → exhibitors

**Date:** 2026-01-01  
**Problème:** Erreur 409 lors de la création de créneaux horaires  
**Erreur:** `insert or update on table "time_slots" violates foreign key constraint "time_slots_exhibitor_id_fkey"`

---

## 🔍 Analyse du problème

### Architecture de la base de données
```
profiles (user_id) 
    ↓
exhibitors (id, user_id)
    ↓
time_slots (id, exhibitor_id)
```

### Erreur constatée
Le composant `PublicAvailabilityCalendar` passait un `userId` (depuis la table `profiles`) directement comme `exhibitor_id`, mais la table `time_slots` attend un ID de la table `exhibitors`.

```typescript
// ❌ AVANT (problématique)
const insertPayload = {
  exhibitor_id: userId,  // userId de profiles, pas de exhibitors !
  slot_date: '2026-01-15',
  ...
};
```

---

## ✅ Solution implémentée

### 1. Résolution automatique dans `createTimeSlot()`

Modification de `SupabaseService.createTimeSlot()` pour résoudre automatiquement l'`exhibitor_id` depuis le `userId` :

```typescript
// ✅ APRÈS (corrigé)
static async createTimeSlot(slotData) {
  let exhibitorId = slotData.exhibitorId || null;
  
  if (!exhibitorId && slotData.userId) {
    // Récupérer l'exhibitor_id depuis le user_id
    const { data: exhibitor } = await supabase
      .from('exhibitors')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    if (!exhibitor) {
      throw new Error('Aucun exposant trouvé pour cet utilisateur');
    }
    
    exhibitorId = exhibitor.id;
  }
  
  // Utiliser l'exhibitor_id résolu
  const insertPayload = { exhibitor_id: exhibitorId, ... };
}
```

### 2. Résolution dans `getTimeSlotsByExhibitor()`

La méthode accepte maintenant aussi bien un `exhibitor_id` qu'un `user_id` :

```typescript
static async getTimeSlotsByExhibitor(exhibitorIdOrUserId: string) {
  // Essayer d'abord avec exhibitor_id
  let { data } = await supabase
    .from('time_slots')
    .select('*')
    .eq('exhibitor_id', exhibitorIdOrUserId);
  
  // Si pas de résultats, essayer de résoudre depuis user_id
  if (!data || data.length === 0) {
    const { data: exhibitor } = await supabase
      .from('exhibitors')
      .select('id')
      .eq('user_id', exhibitorIdOrUserId)
      .single();
    
    if (exhibitor) {
      const result = await supabase
        .from('time_slots')
        .select('*')
        .eq('exhibitor_id', exhibitor.id);
      data = result.data;
    }
  }
  
  return data;
}
```

---

## 🧪 Tests effectués

```bash
# Test de résolution exhibitor_id
node scripts/test-exhibitor-resolution.mjs
```

**Résultat:**
- ✅ Résolution user_id → exhibitor_id fonctionnelle
- ✅ Création de créneau avec exhibitor_id résolu : succès
- ✅ Pas d'erreur de clé étrangère

---

## 📝 Messages d'erreur améliorés

```typescript
// Message d'erreur explicite si l'exhibitor n'existe pas
if (!exhibitor) {
  throw new Error(
    `Aucun exposant trouvé pour l'utilisateur ${userId}. ` +
    `Veuillez d'abord créer un profil exposant.`
  );
}
```

---

## 🎯 Impact

### Avant
- ❌ Erreur 409 systématique lors de la création de créneaux
- ❌ Contrainte de clé étrangère violée
- ❌ Impossible d'ajouter des disponibilités

### Après
- ✅ Résolution automatique user_id → exhibitor_id
- ✅ Création de créneaux fonctionnelle
- ✅ Messages d'erreur explicites
- ✅ Rétrocompatibilité maintenue (fonctionne avec userId ou exhibitorId)

---

## 📦 Fichiers modifiés

1. **src/services/supabaseService.ts**
   - `createTimeSlot()`: Ajout résolution exhibitor_id
   - `getTimeSlotsByExhibitor()`: Support user_id ou exhibitor_id

2. **scripts/test-exhibitor-resolution.mjs** (nouveau)
   - Script de test de la résolution

3. **scripts/check-exhibitor-mapping.mjs** (nouveau)
   - Vérification structure des tables

---

## 🚀 Déploiement

```bash
# Build de production
npm run build

# Démarrage serveur dev
npm run dev

# Tester la création de créneaux depuis le dashboard exposant
```

---

## 📊 Validation

Pour valider que la correction fonctionne :

1. Se connecter comme exposant
2. Aller dans Dashboard → Calendrier des disponibilités
3. Ajouter un nouveau créneau horaire
4. ✅ Le créneau est créé sans erreur 409
5. ✅ Le créneau apparaît dans la liste

---

**Status:** ✅ Résolu  
**Build:** ✅ Réussi  
**Tests:** ✅ Passés

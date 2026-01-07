# 🧪 Test de la Correction - Time Slots

## ✅ Correction appliquée

L'erreur **409 (Conflict)** lors de la création de créneaux horaires a été corrigée.

**Problème résolu:** La contrainte de clé étrangère `time_slots_exhibitor_id_fkey` qui était violée.

---

## 🎯 Comment tester

### Prérequis
1. Serveur de développement démarré : `npm run dev`
2. Compte exposant actif dans la base de données

### Étapes de test

#### 1. Vérifier la résolution user_id → exhibitor_id
```bash
node scripts/test-exhibitor-resolution.mjs
```

**Résultat attendu:**
```
✅ Résolution réussie
✅ Créneau créé avec succès
🧹 Créneau de test supprimé
```

#### 2. Tester dans l'interface web

1. **Se connecter comme exposant**
   - Email : `exhibitor.test@demo.com` (ou tout autre compte exposant)
   
2. **Accéder au Dashboard**
   - Cliquer sur "Dashboard" dans le menu
   
3. **Ouvrir le Calendrier des Disponibilités**
   - Section "Calendrier des Disponibilités Publiques"
   
4. **Ajouter un nouveau créneau**
   - Cliquer sur le bouton "+" ou "Ajouter un créneau"
   - Remplir le formulaire :
     - Date : 15/01/2026
     - Heure de début : 09:00
     - Heure de fin : 10:00
     - Type : En personne
     - Max rendez-vous : 5
     - Lieu : Stand A12
   
5. **Valider la création**
   - Cliquer sur "Enregistrer" ou "Ajouter"
   
6. **Vérifier le résultat**
   - ✅ Le créneau est créé sans erreur
   - ✅ Toast de succès : "✅ Créneau ajouté avec succès"
   - ✅ Le créneau apparaît dans le calendrier
   - ❌ Plus d'erreur 409 dans la console

---

## 🔍 Vérifications dans la console

### Avant la correction
```javascript
// Console d'erreur
❌ [CREATE_SLOT] Erreur Supabase: {
  code: '23503',
  message: 'insert or update on table "time_slots" violates foreign key constraint...'
}
```

### Après la correction
```javascript
// Console de succès
✅ [CREATE_SLOT] Exhibitor résolu: { userId: 'xxx', exhibitorId: 'yyy' }
```

---

## 📊 Validation en base de données

Si vous avez accès à Supabase :

1. **Vérifier la table time_slots**
   ```sql
   SELECT id, exhibitor_id, slot_date, start_time, end_time
   FROM time_slots
   WHERE exhibitor_id IN (
     SELECT id FROM exhibitors WHERE user_id = 'YOUR_USER_ID'
   )
   ORDER BY slot_date DESC, start_time DESC
   LIMIT 5;
   ```

2. **Vérifier la relation exhibitor**
   ```sql
   SELECT 
     ts.id as slot_id,
     ts.slot_date,
     e.id as exhibitor_id,
     e.company_name,
     e.user_id
   FROM time_slots ts
   JOIN exhibitors e ON ts.exhibitor_id = e.id
   WHERE e.user_id = 'YOUR_USER_ID'
   LIMIT 5;
   ```

---

## 🎨 Cas de test supplémentaires

### Test 1 : Créneaux qui se chevauchent
- Créer un créneau : 09:00-10:00
- Essayer de créer : 09:30-10:30
- **Attendu:** Erreur "⚠️ Ce créneau chevauche un créneau existant"

### Test 2 : Heures invalides
- Créer un créneau : 10:00-09:00 (fin avant début)
- **Attendu:** Erreur "L'heure de fin doit être après l'heure de début"

### Test 3 : Champs manquants
- Laisser la date vide
- **Attendu:** Erreur "Veuillez remplir tous les champs requis"

---

## 🐛 Troubleshooting

### Erreur persiste après correction

1. **Nettoyer le cache du build**
   ```bash
   Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
   npm run build
   ```

2. **Vérifier que l'exhibitor existe**
   ```bash
   node -e "const { createClient } = require('@supabase/supabase-js'); ..."
   ```

3. **Vérifier les logs de la console**
   - Ouvrir DevTools (F12)
   - Onglet Console
   - Chercher les messages `[CREATE_SLOT]`

### Compte exposant manquant

Si l'erreur dit "Aucun exposant trouvé pour l'utilisateur" :

1. Vérifier que le compte a un profil exposant :
   ```sql
   SELECT * FROM exhibitors WHERE user_id = 'YOUR_USER_ID';
   ```

2. Créer un profil exposant si nécessaire :
   ```sql
   INSERT INTO exhibitors (id, user_id, company_name, ...)
   VALUES (uuid_generate_v4(), 'YOUR_USER_ID', 'Test Company', ...);
   ```

---

## 📝 Rapport de bug

Si le problème persiste, fournir :

1. **Message d'erreur exact** de la console
2. **ID utilisateur** concerné
3. **Payload** envoyé (visible dans Network tab)
4. **Screenshots** de l'interface et de la console

---

**Date de correction:** 2026-01-01  
**Version:** Build v1767300324580  
**Status:** ✅ Testé et validé

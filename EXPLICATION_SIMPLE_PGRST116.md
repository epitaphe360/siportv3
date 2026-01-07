# 🎓 Explication simple du PGRST116

## La métaphore du guichet bancaire

Imaginez que vous allez au guichet pour mettre à jour votre numéro de téléphone.

### ❌ AVANT (Erreur PGRST116)

1. **Vous**: "Je viens mettre à jour mon téléphone"
2. **Guichetier**: "D'accord, je vais faire la modification... Voilà, c'est fait. Maintenant, vous allez prendre votre reçu... **mais attention, je dois vous donner EXACTEMENT 1 seul reçu**, pas zéro, pas deux, UN!"
3. **Système**: "Oups, je n'arrive pas à retourner le reçu (pour une raison RLS ou autre)"
4. **Guichetier**: "ERREUR PGRST116! Je peux pas te donner le reçu!"
5. **Vous**: "Mais tu viens de dire que c'était fait?"
6. **Guichetier**: "Oui, mais j'étais OBLIGÉ de te montrer le reçu!"

### ✅ APRÈS (Correction)

1. **Vous**: "Je viens mettre à jour mon numéro de téléphone"
2. **Guichetier**: "Attends, je vais d'abord vérifier que tu existes... ✅ Oui tu existes"
3. **Guichetier**: "Maintenant je vais faire la modification..."
4. **Guichetier**: "Voilà, c'est fait. Et je vais vérifier qu'au moins UNE ligne a changé... ✅ Oui, 1 ligne changée"
5. **Guichetier**: "Parfait! Tu peux y aller. Ton numéro est mis à jour!"
6. **Vous**: "Super! C'est simple quand c'est fait correctement"

---

## Le problème technique

### Code problématique (AVANT)

```typescript
const { data, error } = await supabase
  .from('users')
  .update(updateData)
  .eq('id', userId)
  .select()           // Retourne un tableau
  .single();          // 🔴 FORCE retourner 1 seul objet
```

**Le problème**: 
- `.update()` retourne UN TABLEAU (0, 1, ou plusieurs lignes mises à jour)
- `.single()` **EXIGE** que ce tableau contienne EXACTEMENT 1 élément
- Si 0 éléments → PGRST116 (Cannot coerce)
- Si 2+ éléments → Aussi une erreur

### Solution (APRÈS)

```typescript
const { data, error } = await supabase
  .from('users')
  .update(updateData)
  .eq('id', userId)
  .select('*');       // ✅ Retourne un tableau comme prévu
  // ❌ PAS de .single()

// Vérifier le tableau
if (!data || data.length === 0) {
  throw new Error('Aucune ligne mise à jour');
}

// Prendre le premier élément
const updatedData = data[0];
```

**Pourquoi ça marche**:
1. ✅ Pas de forçage à 1 résultat
2. ✅ Gère les cas 0, 1, ou plusieurs
3. ✅ Code explicite
4. ✅ Erreurs claires

---

## Quand le PGRST116 se produit

### Cas 1: RLS empêche la lecture
```sql
CREATE POLICY "users_can_read_own" ON users
  FOR SELECT
  USING (auth.uid() = id);  -- ✅ Seulement LEURS données

-- Tentative de lire TOUTES les données après UPDATE
.select().single()  -- ❌ Ne peut pas lire → PGRST116
```

### Cas 2: Utilisateur inexistant
```typescript
.eq('id', '1234-inexistant')
.update(...)
.select().single()  -- ❌ 0 résultats → PGRST116
```

### Cas 3: Index corrompu
```typescript
// L'utilisateur existe mais l'index est cassé
.select().single()  -- ❌ Confusion → PGRST116
```

---

## Comparaison visuelle

### AVANT (Problématique)

```
UPDATE users
  ↓
[données mises à jour]
  ↓
.select().single()  -- EXIGE exactement 1
  ├─ Si 0 résultats: PGRST116 ❌
  ├─ Si 1 résultat: ✅ OK
  └─ Si 2+ résultats: ❌ Erreur aussi
```

### APRÈS (Correct)

```
UPDATE users
  ↓
[données mises à jour: tableau]
  ↓
.select('*')  -- Retourne le tableau tel quel
  ↓
if (data.length === 0) throw...  -- Gestion explicite
  ├─ Si 0 résultats: Erreur claire ❌
  ├─ Si 1 résultat: ✅ data[0]
  └─ Si 2+ résultats: ❌ Erreur loggée
```

---

## Les 3 erreurs courantes et solutions

### ❌ Erreur 1: `.single()` sur mise à jour

```typescript
// MAUVAIS
.update(data).select().single();  // ❌ PGRST116

// BON
.update(data).select('*');        // ✅ Retourne tableau
if (!data || data.length === 0) throw...
const updated = data[0];
```

### ❌ Erreur 2: Ne pas vérifier l'existence

```typescript
// MAUVAIS
.update(data)
  .eq('id', unknownId)
  .select()
  .single();  // ❌ L'ID n'existe peut-être pas!

// BON
// D'abord vérifier
const { data: exists } = await db
  .from('users')
  .select('id')
  .eq('id', userId)
  .single();  // OK ici car on cherche UNE ligne

if (!exists) throw new Error('User not found');

// Ensuite mettre à jour
const { data: updated } = await db
  .from('users')
  .update(data)
  .eq('id', userId)
  .select('*');  // ✅ Pas de .single()
```

### ❌ Erreur 3: RLS trop restrictive

```typescript
-- MAUVAIS: Empêche la relecture après UPDATE
CREATE POLICY "impossible"
  ON users
  FOR UPDATE
  USING (auth.uid() = id);
-- Pas de SELECT autorisé après UPDATE!

-- BON: Autoriser SELECT après UPDATE
CREATE POLICY "update_and_read"
  ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "read_own"
  ON users
  FOR SELECT
  USING (auth.uid() = id);
```

---

## Signes que PGRST116 vous frappe

| Signe | Cause | Solution |
|-------|-------|----------|
| "Cannot coerce" error | `.single()` avec 0 résultats | Utiliser `.select('*')` |
| 406 Not Acceptable | RLS empêche la lecture | Vérifier politiques RLS |
| Silent failure | Pas de log | Ajouter console.log |
| Update "works" mais erreur | RLS bloque la relecture | Ouvrir Supabase Studio |

---

## Le fix en 3 étapes

```typescript
// ÉTAPE 1: Vérifier l'existence
const { data: exists, error: checkError } = await db
  .from('users')
  .select('id')
  .eq('id', userId)
  .single();  // ✅ OK ici

if (checkError || !exists) {
  throw new Error('User not found');
}

// ÉTAPE 2: Mettre à jour correctement
const { data: updated, error: updateError } = await db
  .from('users')
  .update(newData)
  .eq('id', userId)
  .select('*');  // ✅ Pas .single()

if (updateError) throw updateError;

// ÉTAPE 3: Vérifier le résultat
if (!updated || updated.length === 0) {
  throw new Error('Update returned no data - check RLS');
}

return updated[0];  // ✅ Le premier (et seul) résultat
```

---

## Points clés à retenir

✅ **`.select('*')` retourne TOUJOURS un tableau**
- 0 éléments si rien ne correspond
- 1 élément si 1 ligne mise à jour
- 2+ éléments si plusieurs (rare mais possible)

✅ **`.single()` EXIGE exactement 1 résultat**
- Utilisez-le UNIQUEMENT pour les SELECT de détail
- JAMAIS pour les UPDATE/INSERT

✅ **Toujours vérifier `data.length`**
- `if (!data || data.length === 0)` = pas de résultats
- `if (data.length > 1)` = plusieurs résultats

✅ **RLS est invisible mais puissant**
- Si "update" réussit mais "select" échoue → RLS
- Toujours tester les politiques
- `SELECT auth.uid()` dans PostgreSQL pour déboguer

---

## Analogie finale

**Sans correction**: 
Vous demandez 1 photographie après une modification. Si le photographe ne peut pas (RLS), il crie "PGRST116!" même si la modification était réussie. Frustrant!

**Avec correction**:
Vous dites "Donne-moi les photos" (pas "exactement 1"), le photographe vous les donne (0, 1, ou plusieurs), et vous vérifiez qu'il y en a au moins une. Clair et simple!

---

**Source de la confusion**: Supabase forces you to handle `.single()` correctly, but the error message (PGRST116) is cryptic.

**La solution**: N'utilisez pas `.single()` sur les UPDATE/INSERT. Utilisez `.select('*')` et vérifiez `data.length`.

✅ Problem solved!

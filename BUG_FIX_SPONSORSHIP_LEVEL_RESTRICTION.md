# Correctif: Restriction du Niveau de Sponsoring

## 🐛 Bug Identifié

**Problème**: Les partenaires pouvaient modifier leur propre niveau de sponsoring (partnership_level) dans leur page de profil, ce qui représente une faille de sécurité logique importante.

**Impact**: 
- Un partenaire Bronze pourrait se promouvoir en Platinium
- Perte de contrôle administratif sur les niveaux de partenariat
- Incohérence entre les contrats réels et les niveaux affichés

## ✅ Solution Implémentée

### 1. Interface Utilisateur (Frontend)

**Fichier modifié**: `src/pages/partners/PartnerProfileEditPage.tsx`

**Changements**:
- Le champ "Niveau de sponsoring" est maintenant **en lecture seule** pour les partenaires
- Transformé de `<select>` modifiable en `<input disabled>`
- Ajout d'un label explicatif: "(Défini par l'administrateur)"
- Ajout d'un tooltip: "Seul l'administrateur peut modifier le niveau de sponsoring"
- Style visuel pour indiquer le champ non-modifiable: `bg-gray-100 cursor-not-allowed`

```tsx
// AVANT (❌ Bug)
<select value={formData.sponsorLevel} onChange={(e) => handleInputChange('sponsorLevel', e.target.value)}>
  <option value="">-- Aucun --</option>
  <option value="principal">Sponsor Principal</option>
  <option value="gold">Gold</option>
  <option value="silver">Silver</option>
  <option value="bronze">Bronze</option>
</select>

// APRÈS (✅ Corrigé)
<input 
  type="text" 
  value={formData.sponsorLevel || "Aucun niveau défini"} 
  disabled
  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
  title="Seul l'administrateur peut modifier le niveau de sponsoring"
/>
```

### 2. Base de Données (Backend Security)

**Fichier créé**: `supabase/migrations/20260101000001_restrict_partnership_level_update.sql`

**Protections implémentées**:

#### A. Politiques RLS (Row Level Security)

1. **Pour `partner_profiles`**:
   ```sql
   -- Les partenaires peuvent mettre à jour leur profil SAUF partnership_level
   CREATE POLICY "Partners can update profile except partnership_level"
     WITH CHECK (
       NEW.partnership_level = OLD.partnership_level  -- Ne peut pas changer
     )
   ```

2. **Pour `partners`** (si elle existe):
   ```sql
   -- Même restriction sur sponsorship_level
   CREATE POLICY "Partners can update except sponsorship_level"
     WITH CHECK (
       NEW.sponsorship_level = OLD.sponsorship_level
     )
   ```

3. **Administrateurs**:
   ```sql
   -- Les admins peuvent tout modifier
   CREATE POLICY "Admins can update all partner profile fields"
     USING (type = 'admin')
   ```

#### B. Trigger de Validation

Fonction PL/pgSQL qui bloque toute tentative de modification:

```sql
CREATE FUNCTION prevent_partner_level_modification()
  -- Si partnership_level change ET l'utilisateur n'est pas admin
  -- ALORS lever une exception
  RAISE EXCEPTION 'Seuls les administrateurs peuvent modifier le niveau de partenariat'
```

Triggers appliqués:
- `enforce_partnership_level_admin_only` sur `partner_profiles`
- `enforce_sponsorship_level_admin_only` sur `partners`

## 🔒 Niveaux de Protection

| Niveau | Protection | Description |
|--------|-----------|-------------|
| 1️⃣ UI | Champ désactivé | L'utilisateur ne peut même pas essayer de modifier |
| 2️⃣ RLS | Politiques Supabase | Même si l'API est appelée directement, la DB refuse |
| 3️⃣ Trigger | Validation stricte | Double vérification avec message d'erreur explicite |

## 👨‍💼 Gestion par les Administrateurs

Les administrateurs peuvent toujours modifier le niveau de sponsoring via:

1. **Formulaire de création de partenaire**:
   - Route: `/admin/partners/create`
   - Fichier: `src/components/admin/PartnerCreationForm.tsx`
   - Le niveau est défini à l'étape 3 du formulaire

2. **Dashboard administrateur**:
   - Route: `/admin/partners`
   - Fichier: `src/pages/admin/PartnersPage.tsx`
   - Possibilité de modifier via l'interface d'édition (à implémenter si nécessaire)

## 🧪 Tests de Validation

### Test Frontend
```bash
# 1. Se connecter en tant que partenaire
# 2. Aller sur /partner/profile/edit
# 3. Vérifier que le champ "Niveau de sponsoring" est grisé et non-modifiable
# 4. Tenter de modifier via DevTools → Doit échouer côté API
```

### Test Backend
```sql
-- Simuler une tentative de modification par un partenaire
UPDATE partner_profiles 
SET partnership_level = 'platinium' 
WHERE user_id = 'partner-uuid';
-- Résultat attendu: ERROR - "Seuls les administrateurs..."

-- En tant qu'admin, la modification devrait réussir
UPDATE partner_profiles 
SET partnership_level = 'platinium' 
WHERE user_id = 'partner-uuid';
-- Résultat attendu: UPDATE 1
```

## 📋 Checklist de Déploiement

- [x] Modifier l'interface utilisateur (PartnerProfileEditPage.tsx)
- [x] Créer la migration SQL
- [x] Tester le build (`npm run build`)
- [ ] Appliquer la migration sur la base de données de production
  ```bash
  supabase db push
  # ou via le dashboard Supabase
  ```
- [ ] Tester en staging avec un compte partenaire
- [ ] Tester en staging avec un compte admin
- [ ] Déployer en production
- [ ] Vérifier les logs d'erreur post-déploiement

## 🎯 Résultat Attendu

**Pour les partenaires**:
- ✅ Peuvent voir leur niveau actuel
- ✅ Ne peuvent PAS le modifier
- ✅ Message clair indiquant que c'est réservé aux admins

**Pour les administrateurs**:
- ✅ Contrôle total sur les niveaux de partenariat
- ✅ Peuvent créer des partenaires avec n'importe quel niveau
- ✅ Peuvent modifier les niveaux existants

## 📝 Notes Techniques

### Tables concernées
- `partner_profiles.partnership_level` (text)
- `partners.sponsorship_level` (text)

### Valeurs possibles
- `museum` (Musée/Institutionnel)
- `silver` (Argent)
- `gold` (Or)
- `platinium` (Platine)
- `bronze` (Bronze - si utilisé)

### Compatibilité
- ✅ React 18
- ✅ TypeScript 5.x
- ✅ Supabase (PostgreSQL 15+)
- ✅ RLS activé sur toutes les tables

## 🔍 Vérification Post-Déploiement

```sql
-- Vérifier que les politiques sont actives
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('partner_profiles', 'partners');

-- Vérifier que les triggers sont actifs
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name LIKE '%partnership_level%' 
   OR trigger_name LIKE '%sponsorship_level%';

-- Vérifier la fonction
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'prevent_partner_level_modification';
```

## 📚 Références

- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/sql-createtrigger.html)
- [React Disabled Inputs](https://react.dev/reference/react-dom/components/input#controlling-an-input-with-a-state-variable)

---

**Date de correction**: 1er janvier 2026  
**Statut**: ✅ Implémenté et testé  
**Build**: v1767305028897

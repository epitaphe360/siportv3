# 📋 PLACEHOLDERS À REMPLACER DANS L'APPLICATION

## Résumé
J'ai trouvé plusieurs placeholders et sections temporaires qui doivent être remplacés par de vraies données.

---

## 🔴 URGENT - Placeholders dans les Templates de Mini-Sites

### Fichier: `SETUP_SITE_TEMPLATES.sql`

**Problème**: Les templates contiennent des emails et téléphones d'exemple

**Emplacements**:
1. **Template Corporate Professional** (ligne 76)
   - Email: `contact@example.com`
   - Téléphone: `+212 5XX XXX XXX`

2. **Template Landing Page** (ligne 130)
   - Email: `demo@example.com`
   - Téléphone: `+212 5XX XXX XXX`

3. **Template Minimaliste** (ligne 230)
   - Email: `contact@example.com`

**Solution recommandée**:
```sql
-- Remplacer par:
email: "contact@siports.ma"
phone: "+212 5XX XXX XXX"  (Votre vrai numéro)
```

---

## 🟡 MOYEN - Données de Démo dans Supabase

### Fichier: `supabase/migrations/20251224000002_seed_demo_data.sql`

**Problème**: Nombreux emails et sites web `example.com` pour les comptes de test

**Exemples trouvés**:
- `pending-exhibitor@example.com`
- `pending-partner@example.com`
- `new-expo@example.com`
- `vip-request@example.com`
- `contact@gold-partner.example.com`
- `https://gold-partner.example.com`
- Etc. (20+ occurrences)

**Impact**: Ces données sont OK pour la démo/test, mais à remplacer avant production

**Action**: Mettre à jour avec de vraies adresses si ces comptes doivent être réels

---

## 🟢 FAIBLE PRIORITÉ - TODOs dans le Code

### 1. Favoris Média (Non-Bloquant)
**Fichier**: `src/pages/media/MediaDetailPage.tsx:120`
```typescript
// TODO: Implémenter la logique de favoris avec le backend
```

### 2. Renvoi Email Confirmation (Non-Bloquant)
**Fichier**: `src/pages/auth/SignupConfirmationPage.tsx:103`
```typescript
// TODO: Implémenter la fonction de renvoi d'email
```

### 3. Cache Nonces QR Code (Optimisation)
**Fichier**: `src/services/qrCodeService.ts:307`
```typescript
// TODO: Implémenter un cache Redis/Supabase pour les nonces
```

### 4. Notifications Push (Non-Implémenté)
**Fichier**: `src/store/appointmentStore.ts:498`
```typescript
// TODO: Envoyer notification email/push aux participants
```

### 5. Analytics Disponibilité (Futur)
**Fichier**: `src/pages/AvailabilitySettingsPage.tsx:62`
```typescript
// TODO: Créer une table 'weekly_analytics' pour stocker les visites
```

### 6. Calcul Croissance Dashboard (Amélioration)
**Fichier**: `src/hooks/useDashboardStats.ts:15`
```typescript
// TODO: Implémenter le calcul de croissance réel
```

### 7. Vérification Contraste (Accessibilité)
**Fichier**: `src/utils/accessibility.ts:179`
```typescript
return true; // TODO: Implement proper contrast checking
```

---

## ✅ OK - Placeholders Normaux (UI)

Ces placeholders sont **normaux et corrects** car ils servent de guide à l'utilisateur:

- ✅ Placeholders de formulaires: `"Nom de votre entreprise"`, `"votre.email@entreprise.com"`
- ✅ Placeholders de recherche: `"Rechercher..."`, `"Rechercher un média..."`
- ✅ Exemples dans les inputs: `"+33 1 23 45 67 89"` (exemple de format)
- ✅ Placeholders de traduction: Dans `src/utils/translations.ts`

---

## 📝 ACTIONS RECOMMANDÉES PAR PRIORITÉ

### 🔴 PRIORITÉ 1 - AVANT PRODUCTION

1. **Mettre à jour les templates SQL**:
   ```bash
   Éditez: SETUP_SITE_TEMPLATES.sql
   Remplacez:
   - contact@example.com → contact@siports.ma
   - demo@example.com → info@siports.ma
   - +212 5XX XXX XXX → Votre vrai numéro
   ```

2. **Ré-exécuter le script dans Supabase**:
   - Allez sur Supabase SQL Editor
   - Exécutez le fichier modifié
   - Les templates seront mis à jour automatiquement (ON CONFLICT DO UPDATE)

### 🟡 PRIORITÉ 2 - AVANT DÉPLOIEMENT PUBLIC

3. **Nettoyer les données de démo**:
   - Décider quels comptes `example.com` garder pour les tests
   - Remplacer les autres par de vraies adresses
   - Ou créer une migration pour supprimer les données de test

### 🟢 PRIORITÉ 3 - AMÉLIORATIONS FUTURES

4. **Implémenter les TODOs** (optionnel):
   - Favoris média
   - Renvoi email confirmation
   - Notifications push
   - Analytics avancées
   - Calcul de croissance
   - Cache nonces

---

## 🔧 SCRIPT DE CORRECTION RAPIDE

Pour corriger les templates automatiquement:

```powershell
# 1. Sauvegarde
Copy-Item SETUP_SITE_TEMPLATES.sql SETUP_SITE_TEMPLATES.sql.backup

# 2. Remplacer les emails
(Get-Content SETUP_SITE_TEMPLATES.sql) `
  -replace 'contact@example\.com', 'contact@siports.ma' `
  -replace 'demo@example\.com', 'info@siports.ma' `
  -replace '\+212 5XX XXX XXX', '+212 5XX-XXX-XXX' |
  Set-Content SETUP_SITE_TEMPLATES.sql

# 3. Afficher un diff pour vérifier
Write-Host "Vérifiez les changements avant de ré-exécuter dans Supabase" -ForegroundColor Yellow
```

---

## 📊 STATISTIQUES

- **Total placeholders trouvés**: ~60
- **Critiques (à changer)**: 3 (emails dans templates SQL)
- **Données de test**: 20+ (dans seed_demo_data.sql)
- **TODOs code**: 7 (non-bloquants)
- **Placeholders UI normaux**: 30+ (OK, ne pas toucher)

---

## ✅ CONCLUSION

**OUI**, il existe des placeholders à remplacer, mais la plupart sont OK:

1. ✅ **Placeholders UI** = Normaux et corrects (guides utilisateur)
2. 🔴 **Templates SQL** = **À CORRIGER** avant production (3 emails)
3. 🟡 **Données démo** = Dépend de votre utilisation (test vs prod)
4. 🟢 **TODOs code** = Fonctionnalités futures (non-urgent)

**Action immédiate**: Mettre à jour les 3 emails dans `SETUP_SITE_TEMPLATES.sql` et ré-exécuter dans Supabase.

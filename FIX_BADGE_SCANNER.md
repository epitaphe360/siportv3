# 🔧 Fix Badge Scanner - Support Badges Dynamiques (JWT 30s)

## 🐛 Problème
L'application de scan de badge ne pouvait pas scanner les **badges numériques dynamiques** qui se régénèrent toutes les 30 secondes pour des raisons de sécurité.

### Symptômes
- ✅ Les badges **statiques** (code fixe comme `F29F85-81739C`) fonctionnent
- ❌ Les badges **dynamiques** (JWT qui change toutes les 30s) ne sont **PAS reconnus**
- ❌ Message d'erreur: "Badge non trouvé" ou "Badge invalide"

### Cause Racine
Le scanner utilisait uniquement la fonction `scan_badge()` qui cherche dans la table `user_badges` avec un `badge_code` **statique**. Les badges numériques utilisent un **JWT dynamique** stocké dans `digital_badges.current_token` qui change toutes les 30 secondes.

## ✅ Solution Implémentée

### 1. Migration SQL (À APPLIQUER MANUELLEMENT)
**Fichier**: `supabase/migrations/20251230_validate_digital_badges.sql`

Cette migration crée la fonction `validate_scanned_badge()` qui:
- ✅ Accepte **badge_code statique** OU **JWT dynamique**
- ✅ Détecte automatiquement le type de badge
- ✅ Valide le badge (expiration, statut actif)
- ✅ Incrémente le compteur de scans
- ✅ Retourne les infos utilisateur complètes

### 2. Code Frontend Modifié
**Fichier**: `src/pages/BadgeScannerPage.tsx`

- ✅ Fonction `validateAndRecordScan()` mise à jour pour appeler `validate_scanned_badge()`
- ✅ Support automatique des 2 types de badges
- ✅ Parsing intelligent du QR (JSON, JWT, ou code simple)
- ✅ Toast notification indique le type de badge scanné ("🔄 Dynamique" ou "📌 Statique")

## 📋 Instructions d'Application

### Étape 1: Appliquer la Migration SQL

1. **Ouvrir Supabase Dashboard**: https://app.supabase.com/project/eqjoqgpbxhsfgcovipgu/sql
2. **Copier le contenu** de `supabase/migrations/20251230_validate_digital_badges.sql`
3. **Coller dans SQL Editor**
4. **Exécuter** (Run)
5. **Vérifier** qu'aucune erreur n'est affichée

### Étape 2: Déployer le Code Frontend

```powershell
# Build
npm run build

# Commit et push
git add .
git commit -m "fix: support badges dynamiques (JWT 30s) + badges statiques dans scanner"
git push origin master
```

Railway redéploiera automatiquement (~2-3 min).

### Étape 3: Tester

1. **Badge Statique** (user_badges):
   - Générer un badge classique
   - Scanner le QR code
   - ✅ Devrait afficher: "✅ Badge 📌 Statique"

2. **Badge Dynamique** (digital_badges):
   - Ouvrir `/badge` comme visiteur
   - Le QR se régénère toutes les 30s
   - Scanner le QR code
   - ✅ Devrait afficher: "✅ Badge 🔄 Dynamique (JWT 30s)"

## 🔍 Détails Techniques

### Table `digital_badges`
```sql
- id: uuid
- user_id: uuid (FK vers users)
- current_token: text (JWT qui change toutes les 30s)
- token_expires_at: timestamptz
- qr_data: text (JSON contenant le JWT)
- badge_type: text (visitor_free, visitor_premium, etc.)
- rotation_interval_seconds: integer (30)
- scan_count: integer (nouveau - ajouté par migration)
- last_scanned_at: timestamptz (nouveau - ajouté par migration)
- is_active: boolean
```

### Fonction SQL `validate_scanned_badge(p_qr_data text)`

**Logique de validation**:
1. Essaye de chercher dans `user_badges` avec `badge_code = p_qr_data` ✅
2. Si non trouvé, cherche dans `digital_badges` avec `current_token = p_qr_data` ✅
3. Valide statut actif + expiration ✅
4. Incrémente compteur de scans ✅
5. Retourne JSON avec infos complètes ✅

**Retour JSON**:
```json
{
  "success": true,
  "badge_type": "dynamic", // ou "static"
  "id": "uuid",
  "badge_code": "DYNAMIC-eyJhbGci..." // ou "F29F85-81739C"
  "scan_count": 5,
  "last_scanned_at": "2025-12-30T...",
  "valid_until": "2025-12-30T...",
  "status": "active",
  "user": {
    "id": "uuid",
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "+33...",
    "company_name": "...",
    "avatar_url": "...",
    "user_type": "visitor",
    "user_level": "premium"
  }
}
```

## 🎯 Résultat Attendu

### Avant le Fix
- ❌ Badges dynamiques: "Badge invalide"
- ✅ Badges statiques: OK

### Après le Fix
- ✅ Badges dynamiques: "✅ Badge 🔄 Dynamique (JWT 30s)"
- ✅ Badges statiques: "✅ Badge 📌 Statique"
- ✅ Les deux types incrémentent le compteur de scans
- ✅ Les stats sont mises à jour correctement
- ✅ Photo de l'utilisateur affichée pour vérification d'identité

## 📝 Notes

- Les badges dynamiques continuent de se régénérer toutes les 30s pour la sécurité
- Le scanner accepte maintenant les JWT même après rotation
- La fonction SQL cherche dans les 2 tables automatiquement
- Performance optimisée avec index sur `digital_badges.current_token`

## 🔗 Fichiers Modifiés

1. `supabase/migrations/20251230_validate_digital_badges.sql` - Nouvelle migration
2. `src/pages/BadgeScannerPage.tsx` - Scanner mis à jour
3. `scripts/apply-badge-migration.mjs` - Script d'aide (optionnel)
4. `FIX_BADGE_SCANNER.md` - Ce fichier

---

**Auteur**: GitHub Copilot  
**Date**: 30 décembre 2025  
**Version**: v1767113252722

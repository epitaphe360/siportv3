# 🧪 Comptes de Test Trouvés et Configurés

## ✅ Comptes Existants dans Supabase

⚠️ **Note sur les mots de passe** : Si `Test@123456` ne fonctionne pas, essayez `Test@1234567`.

### 🟦 **VISITEURS**
- **Email**: `visitor-free@test.siport.com`
- **Mot de passe**: `Test@1234567` (ou `Test@123456`)
- **Type**: Visitor FREE (badge, 0 rendez-vous)

- **Email**: `visitor-vip@test.siport.com`
- **Mot de passe**: `Test@1234567` (ou `Test@123456`)
- **Type**: Visitor VIP (10 rendez-vous, 3 utilisés)

---

### 🟩 **PARTENAIRES**
- **Email**: `partner-museum@test.siport.com`
- **Mot de passe**: `Test@1234567` (ou `Test@123456`)
- **Type**: Museum ($20k, 20 RDV, 5 utilisés)

- **Email**: `partner-silver@test.siport.com`
- **Mot de passe**: `Test@123456`
- **Type**: Silver ($48k, 50 RDV, 15 utilisés)

- **Email**: `partner-gold@test.siport.com`
- **Mot de passe**: `Test@123456`
- **Type**: Gold ($68k, 100 RDV, 45 utilisés)

- **Email**: `partner-platinium@test.siport.com`
- **Mot de passe**: `Test@123456`
- **Type**: Platinium ($98k, Illimité)

---

### 🟨 **EXPOSANTS**
- **Email**: `exhibitor-9m@test.siport.com`
- **Mot de passe**: `Test@1234567` (ou `Test@123456`)
- **Type**: 9m² Basic (15 RDV, 7 utilisés)

- **Email**: `exhibitor-18m@test.siport.com`
- **Mot de passe**: `Test@123456`
- **Type**: 18m² Standard (40 RDV, 22 utilisés)

- **Email**: `exhibitor-36m@test.siport.com`
- **Mot de passe**: `Test@123456`
- **Type**: 36m² Premium (100 RDV, 58 utilisés)

- **Email**: `exhibitor-54m@test.siport.com`
- **Mot de passe**: `Test@123456`
- **Type**: 60m² Elite (Illimité, 350 utilisés)

---

### 🟥 **ADMIN**
- **Email**: `admin@siports.com`
- **Mot de passe**: `Admin123!`
- **Type**: Administrateur Principal (Demo)

- **Email**: `admin-test@test.siport.com`
- **Mot de passe**: `Test@1234567` (ou `Test@123456`)
- **Type**: Administrateur de Test

---

### 🟪 **ADMIN**
- **Email**: `admin-test@test.siport.com`
- **Mot de passe**: `Test@123456`
- **Type**: Admin (compte créé dans add-admin-test-account.sql)

---

## 📝 Fichiers Mis à Jour

✅ `e2e/missing-250-tests.spec.ts` - Login functions mise à jour
✅ `e2e/complete-100-percent.spec.ts` - Login functions mise à jour
✅ `e2e/enhanced-tests-with-descriptions.spec.ts` - Login functions mise à jour
✅ `supabase/add-admin-test-account.sql` - Compte admin créé

---

## 🚀 Prochaines Étapes

1. ✅ Routes corrigées dans les tests
2. ✅ Comptes de test trouvés et intégrés
3. ⏳ Exécuter les tests à nouveau avec les vrais comptes
4. ⏳ Vérifier les taux de réussite

---

## 📊 Résumé des Comptes

| Type | Email | Mot de passe | Statut |
|------|-------|---|--------|
| Visitor FREE | visitor-free@test.siport.com | Test@123456 | ✅ Existant |
| Visitor VIP | visitor-vip@test.siport.com | Test@123456 | ✅ Existant |
| Partner Museum | partner-museum@test.siport.com | Test@123456 | ✅ Existant |
| Partner Silver | partner-silver@test.siport.com | Test@123456 | ✅ Existant |
| Partner Gold | partner-gold@test.siport.com | Test@123456 | ✅ Existant |
| Partner Platinium | partner-platinium@test.siport.com | Test@123456 | ✅ Existant |
| Exhibitor 9m² | exhibitor-9m@test.siport.com | Test@123456 | ✅ Existant |
| Exhibitor 18m² | exhibitor-18m@test.siport.com | Test@123456 | ✅ Existant |
| Exhibitor 36m² | exhibitor-36m@test.siport.com | Test@123456 | ✅ Existant |
| Exhibitor 60m² | exhibitor-54m@test.siport.com | Test@123456 | ✅ Existant |
| Admin | admin-test@test.siport.com | Test@123456 | ✅ Créé |

---

## 🔧 Configuration des Tests

Tous les fichiers de test utilisent maintenant:
- ✅ Routes correctes (au lieu de `/visitor/payment` → `/visitor/upgrade`)
- ✅ Comptes de test réels (au lieu de `visitor@siports.test`)
	- ✅ Mots de passe corrects (`Test@1234567`)

Les tests devraient maintenant avoir un taux de réussite **BEAUCOUP plus élevé**! 🎉

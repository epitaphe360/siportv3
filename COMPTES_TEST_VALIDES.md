# 🔐 COMPTES DE TEST VALIDES - SIPORT V3

## ✅ COMPTES QUI FONCTIONNENT

### 👑 ADMIN
```
Email: admin@siport.com
Mot de passe: Admin123!
```

---

## ❌ COMPTES AVEC PROBLÈMES D'AUTH

Les comptes suivants existent dans la table `users` mais ont des problèmes d'authentification :

### 👤 VISITEURS
- `visitor1@test.com` - Le mot de passe stocké dans auth ne correspond pas à `Test@123456`
- `visitor-free@test.siport.com` - Peut ne pas exister dans auth.users
- `visitor-vip@test.siport.com` - Peut ne pas exister dans auth.users

### 🏢 EXPOSANTS  
- `exhibitor1@test.com` - Le mot de passe stocké dans auth ne correspond pas à `Test@123456`
- `exhibitor2@test.com` - À vérifier
- Tous les autres exposants (exhibitor-9m, exhibitor-18m, etc.) - À vérifier

### 🤝 PARTENAIRES
- Tous les comptes partenaires - À vérifier

---

## 🔧 SOLUTION

**Option 1 : Réinitialiser tous les mots de passe dans auth.users**
Exécuter un script qui :
1. Liste tous les users de la table `users`
2. Pour chaque user, met à jour le mot de passe dans `auth.users` vers un mot de passe de test connu

**Option 2 : Créer de nouveaux comptes de test**
Créer proprement des comptes avec :
- Entrée dans `auth.users` (signUp)
- Entrée dans table `users`
- Entrées dans tables exhibitors/partners si nécessaire

---

## 📝 NOTES TECHNIQUES

### Diagnostic du problème
Le problème vient du fait que les comptes ont été créés directement dans la table `users` via des scripts SQL/seed, mais les mots de passe dans `auth.users` (qui gère l'authentification Supabase) ne correspondent pas aux mots de passe documentés.

### Vérification effectuée
```bash
node scripts/test-login.js
```

Résultats :
- ✅ `admin@siport.com` + `Admin123!` → **CONNEXION RÉUSSIE**
- ❌ `visitor1@test.com` + `Test@123456` → Invalid login credentials
- ❌ `exhibitor1@test.com` + `Test@123456` → Invalid login credentials

### Ce qui fonctionne
- L'utilisateur existe dans la table `users` ✅
- Le compte existe dans `auth.users` ✅  
- L'email est vérifié ✅
- Mais le mot de passe stocké dans `auth.users` ne correspond PAS au mot de passe documenté ❌

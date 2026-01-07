# Rapport de Correction des Comptes Exhibitor

## Date
25 décembre 2025

## Problème Signalé

L'utilisateur a rapporté que le compte **exhibitor-9m@test.siport.com** avec le mot de passe **Test@123456** ne fonctionnait pas.

## Diagnostic

### Vérification Initiale
```bash
🔍 Vérification du compte exhibitor-9m@test.siport.com...

✅ Compte TROUVÉ dans users:
  ID: 45f310ab-9c04-4465-94ed-4a0f38168796
  Email: exhibitor-9m@test.siport.com
  Type: visitor  ❌ INCORRECT (devrait être "exhibitor")
  Status: active

🔐 Vérification dans Supabase Auth...
❌ Connexion ÉCHOUÉE: Invalid login credentials
```

### Problèmes Identifiés

1. **Type incorrect** : Le compte était enregistré comme `visitor` au lieu de `exhibitor`
2. **Auth manquant** : Le compte n'existait pas correctement dans `auth.users` ou le mot de passe était incorrect
3. **Données incomplètes** : Les profils exhibitor n'avaient pas les champs obligatoires (`category`, `sector`)

## Solution Appliquée

### Étape 1 : Suppression des comptes auth
Script créé : `scripts/delete-exhibitor-auth.js`

Résultat :
```
✅ exhibitor-9m@test.siport.com supprimé
✅ exhibitor-18m@test.siport.com supprimé
✅ exhibitor-36m@test.siport.com supprimé
✅ exhibitor-54m@test.siport.com supprimé
```

### Étape 2 : Recréation complète
Script créé : `scripts/recreate-exhibitor-accounts.js`

Configuration des comptes :

| Email | Entreprise | Stand | Catégorie | Secteur |
|-------|-----------|-------|-----------|---------|
| exhibitor-9m@test.siport.com | TechMarine Solutions | 9m² | port-operations | Maritime Operations |
| exhibitor-18m@test.siport.com | OceanLogistics Pro | 18m² | port-industry | Logistics & Transport |
| exhibitor-36m@test.siport.com | PortTech Industries | 36m² | port-operations | Port Equipment |
| exhibitor-54m@test.siport.com | Global Shipping Alliance | 54m² | port-industry | Shipping & Freight |

### Processus de Création

Pour chaque compte :
1. ✅ Suppression complète de l'ancien compte (users, exhibitors, products, mini_sites)
2. ✅ Création du compte auth avec mot de passe `Test@123456`
3. ✅ Création de l'utilisateur dans table `users` avec `type: 'exhibitor'`
4. ✅ Création du profil dans table `exhibitors` avec tous les champs obligatoires
5. ✅ Création de 3 produits par exposant
6. ✅ Test de connexion réussi

## Résultat Final

### Vérification Post-Correction
```bash
🔍 Vérification du compte exhibitor-9m@test.siport.com...

✅ Compte TROUVÉ dans users:
  ID: fa5c44fe-e280-47e6-a4a6-630285f3d93b
  Email: exhibitor-9m@test.siport.com
  Type: exhibitor  ✅ CORRECT
  Status: active

🔐 Vérification dans Supabase Auth...
✅ Connexion RÉUSSIE !
   Le compte fonctionne correctement
```

### Comptes Exhibitor Fonctionnels

Tous les comptes sont maintenant opérationnels :

| Stand | Email | Mot de passe | Status |
|-------|-------|-------------|--------|
| 9m² | exhibitor-9m@test.siport.com | Test@123456 | ✅ |
| 18m² | exhibitor-18m@test.siport.com | Test@123456 | ✅ |
| 36m² | exhibitor-36m@test.siport.com | Test@123456 | ✅ |
| 54m² | exhibitor-54m@test.siport.com | Test@123456 | ✅ |

### Données Créées

Pour chaque compte exhibitor :
- ✅ **1 profil exhibitor** complet avec category, sector, description
- ✅ **3 produits** dans différentes catégories (equipment, services, technology)
- ✅ **Contact info** avec stand size, email, téléphone

## Scripts Créés

### `scripts/check-exhibitor-account.js`
Vérifie l'existence et le fonctionnement d'un compte exhibitor :
- Recherche dans `users`
- Test de connexion auth
- Affichage des détails

### `scripts/delete-exhibitor-auth.js`
Supprime les comptes auth des exhibitors :
- Liste tous les utilisateurs auth
- Trouve par email
- Supprime via admin API

### `scripts/recreate-exhibitor-accounts.js`
Recrée complètement les 4 comptes exhibitor :
- Suppression complète des anciennes données
- Création auth avec mot de passe
- Création utilisateur type `exhibitor`
- Création profil avec category et sector obligatoires
- Création de 3 produits par exposant
- Test de connexion automatique

## Commit Git

```bash
commit 0fd6d38
Date: 25 décembre 2025

fix: recreate exhibitor demo accounts with correct auth and credentials

- Add scripts to check, delete, and recreate exhibitor accounts
- Fix type from 'visitor' to 'exhibitor'
- Add required fields: category (port-operations/port-industry), sector
- Create 3 products per exhibitor
- All login tests pass successfully
```

## Champs Obligatoires Découverts

La table `exhibitors` nécessite :
1. **user_id** (UUID, clé étrangère vers users)
2. **company_name** (TEXT)
3. **category** (ENUM : 'institutional', 'port-industry', 'port-operations', 'academic')
4. **sector** (TEXT)
5. **verified** (BOOLEAN, par défaut false)

## Test de Connexion

L'utilisateur peut maintenant se connecter sur la plateforme avec :
- **Email** : `exhibitor-9m@test.siport.com`
- **Mot de passe** : `Test@123456`
- **Type** : Exhibitor
- **Accès** : Dashboard exhibitor avec 3 produits

---

**Statut** : ✅ **RÉSOLU ET TESTÉ**

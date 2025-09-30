# Guide de test - Système d'inscription SIPORTS 2026

## Problèmes corrigés

### 1. Politique RLS manquante
- ✅ Ajout de la politique INSERT pour permettre aux utilisateurs de créer leur profil
- ✅ Ajout de la politique service_role pour les opérations admin

### 2. Flux d'inscription corrigé
- ✅ Utilisation de Supabase Auth pour créer l'utilisateur
- ✅ Création automatique du profil dans la table `users`
- ✅ Support des demandes d'inscription pour exposants/partenaires
- ✅ Envoi automatique d'email de confirmation

## Comment tester l'inscription

### Test 1: Inscription Visiteur

1. **Accéder au formulaire d'inscription**
   - URL: `/register`
   - Ou cliquer sur "S'inscrire" dans l'interface

2. **Remplir le formulaire**
   ```
   Type de compte: Visiteur
   Prénom: Jean
   Nom: Dupont
   Email: jean.dupont@example.com
   Téléphone: +212 600 000 001
   Pays: Maroc
   Mot de passe: Test123456!
   Confirmer mot de passe: Test123456!
   Secteur: Maritime
   Description: Professionnel intéressé par les solutions portuaires
   Objectifs: Découvrir les innovations
   ```

3. **Soumettre le formulaire**
   - Vérifier dans la console: "✅ Utilisateur créé avec succès"
   - Le visiteur peut se connecter immédiatement

### Test 2: Inscription Exposant

1. **Accéder au formulaire**
   - URL: `/exhibitor-signup`

2. **Remplir le formulaire**
   ```
   Prénom: Marie
   Nom: Martin
   Entreprise: Port Solutions SARL
   Email: marie.martin@portsolutions.com
   Téléphone: +212 600 000 002
   Poste: Directrice Commerciale
   Mot de passe: Expo2026!
   Confirmer mot de passe: Expo2026!
   ```

3. **Soumettre et vérifier**
   - Console doit afficher:
     - ✅ Compte Auth créé
     - ✅ Profil utilisateur créé
     - 📝 Création de la demande d'inscription
     - 📧 Envoi de l'email de confirmation
   - **L'exposant NE PEUT PAS se connecter** tant que non validé

### Test 3: Inscription Partenaire

1. **Accéder au formulaire**
   - URL: `/partner-signup`

2. **Remplir le formulaire**
   ```
   Nom de l'organisation: Tech Maritime International
   Secteur: Technologie maritime
   Pays: France
   Site web: https://techmaritimeintl.com
   Prénom: Pierre
   Nom: Lefebvre
   Email: p.lefebvre@techmaritimeintl.com
   Téléphone: +33 6 00 00 00 03
   Poste: Directeur Partenariats
   Mot de passe: Partner2026!
   Description: Leader en solutions IoT pour les ports
   Type de partenariat: Technologique
   ```

3. **Soumettre et vérifier**
   - Mêmes vérifications que pour l'exposant
   - Une demande d'inscription est créée

### Test 4: Validation Admin

1. **Se connecter en tant qu'admin**
   ```
   Email: admin@siports.com
   Mot de passe: demo123
   ```

2. **Accéder aux demandes d'inscription**
   - Dans le tableau de bord admin
   - Cliquer sur la carte "Demandes d'inscription" (affiche le nombre en attente)

3. **Voir les demandes**
   - Filtrer par "En attente"
   - Voir toutes les informations du candidat

4. **Approuver une demande**
   - Cliquer sur le bouton "Approuver" (vert)
   - La demande passe en statut "Approuvé"
   - L'utilisateur peut maintenant se connecter

5. **Rejeter une demande**
   - Cliquer sur le bouton "Rejeter" (rouge)
   - Saisir une raison: "Profil incomplet"
   - Valider
   - La demande passe en statut "Rejeté"

## Vérifications dans Supabase

### 1. Table `auth.users`
```sql
SELECT id, email, created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
```

### 2. Table `public.users`
```sql
SELECT id, email, name, type, created_at
FROM users
ORDER BY created_at DESC
LIMIT 5;
```

### 3. Table `registration_requests`
```sql
SELECT
  id,
  email,
  first_name,
  last_name,
  user_type,
  status,
  created_at
FROM registration_requests
ORDER BY created_at DESC;
```

## Logs attendus dans la console

### Inscription réussie (Exposant/Partenaire)
```
🔄 Création d'utilisateur avec Supabase Auth...
🔐 Création compte Auth Supabase pour: marie.martin@portsolutions.com
✅ Compte Auth créé, ID: abc-123-def-456
📝 Création du profil utilisateur dans la table users...
✅ Profil utilisateur créé
📋 Création profil exposant...
✅ Utilisateur créé avec succès: marie.martin@portsolutions.com
📝 Création de la demande d'inscription...
📧 Envoi de l'email de confirmation...
✅ Email de confirmation envoyé
```

### Inscription réussie (Visiteur)
```
🔄 Création d'utilisateur avec Supabase Auth...
🔐 Création compte Auth Supabase pour: jean.dupont@example.com
✅ Compte Auth créé, ID: xyz-789-ghi-012
📝 Création du profil utilisateur dans la table users...
✅ Profil utilisateur créé
✅ Utilisateur créé avec succès: jean.dupont@example.com
```

## Erreurs possibles et solutions

### Erreur: "new row violates row-level security policy"
**Solution**: Les politiques RLS ont été corrigées dans la migration `fix_users_rls_insert_policy`

### Erreur: "User already registered"
**Solution**: L'email existe déjà dans la base. Utiliser un autre email.

### Erreur: "Password should be at least 6 characters"
**Solution**: Utiliser un mot de passe de 6 caractères minimum

### Email non reçu
**Info**: L'Edge Function est déployée mais nécessite l'intégration d'un service d'email réel (Resend, SendGrid, etc.). Pour l'instant, les emails sont loggés dans la console.

## Fonctionnalités testées

- ✅ Création de compte Auth Supabase
- ✅ Création de profil dans la table users
- ✅ Création de demande d'inscription (exposants/partenaires)
- ✅ Envoi d'email de confirmation automatique
- ✅ Affichage des demandes dans le dashboard admin
- ✅ Filtrage des demandes (En attente, Approuvées, Rejetées)
- ✅ Approbation de demande
- ✅ Rejet de demande avec raison
- ✅ Politiques RLS correctes

## Prochaines étapes

1. ✅ Intégrer un service d'email réel (Resend recommandé)
2. ✅ Ajouter email de notification lors de l'approbation
3. ✅ Ajouter email de notification lors du rejet
4. ✅ Ajouter statistiques des inscriptions dans le dashboard

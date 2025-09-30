# Système d'Inscription et Validation SIPORTS 2026

## Vue d'ensemble

Le système d'inscription SIPORTS 2026 permet aux visiteurs, exposants et partenaires de créer un compte. Les inscriptions d'exposants et de partenaires nécessitent une validation administrative avant activation complète.

## Flux d'inscription

### 1. Pages d'inscription disponibles

- **Visiteurs** : `/register` - Inscription générale avec activation immédiate
- **Exposants** : `/exhibitor-signup` - Inscription avec validation admin requise
- **Partenaires** : `/partner-signup` - Inscription avec validation admin requise

### 2. Processus d'inscription

#### Étape 1 : Formulaire d'inscription
L'utilisateur remplit un formulaire avec :
- Informations personnelles (nom, prénom, email, téléphone)
- Informations professionnelles (entreprise, poste)
- Mot de passe

#### Étape 2 : Création du compte
- Le compte utilisateur est créé dans la table `users` avec statut `pending` pour exposants/partenaires
- Une demande d'inscription est créée dans la table `registration_requests`
- Un email de confirmation automatique est envoyé

#### Étape 3 : Email de confirmation
Un email est automatiquement envoyé contenant :
- Confirmation de réception de la demande
- Informations du compte
- Délai de validation (24-48h)
- Prochaines étapes

#### Étape 4 : Validation admin
- Les administrateurs voient les demandes dans leur tableau de bord
- Ils peuvent approuver ou rejeter chaque demande
- En cas de rejet, une raison doit être fournie

## Structure de la base de données

### Table `registration_requests`

```sql
CREATE TABLE registration_requests (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  user_type user_type NOT NULL,
  email text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  company_name text,
  position text,
  phone text NOT NULL,
  profile_data jsonb,
  status registration_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES users(id),
  rejection_reason text
);
```

### Statuts disponibles
- `pending` : En attente de validation
- `approved` : Approuvé par un administrateur
- `rejected` : Rejeté par un administrateur

## Composants principaux

### 1. Pages d'inscription
- `src/pages/auth/ExhibitorSignUpPage.tsx` - Inscription exposant
- `src/pages/auth/PartnerSignUpPage.tsx` - Inscription partenaire
- `src/components/auth/RegisterPage.tsx` - Inscription générale

### 2. Gestion admin
- `src/components/admin/RegistrationRequests.tsx` - Interface de gestion des demandes
- Intégré dans `src/components/dashboard/AdminDashboard.tsx`

### 3. Services
- `src/services/supabaseService.ts` contient :
  - `createRegistrationRequest()` - Créer une demande
  - `getRegistrationRequests()` - Récupérer les demandes
  - `updateRegistrationRequestStatus()` - Mettre à jour le statut
  - `sendRegistrationEmail()` - Envoyer l'email de confirmation

### 4. Edge Function
- `supabase/functions/send-registration-email` - Envoi d'emails automatiques

## Utilisation dans le tableau de bord admin

### Accès aux demandes
1. Connectez-vous en tant qu'administrateur
2. Dans le tableau de bord, cliquez sur la carte "Demandes d'inscription"
3. Les demandes s'affichent avec leur statut

### Filtres disponibles
- **En attente** : Demandes nécessitant une action
- **Toutes** : Toutes les demandes
- **Approuvées** : Demandes validées
- **Rejetées** : Demandes refusées

### Actions disponibles

#### Approuver une demande
1. Cliquez sur le bouton "Approuver" (vert)
2. La demande est automatiquement approuvée
3. L'utilisateur peut maintenant se connecter

#### Rejeter une demande
1. Cliquez sur le bouton "Rejeter" (rouge)
2. Saisissez une raison du rejet
3. Validez le rejet
4. Un email de notification peut être envoyé (à implémenter)

## Configuration des emails

### Edge Function
L'Edge Function `send-registration-email` est déjà déployée et configurée.

### Intégration avec un service d'email
Pour activer l'envoi réel d'emails, intégrez un service comme :
- **Resend** (recommandé) : https://resend.com
- **SendGrid**
- **Postmark**
- **AWS SES**

Modifiez la fonction dans `supabase/functions/send-registration-email/index.ts` pour utiliser l'API du service choisi.

### Variables d'environnement
Les variables Supabase sont automatiquement disponibles :
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Sécurité (RLS)

### Politiques de sécurité
- **Lecture** : Les utilisateurs peuvent voir leurs propres demandes
- **Lecture admin** : Les admins voient toutes les demandes
- **Mise à jour** : Seuls les admins peuvent modifier les demandes
- **Insertion** : Les utilisateurs authentifiés peuvent créer leurs demandes

### Vérification d'admin
```sql
EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid()
  AND users.type = 'admin'
)
```

## Test du système

### Test d'inscription exposant
1. Accédez à `/exhibitor-signup`
2. Remplissez le formulaire avec des données valides
3. Vérifiez que :
   - L'utilisateur est créé dans `users`
   - Une demande est créée dans `registration_requests`
   - Un log de l'email apparaît dans la console

### Test de validation admin
1. Connectez-vous avec un compte admin
2. Cliquez sur "Demandes d'inscription"
3. Vérifiez que la demande apparaît
4. Testez l'approbation et le rejet

## Prochaines améliorations

1. **Envoi d'emails réels** : Intégrer un service d'email
2. **Email de validation** : Notifier l'utilisateur lors de l'approbation/rejet
3. **Notifications temps réel** : Alertes pour les nouveaux comptes
4. **Statistiques** : Dashboard des taux d'approbation
5. **Export** : Export CSV/Excel des demandes
6. **Recherche** : Filtrage avancé des demandes
7. **Historique** : Log des actions admin

## Support

Pour toute question sur le système d'inscription :
- Consultez ce document
- Vérifiez les logs dans la console
- Contactez l'équipe technique SIPORTS

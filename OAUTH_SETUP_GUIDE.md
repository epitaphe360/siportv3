# Guide de Configuration OAuth - Google & LinkedIn

## Vue d'ensemble

L'application SIPORTS supporte maintenant l'authentification via:
- ✅ **Google OAuth** - Connexion avec compte Google
- ✅ **LinkedIn OAuth** - Connexion avec compte LinkedIn
- ✅ **Email/Mot de passe** - Authentification classique

## Architecture

### Flux d'authentification OAuth

```
Utilisateur clique "Se connecter avec Google/LinkedIn"
    ↓
Redirection vers le fournisseur OAuth (Google/LinkedIn)
    ↓
Utilisateur s'authentifie sur le site du fournisseur
    ↓
Redirection vers SIPORTS avec token d'authentification
    ↓
Supabase Auth crée/met à jour l'utilisateur
    ↓
Création automatique du profil dans la table users
    ↓
Redirection vers le dashboard
```

## Configuration Supabase

### Étape 1: Accéder aux paramètres d'authentification

1. Ouvrir le **Dashboard Supabase**: https://app.supabase.com
2. Sélectionner votre projet
3. Aller dans **Authentication** > **Providers**

### Étape 2: Configurer Google OAuth

#### A. Créer des identifiants Google

1. **Accéder à Google Cloud Console**
   - https://console.cloud.google.com/apis/credentials

2. **Créer un nouveau projet (si nécessaire)**
   - Cliquer sur "Sélectionner un projet"
   - "Nouveau projet"
   - Nom: "SIPORTS Auth"

3. **Activer l'API Google+ (People API)**
   - Aller dans "APIs & Services" > "Library"
   - Rechercher "Google+ API"
   - Cliquer "Enable"

4. **Créer des identifiants OAuth 2.0**
   - Aller dans "APIs & Services" > "Credentials"
   - Cliquer "Create Credentials" > "OAuth client ID"
   - Type d'application: "Web application"
   - Nom: "SIPORTS Web Client"

5. **Configurer les origines autorisées**
   ```
   Origines JavaScript autorisées:
   - http://localhost:5173
   - https://votre-domaine.com

   URI de redirection autorisés:
   - https://[VOTRE_PROJECT_REF].supabase.co/auth/v1/callback
   ```

6. **Récupérer les identifiants**
   - Client ID: `123456789-abc.apps.googleusercontent.com`
   - Client Secret: `GOCSPX-...`

#### B. Configurer dans Supabase

1. Dans le Dashboard Supabase:
   - **Authentication** > **Providers** > **Google**

2. Activer Google:
   - Toggle "Enable Sign in with Google" → **ON**

3. Entrer les identifiants:
   ```
   Client ID (OAuth):
   123456789-abc.apps.googleusercontent.com

   Client Secret (OAuth):
   GOCSPX-...
   ```

4. Configurer la Redirect URL (déjà pré-remplie):
   ```
   https://[VOTRE_PROJECT_REF].supabase.co/auth/v1/callback
   ```

5. Sauvegarder

### Étape 3: Configurer LinkedIn OAuth

#### A. Créer une application LinkedIn

1. **Accéder au portail développeurs LinkedIn**
   - https://www.linkedin.com/developers/apps

2. **Créer une nouvelle application**
   - Cliquer "Create app"
   - App name: "SIPORTS"
   - LinkedIn Page: Sélectionner votre page d'entreprise
   - Description: "Plateforme de gestion d'événements maritimes"
   - Logo: Télécharger le logo SIPORTS
   - Accepter les conditions

3. **Configurer les produits**
   - Onglet "Products"
   - Sélectionner "Sign In with LinkedIn using OpenID Connect"
   - Demander l'accès (approval instantané généralement)

4. **Configurer l'authentification**
   - Onglet "Auth"
   - Redirect URLs:
     ```
     https://[VOTRE_PROJECT_REF].supabase.co/auth/v1/callback
     http://localhost:5173/dashboard (pour développement)
     ```

5. **Récupérer les identifiants**
   - Onglet "Auth"
   - Client ID: `123456789abc`
   - Client Secret: `WPL_AP1.abc123...` (cliquer pour révéler)

#### B. Configurer dans Supabase

1. Dans le Dashboard Supabase:
   - **Authentication** > **Providers** > **LinkedIn (OIDC)**

2. Activer LinkedIn:
   - Toggle "Enable Sign in with LinkedIn (OIDC)" → **ON**

3. Entrer les identifiants:
   ```
   Client ID:
   123456789abc

   Client Secret:
   WPL_AP1.abc123...
   ```

4. Configurer la Redirect URL (déjà pré-remplie):
   ```
   https://[VOTRE_PROJECT_REF].supabase.co/auth/v1/callback
   ```

5. Sauvegarder

## Configuration de l'application

### Variables d'environnement

Le fichier `.env` doit contenir les URLs Supabase:

```env
VITE_SUPABASE_URL=https://[VOTRE_PROJECT_REF].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Note**: Les identifiants OAuth (Client ID, Secret) ne sont PAS dans le `.env`. Ils sont stockés dans Supabase Dashboard.

### URLs de redirection

Les URLs de redirection doivent être configurées:

**Développement local**:
```
http://localhost:5173/dashboard
```

**Production**:
```
https://votre-domaine.com/dashboard
```

## Fonctionnement du code

### Dans LoginPage.tsx

```typescript
const handleGoogleLogin = async () => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });
    if (error) throw error;
  } catch (err) {
    // Gestion d'erreur
  }
};

const handleLinkedInLogin = async () => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });
    if (error) throw error;
  } catch (err) {
    // Gestion d'erreur
  }
};
```

### Dans RegisterPage.tsx

Les mêmes fonctions sont utilisées pour l'inscription. OAuth crée automatiquement le compte s'il n'existe pas.

## Interface utilisateur

### Page de connexion

Deux boutons sont affichés sous le formulaire email/mot de passe:

```
┌─────────────────┐  ┌─────────────────┐
│  [G] Google     │  │  [in] LinkedIn  │
└─────────────────┘  └─────────────────┘
```

### Page d'inscription

Même interface, avec les boutons OAuth en bas:

```
"Ou s'inscrire avec"
┌─────────────────┐  ┌─────────────────┐
│  [G] Google     │  │  [in] LinkedIn  │
└─────────────────┘  └─────────────────┘
```

## Gestion des utilisateurs OAuth

### Création automatique du profil

Quand un utilisateur se connecte via OAuth, Supabase Auth:

1. **Crée/met à jour** l'enregistrement dans `auth.users`
2. **Extrait** les informations du profil OAuth:
   - Email
   - Nom complet
   - Photo de profil (avatar_url)
   - Metadata du provider

3. **Déclenche** un trigger qui crée l'enregistrement dans la table `users`:
   ```sql
   INSERT INTO users (id, email, full_name, role, avatar_url)
   VALUES (
     auth_user.id,
     auth_user.email,
     auth_user.raw_user_meta_data->>'full_name',
     'visitor', -- rôle par défaut
     auth_user.raw_user_meta_data->>'avatar_url'
   );
   ```

### Metadata disponibles

#### Google OAuth
```json
{
  "iss": "https://accounts.google.com",
  "email": "user@example.com",
  "email_verified": true,
  "name": "Jean Dupont",
  "picture": "https://lh3.googleusercontent.com/...",
  "given_name": "Jean",
  "family_name": "Dupont",
  "locale": "fr"
}
```

#### LinkedIn OAuth
```json
{
  "email": "user@example.com",
  "name": "Jean Dupont",
  "picture": "https://media.licdn.com/...",
  "sub": "linkedin|123456789"
}
```

## Sécurité

### Bonnes pratiques

1. **Secrets protégés**
   - Client Secrets stockés dans Supabase Dashboard (jamais dans le code)
   - Transmission sécurisée via HTTPS

2. **Validation d'email**
   - Emails OAuth déjà vérifiés par le provider
   - Pas besoin de confirmation supplémentaire

3. **PKCE (Proof Key for Code Exchange)**
   - Activé automatiquement par Supabase
   - Protection contre les attaques CSRF

4. **URLs de redirection**
   - Whitelist stricte dans les dashboards Google/LinkedIn
   - Validation côté Supabase

### Permissions demandées

**Google**:
- `email` - Adresse email
- `profile` - Nom, photo de profil
- `openid` - Identification OpenID Connect

**LinkedIn**:
- `openid` - Identification OpenID Connect
- `profile` - Nom, photo de profil
- `email` - Adresse email

## Tests

### Test Google OAuth

1. Ouvrir `/login`
2. Cliquer "Google"
3. Sélectionner un compte Google
4. Autoriser SIPORTS
5. Vérifier redirection vers `/dashboard`
6. Vérifier création du profil dans la base:
   ```sql
   SELECT * FROM users
   WHERE email = 'votre-email@gmail.com';
   ```

### Test LinkedIn OAuth

1. Ouvrir `/login`
2. Cliquer "LinkedIn"
3. Se connecter avec LinkedIn
4. Autoriser SIPORTS
5. Vérifier redirection vers `/dashboard`
6. Vérifier création du profil dans la base:
   ```sql
   SELECT * FROM users
   WHERE email = 'votre-email@example.com';
   ```

## Dépannage

### Erreur: "redirect_uri_mismatch"

**Cause**: L'URL de redirection n'est pas dans la whitelist

**Solution**:
1. Vérifier l'URL dans Google Cloud Console / LinkedIn Developer Portal
2. S'assurer que l'URL correspond exactement:
   ```
   https://[VOTRE_PROJECT_REF].supabase.co/auth/v1/callback
   ```

### Erreur: "access_denied"

**Cause**: L'utilisateur a refusé l'autorisation

**Solution**: Normal, l'utilisateur doit accepter les permissions

### Erreur: "invalid_client"

**Cause**: Client ID ou Secret incorrect

**Solution**:
1. Vérifier les identifiants dans Supabase Dashboard
2. Vérifier qu'ils correspondent à ceux dans Google/LinkedIn

### Erreur: "User not found after OAuth"

**Cause**: Le trigger de création de profil n'a pas fonctionné

**Solution**:
```sql
-- Vérifier le trigger
SELECT * FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- Créer manuellement si nécessaire
INSERT INTO users (id, email, role)
SELECT id, email, 'visitor'
FROM auth.users
WHERE email = 'email-problematique@example.com';
```

## Avantages OAuth

### Pour les utilisateurs

1. **Rapidité** - Connexion en 1 clic
2. **Sécurité** - Pas besoin de créer un nouveau mot de passe
3. **Confiance** - Utilisation de comptes existants (Google, LinkedIn)
4. **Auto-complétion** - Nom et photo de profil automatiques

### Pour l'application

1. **Conversion** - Taux d'inscription plus élevé
2. **Données vérifiées** - Emails déjà vérifiés
3. **Réduction du spam** - Comptes difficiles à créer en masse
4. **Professionnalisme** - Intégration avec LinkedIn

## Monitoring

### Voir les connexions OAuth

```sql
-- Utilisateurs connectés via Google
SELECT
  id,
  email,
  raw_app_meta_data->>'provider' as provider,
  created_at
FROM auth.users
WHERE raw_app_meta_data->>'provider' = 'google'
ORDER BY created_at DESC;

-- Utilisateurs connectés via LinkedIn
SELECT
  id,
  email,
  raw_app_meta_data->>'provider' as provider,
  created_at
FROM auth.users
WHERE raw_app_meta_data->>'provider' = 'linkedin'
ORDER BY created_at DESC;

-- Statistiques
SELECT
  raw_app_meta_data->>'provider' as provider,
  COUNT(*) as count
FROM auth.users
GROUP BY provider;
```

## Ressources

### Documentation officielle

- **Supabase Auth**: https://supabase.com/docs/guides/auth
- **Google OAuth**: https://developers.google.com/identity/protocols/oauth2
- **LinkedIn OAuth**: https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication

### Dashboards

- **Google Cloud Console**: https://console.cloud.google.com
- **LinkedIn Developers**: https://www.linkedin.com/developers/apps
- **Supabase Dashboard**: https://app.supabase.com

## Résumé

| Fonctionnalité | État |
|----------------|------|
| Google OAuth | ✅ Implémenté |
| LinkedIn OAuth | ✅ Implémenté |
| Email/Password | ✅ Existant |
| Auto-création profil | ✅ Automatique |
| Gestion metadata | ✅ Supabase Auth |
| Interface UI | ✅ Boutons sur Login/Register |
| Sécurité | ✅ PKCE, HTTPS |
| Tests | ⚠️ À tester après configuration |

## Prochaines étapes

1. **Configurer Google OAuth** dans Google Cloud Console
2. **Configurer LinkedIn OAuth** dans LinkedIn Developers
3. **Entrer les identifiants** dans Supabase Dashboard
4. **Tester** les connexions en local
5. **Déployer** en production
6. **Mettre à jour** les URLs de redirection pour la production

L'authentification OAuth est maintenant prête à être configurée et utilisée! 🚀

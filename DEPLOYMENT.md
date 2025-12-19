# Guide de déploiement - Système d'inscription visiteur SIPORTS 2026

## 📋 Vue d'ensemble

Ce guide décrit les étapes nécessaires pour déployer le système complet d'inscription visiteur avec double flux (Free/VIP), incluant :
- Frontend React (pages d'inscription)
- Backend Supabase (edge functions, storage, database)
- Service d'envoi d'emails (Resend)

---

## 🗄️ 1. Migration de la base de données

### Migrations à exécuter

Les migrations suivantes doivent être appliquées dans l'ordre :

```bash
# 1. Bucket Storage pour photos VIP
supabase/migrations/20251219_create_storage_buckets.sql

# 2. Table digital_badges pour QR codes
supabase/migrations/20251219_create_digital_badges_table.sql
```

### Commandes Supabase

```bash
# Se connecter à Supabase
supabase login

# Lier le projet
supabase link --project-ref YOUR_PROJECT_REF

# Appliquer les migrations
supabase db push

# Vérifier l'état
supabase db diff
```

### Tables créées

- ✅ **storage.buckets** : Bucket `public` pour photos visiteurs
- ✅ **storage.objects** : Politiques RLS pour `visitor-photos/`
- ✅ **public.digital_badges** : Stockage badges QR avec JWT
  - Indexes : user_id, badge_type, is_active, token_expires
  - Triggers : auto-update updated_at
  - RLS : Utilisateurs voient leur badge, admins voient tout
  - Vue : active_badges_summary (monitoring)
  - Fonction : cleanup_expired_badges() (maintenance)

---

## 🚀 2. Déploiement des Edge Functions

### Fonctions à déployer

1. **generate-visitor-badge** - Génération badges QR sécurisés
2. **send-visitor-welcome-email** - Envoi emails personnalisés

### Commandes de déploiement

```bash
# Déployer les deux fonctions
supabase functions deploy generate-visitor-badge
supabase functions deploy send-visitor-welcome-email

# Vérifier le déploiement
supabase functions list
```

### Test des fonctions

```bash
# Tester generate-visitor-badge
supabase functions invoke generate-visitor-badge \
  --data '{
    "userId":"123e4567-e89b-12d3-a456-426614174000",
    "email":"test@test.com",
    "name":"Test User",
    "level":"free"
  }'

# Tester send-visitor-welcome-email
supabase functions invoke send-visitor-welcome-email \
  --data '{
    "email":"test@test.com",
    "name":"Test User",
    "level":"free",
    "userId":"123e4567-e89b-12d3-a456-426614174000"
  }'
```

---

## 🔐 3. Configuration des variables d'environnement

### Supabase Edge Functions Secrets

Dans **Supabase Dashboard > Edge Functions > Secrets**, configurer :

```bash
# OBLIGATOIRE - Service d'envoi d'emails
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx

# RECOMMANDÉ - URL du site pour liens dans emails
PUBLIC_SITE_URL=https://siports2026.com

# OPTIONNEL - Secret JWT (défaut fourni si non configuré)
JWT_SECRET=siports-2026-secure-secret-key-change-in-production-xxx
```

### Via CLI

```bash
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx
supabase secrets set PUBLIC_SITE_URL=https://siports2026.com
supabase secrets set JWT_SECRET=your-super-secret-key-here
```

### Vérifier les secrets

```bash
supabase secrets list
```

---

## 📧 4. Configuration Resend (Service Email)

### Étapes de configuration

1. **Créer un compte** sur [resend.com](https://resend.com)

2. **Vérifier le domaine**
   - Aller dans **Domains**
   - Ajouter `siports2026.com`
   - Configurer les enregistrements DNS (SPF, DKIM, DMARC)
   - Attendre la vérification (1-24h)

3. **Générer une API Key**
   - Aller dans **API Keys**
   - Créer une nouvelle clé
   - Copier la clé (format: `re_xxxxxxxxxxxxx`)

4. **Configurer l'expéditeur**
   - Email expéditeur : `noreply@siports2026.com`
   - Nom : `SIPORTS 2026`

5. **Tester l'envoi**
   ```bash
   curl -X POST 'https://api.resend.com/emails' \
     -H 'Authorization: Bearer re_xxxxx' \
     -H 'Content-Type: application/json' \
     -d '{
       "from": "SIPORTS 2026 <noreply@siports2026.com>",
       "to": "test@example.com",
       "subject": "Test Email",
       "html": "<p>Test email from SIPORTS 2026</p>"
     }'
   ```

### Configuration DNS requise

| Type | Name | Value |
|------|------|-------|
| TXT | @ | v=spf1 include:resend.com ~all |
| TXT | resend._domainkey | (fourni par Resend) |
| TXT | _dmarc | v=DMARC1; p=none |

---

## 🌐 5. Déploiement Frontend

### Build de production

```bash
# Installer les dépendances
npm install

# Build pour production
npm run build

# Tester le build localement
npm run preview
```

### Variables d'environnement frontend

Créer `.env.production` :

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_PUBLIC_SITE_URL=https://siports2026.com
```

### Déploiement (Vercel/Netlify)

#### Vercel
```bash
vercel --prod
```

#### Netlify
```bash
netlify deploy --prod
```

---

## ✅ 6. Vérification post-déploiement

### Checklist complète

- [ ] **Base de données**
  - [ ] Migration storage bucket appliquée
  - [ ] Migration digital_badges appliquée
  - [ ] Table `payment_requests` existe
  - [ ] RLS activé sur toutes les tables

- [ ] **Edge Functions**
  - [ ] generate-visitor-badge déployée
  - [ ] send-visitor-welcome-email déployée
  - [ ] Secrets configurés (RESEND_API_KEY, PUBLIC_SITE_URL)

- [ ] **Resend**
  - [ ] Domaine vérifié
  - [ ] DNS configuré (SPF, DKIM, DMARC)
  - [ ] API key générée et testée

- [ ] **Frontend**
  - [ ] Build réussi sans erreurs
  - [ ] Variables d'environnement configurées
  - [ ] Déployé sur production

- [ ] **Tests fonctionnels**
  - [ ] Inscription visiteur gratuit fonctionne
  - [ ] Email Free reçu avec badge
  - [ ] Inscription visiteur VIP fonctionne
  - [ ] Upload photo VIP fonctionne
  - [ ] Email VIP reçu avec instructions paiement
  - [ ] Blocage login VIP non-payé fonctionne
  - [ ] Badge QR généré correctement

---

## 🧪 7. Tests de bout en bout

### Test workflow visiteur GRATUIT

1. Aller sur `/visitor/register/free`
2. Remplir le formulaire (sans mot de passe ni photo)
3. Cliquer sur "Obtenir mon badge gratuit"
4. Vérifier :
   - ✅ Redirection vers home
   - ✅ Email reçu dans la boîte
   - ✅ Email contient badge QR
   - ✅ Tentative de connexion échoue (pas de mot de passe)
   - ✅ Entry dans `users` avec `visitor_level='free'`
   - ✅ Entry dans `digital_badges` avec `badge_type='visitor_free'`

### Test workflow visiteur VIP

1. Aller sur `/visitor/register/vip`
2. Remplir le formulaire + **upload photo**
3. Créer un mot de passe
4. Cliquer sur "Créer mon compte VIP et payer"
5. Vérifier :
   - ✅ Redirection vers `/visitor/subscription`
   - ✅ Email reçu avec instructions paiement
   - ✅ Photo uploadée dans Storage `visitor-photos/`
   - ✅ Entry dans `users` avec `visitor_level='vip'` + `status='pending_payment'`
   - ✅ Entry dans `payment_requests` avec `amount=299.99`
6. Tenter de se connecter
7. Vérifier :
   - ✅ Login bloqué
   - ✅ Message "Paiement requis"
   - ✅ Redirection vers page paiement

### Test workflow paiement VIP

1. Simuler paiement réussi (Stripe test mode)
2. Vérifier :
   - ✅ Status user passe à `active`
   - ✅ Badge généré dans `digital_badges` avec photo
   - ✅ Email confirmation reçu avec badge VIP
   - ✅ Login autorisé
   - ✅ Redirection vers `/visitor/dashboard`

---

## 🐛 8. Dépannage

### Erreur : "Failed to upload photo"

**Cause** : Bucket storage non créé ou politiques RLS incorrectes

**Solution** :
```sql
-- Vérifier le bucket
SELECT * FROM storage.buckets WHERE name = 'public';

-- Recréer les politiques si nécessaire
DROP POLICY IF EXISTS "Users can upload visitor photos" ON storage.objects;
CREATE POLICY "Users can upload visitor photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'public'
  AND (storage.foldername(name))[1] = 'visitor-photos'
  AND auth.role() = 'authenticated'
);
```

### Erreur : "Badge generation failed"

**Cause** : Edge function non déployée ou table digital_badges manquante

**Solution** :
```bash
# Redéployer la fonction
supabase functions deploy generate-visitor-badge

# Vérifier la table
supabase db diff
```

### Erreur : "Email not sent"

**Cause** : RESEND_API_KEY non configurée ou domaine non vérifié

**Solution** :
```bash
# Vérifier les secrets
supabase secrets list

# Re-configurer si besoin
supabase secrets set RESEND_API_KEY=re_xxxxx

# Vérifier domaine Resend
# → Dashboard Resend > Domains > vérifier statut
```

### Login VIP bloqué après paiement

**Cause** : Status non mis à jour dans la base

**Solution** :
```sql
-- Vérifier le status
SELECT id, email, visitor_level, status FROM users WHERE email = 'user@example.com';

-- Corriger si nécessaire
UPDATE users SET status = 'active' WHERE email = 'user@example.com';
```

---

## 📊 9. Monitoring

### Métriques à surveiller

```sql
-- Badges créés par type
SELECT * FROM active_badges_summary;

-- Inscriptions visiteurs récentes
SELECT
  email,
  visitor_level,
  status,
  created_at
FROM users
WHERE type = 'visitor'
ORDER BY created_at DESC
LIMIT 20;

-- Paiements en attente
SELECT
  u.email,
  pr.amount,
  pr.status,
  pr.created_at
FROM payment_requests pr
JOIN users u ON u.id = pr.user_id
WHERE pr.status = 'pending'
ORDER BY pr.created_at DESC;

-- Photos VIP uploadées
SELECT
  name,
  created_at,
  metadata->>'size' as size
FROM storage.objects
WHERE bucket_id = 'public'
AND (foldername(name))[1] = 'visitor-photos'
ORDER BY created_at DESC
LIMIT 20;
```

### Logs Edge Functions

```bash
# Voir les logs en temps réel
supabase functions logs generate-visitor-badge --tail
supabase functions logs send-visitor-welcome-email --tail
```

---

## 🔒 10. Sécurité

### Checklist sécurité

- [ ] RLS activé sur toutes les tables
- [ ] JWT_SECRET changé du défaut en production
- [ ] HTTPS obligatoire (certificat SSL valide)
- [ ] CORS configuré correctement
- [ ] API keys Supabase protégées (pas dans le code)
- [ ] Photos VIP accessibles uniquement en lecture publique
- [ ] Validation des inputs côté serveur (edge functions)
- [ ] Rate limiting activé (Supabase dashboard)
- [ ] Monitoring des erreurs activé (Sentry/LogRocket)

---

## 📞 Support

Pour toute question concernant le déploiement :
- **Email technique** : dev@siports2026.com
- **Documentation Supabase** : https://supabase.com/docs
- **Documentation Resend** : https://resend.com/docs
- **Repository** : https://github.com/epitaphe360/siportv3

---

**Version** : 1.0.0
**Date** : 19 Décembre 2024
**Auteur** : SIPORTS 2026 Development Team

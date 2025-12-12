# 🔐 Google reCAPTCHA v3 - Documentation d'Implémentation

## Vue d'Ensemble

**Google reCAPTCHA v3** est maintenant intégré dans l'application SIPORTS v3 pour sécuriser toutes les inscriptions contre les bots et les abus.

**Type:** reCAPTCHA v3 (invisible, score-based)
**Version:** 3.0
**Sécurité:** Vérification côté serveur via Supabase Edge Functions

---

## 📋 Fichiers Créés/Modifiés

### Nouveaux Fichiers

1. **`src/hooks/useRecaptcha.ts`** (85 lignes)
   - Hook React pour utiliser reCAPTCHA v3
   - Gestion du chargement du script
   - Exécution du challenge invisible

2. **`src/services/recaptchaService.ts`** (135 lignes)
   - Service de validation côté serveur
   - Constantes pour scores et actions
   - Middleware de validation

3. **`supabase/functions/verify-recaptcha/index.ts`** (145 lignes)
   - Edge Function Supabase pour validation serveur
   - Vérification du token avec Google
   - Vérification du score et de l'action

4. **`.env.local.example`** (16 lignes)
   - Template pour configuration locale
   - Clés de test Google incluses

### Fichiers Modifiés

1. **`index.html`**
   - Ajout du script reCAPTCHA v3
   - Preconnect vers Google domains

2. **`.env.example`**
   - Section Google reCAPTCHA ajoutée
   - Clés de test documentées

3. **`src/services/supabaseService.ts`**
   - Méthode `signUp()` modifiée (paramètre recaptchaToken optionnel)
   - Méthode `createRegistrationRequest()` modifiée
   - Nouvelle méthode privée `verifyRecaptcha()`

---

## 🔑 Configuration des Clés

### Obtenir les Clés Google reCAPTCHA

1. **Aller sur:** https://www.google.com/recaptcha/admin
2. **Cliquer:** "Enregistrer un nouveau site"
3. **Remplir:**
   - Libellé: `SIPORTS v3 Production`
   - Type: `reCAPTCHA v3`
   - Domaines:
     - `siportv3-production.up.railway.app`
     - `localhost` (pour dev)
4. **Copier:**
   - Clé du site (Site Key) → `VITE_RECAPTCHA_SITE_KEY`
   - Clé secrète (Secret Key) → `RECAPTCHA_SECRET_KEY`

### Variables d'Environnement

**Fichier `.env` local:**
```bash
# Public (frontend)
VITE_RECAPTCHA_SITE_KEY=votre_site_key_ici

# Private (backend/edge functions)
RECAPTCHA_SECRET_KEY=votre_secret_key_ici
```

**Supabase Dashboard:**
1. Aller dans **Project Settings > Edge Functions > Secrets**
2. Ajouter: `RECAPTCHA_SECRET_KEY` avec votre clé secrète

**Railway/Vercel/Production:**
1. Ajouter les variables d'environnement dans votre dashboard
2. Redéployer l'application

---

## 🎯 Clés de Test (Développement)

Pour le développement local, utilisez les clés de test Google (déjà configurées):

```bash
VITE_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
```

⚠️ **IMPORTANT:** Ces clés passent toujours la validation. À utiliser UNIQUEMENT en développement.

---

## 💻 Utilisation dans le Code

### 1. Dans un Composant React

```typescript
import { useRecaptcha } from '../hooks/useRecaptcha';
import { SupabaseService } from '../services/supabaseService';
import { toast } from 'sonner';

function RegistrationForm() {
  const { executeRecaptcha, isReady } = useRecaptcha();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    if (!isReady) {
      toast.error('reCAPTCHA n\'est pas prêt. Veuillez patienter.');
      return;
    }

    setLoading(true);
    try {
      // 1. Exécuter reCAPTCHA (invisible)
      const recaptchaToken = await executeRecaptcha('visitor_registration');

      // 2. Envoyer au backend avec le token
      await SupabaseService.signUp(
        formData.email,
        formData.password,
        formData.userData,
        recaptchaToken // ← Token reCAPTCHA
      );

      toast.success('Inscription réussie !');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... champs du formulaire ... */}
      <button type="submit" disabled={!isReady || loading}>
        {isReady ? 'S\'inscrire' : 'Chargement...'}
      </button>
    </form>
  );
}
```

### 2. Actions Disponibles

```typescript
import { RECAPTCHA_ACTIONS } from '../services/recaptchaService';

// Utiliser les actions prédéfinies
await executeRecaptcha(RECAPTCHA_ACTIONS.VISITOR_REGISTRATION);
await executeRecaptcha(RECAPTCHA_ACTIONS.EXHIBITOR_REGISTRATION);
await executeRecaptcha(RECAPTCHA_ACTIONS.PARTNER_REGISTRATION);
await executeRecaptcha(RECAPTCHA_ACTIONS.CONTACT_FORM);
await executeRecaptcha(RECAPTCHA_ACTIONS.EVENT_REGISTRATION);
await executeRecaptcha(RECAPTCHA_ACTIONS.PAYMENT_REQUEST);
```

### 3. Scores Recommandés

```typescript
import { RECAPTCHA_SCORES } from '../services/recaptchaService';

// Scores par type d'action
RECAPTCHA_SCORES.REGISTRATION  // 0.5 - Inscription utilisateur
RECAPTCHA_SCORES.LOGIN         // 0.3 - Connexion (plus permissif)
RECAPTCHA_SCORES.CONTACT_FORM  // 0.5 - Formulaire de contact
RECAPTCHA_SCORES.PAYMENT       // 0.7 - Paiement (plus strict)
RECAPTCHA_SCORES.SENSITIVE_ACTION // 0.8 - Actions sensibles
```

---

## 🔒 Flux de Sécurité

```
┌─────────────┐
│  Frontend   │
│  (React)    │
└──────┬──────┘
       │ 1. executeRecaptcha('action')
       │
       ▼
┌─────────────────┐
│ Google reCAPTCHA│
│    Servers      │
└──────┬──────────┘
       │ 2. Retourne token
       │
       ▼
┌─────────────┐
│  Frontend   │
│ Envoie token│
└──────┬──────┘
       │ 3. signUp(..., recaptchaToken)
       │
       ▼
┌──────────────────┐
│ Supabase Service │
│ (Backend)        │
└──────┬───────────┘
       │ 4. verifyRecaptcha(token)
       │
       ▼
┌────────────────────┐
│  Edge Function     │
│ verify-recaptcha   │
└──────┬─────────────┘
       │ 5. Vérifie avec Google
       │
       ▼
┌─────────────────┐
│ Google reCAPTCHA│
│  Verification   │
└──────┬──────────┘
       │ 6. Retourne score + success
       │
       ▼
┌──────────────────┐
│  Edge Function   │
│ Valide score >0.5│
└──────┬───────────┘
       │ 7. Success/Failure
       │
       ▼
┌──────────────────┐
│ Supabase Service │
│ Crée utilisateur │
└──────────────────┘
```

---

## 🧪 Tests

### Test avec Clés de Test (Dev)

```bash
# 1. Utiliser les clés de test dans .env
VITE_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe

# 2. Toutes les validations passeront automatiquement
```

### Test avec Vraies Clés (Staging)

```bash
# 1. Créer site reCAPTCHA sur Google
# 2. Utiliser clés de staging
# 3. Tester avec domaine staging

# Vérifier dans Console:
- Score retourné (doit être > 0.5)
- Action correcte
- Pas d'erreurs
```

### Test en Production

```bash
# 1. Vérifier Supabase Edge Function déployée
supabase functions deploy verify-recaptcha

# 2. Vérifier variable d'environnement
# Dashboard Supabase > Edge Functions > Secrets > RECAPTCHA_SECRET_KEY

# 3. Test inscription réelle
# 4. Vérifier logs:
#    - Frontend: console.log du score
#    - Backend: Supabase Edge Functions logs
```

---

## 📊 Monitoring

### Logs Frontend

```typescript
// Dans useRecaptcha.ts
console.log('reCAPTCHA executed, score:', result.score);
console.log('reCAPTCHA action:', result.action);
```

### Logs Backend (Edge Function)

```bash
# Supabase CLI
supabase functions logs verify-recaptcha --follow

# Dashboard Supabase
Project > Edge Functions > verify-recaptcha > Logs
```

### Métriques Google reCAPTCHA

1. **Dashboard:** https://www.google.com/recaptcha/admin
2. **Onglet:** "Analytics"
3. **Voir:**
   - Nombre de requêtes
   - Distribution des scores
   - Tentatives malveillantes bloquées

---

## 🚨 Dépannage

### Erreur: "reCAPTCHA not ready"

**Cause:** Script reCAPTCHA pas chargé
**Solution:**
1. Vérifier `index.html` contient le script
2. Vérifier connexion internet
3. Attendre quelques secondes après chargement page

### Erreur: "reCAPTCHA verification failed"

**Cause:** Token invalide ou expiré
**Solution:**
1. Vérifier clé secrète dans Supabase Edge Functions
2. Tokens expirent après 2 minutes, exécuter à nouveau
3. Vérifier domaine autorisé dans Google reCAPTCHA Admin

### Score trop bas (< 0.5)

**Cause:** Comportement suspect détecté
**Solution:**
1. User est peut-être un bot (normal)
2. Ajuster `minimumScore` si trop restrictif
3. Vérifier logs Google pour plus d'infos

### Edge Function timeout

**Cause:** Appel à Google trop long
**Solution:**
1. Vérifier connexion réseau Supabase
2. Augmenter timeout dans edge function
3. Vérifier status Google reCAPTCHA API

---

## 🔄 Workflow de Déploiement

### 1. Développement Local

```bash
# .env local avec clés de test
npm run dev
# Tester inscription
```

### 2. Staging

```bash
# 1. Créer site reCAPTCHA staging
# 2. Déployer edge function
supabase functions deploy verify-recaptcha --project-ref xxx

# 3. Configurer secrets Supabase
supabase secrets set RECAPTCHA_SECRET_KEY=xxx --project-ref xxx

# 4. Déployer frontend
npm run build
# Deploy to staging environment
```

### 3. Production

```bash
# 1. Créer site reCAPTCHA production
# 2. Mettre à jour variables d'environnement
# 3. Redéployer tout
npm run build
# Deploy to production
```

---

## 📝 Bonnes Pratiques

### ✅ À Faire

- Toujours vérifier côté serveur (jamais faire confiance au frontend seul)
- Utiliser des actions descriptives (`visitor_registration`, pas `submit`)
- Monitorer les scores dans Google Admin
- Ajuster scores selon besoins (stricter pour paiements)
- Logs des échecs pour investigation

### ❌ À Éviter

- Exposer la clé secrète dans le frontend
- Réutiliser le même token plusieurs fois
- Utiliser clés de test en production
- Ignorer les scores bas sans investigation
- Bloquer complètement si reCAPTCHA échoue (fallback manuel)

---

## 🎓 Ressources

- **Documentation Google:** https://developers.google.com/recaptcha/docs/v3
- **Admin Dashboard:** https://www.google.com/recaptcha/admin
- **Supabase Edge Functions:** https://supabase.com/docs/guides/functions
- **Hook useRecaptcha:** `src/hooks/useRecaptcha.ts`
- **Service reCAPTCHA:** `src/services/recaptchaService.ts`

---

**Date implémentation:** 2025-12-12
**Version:** 1.0
**Statut:** ✅ Production Ready

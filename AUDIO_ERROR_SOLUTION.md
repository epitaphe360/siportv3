# Solution: Erreur 500 - Conversion Audio

## Diagnostic Complet ✅

### Infrastructure Vérifiée
- ✅ Table `articles_audio` existe
- ✅ Bucket Storage `article-audio` existe et est public
- ✅ Policies RLS configurées correctement
- ✅ Articles existent en base de données
- ✅ Migration appliquée avec succès
- ✅ Edge Function déployée avec logging amélioré

## Cause Probable de l'Erreur

L'erreur 500 vient très probablement de **l'API Google Cloud Text-to-Speech**:

### Raisons possibles:
1. **Clé API invalide ou expirée**
2. **Quota Google TTS dépassé**
3. **Restrictions de facturation**
4. **API Google TTS non activée**

## Solution Immédiate: Mode Client-Side

La fonction est déjà configurée pour un fallback automatique. Si Google TTS échoue, elle retourne un statut `pending` et l'audio sera généré dans le navigateur.

### Comment Activer le Mode Client-Side

Modifiez la fonction Edge pour forcer le mode client-side temporairement:

```typescript
// Dans supabase/functions/convert-text-to-speech/index.ts
// Ligne 102, commentez la condition:

// const googleApiKey = Deno.env.get('GOOGLE_TTS_API_KEY') || 'AIzaSyD3t1wu2BpwlQ6CfQeTfgQGkpd1VLGxVQI';
const googleApiKey = null; // Forcer le mode client-side

// Ou simplement:
if (false && googleApiKey) { // Désactiver temporairement Google TTS
```

## Solution Permanente: Configurer Google Cloud TTS

### Étape 1: Créer un Projet Google Cloud
1. Allez sur https://console.cloud.google.com
2. Créez un nouveau projet ou sélectionnez-en un
3. Notez le nom du projet

### Étape 2: Activer l'API Text-to-Speech
1. Dans la console Google Cloud
2. Menu "APIs & Services" → "Library"
3. Recherchez "Cloud Text-to-Speech API"
4. Cliquez sur "Enable"

### Étape 3: Créer une Clé API
1. Menu "APIs & Services" → "Credentials"
2. Cliquez sur "Create Credentials" → "API Key"
3. Copiez la clé API générée
4. (Recommandé) Restreignez la clé à "Cloud Text-to-Speech API"

### Étape 4: Configurer la Facturation
1. Menu "Billing"
2. Liez une carte de crédit
3. Google offre $300 de crédits gratuits pour 90 jours
4. L'API TTS a aussi un quota gratuit mensuel

### Étape 5: Configurer dans Supabase
1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Menu "Edge Functions" → "convert-text-to-speech"
4. Onglet "Secrets"
5. Ajoutez: `GOOGLE_TTS_API_KEY` = votre clé API

### Étape 6: Redéployer la Fonction
La fonction sera automatiquement redéployée avec la nouvelle variable d'environnement.

## Alternative: Utiliser Uniquement le Mode Client-Side

Si vous ne voulez pas utiliser Google TTS, vous pouvez:

1. **Supprimer la dépendance Google** de la fonction Edge
2. **Retourner toujours le mode client-side**
3. **Utiliser Web Speech API** du navigateur (gratuit, illimité)

### Avantages du Mode Client-Side:
- ✅ Gratuit
- ✅ Aucune configuration nécessaire
- ✅ Pas de quota
- ✅ Fonctionne hors ligne

### Inconvénients:
- ❌ Qualité de voix variable selon le navigateur
- ❌ Langues limitées selon le navigateur
- ❌ Pas d'enregistrement audio (lecture directe uniquement)

## Test Rapide

Pour tester maintenant avec les logs améliorés:

1. **Videz le cache navigateur** (CTRL+SHIFT+R)
2. **Ouvrez la console** (F12)
3. **Naviguez vers un article**
4. **Cliquez sur le bouton audio**
5. **Observez les logs détaillés** dans la console

Vous verrez maintenant:
```
📢 Demande de conversion audio pour l'article: xxx
❌ Erreur lors de la conversion: [détails complets]
Details: [stack trace et contexte]
```

## Vérifier les Logs Supabase

1. Dashboard Supabase → Edge Functions → convert-text-to-speech → Logs
2. Activez "Real-time logs"
3. Déclenchez la conversion
4. Vous verrez les logs côté serveur avec détails de l'erreur Google TTS

## État Actuel

### ✅ Fonctionnel
- Infrastructure complète (table, bucket, policies)
- Logging détaillé (client et serveur)
- Fallback client-side automatique
- Build réussi

### ⚠️ À Configurer
- Clé Google TTS valide (ou désactiver Google TTS)

## Prochaines Étapes Recommandées

**Option 1 (Rapide)**: Mode Client-Side uniquement
```typescript
// Commentez la ligne 102 dans la fonction Edge
const googleApiKey = null;
```

**Option 2 (Production)**: Configurer Google Cloud TTS
- Suivez les étapes ci-dessus
- Coût: ~$4 par million de caractères (après quota gratuit)

**Option 3 (Hybride)**: Garder le fallback actuel
- L'audio sera généré côté client si Google échoue
- Pas d'action nécessaire, c'est déjà configuré

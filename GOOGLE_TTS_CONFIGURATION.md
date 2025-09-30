# Configuration Google Cloud Text-to-Speech

## Informations de configuration

Votre projet Google Cloud Text-to-Speech est maintenant configuré et prêt à l'emploi!

### Détails du projet
- **Clé API**: `AIzaSyD3t1wu2BpwlQ6CfQeTfgQGkpd1VLGxVQI`
- **Nom**: articleaudio
- **Projet**: projects/283504739767
- **Numéro**: 283504739767

### Configuration dans l'Edge Function

La clé API est déjà intégrée dans l'Edge Function `convert-text-to-speech`. Elle est utilisée automatiquement pour toutes les conversions.

## Voix disponibles

### Français (fr-FR)
- **Voix**: `fr-FR-Wavenet-C` (Féminine)
- Haute qualité, naturelle
- Accent français standard

### Anglais (en-US)
- **Voix**: `en-US-Wavenet-F` (Féminine)
- Haute qualité, naturelle
- Accent américain

### Arabe (ar-XA)
- **Voix**: `ar-XA-Wavenet-A` (Féminine)
- Haute qualité, naturelle
- Arabe standard moderne

## Caractéristiques techniques

### Qualité audio
- **Format**: MP3
- **Encodage**: Optimisé pour la voix
- **Bitrate**: Standard (adapté automatiquement)
- **Taux de parole**: 1.0 (vitesse normale)
- **Pitch**: 0.0 (neutre)
- **Volume**: 0.0 dB (standard)

### Limites
- **Texte maximum**: 5000 caractères par requête
- **Stockage**: Supabase Storage (bucket `article-audio`)
- **Limite fichier**: 10MB par audio

## Tarification Google Cloud TTS

### Modèles Wavenet (ce que vous utilisez)
- **Prix**: $16 par million de caractères
- **Qualité**: Haute - Voix très naturelles

### Exemples de coûts
| Article | Caractères | Coût approximatif |
|---------|-----------|-------------------|
| Court (500 mots) | ~2,500 | $0.04 |
| Moyen (1000 mots) | ~5,000 | $0.08 |
| Long (2000 mots) | ~10,000 | $0.16 |

### Quota gratuit mensuel
Google Cloud offre un quota gratuit:
- **Wavenet**: 1 million de caractères/mois GRATUITS
- Soit environ **200 articles de 1000 mots** gratuits par mois

## Activation de l'API

### Étapes pour activer Google Cloud TTS

1. **Accéder à la Console Google Cloud**
   - https://console.cloud.google.com/
   - Sélectionner votre projet (283504739767)

2. **Activer l'API Text-to-Speech**
   - Aller dans "APIs & Services" > "Library"
   - Rechercher "Cloud Text-to-Speech API"
   - Cliquer sur "Enable" (Activer)

3. **Vérifier les quotas**
   - Aller dans "APIs & Services" > "Quotas"
   - Vérifier le quota pour Text-to-Speech

4. **Configurer la facturation** (optionnel)
   - Pour dépasser le quota gratuit
   - "Billing" > "Link a billing account"

## Utilisation

### Conversion automatique
Lorsqu'un utilisateur clique sur "Générer & Lire":

1. **Vérification**: L'Edge Function vérifie si l'audio existe déjà
2. **Conversion**: Si non, envoi du texte à Google Cloud TTS
3. **Réception**: Audio en base64 reçu de Google
4. **Upload**: Conversion en MP3 et upload vers Supabase Storage
5. **Stockage**: URL publique sauvegardée dans la base de données
6. **Lecture**: Audio disponible immédiatement

### Exemple de workflow

```typescript
// L'utilisateur clique sur "Play"
// → ArticleAudioPlayer appelle ArticleAudioService
// → Edge Function convert-text-to-speech est appelée
// → Google Cloud TTS génère l'audio
// → Upload vers Supabase Storage
// → Lecture automatique dans le navigateur
```

## Monitoring et logs

### Voir les logs de l'Edge Function

1. **Dashboard Supabase**
   - Aller dans "Edge Functions"
   - Sélectionner `convert-text-to-speech`
   - Voir les logs en temps réel

2. **Logs typiques d'une conversion réussie**:
   ```
   🎵 Conversion texte en audio pour l'article abc-123
   🔄 Statut mis à jour: processing
   🌟 Utilisation de Google Cloud Text-to-Speech...
   📡 Envoi de la requête à Google Cloud TTS...
   Langue: fr-FR Voix: fr-FR-Wavenet-C
   ✅ Audio reçu de Google Cloud TTS
   💾 Taille audio: 123456 bytes
   📤 Upload vers Storage: abc-123_fr_1234567890.mp3
   ✅ Upload réussi
   🔗 URL publique: https://...
   ✅ Audio créé avec succès via Google Cloud TTS
   ```

### Voir l'utilisation de l'API Google Cloud

1. **Console Google Cloud**
   - https://console.cloud.google.com/apis/dashboard
   - Sélectionner "Cloud Text-to-Speech API"
   - Voir les statistiques d'utilisation

2. **Métriques disponibles**:
   - Nombre de requêtes
   - Caractères traités
   - Erreurs
   - Latence

## Vérifier la configuration

### Test SQL

```sql
-- Voir les audios générés
SELECT
  article_id,
  language,
  voice_type,
  status,
  file_size,
  duration,
  created_at
FROM articles_audio
ORDER BY created_at DESC
LIMIT 10;

-- Statistiques par langue
SELECT
  language,
  voice_type,
  COUNT(*) as count,
  AVG(duration) as avg_duration_sec,
  SUM(file_size) as total_size_bytes
FROM articles_audio
WHERE status = 'ready'
GROUP BY language, voice_type;
```

### Test manuel de l'API

```bash
# Test avec curl
curl -X POST \
  "https://texttospeech.googleapis.com/v1/text:synthesize?key=AIzaSyD3t1wu2BpwlQ6CfQeTfgQGkpd1VLGxVQI" \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "text": "Bonjour, ceci est un test de synthèse vocale."
    },
    "voice": {
      "languageCode": "fr-FR",
      "name": "fr-FR-Wavenet-C",
      "ssmlGender": "FEMALE"
    },
    "audioConfig": {
      "audioEncoding": "MP3"
    }
  }'
```

## Sécurité

### Protection de la clé API

**Note importante**: La clé API est actuellement codée en dur dans l'Edge Function. Pour plus de sécurité en production:

1. **Créer une variable d'environnement**:
   ```bash
   # Dans Supabase Dashboard > Settings > Edge Functions
   GOOGLE_TTS_API_KEY=AIzaSyD3t1wu2BpwlQ6CfQeTfgQGkpd1VLGxVQI
   ```

2. **Modifier l'Edge Function** (ligne 97):
   ```typescript
   // Au lieu de:
   const googleApiKey = Deno.env.get('GOOGLE_TTS_API_KEY') || 'AIzaSyD3t1wu2BpwlQ6CfQeTfgQGkpd1VLGxVQI';

   // Utiliser:
   const googleApiKey = Deno.env.get('GOOGLE_TTS_API_KEY');
   ```

3. **Restreindre la clé API**:
   - Dans Google Cloud Console
   - "APIs & Services" > "Credentials"
   - Éditer la clé API
   - Ajouter des restrictions:
     - Restreindre aux APIs: Cloud Text-to-Speech
     - Restreindre les requêtes HTTP (optionnel)

## Dépannage

### Erreur: "API key not valid"
**Solution**: Vérifier que l'API Text-to-Speech est activée dans Google Cloud Console

### Erreur: "Quota exceeded"
**Solution**:
- Vérifier le quota dans Google Cloud Console
- Configurer la facturation si le quota gratuit est dépassé

### Erreur: "Permission denied"
**Solution**: Vérifier que la clé API a les permissions pour Text-to-Speech

### Audio non généré
**Solution**:
1. Vérifier les logs de l'Edge Function
2. Vérifier que le bucket `article-audio` existe
3. Vérifier les politiques RLS

## Support

### Documentation Google Cloud TTS
- Guide officiel: https://cloud.google.com/text-to-speech/docs
- Voix disponibles: https://cloud.google.com/text-to-speech/docs/voices
- Tarification: https://cloud.google.com/text-to-speech/pricing

### Ressources SIPORTS
- Guide audio articles: `AUDIO_ARTICLES_GUIDE.md`
- Migration base de données: `supabase/migrations/*_create_articles_audio_table.sql`
- Edge Function: `supabase/functions/convert-text-to-speech/index.ts`
- Service: `src/services/articleAudioService.ts`
- Composant: `src/components/news/ArticleAudioPlayer.tsx`

# Guide - Fonction Audio pour Articles

## Vue d'ensemble

Le système permet de convertir automatiquement les articles en audio et de les écouter directement depuis l'interface. Il supporte deux méthodes de conversion:

1. **OpenAI Text-to-Speech API** (recommandé) - Qualité professionnelle
2. **Web Speech API** (fallback) - Gratuit, fonctionne dans le navigateur

## Architecture

### 1. Base de données

#### Table `articles_audio`
Stocke les métadonnées des fichiers audio générés:

```sql
CREATE TABLE articles_audio (
  id uuid PRIMARY KEY,
  article_id uuid REFERENCES news_articles(id),
  audio_url text,              -- URL du fichier dans Supabase Storage
  duration integer,             -- Durée en secondes
  language text DEFAULT 'fr',  -- Langue (fr, en, ar)
  voice_type text,             -- Type de voix utilisée
  file_size bigint,            -- Taille du fichier
  status audio_status,         -- pending, processing, ready, error
  error_message text,
  created_at timestamptz,
  updated_at timestamptz,
  UNIQUE(article_id, language)
);
```

#### Bucket Storage `article-audio`
Stocke les fichiers audio MP3 générés:
- Accès public en lecture
- Limite: 10MB par fichier
- Formats: MP3, WAV, OGG

### 2. Edge Function `convert-text-to-speech`

Convertit le texte d'un article en audio:

**Endpoint:** `/functions/v1/convert-text-to-speech`

**Requête:**
```json
{
  "articleId": "uuid",
  "text": "Contenu de l'article...",
  "language": "fr",
  "voiceType": "alloy"
}
```

**Réponse (succès):**
```json
{
  "success": true,
  "audio": {
    "id": "uuid",
    "article_id": "uuid",
    "audio_url": "https://...",
    "duration": 180,
    "status": "ready"
  },
  "message": "Audio généré avec succès"
}
```

**Réponse (fallback navigateur):**
```json
{
  "success": true,
  "audio": {...},
  "useClientSide": true,
  "message": "Audio sera généré dans le navigateur"
}
```

### 3. Service `ArticleAudioService`

Service TypeScript pour gérer l'audio des articles:

```typescript
// Récupérer l'audio existant
const audio = await ArticleAudioService.getArticleAudio(articleId, 'fr');

// Convertir un article en audio
const result = await ArticleAudioService.convertArticleToAudio(
  articleId,
  articleText,
  'fr',
  'alloy'
);

// Générer audio côté client (Web Speech API)
await ArticleAudioService.generateClientSideAudio(text, 'fr-FR');

// Arrêter la lecture côté client
ArticleAudioService.stopClientSideAudio();
```

### 4. Composant `ArticleAudioPlayer`

Interface utilisateur pour lire l'audio:

**Props:**
```typescript
interface ArticleAudioPlayerProps {
  articleId: string;      // ID de l'article
  articleText: string;    // Texte complet de l'article
  articleTitle: string;   // Titre (pour le téléchargement)
  language?: string;      // Langue (défaut: 'fr')
}
```

**Fonctionnalités:**
- ✅ Lecture/Pause
- ✅ Barre de progression
- ✅ Contrôle du volume
- ✅ Muet/Démuet
- ✅ Téléchargement MP3
- ✅ Affichage du temps écoulé/total
- ✅ Conversion automatique à la demande
- ✅ Fallback Web Speech API

## Configuration

### Option 1: OpenAI Text-to-Speech (Recommandé)

Pour activer OpenAI TTS, ajoutez votre clé API:

1. **Obtenir une clé API OpenAI:**
   - Créer un compte sur https://platform.openai.com
   - Aller dans API Keys
   - Créer une nouvelle clé

2. **Configurer dans Supabase:**
   ```bash
   # Dans le dashboard Supabase, allez dans Settings > Edge Functions
   # Ajoutez la variable d'environnement:
   OPENAI_API_KEY=sk-...
   ```

3. **Modèles disponibles:**
   - `tts-1` - Standard (rapide, économique)
   - `tts-1-hd` - Haute qualité

4. **Voix disponibles:**
   - `alloy` - Neutre
   - `echo` - Masculine
   - `fable` - Britannique
   - `onyx` - Profonde
   - `nova` - Féminine
   - `shimmer` - Claire

5. **Tarifs OpenAI:**
   - TTS Standard: $15 / 1M caractères
   - TTS HD: $30 / 1M caractères
   - Exemple: Article de 1000 mots ≈ $0.015

### Option 2: Web Speech API (Gratuit, Fallback)

Si aucune clé OpenAI n'est configurée, le système utilise automatiquement la Web Speech API du navigateur:

**Avantages:**
- ✅ Gratuit
- ✅ Pas de configuration
- ✅ Fonctionne hors ligne

**Limitations:**
- ⚠️ Qualité variable selon le navigateur
- ⚠️ Voix limitées
- ⚠️ Pas de téléchargement possible
- ⚠️ Nécessite une connexion pour la première utilisation

**Support navigateurs:**
- Chrome: ✅ Excellent
- Firefox: ✅ Bon
- Safari: ✅ Bon
- Edge: ✅ Excellent

## Utilisation

### Dans une page d'article

```tsx
import ArticleAudioPlayer from '../components/news/ArticleAudioPlayer';

function ArticlePage() {
  return (
    <div>
      <h1>{article.title}</h1>

      {/* Lecteur audio */}
      <ArticleAudioPlayer
        articleId={article.id}
        articleText={article.content}
        articleTitle={article.title}
        language="fr"
      />

      <div>{article.content}</div>
    </div>
  );
}
```

### Workflow utilisateur

1. **Première lecture:**
   - Utilisateur clique sur "Générer & Lire"
   - Le système vérifie si l'audio existe déjà
   - Si non, conversion automatique (OpenAI ou navigateur)
   - Lecture démarre automatiquement

2. **Lectures suivantes:**
   - L'audio est déjà disponible
   - Lecture instantanée
   - Possibilité de télécharger le MP3

3. **Contrôles:**
   - Play/Pause
   - Barre de progression cliquable
   - Volume ajustable
   - Bouton muet
   - Téléchargement MP3

## Gestion des langues

Le système supporte plusieurs langues:

```typescript
// Français
<ArticleAudioPlayer language="fr" />

// Anglais
<ArticleAudioPlayer language="en" />

// Arabe
<ArticleAudioPlayer language="ar" />
```

**Mapping des voix OpenAI:**
- Français → `alloy`
- Anglais → `nova`
- Arabe → `shimmer`

## Performance

### Optimisations implémentées

1. **Cache intelligent:**
   - Les audios sont stockés et réutilisés
   - Un audio par langue par article
   - Pas de re-génération inutile

2. **Conversion asynchrone:**
   - L'utilisateur n'attend pas la conversion
   - Statut "processing" affiché
   - Notification quand prêt

3. **Compression:**
   - Format MP3 (compression élevée)
   - Qualité optimisée pour la voix

4. **CDN Supabase:**
   - Les fichiers sont servis via CDN
   - Mise en cache automatique
   - Temps de chargement rapide

## Sécurité

### Politiques RLS

```sql
-- Lecture publique des audios prêts
CREATE POLICY "Anyone can read ready audio files"
  ON articles_audio FOR SELECT
  USING (status = 'ready');

-- Création par utilisateurs authentifiés
CREATE POLICY "Authenticated users can insert audio requests"
  ON articles_audio FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Gestion par service role
CREATE POLICY "Service role can manage audio files"
  ON articles_audio FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);
```

### Storage Policies

```sql
-- Lecture publique
CREATE POLICY "Public can read audio files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'article-audio');

-- Upload par authentifiés
CREATE POLICY "Authenticated users can upload audio"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'article-audio');
```

## Monitoring

### Vérifier les audios générés

```sql
-- Statistiques
SELECT
  status,
  language,
  COUNT(*) as count,
  AVG(duration) as avg_duration,
  SUM(file_size) as total_size
FROM articles_audio
GROUP BY status, language;

-- Audios en erreur
SELECT
  article_id,
  error_message,
  created_at
FROM articles_audio
WHERE status = 'error'
ORDER BY created_at DESC;

-- Audios les plus écoutés (nécessite tracking)
SELECT
  a.title,
  aa.audio_url,
  aa.duration
FROM articles_audio aa
JOIN news_articles a ON a.id = aa.article_id
WHERE aa.status = 'ready'
ORDER BY a.views DESC
LIMIT 10;
```

### Logs Edge Function

Dans le dashboard Supabase:
1. Aller dans Edge Functions
2. Sélectionner `convert-text-to-speech`
3. Voir les logs en temps réel

## Dépannage

### Problème: Audio ne se génère pas

**Solution:**
1. Vérifier la clé OpenAI dans les variables d'environnement
2. Vérifier les logs de l'Edge Function
3. Vérifier que l'article a du contenu texte

### Problème: "Web Speech API non supportée"

**Solution:**
- Utiliser Chrome, Firefox, Safari ou Edge
- Vérifier que JavaScript est activé
- Essayer en mode navigation privée

### Problème: Audio coupé ou incomplet

**Solution:**
1. OpenAI limite à 4096 caractères
2. Le texte est automatiquement tronqué
3. Pour articles longs, diviser en plusieurs parties

### Problème: Erreur "Storage bucket not found"

**Solution:**
```sql
-- Recréer le bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-audio', 'article-audio', true);
```

## Évolutions futures

### Améliorations possibles

1. **Multi-voix:**
   - Permettre choix de la voix
   - Voix homme/femme
   - Accents régionaux

2. **Vitesse de lecture:**
   - 0.5x, 1x, 1.25x, 1.5x, 2x
   - Sauvegarde des préférences

3. **Chapitrage:**
   - Diviser longs articles en chapitres
   - Navigation entre chapitres
   - Table des matières audio

4. **Playlist:**
   - File d'attente d'articles
   - Lecture continue
   - Shuffle

5. **Statistiques:**
   - Temps d'écoute total
   - Articles les plus écoutés
   - Taux de complétion

6. **Accessibilité:**
   - Raccourcis clavier
   - ARIA labels complets
   - Mode contraste élevé

7. **Hors ligne:**
   - Service Worker
   - Cache des audios
   - Synchronisation

## Support

Pour toute question:
- Consulter ce guide
- Vérifier les logs Supabase
- Tester avec Web Speech API en fallback

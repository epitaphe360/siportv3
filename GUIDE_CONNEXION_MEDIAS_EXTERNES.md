# 🔗 Guide de Connexion aux Liens Externes des Médias

## 📋 Vue d'ensemble

L'application SIPORT affiche les médias (vidéos, audio, images) en utilisant des **URLs stockées dans Supabase** qui pointent vers des **fichiers hébergés sur des services externes**.

---

## 🏗️ Architecture de Connexion

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUX DE CONNEXION                         │
└─────────────────────────────────────────────────────────────┘

1. UTILISATEUR CLIQUE SUR MÉDIA
   ↓
2. APP RÉCUPÈRE DONNÉES DEPUIS SUPABASE (table: media_contents)
   ↓
3. SUPABASE RETOURNE:
   - video_url: "https://sample-videos.com/video321/mp4/720/big_buck_bunny.mp4"
   - audio_url: "https://soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
   - thumbnail_url: "https://images.unsplash.com/photo-xyz"
   ↓
4. COMPOSANT REACT AFFICHE LE MÉDIA:
   - VideoPlayer.tsx utilise <video src={media.video_url} />
   - AudioPlayer utilise <audio src={media.audio_url} />
   - Images utilisent <img src={media.thumbnail_url} />
   ↓
5. NAVIGATEUR TÉLÉCHARGE FICHIER DEPUIS L'URL EXTERNE
   ↓
6. MÉDIA S'AFFICHE À L'UTILISATEUR
```

---

## 📁 Structure des Fichiers Concernés

### 1. **Service Principal** (`src/services/mediaService.ts`)

```typescript
// Ce service récupère les URLs depuis Supabase
static async getMediaById(id: string): Promise<MediaContent | null> {
  const { data: mediaData, error } = await supabase
    .from('media_contents')
    .select('*')
    .eq('id', id)
    .single();

  // Retourne l'objet avec les URLs:
  // {
  //   id: "abc123",
  //   title: "Innovation Portuaire 2025",
  //   video_url: "https://sample-videos.com/video321/mp4/720/big_buck_bunny.mp4",
  //   thumbnail_url: "https://images.unsplash.com/photo-xyz",
  //   ...
  // }
  return mediaData;
}
```

### 2. **Composant VideoPlayer** (`src/components/media/VideoPlayer.tsx`)

```tsx
// Ce composant affiche la vidéo en utilisant l'URL
export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,  // <- URL externe récupérée depuis Supabase
  thumbnailUrl,
  ...
}) => {
  return (
    <video 
      ref={videoRef}
      src={videoUrl}  // <- Connexion directe à l'URL externe
      poster={thumbnailUrl}
      className="w-full h-full object-cover"
    />
  );
};
```

### 3. **Pages qui Affichent les Médias**

#### MediaDetailPage.tsx
```tsx
const fetchMedia = async () => {
  const data = await MediaService.getMediaById(id);
  setMedia(data);  // Stocke l'objet avec video_url, audio_url, etc.
};

// Affichage:
<VideoPlayer 
  videoUrl={media.video_url}  // URL externe
  thumbnailUrl={media.thumbnail_url}  // URL externe
/>

<img src={media.thumbnail_url} alt={media.title} />
```

#### WebinarsPage.tsx, PodcastsPage.tsx, etc.
```tsx
const loadWebinars = async () => {
  const data = await mediaService.getMedia({ type: 'webinar' });
  setWebinars(data);  // Chaque item contient video_url, thumbnail_url
};

// Affichage dans une carte:
<img 
  src={webinar.thumbnail_url}  // URL externe
  alt={webinar.title}
/>
```

---

## 🔧 Comment Mettre à Jour les Connexions

### **Option 1: Mettre à Jour un Média Existant (Interface Admin)**

1. **Se connecter en tant qu'admin:**
   - Email: `admin@siports.com`
   - Mot de passe: `Admin2026!`

2. **Accéder au tableau de bord admin:**
   - Cliquer sur le bouton rose **"Gérer Contenus Médias"**

3. **Trouver le média à modifier:**
   - Utiliser les filtres (type, statut)
   - Cliquer sur le bouton "Modifier" du média

4. **Changer les URLs:**
   - **Thumbnail URL**: Nouvelle URL de l'image miniature
   - **Video URL** (pour webinaires, capsules, etc.): Nouvelle URL de la vidéo
   - **Audio URL** (pour podcasts): Nouvelle URL du fichier audio

5. **Sauvegarder:**
   - Cliquer sur "Mettre à jour"
   - L'application utilisera immédiatement les nouvelles URLs

### **Option 2: Créer un Nouveau Média (Interface Admin)**

1. **Cliquer sur "Créer Nouveau Média"**

2. **Sélectionner le type:**
   - Webinaire (vidéo)
   - Podcast (audio)
   - Capsule Inside (vidéo)
   - Live Studio (vidéo)
   - Best Moments (vidéo)
   - Testimonial (vidéo)

3. **Remplir le formulaire avec les URLs externes:**

```
Titre: "Mon Nouveau Webinaire"
Description: "Description du contenu"

📸 Thumbnail URL:
https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d

🎥 Video URL (si type vidéo):
https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4

🎵 Audio URL (si podcast):
https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3

⏱️ Durée: 15 (en minutes)
📂 Catégorie: Innovation
🏷️ Tags: innovation, technologie (séparés par des virgules)
👥 Speakers: [{"name":"Jean Dupont","title":"Expert Maritime"}]
```

4. **Statut:**
   - **Draft** (brouillon): Non visible publiquement
   - **Published** (publié): Visible immédiatement

### **Option 3: Mettre à Jour via Script (Développeur)**

Créez un script pour mettre à jour en masse:

```javascript
// scripts/update-media-urls.mjs
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://eqjoqgpbxhsfgcovipgu.supabase.co',
  'VOTRE_SERVICE_ROLE_KEY'
);

// Mettre à jour un média spécifique
const { data, error } = await supabase
  .from('media_contents')
  .update({
    video_url: 'https://nouveau-serveur.com/nouvelle-video.mp4',
    thumbnail_url: 'https://nouveau-serveur.com/nouvelle-image.jpg'
  })
  .eq('id', 'ID_DU_MEDIA');

console.log('Média mis à jour:', data);
```

### **Option 4: Mettre à Jour via SQL Direct (Supabase Dashboard)**

1. **Aller sur Supabase Dashboard:**
   - https://supabase.com/dashboard
   - Se connecter au projet SIPORT

2. **Ouvrir l'éditeur SQL:**
   - Menu "SQL Editor"

3. **Exécuter une requête:**

```sql
-- Mettre à jour un média spécifique
UPDATE media_contents
SET 
  video_url = 'https://nouveau-serveur.com/nouvelle-video.mp4',
  thumbnail_url = 'https://nouveau-serveur.com/nouvelle-image.jpg',
  updated_at = NOW()
WHERE id = 'ID_DU_MEDIA';

-- Mettre à jour tous les webinaires avec un nouveau serveur vidéo
UPDATE media_contents
SET 
  video_url = REPLACE(video_url, 'sample-videos.com', 'nouveau-serveur.com')
WHERE type = 'webinar';

-- Vérifier les changements
SELECT id, title, video_url, thumbnail_url 
FROM media_contents 
WHERE type = 'webinar' 
LIMIT 10;
```

---

## 🌐 Services d'Hébergement Recommandés

### **Pour les Vidéos:**

| Service | URL Format | Prix | Avantages |
|---------|-----------|------|-----------|
| **YouTube** | `https://www.youtube.com/watch?v=VIDEO_ID` | Gratuit | Bande passante illimitée, CDN global |
| **Vimeo** | `https://player.vimeo.com/video/VIDEO_ID` | 7-75$/mois | Haute qualité, pas de pub, analytics |
| **Cloudflare Stream** | `https://videodelivery.net/VIDEO_ID/manifest/video.m3u8` | 1$/1000 vues | CDN ultra-rapide, transcoding auto |
| **Mux** | `https://stream.mux.com/VIDEO_ID.m3u8` | Pay as you go | API puissante, analytics avancés |
| **Bunny CDN** | `https://video.bunnycdn.com/play/VIDEO_ID` | 5$/TB | Économique, CDN rapide |

### **Pour les Podcasts (Audio):**

| Service | URL Format | Prix | Avantages |
|---------|-----------|------|-----------|
| **SoundCloud** | `https://soundcloud.com/user/track` | Gratuit-16$/mois | Partage facile, embed |
| **Anchor** | `https://anchor.fm/s/SHOW_ID/podcast/play/EPISODE_ID` | Gratuit | Distribution automatique |
| **AWS S3 + CloudFront** | `https://cdn.example.com/audio/file.mp3` | ~0.01$/GB | Contrôle total, évolutif |
| **Bunny CDN** | `https://audio.bunnycdn.com/file.mp3` | 5$/TB | Économique |

### **Pour les Images (Thumbnails):**

| Service | URL Format | Prix | Avantages |
|---------|-----------|------|-----------|
| **Unsplash** | `https://images.unsplash.com/photo-ID` | Gratuit | Haute qualité, légal |
| **Cloudinary** | `https://res.cloudinary.com/CLOUD/image/upload/ID.jpg` | Gratuit-99$/mois | Transformations auto, optimisation |
| **ImageKit** | `https://ik.imagekit.io/ID/image.jpg` | Gratuit-49$/mois | CDN global, transformations |
| **Supabase Storage** | `https://PROJECT.supabase.co/storage/v1/object/public/images/file.jpg` | Inclus | Intégré, simple |

---

## 🔄 Migration vers Nouveau Serveur

### **Scénario: Migrer de sample-videos.com vers votre propre CDN**

1. **Uploader vos fichiers sur le nouveau serveur:**

```bash
# Exemple avec Cloudflare R2 / Bunny CDN
aws s3 sync ./videos/ s3://mon-bucket-videos/
```

2. **Créer un script de migration:**

```javascript
// scripts/migrate-video-urls.mjs
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// 1. Récupérer tous les médias
const { data: medias } = await supabase
  .from('media_contents')
  .select('id, title, video_url, type');

console.log(`🔄 ${medias.length} médias à migrer...`);

// 2. Pour chaque média, mettre à jour l'URL
for (const media of medias) {
  if (!media.video_url) continue;

  // Remplacer l'ancien domaine par le nouveau
  const newUrl = media.video_url.replace(
    'sample-videos.com',
    'mon-nouveau-cdn.com'
  );

  await supabase
    .from('media_contents')
    .update({ video_url: newUrl })
    .eq('id', media.id);

  console.log(`✅ ${media.title}: ${newUrl}`);
}

console.log('✨ Migration terminée!');
```

3. **Exécuter le script:**

```bash
node scripts/migrate-video-urls.mjs
```

4. **Vérifier:**

```javascript
// scripts/verify-urls.mjs
const { data } = await supabase
  .from('media_contents')
  .select('title, video_url, thumbnail_url')
  .limit(5);

console.log('Exemples après migration:');
data.forEach(m => {
  console.log(`\n${m.title}:`);
  console.log(`  Video: ${m.video_url}`);
  console.log(`  Thumb: ${m.thumbnail_url}`);
});
```

---

## ⚙️ Modification du Code Source

### **Si vous voulez changer comment les URLs sont récupérées:**

#### 1. Modifier le Service (src/services/mediaService.ts)

```typescript
// AVANT (actuel):
static async getMediaById(id: string): Promise<MediaContent | null> {
  const { data: mediaData } = await supabase
    .from('media_contents')
    .select('*')
    .eq('id', id)
    .single();

  return mediaData;  // Retourne l'URL telle quelle
}

// APRÈS (avec transformation):
static async getMediaById(id: string): Promise<MediaContent | null> {
  const { data: mediaData } = await supabase
    .from('media_contents')
    .select('*')
    .eq('id', id)
    .single();

  // Transformer les URLs avant de les retourner
  if (mediaData.video_url) {
    // Exemple: ajouter un préfixe CDN
    mediaData.video_url = `https://cdn.siports.com/proxy?url=${mediaData.video_url}`;
  }

  return mediaData;
}
```

#### 2. Créer un Proxy (Optionnel)

Si vous voulez cacher les URLs réelles ou ajouter de l'authentification:

```typescript
// server/routes/media-proxy.ts
app.get('/api/media/video/:id', async (req, res) => {
  // 1. Récupérer l'URL réelle depuis Supabase
  const { data: media } = await supabase
    .from('media_contents')
    .select('video_url')
    .eq('id', req.params.id)
    .single();

  // 2. Vérifier les permissions utilisateur
  if (!req.user.canAccessMedia(media)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // 3. Rediriger vers l'URL externe
  res.redirect(media.video_url);
});
```

Puis dans le composant:
```tsx
<VideoPlayer 
  videoUrl={`/api/media/video/${mediaId}`}  // URL du proxy
/>
```

---

## 🐛 Résolution de Problèmes

### **Problème: Vidéo ne se charge pas**

1. **Vérifier l'URL dans la base de données:**

```javascript
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('URL', 'KEY');
(async () => {
  const { data } = await supabase
    .from('media_contents')
    .select('id, title, video_url')
    .eq('id', 'MEDIA_ID')
    .single();
  
  console.log('URL stockée:', data.video_url);
  
  // Tester si l'URL est accessible
  const response = await fetch(data.video_url, { method: 'HEAD' });
  console.log('Statut HTTP:', response.status);
  console.log('Content-Type:', response.headers.get('content-type'));
})();
"
```

2. **Vérifier les erreurs dans la Console du navigateur:**
   - F12 → Onglet Console
   - Chercher les erreurs CORS, 404, 403

3. **Vérifier les politiques CORS:**
   - Le serveur externe doit autoriser les requêtes depuis votre domaine
   - Headers requis: `Access-Control-Allow-Origin: *`

### **Problème: URLs cassées après migration**

```sql
-- Trouver les URLs qui ne fonctionnent pas
SELECT id, title, video_url 
FROM media_contents 
WHERE video_url IS NOT NULL 
  AND video_url NOT LIKE 'https://%';

-- Corriger les URLs mal formatées
UPDATE media_contents
SET video_url = 'https://' || video_url
WHERE video_url NOT LIKE 'https://%'
  AND video_url NOT LIKE 'http://%';
```

---

## 📊 État Actuel du Système

### **Serveurs Externes Utilisés:**

```javascript
// Exécuter pour voir la répartition:
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://eqjoqgpbxhsfgcovipgu.supabase.co',
  'SERVICE_KEY'
);

(async () => {
  const { data } = await supabase
    .from('media_contents')
    .select('video_url, audio_url, thumbnail_url');

  const domains = {
    video: {},
    audio: {},
    thumbnail: {}
  };

  data.forEach(m => {
    if (m.video_url) {
      const domain = new URL(m.video_url).hostname;
      domains.video[domain] = (domains.video[domain] || 0) + 1;
    }
    if (m.audio_url) {
      const domain = new URL(m.audio_url).hostname;
      domains.audio[domain] = (domains.audio[domain] || 0) + 1;
    }
    if (m.thumbnail_url) {
      const domain = new URL(m.thumbnail_url).hostname;
      domains.thumbnail[domain] = (domains.thumbnail[domain] || 0) + 1;
    }
  });

  console.log('\n📊 RÉPARTITION DES DOMAINES:\n');
  console.log('Vidéos:', domains.video);
  console.log('Audio:', domains.audio);
  console.log('Thumbnails:', domains.thumbnail);
})();
"
```

**Résultat actuel:**
- **Vidéos**: sample-videos.com (34 vidéos)
- **Audio**: soundhelix.com (13 podcasts)
- **Thumbnails**: images.unsplash.com (95 images)

---

## ✅ Checklist de Mise à Jour

Avant de mettre à jour les URLs:

- [ ] **Tester la nouvelle URL** dans un navigateur (doit charger le fichier)
- [ ] **Vérifier le format** (MP4 pour vidéos, MP3 pour audio, JPG/PNG pour images)
- [ ] **Vérifier les permissions** (l'URL doit être publique ou avoir les bonnes clés d'authentification)
- [ ] **Vérifier CORS** (si hébergement personnalisé)
- [ ] **Faire un backup** de la table `media_contents` avant modification massive
- [ ] **Tester avec 1 média** avant de mettre à jour en masse
- [ ] **Documenter** la nouvelle URL dans EXPLICATION_STOCKAGE_MEDIAS.md

---

## 🎯 Résumé

**Pour mettre à jour les connexions aux liens externes:**

1. **Simple (1 média)**: Interface admin → Modifier → Changer URL → Sauvegarder
2. **Multiple (batch)**: Script JS → Boucle sur médias → Update Supabase
3. **Migration serveur**: Upload fichiers → Script de remplacement d'URLs → Vérification
4. **Proxy/Transformation**: Modifier `mediaService.ts` → Transformer URLs avant retour

**L'application ne stocke PAS les fichiers**, elle affiche des URLs externes via:
- `<video src={media.video_url} />` (VideoPlayer.tsx)
- `<audio src={media.audio_url} />` (futur AudioPlayer.tsx)
- `<img src={media.thumbnail_url} />` (toutes les pages)

**Toute modification d'URL dans Supabase est IMMÉDIATEMENT visible** dans l'application au prochain chargement.

# Guide : Vidéos YouTube dans les Webinaires SIPORT

## ✅ Fonctionnalité Ajoutée

Le lecteur vidéo des webinaires SIPORT supporte maintenant **les vidéos YouTube** en plus des fichiers MP4 classiques.

## 🎥 Comment ça marche ?

### 1. Formats d'URL Supportés

Le système détecte automatiquement et convertit les URLs YouTube :

```
✅ https://www.youtube.com/watch?v=VIDEO_ID
✅ https://youtu.be/VIDEO_ID
✅ https://www.youtube.com/embed/VIDEO_ID
```

### 2. Affichage Automatique

- **Vidéos YouTube** : Affichées dans un iframe avec le lecteur YouTube natif
- **Fichiers MP4** : Affichés avec le lecteur vidéo personnalisé

### 3. Fonctionnalités

**Pour YouTube :**
- ✅ Lecture directe avec lecteur YouTube
- ✅ Contrôles natifs YouTube (play, pause, volume, plein écran, qualité)
- ✅ Autoplay optionnel
- ✅ Partage et sous-titres YouTube intégrés

**Pour MP4 :**
- ✅ Lecteur personnalisé avec contrôles avancés
- ✅ Barre de progression
- ✅ Contrôle du volume
- ✅ Mode plein écran
- ✅ Sélection de qualité

## 📝 Utilisation

### Dans la Base de Données

Ajoutez simplement une URL YouTube dans le champ `video_url` :

```sql
UPDATE media_contents 
SET video_url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
WHERE id = 'webinar-id';
```

### Via l'Interface Admin

1. Aller sur **Admin** > **Créer un Média**
2. Sélectionner type **Webinaire**
3. Dans le champ **Video URL**, coller l'URL YouTube
4. Sauvegarder

### Exemple de Webinaires avec YouTube

Le script `add-video-urls-to-webinars.js` ajoute automatiquement des vidéos YouTube maritimes :

```bash
$env:SUPABASE_KEY="votre-clé"; node scripts/add-video-urls-to-webinars.js
```

## 🌊 Vidéos YouTube Maritimes Recommandées

Voici des exemples de recherche YouTube pour contenu maritime :

- "port autonome documentary"
- "maritime industry innovation"
- "smart ports technology"
- "shipping logistics"
- "port operations"
- "maritime cybersecurity"
- "blockchain supply chain"

## 🔧 Code Technique

### Détection YouTube

```typescript
const isYouTube = src?.includes('youtube.com') || src?.includes('youtu.be');
```

### Conversion en Format Embed

```typescript
const getYouTubeEmbedUrl = (url: string) => {
  if (url.includes('/embed/')) return url;
  
  let videoId = '';
  if (url.includes('youtube.com/watch?v=')) {
    videoId = url.split('v=')[1]?.split('&')[0];
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0];
  }
  
  return `https://www.youtube.com/embed/${videoId}?autoplay=${autoPlay ? 1 : 0}`;
};
```

### Rendu Conditionnel

```typescript
{isYouTube ? (
  <iframe
    src={getYouTubeEmbedUrl(src)}
    className="w-full aspect-video"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen
  />
) : (
  <video src={src} poster={poster} controls />
)}
```

## 📍 Pages Concernées

- **[/media/webinars](src/pages/media/WebinarsPage.tsx)** - Liste des webinaires
- **[/media/webinars/:id](src/pages/media/WebinarDetailPage.tsx)** - Détail webinaire avec vidéo
- **[VideoStreamPlayer](src/components/media/VideoStreamPlayer.tsx)** - Composant lecteur vidéo

## ✨ Avantages

1. **Pas d'hébergement vidéo** : Les vidéos sont hébergées sur YouTube
2. **Bande passante économisée** : YouTube gère la diffusion
3. **Qualité adaptative** : YouTube ajuste automatiquement la qualité
4. **Statistiques** : Suivi des vues sur YouTube
5. **Accessibilité** : Sous-titres automatiques YouTube disponibles

## 🚀 Prochaines Étapes

Pour ajouter vos propres vidéos YouTube maritimes :

1. Trouver ou créer des vidéos sur YouTube
2. Copier l'URL de la vidéo
3. Mettre à jour la table `media_contents`
4. Les vidéos s'afficheront automatiquement sur `/media/webinars`

---

**Note** : Le système fonctionne avec n'importe quelle vidéo YouTube publique. Assurez-vous d'avoir les droits d'utilisation des vidéos affichées.

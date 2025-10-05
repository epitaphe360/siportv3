# Synchronisation Automatique des Articles

## Vue d'ensemble

Le système de synchronisation automatique permet de récupérer les articles depuis le site officiel SIPORTS (https://siportevent.com/actualite-portuaire/) et de les afficher dans l'application.

## Architecture

### 1. Edge Function Supabase : `sync-news-articles`

**Emplacement** : `supabase/functions/sync-news-articles/index.ts`

**Fonctionnalités** :
- Scrappe les articles depuis https://siportevent.com/actualite-portuaire/
- Extrait les informations : titre, extrait, image, catégorie, lien source
- Insère les nouveaux articles dans la base de données
- Met à jour les articles existants (détection par titre)
- Retourne les statistiques de synchronisation

**Déploiement** :
```bash
supabase functions deploy sync-news-articles
```

### 2. Store Frontend : `newsStore.ts`

**Emplacement** : `src/store/newsStore.ts`

**Fonction modifiée** : `fetchFromOfficialSite()`

Cette fonction appelle l'Edge Function `sync-news-articles` et recharge ensuite les articles depuis la base de données.

### 3. Interface Utilisateur : `NewsPage.tsx`

**Emplacement** : `src/pages/NewsPage.tsx`

**Bouton "Actualiser"** :
- Déclenche la synchronisation manuellement
- Affiche un toast de progression
- Affiche les statistiques de synchronisation (nouveaux articles, mis à jour)

## Utilisation

### Synchronisation Manuelle

1. Accéder à la page des actualités : `/news`
2. Cliquer sur le bouton **"Actualiser"** (icône RefreshCw)
3. Attendre la fin de la synchronisation
4. Les nouveaux articles apparaissent automatiquement

### Synchronisation Automatique (Optionnel)

Pour configurer une synchronisation automatique périodique :

#### Option 1 : Cron Job Supabase

1. Accéder au dashboard Supabase
2. Aller dans "Database" > "Cron Jobs"
3. Créer un nouveau cron job :
   ```sql
   SELECT cron.schedule(
     'sync-news-articles-daily',
     '0 6 * * *',  -- Tous les jours à 6h du matin
     $$
     SELECT net.http_post(
       url := 'https://your-project.supabase.co/functions/v1/sync-news-articles',
       headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
       body := '{}'::jsonb
     );
     $$
   );
   ```

#### Option 2 : GitHub Actions

Créer un fichier `.github/workflows/sync-articles.yml` :

```yaml
name: Sync Articles

on:
  schedule:
    - cron: '0 6 * * *'  # Tous les jours à 6h UTC
  workflow_dispatch:  # Permet de déclencher manuellement

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Call Supabase Edge Function
        run: |
          curl -X POST \
            https://your-project.supabase.co/functions/v1/sync-news-articles \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{}'
```

## Structure des Données

### Table `news_articles`

```sql
CREATE TABLE news_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  category TEXT,
  image_url TEXT,
  tags TEXT[],
  published BOOLEAN DEFAULT true,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  views INTEGER DEFAULT 0,
  author_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Scraping

### Sélecteurs Utilisés

Le scraper utilise les sélecteurs suivants pour extraire les articles du site officiel :

- **Articles** : `article.elementor-post, .elementor-post`
- **Titre** : `.elementor-post__title a, h2 a, h3 a`
- **Image** : `img[src], img[data-src]`
- **Extrait** : `.elementor-post__excerpt, .elementor-post__text, p`
- **Catégorie** : `.elementor-post__badge, .category`

### Gestion des Erreurs

- Si un article ne peut pas être parsé, il est ignoré et un warning est loggé
- Si aucun article n'est trouvé, la synchronisation retourne un succès avec 0 articles
- Les erreurs de base de données sont capturées et retournées dans la réponse

## Monitoring

### Logs de l'Edge Function

Pour voir les logs de synchronisation :

1. Accéder au dashboard Supabase
2. Aller dans "Edge Functions"
3. Sélectionner `sync-news-articles`
4. Consulter les logs en temps réel

### Logs Typiques

```
🔍 Scraping articles from: https://siportevent.com/actualite-portuaire/
✅ Fetched HTML (95539 characters)
📝 Found 6 article elements
✅ Article 1: Casablanca: Development of its port complex...
✅ Article 2: Port Glossary: Understanding Maritime...
📦 Syncing 6 articles to database...
✨ Inserted: Casablanca: Development of its port complex...
🔄 Updated: Port Glossary: Understanding Maritime...
📊 Sync Summary:
   ✨ Inserted: 4
   🔄 Updated: 2
   ❌ Errors: 0
   📝 Total: 6
```

## Dépannage

### Problème : Aucun article n'est trouvé

**Solution** :
1. Vérifier que le site https://siportevent.com/actualite-portuaire/ est accessible
2. Vérifier que les sélecteurs CSS sont toujours valides
3. Consulter les logs de l'Edge Function

### Problème : Erreur de base de données

**Solution** :
1. Vérifier que la table `news_articles` existe
2. Vérifier les permissions RLS (Row Level Security)
3. Vérifier que la clé `SUPABASE_SERVICE_ROLE_KEY` est correcte

### Problème : Les articles ne s'affichent pas

**Solution** :
1. Vérifier que les articles ont `published = true`
2. Vérifier que `published_at` n'est pas dans le futur
3. Recharger la page des actualités

## Améliorations Futures

### 1. Scraping du Contenu Complet

Actuellement, seul l'extrait est récupéré. Pour récupérer le contenu complet :

```typescript
async function fetchFullArticle(url: string): Promise<string> {
  const response = await fetch(url);
  const html = await response.text();
  const document = new DOMParser().parseFromString(html, 'text/html');
  const contentElement = document.querySelector('.entry-content, .post-content');
  return contentElement?.textContent?.trim() || '';
}
```

### 2. Détection des Doublons par URL

Améliorer la détection des doublons en utilisant l'URL source :

```typescript
const { data: existing } = await supabaseClient
  .from('news_articles')
  .select('id')
  .or(`title.eq.${article.title},source_url.eq.${article.sourceUrl}`)
  .maybeSingle();
```

### 3. Pagination

Gérer la pagination pour récupérer tous les articles :

```typescript
for (let page = 1; page <= 3; page++) {
  const articles = await scrapeArticles(`${NEWS_URL}page/${page}/`);
  await syncArticlesToDatabase(supabaseClient, articles);
}
```

### 4. Webhooks

Configurer un webhook pour être notifié lors de nouveaux articles sur le site officiel.

## Conclusion

Le système de synchronisation automatique permet de maintenir les articles à jour sans intervention manuelle. Il peut être déclenché manuellement via l'interface ou automatiquement via un cron job.

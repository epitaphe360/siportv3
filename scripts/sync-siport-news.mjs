import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import { parse } from 'node-html-parser';
import https from 'https';

// Désactiver la vérification SSL pour ce script (seulement pour le développement)
const agent = new https.Agent({  
  rejectUnauthorized: false
});

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const NEWS_URL = 'https://siportevent.com/actualite-portuaire/';

async function scrapeArticles() {
  console.log('🔍 Fetching articles from:', NEWS_URL);
  
  try {
    const response = await fetch(NEWS_URL, {
      agent,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const root = parse(html);
    
    // Trouver tous les articles
    const articleElements = root.querySelectorAll('article.elementor-post');
    console.log(`📰 Found ${articleElements.length} articles\n`);

    const articles = [];

    for (const article of articleElements) {
      try {
        // Titre
        const titleElement = article.querySelector('.elementor-post__title a');
        const title = titleElement?.textContent?.trim() || '';
        const url = titleElement?.getAttribute('href') || '';

        // Image
        const imgElement = article.querySelector('img');
        const image = imgElement?.getAttribute('src') || imgElement?.getAttribute('data-src') || '';

        // Extrait
        const excerptElement = article.querySelector('.elementor-post__excerpt p');
        const excerpt = excerptElement?.textContent?.trim() || '';

        // Catégorie
        const categoryElement = article.querySelector('.elementor-post__badge');
        const category = categoryElement?.textContent?.trim() || 'Actualités Portuaires';

        if (title && url) {
          articles.push({
            title,
            excerpt: excerpt || `Découvrez cet article sur ${title.substring(0, 50)}...`,
            content: excerpt || `Article publié sur siportevent.com - ${title}`,
            author: 'Équipe SIPORTS',
            category: 'Actualités Portuaires',
            image,
            url,
            tags: ['portuaire', 'SIPORTS', 'actualités'],
            readTime: Math.max(2, Math.ceil((title + excerpt).split(/\s+/).length / 200))
          });
        }
      } catch (err) {
        console.error(`⚠️  Error parsing article:`, err.message);
      }
    }

    return articles;
  } catch (error) {
    console.error('❌ Error scraping:', error);
    throw error;
  }
}

async function syncToDatabase(articles) {
  console.log(`\n📦 Syncing ${articles.length} articles to database...`);

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const article of articles) {
    try {
      // Vérifier si l'article existe déjà
      const { data: existing } = await supabase
        .from('news_articles')
        .select('id')
        .eq('title', article.title)
        .maybeSingle();

      if (existing) {
        // Mettre à jour
        const { error } = await supabase
          .from('news_articles')
          .update({
            excerpt: article.excerpt,
            content: article.content,
            category: article.category,
            image_url: article.image,
            tags: article.tags,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (error) throw error;
        updated++;
        console.log(`  🔄 Updated: ${article.title.substring(0, 60)}...`);
      } else {
        // Insérer
        const { error } = await supabase
          .from('news_articles')
          .insert({
            title: article.title,
            excerpt: article.excerpt,
            content: article.content,
            author: article.author,
            category: article.category,
            image_url: article.image,
            tags: article.tags,
            published: true,
            featured: false,
            published_at: new Date().toISOString(),
            views: 0
          });

        if (error) throw error;
        inserted++;
        console.log(`  ✅ Inserted: ${article.title.substring(0, 60)}...`);
      }
    } catch (error) {
      console.error(`  ❌ Error syncing "${article.title}":`, error.message);
      skipped++;
    }
  }

  return { inserted, updated, skipped, total: articles.length };
}

async function main() {
  console.log('🚀 Starting SIPORTS news synchronization\n');
  console.log('=' .repeat(60) + '\n');

  try {
    // Scraper les articles
    const articles = await scrapeArticles();

    if (articles.length === 0) {
      console.log('⚠️  No articles found to sync');
      return;
    }

    console.log('Articles to sync:');
    articles.forEach((article, i) => {
      console.log(`  ${i + 1}. ${article.title}`);
    });

    // Synchroniser avec la base de données
    const stats = await syncToDatabase(articles);

    console.log('\n' + '='.repeat(60));
    console.log('✅ Synchronization complete!');
    console.log(`   📊 Inserted: ${stats.inserted}`);
    console.log(`   🔄 Updated: ${stats.updated}`);
    console.log(`   ⏭️  Skipped: ${stats.skipped}`);
    console.log(`   📝 Total: ${stats.total}`);
    console.log('='.repeat(60) + '\n');
  } catch (error) {
    console.error('\n❌ Synchronization failed:', error);
    process.exit(1);
  }
}

main();

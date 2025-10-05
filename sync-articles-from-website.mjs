import { createClient } from '@supabase/supabase-js';
import { JSDOM } from 'jsdom';

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

const BASE_URL = 'https://siportevent.com';
const NEWS_URL = 'https://siportevent.com/actualite-portuaire/';

/**
 * Scraper les articles depuis le site officiel
 */
async function scrapeArticles() {
  console.log('🔍 Scraping articles from:', NEWS_URL);

  try {
    const response = await fetch(NEWS_URL, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    console.log(`✅ Fetched HTML (${html.length} characters)`);

    // Parser le HTML avec JSDOM
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const articles = [];

    // Sélecteur pour les articles Elementor
    const articleElements = document.querySelectorAll('article.elementor-post, .elementor-post');

    console.log(`📝 Found ${articleElements.length} article elements`);

    articleElements.forEach((element, index) => {
      try {
        // Extraire le titre
        const titleElement = element.querySelector('.elementor-post__title a, h2 a, h3 a');
        const title = titleElement?.textContent?.trim() || `Article ${index + 1}`;

        // Extraire le lien
        const link = titleElement?.getAttribute('href') || '';
        const fullLink = link.startsWith('http') ? link : `${BASE_URL}${link}`;

        // Extraire l'image
        const imgElement = element.querySelector('img');
        const image = imgElement?.getAttribute('src') || imgElement?.getAttribute('data-src') || '';

        // Extraire l'extrait
        const excerptElement = element.querySelector('.elementor-post__excerpt, .elementor-post__text, p');
        const excerpt = excerptElement?.textContent?.trim() || 'Description non disponible';

        // Extraire la catégorie
        const categoryElement = element.querySelector('.elementor-post__badge, .category');
        const category = categoryElement?.textContent?.trim() || 'Actualités Portuaires';

        // Calculer le temps de lecture
        const wordCount = (title + ' ' + excerpt).split(/\s+/).length;
        const readTime = Math.max(1, Math.ceil(wordCount / 200));

        if (title && fullLink) {
          articles.push({
            title,
            excerpt,
            content: excerpt, // Le contenu complet sera chargé plus tard
            category,
            image,
            sourceUrl: fullLink,
            readTime,
            tags: ['portuaire', 'SIPORTS', category.toLowerCase()],
            author: 'SIPORTS',
            publishedAt: new Date().toISOString(),
          });

          console.log(`✅ Article ${index + 1}: ${title.substring(0, 50)}...`);
        }
      } catch (error) {
        console.warn(`⚠️  Error parsing article ${index}:`, error.message);
      }
    });

    return articles;
  } catch (error) {
    console.error('❌ Error scraping articles:', error);
    throw error;
  }
}

/**
 * Insérer ou mettre à jour les articles dans Supabase
 */
async function syncArticlesToDatabase(articles) {
  console.log(`\n📦 Syncing ${articles.length} articles to database...`);

  let inserted = 0;
  let updated = 0;
  let errors = 0;

  for (const article of articles) {
    try {
      // Vérifier si l'article existe déjà (par titre ou URL)
      const { data: existing, error: checkError } = await supabase
        .from('news_articles')
        .select('id, title')
        .eq('title', article.title)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existing) {
        // Mettre à jour l'article existant
        const { error: updateError } = await supabase
          .from('news_articles')
          .update({
            excerpt: article.excerpt,
            content: article.content,
            category: article.category,
            image_url: article.image,
            tags: article.tags,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (updateError) {
          throw updateError;
        }

        console.log(`🔄 Updated: ${article.title.substring(0, 50)}...`);
        updated++;
      } else {
        // Insérer un nouvel article
        const { error: insertError } = await supabase
          .from('news_articles')
          .insert({
            title: article.title,
            excerpt: article.excerpt,
            content: article.content,
            category: article.category,
            image_url: article.image,
            tags: article.tags,
            published: true,
            published_at: article.publishedAt,
            views: 0,
          });

        if (insertError) {
          throw insertError;
        }

        console.log(`✨ Inserted: ${article.title.substring(0, 50)}...`);
        inserted++;
      }
    } catch (error) {
      console.error(`❌ Error syncing article "${article.title}":`, error.message);
      errors++;
    }
  }

  console.log(`\n📊 Sync Summary:`);
  console.log(`   ✨ Inserted: ${inserted}`);
  console.log(`   🔄 Updated: ${updated}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`   📝 Total: ${articles.length}`);
}

/**
 * Fonction principale
 */
async function main() {
  console.log('🚀 Starting article synchronization from siportevent.com\n');

  try {
    // Scraper les articles
    const articles = await scrapeArticles();

    if (articles.length === 0) {
      console.log('⚠️  No articles found to sync');
      return;
    }

    // Synchroniser avec la base de données
    await syncArticlesToDatabase(articles);

    console.log('\n✅ Synchronization completed successfully!');
  } catch (error) {
    console.error('\n❌ Synchronization failed:', error);
    process.exit(1);
  }
}

// Exécuter le script
main();

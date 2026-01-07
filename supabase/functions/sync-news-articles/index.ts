import { createClient } from 'npm:@supabase/supabase-js@2';
import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.43/deno-dom-wasm.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BASE_URL = 'https://siportevent.com';
const NEWS_URL = 'https://siportevent.com/actualite-portuaire/';

interface ScrapedArticle {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  sourceUrl: string;
  readTime: number;
  tags: string[];
  publishedAt: string;
}

/**
 * Scraper les articles depuis le site officiel
 */
async function scrapeArticles(): Promise<ScrapedArticle[]> {
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

    // Parser le HTML
    const document = new DOMParser().parseFromString(html, 'text/html');
    if (!document) {
      throw new Error('Failed to parse HTML');
    }

    const articles: ScrapedArticle[] = [];

    // Sélecteur pour les articles Elementor
    const articleElements = document.querySelectorAll('article.elementor-post, .elementor-post');

    console.log(`📝 Found ${articleElements.length} article elements`);

    articleElements.forEach((element: any, index: number) => {
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
            content: excerpt, // Le contenu complet sera enrichi plus tard
            category,
            image,
            sourceUrl: fullLink,
            readTime,
            tags: ['portuaire', 'SIPORTS', category.toLowerCase()],
            publishedAt: new Date().toISOString(),
          });

          console.log(`✅ Article ${index + 1}: ${title.substring(0, 50)}...`);
        }
      } catch (error) {
        console.warn(`⚠️  Error parsing article ${index}:`, error);
      }
    });

    return articles;
  } catch (error) {
    console.error('❌ Error scraping articles:', error);
    throw error;
  }
}

/**
 * Synchroniser les articles avec la base de données
 */
async function syncArticlesToDatabase(supabaseClient: any, articles: ScrapedArticle[]) {
  console.log(`\n📦 Syncing ${articles.length} articles to database...`);

  let inserted = 0;
  let updated = 0;
  let errors = 0;

  for (const article of articles) {
    try {
      // Vérifier si l'article existe déjà (par titre)
      const { data: existing, error: checkError } = await supabaseClient
        .from('news_articles')
        .select('id, title')
        .eq('title', article.title)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existing) {
        // Mettre à jour l'article existant
        const { error: updateError } = await supabaseClient
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
        const { error: insertError } = await supabaseClient
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
    } catch (error: any) {
      console.error(`❌ Error syncing article "${article.title}":`, error.message);
      errors++;
    }
  }

  return { inserted, updated, errors, total: articles.length };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    console.log('🚀 Starting article synchronization from siportevent.com');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Scraper les articles
    const articles = await scrapeArticles();

    if (articles.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'No articles found to sync',
          stats: { inserted: 0, updated: 0, errors: 0, total: 0 }
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
          status: 200,
        }
      );
    }

    // Synchroniser avec la base de données
    const stats = await syncArticlesToDatabase(supabaseClient, articles);

    console.log(`\n📊 Sync Summary:`);
    console.log(`   ✨ Inserted: ${stats.inserted}`);
    console.log(`   🔄 Updated: ${stats.updated}`);
    console.log(`   ❌ Errors: ${stats.errors}`);
    console.log(`   📝 Total: ${stats.total}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Synchronization completed successfully',
        stats
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('❌ Synchronization failed:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error',
        details: error.toString()
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500,
      }
    );
  }
});

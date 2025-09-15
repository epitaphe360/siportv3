// Test script for news scraping service
// This will be run in the browser context where DOMParser is available

// Mock DOMParser for Node.js environment
if (typeof DOMParser === 'undefined') {
  global.DOMParser = class DOMParser {
    parseFromString(str, contentType) {
      // Simple HTML parser for testing
      const doc = {
        querySelector: (selector) => {
          // Mock implementation
          return null;
        },
        querySelectorAll: (selector) => {
          // Mock implementation
          return [];
        }
      };
      return doc;
    }
  };
}

// Mock fetch for Node.js
if (typeof fetch === 'undefined') {
  global.fetch = async (url, options) => {
    const https = await import('https');
    const http = await import('http');

    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https:') ? https : http;
      const req = protocol.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          resolve({
            ok: res.statusCode === 200,
            status: res.statusCode,
            statusText: res.statusMessage,
            text: () => Promise.resolve(data)
          });
        });
      });
      req.on('error', reject);
    });
  };
}

async function testNewsScraping() {
  console.log('📰 Testing news scraping from siportevent.com...');

  try {
    // Direct fetch test first
    console.log('📡 Fetching website content...');
    const response = await fetch('https://siportevent.com/actualite-portuaire/', {
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
    console.log(`✅ Fetched ${html.length} characters of HTML`);

    // Parse HTML for articles
    console.log('🔍 Parsing HTML for articles...');
    const articles = parseArticlesFromHTML(html);

    console.log(`📝 Found ${articles.length} articles:`);
    articles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title}`);
      console.log(`   📅 Date: ${article.date}`);
      console.log(`   🔗 URL: ${article.url}`);
      console.log(`   📖 Excerpt: ${article.excerpt?.substring(0, 100)}...`);
      console.log('---');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

function parseArticlesFromHTML(html) {
  const articles = [];

  try {
    // Look for Elementor post structures
    const postPatterns = [
      // Elementor post items
      /<div[^>]*class="[^"]*elementor-post[^"]*"[^>]*>(.*?)<\/div>/gs,
      // Generic post containers
      /<article[^>]*>(.*?)<\/article>/gs,
      // Post class containers
      /<div[^>]*class="[^"]*post[^"]*"[^>]*>(.*?)<\/div>/gs
    ];

    let allMatches = [];

    postPatterns.forEach(pattern => {
      const matches = html.match(pattern);
      if (matches) {
        allMatches = allMatches.concat(matches);
      }
    });

    console.log(`Found ${allMatches.length} potential post containers`);

    // Extract article info from each match
    allMatches.slice(0, 10).forEach((match, index) => {
      try {
        const article = extractArticleInfo(match, index);
        if (article && article.title) {
          articles.push(article);
        }
      } catch (error) {
        console.warn(`Error parsing article ${index}:`, error.message);
      }
    });

    // If no structured articles found, look for links
    if (articles.length === 0) {
      console.log('No structured articles found, looking for links...');
      const linkPattern = /<a[^>]*href="([^"]*(?:actualite|news|article)[^"]*)"[^>]*>([^<]+)<\/a>/gi;
      let linkMatch;
      let linkCount = 0;

      while ((linkMatch = linkPattern.exec(html)) !== null && linkCount < 10) {
        const url = linkMatch[1];
        const title = linkMatch[2].replace(/<[^>]+>/g, '').trim();

        if (title && url) {
          articles.push({
            title: title.substring(0, 100),
            url: url.startsWith('http') ? url : `https://siportevent.com${url}`,
            date: 'Date inconnue',
            excerpt: 'Contenu à charger depuis la page individuelle'
          });
          linkCount++;
        }
      }
    }

  } catch (error) {
    console.error('Error parsing HTML:', error);
  }

  return articles;
}

function extractArticleInfo(html, index) {
  try {
    // Extract title
    const titlePatterns = [
      /<h[1-6][^>]*>(.*?)<\/h[1-6]>/i,
      /<div[^>]*class="[^"]*title[^"]*"[^>]*>(.*?)<\/div>/i,
      /<span[^>]*class="[^"]*title[^"]*"[^>]*>(.*?)<\/span>/i
    ];

    let title = '';
    for (const pattern of titlePatterns) {
      const match = html.match(pattern);
      if (match) {
        title = match[1].replace(/<[^>]+>/g, '').trim();
        if (title) break;
      }
    }

    // Extract URL
    const urlPatterns = [
      /<a[^>]*href="([^"]+)"[^>]*>/i,
      /href="([^"]*(?:actualite|news|article)[^"]*)"/i
    ];

    let url = '';
    for (const pattern of urlPatterns) {
      const match = html.match(pattern);
      if (match) {
        url = match[1];
        if (url && !url.startsWith('http')) {
          url = `https://siportevent.com${url}`;
        }
        break;
      }
    }

    // Extract date
    const datePatterns = [
      /<time[^>]*>(.*?)<\/time>/i,
      /<span[^>]*class="[^"]*date[^"]*"[^>]*>(.*?)<\/span>/i,
      /\b\d{1,2}\/\d{1,2}\/\d{4}\b/,
      /\b\d{4}-\d{2}-\d{2}\b/
    ];

    let date = 'Date inconnue';
    for (const pattern of datePatterns) {
      const match = html.match(pattern);
      if (match) {
        date = match[1] || match[0];
        break;
      }
    }

    // Extract excerpt
    const excerptPatterns = [
      /<p[^>]*>(.*?)<\/p>/i,
      /<div[^>]*class="[^"]*excerpt[^"]*"[^>]*>(.*?)<\/div>/i,
      /<div[^>]*class="[^"]*summary[^"]*"[^>]*>(.*?)<\/div>/i
    ];

    let excerpt = '';
    for (const pattern of excerptPatterns) {
      const match = html.match(pattern);
      if (match) {
        excerpt = match[1].replace(/<[^>]+>/g, '').trim();
        if (excerpt.length > 50) break;
      }
    }

    return {
      title: title || `Article ${index + 1}`,
      url: url || 'https://siportevent.com/actualite-portuaire/',
      date,
      excerpt: excerpt || 'Description non disponible'
    };

  } catch (error) {
    console.warn('Error extracting article info:', error);
    return null;
  }
}

testNewsScraping();

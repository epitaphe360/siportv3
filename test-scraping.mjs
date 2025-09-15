async function testWebsiteAccess() {
  console.log('Testing access to siportevent.com/actualite-portuaire...');

  try {
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
    console.log(`✅ Successfully fetched website content (${html.length} characters)`);

    // Check for basic HTML structure
    console.log('🔍 Analyzing HTML structure...');

    // Look for titles
    const titleMatches = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatches) {
      console.log(`📄 Page title: ${titleMatches[1]}`);
    }

    // Look for article-like content
    const articlePatterns = [
      /<article[^>]*>[\s\S]*?<\/article>/gi,
      /<div[^>]*class="[^"]*post[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
      /<div[^>]*class="[^"]*entry[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
      /<h[1-3][^>]*>[\s\S]*?<\/h[1-3]>/gi
    ];

    let totalFound = 0;
    articlePatterns.forEach((pattern, index) => {
      const matches = html.match(pattern);
      if (matches) {
        console.log(`📝 Pattern ${index + 1} found ${matches.length} matches`);
        totalFound += matches.length;

        // Show first match preview
        if (matches[0]) {
          const preview = matches[0].substring(0, 200).replace(/<[^>]+>/g, '').trim();
          console.log(`   Preview: ${preview}...`);
        }
      }
    });

    if (totalFound === 0) {
      console.log('⚠️  No structured articles found, looking for links...');

      // Look for links that might be articles
      const linkPattern = /<a[^>]*href="([^"]*(?:actualite|news|article)[^"]*)"[^>]*>([^<]+)<\/a>/gi;
      const linkMatches = html.match(linkPattern);

      if (linkMatches) {
        console.log(`🔗 Found ${linkMatches.length} potential article links`);
        linkMatches.slice(0, 5).forEach((match, index) => {
          const linkMatch = match.match(/href="([^"]+)"/);
          const textMatch = match.match(/>([^<]+)</);
          if (linkMatch && textMatch) {
            console.log(`   Link ${index + 1}: ${textMatch[1].trim().substring(0, 50)}...`);
            console.log(`   URL: ${linkMatch[1]}`);
          }
        });
      } else {
        console.log('❌ No article links found either');
      }
    }

    console.log('✅ Website access and analysis test completed');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testWebsiteAccess();

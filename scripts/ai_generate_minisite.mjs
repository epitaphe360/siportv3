#!/usr/bin/env node
import fetch from 'node-fetch';
import { load } from 'cheerio';

async function fetchHtml(url) {
  const res = await fetch(url, { redirect: 'follow', timeout: 15000 });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
  return await res.text();
}

function extractMeta(html, baseUrl) {
  const $ = load(html);
  const title = $('head > title').text() || $('meta[property="og:site_name"]').attr('content') || '';
  const description = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';
  const ogImage = $('meta[property="og:image"]').attr('content') || $('link[rel="image_src"]').attr('href') || '';
  const images = [];
  $('img').each((i, el) => {
    const src = $(el).attr('src');
    try { if (src && images.length < 6) images.push(new URL(src, baseUrl).toString()); } catch (e) { /* ignore */ }
  });

  const bodyText = $('body').text();
  const emailMatch = bodyText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const phoneMatch = bodyText.match(/\+?[0-9][0-9 ()-]{6,}[0-9]/);

  return { title, description, ogImage, images, email: emailMatch?.[0] || null, phone: phoneMatch?.[0] || null };
}

function buildSections(meta, url) {
  const hero = { type: 'hero', content: { company: meta.title || url, description: meta.description || '', logo: meta.ogImage || (meta.images[0] || '') } };
  const about = { type: 'about', content: { title: 'À propos', description: meta.description || '' } };
  const contact = { type: 'contact', content: { email: meta.email || '', phone: meta.phone || '', website: url } };
  const products = { type: 'products', content: { products: [] } };
  return [hero, products, about, contact];
}

async function main() {
  const url = process.argv[2];
  if (!url) {
    console.error('Usage: node scripts/ai_generate_minisite.mjs <url>');
    process.exit(2);
  }
  try {
    const html = await fetchHtml(url);
    const meta = extractMeta(html, url);
    const sections = buildSections(meta, url);
    const payload = {
      company: meta.title || url,
      logo: meta.ogImage || (meta.images[0] || ''),
      description: meta.description || '',
      products: [],
      socials: [],
      documents: [],
      contact: { email: meta.email, phone: meta.phone, website: url },
      sections,
      sourceUrl: url,
    };
    console.log(JSON.stringify(payload, null, 2));
  } catch (err) {
    console.error('Error generating mini-site:', err.message || err);
    process.exit(1);
  }
}

// Execute when run as a script
main();

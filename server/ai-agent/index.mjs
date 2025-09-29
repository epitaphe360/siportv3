import express from 'express';
import bodyParser from 'body-parser';
import { execFile, execFileSync } from 'child_process';
import path from 'path';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const app = express();
app.use(bodyParser.json());

// Expose a server-side helper that other server processes can call via globalThis.__runLocalAiCliFallback
// This function runs the local CLI generator synchronously and returns parsed JSON or null on failure.
globalThis.__runLocalAiCliFallback = async function (websiteUrl) {
  try {
    const scriptPath = path.resolve(process.cwd(), 'scripts', 'ai_generate_minisite.mjs');
    // execFileSync returns stdout as string when encoding is set
    const stdout = execFileSync(process.execPath, [scriptPath, websiteUrl], { encoding: 'utf8', timeout: 30000 });
    if (!stdout) return null;
    try {
      return JSON.parse(stdout);
    } catch (e) {
      console.warn('Global CLI fallback produced invalid JSON:', e, stdout);
      return null;
    }
  } catch (err) {
    console.warn('Global CLI fallback error', err?.message || err);
    return null;
  }
};

// Simple CORS + API key protection middleware
app.use((req, res, next) => {
  // Allow local dev origins; adjust in production
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000').split(',');
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-ai-agent-key');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.post('/generate', async (req, res) => {
  // If AI_AGENT_KEY is set in environment, require clients to present the same header
  const requiredKey = process.env.AI_AGENT_KEY || null;
  if (requiredKey) {
    const incoming = req.headers['x-ai-agent-key'] || req.headers['x-ai-agent-key'.toLowerCase()];
    if (!incoming || String(incoming) !== String(requiredKey)) {
      return res.status(401).json({ error: 'unauthorized' });
    }
  }
  const { url } = req.body || {};
  if (!url) return res.status(400).json({ error: 'url required' });

  const scriptPath = path.resolve(process.cwd(), 'scripts', 'ai_generate_minisite.mjs');
  execFile(process.execPath, [scriptPath, url], { timeout: 30000 }, (err, stdout, stderr) => {
    if (err) {
      console.error('agent error', err, stderr);
      return res.status(500).json({ error: 'agent failed', detail: stderr || err.message });
    }
    (async () => {
      try {
        let payload = JSON.parse(stdout);

        // Optional enrichment via external Groq-like API
        const groqKey = process.env.GROQ_API_KEY;
        const groqUrl = process.env.GROQ_API_URL; // e.g. https://api.groq.com/v1/enrich
        if (groqKey && groqUrl) {
          try {
            const r = await fetch(groqUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${groqKey}`
              },
              body: JSON.stringify({ url, payload })
            });
            if (r.ok) {
              const enriched = await r.json();
              payload = enriched.payload || enriched;
              console.log('Payload enriched via GROQ endpoint');
            } else {
              console.warn('GROQ enrichment failed', r.status, await r.text());
            }
          } catch (e) {
            console.warn('GROQ enrichment error', e?.message || e);
          }
        }

        // Optional OpenAI enrichment: produce richer sections if OPENAI_API_KEY is set
        const OPENAI_KEY = process.env.OPENAI_API_KEY;
        if (OPENAI_KEY) {
          try {
            const systemPrompt = `You are a helpful assistant that transforms a scraped mini-site payload into a richer JSON payload suitable for the application's mini_sites model. Return only valid JSON. Preserve keys you don't change.`;
            const userPrompt = `Input payload:\n${JSON.stringify(payload, null, 2)}\n\nReturn a JSON object that may add or replace a top-level \"sections\" array (each section must have a title and content) and may enrich product descriptions. Keep keys: company, logo, description, products, contacts, sections.`;

            const openaiResp = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_KEY}`
              },
              body: JSON.stringify({
                model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
                messages: [
                  { role: 'system', content: systemPrompt },
                  { role: 'user', content: userPrompt }
                ],
                temperature: 0.7,
                max_tokens: 800
              })
            });

            if (openaiResp.ok) {
              const j = await openaiResp.json();
              const text = j.choices?.[0]?.message?.content;
              if (text) {
                try {
                  const enriched = JSON.parse(text);
                  // merge enriched keys into payload shallowly
                  payload = Object.assign({}, payload, enriched);
                  console.log('Payload enriched via OpenAI');
                } catch (e) {
                  console.warn('OpenAI returned non-JSON or unparsable JSON; skipping parsing');
                }
              }
            } else {
              console.warn('OpenAI enrichment failed', openaiResp.status, await openaiResp.text());
            }
          } catch (e) {
            console.warn('OpenAI enrichment error', e?.message || e);
          }
        }

        // Optional image upload to Supabase Storage when SUPABASE_SERVICE_ROLE_KEY and SUPABASE_URL are set
        const SUPABASE_URL = process.env.SUPABASE_URL;
        const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || 'mini-sites';
        if (SUPABASE_URL && SUPABASE_KEY) {
          try {
            const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

            // helper: detect image URL by extension
            const isImageUrl = (u) => typeof u === 'string' && /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(u);

            // recursively find and replace image URLs in payload
            const downloaded = new Map();
            async function replaceImages(obj) {
              if (!obj || typeof obj !== 'object') return obj;
              if (Array.isArray(obj)) {
                for (let i = 0; i < obj.length; i++) {
                  obj[i] = await replaceImages(obj[i]);
                }
                return obj;
              }
              for (const k of Object.keys(obj)) {
                const v = obj[k];
                if (typeof v === 'string' && isImageUrl(v)) {
                  const remote = v;
                  if (downloaded.has(remote)) {
                    obj[k] = downloaded.get(remote);
                    continue;
                  }
                  try {
                    const r = await fetch(remote, { timeout: 20000 });
                    if (!r.ok) throw new Error('failed to download image ' + r.status);
                    const buffer = await r.buffer();
                    const extMatch = remote.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
                    const ext = extMatch ? extMatch[1] : 'jpg';
                    const hash = crypto.createHash('sha1').update(remote).digest('hex').slice(0, 12);
                    const filename = `${Date.now()}-${hash}.${ext}`;
                    const destPath = `mini-sites/${filename}`;
                    const up = await supabase.storage.from(SUPABASE_BUCKET).upload(destPath, buffer, { contentType: r.headers.get('content-type') || `image/${ext}`, upsert: true });
                    if (up.error) {
                      console.warn('Supabase upload error', up.error.message || up.error);
                      // keep original remote URL on failure
                      obj[k] = remote;
                      downloaded.set(remote, remote);
                    } else {
                      const pub = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(destPath);
                      const publicUrl = pub?.data?.publicUrl || remote;
                      obj[k] = publicUrl;
                      downloaded.set(remote, publicUrl);
                    }
                  } catch (e) {
                    console.warn('Image download/upload error', e?.message || e);
                    obj[k] = v;
                  }
                } else if (typeof v === 'object' && v !== null) {
                  obj[k] = await replaceImages(v);
                }
              }
              return obj;
            }

            payload = await replaceImages(payload);
            console.log('Image upload step complete (if any images found)');
          } catch (e) {
            console.warn('Supabase image upload error', e?.message || e);
          }
        }

        return res.json(payload);
      } catch (e) {
        return res.status(500).json({ error: 'invalid agent output', detail: stdout });
      }
    })();
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`AI agent listening on http://localhost:${PORT}`));

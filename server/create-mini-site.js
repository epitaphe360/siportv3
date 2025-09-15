// create-mini-site.js
// Endpoint Express pour créer un mini-site en utilisant la clé de service Supabase.
// Usage: définir SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans l'environnement.

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PORT = process.env.PORT || 4000;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

app.post('/create-mini-site', async (req, res) => {
  try {
    const { company, description, logoUrl, products, socials, documents, exhibitorId, userId } = req.body;
    if (!company && !exhibitorId) {
      return res.status(400).json({ success: false, error: 'company or exhibitorId required' });
    }

    let finalExhibitorId = exhibitorId || null;

    if (!finalExhibitorId) {
      // Create exhibitor (service role can do this regardless of RLS)
      const exhibitorInsert = {
        company_name: company || 'Sans nom',
        description: description || null,
        logo_url: logoUrl || null,
        contact_info: {},
      };
      if (userId) exhibitorInsert.user_id = userId;

      const { data: exData, error: exErr } = await supabaseAdmin
        .from('exhibitors')
        .insert([exhibitorInsert])
        .select()
        .single();

      if (exErr) throw exErr;
      finalExhibitorId = exData.id;
    }

    const sections = [
      { type: 'hero', content: { company, description, logo: logoUrl } },
      { type: 'products', content: { products } },
      { type: 'socials', content: { socials } },
      { type: 'documents', content: { documents } },
    ];

    const miniSiteInsert = {
      exhibitor_id: finalExhibitorId,
      theme: 'default',
      custom_colors: {},
      sections,
      published: false,
      views: 0,
      last_updated: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    const { data: msData, error: msErr } = await supabaseAdmin
      .from('mini_sites')
      .insert([miniSiteInsert])
      .select()
      .single();

    if (msErr) throw msErr;

    return res.json({ success: true, miniSite: msData, exhibitorId: finalExhibitorId });
  } catch (err) {
    console.error('create-mini-site error:', err);
    return res.status(500).json({ success: false, error: (err && err.message) || String(err) });
  }
});

app.listen(PORT, () => console.log(`create-mini-site server listening on ${PORT}`));

/* Minimal exhibitors server for public access
   Usage: set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, EXHIBITORS_SECRET and run:
     node server/exhibitors-server.js
*/

const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

const PORT = process.env.EXHIBITORS_PORT || 4002;
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const EXHIBITORS_SECRET = process.env.EXHIBITORS_SECRET || process.env.VITE_EXHIBITORS_SECRET || 'dev-secret';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(express.json());

app.get('/exhibitors', async (req, res) => {
  const secret = req.headers['x-exhibitors-secret'] || req.query.secret;
  if (secret !== EXHIBITORS_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { data: exhibitors, error } = await supabase
      .from('exhibitors')
      .select('*, user:users(*), products(*), mini_site:mini_sites(*)')
      .eq('verified', true); // Only show verified exhibitors

    if (error) {
      throw error;
    }

    res.json({ exhibitors });
  } catch (err) {
    console.error('Error fetching exhibitors:', err);
    res.status(500).json({ error: 'Error fetching exhibitors' });
  }
});

app.listen(PORT, () => {
  console.log(`Exhibitors server listening on http://localhost:${PORT}`);
});

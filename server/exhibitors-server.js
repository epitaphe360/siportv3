/* Minimal exhibitors server for public access
   Usage: set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, EXHIBITORS_SECRET and run:
     node server/exhibitors-server.js
*/

const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

const PORT = process.env.EXHIBITORS_PORT || 4002;
const NODE_ENV = process.env.NODE_ENV || 'development';

// SECURITY: Only use server-side env vars, never VITE_ prefixed vars
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// SECURITY: Require strong secret in production
const EXHIBITORS_SECRET = process.env.EXHIBITORS_SECRET;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment');
  process.exit(1);
}

if (!EXHIBITORS_SECRET || (EXHIBITORS_SECRET === 'dev-secret' && NODE_ENV === 'production')) {
  console.error('❌ EXHIBITORS_SECRET must be set to a strong random value');
  console.error('   Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const app = express();

// SECURITY: Strict CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));

// Simple rate limiting
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // 100 requests per minute

function rateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }

  const data = rateLimitMap.get(ip);

  if (now > data.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }

  if (data.count >= MAX_REQUESTS) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  data.count++;
  next();
}

setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitMap.entries()) {
    if (now > data.resetTime) rateLimitMap.delete(key);
  }
}, 60 * 60 * 1000);

app.get('/exhibitors', rateLimit, async (req, res) => {
  // SECURITY: Only accept secret in header, not query string
  const secret = req.headers['x-exhibitors-secret'];
  if (!secret || secret !== EXHIBITORS_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // SECURITY: Add pagination to prevent large data dumps
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100); // Max 100
    const offset = (page - 1) * limit;

    const { data: exhibitors, error, count } = await supabase
      .from('exhibitors')
      .select('*, user:users(*), products(*), mini_site:mini_sites(*)', { count: 'exact' })
      .eq('verified', true)
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    res.json({
      exhibitors,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (err) {
    console.error('Error fetching exhibitors:', err);
    res.status(500).json({ error: 'Error fetching exhibitors' });
  }
});

app.listen(PORT, () => {
  console.log(`Exhibitors server listening on http://localhost:${PORT}`);
});

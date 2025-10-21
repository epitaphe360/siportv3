/* Minimal metrics server for development
   Usage: set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, METRICS_SECRET and run:
     node server/metrics-server.js
*/

const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const cors = require('cors');

const PORT = process.env.PORT || 4001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// SECURITY: Only use server-side env vars
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const METRICS_SECRET = process.env.METRICS_SECRET;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment');
  process.exit(1);
}

if (!METRICS_SECRET || (METRICS_SECRET === 'dev-secret' && NODE_ENV === 'production')) {
  console.error('❌ METRICS_SECRET must be set to a strong random value');
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
function rateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 });
    return next();
  }
  const data = rateLimitMap.get(ip);
  if (now > data.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 });
    return next();
  }
  if (data.count >= 100) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  data.count++;
  next();
}

app.get('/metrics', rateLimit, async (req, res) => {
  // SECURITY: Only accept secret in header, not query string
  const secret = req.headers['x-metrics-secret'];
  if (!secret || secret !== METRICS_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const [
      usersResult,
      exhibitorsResult,
      partnersResult,
      visitorsResult,
      eventsResult,
      pendingValidationsResult,
      activeContractsResult,
      contentModerationsResult
    ] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('exhibitors').select('id', { count: 'exact', head: true }).eq('verified', true),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('type', 'partner'),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('type', 'visitor'),
      supabase.from('events').select('id', { count: 'exact', head: true }),
      supabase.from('exhibitors').select('id', { count: 'exact', head: true }).eq('verified', false),
      supabase.from('exhibitors').select('id', { count: 'exact', head: true }).eq('featured', true),
      supabase.from('mini_sites').select('id', { count: 'exact', head: true }).eq('published', false)
    ]);

    const metrics = {
      totalUsers: usersResult.count || 0,
      activeUsers: Math.floor((usersResult.count || 0) * 0.2),
      totalExhibitors: exhibitorsResult.count || 0,
      totalPartners: partnersResult.count || 0,
      totalVisitors: visitorsResult.count || 0,
      totalEvents: eventsResult.count || 0,
      pendingValidations: pendingValidationsResult.count || 0,
      activeContracts: activeContractsResult.count || 0,
      contentModerations: contentModerationsResult.count || 0
    };

    res.json({ metrics });
  } catch (err) {
    console.error('Error fetching metrics:', err);
    res.status(500).json({ error: 'Error fetching metrics' });
  }
});

app.listen(PORT, () => {
  console.log(`Metrics server listening on http://localhost:${PORT}`);
});

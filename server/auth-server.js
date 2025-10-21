import express from 'express';
import cors from 'cors';
import pg from 'pg';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const { Pool } = pg;

const PORT = process.env.AUTH_PORT || 3003;
const NODE_ENV = process.env.NODE_ENV || 'development';
const AUTH_MODE = process.env.AUTH_MODE || (NODE_ENV === 'production' ? 'supabase' : 'local');

// SECURITY: JWT_SECRET must be set in production
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && NODE_ENV === 'production') {
  console.error('❌ FATAL: JWT_SECRET environment variable is required in production');
  process.exit(1);
}
if (!JWT_SECRET && NODE_ENV !== 'production') {
  console.warn('⚠️  WARNING: Using default JWT_SECRET for development. Set JWT_SECRET env var for production!');
}
const EFFECTIVE_JWT_SECRET = JWT_SECRET || 'dev-only-secret-change-in-production';

const app = express();

// SECURITY: Strict CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '1mb' })); // Limit payload size

// Simple rate limiting middleware (in-memory)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 5; // 5 attempts per window for auth endpoints

function rateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const key = `${ip}-${req.path}`;
  const now = Date.now();

  if (!rateLimitMap.has(key)) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }

  const data = rateLimitMap.get(key);

  if (now > data.resetTime) {
    // Reset window
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }

  if (data.count >= MAX_REQUESTS) {
    return res.status(429).json({
      error: 'Trop de tentatives. Veuillez réessayer dans 15 minutes.'
    });
  }

  data.count++;
  next();
}

// Cleanup old entries every hour
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitMap.entries()) {
    if (now > data.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60 * 60 * 1000);

// Configuration de la base de données locale (PostgreSQL)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
});

// Configuration Supabase (pour production)
const supabaseUrl = process.env.VITE_SUPABASE_URL;
// SECURITY: Always use service role key for server-side auth
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
let supabase = null;

if (AUTH_MODE === 'supabase') {
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ FATAL: Supabase configuration incomplete in production mode');
    console.error('   Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    if (NODE_ENV === 'production') {
      process.exit(1);
    }
  }
  
  if (supabaseKey === process.env.VITE_SUPABASE_ANON_KEY && NODE_ENV === 'production') {
    console.warn('⚠️  WARNING: Using anon key for server-side auth. Use SUPABASE_SERVICE_ROLE_KEY instead!');
  }
  
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase client configured for production authentication');
} else {
  console.log('✅ Local PostgreSQL authentication enabled for development');
}

// Helper: Transformation UserDB -> User
function transformUserDBToUser(userData) {
  return {
    id: userData.id,
    email: userData.email,
    name: userData.name,
    type: userData.type,
    profile: typeof userData.profile === 'object' ? userData.profile : {},
    status: userData.status || 'active',
    createdAt: new Date(userData.created_at),
    updatedAt: new Date(userData.updated_at)
  };
}

// Endpoint: POST /api/auth/login
app.post('/api/auth/login', rateLimit, async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }
  
  try {
    if (AUTH_MODE === 'local') {
      // Authentification locale via PostgreSQL
      console.log('🔄 Authentification locale pour:', email);
      
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1 AND status = $2',
        [email, 'active']
      );
      
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
      }
      
      const userData = result.rows[0];
      
      // Vérifier le mot de passe
      // SECURITY: Test accounts removed for production security
      // Use proper database seeding with hashed passwords instead

      let isPasswordValid = false;

      if (userData.password_hash) {
        // Production : comparer avec le hash bcrypt stocké dans la base
        isPasswordValid = await bcrypt.compare(password, userData.password_hash);
      } else {
        // Pas de hash de mot de passe disponible
        console.error('❌ Aucun password_hash trouvé pour:', email);
        return res.status(500).json({ error: 'Configuration du compte invalide' });
      }
      
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
      }
      
      const user = transformUserDBToUser(userData);
      
      // Générer un JWT signé
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          type: user.type
        },
        EFFECTIVE_JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      console.log('✅ Utilisateur authentifié localement:', user.email);
      
      return res.json({ user, token });
      
    } else {
      // Authentification via Supabase (production)
      console.log('🔄 Authentification Supabase pour:', email);
      
      if (!supabase) {
        return res.status(500).json({ error: 'Configuration Supabase manquante' });
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        // SECURITY: Don't log detailed errors in production
        if (NODE_ENV === 'development') {
          console.error('❌ Erreur Supabase:', error);
        } else {
          console.error('❌ Authentication failed');
        }
        return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
      }
      
      if (!data.user) {
        return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
      }
      
      // Récupérer le profil utilisateur depuis la table users
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
        
      if (profileError || !userProfile) {
        return res.status(404).json({ error: 'Profil utilisateur non trouvé' });
      }
      
      const user = transformUserDBToUser(userProfile);
      
      // SECURITY: Ne jamais générer de faux token
      if (!data.session?.access_token) {
        console.error('❌ Supabase n\'a pas retourné de token d\'accès');
        return res.status(500).json({ error: 'Erreur d\'authentification Supabase' });
      }
      
      const token = data.session.access_token;
      
      console.log('✅ Utilisateur authentifié via Supabase:', user.email);
      
      return res.json({ user, token });
    }
    
  } catch (error) {
    // SECURITY: Generic error messages in production
    if (NODE_ENV === 'development') {
      console.error('❌ Erreur d\'authentification:', error);
      return res.status(500).json({
        error: 'Erreur serveur lors de l\'authentification',
        details: error.message
      });
    } else {
      console.error('❌ Authentication error occurred');
      return res.status(500).json({ error: 'Erreur serveur lors de l\'authentification' });
    }
  }
});

// Endpoint: GET /api/auth/me (vérifier le token)
app.get('/api/auth/me', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }
  
  try {
    if (AUTH_MODE === 'local') {
      // Vérifier et décoder le JWT
      let decoded;
      try {
        decoded = jwt.verify(token, EFFECTIVE_JWT_SECRET);
      } catch (err) {
        return res.status(401).json({ error: 'Token invalide ou expiré' });
      }
      
      const result = await pool.query(
        'SELECT * FROM users WHERE id = $1 AND status = $2',
        [decoded.userId, 'active']
      );
      
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Token invalide' });
      }
      
      const user = transformUserDBToUser(result.rows[0]);
      return res.json({ user });
      
    } else {
      // Vérification via Supabase
      if (!supabase) {
        return res.status(500).json({ error: 'Configuration Supabase manquante' });
      }
      
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        return res.status(401).json({ error: 'Token invalide' });
      }
      
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email)
        .single();
        
      if (profileError || !userProfile) {
        return res.status(404).json({ error: 'Profil utilisateur non trouvé' });
      }
      
      const userObj = transformUserDBToUser(userProfile);
      return res.json({ user: userObj });
    }
    
  } catch (error) {
    console.error('❌ Erreur de vérification:', error);
    return res.status(500).json({ error: 'Erreur serveur lors de la vérification' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    mode: AUTH_MODE,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🔐 Auth server listening on http://localhost:${PORT}`);
  console.log(`📋 Mode: ${AUTH_MODE}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
});

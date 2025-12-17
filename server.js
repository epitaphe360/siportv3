/**
 * Production server with CORS support for Railway deployment
 */
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// CORS middleware - Allow all origins for preflight
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Client-Info, Apikey');
  res.header('Access-Control-Max-Age', '86400');
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Security headers
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Serve static files from dist folder
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1y',
  etag: true
}));

// SPA fallback - serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Serving static files from ./dist`);
});

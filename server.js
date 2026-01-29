/**
 * Production server with CORS support for Railway deployment
 * Includes email sending via SMTP (nodemailer)
 */
import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Use port 3000 in development, 5000 in production
const PORT = process.env.PORT || (process.env.NODE_ENV === 'production' ? 5000 : 3000);

// JSON body parser for API endpoints
app.use(express.json());

// CORS middleware - Whitelist specific origins only
const allowedOrigins = [
  'http://localhost:5173', // Development
  'http://localhost:3000', // Development
  'https://siportevent.com', // Production
  'https://www.siportevent.com', // Production with www
  // Add your Railway deployment URL here when available
  // 'https://your-app.railway.app'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Check if origin is in whitelist
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }

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

// ============================================
// EMAIL CONFIGURATION (SMTP)
// ============================================
const smtpConfig = {
  host: process.env.SMTP_HOST || 'mail.siportevent.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER || 'contact@siportevent.com',
    pass: process.env.SMTP_PASS,
  }
  // TLS certificate validation enabled (secure default)
  // Removed: tls: { rejectUnauthorized: false }
};

// Create reusable transporter (only if SMTP_PASS is configured)
let transporter = null;
if (process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport(smtpConfig);
  console.log('📧 SMTP transporter configured for:', smtpConfig.host);
} else {
  console.warn('⚠️ SMTP_PASS not set - email sending disabled');
}

/**
 * API: Send Email
 * POST /api/send-email
 */
app.post('/api/send-email', async (req, res) => {
  if (!transporter) {
    return res.status(503).json({
      success: false,
      error: 'Email service not configured (SMTP_PASS missing)'
    });
  }

  try {
    const { to, subject, html, text, replyTo } = req.body;

    // Validation
    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, subject, and html or text'
      });
    }

    const mailOptions = {
      from: `"SIPORT 2026" <${process.env.SMTP_USER || 'contact@siportevent.com'}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      replyTo: replyTo || process.env.SMTP_USER,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Email sent:', { to, subject, messageId: info.messageId });

    res.json({
      success: true,
      messageId: info.messageId,
      message: 'Email sent successfully'
    });
  } catch (error) {
    console.error('❌ Email error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send email'
    });
  }
});

/**
 * API: Contact Form
 * POST /api/contact
 */
app.post('/api/contact', async (req, res) => {
  if (!transporter) {
    return res.status(503).json({
      success: false,
      error: 'Email service not configured'
    });
  }

  try {
    const { firstName, lastName, email, company, subject, message } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const subjectLabels = {
      exhibitor: 'Devenir exposant',
      visitor: 'S\'inscrire comme visiteur',
      partnership: 'Partenariat',
      support: 'Support technique',
      other: 'Autre'
    };

    const subjectLabel = subjectLabels[subject] || subject;

    // Email to admin
    const adminEmail = {
      from: `"SIPORT 2026" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL || 'contact@siportevent.com',
      replyTo: email,
      subject: `[Contact SIPORT] ${subjectLabel} - ${firstName} ${lastName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 20px; text-align: center;">
            <h1>Nouveau message de contact</h1>
          </div>
          <div style="padding: 20px; background: #f9fafb;">
            <p><strong>Nom:</strong> ${firstName} ${lastName}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${company ? `<p><strong>Entreprise:</strong> ${company}</p>` : ''}
            <p><strong>Sujet:</strong> ${subjectLabel}</p>
            <div style="background: white; padding: 15px; border-left: 4px solid #3b82f6; margin-top: 15px;">
              <p><strong>Message:</strong></p>
              <p style="white-space: pre-wrap;">${message}</p>
            </div>
          </div>
        </div>
      `,
    };

    // Confirmation email to user
    const userEmail = {
      from: `"SIPORT 2026" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'SIPORT 2026 - Votre message a bien été reçu',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 20px; text-align: center;">
            <h1>✅ Message bien reçu !</h1>
          </div>
          <div style="padding: 20px; background: #f9fafb;">
            <p>Bonjour ${firstName},</p>
            <p>Nous avons bien reçu votre message concernant : <strong>${subjectLabel}</strong></p>
            <p>Notre équipe vous répondra dans les <strong>24 à 48 heures ouvrées</strong>.</p>
            <div style="background: white; padding: 15px; border-left: 4px solid #3b82f6; margin-top: 15px;">
              <p><strong>Votre message:</strong></p>
              <p style="white-space: pre-wrap;">${message}</p>
            </div>
            <p style="margin-top: 20px;">Cordialement,<br><strong>L'équipe SIPORT 2026</strong></p>
          </div>
        </div>
      `,
    };

    // Send both emails
    await Promise.all([
      transporter.sendMail(adminEmail),
      transporter.sendMail(userEmail),
    ]);

    console.log('✅ Contact emails sent:', { from: email, subject: subjectLabel });

    res.json({
      success: true,
      message: 'Message envoyé avec succès'
    });
  } catch (error) {
    console.error('❌ Contact form error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'envoi du message'
    });
  }
});

/**
 * API: Health check
 * GET /api/health
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    email: transporter ? 'configured' : 'disabled',
    timestamp: new Date().toISOString()
  });
});

// Serve static files from dist folder
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1y',
  etag: true,
  setHeaders: (res, filePath) => {
    // Never cache HTML files (especially index.html)
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store'); // For Railway CDN
    } else if (filePath.endsWith('.js') || filePath.endsWith('.mjs')) {
      res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
      // JS files can be cached but with validation
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

// Specific handler for missing assets to avoid SPA fallback returning HTML
// This prevents the "MIME type" error by returning a 404 instead of index.html
app.get('/assets/*', (req, res) => {
  res.status(404).type('text/plain').send('Asset not found');
});

// SPA fallback - serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'), {
    // Ensure index.html is not cached when served via fallback
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store' // For Railway CDN
    }
  }, (err) => {
    if (err) {
      res.status(404).send('Not Found');
    }
  });
});

// Error handler to prevent connection resets
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).send('Internal Server Error');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Serving static files from ./dist`);
  console.log(`📧 Email API: ${transporter ? 'enabled' : 'disabled (set SMTP_PASS)'}`);
});

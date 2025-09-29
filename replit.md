# SIPORTS 2026 - Salon International des Ports

## Overview
This is a React + TypeScript application for the SIPORTS 2026 International Ports Exhibition platform. The application provides a comprehensive digital platform for exhibitors, visitors, partners, and organizers of the international ports exhibition in El Jadida, Morocco.

## Recent Changes
- **2025-09-29**: Architecture d'authentification unifiée implémentée
  - Backend Auth Server (port 3003) avec dual-mode dev/prod
  - Authentification JWT sécurisée avec bcrypt et jsonwebtoken
  - Support PostgreSQL local (dev) et Supabase Auth (prod)
  - 4 comptes de test opérationnels : admin, exposant, partenaire, visiteur
  - Frontend utilise endpoint backend au lieu de Supabase directement
- **2024-09-28**: Successfully configured for Replit environment
  - Updated Vite configuration to bind to 0.0.0.0:5000 for Replit compatibility
  - Configured frontend workflow for port 5000 with webview output
  - Verified application runs successfully with React frontend

## Project Architecture

### Frontend
- **Technology**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Framer Motion
- **State Management**: Zustand
- **Routing**: React Router DOM
- **UI Components**: Radix UI + Custom components
- **Development Server**: Vite dev server on port 5000

### Backend Services
The project includes multiple Express.js backend services:
- **`server/auth-server.js`** - Unified authentication server (port 3003) ⭐ REQUIRED
  - Dual-mode: PostgreSQL local (dev) / Supabase Auth (prod)
  - JWT-based authentication with 7-day expiry
  - Secure password verification with bcrypt
- `server/create-mini-site.js` - Mini-site creation service (port 4000)
- `server/exhibitors-server.js` - Exhibitor data fallback service (port 4002)
- `server/metrics-server.js` - Metrics API service (port 4001)

### External Services
- **Supabase**: Primary database and authentication (requires configuration)
- **Firebase**: Additional authentication options (requires configuration)

## User Preferences
- **Environment**: Configured for Replit cloud development
- **Port Configuration**: Frontend uses port 5000 (required for Replit webview)
- **Host Configuration**: Uses 0.0.0.0 to allow Replit proxy access

## Development Setup

### Current Configuration
- Frontend runs on port 5000 with Vite development server
- Configured for Replit environment with proper host settings
- All dependencies installed and ready

### Environment Variables
**Required for production:**
- `JWT_SECRET` - **MANDATORY** Strong secret key for JWT signing (server crashes if missing in prod)
- `SUPABASE_SERVICE_ROLE_KEY` - **MANDATORY** Supabase service role key for server-side auth
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key (for frontend)
- `AUTH_MODE` - Authentication mode: 'local' (dev) or 'supabase' (prod)
- `NODE_ENV` - Environment: 'development' or 'production'

**Development only:**
- `DATABASE_URL` - PostgreSQL connection string (for local auth mode)

**Optional:**
- Firebase configuration variables for Google authentication

**Security Notes:**
- Demo accounts (admin@siports.com, exposant@siports.com, etc.) only work in development mode
- Production requires proper password hashes in database
- Server validates all required secrets and crashes on missing configuration in production

### Available Scripts
- `npm run dev` - Start development server (configured workflow)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- Various server scripts for backend services

## Key Features
- ✅ **Mini-sites** for exhibitors with advanced editor
- ✅ **Product management** and catalogs  
- ✅ **Smart appointment system**
- ✅ **Detailed analytics** and performance tracking
- ✅ **AI-powered networking** with recommendations
- ✅ **Multi-language support** (French/English)
- ✅ **Responsive design** for mobile and desktop
- ✅ **Admin dashboard** for content moderation
- ✅ **Partner spaces** with premium branding

## Authentication - Comptes de Démonstration
Comptes de test disponibles (mot de passe: `demo123`):
- **Admin**: `admin@siports.com` - Gestion complète, validation comptes, analytics
- **Exposant**: `exposant@siports.com` - Mini-sites, gestion produits, RDV et networking
- **Partenaire**: `partenaire@siports.com` - Espaces VIP, branding premium, analytics ROI
- **Visiteur**: `visiteur@siports.com` - Navigation salon, networking IA, favoris et RDV

## Notes
- Application successfully loads and displays the main interface
- **Auth Server is REQUIRED** for login functionality
- JWT tokens expire after 7 days
- Backend services are optional for basic frontend functionality
- Ready for production deployment with proper environment variables
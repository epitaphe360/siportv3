# SIPORTS 2026 - Salon International des Ports

## Overview
This is a React + TypeScript application for the SIPORTS 2026 International Ports Exhibition platform. The application provides a comprehensive digital platform for exhibitors, visitors, partners, and organizers of the international ports exhibition in El Jadida, Morocco.

## Recent Changes
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

### Backend Services (Optional)
The project includes multiple Express.js backend services that can be run separately:
- `server/create-mini-site.js` - Mini-site creation service (port 4000)
- `server/exhibitors-server.js` - Exhibitor data fallback service (port 4002)
- `server/metrics-server.js` - Metrics API service (port 4001)
- `server/ai-agent/index.mjs` - AI agent for site generation (port 4001)

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
The application can run in demo mode without database configuration. For full functionality, configure:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- Firebase configuration variables for Google authentication

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

## Notes
- Application successfully loads and displays the main interface
- Ready for further development and configuration
- Backend services are optional for basic frontend functionality
- Deployment configuration will be set up after verification
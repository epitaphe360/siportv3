import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { BrowserRouter as Router } from 'react-router-dom';

// Kill any existing service worker that might be caching old assets
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
      console.log('Service Worker unregistered');
    }
  });
}

// Global error handler for chunk load errors that might escape React.lazy
window.addEventListener('error', (event) => {
  const errorMessage = event.message || (event.error && event.error.message) || '';
  const isChunkError = 
    errorMessage.includes('Failed to fetch dynamically imported module') ||
    errorMessage.includes('Loading chunk') ||
    errorMessage.includes('Unexpected token') || // Sometimes happens if HTML is returned instead of JS
    (event.error && event.error.name === 'ChunkLoadError');
    
  if (isChunkError) {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.localStorage.getItem('page-has-been-force-refreshed') || 'false'
    );
    
    if (!pageHasAlreadyBeenForceRefreshed) {
      console.warn('Global chunk error detected. Force refreshing...');
      window.localStorage.setItem('page-has-been-force-refreshed', 'true');
      const url = new URL(window.location.href);
      url.searchParams.set('t', Date.now().toString());
      window.location.replace(url.toString());
    }
  }
}, true);

// Handle unhandled promise rejections (dynamic imports are promises)
window.addEventListener('unhandledrejection', (event) => {
  const errorMessage = (event.reason && event.reason.message) || String(event.reason || '');
  if (errorMessage.includes('Failed to fetch') || errorMessage.includes('dynamically imported module')) {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.localStorage.getItem('page-has-been-force-refreshed') || 'false'
    );
    
    if (!pageHasAlreadyBeenForceRefreshed) {
      console.warn('Unhandled chunk rejection detected. Force refreshing...');
      window.localStorage.setItem('page-has-been-force-refreshed', 'true');
      const url = new URL(window.location.href);
      url.searchParams.set('t', Date.now().toString());
      window.location.replace(url.toString());
    }
  }
});

// Version check

// Supporte les deux shortcodes: [siports_networking] et [siports_exhibitor_dashboard]

// Trouve le conteneur pour WordPress OU le root local
const findMount = () =>
  document.getElementById('siports-networking-app') ||
  document.getElementById('siports-exhibitor-dashboard-app') ||
  document.getElementById('root');

// Track si déjà monté pour éviter les doubles montages
let isMounted = false;

const mount = (el: Element) => {
  if (isMounted) {
    console.warn('SIPORTS: Already mounted, skipping duplicate mount');
    return;
  }

  isMounted = true;
  ReactDOM.createRoot(el as HTMLElement).render(
    <React.StrictMode>
      <Router>
        <App />
      </Router>
    </React.StrictMode>
  );
};

const initial = findMount();
if (initial) {
  mount(initial);
} else {
  // Si Elementor insère le shortcode après coup, observer et monter dès apparition
  const observer = new MutationObserver(() => {
    const el = findMount();
    if (el) {
      observer.disconnect();
      mount(el);
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  console.warn("SIPORTS Plugin: conteneur non trouvé au chargement, en attente d'Elementor ou #root…");
}

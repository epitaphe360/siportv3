import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { BrowserRouter as Router } from 'react-router-dom';

// Supporte les deux shortcodes: [siports_networking] et [siports_exhibitor_dashboard]

// Trouve le conteneur pour WordPress OU le root local
const findMount = () =>
  document.getElementById('siports-networking-app') ||
  document.getElementById('siports-exhibitor-dashboard-app') ||
  document.getElementById('root');

const mount = (el: Element) => {
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

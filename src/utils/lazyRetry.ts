import { lazy, ComponentType } from 'react';

/**
 * A wrapper for React.lazy that handles chunk loading errors.
 * This happens when a new version of the app is deployed and the browser
 * tries to load an old chunk that no longer exists on the server.
 */
export const lazyRetry = (componentImport: () => Promise<{ default: ComponentType<any> }>) =>
  lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      // Don't log as error to avoid confusing users, just warn
      console.warn('Chunk load failed, attempting recovery:', error);
      
      // If any error occurs during lazy load, we assume it's a deployment mismatch
      // and force a hard refresh to get the latest version of the app.
      const lastRetry = window.sessionStorage.getItem('last-lazy-retry');
      const now = Date.now();
      
      // Only retry once every 5 seconds (reduced from 10)
      if (!lastRetry || (now - parseInt(lastRetry)) > 5000) {
        window.sessionStorage.setItem('last-lazy-retry', now.toString());
        console.warn('Deployment mismatch detected. Refreshing app...');
        
        // Unregister service workers before reloading
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then((registrations) => {
            for (const registration of registrations) {
              registration.unregister();
            }
          });
        }
        
        // Force refresh by appending a timestamp
        const url = new URL(window.location.href);
        url.searchParams.set('v', now.toString());
        window.location.replace(url.toString());
        
        // Return a promise that never resolves to keep Suspense active
        // and prevent ErrorBoundary from showing the error while reloading
        return new Promise<{ default: ComponentType<any> }>(() => {});
      }
      
      throw error;
    }
  });

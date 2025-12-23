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
      console.error('Critical load error:', error);
      
      // If any error occurs during lazy load, we assume it's a deployment mismatch
      // and force a hard refresh to get the latest version of the app.
      const lastRetry = window.sessionStorage.getItem('last-lazy-retry');
      const now = Date.now();
      
      // Only retry once every 10 seconds to avoid infinite loops
      if (!lastRetry || (now - parseInt(lastRetry)) > 10000) {
        window.sessionStorage.setItem('last-lazy-retry', now.toString());
        console.warn('Deployment mismatch detected. Refreshing app...');
        
        // Force refresh by appending a timestamp
        const url = new URL(window.location.href);
        url.searchParams.set('v', now.toString());
        window.location.replace(url.toString());
      }
      
      throw error;
    }
  });

import { lazy, ComponentType } from 'react';

/**
 * A wrapper for React.lazy that handles chunk loading errors.
 * This happens when a new version of the app is deployed and the browser
 * tries to load an old chunk that no longer exists on the server.
 */
export const lazyRetry = (componentImport: () => Promise<{ default: ComponentType<any> }>) =>
  lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.localStorage.getItem('page-has-been-force-refreshed') || 'false'
    );

    try {
      const component = await componentImport();
      // Reset the flag on successful load
      window.localStorage.setItem('page-has-been-force-refreshed', 'false');
      return component;
    } catch (error) {
      console.error('Lazy load error:', error);
      
      // In production, any error during dynamic import is likely a chunk load error
      if (!pageHasAlreadyBeenForceRefreshed) {
        console.warn('Chunk load error detected. Force refreshing page...');
        window.localStorage.setItem('page-has-been-force-refreshed', 'true');
        
        // Use location.replace with a cache-busting timestamp
        const url = new URL(window.location.href);
        url.searchParams.set('t', Date.now().toString());
        window.location.replace(url.toString());
        
        // Return a dummy component while the page reloads
        return { default: () => null } as any;
      }

      // If we already refreshed and it still fails, it might be a real error
      console.error('Page was already refreshed but error persists. Throwing error.');
      throw error;
    }
  });

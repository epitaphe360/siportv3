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
      return await componentImport();
    } catch (error) {
      console.error('Lazy load error:', error);
      
      // Check if it's a chunk load error
      const isChunkLoadError = 
        error instanceof Error && 
        (error.message.includes('fetch') || 
         error.message.includes('Loading chunk') || 
         error.message.includes('dynamically imported module'));

      if (isChunkLoadError && !pageHasAlreadyBeenForceRefreshed) {
        console.warn('Chunk load error detected. Force refreshing...');
        window.localStorage.setItem('page-has-been-force-refreshed', 'true');
        
        // Add a timestamp to bypass any potential intermediate caches
        const url = new URL(window.location.href);
        url.searchParams.set('t', Date.now().toString());
        window.location.replace(url.toString());
        
        return { default: () => null } as any;
      }

      throw error;
    }
  });

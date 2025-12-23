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
      window.localStorage.setItem('page-has-been-force-refreshed', 'false');
      return component;
    } catch (error) {
      console.error('Chunk load error detected:', error);
      
      if (!pageHasAlreadyBeenForceRefreshed) {
        console.warn('Force refreshing page to fetch latest assets...');
        // We force a refresh only once to avoid infinite loops
        window.localStorage.setItem('page-has-been-force-refreshed', 'true');
        window.location.reload();
        return { default: () => null } as any;
      }

      console.error('Page was already refreshed but error persists. Throwing error.');
      throw error;
    }
  });

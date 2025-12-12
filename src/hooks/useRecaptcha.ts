import { useCallback, useEffect, useState } from 'react';

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

export interface UseRecaptchaReturn {
  executeRecaptcha: (action: string) => Promise<string>;
  isReady: boolean;
}

/**
 * Hook pour utiliser Google reCAPTCHA v3
 *
 * @returns {UseRecaptchaReturn} Fonction pour exécuter reCAPTCHA et statut de disponibilité
 *
 * @example
 * const { executeRecaptcha, isReady } = useRecaptcha();
 *
 * const handleSubmit = async () => {
 *   if (!isReady) {
 *     console.error('reCAPTCHA not ready');
 *     return;
 *   }
 *
 *   try {
 *     const token = await executeRecaptcha('submit_registration');
 *     // Envoyer le token au backend pour validation
 *     await api.register({ ...data, recaptchaToken: token });
 *   } catch (error) {
 *     console.error('reCAPTCHA error:', error);
 *   }
 * };
 */
export function useRecaptcha(): UseRecaptchaReturn {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Vérifier si le script reCAPTCHA est chargé
    if (typeof window !== 'undefined' && window.grecaptcha) {
      window.grecaptcha.ready(() => {
        setIsReady(true);
      });
    } else {
      // Attendre que le script soit chargé
      const checkRecaptcha = setInterval(() => {
        if (window.grecaptcha) {
          window.grecaptcha.ready(() => {
            setIsReady(true);
            clearInterval(checkRecaptcha);
          });
        }
      }, 100);

      // Cleanup après 10 secondes
      const timeout = setTimeout(() => {
        clearInterval(checkRecaptcha);
        console.warn('reCAPTCHA script failed to load within 10 seconds');
      }, 10000);

      return () => {
        clearInterval(checkRecaptcha);
        clearTimeout(timeout);
      };
    }
  }, []);

  const executeRecaptcha = useCallback(
    async (action: string): Promise<string> => {
      if (!isReady || !window.grecaptcha) {
        throw new Error('reCAPTCHA not ready');
      }

      try {
        const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });
        return token;
      } catch (error) {
        console.error('Error executing reCAPTCHA:', error);
        throw new Error('Failed to execute reCAPTCHA');
      }
    },
    [isReady]
  );

  return {
    executeRecaptcha,
    isReady,
  };
}

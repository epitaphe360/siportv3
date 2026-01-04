import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '../i18n/config';
import { allTranslations } from './translations';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
}

export const supportedLanguages: Language[] = [
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    rtl: false
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    rtl: false
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇲🇦',
    rtl: true
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    rtl: false
  }
];

interface LanguageState {
  currentLanguage: string;
  isLoading: boolean;
  
  // Actions
  setLanguage: (languageCode: string) => Promise<void>;
  getCurrentLanguage: () => Language;
  getAvailableLanguages: () => Language[];
  translateText: (key: string, fallback?: string) => string;
}

// Utiliser le dictionnaire de traductions enrichi
const translations = allTranslations;

// Vérification silencieuse des traductions
if (!translations || !translations.fr) {
  console.error('❌ ERREUR: Traductions non chargées!', { translations });
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      currentLanguage: 'fr',
      isLoading: false,

      setLanguage: async (languageCode: string) => {
        console.log('🌍 setLanguage appelé avec:', languageCode);
        set({ isLoading: true });

        try {
          // Vérifier que la langue est supportée
          const language = supportedLanguages.find(lang => lang.code === languageCode);
          if (!language) {
            throw new Error(`Langue non supportée: ${languageCode}`);
          }

          console.log('🌍 Langue trouvée:', language.nativeName);

          // Synchroniser avec i18next
          try {
            await i18n.changeLanguage(languageCode);
            console.log('🌍 i18next mis à jour');
          } catch (i18nError) {
            console.warn('⚠️ i18next changeLanguage failed (non-blocking):', i18nError);
          }

          // Mettre à jour la direction du texte pour l'arabe
          document.documentElement.dir = language.rtl ? 'rtl' : 'ltr';
          document.documentElement.lang = languageCode;
          
          // Mettre à jour le titre de la page
          const titleKey = 'hero.title';
          const translatedTitle = translations[languageCode]?.[titleKey] || translations.fr[titleKey] || 'SIPORTS';
          document.title = `${translatedTitle} - SIPORTS 2026`;

          // IMPORTANT: Mettre à jour l'état en dernier pour déclencher le re-render
          set({ currentLanguage: languageCode, isLoading: false });
          console.log('✅ Langue changée avec succès vers:', languageCode);
          
        } catch (_error) {
          console.error('❌ Erreur lors du changement de langue:', _error);
          set({ isLoading: false });
          throw _error;
        }
      },

      getCurrentLanguage: () => {
        const { currentLanguage } = get();
        return supportedLanguages.find(lang => lang.code === currentLanguage) || supportedLanguages[0];
      },

      getAvailableLanguages: () => {
        return supportedLanguages;
      },

      translateText: (key: string, fallback?: string) => {
        const { currentLanguage } = get();
        const languageTranslations = translations[currentLanguage] || translations.fr;
        
        // D'abord, essayer la clé telle quelle (pour 'nav.home' par exemple)
        if (key in languageTranslations) {
          return languageTranslations[key];
        }
        
        // Sinon, essayer comme clé imbriquée (pour compatibilité)
        const keys = key.split('.');
        let value: any = languageTranslations;
        
        for (const k of keys) {
          if (value && typeof value === 'object' && k in value) {
            value = value[k];
          } else {
            // Clé non trouvée, retourner fallback ou la clé
            if (key.startsWith('nav.')) {
              console.warn(`⚠️ Traduction manquante: ${key}`);
            }
            return fallback || key;
          }
        }
        
        // Retourner la valeur si c'est une chaîne, sinon fallback ou clé
        return typeof value === 'string' ? value : (fallback || key);
      }
    }),
    {
      name: 'siports-language-storage',
      partialize: (state) => ({ currentLanguage: state.currentLanguage })
    }
  )
);
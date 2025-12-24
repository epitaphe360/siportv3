import { useLanguageStore, supportedLanguages } from '../store/languageStore';
import { useCallback, useMemo } from 'react';

export const useTranslation = () => {
  // Récupérer la langue actuelle depuis le store (déclenche un re-render si elle change)
  const currentLanguage = useLanguageStore((state) => state.currentLanguage);
  const translateText = useLanguageStore((state) => state.translateText);
  
  // Fonction de traduction mémorisée
  const t = useCallback((key: string, fallback?: string) => {
    return translateText(key, fallback);
  }, [translateText]);
  
  // Trouver l'objet langue complet
  const currentLang = useMemo(() => {
    return supportedLanguages.find(lang => lang.code === currentLanguage) || supportedLanguages[0];
  }, [currentLanguage]);
  
  return {
    t,
    currentLanguage,
    currentLang,
    isRTL: currentLang.rtl
  };
};
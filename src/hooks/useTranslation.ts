import { useLanguageStore } from '../store/languageStore';

export const useTranslation = () => {
  const { translateText, getCurrentLanguage, currentLanguage } = useLanguageStore();
  
  const t = (key: string, fallback?: string) => {
    return translateText(key, fallback);
  };
  
  const currentLang = getCurrentLanguage();
  
  return {
    t,
    currentLanguage,
    currentLang,
    isRTL: currentLang.rtl
  };
};

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations as defaultTranslations } from '../constants/translations';

type Language = 'en' | 'zh';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string) => string;
  updateTranslation: (path: string, value: string, lang: Language) => void;
  resetTranslations: () => void;
  getAllTranslations: () => typeof defaultTranslations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [currentTranslations, setCurrentTranslations] = useState(defaultTranslations);

  // Initialize language preference
  useEffect(() => {
    // 1. Check LocalStorage first (User preference override)
    const savedLanguage = localStorage.getItem('app_language') as Language;
    
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'zh')) {
        setLanguageState(savedLanguage);
    } else {
        // 2. Fallback to Device Language
        const browserLang = navigator.language;
        if (browserLang.startsWith('zh')) {
            setLanguageState('zh');
            // Optionally save this inferred preference
            localStorage.setItem('app_language', 'zh');
        } else {
            setLanguageState('en');
        }
    }

    // Load custom translations
    const storedTranslations = localStorage.getItem('app_translations');
    if (storedTranslations) {
        try {
            const overrides = JSON.parse(storedTranslations);
            const mergeDeep = (target: any, source: any) => {
                const isObject = (obj: any) => obj && typeof obj === 'object';
                if (!isObject(target) || !isObject(source)) {
                    return source;
                }
                Object.keys(source).forEach(key => {
                    const targetValue = target[key];
                    const sourceValue = source[key];
                    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
                        target[key] = sourceValue;
                    } else if (isObject(targetValue) && isObject(sourceValue)) {
                        target[key] = mergeDeep(Object.assign({}, targetValue), sourceValue);
                    } else {
                        target[key] = sourceValue;
                    }
                });
                return target;
            };

            const merged = mergeDeep(JSON.parse(JSON.stringify(defaultTranslations)), overrides);
            setCurrentTranslations(merged);

        } catch (e) {
            console.error("Failed to parse stored translations", e);
        }
    }
  }, []);

  const setLanguage = (lang: Language) => {
      setLanguageState(lang);
      localStorage.setItem('app_language', lang);
  };

  const t = useCallback((path: string): string => {
    const keys = path.split('.');
    let current: any = currentTranslations[language];
    
    for (const key of keys) {
      if (current === undefined || current[key] === undefined) {
        let defaultCurrent: any = defaultTranslations[language];
        for (const k of keys) {
             if (defaultCurrent?.[k] !== undefined) {
                 defaultCurrent = defaultCurrent[k];
             } else {
                 return path;
             }
        }
        return defaultCurrent as string;
      }
      current = current[key];
    }
    
    return current as string;
  }, [currentTranslations, language]);

  const updateTranslation = (path: string, value: string, lang: Language) => {
      setCurrentTranslations(prev => {
          const newTranslations = JSON.parse(JSON.stringify(prev));
          const keys = path.split('.');
          let current = newTranslations[lang];
          
          for (let i = 0; i < keys.length - 1; i++) {
              if (!current[keys[i]]) current[keys[i]] = {};
              current = current[keys[i]];
          }
          current[keys[keys.length - 1]] = value;
          
          localStorage.setItem('app_translations', JSON.stringify(newTranslations));
          return newTranslations;
      });
  };

  const resetTranslations = () => {
      localStorage.removeItem('app_translations');
      setCurrentTranslations(defaultTranslations);
  };

  const getAllTranslations = () => currentTranslations;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, updateTranslation, resetTranslations, getAllTranslations }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

type Locale = 'en' | 'fr' | 'sw' | 'es' | 'yo' | 'ig' | 'ha' | 'ar';

const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
  sw: 'Swahili',
  es: 'Español',
  yo: 'Yorùbá',
  ig: 'Igbo',
  ha: 'Hausa',
  ar: 'العربية',
};

const LOCALE_FLAGS: Record<Locale, string> = {
  en: '🇬🇧',
  fr: '🇫🇷',
  sw: '🇰🇪',
  es: '🇪🇸',
  yo: '🇳🇬',
  ig: '🇳🇬',
  ha: '🇳🇬',
  ar: '🇸🇦',
};

const RTL_LOCALES: Locale[] = ['ar'];

type TranslationValue = string | { [key: string]: TranslationValue };
type Translations = Record<string, TranslationValue>;

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string>) => string;
  localeNames: Record<Locale, string>;
  localeFlags: Record<Locale, string>;
  locales: Locale[];
  loaded: boolean;
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextType | null>(null);

const translationsCache: Record<Locale, Translations | null> = {
  en: null,
  fr: null,
  sw: null,
  es: null,
  yo: null,
  ig: null,
  ha: null,
  ar: null,
};

async function loadTranslations(locale: Locale): Promise<Translations> {
  if (translationsCache[locale]) return translationsCache[locale]!;
  try {
    const mod = await import(`@/locales/${locale}.json`);
    translationsCache[locale] = mod.default;
    return mod.default;
  } catch {
    const mod = await import('@/locales/en.json');
    translationsCache[locale] = mod.default;
    return mod.default;
  }
}

function getNestedValue(obj: Translations, path: string): string {
  const keys = path.split('.');
  let current: TranslationValue = obj;
  for (const key of keys) {
    if (typeof current === 'object' && current !== null && key in current) {
      current = current[key];
    } else {
      return path;
    }
  }
  return typeof current === 'string' ? current : path;
}

function updateDocumentLocale(locale: Locale) {
  if (typeof document !== 'undefined') {
    const html = document.documentElement;
    html.lang = locale;
    html.dir = RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';
  }
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [loaded, setLoaded] = useState(false);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const init = async () => {
      const saved = localStorage.getItem('esell-locale') as Locale | null;
      if (saved && LOCALE_NAMES[saved]) {
        await loadTranslations(saved);
        await loadTranslations('en'); // Always preload English as fallback
        setLocaleState(saved);
        updateDocumentLocale(saved);
      } else {
        await loadTranslations('en');
        updateDocumentLocale('en');
      }
      setLoaded(true);
      forceUpdate((n) => n + 1);
    };
    init();
  }, []);

  const setLocale = useCallback(async (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('esell-locale', newLocale);
    await loadTranslations(newLocale);
    updateDocumentLocale(newLocale);
    forceUpdate((n) => n + 1);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string>): string => {
      const translations = translationsCache[locale] || translationsCache.en;
      if (!translations) return key;
      let value = getNestedValue(translations, key);
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          value = value.replace(`{${k}}`, v);
        });
      }
      return value;
    },
    [locale]
  );

  const locales = Object.keys(LOCALE_NAMES) as Locale[];
  const isRTL = RTL_LOCALES.includes(locale);

  // Don't render children until translations are loaded
  if (!loaded) {
    return null;
  }

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        t,
        localeNames: LOCALE_NAMES,
        localeFlags: LOCALE_FLAGS,
        locales,
        loaded,
        isRTL,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    return {
      locale: 'en' as Locale,
      setLocale: (_locale: Locale) => {},
      t: (key: string) => key,
      localeNames: {} as Record<Locale, string>,
      localeFlags: {} as Record<Locale, string>,
      locales: [] as Locale[],
      loaded: false,
      isRTL: false,
    };
  }
  return context;
}

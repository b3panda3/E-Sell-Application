'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

type Locale = 'en' | 'fr' | 'sw' | 'es' | 'yo' | 'ig' | 'ha';

const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
  sw: 'Swahili',
  es: 'Español',
  yo: 'Yorùbá',
  ig: 'Igbo',
  ha: 'Hausa',
};

const LOCALE_FLAGS: Record<Locale, string> = {
  en: '🇬🇧',
  fr: '🇫🇷',
  sw: '🇰🇪',
  es: '🇪🇸',
  yo: '🇳🇬',
  ig: '🇳🇬',
  ha: '🇳🇬',
};

type TranslationValue = string | { [key: string]: TranslationValue };
type Translations = Record<string, TranslationValue>;

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string>) => string;
  localeNames: Record<Locale, string>;
  localeFlags: Record<Locale, string>;
  locales: Locale[];
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

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('esell-locale') as Locale | null;
    if (saved && LOCALE_NAMES[saved]) {
      void loadTranslations(saved).then(() => {
        setLocaleState(saved);
        forceUpdate((n) => n + 1);
      });
    } else {
      void loadTranslations('en');
    }
  }, []);

  const setLocale = useCallback(async (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('esell-locale', newLocale);
    await loadTranslations(newLocale);
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

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        t,
        localeNames: LOCALE_NAMES,
        localeFlags: LOCALE_FLAGS,
        locales,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    // Fallback for when context is not available
    return {
      locale: 'en' as Locale,
      setLocale: () => {},
      t: (key: string) => key,
      localeNames: {} as Record<Locale, string>,
      localeFlags: {} as Record<Locale, string>,
      locales: [] as Locale[],
    };
  }
  return context;
}

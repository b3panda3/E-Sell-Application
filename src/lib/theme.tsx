'use client';

import React, { createContext, useContext, useCallback, useSyncExternalStore } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

// Module-level theme state for useSyncExternalStore
let currentTheme: Theme | null = null;
const listeners = new Set<() => void>();

function getTheme(): Theme {
  if (currentTheme === null) {
    if (typeof window === 'undefined') return 'light';
    try {
      const saved = localStorage.getItem('esell-theme') as Theme | null;
      if (saved === 'dark' || saved === 'light') {
        currentTheme = saved;
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        currentTheme = 'dark';
      } else {
        currentTheme = 'light';
      }
    } catch {
      currentTheme = 'light';
    }
  }
  return currentTheme;
}

function setThemeInternal(newTheme: Theme) {
  currentTheme = newTheme;
  localStorage.setItem('esell-theme', newTheme);
  document.documentElement.classList.toggle('dark', newTheme === 'dark');
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getTheme, () => 'light' as Theme);

  // Ensure the DOM class matches on first render
  if (typeof window !== 'undefined') {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeInternal(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeInternal(theme === 'light' ? 'dark' : 'light');
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'light' as Theme,
      setTheme: () => {},
      toggleTheme: () => {},
    };
  }
  return context;
}

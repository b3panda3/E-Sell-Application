'use client';

import { SessionProvider } from 'next-auth/react';
import { I18nProvider } from '@/lib/i18n';
import { ThemeProvider } from '@/lib/theme';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <I18nProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </I18nProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}

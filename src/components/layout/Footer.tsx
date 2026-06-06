'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '@/lib/i18n';
import { Separator } from '@/components/ui/separator';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#006633] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-3">
              <Image src="/logo.png" alt="E-Sell" width={32} height={32} className="rounded-lg" />
              <h3 className="text-xl font-bold">E-Sell</h3>
            </Link>
            <p className="text-white/70 text-sm leading-relaxed">{t('footer.tagline')}</p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-3 text-white/90">Quick Links</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.about')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.contact')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.terms')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.privacy')}</a></li>
            </ul>
          </div>

          {/* Voice Commands */}
          <div>
            <h4 className="font-semibold mb-3 text-white/90 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              Voice Commands
            </h4>
            <ul className="space-y-1.5 text-xs text-white/60">
              <li><code className="bg-white/10 px-1 rounded">"Dashboard"</code> — Go to dashboard</li>
              <li><code className="bg-white/10 px-1 rounded">"Browse" / "Shop"</code> — Browse stores</li>
              <li><code className="bg-white/10 px-1 rounded">"Cart"</code> — View cart</li>
              <li><code className="bg-white/10 px-1 rounded">"Messages"</code> — Open messages</li>
              <li><code className="bg-white/10 px-1 rounded">"My store"</code> — Storefront (Merchants)</li>
              <li><code className="bg-white/10 px-1 rounded">"Help"</code> — Show all commands</li>
              <li><code className="bg-white/10 px-1 rounded">"Logout"</code> — Sign out</li>
            </ul>
            <p className="mt-2 text-[10px] text-white/40">8 languages supported on Education &amp; News pages</p>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold mb-3 text-white/90">Connect</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors" aria-label="Twitter">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors" aria-label="Instagram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors" aria-label="Telegram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              </a>
            </div>
          </div>
        </div>

        <Separator className="my-6 bg-white/20" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-white/60">
          <p>&copy; {new Date().getFullYear()} E-Sell. {t('footer.rights')}</p>
          <p>{t('footer.builtBy')}</p>
        </div>
      </div>
    </footer>
  );
}

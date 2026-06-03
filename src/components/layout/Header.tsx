'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useTranslation } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu, Globe, User, LogOut, LayoutDashboard, ChevronDown, Sun, Moon } from 'lucide-react';

export default function Header() {
  const { data: session } = useSession();
  const { locale, setLocale, t, localeNames, localeFlags, locales } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const userRole = session?.user ? (session.user as Record<string, unknown>).role as string : null;
  const dashboardPath = userRole === 'MERCHANT' ? '/dashboard/merchant' : '/dashboard/customer';

  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/browse', label: t('nav.browse') },
    { href: '/education', label: t('nav.education') },
    { href: '/news', label: t('nav.news') },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#006633] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <Image
              src="/logo.png"
              alt="E-Sell"
              width={36}
              height={36}
              className="rounded-lg"
            />
            <span className="text-xl font-bold tracking-tight">E-Sell</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white/90 hover:text-white transition-colors text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Side: Theme + Language + Auth */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              onClick={toggleTheme}
              aria-label={theme === 'light' ? t('common.darkMode') : t('common.lightMode')}
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>

            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 gap-1" />
                }
              >
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline text-xs uppercase">{locale}</span>
                <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {locales.map((loc) => (
                  <DropdownMenuItem
                    key={loc}
                    onClick={() => setLocale(loc)}
                    className={locale === loc ? 'bg-[#006633]/10' : ''}
                  >
                    <span className="mr-2">{localeFlags[loc]}</span>
                    {localeNames[loc]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Auth Buttons (Desktop) */}
            {session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 gap-2" />
                  }
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline max-w-[100px] truncate text-sm">
                    {session.user.name}
                  </span>
                  <ChevronDown className="h-3 w-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem render={<Link href={dashboardPath} className="flex items-center gap-2" />}>
                    <LayoutDashboard className="h-4 w-4" />
                    {t('nav.dashboard')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex items-center gap-2 text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    {t('nav.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10"
                  onClick={() => signIn()}
                >
                  {t('nav.login')}
                </Button>
                <Button
                  size="sm"
                  className="bg-white text-[#006633] hover:bg-white/90 font-semibold"
                  render={<Link href="/register" />}
                  nativeButton={false}
                >
                  {t('nav.register')}
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                render={<Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10" />}
              >
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="flex flex-col gap-4 mt-8">
                  <Link href="/" className="flex items-center gap-2">
                    <Image src="/logo.png" alt="E-Sell" width={28} height={28} className="rounded-lg" />
                    <span className="text-2xl font-bold text-[#006633]">E-Sell</span>
                  </Link>
                  <nav className="flex flex-col gap-2">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="px-3 py-2 rounded-lg hover:bg-[#006633]/10 transition-colors font-medium"
                        onClick={() => setMobileOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                  <div className="border-t pt-4">
                    {/* Theme toggle for mobile */}
                    <button
                      onClick={toggleTheme}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium w-full text-left"
                    >
                      {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                      {theme === 'light' ? t('common.darkMode') : t('common.lightMode')}
                    </button>
                  </div>
                  <div className="border-t pt-4">
                    {session?.user ? (
                      <div className="flex flex-col gap-2">
                        <Link
                          href={dashboardPath}
                          className="px-3 py-2 rounded-lg hover:bg-[#006633]/10 transition-colors font-medium flex items-center gap-2"
                          onClick={() => setMobileOpen(false)}
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          {t('nav.dashboard')}
                        </Link>
                        <button
                          onClick={() => { signOut({ callbackUrl: '/' }); setMobileOpen(false); }}
                          className="px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors font-medium text-red-600 flex items-center gap-2 text-left"
                        >
                          <LogOut className="h-4 w-4" />
                          {t('nav.logout')}
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <Button
                          className="w-full bg-[#006633] hover:bg-[#1B6B3A] text-white"
                          render={<Link href="/login" />}
                          nativeButton={false}
                          onClick={() => setMobileOpen(false)}
                        >
                          {t('nav.login')}
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full border-[#006633] text-[#006633]"
                          render={<Link href="/register" />}
                          nativeButton={false}
                          onClick={() => setMobileOpen(false)}
                        >
                          {t('nav.register')}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

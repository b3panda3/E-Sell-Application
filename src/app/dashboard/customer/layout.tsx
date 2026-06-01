'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import {
  LayoutDashboard,
  Store,
  ShoppingBag,
  ShoppingCart,
  MessageSquare,
  Bell,
  Settings,
  Trash2,
  Menu,
  LogOut,
  X,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import Image from 'next/image';

const NAV_ITEMS = [
  { href: '/dashboard/customer', icon: LayoutDashboard, labelKey: 'dashboard.customer.title', exact: true },
  { href: '/dashboard/customer/browse', icon: Store, labelKey: 'dashboard.customer.browseStores' },
  { href: '/dashboard/customer/cart', icon: ShoppingCart, labelKey: 'dashboard.customer.cart' },
  { href: '/dashboard/customer/purchases', icon: ShoppingBag, labelKey: 'dashboard.customer.myPurchases' },
  { href: '/dashboard/customer/messages', icon: MessageSquare, labelKey: 'dashboard.customer.messages' },
  { href: '/dashboard/customer/notifications', icon: Bell, labelKey: 'dashboard.customer.notifications' },
  { href: '/dashboard/customer/settings', icon: Settings, labelKey: 'dashboard.customer.settings' },
  { href: '/dashboard/customer/delete', icon: Trash2, labelKey: 'dashboard.customer.deleteAccount' },
];

function SidebarContent({
  pathname,
  t,
  onNavClick,
}: {
  pathname: string;
  t: (key: string) => string;
  onNavClick?: () => void;
}) {
  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href) && href !== '/dashboard/customer';
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 w-64">
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="E-Sell" width={28} height={28} className="rounded-lg" />
          <span className="font-bold text-blue-600 dark:text-blue-400">Customer</span>
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto custom-scrollbar">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                active
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <item.icon className={`h-5 w-5 shrink-0 ${active ? 'text-blue-600 dark:text-blue-400' : ''}`} />
              <span>{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 w-full"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span>{t('nav.logout')}</span>
        </button>
      </div>
    </div>
  );
}

export default function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="hidden lg:block overflow-hidden">
        <SidebarContent pathname={pathname} t={t} />
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <div className="flex items-center justify-end p-2">
            <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <SidebarContent
            pathname={pathname}
            t={t}
            onNavClick={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950">
        <div className="lg:hidden flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <h2 className="font-semibold text-blue-600 dark:text-blue-400">Customer Dashboard</h2>
        </div>

        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

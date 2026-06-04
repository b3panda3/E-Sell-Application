'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Package, MessageSquare, Coins, Shield, Plus, ArrowRight, Store, Copy, Check } from 'lucide-react';
import Link from 'next/link';

export default function MerchantDashboardPage() {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [storeName, setStoreName] = useState<string | null>(null);
  const [productCount, setProductCount] = useState(0);
  const [tokenCount, setTokenCount] = useState(0);

  const userName = session?.user?.name || 'Merchant';
  const esellCode = String((session?.user as Record<string, unknown> | undefined)?.esellCode ?? '');

  useEffect(() => {
    async function fetchStorefrontData() {
      try {
        const res = await fetch('/api/storefront');
        if (res.ok) {
          const data = await res.json();
          const sf = data.storefronts?.[0];
          if (sf) {
            setStoreName(sf.storeName);
            setProductCount(sf.products?.length || 0);
          }
        }
      } catch { /* ignore */ }
    }
    if (session?.user) fetchStorefrontData();
  }, [session]);

  const handleCopy = async () => {
    if (!esellCode) return;
    await navigator.clipboard.writeText(esellCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stats = [
    {
      title: t('dashboard.merchant.totalProducts'),
      value: String(productCount),
      icon: Package,
      color: 'from-emerald-500 to-green-600',
    },
    {
      title: t('dashboard.merchant.messages'),
      value: '0',
      icon: MessageSquare,
      color: 'from-green-500 to-teal-600',
    },
    {
      title: t('dashboard.merchant.tokenDeployments'),
      value: String(tokenCount),
      icon: Coins,
      color: 'from-teal-500 to-emerald-600',
    },
    {
      title: t('dashboard.merchant.trustBadge'),
      value: session?.user ? (String((session.user as Record<string, unknown>)?.trustBadge || 'RED')) : 'RED',
      icon: Shield,
      color: 'from-red-500 to-orange-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center gap-4">
        <Avatar className="h-14 w-14">
          <AvatarImage src={session?.user?.image || undefined} alt={userName} />
          <AvatarFallback className="bg-[#006633]/10 text-[#006633] dark:bg-emerald-400/10 dark:text-emerald-400 text-xl font-bold">
            {userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('dashboard.welcome')}, {storeName || userName}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('dashboard.merchant.title')}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow dark:bg-gray-900 dark:border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* E-Sell Code */}
      {esellCode && (
        <Card className="bg-gradient-to-r from-[#006633] to-[#00875A] text-white dark:from-emerald-700 dark:to-emerald-600">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-white/80 text-sm font-medium">Your E-Sell Code</p>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-3xl font-bold tracking-wider">
                    {esellCode}
                  </p>
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-sm font-medium"
                    title="Copy E-Sell Code"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <p className="text-white/60 text-sm mt-1">Share this code with customers to find your store</p>
              </div>
              <Badge className="bg-white/20 text-white border-0">Merchant</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button
            className="h-auto py-4 px-6 bg-[#006633] hover:bg-[#1B6B3A] text-white flex items-center gap-3 justify-start"
            render={<Link href="/dashboard/merchant/products/new" />}
            nativeButton={false}
          >
            <Plus className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">{t('dashboard.merchant.addProduct')}</div>
              <div className="text-xs text-white/70">Add products & services</div>
            </div>
            <ArrowRight className="h-4 w-4 ml-auto" />
          </Button>

          <Button
            className="h-auto py-4 px-6 bg-[#00875A] hover:bg-[#006633] text-white flex items-center gap-3 justify-start"
            render={<Link href="/dashboard/merchant/contracts" />}
            nativeButton={false}
          >
            <Coins className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">{t('dashboard.merchant.deployToken')}</div>
              <div className="text-xs text-white/70">Create BEP-20 token</div>
            </div>
            <ArrowRight className="h-4 w-4 ml-auto" />
          </Button>

          <Button
            className="h-auto py-4 px-6 border-[#006633] text-[#006633] hover:bg-[#006633]/5 dark:border-emerald-400 dark:text-emerald-400 dark:hover:bg-emerald-400/10 flex items-center gap-3 justify-start"
            variant="outline"
            render={<Link href="/dashboard/merchant/storefront" />}
            nativeButton={false}
          >
            <Store className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">{t('dashboard.merchant.viewStorefront')}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Customize your store</div>
            </div>
            <ArrowRight className="h-4 w-4 ml-auto" />
          </Button>
        </div>
      </div>
    </div>
  );
}

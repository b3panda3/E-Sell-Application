'use client';

import { useSession } from 'next-auth/react';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Package, MessageSquare, Coins, Shield, Plus, ArrowRight, Store, Mic, Sparkles, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function MerchantDashboardPage() {
  const { data: session } = useSession();
  const { t } = useTranslation();

  const userName = session?.user?.name || 'Merchant';

  const stats = [
    {
      title: t('dashboard.merchant.totalProducts'),
      value: '0',
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
      value: '0',
      icon: Coins,
      color: 'from-teal-500 to-emerald-600',
    },
    {
      title: t('dashboard.merchant.trustBadge'),
      value: 'RED',
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
            {t('dashboard.welcome')}, {userName}!
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
      {String((session?.user as Record<string, unknown>)?.esellCode) && (
        <Card className="bg-gradient-to-r from-[#006633] to-[#00875A] text-white dark:from-emerald-700 dark:to-emerald-600">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-white/80 text-sm font-medium">Your E-Sell Code</p>
                <p className="text-3xl font-bold tracking-wider mt-1">
                  {String((session?.user as Record<string, unknown> | undefined)?.esellCode ?? '')}
                </p>
                <p className="text-white/60 text-sm mt-1">Share this code with customers to find your store</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  className="bg-white/20 hover:bg-white/30 text-white border-0 shrink-0"
                  render={<Link href={`/store/${String((session?.user as Record<string, unknown> | undefined)?.esellCode ?? '')}`} target="_blank" />}
                  nativeButton={false}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Preview Store
                </Button>
                <Badge className="bg-white/20 text-white border-0">Merchant</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Voice Store Builder CTA */}
      <Card className="border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/40 dark:to-green-950/40 overflow-hidden relative">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
              <Mic className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Voice Store Builder</h3>
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 border-0 text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI-Powered
                </Badge>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Set up your entire store by voice or text. Just describe your business and our AI will create everything for you.
              </p>
            </div>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
              render={<Link href="/dashboard/merchant/store-builder" />}
              nativeButton={false}
            >
              <Mic className="w-4 h-4 mr-2" />
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button
            className="h-auto py-4 px-6 bg-[#006633] hover:bg-[#1B6B3A] text-white flex items-center gap-3 justify-start"
            render={<Link href="/dashboard/merchant/products" />}
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

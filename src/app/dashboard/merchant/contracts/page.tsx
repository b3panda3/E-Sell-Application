'use client';

import { useTranslation } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, Rocket, Shield, FileCode } from 'lucide-react';

export default function ContractsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Coins className="h-6 w-6 text-[#006633] dark:text-emerald-400" />
          {t('dashboard.merchant.contractDeployment')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Deploy and manage your BEP-20 tokens on Binance Smart Chain
        </p>
      </div>

      {/* Coming Soon Card */}
      <Card className="dark:bg-gray-900 dark:border-gray-800">
        <CardContent className="py-16 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#006633] to-[#00875A] flex items-center justify-center">
            <Rocket className="h-10 w-10 text-white" />
          </div>
          <Badge className="bg-[#006633]/10 text-[#006633] dark:bg-emerald-400/10 dark:text-emerald-400 mb-4">
            Coming Soon
          </Badge>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Token Deployment
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
            Deploy your own BEP-20 token on Binance Smart Chain directly from your dashboard. 
            Customize token name, symbol, supply, and more — all with a few clicks.
          </p>
        </CardContent>
      </Card>

      {/* Feature Preview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[#006633]/10 dark:bg-emerald-400/10 flex items-center justify-center">
              <FileCode className="h-6 w-6 text-[#006633] dark:text-emerald-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
              Custom Token Creation
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Define your own token name, symbol, and total supply
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[#006633]/10 dark:bg-emerald-400/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-[#006633] dark:text-emerald-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
              Secure Deployment
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Audited smart contracts deployed to BSC mainnet
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[#006633]/10 dark:bg-emerald-400/10 flex items-center justify-center">
              <Coins className="h-6 w-6 text-[#006633] dark:text-emerald-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
              Accept Token Payments
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Let customers pay with your custom token
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

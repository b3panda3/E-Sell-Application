'use client';

import { useTranslation } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, Link2, ShieldCheck, ArrowRightLeft } from 'lucide-react';

export default function WalletsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Wallet className="h-6 w-6 text-[#006633] dark:text-emerald-400" />
          {t('dashboard.merchant.walletAddresses')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your crypto wallet addresses for receiving payments
        </p>
      </div>

      {/* Coming Soon Card */}
      <Card className="dark:bg-gray-900 dark:border-gray-800">
        <CardContent className="py-16 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#006633] to-[#00875A] flex items-center justify-center">
            <Wallet className="h-10 w-10 text-white" />
          </div>
          <Badge className="bg-[#006633]/10 text-[#006633] dark:bg-emerald-400/10 dark:text-emerald-400 mb-4">
            Coming Soon
          </Badge>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Wallet Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
            Add and manage multiple wallet addresses for different blockchain networks. 
            Receive payments in BNB, BUSD, or your own custom token — all tracked in one place.
          </p>
        </CardContent>
      </Card>

      {/* Feature Preview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[#006633]/10 dark:bg-emerald-400/10 flex items-center justify-center">
              <Link2 className="h-6 w-6 text-[#006633] dark:text-emerald-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
              Multiple Addresses
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Add wallet addresses for BSC, Ethereum, and more
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[#006633]/10 dark:bg-emerald-400/10 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-[#006633] dark:text-emerald-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
              Verified Addresses
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Verify ownership of your wallet addresses
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[#006633]/10 dark:bg-emerald-400/10 flex items-center justify-center">
              <ArrowRightLeft className="h-6 w-6 text-[#006633] dark:text-emerald-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
              Multi-Network
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Accept payments across multiple blockchain networks
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

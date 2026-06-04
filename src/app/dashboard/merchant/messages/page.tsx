'use client';

import { useTranslation } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Inbox, Users } from 'lucide-react';

export default function MessagesPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-[#006633] dark:text-emerald-400" />
          {t('dashboard.merchant.messages')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Communicate with your customers and manage inquiries
        </p>
      </div>

      {/* Coming Soon Card */}
      <Card className="dark:bg-gray-900 dark:border-gray-800">
        <CardContent className="py-16 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#006633] to-[#00875A] flex items-center justify-center">
            <MessageSquare className="h-10 w-10 text-white" />
          </div>
          <Badge className="bg-[#006633]/10 text-[#006633] dark:bg-emerald-400/10 dark:text-emerald-400 mb-4">
            Coming Soon
          </Badge>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Messaging Center
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
            Chat directly with your customers, answer product questions, negotiate deals, 
            and build relationships — all from within your merchant dashboard.
          </p>
        </CardContent>
      </Card>

      {/* Feature Preview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[#006633]/10 dark:bg-emerald-400/10 flex items-center justify-center">
              <Inbox className="h-6 w-6 text-[#006633] dark:text-emerald-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
              Unified Inbox
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              All customer messages in one organized inbox
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[#006633]/10 dark:bg-emerald-400/10 flex items-center justify-center">
              <Send className="h-6 w-6 text-[#006633] dark:text-emerald-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
              Quick Replies
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Use templates for common questions and responses
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[#006633]/10 dark:bg-emerald-400/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-[#006633] dark:text-emerald-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
              Customer Profiles
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              See purchase history and details alongside messages
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

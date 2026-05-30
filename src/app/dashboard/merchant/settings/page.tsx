'use client';

import { useSession } from 'next-auth/react';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';

export default function MerchantSettingsPage() {
  const { data: session } = useSession();
  const { t } = useTranslation();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.merchant.settings')}</h1>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input defaultValue={session?.user?.name || ''} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input defaultValue={session?.user?.email || ''} disabled />
          </div>
          <Button className="bg-[#006633] hover:bg-[#1B6B3A] text-white">
            {t('common.save')}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-700 flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Permanently delete your account and all associated data.
          </p>
          <Button variant="destructive" render={<Link href="/dashboard/merchant/delete" />} nativeButton={false}>
              <Trash2 className="h-4 w-4 mr-2" />
              {t('dashboard.merchant.deleteAccount')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

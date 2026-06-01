'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function NewServicePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [storefrontId, setStorefrontId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priceNGN, setPriceNGN] = useState('');
  const [priceCrypto, setPriceCrypto] = useState('');
  const [duration, setDuration] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    async function fetchStorefront() {
      try {
        const res = await fetch('/api/storefront');
        if (res.ok) {
          const data = await res.json();
          const sf = data.storefronts?.[0];
          if (sf) setStorefrontId(sf.id);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStorefront();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storefrontId || !name || !priceNGN) return;

    setSaving(true);
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storefrontId,
          name,
          description,
          priceNGN: parseFloat(priceNGN),
          priceCrypto: priceCrypto || null,
          duration: duration || null,
          isActive,
        }),
      });

      if (res.ok) {
        router.push('/dashboard/merchant/products');
      }
    } catch (error) {
      console.error('Create service error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006633] dark:border-emerald-400" />
      </div>
    );
  }

  if (!storefrontId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 mb-4">{t('storefront.noStorefront')}</p>
        <Button
          render={<Link href="/dashboard/merchant/storefront" />}
          nativeButton={false}
          className="bg-[#006633] hover:bg-[#1B6B3A] text-white"
        >
          {t('storefront.goSelectTheme')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/dashboard/merchant/products" />}
          nativeButton={false}
          className="mb-2 text-gray-600 dark:text-gray-400"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('services.addService')}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-base">{t('services.serviceDetails')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm mb-1 block">{t('services.name')} *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('services.namePlaceholder')}
                required
              />
            </div>

            <div>
              <Label className="text-sm mb-1 block">{t('services.description')}</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('services.descriptionPlaceholder')}
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm mb-1 block">{t('services.priceNGN')} *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={priceNGN}
                  onChange={(e) => setPriceNGN(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <Label className="text-sm mb-1 block">{t('services.priceCrypto')}</Label>
                <Input
                  value={priceCrypto}
                  onChange={(e) => setPriceCrypto(e.target.value)}
                  placeholder="0.01 BNB"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm mb-1 block">{t('services.duration')}</Label>
              <Input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder={t('services.durationPlaceholder')}
              />
            </div>

            {/* Active Toggle */}
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#006633] dark:peer-checked:bg-emerald-500 dark:bg-gray-700" />
              </label>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {isActive ? t('products.active') : t('products.inactive')}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end mt-6 gap-3">
          <Button
            variant="outline"
            render={<Link href="/dashboard/merchant/products" />}
            nativeButton={false}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            disabled={saving || !name || !priceNGN}
            className="bg-[#006633] hover:bg-[#1B6B3A] text-white"
          >
            <Save className="h-4 w-4" />
            {saving ? t('common.loading') : t('services.createService')}
          </Button>
        </div>
      </form>
    </div>
  );
}

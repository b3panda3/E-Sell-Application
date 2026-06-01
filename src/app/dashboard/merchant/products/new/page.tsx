'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, X, ImagePlus } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = [
  'Electronics',
  'Fashion',
  'Home & Garden',
  'Health & Beauty',
  'Food & Drinks',
  'Services',
  'Digital Products',
  'Art & Crafts',
  'Books & Education',
  'Other',
];

export default function NewProductPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [storefrontId, setStorefrontId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priceNGN, setPriceNGN] = useState('');
  const [priceCrypto, setPriceCrypto] = useState('');
  const [category, setCategory] = useState('');
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImages((prev) => [...prev, base64]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storefrontId || !name || !priceNGN) return;

    setSaving(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storefrontId,
          name,
          description,
          priceNGN: parseFloat(priceNGN),
          priceCrypto: priceCrypto || null,
          category: category || null,
          images: images.length > 0 ? JSON.stringify(images) : null,
          isActive,
        }),
      });

      if (res.ok) {
        router.push('/dashboard/merchant/products');
      }
    } catch (error) {
      console.error('Create product error:', error);
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
          {t('products.addProduct')}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-base">{t('products.productDetails')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm mb-1 block">{t('products.name')} *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('products.namePlaceholder')}
                required
              />
            </div>

            <div>
              <Label className="text-sm mb-1 block">{t('products.description')}</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('products.descriptionPlaceholder')}
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm mb-1 block">{t('products.priceNGN')} *</Label>
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
                <Label className="text-sm mb-1 block">{t('products.priceCrypto')}</Label>
                <Input
                  value={priceCrypto}
                  onChange={(e) => setPriceCrypto(e.target.value)}
                  placeholder="0.01 BNB"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm mb-1 block">{t('products.category')}</Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              >
                <option value="">{t('products.selectCategory')}</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Image Upload */}
            <div>
              <Label className="text-sm mb-2 block">{t('products.images')}</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                {images.map((img, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <img src={img} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-[#006633] dark:hover:border-emerald-400 transition-colors">
                  <ImagePlus className="h-6 w-6 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">{t('products.addImage')}</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xs text-gray-400">{t('products.imageHint')}</p>
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
            {saving ? t('common.loading') : t('products.createProduct')}
          </Button>
        </div>
      </form>
    </div>
  );
}

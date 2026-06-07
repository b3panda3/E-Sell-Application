'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, X, ImagePlus, RefreshCw } from 'lucide-react';
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

const FIAT_CURRENCIES = [
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
] as const;

const CRYPTO_CURRENCIES = [
  { code: 'BNB', symbol: '◆', name: 'BNB' },
  { code: 'USDT', symbol: '₮', name: 'USDT' },
] as const;

export default function NewProductPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [storefrontId, setStorefrontId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('NGN');
  const [selectedCrypto, setSelectedCrypto] = useState('BNB');
  const [category, setCategory] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Crypto equivalent state
  const [cryptoEquivalent, setCryptoEquivalent] = useState<number | null>(null);
  const [converting, setConverting] = useState(false);
  const [conversionError, setConversionError] = useState('');

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

  // Auto-calculate crypto equivalent when price or currency changes
  const fetchCryptoEquivalent = useCallback(async () => {
    const priceNum = parseFloat(price);
    if (!priceNum || priceNum <= 0) {
      setCryptoEquivalent(null);
      setConversionError('');
      return;
    }

    setConverting(true);
    setConversionError('');

    try {
      const res = await fetch(
        `/api/currency?from=${selectedCurrency}&to=${selectedCrypto}&amount=${priceNum}`
      );
      if (res.ok) {
        const data = await res.json();
        setCryptoEquivalent(data.result);
      } else {
        setCryptoEquivalent(null);
        setConversionError('Could not fetch rate');
      }
    } catch {
      setCryptoEquivalent(null);
      setConversionError('Conversion failed');
    } finally {
      setConverting(false);
    }
  }, [price, selectedCurrency, selectedCrypto]);

  // Debounce the conversion
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCryptoEquivalent();
    }, 500);

    return () => clearTimeout(timer);
  }, [fetchCryptoEquivalent]);

  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'products');

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          setImages((prev) => [...prev, data.url]);
        }
      }
    } catch (error) {
      console.error('Image upload error:', error);
    } finally {
      setUploading(false);
      // Reset the file input so the same file can be re-selected
      if (e.target) e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Get the selected fiat currency details
  const selectedFiat = FIAT_CURRENCIES.find((c) => c.code === selectedCurrency) || FIAT_CURRENCIES[0];
  const selectedCryptoInfo = CRYPTO_CURRENCIES.find((c) => c.code === selectedCrypto) || CRYPTO_CURRENCIES[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storefrontId || !name || !price) return;

    setSaving(true);
    try {
      const priceNum = parseFloat(price);

      // Convert to NGN for the priceNGN field
      let priceNGN = priceNum;
      if (selectedCurrency !== 'NGN') {
        try {
          const res = await fetch(
            `/api/currency?from=${selectedCurrency}&to=NGN&amount=${priceNum}`
          );
          if (res.ok) {
            const data = await res.json();
            priceNGN = data.result;
          }
        } catch {
          // If conversion fails, still save with the raw number
        }
      }

      // Store crypto price as JSON with full context
      const priceCryptoData = cryptoEquivalent !== null
        ? JSON.stringify({
            amount: cryptoEquivalent,
            currency: selectedCrypto,
            originalCurrency: selectedCurrency,
            originalAmount: priceNum,
          })
        : null;

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storefrontId,
          name,
          description,
          priceNGN,
          priceCrypto: priceCryptoData,
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

            {/* Price with Currency Selector */}
            <div>
              <Label className="text-sm mb-1 block">{t('products.price')} *</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
                <Select value={selectedCurrency} onValueChange={(value) => { if (value) setSelectedCurrency(value); }}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FIAT_CURRENCIES.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Crypto Equivalent Section */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('products.cryptoEquivalent')}
                </Label>
                <button
                  type="button"
                  onClick={fetchCryptoEquivalent}
                  disabled={converting || !price}
                  className="text-xs text-[#006633] dark:text-emerald-400 hover:underline disabled:opacity-50 flex items-center gap-1"
                >
                  <RefreshCw className={`h-3 w-3 ${converting ? 'animate-spin' : ''}`} />
                  {t('products.refreshRate')}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Select value={selectedCrypto} onValueChange={(value) => { if (value) setSelectedCrypto(value); }}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CRYPTO_CURRENCIES.map((crypto) => (
                      <SelectItem key={crypto.code} value={crypto.code}>
                        {crypto.symbol} {crypto.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex-1 h-8 rounded-lg border border-input bg-white dark:bg-gray-900 px-2.5 py-1 text-sm flex items-center">
                  {converting ? (
                    <span className="text-gray-400 flex items-center gap-2">
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      {t('products.converting')}
                    </span>
                  ) : cryptoEquivalent !== null ? (
                    <span className="font-medium text-gray-900 dark:text-white">
                      {cryptoEquivalent < 0.01
                        ? cryptoEquivalent.toExponential(4)
                        : cryptoEquivalent < 1
                          ? cryptoEquivalent.toFixed(6)
                          : cryptoEquivalent < 1000
                            ? cryptoEquivalent.toFixed(4)
                            : cryptoEquivalent.toLocaleString(undefined, { maximumFractionDigits: 2 })
                      }{' '}
                      <span className="text-gray-500">{selectedCrypto}</span>
                    </span>
                  ) : price ? (
                    <span className="text-gray-400">{t('products.enterPriceFirst')}</span>
                  ) : (
                    <span className="text-gray-400">{t('products.enterPriceFirst')}</span>
                  )}
                </div>
              </div>

              {conversionError && (
                <p className="text-xs text-red-500">{conversionError}</p>
              )}

              {cryptoEquivalent !== null && price && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedFiat.symbol}{parseFloat(price).toLocaleString()} {selectedCurrency} ≈ {selectedCryptoInfo.symbol}{cryptoEquivalent < 0.01 ? cryptoEquivalent.toExponential(2) : cryptoEquivalent.toFixed(cryptoEquivalent < 1 ? 4 : 2)} {selectedCrypto}
                </p>
              )}
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
            disabled={saving || !name || !price}
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

'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TrustBadge } from '@/components/TrustBadge';
import { Search, Store, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface StorefrontInfo {
  merchantName: string;
  merchantImage: string | null;
  esellCode: string | null;
  businessCategory: string | null;
  trustBadge: string;
  storefront: {
    id: string;
    themeId: string | null;
    customColors: string | null;
    aboutUs: string | null;
    theme: { name: string; defaultColors: string | null } | null;
    products: { id: string }[];
    services: { id: string }[];
  };
  trustProfile: {
    badge: string;
    totalTrades: number;
    satisfactionScore: number;
  } | null;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

const THEME_GRADIENTS: Record<string, string> = {
  MarketHub: 'from-[#006633] to-[#00875A]',
  ProServe: 'from-[#1E40AF] to-[#3B82F6]',
  CreativeStudio: 'from-[#7C3AED] to-[#A855F7]',
  TechStore: 'from-[#0F766E] to-[#14B8A6]',
  FoodMarket: 'from-[#DC2626] to-[#F97316]',
};

const CATEGORY_ICONS: Record<string, string> = {
  general: '🏪',
  services: '💼',
  creative: '🎨',
  technology: '💻',
  food: '🍕',
};

export default function BrowsePage() {
  const { t } = useTranslation();
  const [stores, setStores] = useState<StorefrontInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [esellCodeSearch, setEsellCodeSearch] = useState('');

  useEffect(() => {
    async function fetchStores() {
      try {
        const res = await fetch('/api/storefront/browse');
        if (res.ok) {
          const data = await res.json();
          setStores(data.stores || []);
        }
      } catch (error) {
        console.error('Fetch stores error:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStores();
  }, []);

  const filteredStores = useMemo(() => {
    let filtered = stores;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.merchantName.toLowerCase().includes(q) ||
          s.storefront.aboutUs?.toLowerCase().includes(q)
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(
        (s) => s.businessCategory?.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    if (esellCodeSearch) {
      const code = esellCodeSearch.toUpperCase();
      filtered = filtered.filter((s) =>
        s.esellCode?.toUpperCase().includes(code)
      );
    }

    return filtered;
  }, [searchQuery, categoryFilter, esellCodeSearch, stores]);

  const categories = [
    { value: '', label: t('browse.allCategories') },
    { value: 'general', label: 'General / Retail' },
    { value: 'services', label: 'Services' },
    { value: 'creative', label: 'Creative / Arts' },
    { value: 'technology', label: 'Technology / Electronics' },
    { value: 'food', label: 'Food / Restaurants' },
    { value: 'fashion', label: 'Fashion / Clothing' },
    { value: 'health', label: 'Health / Wellness' },
    { value: 'education', label: 'Education / Training' },
    { value: 'real-estate', label: 'Real Estate' },
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'beauty', label: 'Beauty / Cosmetics' },
    { value: 'finance', label: 'Finance / Consulting' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Store className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          {t('browse.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {t('browse.subtitle')}
        </p>
      </div>

      {/* Search & Filters */}
      <Card className="dark:bg-gray-900 dark:border-gray-800">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('browse.searchByName')}
                className="pl-8"
              />
            </div>
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div className="relative">
              <Input
                value={esellCodeSearch}
                onChange={(e) => setEsellCodeSearch(e.target.value)}
                placeholder={t('browse.searchByCode')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {filteredStores.length === 0 ? (
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="py-12 text-center">
            <Store className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">{t('browse.noStores')}</p>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredStores.map((store) => {
            const themeName = store.storefront.theme?.name || 'MarketHub';
            const gradient = THEME_GRADIENTS[themeName] || 'from-gray-500 to-gray-700';
            const icon = CATEGORY_ICONS[store.storefront.theme?.name?.toLowerCase() || ''] || CATEGORY_ICONS[store.businessCategory?.toLowerCase() || ''] || '🏪';
            const productCount = store.storefront.products?.length || 0;
            const serviceCount = store.storefront.services?.length || 0;

            return (
              <motion.div key={store.esellCode || store.merchantName} variants={fadeUp}>
                <Link href={`/store/${store.esellCode}`}>
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group dark:bg-gray-900 dark:border-gray-800">
                    {/* Store Header */}
                    <div className={`h-28 bg-gradient-to-br ${gradient} relative flex items-center justify-center`}>
                      <span className="text-4xl">{icon}</span>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent h-12" />
                      <div className="absolute bottom-2 right-2">
                        <TrustBadge badge={store.trustBadge} size="sm" />
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate group-hover:text-[#006633] dark:group-hover:text-emerald-400 transition-colors">
                            {store.merchantName}
                          </h3>
                          {store.businessCategory && (
                            <Badge variant="secondary" className="text-xs mt-1 capitalize">
                              {store.businessCategory}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {store.storefront.aboutUs && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                          {store.storefront.aboutUs}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-3 text-xs text-gray-500 dark:text-gray-400">
                        <span>{productCount} {t('browse.products')}</span>
                        <span>·</span>
                        <span>{serviceCount} {t('browse.services')}</span>
                      </div>

                      {store.esellCode && (
                        <div className="flex items-center gap-1 mt-2">
                          <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-400">
                            {store.esellCode}
                          </code>
                        </div>
                      )}

                      <div className="flex items-center gap-1 mt-3 text-[#006633] dark:text-emerald-400 text-xs font-medium">
                        {t('browse.visitStore')}
                        <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

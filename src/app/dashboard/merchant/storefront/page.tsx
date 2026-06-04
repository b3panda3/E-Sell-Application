'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Palette, ArrowRight, Settings, Eye, Copy } from 'lucide-react';
import Link from 'next/link';

interface Theme {
  id: string;
  name: string;
  category: string;
  description: string;
  previewImageUrl: string | null;
  layoutConfig: string | null;
  defaultColors: string | null;
  isActive: boolean;
}

interface Storefront {
  id: string;
  themeId: string | null;
  customColors: string | null;
  aboutUs: string | null;
  address: string | null;
  socialLinks: string | null;
  theme: Theme | null;
}

const THEME_GRADIENTS: Record<string, string> = {
  MarketHub: 'from-[#006633] to-[#00875A]',
  ProServe: 'from-[#1E40AF] to-[#3B82F6]',
  CreativeStudio: 'from-[#7C3AED] to-[#A855F7]',
  TechStore: 'from-[#0F766E] to-[#14B8A6]',
  FoodMarket: 'from-[#DC2626] to-[#F97316]',
};

const THEME_ICONS: Record<string, string> = {
  MarketHub: '🏪',
  ProServe: '💼',
  CreativeStudio: '🎨',
  TechStore: '💻',
  FoodMarket: '🍕',
};

export default function StorefrontPage() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [storefront, setStorefront] = useState<Storefront | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const esellCode = String((session?.user as Record<string, unknown> | undefined)?.esellCode ?? '');

  const handleCopy = async () => {
    if (!esellCode) return;
    await navigator.clipboard.writeText(esellCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const [themesRes, storefrontRes] = await Promise.all([
          fetch('/api/themes'),
          fetch('/api/storefront'),
        ]);

        if (themesRes.ok) {
          const themesData = await themesRes.json();
          setThemes(themesData.themes || []);
        }

        if (storefrontRes.ok) {
          const storefrontData = await storefrontRes.json();
          const sf = storefrontData.storefronts?.[0] || null;
          setStorefront(sf);
          setSelectedTheme(sf?.themeId || null);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSelectTheme = async (themeId: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/themes/${themeId}/select`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setStorefront(data.storefront);
        setSelectedTheme(themeId);
      }
    } catch (error) {
      console.error('Theme select error:', error);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Palette className="h-6 w-6 text-[#006633] dark:text-emerald-400" />
            {t('storefront.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('storefront.subtitle')}
          </p>
        </div>
        {storefront && (
          <Button
            render={<Link href="/dashboard/merchant/storefront/customize" />}
            nativeButton={false}
            className="bg-[#006633] hover:bg-[#1B6B3A] text-white"
          >
            <Settings className="h-4 w-4" />
            {t('storefront.customize')}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* E-Sell Code */}
      {esellCode && (
        <Card className="bg-gradient-to-r from-[#006633] to-[#00875A] text-white dark:from-emerald-700 dark:to-emerald-600">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-white/80 text-sm font-medium">{t('storefront.yourEsellCode')}</p>
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
                <p className="text-white/60 text-sm mt-1">{t('storefront.shareCode')}</p>
              </div>
              <Badge className="bg-white/20 text-white border-0">{t('storefront.active')}</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Theme Selection */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('storefront.selectTheme')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((theme) => {
            const isActive = selectedTheme === theme.id;
            const colors = theme.defaultColors ? JSON.parse(theme.defaultColors) : {};
            const gradient = THEME_GRADIENTS[theme.name] || 'from-gray-500 to-gray-700';
            const icon = THEME_ICONS[theme.name] || '🏪';

            return (
              <Card
                key={theme.id}
                className={`relative overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-xl ${
                  isActive
                    ? 'ring-2 ring-[#006633] dark:ring-emerald-400 shadow-lg'
                    : 'hover:ring-1 hover:ring-gray-300 dark:hover:ring-gray-600'
                }`}
                onClick={() => !saving && handleSelectTheme(theme.id)}
              >
                {/* Theme Preview */}
                <div
                  className={`h-40 bg-gradient-to-br ${gradient} relative flex items-center justify-center`}
                >
                  <span className="text-5xl">{icon}</span>
                  {isActive && (
                    <div className="absolute top-3 right-3 bg-white rounded-full p-1 shadow-lg">
                      <Check className="h-5 w-5 text-[#006633]" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/30 to-transparent h-16" />
                </div>

                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{theme.name}</CardTitle>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {theme.category}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs line-clamp-2">
                    {theme.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Color Swatches */}
                  <div className="flex items-center gap-1.5 mt-2">
                    {colors.primary && (
                      <div className="w-6 h-6 rounded-full border border-gray-200 dark:border-gray-700" style={{ backgroundColor: colors.primary }} />
                    )}
                    {colors.secondary && (
                      <div className="w-6 h-6 rounded-full border border-gray-200 dark:border-gray-700" style={{ backgroundColor: colors.secondary }} />
                    )}
                    {colors.accent && (
                      <div className="w-6 h-6 rounded-full border border-gray-200 dark:border-gray-700" style={{ backgroundColor: colors.accent }} />
                    )}
                  </div>

                  <div className="mt-3">
                    <Button
                      size="sm"
                      className={`w-full ${
                        isActive
                          ? 'bg-[#006633] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                      disabled={saving}
                    >
                      {isActive ? (
                        <>
                          <Check className="h-4 w-4" />
                          {t('storefront.activeTheme')}
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4" />
                          {t('storefront.selectThemeBtn')}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Theme Preview */}
      {selectedTheme && storefront && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('storefront.themePreview')}
          </h2>
          <ThemePreview storefront={storefront} themes={themes} />
        </div>
      )}
    </div>
  );
}

function ThemePreview({ storefront, themes }: { storefront: Storefront; themes: Theme[] }) {
  const currentTheme = themes.find((t) => t.id === storefront.themeId);
  const colors = storefront.customColors
    ? JSON.parse(storefront.customColors)
    : currentTheme?.defaultColors
    ? JSON.parse(currentTheme.defaultColors)
    : { primary: '#006633', secondary: '#00875A', accent: '#FFB800', background: '#FFFFFF', surface: '#F8FAF9' };
  const layout = currentTheme?.layoutConfig ? JSON.parse(currentTheme.layoutConfig) : {};

  return (
    <Card className="overflow-hidden dark:bg-gray-900 dark:border-gray-800">
      <div className="p-4">
        {/* Preview Header */}
        <div
          className="rounded-t-xl p-4 text-white"
          style={{ backgroundColor: colors.primary }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
                M
              </div>
              <div>
                <h3 className="font-bold">My Store</h3>
                <p className="text-white/70 text-xs">{layout.headerStyle || 'centered'} header</p>
              </div>
            </div>
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="w-16 h-6 rounded bg-white/20 text-xs flex items-center justify-center">
                  {i === 0 ? 'Home' : i === 1 ? 'Products' : 'About'}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview Hero */}
        {layout.heroSection && (
          <div
            className="p-6 text-center"
            style={{ backgroundColor: colors.surface }}
          >
            <h4 className="text-lg font-bold" style={{ color: colors.text || '#1A1A1A' }}>
              Welcome to Our Store
            </h4>
            <p className="text-sm mt-1" style={{ color: colors.textLight || '#6B7280' }}>
              Discover amazing products and services
            </p>
          </div>
        )}

        {/* Preview Products Grid */}
        <div className="p-4">
          <div className={`grid gap-3`} style={{ gridTemplateColumns: `repeat(${layout.productGridCols || 3}, 1fr)` }}>
            {Array.from({ length: layout.productGridCols || 3 }).map((_, i) => (
              <div key={i} className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <div
                  className="h-20 flex items-center justify-center"
                  style={{ backgroundColor: `${colors.primary}15` }}
                >
                  <span className="text-2xl">📦</span>
                </div>
                <div className="p-2">
                  <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-gray-700 mb-1" />
                  <div className="h-3 w-1/2 rounded" style={{ backgroundColor: `${colors.primary}30` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Layout info */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              {layout.productGridCols || 3} column grid
            </Badge>
            {layout.showStaffSection && (
              <Badge variant="outline" className="text-xs">Staff section</Badge>
            )}
            {layout.darkModeDefault && (
              <Badge variant="outline" className="text-xs">Dark default</Badge>
            )}
            {layout.menuStyle && (
              <Badge variant="outline" className="text-xs">Menu style</Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrustBadge } from '@/components/TrustBadge';
import {
  Store,
  MapPin,
  Phone,
  Mail,
  Package,
  Wrench,
  Users,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

interface StoreData {
  merchantName: string;
  merchantImage: string | null;
  esellCode: string | null;
  businessCategory: string | null;
  trustBadge: string;
  trustProfile: {
    badge: string;
    totalTrades: number;
    satisfactionScore: number;
  } | null;
  storefront: {
    id: string;
    customColors: string | null;
    aboutUs: string | null;
    address: string | null;
    socialLinks: string | null;
    theme: {
      name: string;
      defaultColors: string | null;
      layoutConfig: string | null;
    } | null;
    products: {
      id: string;
      name: string;
      description: string | null;
      priceNGN: number;
      priceCrypto: string | null;
      images: string | null;
      category: string | null;
    }[];
    services: {
      id: string;
      name: string;
      description: string | null;
      priceNGN: number;
      priceCrypto: string | null;
      duration: string | null;
    }[];
    staff: {
      id: string;
      name: string;
      role: string;
      bio: string | null;
      profileImageUrl: string | null;
    }[];
  };
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function StorefrontPage() {
  const params = useParams();
  const esellCode = params.esellCode as string;
  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchStore() {
      try {
        const res = await fetch(`/api/storefront/${esellCode}`);
        if (res.ok) {
          const data = await res.json();
          setStore(data.store);
        } else {
          const data = await res.json();
          setError(data.error || 'Store not found');
        }
      } catch {
        setError('Failed to load store');
      } finally {
        setLoading(false);
      }
    }
    fetchStore();
  }, [esellCode]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#006633] dark:border-emerald-400" />
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Store className="h-16 w-16 text-gray-400" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Store Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400">{error || 'This store does not exist or is not active.'}</p>
        <Button
          render={<Link href="/" />}
          nativeButton={false}
          className="bg-[#006633] hover:bg-[#1B6B3A] text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Home
        </Button>
      </div>
    );
  }

  const colors = store.storefront.customColors
    ? JSON.parse(store.storefront.customColors)
    : store.storefront.theme?.defaultColors
    ? JSON.parse(store.storefront.theme.defaultColors)
    : { primary: '#006633', secondary: '#00875A', accent: '#FFB800', background: '#FFFFFF', surface: '#F8FAF9', text: '#1A1A1A', textLight: '#6B7280' };

  const layout = store.storefront.theme?.layoutConfig
    ? JSON.parse(store.storefront.theme.layoutConfig)
    : {};

  let socialLinks: Record<string, string> = {};
  if (store.storefront.socialLinks) {
    try { socialLinks = JSON.parse(store.storefront.socialLinks); } catch { /* ignore */ }
  }

  let contactInfo: { address?: string; phone?: string; email?: string } = {};
  if (store.storefront.address) {
    try { contactInfo = JSON.parse(store.storefront.address); } catch { contactInfo = { address: store.storefront.address }; }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <header
        className="text-white py-8 px-4"
        style={{ backgroundColor: colors.primary }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="sm"
              render={<Link href="/" />}
              nativeButton={false}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-bold">
              {store.merchantName.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold">{store.merchantName}</h1>
              <div className="flex items-center gap-2 mt-1">
                {store.businessCategory && (
                  <Badge className="bg-white/20 text-white border-0 capitalize text-xs">
                    {store.businessCategory}
                  </Badge>
                )}
                <TrustBadge badge={store.trustBadge} size="sm" />
              </div>
            </div>
            {store.esellCode && (
              <div className="text-right">
                <p className="text-white/60 text-xs">E-Sell Code</p>
                <code className="text-white font-bold tracking-wider">{store.esellCode}</code>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* About Section */}
        {store.storefront.aboutUs && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">About Us</h2>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{store.storefront.aboutUs}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Products Section */}
        {store.storefront.products.length > 0 && (
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" style={{ color: colors.primary }} />
              Products
              <Badge variant="secondary" className="text-xs">{store.storefront.products.length}</Badge>
            </h2>
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: `repeat(${layout.productGridCols || 3}, minmax(0, 1fr))` }}
            >
              {store.storefront.products.map((product) => {
                const images = product.images ? JSON.parse(product.images) : [];
                const firstImage = images[0] || null;

                return (
                  <motion.div key={product.id} variants={fadeUp}>
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow dark:bg-gray-900 dark:border-gray-800">
                      <div className="h-40 bg-gray-100 dark:bg-gray-800 relative">
                        {firstImage ? (
                          <img src={firstImage} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Package className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        {product.category && (
                          <Badge className="absolute top-2 left-2 text-xs bg-white/90 dark:bg-gray-900/90">
                            {product.category}
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-medium text-sm text-gray-900 dark:text-white">{product.name}</h3>
                        {product.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{product.description}</p>
                        )}
                        <p className="text-lg font-bold mt-2" style={{ color: colors.primary }}>
                          ₦{product.priceNGN.toLocaleString()}
                        </p>
                        {product.priceCrypto && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">{product.priceCrypto}</p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Services Section */}
        {store.storefront.services.length > 0 && (
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Wrench className="h-5 w-5" style={{ color: colors.primary }} />
              Services
              <Badge variant="secondary" className="text-xs">{store.storefront.services.length}</Badge>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {store.storefront.services.map((service) => (
                <motion.div key={service.id} variants={fadeUp}>
                  <Card className="hover:shadow-lg transition-shadow dark:bg-gray-900 dark:border-gray-800">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-sm text-gray-900 dark:text-white">{service.name}</h3>
                          {service.duration && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{service.duration}</p>
                          )}
                        </div>
                      </div>
                      {service.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">{service.description}</p>
                      )}
                      <p className="text-lg font-bold mt-2" style={{ color: colors.primary }}>
                        ₦{service.priceNGN.toLocaleString()}
                      </p>
                      {service.priceCrypto && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">{service.priceCrypto}</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Staff Section */}
        {store.storefront.staff.length > 0 && (
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" style={{ color: colors.primary }} />
              Our Team
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {store.storefront.staff.map((member) => (
                <motion.div key={member.id} variants={fadeUp}>
                  <Card className="dark:bg-gray-900 dark:border-gray-800">
                    <CardContent className="p-4 flex items-start gap-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                        style={{ backgroundColor: colors.primary }}
                      >
                        {member.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-gray-900 dark:text-white">{member.name}</h3>
                        <p className="text-xs" style={{ color: colors.primary }}>{member.role}</p>
                        {member.bio && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{member.bio}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Contact & Social */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Contact Info */}
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact</h2>
                <div className="space-y-3">
                  {contactInfo.address && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4 shrink-0" style={{ color: colors.primary }} />
                      {contactInfo.address}
                    </div>
                  )}
                  {contactInfo.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Phone className="h-4 w-4 shrink-0" style={{ color: colors.primary }} />
                      {contactInfo.phone}
                    </div>
                  )}
                  {contactInfo.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Mail className="h-4 w-4 shrink-0" style={{ color: colors.primary }} />
                      {contactInfo.email}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            {(socialLinks.twitter || socialLinks.instagram || socialLinks.telegram || socialLinks.whatsapp) && (
              <Card className="dark:bg-gray-900 dark:border-gray-800">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Follow Us</h2>
                  <div className="space-y-2">
                    {socialLinks.twitter && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="text-base">𝕏</span> {socialLinks.twitter}
                      </div>
                    )}
                    {socialLinks.instagram && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="text-base">📷</span> {socialLinks.instagram}
                      </div>
                    )}
                    {socialLinks.telegram && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="text-base">✈️</span> {socialLinks.telegram}
                      </div>
                    )}
                    {socialLinks.whatsapp && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="text-base">💬</span> {socialLinks.whatsapp}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>

        {/* Trust Profile */}
        {store.trustProfile && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  Trust Profile
                  <TrustBadge badge={store.trustBadge} size="md" />
                </h2>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{store.trustProfile.totalTrades}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Trades</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{store.trustProfile.satisfactionScore}%</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Satisfaction</p>
                  </div>
                  <div>
                    <TrustBadge badge={store.trustBadge} size="lg" />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {store.trustBadge === 'GREEN' ? 'Trusted Merchant' :
                       store.trustBadge === 'BLUE' ? 'Verified Merchant' : 'New Account'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

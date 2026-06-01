'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrustBadge } from '@/components/TrustBadge';
import { Coins, Wallet, Store, ShieldCheck, Play, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const YOUTUBE_VIDEOS = [
  { id: 'G_JiU-6dcu8', title: 'MetaMask Full Tutorial' },
  { id: 'ePcaRPCP8Rs', title: 'How to Set Up MetaMask 2025' },
  { id: 'x4aDoPIuTnw', title: 'How to Add BSC to MetaMask' },
  { id: 'MeKrZW324zM', title: 'How to Protect Your Crypto Wallet' },
];

interface FeaturedStore {
  merchantName: string;
  esellCode: string | null;
  businessCategory: string | null;
  trustBadge: string;
  storefront: {
    theme: { name: string } | null;
    products: { id: string }[];
  };
}

const THEME_GRADIENTS: Record<string, string> = {
  MarketHub: 'from-[#006633] to-[#00875A]',
  ProServe: 'from-[#1E40AF] to-[#3B82F6]',
  CreativeStudio: 'from-[#7C3AED] to-[#A855F7]',
  TechStore: 'from-[#0F766E] to-[#14B8A6]',
  FoodMarket: 'from-[#DC2626] to-[#F97316]',
};

export default function HomePage() {
  const { t } = useTranslation();
  const [featuredStores, setFeaturedStores] = useState<FeaturedStore[]>([]);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch('/api/storefront/browse');
        if (res.ok) {
          const data = await res.json();
          setFeaturedStores((data.stores || []).slice(0, 6));
        }
      } catch { /* ignore */ }
    }
    fetchFeatured();
  }, []);

  const features = [
    {
      icon: Coins,
      title: t('features.deployToken.title'),
      description: t('features.deployToken.description'),
      color: 'from-emerald-500 to-green-600',
    },
    {
      icon: Wallet,
      title: t('features.acceptCrypto.title'),
      description: t('features.acceptCrypto.description'),
      color: 'from-green-500 to-teal-600',
    },
    {
      icon: Store,
      title: t('features.professionalStore.title'),
      description: t('features.professionalStore.description'),
      color: 'from-teal-500 to-emerald-600',
    },
    {
      icon: ShieldCheck,
      title: t('features.secureTrusted.title'),
      description: t('features.secureTrusted.description'),
      color: 'from-[#006633] to-[#00875A]',
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#006633] via-[#1B6B3A] to-[#00875A] text-white">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] rounded-full bg-white/5"
            animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] rounded-full bg-white/5"
            animate={{ x: [0, -40, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-white/3"
            animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-block"
            >
              <Image src="/logo.png" alt="E-Sell" width={80} height={80} className="mx-auto rounded-2xl shadow-2xl" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-7xl font-bold tracking-tight mb-4"
            >
              {t('hero.title')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl md:text-2xl font-medium text-white/90 mb-4"
            >
              {t('hero.subtitle')}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base md:text-lg text-white/70 mb-8 max-w-2xl mx-auto leading-relaxed"
            >
              {t('hero.description')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                size="lg"
                className="bg-white text-[#006633] hover:bg-white/90 font-semibold text-base px-8 h-12"
                render={<Link href="/register?role=merchant" />}
                nativeButton={false}
              >
                {t('hero.startSelling')}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:bg-white/10 font-semibold text-base px-8 h-12"
                render={<Link href="/browse" />}
                nativeButton={false}
              >
                {t('hero.browseStores')}
              </Button>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="white"
              className="dark:fill-gray-950"
            />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('features.title')}
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature) => (
              <motion.div key={feature.title} variants={fadeUp}>
                <Card className="h-full hover:shadow-xl transition-shadow duration-300 border-gray-100 dark:border-gray-800 dark:bg-gray-900 group">
                  <CardContent className="p-6 text-center">
                    <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Stores Section */}
      {featuredStores.length > 0 && (
        <section className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={stagger}
              className="text-center mb-12"
            >
              <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {t('featured.title')}
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {t('featured.subtitle')}
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={stagger}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {featuredStores.map((store) => {
                const themeName = store.storefront.theme?.name || 'MarketHub';
                const gradient = THEME_GRADIENTS[themeName] || 'from-gray-500 to-gray-700';

                return (
                  <motion.div key={store.esellCode || store.merchantName} variants={fadeUp}>
                    <Link href={`/store/${store.esellCode}`}>
                      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group dark:bg-gray-800 dark:border-gray-700">
                        <div className={`h-24 bg-gradient-to-br ${gradient} relative flex items-center justify-center`}>
                          <span className="text-3xl font-bold text-white/80">{store.merchantName.charAt(0)}</span>
                          <div className="absolute bottom-2 right-2">
                            <TrustBadge badge={store.trustBadge} size="sm" />
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-[#006633] dark:group-hover:text-emerald-400 transition-colors">
                            {store.merchantName}
                          </h3>
                          {store.businessCategory && (
                            <Badge variant="secondary" className="text-xs mt-1 capitalize">{store.businessCategory}</Badge>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            {store.storefront.products.length} products
                          </p>
                          <div className="flex items-center gap-1 mt-2 text-[#006633] dark:text-emerald-400 text-xs font-medium">
                            Visit Store <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mt-10"
            >
              <Button
                variant="outline"
                size="lg"
                className="border-[#006633] text-[#006633] hover:bg-[#006633]/5 dark:border-emerald-400 dark:text-emerald-400 dark:hover:bg-emerald-400/10"
                render={<Link href="/browse" />}
                nativeButton={false}
              >
                {t('featured.viewAll')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </section>
      )}

      {/* Education Section */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('education.title')}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('education.subtitle')}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {YOUTUBE_VIDEOS.map((video) => (
              <motion.div key={video.id} variants={fadeUp}>
                <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 group dark:bg-gray-800 dark:border-gray-700">
                  <div className="relative aspect-video bg-gray-200 dark:bg-gray-700">
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src={`https://www.youtube.com/embed/${video.id}`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 pointer-events-none">
                      <Play className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2">
                      {video.title}
                    </h3>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <Button
              variant="outline"
              size="lg"
              className="border-[#006633] text-[#006633] hover:bg-[#006633]/5 dark:border-emerald-400 dark:text-emerald-400 dark:hover:bg-emerald-400/10"
              render={<Link href="/education" />}
              nativeButton={false}
            >
              {t('education.seeMore')}
            </Button>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#006633] to-[#00875A] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('cta.title')}
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              {t('cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-[#006633] hover:bg-white/90 font-semibold px-8 h-12"
                render={<Link href="/register?role=merchant" />}
                nativeButton={false}
              >
                {t('cta.getStarted')}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:bg-white/10 font-semibold px-8 h-12"
                render={<Link href="/browse" />}
                nativeButton={false}
              >
                {t('cta.browseStores')}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

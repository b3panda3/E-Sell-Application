'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Package, Wrench, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description: string | null;
  priceNGN: number;
  priceCrypto: string | null;
  category: string | null;
  images: string | null;
  isActive: boolean;
  createdAt: string;
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  priceNGN: number;
  priceCrypto: string | null;
  duration: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function ProductsPage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [storefrontId, setStorefrontId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');

  useEffect(() => {
    async function fetchData() {
      try {
        const sfRes = await fetch('/api/storefront');
        if (sfRes.ok) {
          const data = await sfRes.json();
          const sf = data.storefronts?.[0];
          if (sf) {
            setStorefrontId(sf.id);
            const [productsRes, servicesRes] = await Promise.all([
              fetch(`/api/products?storefrontId=${sf.id}`),
              fetch(`/api/services?storefrontId=${sf.id}`),
            ]);
            if (productsRes.ok) {
              const pData = await productsRes.json();
              setProducts(pData.products || []);
            }
            if (servicesRes.ok) {
              const sData = await servicesRes.json();
              setServices(sData.services || []);
            }
          }
        }
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleDeleteProduct = async (id: string) => {
    if (!confirm(t('storefront.confirmDelete'))) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm(t('storefront.confirmDelete'))) return;
    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
      if (res.ok) setServices((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const toggleProductActive = async (product: Product) => {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !product.isActive }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, isActive: !p.isActive } : p))
        );
      }
    } catch (error) {
      console.error('Toggle error:', error);
    }
  };

  const toggleServiceActive = async (service: Service) => {
    try {
      const res = await fetch(`/api/services/${service.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !service.isActive }),
      });
      if (res.ok) {
        setServices((prev) =>
          prev.map((s) => (s.id === service.id ? { ...s, isActive: !s.isActive } : s))
        );
      }
    } catch (error) {
      console.error('Toggle error:', error);
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Package className="h-6 w-6 text-[#006633] dark:text-emerald-400" />
            {t('dashboard.merchant.productsServices')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('products.subtitle')}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="products" className="flex items-center gap-1.5">
            <Package className="h-4 w-4" />
            {t('products.tab')} ({products.length})
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center gap-1.5">
            <Wrench className="h-4 w-4" />
            {t('services.tab')} ({services.length})
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products">
          <div className="mt-4 space-y-4">
            <div className="flex justify-end">
              <Button
                render={<Link href="/dashboard/merchant/products/new" />}
                nativeButton={false}
                className="bg-[#006633] hover:bg-[#1B6B3A] text-white"
              >
                <Plus className="h-4 w-4" />
                {t('products.addProduct')}
              </Button>
            </div>

            {products.length === 0 ? (
              <Card className="dark:bg-gray-900 dark:border-gray-800">
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">{t('products.noProducts')}</p>
                  <Button
                    render={<Link href="/dashboard/merchant/products/new" />}
                    nativeButton={false}
                    variant="outline"
                    className="mt-4 border-[#006633] text-[#006633] hover:bg-[#006633]/5 dark:border-emerald-400 dark:text-emerald-400"
                  >
                    <Plus className="h-4 w-4" />
                    {t('products.addFirst')}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onToggle={toggleProductActive}
                    onDelete={handleDeleteProduct}
                    t={t}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services">
          <div className="mt-4 space-y-4">
            <div className="flex justify-end">
              <Button
                render={<Link href="/dashboard/merchant/products/services/new" />}
                nativeButton={false}
                className="bg-[#006633] hover:bg-[#1B6B3A] text-white"
              >
                <Plus className="h-4 w-4" />
                {t('services.addService')}
              </Button>
            </div>

            {services.length === 0 ? (
              <Card className="dark:bg-gray-900 dark:border-gray-800">
                <CardContent className="py-12 text-center">
                  <Wrench className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">{t('services.noServices')}</p>
                  <Button
                    render={<Link href="/dashboard/merchant/products/services/new" />}
                    nativeButton={false}
                    variant="outline"
                    className="mt-4 border-[#006633] text-[#006633] hover:bg-[#006633]/5 dark:border-emerald-400 dark:text-emerald-400"
                  >
                    <Plus className="h-4 w-4" />
                    {t('services.addFirst')}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onToggle={toggleServiceActive}
                    onDelete={handleDeleteService}
                    t={t}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProductCard({
  product,
  onToggle,
  onDelete,
  t,
}: {
  product: Product;
  onToggle: (p: Product) => void;
  onDelete: (id: string) => void;
  t: (key: string) => string;
}) {
  const images = product.images ? JSON.parse(product.images) : [];
  const firstImage = images[0] || null;

  return (
    <Card className={`overflow-hidden group dark:bg-gray-900 dark:border-gray-800 ${!product.isActive ? 'opacity-60' : ''}`}>
      <div className="h-40 bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
        {firstImage ? (
          <img src={firstImage} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Package className="h-10 w-10 text-gray-400" />
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-1">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onToggle(product)}
            className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
          >
            {product.isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          </Button>
        </div>
        {!product.isActive && (
          <div className="absolute inset-0 bg-gray-900/20 flex items-center justify-center">
            <Badge variant="secondary" className="text-xs">{t('products.inactive')}</Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate">{product.name}</h3>
            {product.category && (
              <Badge variant="secondary" className="text-xs mt-1">{product.category}</Badge>
            )}
          </div>
        </div>
        <p className="text-lg font-bold text-[#006633] dark:text-emerald-400 mt-2">
          ₦{product.priceNGN.toLocaleString()}
        </p>
        {product.priceCrypto && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{product.priceCrypto}</p>
        )}
        <div className="flex items-center gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/dashboard/merchant/products/${product.id}/edit`} />}
            nativeButton={false}
            className="flex-1 text-xs"
          >
            <Edit className="h-3 w-3" />
            {t('common.edit')}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(product.id)}
            className="text-xs"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ServiceCard({
  service,
  onToggle,
  onDelete,
  t,
}: {
  service: Service;
  onToggle: (s: Service) => void;
  onDelete: (id: string) => void;
  t: (key: string) => string;
}) {
  return (
    <Card className={`overflow-hidden group dark:bg-gray-900 dark:border-gray-800 ${!service.isActive ? 'opacity-60' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Wrench className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate">{service.name}</h3>
                {service.duration && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">{service.duration}</p>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onToggle(service)}
          >
            {service.isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          </Button>
        </div>
        {service.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">{service.description}</p>
        )}
        <p className="text-lg font-bold text-[#006633] dark:text-emerald-400 mt-2">
          ₦{service.priceNGN.toLocaleString()}
        </p>
        {service.priceCrypto && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{service.priceCrypto}</p>
        )}
        <div className="flex items-center gap-2 mt-3">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(service.id)}
            className="text-xs flex-1"
          >
            <Trash2 className="h-3 w-3" />
            {t('common.delete')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

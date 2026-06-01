'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Newspaper, ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface NewsArticle {
  title: string;
  description: string;
  source: string;
  date: string;
  image: string | null;
  url: string;
}

export default function NewsPage() {
  const { t } = useTranslation();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch('/api/news');
        if (res.ok) {
          const data = await res.json();
          setArticles(data.articles || []);
        }
      } catch (error) {
        console.error('Fetch news error:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#006633] dark:border-emerald-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            render={<Link href="/" />}
            nativeButton={false}
            className="mb-4 text-gray-600 dark:text-gray-400"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Newspaper className="h-8 w-8 text-[#006633] dark:text-emerald-400" />
            {t('news.title')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
            {t('news.subtitle')}
          </p>
        </div>

        {/* Articles Grid */}
        {articles.length === 0 ? (
          <div className="text-center py-12">
            <Newspaper className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">{t('news.noNews')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {articles.map((article, index) => (
              <a
                key={index}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 overflow-hidden dark:bg-gray-900 dark:border-gray-800">
                  <div className="h-48 bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                    {article.image ? (
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Newspaper className="h-10 w-10 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white/90 dark:bg-gray-900/90 rounded-full p-1.5">
                        <ExternalLink className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2 group-hover:text-[#006633] dark:group-hover:text-emerald-400 transition-colors mb-2">
                      {article.title}
                    </h3>
                    {article.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 mb-3">
                        {article.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                      <span className="font-medium">{article.source}</span>
                      {article.date && (
                        <>
                          <span>·</span>
                          <span>{article.date}</span>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

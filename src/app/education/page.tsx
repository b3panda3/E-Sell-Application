'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap,
  Search,
  Play,
  X,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ArrowLeft,
  TrendingUp,
  BookOpen,
  CreditCard,
  Coins,
  Bot,
  Store,
  Settings,
  HelpCircle,
  Bookmark,
  BookmarkCheck,
  Mic,
  MicOff,
  Globe,
  Volume2,
} from 'lucide-react';
import Link from 'next/link';
import EducationChatbot from '@/components/education/EducationChatbot';

interface Video {
  id: string;
  title: string;
  youtubeUrl: string;
  description?: string;
  category: string;
  featured: boolean;
  sortOrder: number;
  isActive: boolean;
}

const INITIAL_VIDEOS = [
  { id: '1', title: 'How to Set Up Your E-Sell Store', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', category: 'getting-started', featured: true, description: 'Step-by-step merchant onboarding guide' },
  { id: '2', title: 'Using the AI Chatbot on E-Sell', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', category: 'ai', featured: true, description: 'How to interact with the AI assistant' },
  { id: '3', title: 'How to Accept Payments with Paystack', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', category: 'payments', featured: true, description: 'Payment setup and configuration' },
  { id: '4', title: 'MetaMask Wallet For Beginners', youtubeUrl: 'https://www.youtube.com/watch?v=G_JiU-6dcu8', category: 'crypto', featured: true, description: 'Wallet setup walkthrough' },
  { id: '5', title: 'How To Protect Your Crypto Wallet', youtubeUrl: 'https://www.youtube.com/watch?v=MeKrZW324zM', category: 'crypto', featured: false, description: 'Security best practices' },
  { id: '6', title: 'Understanding Trust Badges', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', category: 'getting-started', featured: false, description: 'How trust levels work' },
  { id: '7', title: 'Voice Commands on E-Sell', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', category: 'ai', featured: false, description: 'Hands-free navigation' },
  { id: '8', title: 'Adding Products and Services', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', category: 'storefront', featured: false, description: 'Product management' },
  { id: '9', title: 'Customizing Your Storefront Theme', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', category: 'storefront', featured: false, description: 'Theme editor walkthrough' },
  { id: '10', title: 'How to Browse and Shop on E-Sell', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', category: 'getting-started', featured: false, description: 'Customer shopping guide' },
  { id: '11', title: 'Understanding BNB and BEP-20 Tokens', youtubeUrl: 'https://www.youtube.com/watch?v=Tvmkqjkqpe0', category: 'crypto', featured: false, description: 'Binance Smart Chain intro' },
  { id: '12', title: 'How to Set Up Your Wallet Address', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', category: 'crypto', featured: false, description: 'Wallet configuration' },
  { id: '13', title: 'Building Customer Trust', youtubeUrl: 'https://www.youtube.com/watch?v=GfedzfGgIOc', category: 'storefront', featured: false, description: 'Growing your trust badge' },
  { id: '14', title: 'Multi-Currency Pricing on E-Sell', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', category: 'payments', featured: false, description: 'NGN, BNB, and USDT pricing' },
  { id: '15', title: 'Deploying Your Own Token on BSC', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', category: 'advanced', featured: false, description: 'Token deployment guide' },
  { id: '16', title: 'Managing Staff on Your Store', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', category: 'storefront', featured: false, description: 'Team management' },
  { id: '17', title: 'E-Sell Platform Overview 2025', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', category: 'getting-started', featured: false, description: 'Complete walkthrough' },
];

const CATEGORIES = [
  { id: 'all', label: 'All', icon: BookOpen },
  { id: 'getting-started', label: 'Getting Started', icon: GraduationCap },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'crypto', label: 'Crypto', icon: Coins },
  { id: 'ai', label: 'AI', icon: Bot },
  { id: 'storefront', label: 'Storefront', icon: Store },
  { id: 'advanced', label: 'Advanced', icon: Settings },
];

const FAQ_ITEMS = [
  { question: 'What is E-Sell?', answer: 'E-Sell is an e-commerce platform that enables merchants to sell products and services online, accepting both traditional and cryptocurrency payments on the Binance Smart Chain.' },
  { question: 'How do I accept crypto payments?', answer: 'Set up a MetaMask wallet, add your BSC wallet address in your E-Sell dashboard, and enable crypto pricing for your products. Customers can then pay using BNB, USDT, or other BEP-20 tokens.' },
  { question: 'What are Trust Badges?', answer: 'Trust Badges indicate a merchant\'s reliability. RED = new account, BLUE = verified information, GREEN = established with successful trade history. Build trust by completing trades and maintaining good response times.' },
  { question: 'How do I deploy my own token?', answer: 'Use the E-Sell token deployment feature to create a BEP-20 token on Binance Smart Chain. You can customize the name, symbol, supply, and features like minting and pausing.' },
  { question: 'Is E-Sell free to use?', answer: 'Yes! Creating a store and listing products is free. E-Sell charges a small transaction fee only when you make a sale through the platform.' },
];

const BLOCKCHAIN_TERMS = [
  'blockchain', 'cryptocurrency', 'BNB', 'BEP-20', 'BSC', 'MetaMask', 'wallet',
  'smart contract', 'DeFi', 'token', 'NFT', 'gas fee', 'staking', 'decentralized',
  'Web3', 'private key', 'seed phrase', 'USDT', 'stablecoin', 'mining',
];

const TRANSLATION_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ha', name: 'Hausa', flag: '🇳🇬' },
  { code: 'ig', name: 'Igbo', flag: '🇳🇬' },
  { code: 'yo', name: 'Yoruba', flag: '🇳🇬' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
];

const VOICE_COMMANDS_EDUCATION = [
  { command: '"Play video [number]"', description: 'Open a specific video by its position' },
  { command: '"Search for [topic]"', description: 'Search videos by topic' },
  { command: '"Category [name]"', description: 'Switch to a category tab' },
  { command: '"Bookmark this"', description: 'Bookmark the current video' },
  { command: '"My bookmarks"', description: 'Show bookmarked videos' },
  { command: '"Translate to [language]"', description: 'Translate page content' },
  { command: '"Explain [term]"', description: 'Get AI explanation of a term' },
  { command: '"Scroll top" / "Scroll bottom"', description: 'Navigate the page' },
  { command: '"Back"', description: 'Go back to homepage' },
];

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function highlightTerms(text: string, onTermClick: (term: string) => void) {
  const regex = new RegExp(`\\b(${BLOCKCHAIN_TERMS.join('|')})\\b`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, i) => {
    const isTerm = BLOCKCHAIN_TERMS.some(
      (t) => t.toLowerCase() === part.toLowerCase()
    );
    if (isTerm) {
      return (
        <button
          key={i}
          onClick={() => onTermClick(part)}
          className="text-[#006633] dark:text-emerald-400 underline decoration-dotted underline-offset-2 hover:bg-[#006633]/10 dark:hover:bg-emerald-400/10 px-0.5 rounded transition-colors cursor-pointer font-medium"
        >
          {part}
        </button>
      );
    }
    return part;
  });
}

export default function EducationPage() {
  const [videos, setVideos] = useState<Video[]>(INITIAL_VIDEOS as unknown as Video[]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);
  const [explainerTerm, setExplainerTerm] = useState<string | null>(null);
  const [explanation, setExplanation] = useState('');
  const [explaining, setExplaining] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [faqAiAnswer, setFaqAiAnswer] = useState<string | null>(null);
  const [faqAiLoading, setFaqAiLoading] = useState(false);
  const [cryptoPrices, setCryptoPrices] = useState<{ symbol: string; price: number; change24h: string; icon: string }[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [translationLang, setTranslationLang] = useState('en');
  const [translatedContent, setTranslatedContent] = useState<Record<string, string>>({});
  const [translating, setTranslating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState('');
  const [showVoiceHelp, setShowVoiceHelp] = useState(false);

  // Load bookmarks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('esell-education-bookmarks');
    if (saved) {
      try {
        setBookmarks(JSON.parse(saved));
      } catch { /* ignore */ }
    }
  }, []);

  // Save bookmarks to localStorage
  useEffect(() => {
    localStorage.setItem('esell-education-bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    async function fetchVideos() {
      try {
        const res = await fetch('/api/education/videos');
        if (res.ok) {
          const data = await res.json();
          if (data.videos?.length > 0) {
            setVideos(data.videos);
          }
        }
      } catch {
        // Use initial videos
      } finally {
        setLoading(false);
      }
    }
    fetchVideos();

    // Fetch live crypto prices
    async function fetchCrypto() {
      try {
        const res = await fetch('/api/crypto/prices');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setCryptoPrices(data);
          }
        }
      } catch { /* use defaults */ }
    }
    fetchCrypto();
    // Refresh every 60 seconds
    const interval = setInterval(fetchCrypto, 60000);
    return () => clearInterval(interval);
  }, []);

  const toggleBookmark = useCallback((videoId: string) => {
    setBookmarks((prev) =>
      prev.includes(videoId)
        ? prev.filter((id) => id !== videoId)
        : [...prev, videoId]
    );
  }, []);

  const handleExplainTerm = useCallback(async (term: string) => {
    setExplainerTerm(term);
    setExplaining(true);
    setExplanation('');

    try {
      const res = await fetch('/api/education/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term }),
      });

      if (res.ok) {
        const data = await res.json();
        setExplanation(data.explanation);
      } else {
        setExplanation('Unable to fetch explanation. Please try again.');
      }
    } catch {
      setExplanation('Network error. Please try again.');
    } finally {
      setExplaining(false);
    }
  }, []);

  const handleFaqAi = useCallback(async (question: string) => {
    setFaqAiLoading(true);
    setFaqAiAnswer(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: question }],
          locale: translationLang,
          role: 'CUSTOMER',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setFaqAiAnswer(data.message);
      } else {
        setFaqAiAnswer('Unable to get AI answer. Please try again.');
      }
    } catch {
      setFaqAiAnswer('Network error. Please try again.');
    } finally {
      setFaqAiLoading(false);
    }
  }, [translationLang]);

  // AI Translation
  const translateContent = useCallback(async (targetLang: string) => {
    if (targetLang === 'en') {
      setTranslatedContent({});
      setTranslating(false);
      return;
    }

    setTranslating(true);
    try {
      const textsToTranslate = {
        heroTitle: 'E-Sell Education Hub',
        heroSubtitle: 'Learn everything about e-commerce, crypto payments, and building your online business',
        highlightHint: 'Click any highlighted term for an AI-powered explanation',
        searchBar: 'Search videos...',
        featured: 'Featured',
        allVideos: 'All Videos',
        faqTitle: 'Frequently Asked Questions',
        voiceCommandsTitle: 'Voice Commands',
        bookmarkTitle: 'My Bookmarks',
      };

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Translate the following JSON values to ${targetLang}. Return ONLY a valid JSON object with the same keys. Do not add markdown formatting or code blocks.\n\n${JSON.stringify(textsToTranslate)}`,
          }],
          locale: targetLang,
          role: 'CUSTOMER',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        try {
          // Try to parse the AI response as JSON
          let jsonStr = data.message;
          // Strip markdown code blocks if present
          jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const parsed = JSON.parse(jsonStr);
          setTranslatedContent(parsed);
        } catch {
          // If parsing fails, keep original content
          setTranslatedContent({});
        }
      }
    } catch {
      // Keep original content on error
    } finally {
      setTranslating(false);
    }
  }, []);

  const handleLanguageChange = useCallback((lang: string) => {
    setTranslationLang(lang);
    translateContent(lang);
  }, [translateContent]);

  // Voice command handling for education page
  const startVoiceNavigation = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setVoiceFeedback('Voice commands not supported in this browser');
      setTimeout(() => setVoiceFeedback(''), 3000);
      return;
    }

    const SpeechRecognitionAPI = (window as unknown as Record<string, unknown>).SpeechRecognition || (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
    const recognition = new (SpeechRecognitionAPI as any)();
    recognition.continuous = false;
    recognition.interimResults = false;

    const langMap: Record<string, string> = {
      en: 'en-US', ha: 'ha-NG', ig: 'ig-NG', yo: 'yo-NG',
      fr: 'fr-FR', ar: 'ar-SA', zh: 'zh-CN', es: 'es-ES',
    };
    recognition.lang = langMap[translationLang] || 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceFeedback('Listening...');
    };

    recognition.onresult = (event: any) => {
      const result = event.results[0][0].transcript.toLowerCase();
      setVoiceFeedback(`Heard: "${result}"`);

      // Parse voice commands
      if (result.includes('search') || result.includes('find')) {
        const query = result.replace(/search for|find|search/gi, '').trim();
        if (query) setSearchQuery(query);
      } else if (result.includes('category')) {
        const catMatch = CATEGORIES.find((c) =>
          result.includes(c.label.toLowerCase()) || result.includes(c.id)
        );
        if (catMatch) setActiveCategory(catMatch.id);
      } else if (result.includes('bookmark')) {
        if (playingVideo) toggleBookmark(playingVideo.id);
      } else if (result.includes('translate')) {
        const langMatch = TRANSLATION_LANGUAGES.find((l) =>
          result.includes(l.name.toLowerCase()) || result.includes(l.code)
        );
        if (langMatch) handleLanguageChange(langMatch.code);
      } else if (result.includes('explain')) {
        const term = result.replace(/explain/gi, '').trim();
        if (term) handleExplainTerm(term);
      } else if (result.includes('back') || result.includes('home')) {
        window.location.href = '/';
      } else if (result.includes('scroll top') || result.includes('go top')) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (result.includes('scroll bottom') || result.includes('go bottom')) {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      } else if (result.includes('help') || result.includes('commands')) {
        setShowVoiceHelp(true);
      }

      setTimeout(() => setVoiceFeedback(''), 3000);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setVoiceFeedback('Voice recognition error. Try again.');
      setTimeout(() => setVoiceFeedback(''), 3000);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [translationLang, playingVideo, toggleBookmark, handleLanguageChange, handleExplainTerm]);

  const t = (key: string, fallback: string) => translatedContent[key] || fallback;

  const filteredVideos = videos.filter((v) => {
    const matchesCategory = activeCategory === 'all' || v.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBookmarks = !showBookmarks || bookmarks.includes(v.id);
    return matchesCategory && matchesSearch && matchesBookmarks;
  });

  const featuredVideos = filteredVideos.filter((v) => v.featured);
  const regularVideos = filteredVideos.filter((v) => !v.featured);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#006633] dark:border-emerald-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Crypto Ticker Bar - Scrolling */}
      <div className="bg-[#006633] dark:bg-emerald-900 text-white py-2 overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#006633] dark:from-emerald-900 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#006633] dark:from-emerald-900 to-transparent z-10" />
        <div className="flex items-center animate-scroll-x whitespace-nowrap">
          {/* Triple the items for seamless loop */}
          {[0, 1, 2].map((dup) => (
            <div key={dup} className="flex items-center gap-8 shrink-0">
              {cryptoPrices.length > 0 ? cryptoPrices.map((crypto, i) => (
                <div key={`${dup}-${i}`} className="flex items-center gap-2 text-sm px-4">
                  <span className="text-lg">{crypto.icon}</span>
                  <span className="font-bold">{crypto.symbol}</span>
                  <span>${crypto.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  <span className={crypto.change24h.startsWith('+') ? 'text-emerald-200' : 'text-red-300'}>
                    {crypto.change24h}
                  </span>
                </div>
              )) : (
                <>
                  <div className="flex items-center gap-2 text-sm px-4">
                    <span className="font-bold">BNB</span>
                    <span>$612.45</span>
                    <span className="text-emerald-200">+2.3%</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm px-4">
                    <span className="font-bold">BTC</span>
                    <span>$97,250</span>
                    <span className="text-emerald-200">+1.1%</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm px-4">
                    <span className="font-bold">ETH</span>
                    <span>$3,845</span>
                    <span className="text-red-300">-0.5%</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm px-4">
                    <span className="font-bold">USDT</span>
                    <span>$1.00</span>
                    <span className="text-emerald-200">+0.01%</span>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button & Controls Row */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            render={<Link href="/" />}
            nativeButton={false}
            className="text-gray-600 dark:text-gray-400"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Language / Translation Selector */}
            <div className="flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <select
                value={translationLang}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="h-8 rounded-lg border border-input bg-white dark:bg-gray-800 px-2 py-1 text-xs text-gray-900 dark:text-white outline-none focus-visible:border-ring"
                disabled={translating}
              >
                {TRANSLATION_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="dark:bg-gray-800">
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
              {translating && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#006633] dark:border-emerald-400" />
              )}
            </div>

            {/* Voice Navigation Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={startVoiceNavigation}
              className={`gap-1.5 text-xs ${isListening ? 'bg-red-50 dark:bg-red-950/30 border-red-300 text-red-600' : ''}`}
            >
              {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
              {isListening ? 'Listening...' : 'Voice'}
            </Button>

            {/* Voice Help */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowVoiceHelp(!showVoiceHelp)}
              className="text-xs gap-1"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              Commands
            </Button>

            {/* Bookmarks Toggle */}
            <Button
              variant={showBookmarks ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowBookmarks(!showBookmarks)}
              className={`gap-1.5 text-xs ${showBookmarks ? 'bg-[#006633] hover:bg-[#1B6B3A] text-white' : ''}`}
            >
              {showBookmarks ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
              {showBookmarks ? `Bookmarks (${bookmarks.length})` : 'Bookmarks'}
            </Button>
          </div>
        </div>

        {/* Voice Feedback */}
        {voiceFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-[#006633]/10 dark:bg-emerald-400/10 rounded-lg flex items-center gap-2 text-sm"
          >
            <Volume2 className="h-4 w-4 text-[#006633] dark:text-emerald-400" />
            <span className="text-gray-700 dark:text-gray-300">{voiceFeedback}</span>
          </motion.div>
        )}

        {/* Voice Commands Help Panel */}
        <AnimatePresence>
          {showVoiceHelp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <Card className="dark:bg-gray-900 dark:border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                      <Mic className="h-4 w-4 text-[#006633] dark:text-emerald-400" />
                      {t('voiceCommandsTitle', 'Voice Commands')}
                    </h3>
                    <button onClick={() => setShowVoiceHelp(false)} className="text-gray-400 hover:text-gray-600">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Use voice commands to navigate the Education Hub hands-free. Select your language above for recognition in your preferred language.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {VOICE_COMMANDS_EDUCATION.map((cmd, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <code className="bg-[#006633]/10 dark:bg-emerald-400/10 text-[#006633] dark:text-emerald-400 px-1.5 py-0.5 rounded font-mono shrink-0">
                          {cmd.command}
                        </code>
                        <span className="text-gray-600 dark:text-gray-400">{cmd.description}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-[#006633]/10 dark:bg-emerald-400/10 flex items-center justify-center">
              <GraduationCap className="h-7 w-7 text-[#006633] dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                {t('heroTitle', 'E-Sell Education Hub')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {t('heroSubtitle', 'Learn everything about e-commerce, crypto payments, and building your online business')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <TrendingUp className="h-4 w-4" />
            <span>{t('highlightHint', 'Click any ')}<span className="text-[#006633] dark:text-emerald-400 font-medium">highlighted term</span>{' '}for an AI-powered explanation</span>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchBar', 'Search videos...')}
              className="pl-10 dark:bg-gray-900 dark:border-gray-800"
            />
          </div>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8 flex flex-wrap gap-2"
        >
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#006633] text-white dark:bg-emerald-600 shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                {cat.label}
              </button>
            );
          })}
        </motion.div>

        {/* Bookmarks indicator */}
        {showBookmarks && bookmarks.length === 0 && (
          <div className="mb-8 text-center py-8">
            <Bookmark className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No bookmarks yet. Click the bookmark icon on any video to save it.</p>
          </div>
        )}

        {/* Featured Videos */}
        {featuredVideos.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#006633] dark:text-emerald-400" />
              {t('featured', 'Featured')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredVideos.map((video, i) => {
                const ytId = extractYouTubeId(video.youtubeUrl);
                const isBookmarked = bookmarks.includes(video.id);
                return (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card
                      className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden dark:bg-gray-900 dark:border-gray-800 border-[#006633]/20 dark:border-emerald-400/20"
                      onClick={() => setPlayingVideo(video)}
                    >
                      <div className="h-44 bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                        {ytId ? (
                          <img
                            src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Play className="h-10 w-10 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                          <Play className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <Badge className="absolute top-2 left-2 bg-[#006633] text-white text-xs">
                          Featured
                        </Badge>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleBookmark(video.id); }}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 dark:bg-gray-900/80 hover:bg-white dark:hover:bg-gray-900 transition-colors"
                        >
                          {isBookmarked ? (
                            <BookmarkCheck className="h-4 w-4 text-[#006633] dark:text-emerald-400" />
                          ) : (
                            <Bookmark className="h-4 w-4 text-gray-500" />
                          )}
                        </button>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2 mb-1">
                          {video.title}
                        </h3>
                        {video.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                            {highlightTerms(video.description, handleExplainTerm)}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* All Videos Grid */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {activeCategory === 'all' ? t('allVideos', 'All Videos') : CATEGORIES.find((c) => c.id === activeCategory)?.label + ' Videos'}
            <Badge variant="secondary" className="ml-2 text-xs">{filteredVideos.length}</Badge>
          </h2>
          {filteredVideos.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No videos found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {regularVideos.map((video, i) => {
                const ytId = extractYouTubeId(video.youtubeUrl);
                const isBookmarked = bookmarks.includes(video.id);
                return (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Card
                      className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden dark:bg-gray-900 dark:border-gray-800"
                      onClick={() => setPlayingVideo(video)}
                    >
                      <div className="h-36 bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                        {ytId ? (
                          <img
                            src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Play className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                          <Play className="h-10 w-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleBookmark(video.id); }}
                          className="absolute top-2 right-2 p-1 rounded-full bg-white/80 dark:bg-gray-900/80 hover:bg-white dark:hover:bg-gray-900 transition-colors"
                        >
                          {isBookmarked ? (
                            <BookmarkCheck className="h-3.5 w-3.5 text-[#006633] dark:text-emerald-400" />
                          ) : (
                            <Bookmark className="h-3.5 w-3.5 text-gray-500" />
                          )}
                        </button>
                      </div>
                      <CardContent className="p-3">
                        <h3 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2 mb-1">
                          {video.title}
                        </h3>
                        {video.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                            {highlightTerms(video.description, handleExplainTerm)}
                          </p>
                        )}
                        <Badge variant="secondary" className="mt-2 text-xs capitalize">
                          {video.category?.replace('-', ' ')}
                        </Badge>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* AI Concept Explainer Modal */}
        <AnimatePresence>
          {explainerTerm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
              onClick={() => { setExplainerTerm(null); setExplanation(''); }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[#006633] dark:text-emerald-400" />
                    <h3 className="font-bold text-gray-900 dark:text-white">AI Explainer</h3>
                  </div>
                  <button
                    onClick={() => { setExplainerTerm(null); setExplanation(''); }}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                <div className="mb-3">
                  <Badge className="bg-[#006633]/10 text-[#006633] dark:bg-emerald-400/10 dark:text-emerald-400 text-sm px-3 py-1">
                    {explainerTerm}
                  </Badge>
                </div>
                {explaining ? (
                  <div className="flex items-center gap-2 py-4">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#006633] dark:border-emerald-400" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Explaining...</span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {explanation}
                  </p>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Video Player Modal */}
        <AnimatePresence>
          {playingVideo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
              onClick={() => setPlayingVideo(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-black rounded-2xl overflow-hidden max-w-4xl w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-4 py-3 bg-gray-900">
                  <h3 className="font-medium text-white text-sm truncate pr-4">{playingVideo.title}</h3>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleBookmark(playingVideo.id); }}
                      className="p-1 hover:bg-gray-800 rounded-full transition-colors"
                    >
                      {bookmarks.includes(playingVideo.id) ? (
                        <BookmarkCheck className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Bookmark className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={() => setPlayingVideo(null)}
                      className="p-1 hover:bg-gray-800 rounded-full transition-colors"
                    >
                      <X className="h-5 w-5 text-gray-400" />
                    </button>
                  </div>
                </div>
                {(() => {
                  const ytId = extractYouTubeId(playingVideo.youtubeUrl);
                  return ytId ? (
                    <div className="aspect-video">
                      <iframe
                        src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
                        title={playingVideo.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="aspect-video flex items-center justify-center bg-gray-900">
                      <p className="text-gray-400">Unable to load video</p>
                    </div>
                  );
                })()}
                {playingVideo.description && (
                  <div className="px-4 py-3 bg-gray-900">
                    <p className="text-sm text-gray-300">
                      {highlightTerms(playingVideo.description, handleExplainTerm)}
                    </p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-[#006633] dark:text-emerald-400" />
            {t('faqTitle', 'Frequently Asked Questions')}
          </h2>
          <div className="max-w-3xl space-y-3">
            {FAQ_ITEMS.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="dark:bg-gray-900 dark:border-gray-800 overflow-hidden">
                  <button
                    className="w-full p-4 flex items-center justify-between text-left"
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  >
                    <span className="font-medium text-gray-900 dark:text-white text-sm pr-4">
                      {faq.question}
                    </span>
                    {expandedFaq === index ? (
                      <ChevronUp className="h-4 w-4 text-gray-500 shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500 shrink-0" />
                    )}
                  </button>
                  <AnimatePresence>
                    {expandedFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-4 pb-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            {highlightTerms(faq.answer, handleExplainTerm)}
                          </p>
                          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleFaqAi(faq.question)}
                              disabled={faqAiLoading}
                              className="text-xs"
                            >
                              <Sparkles className="h-3 w-3 mr-1" />
                              {faqAiLoading ? 'Getting AI answer...' : 'Ask AI for more details'}
                            </Button>
                            {faqAiAnswer && (
                              <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-3 p-3 bg-[#006633]/5 dark:bg-emerald-400/5 rounded-lg"
                              >
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                  {faqAiAnswer}
                                </p>
                                <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                                  <ThumbsUp className="h-3 w-3" />
                                  <span>Powered by E-Sell AI</span>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Education AI Chatbot */}
      <EducationChatbot />
    </div>
  );
}

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Mic, MicOff, Globe, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/* ──────────── Types ──────────── */

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

/* ──────────── Language Config ──────────── */

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ha', label: 'Hausa', flag: '🇳🇬' },
  { code: 'ig', label: 'Igbo', flag: '🇳🇬' },
  { code: 'yo', label: 'Yorùbá', flag: '🇳🇬' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
] as const;

const LANG_MAP: Record<string, string> = {
  en: 'en-US',
  ha: 'ha-NG',
  ig: 'ig-NG',
  yo: 'yo-NG',
  fr: 'fr-FR',
  ar: 'ar-SA',
  zh: 'zh-CN',
  es: 'es-ES',
};

const WELCOME_MESSAGE =
  "Hello! I'm your E-Sell Education AI. Ask me anything about e-commerce, crypto, or the platform!";

/* ──────────── System Prompt ──────────── */

const SYSTEM_CONTEXT = `You are the E-Sell Education AI assistant. You help users understand the E-Sell platform. You are knowledgeable about:

1. **E-Sell Platform Features**: AI-powered chatbot (Aethex), voice commands, professional storefronts, multi-language support (English, Hausa, Igbo, Yorùbá, French, Arabic, Chinese, Spanish).
2. **Crypto Payments**: E-Sell supports cryptocurrency payments via BSC (Binance Smart Chain), BEP-20 tokens, and wallet integrations (MetaMask, Trust Wallet). Merchants can deploy their own BEP-20 tokens.
3. **Wallets & BSC**: How to set up MetaMask, secure crypto wallets, understand BSC network, and manage wallet addresses for receiving payments.
4. **Trust Badges**: E-Sell uses trust badges (Verified, Trusted, Premium) to signal merchant reliability. These are earned through consistent good practices and verification.
5. **Store Setup**: Merchants can create stores with custom themes (MarketHub, ProServe, CreativeStudio, TechStore, FoodMarket), add products, manage staff, and configure payment options.
6. **Education Videos**: The page features tutorial videos including "How to Set Up Your E-Sell Store", "Using the AI Chatbot on E-Sell", "How to Set Up MetaMask for Payments", and "Securing Your Crypto Wallet".

Keep answers concise, friendly, and helpful. If asked about something unrelated, gently redirect to E-Sell topics.`;

/* ──────────── Component ──────────── */

export default function EducationChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [listening, setListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const greetingAddedRef = useRef(false);

  /* ── Greeting ── */
  useEffect(() => {
    if (isOpen && !greetingAddedRef.current) {
      greetingAddedRef.current = true;
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: WELCOME_MESSAGE,
        },
      ]);
    }
  }, [isOpen]);

  /* ── Auto-scroll ── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  /* ── Close lang menu on outside click ── */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setShowLangMenu(false);
      }
    }
    if (showLangMenu) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showLangMenu]);

  /* ── Send Message ── */
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || loading) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: content.trim(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setLoading(true);

      try {
        const conversationHistory = [
          { role: 'system' as const, content: SYSTEM_CONTEXT },
          ...messages
            .filter((m) => m.id !== 'welcome')
            .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
          { role: 'user' as const, content: content.trim() },
        ];

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: conversationHistory,
            locale: language,
            role: 'CUSTOMER',
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const aiMsg: ChatMessage = {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content:
              data.message ||
              data.content ||
              data.choices?.[0]?.message?.content ||
              "I couldn't generate a response. Please try again.",
          };
          setMessages((prev) => [...prev, aiMsg]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: `error-${Date.now()}`,
              role: 'assistant',
              content: "I'm having trouble connecting. Please try again.",
            },
          ]);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: 'assistant',
            content: 'Connection error. Please check your network and try again.',
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, language],
  );

  /* ── Voice Input ── */
  const toggleVoice = useCallback(() => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    const SpeechRecognitionAPI = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setMessages((prev) => [
        ...prev,
        {
          id: `info-${Date.now()}`,
          role: 'assistant',
          content: 'Voice input is not supported in your browser. Please type your question instead.',
        },
      ]);
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = LANG_MAP[language] || 'en-US';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [listening, language]);

  /* ── Quick Suggestions ── */
  const quickSuggestions = [
    'How do crypto payments work?',
    'Set up my store',
    'What are trust badges?',
    'How to use MetaMask?',
  ];

  /* ──────────── Render ──────────── */

  return (
    <>
      {/* ── Floating Chat Button ── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 left-6 z-50 group"
            aria-label="Open Education AI Chat"
          >
            {/* Outer glow ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  'radial-gradient(circle, rgba(0,102,51,0.3) 0%, transparent 70%)',
              }}
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Inner pulse ring */}
            <motion.div
              className="absolute -inset-1 rounded-full border-2 border-[#006633]/40"
              animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Main button */}
            <div
              className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl"
              style={{
                background:
                  'linear-gradient(135deg, #006633 0%, #00875A 50%, #006633 100%)',
                boxShadow:
                  '0 0 20px rgba(0,102,51,0.4), 0 0 40px rgba(0,102,51,0.15), inset 0 1px 0 rgba(255,255,255,0.2)',
              }}
            >
              <Bot className="h-6 w-6 text-white drop-shadow-lg" />

              {/* Holographic shimmer */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 45%, rgba(255,255,255,0.1) 50%, transparent 55%)',
                }}
                animate={{ x: ['-100%', '200%'] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  repeatDelay: 2,
                }}
              />
            </div>

            {/* Sparkle accents */}
            <motion.div
              className="absolute -top-1 -right-1"
              animate={{ scale: [0, 1, 0], rotate: [0, 180, 360] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            >
              <Sparkles className="h-3 w-3 text-emerald-400 drop-shadow-lg" />
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat Panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed bottom-6 left-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] flex flex-col overflow-hidden rounded-2xl"
            style={{
              height: 'min(560px, calc(100vh - 3rem))',
              background:
                'rgba(255,255,255,0.72) linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(240,253,244,0.7) 100%)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              boxShadow:
                '0 8px 32px rgba(0,102,51,0.12), 0 0 0 1px rgba(0,102,51,0.08), inset 0 1px 0 rgba(255,255,255,0.5)',
            }}
          >
            {/* Dark mode overrides via Tailwind */}
            <div className="dark:hidden" />
            <style jsx>{`
              .glass-panel {
                background: rgba(255,255,255,0.72);
                background: linear-gradient(
                  135deg,
                  rgba(255, 255, 255, 0.8) 0%,
                  rgba(240, 253, 244, 0.7) 100%
                );
                backdrop-filter: blur(24px) saturate(180%);
                -webkit-backdrop-filter: blur(24px) saturate(180%);
                box-shadow: 0 8px 32px rgba(0, 102, 51, 0.12),
                  0 0 0 1px rgba(0, 102, 51, 0.08),
                  inset 0 1px 0 rgba(255, 255, 255, 0.5);
              }
              :root.dark .glass-panel,
              .dark .glass-panel {
                background: rgba(10, 20, 15, 0.78);
                background: linear-gradient(
                  135deg,
                  rgba(10, 20, 15, 0.82) 0%,
                  rgba(0, 40, 20, 0.7) 100%
                );
                backdrop-filter: blur(24px) saturate(180%);
                -webkit-backdrop-filter: blur(24px) saturate(180%);
                box-shadow: 0 8px 32px rgba(0, 255, 102, 0.08),
                  0 0 0 1px rgba(0, 255, 102, 0.12),
                  inset 0 1px 0 rgba(0, 255, 102, 0.06);
              }
              .dark .chat-header {
                background: linear-gradient(
                  135deg,
                  rgba(0, 102, 51, 0.95) 0%,
                  rgba(0, 135, 90, 0.92) 100%
                );
                box-shadow: 0 4px 20px rgba(0, 255, 102, 0.15);
              }
              .dark .msg-ai {
                background: rgba(0, 255, 102, 0.06);
                border: 1px solid rgba(0, 255, 102, 0.12);
              }
              .dark .msg-user {
                background: linear-gradient(
                  135deg,
                  #006633 0%,
                  #00875a 100%
                );
                box-shadow: 0 0 12px rgba(0, 255, 102, 0.2);
              }
              .dark .chat-input-area {
                background: rgba(10, 20, 15, 0.6);
                border-top: 1px solid rgba(0, 255, 102, 0.1);
              }
              .dark .powered-badge {
                background: rgba(0, 255, 102, 0.06);
                border: 1px solid rgba(0, 255, 102, 0.12);
              }
            `}</style>

            {/* ── Header ── */}
            <div
              className="chat-header shrink-0 px-4 py-3 flex items-center justify-between rounded-t-2xl"
              style={{
                background:
                  'linear-gradient(135deg, #006633 0%, #00875A 100%)',
                boxShadow: '0 4px 20px rgba(0,102,51,0.25)',
              }}
            >
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Bot className="h-4.5 w-4.5 text-white" />
                  </div>
                  <motion.div
                    className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-300"
                    animate={{ scale: [1, 1.2, 1], opacity: [1, 0.6, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-white tracking-wide">
                    E-Sell Education AI
                  </h3>
                  <p className="text-[10px] text-white/60 tracking-wider uppercase">
                    Always learning · Always helping
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Language Selector */}
                <div className="relative" ref={langMenuRef}>
                  <button
                    onClick={() => setShowLangMenu(!showLangMenu)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all text-xs"
                    aria-label="Select language"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">
                      {LANGUAGES.find((l) => l.code === language)?.flag}
                    </span>
                  </button>

                  <AnimatePresence>
                    {showLangMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-10 rounded-xl shadow-2xl overflow-hidden z-50 min-w-[160px] border border-white/10"
                        style={{
                          background:
                            'rgba(255,255,255,0.92) linear-gradient(135deg, rgba(255,255,255,0.95), rgba(240,253,244,0.9))',
                          backdropFilter: 'blur(20px)',
                          WebkitBackdropFilter: 'blur(20px)',
                        }}
                      >
                        <div className="dark:bg-gray-900/90 dark:from-gray-900/95 dark:to-emerald-950/90 py-1">
                          {LANGUAGES.map((lang) => (
                            <button
                              key={lang.code}
                              onClick={() => {
                                setLanguage(lang.code);
                                setShowLangMenu(false);
                              }}
                              className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-colors ${
                                language === lang.code
                                  ? 'text-[#006633] dark:text-emerald-400 bg-[#006633]/5 dark:bg-emerald-400/10 font-medium'
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                              }`}
                            >
                              <span className="text-sm">{lang.flag}</span>
                              {lang.label}
                              {language === lang.code && (
                                <motion.div
                                  layoutId="langIndicator"
                                  className="ml-auto w-1.5 h-1.5 rounded-full bg-[#006633] dark:bg-emerald-400"
                                />
                              )}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
                  aria-label="Close chat"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* ── Messages ── */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className={`flex gap-2 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-md"
                      style={{
                        background:
                          'linear-gradient(135deg, #006633 0%, #00875A 100%)',
                        boxShadow:
                          '0 0 8px rgba(0,102,51,0.3)',
                      }}
                    >
                      <Bot className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}

                  <div className="max-w-[78%]">
                    <div
                      className={`px-3.5 py-2.5 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'msg-user text-white rounded-2xl rounded-br-md'
                          : 'msg-ai text-gray-800 dark:text-gray-100 rounded-2xl rounded-bl-md'
                      }`}
                      style={
                        msg.role === 'user'
                          ? {
                              background:
                                'linear-gradient(135deg, #006633 0%, #00875A 100%)',
                              boxShadow:
                                '0 2px 8px rgba(0,102,51,0.25)',
                            }
                          : {
                              background:
                                'rgba(240,253,244,0.7)',
                              border: '1px solid rgba(0,102,51,0.08)',
                            }
                      }
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* ── Typing Indicator ── */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2 justify-start"
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-md"
                    style={{
                      background:
                        'linear-gradient(135deg, #006633 0%, #00875A 100%)',
                      boxShadow: '0 0 8px rgba(0,102,51,0.3)',
                    }}
                  >
                    <Bot className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div
                    className="msg-ai px-4 py-3 rounded-2xl rounded-bl-md"
                    style={{
                      background: 'rgba(240,253,244,0.7)',
                      border: '1px solid rgba(0,102,51,0.08)',
                    }}
                  >
                    <div className="flex gap-1.5 items-center">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 rounded-full bg-[#006633]/60 dark:bg-emerald-400/60"
                          animate={{
                            y: [0, -6, 0],
                            opacity: [0.4, 1, 0.4],
                          }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.15,
                            ease: 'easeInOut',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Quick Suggestions ── */}
            {messages.length <= 1 && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="px-4 pb-2 flex flex-wrap gap-1.5"
              >
                {quickSuggestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-[11px] px-2.5 py-1.5 rounded-full border transition-all hover:scale-[1.03] active:scale-[0.97] text-gray-600 dark:text-gray-400 hover:text-[#006633] dark:hover:text-emerald-400 border-[#006633]/15 dark:border-emerald-400/15 hover:border-[#006633]/30 dark:hover:border-emerald-400/30 hover:bg-[#006633]/5 dark:hover:bg-emerald-400/5"
                  >
                    <Sparkles className="h-2.5 w-2.5 inline mr-1 opacity-50" />
                    {q}
                  </button>
                ))}
              </motion.div>
            )}

            {/* ── Input Area ── */}
            <div
              className="chat-input-area shrink-0 p-3 flex gap-2 items-end"
              style={{
                background: 'rgba(255,255,255,0.5)',
                borderTop: '1px solid rgba(0,102,51,0.06)',
              }}
            >
              {/* Voice Button */}
              <Button
                variant="outline"
                size="icon"
                onClick={toggleVoice}
                className={`shrink-0 h-9 w-9 rounded-xl transition-all duration-300 ${
                  listening
                    ? 'bg-red-50 border-red-300 text-red-600 dark:bg-red-950/30 dark:border-red-800 dark:text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
                    : 'border-[#006633]/15 dark:border-emerald-400/15 text-[#006633] dark:text-emerald-400 hover:bg-[#006633]/5 dark:hover:bg-emerald-400/10'
                }`}
                aria-label={listening ? 'Stop voice input' : 'Start voice input'}
              >
                <AnimatePresence mode="wait">
                  {listening ? (
                    <motion.div
                      key="mic-off"
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <MicOff className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="mic-on"
                      initial={{ scale: 0, rotate: 90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: -90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Mic className="h-4 w-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>

              {/* Text Input */}
              <div className="flex-1 relative">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(input);
                    }
                  }}
                  placeholder="Ask about e-sell, crypto..."
                  className="h-9 text-sm rounded-xl border-[#006633]/10 dark:border-emerald-400/10 dark:bg-gray-900/40 bg-white/60 focus:border-[#006633]/30 dark:focus:border-emerald-400/30 focus:ring-[#006633]/10 dark:focus:ring-emerald-400/10 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  disabled={loading}
                />
                {listening && (
                  <motion.div
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                  </motion.div>
                )}
              </div>

              {/* Send Button */}
              <Button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                className="shrink-0 h-9 w-9 p-0 rounded-xl text-white transition-all duration-300 hover:shadow-lg disabled:opacity-40"
                style={{
                  background: input.trim()
                    ? 'linear-gradient(135deg, #006633 0%, #00875A 100%)'
                    : undefined,
                  boxShadow: input.trim()
                    ? '0 0 12px rgba(0,102,51,0.3)'
                    : 'none',
                }}
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* ── Powered Badge ── */}
            <div
              className="powered-badge shrink-0 px-4 py-1.5 text-center"
              style={{
                background: 'rgba(240,253,244,0.4)',
                borderTop: '1px solid rgba(0,102,51,0.04)',
              }}
            >
              <p className="text-[10px] text-gray-400 dark:text-gray-500 tracking-wider">
                <Sparkles className="h-2.5 w-2.5 inline mr-0.5 opacity-40" />
                Powered by <span className="font-medium text-[#006633]/60 dark:text-emerald-400/60">E-Sell AI</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

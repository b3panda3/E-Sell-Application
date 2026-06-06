'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Newspaper, X, Send, Mic, MicOff, Globe, Sparkles, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface NewsChatboxProps {
  /** Optional override – currently unused but keeps the API extensible */
  primaryColor?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BRAND_COLOR = '#006633';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ha', label: 'Hausa' },
  { code: 'ig', label: 'Igbo' },
  { code: 'yo', label: 'Yorùbá' },
  { code: 'fr', label: 'Français' },
  { code: 'ar', label: 'العربية' },
  { code: 'zh', label: '中文' },
  { code: 'es', label: 'Español' },
] as const;

const LANG_MAP: Record<string, string> = {
  en: 'en-US', ha: 'ha-NG', ig: 'ig-NG', yo: 'yo-NG',
  fr: 'fr-FR', ar: 'ar-SA', zh: 'zh-CN', es: 'es-ES',
};

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Welcome to E-Sell News AI! I can analyze news articles, discuss market trends, and provide insights for your store. Share a news link or ask me anything!',
};

const NEWS_SYSTEM_PROMPT =
  `You are the E-Sell News AI Analyst — a sharp, insightful, and approachable expert specializing in financial news, cryptocurrency markets, business trends, and their direct impact on small businesses and merchants on the E-Sell platform.

CORE CAPABILITIES:
• Analyze news articles and URLs shared by the user — break down key takeaways, market implications, and actionable insights.
• Discuss cryptocurrency and blockchain developments (BSC/BEP-20, DeFi, market movements).
• Provide store-specific advice: when a user identifies themselves via their E-Sell code (ES-XXXX) or store name, tailor your analysis and recommendations to their business category and context.
• Explain complex financial concepts in simple, accessible language.

BEHAVIOUR GUIDELINES:
1. Be concise — aim for under 250 words unless the user asks for detail.
2. When a news URL is provided, summarize the article, highlight what matters for merchants, and note any actionable steps.
3. When a user provides an E-Sell code, acknowledge their store identity and make your advice store-specific where possible.
4. If asked about something outside your expertise, say so honestly and redirect to what you can help with.
5. Respond in the user's preferred language when possible (locale will be provided).
6. Always include a brief "What this means for your store" section when discussing market-moving news.
7. Never fabricate data — if you don't have the information, say so.

RESPONSE FORMAT FOR NEWS ANALYSIS:
📌 **Summary**: 1-2 sentence overview
📊 **Key Takeaways**: Bullet points
💡 **What this means for your store**: Practical advice
🔗 **Related**: Suggest follow-up topics

You are not a financial advisor. Always remind users to do their own research before making investment decisions.`;

/** Quick-action chips shown alongside the welcome message */
const QUICK_ACTIONS = [
  '📈 Latest crypto trends',
  '💼 Business news today',
  '🔗 Analyze a news link',
  '🏪 Store-specific advice',
];

// ---------------------------------------------------------------------------
// URL detection helper
// ---------------------------------------------------------------------------

function containsUrl(text: string): boolean {
  const urlPattern = /https?:\/\/[^\s]+/i;
  return urlPattern.test(text);
}

function extractEsellCode(text: string): string | null {
  const match = text.match(/\bES-[A-Z0-9]{4,}\b/i);
  return match ? match[0].toUpperCase() : null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function NewsChatbox({ primaryColor = BRAND_COLOR }: NewsChatboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [listening, setListening] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Close language menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setShowLangMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // -------------------------------------------------------------------------
  // Send message
  // -------------------------------------------------------------------------

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || loading) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: trimmed,
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setLoading(true);

      // Build the effective user content — prepend E-Sell code context if present
      const esellCode = extractEsellCode(trimmed);
      const hasUrl = containsUrl(trimmed);
      let effectiveContent = trimmed;
      if (esellCode) {
        effectiveContent = `My E-Sell Code is ${esellCode}. ${trimmed}`;
      }
      if (hasUrl) {
        effectiveContent = `[The user shared a news URL for analysis] ${effectiveContent}`;
      }

      try {
        // Build conversation history for the API
        const apiMessages = [
          { role: 'system', content: NEWS_SYSTEM_PROMPT },
          ...messages
            .filter((m) => m.id !== 'welcome')
            .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
          { role: 'user' as const, content: effectiveContent },
        ];

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: apiMessages,
            locale: language,
            role: 'CUSTOMER',
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setMessages((prev) => [
            ...prev,
            {
              id: `ai-${Date.now()}`,
              role: 'assistant',
              content: data.message || "I couldn't generate a response. Please try again.",
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: `error-${Date.now()}`,
              role: 'assistant',
              content: '⚠️ Something went wrong. Please try again in a moment.',
            },
          ]);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: 'assistant',
            content: '⚠️ Connection error. Please check your network and try again.',
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, language],
  );

  // -------------------------------------------------------------------------
  // Voice input
  // -------------------------------------------------------------------------

  const toggleVoice = useCallback(() => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          role: 'assistant',
          content: '🎙️ Voice input is not supported in your browser. Please type your question instead.',
        },
      ]);
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = LANG_MAP[language] || 'en-US';

    recognition.onstart = () => setListening(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  }, [listening, language]);

  // -------------------------------------------------------------------------
  // Render helpers
  // -------------------------------------------------------------------------

  const renderMessageContent = (msg: ChatMessage) => {
    // Simple rendering — split on newlines, handle bold markers
    const lines = msg.content.split('\n');
    return lines.map((line, i) => {
      // Handle bold text with **markers**
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      const rendered = parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={j} className="font-semibold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={j}>{part}</span>;
      });

      return (
        <span key={i}>
          {rendered}
          {i < lines.length - 1 && <br />}
        </span>
      );
    });
  };

  // -------------------------------------------------------------------------
  // JSX
  // -------------------------------------------------------------------------

  return (
    <>
      {/* ────────── Floating Chat Button ────────── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 left-6 z-40 w-14 h-14 rounded-full shadow-lg shadow-[#006633]/30 flex items-center justify-center text-white transition-transform hover:scale-110 active:scale-95 group"
            style={{ backgroundColor: primaryColor }}
            aria-label="Open E-Sell News AI chat"
          >
            <Newspaper className="h-6 w-6 group-hover:rotate-12 transition-transform duration-200" />
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: primaryColor }} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ────────── Chat Panel ────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="fixed bottom-6 left-6 z-40 w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-3rem)] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-white/20 dark:border-white/10"
            style={{
              background: 'rgba(255, 255, 255, 0.72)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            }}
          >
            {/* ── Dark mode override ── */}
            <style>{`
              .dark .news-chat-panel-bg {
                background: rgba(10, 30, 20, 0.78) !important;
                backdrop-filter: blur(20px) saturate(160%) !important;
                -webkit-backdrop-filter: blur(20px) saturate(160%) !important;
              }
            `}</style>
            <div className="news-chat-panel-bg absolute inset-0 rounded-2xl pointer-events-none" />

            <div className="relative flex flex-col h-full z-10">
              {/* ── Header ── */}
              <div
                className="px-4 py-3 text-white flex items-center justify-between shrink-0 rounded-t-2xl"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}cc 100%)`,
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Newspaper className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm leading-tight">E-Sell News AI</p>
                    <p className="text-[10px] text-white/70 leading-tight flex items-center gap-1">
                      <Sparkles className="h-2.5 w-2.5" /> News Analyst
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-0.5">
                  {/* Language selector */}
                  <div className="relative" ref={langMenuRef}>
                    <button
                      onClick={() => setShowLangMenu(!showLangMenu)}
                      className="p-2 rounded-lg hover:bg-white/15 transition-colors flex items-center gap-1.5"
                      aria-label="Select language"
                    >
                      <Globe className="h-4 w-4" />
                      <span className="text-[10px] font-medium uppercase">{language}</span>
                    </button>

                    <AnimatePresence>
                      {showLangMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: -6, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-11 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-xl shadow-xl border border-white/30 dark:border-white/10 py-1.5 z-20 min-w-[140px] max-h-64 overflow-y-auto"
                        >
                          {LANGUAGES.map((lang) => (
                            <button
                              key={lang.code}
                              onClick={() => {
                                setLanguage(lang.code);
                                setShowLangMenu(false);
                              }}
                              className={`w-full text-left px-3 py-2 text-xs hover:bg-white/50 dark:hover:bg-white/10 transition-colors flex items-center gap-2 ${
                                language === lang.code
                                  ? 'font-semibold text-[#006633] dark:text-emerald-400'
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {language === lang.code && (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#006633] dark:bg-emerald-400" />
                              )}
                              <span className={language !== lang.code ? 'ml-3.5' : ''}>
                                {lang.label}
                              </span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Close button */}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg hover:bg-white/15 transition-colors"
                    aria-label="Close chat"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* ── Messages ── */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white shadow-sm"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <Newspaper className="h-3.5 w-3.5" />
                      </div>
                    )}

                    <div className="max-w-[82%]">
                      <div
                        className={`px-3.5 py-2.5 text-sm leading-relaxed ${
                          msg.role === 'user'
                            ? 'text-white rounded-2xl rounded-br-md shadow-sm'
                            : 'bg-white/60 dark:bg-white/10 text-gray-900 dark:text-gray-100 rounded-2xl rounded-bl-md border border-white/40 dark:border-white/10'
                        }`}
                        style={msg.role === 'user' ? { backgroundColor: primaryColor } : undefined}
                      >
                        <p className="whitespace-pre-wrap">{renderMessageContent(msg)}</p>
                      </div>

                      {/* URL indicator for user messages containing links */}
                      {msg.role === 'user' && containsUrl(msg.content) && (
                        <div className="flex items-center gap-1 mt-1 justify-end">
                          <LinkIcon className="h-3 w-3 text-white/60" />
                          <span className="text-[10px] text-white/50">News link shared</span>
                        </div>
                      )}

                      {/* E-Sell code indicator */}
                      {msg.role === 'user' && extractEsellCode(msg.content) && (
                        <div className="flex items-center gap-1 mt-1 justify-end">
                          <Sparkles className="h-3 w-3 text-white/60" />
                          <span className="text-[10px] text-white/50">Store context: {extractEsellCode(msg.content)}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}

                {/* Loading indicator */}
                {loading && (
                  <div className="flex gap-2 justify-start">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white shadow-sm"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Newspaper className="h-3.5 w-3.5" />
                    </div>
                    <div className="bg-white/60 dark:bg-white/10 px-4 py-3 rounded-2xl rounded-bl-md border border-white/40 dark:border-white/10">
                      <div className="flex gap-1.5 items-center">
                        <span className="w-2 h-2 bg-[#006633]/60 dark:bg-emerald-400/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-[#006633]/60 dark:bg-emerald-400/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-[#006633]/60 dark:bg-emerald-400/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* ── Quick Actions (show only at welcome / early conversation) ── */}
              {messages.length <= 2 && (
                <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action}
                      onClick={() => sendMessage(action)}
                      className="text-[11px] px-2.5 py-1.5 rounded-full bg-white/50 dark:bg-white/10 border border-white/40 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-[#006633]/10 dark:hover:bg-emerald-400/10 hover:border-[#006633]/30 dark:hover:border-emerald-400/30 transition-colors backdrop-blur-sm"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}

              {/* ── Input Area ── */}
              <div className="p-3 border-t border-white/20 dark:border-white/10 flex gap-2 shrink-0 bg-white/30 dark:bg-white/5 backdrop-blur-sm">
                {/* Voice button */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleVoice}
                  className={`shrink-0 h-9 w-9 rounded-xl border-white/30 dark:border-white/10 bg-white/40 dark:bg-white/10 backdrop-blur-sm transition-all ${
                    listening
                      ? 'bg-red-500/90 border-red-400 text-white dark:bg-red-500/80 dark:border-red-400 dark:text-white animate-pulse'
                      : 'hover:bg-[#006633]/10 dark:hover:bg-emerald-400/10'
                  }`}
                  aria-label={listening ? 'Stop voice input' : 'Start voice input'}
                >
                  {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>

                {/* Text input */}
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(input);
                    }
                  }}
                  placeholder="Ask about news, markets, or your store..."
                  className="flex-1 h-9 rounded-xl bg-white/50 dark:bg-white/10 border-white/30 dark:border-white/10 backdrop-blur-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:ring-[#006633]/30 dark:focus-visible:ring-emerald-400/30 text-sm"
                  disabled={loading}
                />

                {/* Send button */}
                <Button
                  onClick={() => sendMessage(input)}
                  disabled={loading || !input.trim()}
                  className="shrink-0 h-9 w-9 rounded-xl p-0 text-white shadow-sm transition-all hover:shadow-md disabled:opacity-50"
                  style={{ backgroundColor: primaryColor }}
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {/* ── "Powered by" Badge ── */}
              <div className="px-4 pb-2.5 pt-0.5 text-center shrink-0">
                <p className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center justify-center gap-1">
                  <Sparkles className="h-2.5 w-2.5" />
                  Powered by E-Sell AI
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

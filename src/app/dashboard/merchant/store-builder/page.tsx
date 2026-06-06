'use client';

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Mic,
  Square,
  RotateCcw,
  ArrowLeft,
  Sparkles,
  Store,
  Package,
  Wrench,
  CheckCircle2,
  Loader2,
  Type,
  Trash2,
  Plus,
  ExternalLink,
  Bot,
  Globe,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import Link from 'next/link';

// Types for parsed store data
interface ParsedProduct {
  name: string;
  description: string;
  priceNGN: number;
  category: string;
}

interface ParsedService {
  name: string;
  description: string;
  priceNGN: number;
  duration: string;
}

interface ParsedSocialLinks {
  twitter: string | null;
  instagram: string | null;
  telegram: string | null;
  whatsapp: string | null;
}

interface ParsedStoreData {
  storeName: string;
  description: string;
  category: string;
  aboutUs: string;
  products: ParsedProduct[];
  services: ParsedService[];
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  socialLinks: ParsedSocialLinks;
  themePreference: string;
  greeting: string;
}

type Step = 'welcome' | 'record' | 'processing' | 'preview' | 'creating' | 'success';

const THEME_OPTIONS = [
  { value: 'MarketHub', label: 'Market Hub', desc: 'General retail & multi-category stores' },
  { value: 'ProServe', label: 'Pro Serve', desc: 'Professional services & consulting' },
  { value: 'CreativeStudio', label: 'Creative Studio', desc: 'Art, design & creative work' },
  { value: 'TechStore', label: 'Tech Store', desc: 'Electronics & technology products' },
  { value: 'FoodMarket', label: 'Food Market', desc: 'Food vendors & restaurants' },
];

const CATEGORY_OPTIONS = [
  'Electronics', 'Fashion', 'Food', 'Consulting', 'Tech', 'Artisan', 'Other',
];

// Build a synthetic transcript from edited data for re-processing
function buildTranscriptFromData(data: ParsedStoreData): string {
  let text = `My store name is ${data.storeName}. `;
  if (data.description) text += `${data.description}. `;
  text += `It's in the ${data.category} category. `;
  if (data.aboutUs) text += `About us: ${data.aboutUs}. `;
  if (data.products.length > 0) {
    text += `Products: ${data.products.map(p => `${p.name} for ${p.priceNGN} NGN${p.category ? ` in ${p.category}` : ''}`).join(', ')}. `;
  }
  if (data.services.length > 0) {
    text += `Services: ${data.services.map(s => `${s.name} for ${s.priceNGN} NGN${s.duration ? ` (${s.duration})` : ''}`).join(', ')}. `;
  }
  if (data.contactEmail) text += `Email: ${data.contactEmail}. `;
  if (data.contactPhone) text += `Phone: ${data.contactPhone}. `;
  if (data.address) text += `Address: ${data.address}. `;
  const sl = data.socialLinks;
  if (sl.twitter || sl.instagram || sl.telegram || sl.whatsapp) {
    text += 'Social: ';
    if (sl.twitter) text += `Twitter ${sl.twitter} `;
    if (sl.instagram) text += `Instagram ${sl.instagram} `;
    if (sl.telegram) text += `Telegram ${sl.telegram} `;
    if (sl.whatsapp) text += `WhatsApp ${sl.whatsapp} `;
    text += '. ';
  }
  text += `Theme: ${data.themePreference}. `;
  if (data.greeting) text += `Chatbot greeting: ${data.greeting}. `;
  return text;
}

export default function VoiceStoreBuilderPage() {
  const { data: session } = useSession();
  const [step, setStep] = useState<Step>('welcome');
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [textInput, setTextInput] = useState('');
  const [parsedData, setParsedData] = useState<ParsedStoreData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [storeSlug, setStoreSlug] = useState<string | null>(null);
  const [interimText, setInterimText] = useState('');
  const [speechReady, setSpeechReady] = useState(false);

  // Editable form state
  const [editStoreName, setEditStoreName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editAboutUs, setEditAboutUs] = useState('');
  const [editProducts, setEditProducts] = useState<ParsedProduct[]>([]);
  const [editServices, setEditServices] = useState<ParsedService[]>([]);
  const [editContactEmail, setEditContactEmail] = useState('');
  const [editContactPhone, setEditContactPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editSocialLinks, setEditSocialLinks] = useState<ParsedSocialLinks>({
    twitter: null,
    instagram: null,
    telegram: null,
    whatsapp: null,
  });
  const [editTheme, setEditTheme] = useState('MarketHub');
  const [editGreeting, setEditGreeting] = useState('');

  // Speech Recognition
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const speechInitializedRef = useRef(false);

  // Initialize speech recognition when entering record step with voice mode
  const initSpeechRecognition = () => {
    if (speechInitializedRef.current) return;
    speechInitializedRef.current = true;

    const SpeechRecognitionAPI = (window as unknown as Record<string, unknown>).SpeechRecognition || (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recognition = new (SpeechRecognitionAPI as any)();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }
        setTranscript(prev => prev + finalTranscript);
        setInterimText(interimTranscript);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'aborted') {
          setError(`Voice recognition error: ${event.error}`);
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      setSpeechReady(true);
    }
  };

  const startRecording = () => {
    if (!recognitionRef.current) return;
    setTranscript('');
    setInterimText('');
    setError(null);
    try {
      recognitionRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Failed to start voice recognition. Please try again.');
    }
  };

  const stopRecording = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setIsRecording(false);
    setInterimText('');
  };

  // Parse transcript with AI
  const processTranscript = async (text: string) => {
    setStep('processing');
    setError(null);

    try {
      const response = await fetch('/api/store-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text, userId: session?.user?.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process transcript');
      }

      const parsed = data.store.parsedData as ParsedStoreData;
      setParsedData(parsed);

      // Populate edit fields
      setEditStoreName(parsed.storeName || '');
      setEditDescription(parsed.description || '');
      setEditCategory(parsed.category || 'Other');
      setEditAboutUs(parsed.aboutUs || '');
      setEditProducts(parsed.products || []);
      setEditServices(parsed.services || []);
      setEditContactEmail(parsed.contactEmail || '');
      setEditContactPhone(parsed.contactPhone || '');
      setEditAddress(parsed.address || '');
      setEditSocialLinks(parsed.socialLinks || { twitter: null, instagram: null, telegram: null, whatsapp: null });
      setEditTheme(parsed.themePreference || 'MarketHub');
      setEditGreeting(parsed.greeting || '');

      setStep('preview');
    } catch (err) {
      console.error('Processing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process your description');
      setStep('record');
    }
  };

  // Create the store
  const createStore = async () => {
    setStep('creating');
    setError(null);

    try {
      const finalData: ParsedStoreData = {
        storeName: editStoreName,
        description: editDescription,
        category: editCategory,
        aboutUs: editAboutUs,
        products: editProducts.filter(p => p.name.trim()),
        services: editServices.filter(s => s.name.trim()),
        contactEmail: editContactEmail || null,
        contactPhone: editContactPhone || null,
        address: editAddress || null,
        socialLinks: editSocialLinks,
        themePreference: editTheme,
        greeting: editGreeting,
      };

      const response = await fetch('/api/store-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: buildTranscriptFromData(finalData),
          userId: session?.user?.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create store');
      }

      const esellCode = (session?.user as Record<string, unknown>)?.esellCode as string | undefined;
      setStoreSlug(esellCode || null);
      setStep('success');
    } catch (err) {
      console.error('Store creation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create store');
      setStep('preview');
    }
  };

  // Product editing helpers
  const updateProduct = (index: number, field: keyof ParsedProduct, value: string | number) => {
    setEditProducts(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addProduct = () => {
    setEditProducts(prev => [...prev, { name: '', description: '', priceNGN: 0, category: '' }]);
  };

  const removeProduct = (index: number) => {
    setEditProducts(prev => prev.filter((_, i) => i !== index));
  };

  // Service editing helpers
  const updateService = (index: number, field: keyof ParsedService, value: string | number) => {
    setEditServices(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addService = () => {
    setEditServices(prev => [...prev, { name: '', description: '', priceNGN: 0, duration: '' }]);
  };

  const removeService = (index: number) => {
    setEditServices(prev => prev.filter((_, i) => i !== index));
  };

  // Progress indicator
  const steps: { key: Step; label: string }[] = [
    { key: 'welcome', label: 'Start' },
    { key: 'record', label: 'Describe' },
    { key: 'processing', label: 'AI Parse' },
    { key: 'preview', label: 'Review' },
    { key: 'creating', label: 'Create' },
    { key: 'success', label: 'Done' },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === step);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-1 sm:gap-2 py-2">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center">
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                i < currentStepIndex
                  ? 'bg-emerald-500 text-white'
                  : i === currentStepIndex
                  ? 'bg-emerald-600 text-white ring-4 ring-emerald-600/20'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}
            >
              {i < currentStepIndex ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                i + 1
              )}
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-6 sm:w-10 h-0.5 transition-colors duration-300 ${
                  i < currentStepIndex ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step labels */}
      <div className="flex items-center justify-center gap-1 sm:gap-3 text-xs text-gray-500 dark:text-gray-400 -mt-4 mb-4">
        {steps.map((s, i) => (
          <span
            key={s.key}
            className={`${i === currentStepIndex ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''} hidden sm:inline`}
          >
            {s.label}
          </span>
        ))}
      </div>

      {/* ===== STEP: WELCOME ===== */}
      {step === 'welcome' && (
        <div className="flex flex-col items-center justify-center py-8 sm:py-16 space-y-8 animate-in fade-in duration-500">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <Mic className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
          </div>

          <div className="text-center space-y-3">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Voice Store Builder
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg max-w-md mx-auto">
              Set up your entire store by just describing it. Our AI will listen and create everything for you.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <Button
              className="flex-1 h-14 text-base bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
              onClick={() => {
                setInputMode('voice');
                setStep('record');
                initSpeechRecognition();
              }}
            >
              <Mic className="w-5 h-5 mr-2" />
              Use Your Voice
            </Button>
            <Button
              variant="outline"
              className="flex-1 h-14 text-base border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-400 dark:text-emerald-400 dark:hover:bg-emerald-400/10"
              onClick={() => {
                setInputMode('text');
                setStep('record');
              }}
            >
              <Type className="w-5 h-5 mr-2" />
              Type Instead
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg pt-4">
            {[
              { icon: Store, text: 'Store Setup' },
              { icon: Package, text: 'Products & Services' },
              { icon: Bot, text: 'AI Chatbot' },
            ].map(item => (
              <div key={item.text} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <item.icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs text-gray-600 dark:text-gray-400 text-center">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== STEP: RECORD ===== */}
      {step === 'record' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {inputMode === 'voice' ? 'Tell us about your store' : 'Describe your store'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {inputMode === 'voice'
                ? 'Click the microphone and describe your business, products, and services in your own words'
                : 'Type a description of your business, products, and services. Be as detailed as you like!'}
            </p>
          </div>

          {/* Voice Input */}
          {inputMode === 'voice' && (
            <div className="flex flex-col items-center space-y-6">
              {!speechReady ? (
                <Card className="w-full max-w-lg border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30">
                  <CardContent className="p-6 text-center">
                    <p className="text-amber-700 dark:text-amber-400 font-medium">
                      Your browser does not support voice recognition.
                    </p>
                    <p className="text-amber-600 dark:text-amber-500 text-sm mt-2">
                      Please use the text input option instead, or try Chrome/Edge.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setInputMode('text')}
                    >
                      <Type className="w-4 h-4 mr-2" />
                      Switch to Text Input
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Mic Button */}
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
                      isRecording
                        ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 scale-110'
                        : 'bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/25 hover:scale-105'
                    }`}
                    aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                    type="button"
                  >
                    {isRecording ? (
                      <Square className="w-10 h-10 text-white" />
                    ) : (
                      <Mic className="w-12 h-12 text-white" />
                    )}
                    {isRecording && (
                      <>
                        <span className="absolute inset-0 rounded-full animate-ping bg-red-400/30" />
                        <span className="absolute -inset-2 rounded-full border-4 border-red-400/40 animate-pulse" />
                      </>
                    )}
                  </button>

                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isRecording ? 'Listening... tap to stop' : 'Tap to start speaking'}
                  </p>

                  {/* Live Transcript */}
                  {(transcript || interimText) && (
                    <Card className="w-full max-w-lg">
                      <CardHeader>
                        <CardTitle className="text-sm text-gray-500 dark:text-gray-400">Live Transcript</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                          {transcript}
                          <span className="text-gray-400 dark:text-gray-500">{interimText}</span>
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          )}

          {/* Text Input */}
          {inputMode === 'text' && (
            <div className="max-w-lg mx-auto">
              <Textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Example: My store is called TechHub Lagos. I sell laptops, phones, and accessories. We have a MacBook Pro for 850,000 NGN, iPhone 15 for 550,000 NGN, and wireless earbuds for 25,000 NGN. We also offer phone repair service for 15,000 NGN and laptop setup for 20,000 NGN. You can reach us at info@techhublagos.com or call 08012345678. We're located at 15 Computer Village, Ikeja, Lagos. Follow us on Instagram @techhublagos. We want the TechStore theme."
                className="min-h-48 text-base"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Tip: Include your store name, products, prices, services, contact info, and social media links.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                stopRecording();
                setStep('welcome');
                setTranscript('');
                setTextInput('');
                setError(null);
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {(inputMode === 'voice' && transcript) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setTranscript('');
                  setInterimText('');
                }}
                className="text-gray-500"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}

            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
              disabled={
                inputMode === 'voice'
                  ? transcript.trim().length < 10
                  : textInput.trim().length < 10
              }
              onClick={() => {
                if (isRecording) stopRecording();
                const finalTranscript = inputMode === 'voice' ? transcript : textInput;
                processTranscript(finalTranscript);
              }}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Build My Store
            </Button>
          </div>

          {error && (
            <p className="text-center text-red-500 text-sm">{error}</p>
          )}
        </div>
      )}

      {/* ===== STEP: PROCESSING ===== */}
      {step === 'processing' && (
        <div className="flex flex-col items-center justify-center py-16 space-y-6 animate-in fade-in duration-500">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            </div>
            <div className="absolute -inset-3 rounded-full border-4 border-emerald-200 dark:border-emerald-800 animate-spin border-t-emerald-500 dark:border-t-emerald-400" />
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              AI is building your store...
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Analyzing your description and creating your storefront
            </p>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>This may take a few seconds...</span>
          </div>
        </div>
      )}

      {/* ===== STEP: PREVIEW ===== */}
      {step === 'preview' && parsedData && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Review & Edit Your Store
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Verify the details below. You can edit anything before creating your store.
              </p>
            </div>
          </div>

          {/* Store Basics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Store Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input
                    id="storeName"
                    value={editStoreName}
                    onChange={(e) => setEditStoreName(e.target.value)}
                    placeholder="Store name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                  >
                    {CATEGORY_OPTIONS.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Store description"
                  className="min-h-20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aboutUs">About Us</Label>
                <Textarea
                  id="aboutUs"
                  value={editAboutUs}
                  onChange={(e) => setEditAboutUs(e.target.value)}
                  placeholder="About your store"
                  className="min-h-24"
                />
              </div>
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  {THEME_OPTIONS.map(theme => (
                    <button
                      key={theme.value}
                      onClick={() => setEditTheme(theme.value)}
                      className={`p-3 rounded-lg border-2 text-left transition-all cursor-pointer ${
                        editTheme === theme.value
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      type="button"
                    >
                      <p className="font-medium text-sm text-gray-900 dark:text-white">{theme.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{theme.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Products ({editProducts.length})
                </CardTitle>
                <Button variant="outline" size="sm" onClick={addProduct}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {editProducts.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                  No products yet. Click &quot;Add&quot; to create one.
                </p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar pr-1">
                  {editProducts.map((product, index) => (
                    <div key={index} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3 relative">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                        onClick={() => removeProduct(index)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Product Name</Label>
                          <Input
                            value={product.name}
                            onChange={(e) => updateProduct(index, 'name', e.target.value)}
                            placeholder="Product name"
                            className="h-7 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Category</Label>
                          <Input
                            value={product.category}
                            onChange={(e) => updateProduct(index, 'category', e.target.value)}
                            placeholder="Category"
                            className="h-7 text-sm"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Description</Label>
                        <Input
                          value={product.description}
                          onChange={(e) => updateProduct(index, 'description', e.target.value)}
                          placeholder="Product description"
                          className="h-7 text-sm"
                        />
                      </div>
                      <div className="w-40 space-y-1">
                        <Label className="text-xs">Price (NGN)</Label>
                        <Input
                          type="number"
                          value={product.priceNGN || ''}
                          onChange={(e) => updateProduct(index, 'priceNGN', Number(e.target.value))}
                          placeholder="0"
                          className="h-7 text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Services ({editServices.length})
                </CardTitle>
                <Button variant="outline" size="sm" onClick={addService}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {editServices.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                  No services yet. Click &quot;Add&quot; to create one.
                </p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar pr-1">
                  {editServices.map((service, index) => (
                    <div key={index} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3 relative">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                        onClick={() => removeService(index)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Service Name</Label>
                          <Input
                            value={service.name}
                            onChange={(e) => updateService(index, 'name', e.target.value)}
                            placeholder="Service name"
                            className="h-7 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Duration</Label>
                          <Input
                            value={service.duration}
                            onChange={(e) => updateService(index, 'duration', e.target.value)}
                            placeholder="e.g. 1 hour"
                            className="h-7 text-sm"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Description</Label>
                        <Input
                          value={service.description}
                          onChange={(e) => updateService(index, 'description', e.target.value)}
                          placeholder="Service description"
                          className="h-7 text-sm"
                        />
                      </div>
                      <div className="w-40 space-y-1">
                        <Label className="text-xs">Price (NGN)</Label>
                        <Input
                          type="number"
                          value={service.priceNGN || ''}
                          onChange={(e) => updateService(index, 'priceNGN', Number(e.target.value))}
                          placeholder="0"
                          className="h-7 text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact & Social */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail" className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={editContactEmail}
                    onChange={(e) => setEditContactEmail(e.target.value)}
                    placeholder="store@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone" className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> Phone
                  </Label>
                  <Input
                    id="contactPhone"
                    value={editContactPhone}
                    onChange={(e) => setEditContactPhone(e.target.value)}
                    placeholder="+234..."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Address
                </Label>
                <Input
                  id="address"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="Store address"
                />
              </div>

              <Separator />

              <div>
                <Label className="flex items-center gap-1.5 mb-3">
                  <Globe className="w-3.5 h-3.5" /> Social Links
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500 dark:text-gray-400">Twitter</Label>
                    <Input
                      value={editSocialLinks.twitter || ''}
                      onChange={(e) => setEditSocialLinks(prev => ({ ...prev, twitter: e.target.value || null }))}
                      placeholder="@handle"
                      className="h-7 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500 dark:text-gray-400">Instagram</Label>
                    <Input
                      value={editSocialLinks.instagram || ''}
                      onChange={(e) => setEditSocialLinks(prev => ({ ...prev, instagram: e.target.value || null }))}
                      placeholder="@handle"
                      className="h-7 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500 dark:text-gray-400">Telegram</Label>
                    <Input
                      value={editSocialLinks.telegram || ''}
                      onChange={(e) => setEditSocialLinks(prev => ({ ...prev, telegram: e.target.value || null }))}
                      placeholder="@handle"
                      className="h-7 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500 dark:text-gray-400">WhatsApp</Label>
                    <Input
                      value={editSocialLinks.whatsapp || ''}
                      onChange={(e) => setEditSocialLinks(prev => ({ ...prev, whatsapp: e.target.value || null }))}
                      placeholder="+234..."
                      className="h-7 text-sm"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Chatbot Greeting */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                AI Chatbot Greeting
              </CardTitle>
              <CardDescription>
                This message will greet visitors when they open your store&apos;s AI chatbot.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={editGreeting}
                onChange={(e) => setEditGreeting(e.target.value)}
                placeholder="Hi! How can I help you today?"
                className="min-h-20"
              />
            </CardContent>
          </Card>

          {/* Error display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-8">
            <Button
              variant="outline"
              onClick={() => {
                setStep('record');
                setError(null);
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Re-record / Re-type
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 h-12 text-base"
              onClick={createStore}
              disabled={!editStoreName.trim()}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Create My Store
            </Button>
          </div>
        </div>
      )}

      {/* ===== STEP: CREATING ===== */}
      {step === 'creating' && (
        <div className="flex flex-col items-center justify-center py-16 space-y-6 animate-in fade-in duration-500">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Store className="w-10 h-10 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            </div>
            <div className="absolute -inset-3 rounded-full border-4 border-emerald-200 dark:border-emerald-800 animate-spin border-t-emerald-500 dark:border-t-emerald-400" />
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Creating your store...
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Setting up your storefront, products, and AI chatbot
            </p>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Almost there...</span>
          </div>
        </div>
      )}

      {/* ===== STEP: SUCCESS ===== */}
      {step === 'success' && (
        <div className="flex flex-col items-center justify-center py-8 sm:py-16 space-y-8 animate-in fade-in duration-500">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 sm:w-14 sm:h-14 text-emerald-600 dark:text-emerald-400" />
          </div>

          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Your store is ready!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg max-w-md mx-auto">
              We&apos;ve set up your storefront, products, services, and AI chatbot based on your description.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            {storeSlug && (
              <Button
                className="flex-1 h-12 text-base bg-emerald-600 hover:bg-emerald-700 text-white"
                render={<Link href={`/store/${storeSlug}`} />}
                nativeButton={false}
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                View Storefront
              </Button>
            )}
            <Button
              variant="outline"
              className="flex-1 h-12 text-base border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-400 dark:text-emerald-400 dark:hover:bg-emerald-400/10"
              render={<Link href="/dashboard/merchant/storefront" />}
              nativeButton={false}
            >
              <Store className="w-5 h-5 mr-2" />
              Customize Store
            </Button>
          </div>

          <Button
            variant="ghost"
            className="text-gray-500 dark:text-gray-400"
            onClick={() => {
              setStep('welcome');
              setTranscript('');
              setTextInput('');
              setParsedData(null);
              setError(null);
              setStoreSlug(null);
            }}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Build Another Store
          </Button>
        </div>
      )}
    </div>
  );
}

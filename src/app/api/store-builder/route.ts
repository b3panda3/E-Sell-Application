import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

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
  currency?: string;
}

const SYSTEM_PROMPT = `You are a store setup assistant. The user will describe their store in natural language. Extract ALL relevant information into a structured JSON format. Be generous in interpreting what the user means.

Return a JSON object with this exact structure:
{
  "storeName": "string",
  "description": "string",
  "category": "Electronics|Fashion|Food|Consulting|Tech|Artisan|Other",
  "aboutUs": "string - a professional about us description based on what the user said",
  "products": [
    { "name": "string", "description": "string", "priceNGN": number, "category": "string" }
  ],
  "services": [
    { "name": "string", "description": "string", "priceNGN": number, "duration": "string" }
  ],
  "contactEmail": "string or null",
  "contactPhone": "string or null",
  "address": "string or null",
  "socialLinks": { "twitter": "string or null", "instagram": "string or null", "telegram": "string or null", "whatsapp": "string or null" },
  "themePreference": "MarketHub|ProServe|CreativeStudio|TechStore|FoodMarket",
  "greeting": "string - a friendly AI greeting for the store's chatbot",
  "currency": "string - the currency code used for prices (e.g. NGN, USD, EUR, GBP, GHS, KES, ZAR)"
}

If the user doesn't mention something, set it to null (for strings) or empty array (for products/services).
For prices, use the exact numeric value in the currency the user mentioned. The priceNGN field should contain the numeric price value regardless of currency (e.g. if user says $50 USD, set priceNGN to 50 and currency to "USD").
For the theme, pick the most appropriate one based on the store type.
IMPORTANT: Return ONLY the JSON, no other text.`;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { transcript, currency: requestCurrency, products: requestProducts, services: requestServices } = body;

    if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
      return NextResponse.json(
        { error: 'Transcript is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 503 }
      );
    }

    // Step 1: Use Groq API to parse the transcript into structured data
    const aiResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: transcript },
        ],
        max_tokens: 2000,
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorData = await aiResponse.text();
      console.error('Groq API error:', errorData);
      return NextResponse.json(
        { error: 'AI service error - failed to parse transcript' },
        { status: 502 }
      );
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content;

    if (!rawContent) {
      return NextResponse.json(
        { error: 'AI returned empty response' },
        { status: 502 }
      );
    }

    // Parse the JSON from AI response (handle potential markdown code blocks)
    let parsedData: ParsedStoreData;
    try {
      const cleanedContent = rawContent
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      parsedData = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', rawContent, parseError);
      return NextResponse.json(
        { error: 'AI returned invalid JSON. Please try again.' },
        { status: 502 }
      );
    }

    // Step 2: Find or resolve the theme
    let themeId: string | null = null;
    if (parsedData.themePreference) {
      const theme = await db.theme.findFirst({
        where: { name: parsedData.themePreference, isActive: true },
      });
      if (theme) {
        themeId = theme.id;
      }
    }

    // Resolve currency: prefer explicit request, then AI-parsed, then default NGN
    const resolvedCurrency = requestCurrency || parsedData.currency || 'NGN';

    // Step 3: Create or update the Storefront
    const socialLinksJson = parsedData.socialLinks
      ? JSON.stringify(parsedData.socialLinks)
      : null;

    const addressParts: string[] = [];
    if (parsedData.address) addressParts.push(parsedData.address);
    const addressStr = addressParts.length > 0 ? addressParts.join(', ') : null;

    const existingStorefront = await db.storefront.findFirst({
      where: { userId: session.user.id },
    });

    let storefront;

    if (existingStorefront) {
      storefront = await db.storefront.update({
        where: { id: existingStorefront.id },
        data: {
          storeName: parsedData.storeName || existingStorefront.storeName,
          themeId: themeId || existingStorefront.themeId,
          aboutUs: parsedData.aboutUs || existingStorefront.aboutUs,
          address: addressStr || existingStorefront.address,
          socialLinks: socialLinksJson || existingStorefront.socialLinks,
          currency: resolvedCurrency,
          isActive: true,
        },
        include: { theme: true },
      });

      // Delete existing products and services that were created by voice builder
      // (we'll replace them entirely for simplicity)
      await db.product.deleteMany({
        where: { storefrontId: storefront.id },
      });
      await db.service.deleteMany({
        where: { storefrontId: storefront.id },
      });
    } else {
      storefront = await db.storefront.create({
        data: {
          userId: session.user.id,
          storeName: parsedData.storeName || null,
          themeId: themeId,
          aboutUs: parsedData.aboutUs || null,
          address: addressStr || null,
          socialLinks: socialLinksJson,
          currency: resolvedCurrency,
          isActive: true,
        },
        include: { theme: true },
      });
    }

    // Use request products/services if available (from final submission),
    // otherwise fall back to AI-parsed data
    const finalProducts = Array.isArray(requestProducts) && requestProducts.length > 0
      ? requestProducts
      : parsedData.products;
    const finalServices = Array.isArray(requestServices) && requestServices.length > 0
      ? requestServices
      : parsedData.services;

    // Build priceCrypto JSON for non-NGN currencies so the storefront renders correctly
    const buildPriceCrypto = (price: number, currency: string): string | null => {
      if (currency === 'NGN') return null; // NGN is stored natively in priceNGN
      return JSON.stringify({
        amount: price,
        currency: 'BNB', // placeholder crypto for storefront compatibility
        originalCurrency: currency,
        originalAmount: price,
      });
    };

    // Step 4: Create Products
    const createdProducts = [];
    if (finalProducts && Array.isArray(finalProducts)) {
      for (const product of finalProducts) {
        if (product.name && product.priceNGN) {
          const created = await db.product.create({
            data: {
              storefrontId: storefront.id,
              name: product.name,
              description: product.description || null,
              priceNGN: resolvedCurrency === 'NGN' ? Number(product.priceNGN) || 0 : 0,
              priceCrypto: buildPriceCrypto(Number(product.priceNGN) || 0, resolvedCurrency),
              category: product.category || null,
              isActive: true,
            },
          });
          createdProducts.push(created);
        }
      }
    }

    // Step 5: Create Services
    const createdServices = [];
    if (finalServices && Array.isArray(finalServices)) {
      for (const service of finalServices) {
        if (service.name && service.priceNGN) {
          const created = await db.service.create({
            data: {
              storefrontId: storefront.id,
              name: service.name,
              description: service.description || null,
              priceNGN: resolvedCurrency === 'NGN' ? Number(service.priceNGN) || 0 : 0,
              priceCrypto: buildPriceCrypto(Number(service.priceNGN) || 0, resolvedCurrency),
              duration: service.duration || null,
              isActive: true,
            },
          });
          createdServices.push(created);
        }
      }
    }

    // Step 6: Create or update AethexConfig
    if (parsedData.greeting) {
      await db.aethexConfig.upsert({
        where: { storefrontId: storefront.id },
        update: {
          greeting: parsedData.greeting,
          isEnabled: true,
        },
        create: {
          storefrontId: storefront.id,
          greeting: parsedData.greeting,
          isEnabled: true,
        },
      });
    }

    // Step 7: Update user business category if provided
    if (parsedData.category) {
      await db.user.update({
        where: { id: session.user.id },
        data: { businessCategory: parsedData.category },
      });
    }

    // Return the complete store data
    return NextResponse.json({
      success: true,
      store: {
        storefront,
        products: createdProducts,
        services: createdServices,
        parsedData,
      },
    }, { status: existingStorefront ? 200 : 201 });
  } catch (error) {
    console.error('Store Builder API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

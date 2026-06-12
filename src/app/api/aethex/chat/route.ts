import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { message, storefrontId, conversationHistory, language } = await request.json();

    if (!message || !storefrontId) {
      return NextResponse.json({ error: 'Message and storefrontId are required' }, { status: 400 });
    }

    // Fetch storefront with products, services, and AethexConfig
    const storefront = await db.storefront.findUnique({
      where: { id: storefrontId },
      include: {
        user: { select: { name: true, businessCategory: true } },
        products: { where: { isActive: true }, select: { name: true, description: true, priceNGN: true, priceCrypto: true, category: true } },
        services: { where: { isActive: true }, select: { name: true, description: true, priceNGN: true, priceCrypto: true, duration: true } },
        aethexConfig: true,
      },
    });

    if (!storefront) {
      return NextResponse.json({ error: 'Storefront not found' }, { status: 404 });
    }

    const config: any = storefront.aethexConfig;
    const isEnabled = config?.isEnabled ?? true;

    if (!isEnabled) {
      return NextResponse.json({ error: 'Chat is disabled for this store' }, { status: 403 });
    }

    // Build product list text
    const productList = storefront.products
      .map((p) => `- ${p.name}: ₦${p.priceNGN.toLocaleString()}${p.priceCrypto ? ` / ${p.priceCrypto}` : ''}${p.category ? ` (${p.category})` : ''}`)
      .join('\n');

    const serviceList = storefront.services
      .map((s) => `- ${s.name}: ₦${s.priceNGN.toLocaleString()}${s.priceCrypto ? ` / ${s.priceCrypto}` : ''}${s.duration ? ` (${s.duration})` : ''}`)
      .join('\n');

    // Parse FAQs
    let faqText = '';
    if (config?.faqs) {
      try {
        const faqs = JSON.parse(config.faqs);
        faqText = faqs.map((f: { question: string; answer: string }) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n');
      } catch { /* ignore */ }
    }

    const lang = language || config?.language || 'en';

    const systemPrompt = `You are Aethex AI, the friendly customer service assistant for "${storefront.storeName || storefront.user.name}" on the E-Sell platform. You help customers with their questions about products, services, pricing, and store policies.

STORE INFORMATION:
- Store Name: ${storefront.storeName || storefront.user.name}
- Business Category: ${storefront.user.businessCategory || 'General'}
${storefront.aboutUs ? `- About: ${storefront.aboutUs}` : ''}

PRODUCTS:
${productList || 'No products listed'}

SERVICES:
${serviceList || 'No services listed'}

${faqText ? `FREQUENTLY ASKED QUESTIONS:\n${faqText}` : ''}

${config?.customInstructions ? `ADDITIONAL INSTRUCTIONS:\n${config.customInstructions}` : ''}

RULES:
- Be concise, friendly, and helpful
- Respond in the user's language (current: ${lang})
- If you don't know something, say so honestly and offer to escalate to the store owner
- Never make up prices or product details not listed above
- Keep responses under 200 words unless the user asks for detail
- If the customer asks to speak with a human, set escalated to true`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []).map((m: { role: string; content: string }) => ({
        role: m.role as string,
        content: m.content,
      })),
      { role: 'user', content: message },
    ];

    let aiMessage = '';
    let escalated = false;

    // Check if user wants to speak with a human
    const escalationKeywords = ['speak to human', 'talk to human', 'real person', 'human agent', 'escalate', 'manager'];
    if (escalationKeywords.some((kw) => message.toLowerCase().includes(kw))) {
      escalated = true;
      aiMessage = config?.escalationMessage || "Let me connect you with the store owner for more help.";
    } else {
      // Try Aethex API first, fallback to Groq
      try {
        const aethexResponse = await fetch('https://api.aethexai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ae_live_6400b33b98e5ea7e5e59e9607071b0a1',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'aethex-4',
            messages,
            max_tokens: 500,
            temperature: 0.7,
          }),
          signal: AbortSignal.timeout(10000),
        });

        if (aethexResponse.ok) {
          const data = await aethexResponse.json();
          aiMessage = data.choices?.[0]?.message?.content || '';
        } else {
          throw new Error('Aethex API failed');
        }
      } catch {
        // Fallback to Groq
        const groqApiKey = process.env.GROQ_API_KEY;
        if (groqApiKey) {
          const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${groqApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'llama-3.3-70b-versatile',
              messages,
              max_tokens: 500,
              temperature: 0.7,
            }),
          });

          if (groqResponse.ok) {
            const data = await groqResponse.json();
            aiMessage = data.choices?.[0]?.message?.content || 'I\'m sorry, I couldn\'t process your request. Please try again.';
          } else {
            aiMessage = 'I\'m having trouble connecting right now. Please try again later.';
          }
        } else {
          aiMessage = 'AI service is currently unavailable. Please try again later.';
        }
      }
    }

    // Log interaction
    try {
      await db.aethexInteraction.create({
        data: {
          storefrontId,
          question: message,
          answer: aiMessage,
          language: lang,
          escalated,
        },
      });
    } catch (logError) {
      console.error('Failed to log Aethex interaction:', logError);
    }

    return NextResponse.json({ message: aiMessage, escalated });
  } catch (error) {
    console.error('Aethex chat error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storefrontId = searchParams.get('storefrontId');

    if (!storefrontId) {
      return NextResponse.json({ error: 'storefrontId is required' }, { status: 400 });
    }

    const config = await db.aethexConfig.findUnique({
      where: { storefrontId },
      select: {
        isEnabled: true,
        greeting: true,
        language: true,
        faqs: true,
        escalationMessage: true,
      },
    });

    if (!config || !config.isEnabled) {
      return NextResponse.json({ enabled: false });
    }

    // Parse FAQs to get just the questions for quick suggestions
    let faqQuestions: string[] = [];
    if (config.faqs) {
      try {
        const faqs = JSON.parse(config.faqs);
        faqQuestions = faqs.map((f: { question: string }) => f.question).slice(0, 4);
      } catch { /* ignore */ }
    }

    return NextResponse.json({
      enabled: true,
      greeting: config.greeting,
      language: config.language,
      faqQuestions,
      escalationMessage: config.escalationMessage,
    });
  } catch (error) {
    console.error('Aethex public config error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

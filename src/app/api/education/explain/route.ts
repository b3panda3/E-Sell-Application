import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { term, context } = await request.json();

    if (!term) {
      return NextResponse.json({ error: 'Term is required' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 503 });
    }

    const systemPrompt = `You are an expert educator specializing in blockchain, cryptocurrency, decentralized finance (DeFi), and e-commerce. Explain concepts clearly and concisely in simple terms that anyone can understand. Use analogies where helpful. Keep explanations under 150 words. If the term is not related to blockchain/finance/tech, still provide a helpful brief explanation.`;

    const userMessage = context
      ? `Explain the term "${term}" in the context of: ${context}`
      : `Explain the term "${term}" in the context of blockchain, cryptocurrency, or e-commerce.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 300,
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Groq API error:', errorData);
      return NextResponse.json({ error: 'AI service error' }, { status: 502 });
    }

    const data = await response.json();
    const explanation = data.choices?.[0]?.message?.content || 'Unable to generate explanation.';

    return NextResponse.json({ explanation });
  } catch (error) {
    console.error('Education explain error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

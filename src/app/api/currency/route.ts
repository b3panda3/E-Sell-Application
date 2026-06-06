import { NextRequest, NextResponse } from 'next/server';

const FALLBACK_RATES: Record<string, number> = {
  BNB: 650000,
  USDT: 1550,
  USD: 1550,
  EUR: 1680,
  GBP: 1980,
};

let cachedRates: Record<string, number> | null = null;
let cachedAt = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getRates(): Promise<Record<string, number>> {
  const now = Date.now();
  if (cachedRates && now - cachedAt < CACHE_TTL) {
    return cachedRates;
  }

  try {
    const apiKey = process.env.EXCHANGERATE_API_KEY;
    if (apiKey) {
      const res = await fetch(
        `https://v6.exchangerate-api.com/v6/${apiKey}/latest/NGN`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.conversion_rates) {
          const rates: Record<string, number> = {};
          for (const [currency, rate] of Object.entries(
            data.conversion_rates as Record<string, number>
          )) {
            rates[currency] = 1 / rate; // Convert to NGN
          }
          // Override with more accurate crypto rates if available
          rates.BNB = FALLBACK_RATES.BNB;
          rates.USDT = FALLBACK_RATES.USDT;
          cachedRates = rates;
          cachedAt = now;
          return rates;
        }
      }
    }
  } catch {
    // Fallback to hardcoded rates
  }

  cachedRates = FALLBACK_RATES;
  cachedAt = now;
  return FALLBACK_RATES;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const from = (searchParams.get('from') || 'USD').toUpperCase();
    const to = (searchParams.get('to') || 'NGN').toUpperCase();
    const amount = parseFloat(searchParams.get('amount') || '1');

    if (isNaN(amount) || amount < 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    const rates = await getRates();

    if (to === 'NGN') {
      const rate = rates[from];
      if (!rate) {
        return NextResponse.json(
          { error: `Unsupported currency: ${from}` },
          { status: 400 }
        );
      }
      const result = amount * rate;
      return NextResponse.json({
        from,
        to,
        amount,
        rate,
        result: Math.round(result * 100) / 100,
      });
    }

    if (from === 'NGN') {
      const rate = rates[to];
      if (!rate) {
        return NextResponse.json(
          { error: `Unsupported currency: ${to}` },
          { status: 400 }
        );
      }
      const result = amount / rate;
      return NextResponse.json({
        from,
        to,
        amount,
        rate: 1 / rate,
        result: Math.round(result * 100) / 100,
      });
    }

    // Cross conversion via NGN
    const fromRate = rates[from];
    const toRate = rates[to];
    if (!fromRate || !toRate) {
      return NextResponse.json(
        { error: `Unsupported currency` },
        { status: 400 }
      );
    }
    const ngnAmount = amount * fromRate;
    const result = ngnAmount / toRate;
    return NextResponse.json({
      from,
      to,
      amount,
      rate: fromRate / toRate,
      result: Math.round(result * 100) / 100,
    });
  } catch (error) {
    console.error('Currency conversion error:', error);
    return NextResponse.json(
      { error: 'Currency conversion failed' },
      { status: 500 }
    );
  }
}

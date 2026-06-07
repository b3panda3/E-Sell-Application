import { NextRequest, NextResponse } from 'next/server';

// ── Supported Currencies ──────────────────────────────────────────────────────

const SUPPORTED_FIAT = ['NGN', 'USD', 'EUR', 'GBP', 'GHS', 'KES', 'ZAR'] as const;
const SUPPORTED_CRYPTO = ['BNB', 'USDT', 'BTC', 'ETH'] as const;

// ── Fallback rates (all relative to NGN) ──────────────────────────────────────
// These are reasonable approximations used when APIs are unavailable

const FALLBACK_FIAT_TO_NGN: Record<string, number> = {
  NGN: 1,
  USD: 1550,
  EUR: 1680,
  GBP: 1980,
  GHS: 126,
  KES: 12,
  ZAR: 85,
};

const FALLBACK_CRYPTO_TO_USD: Record<string, number> = {
  BNB: 645,
  USDT: 1.0,
  BTC: 104850,
  ETH: 2520,
};

// ── In-memory cache ───────────────────────────────────────────────────────────

interface CachedRates {
  fiatToNGN: Record<string, number>;   // e.g. { USD: 1550, EUR: 1680, ... }
  cryptoToUSD: Record<string, number>; // e.g. { BNB: 645, USDT: 1, ... }
  fetchedAt: number;
}

let cachedRates: CachedRates | null = null;
let cachedAt = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ── Rate Fetching ─────────────────────────────────────────────────────────────

async function fetchFiatRates(): Promise<Record<string, number>> {
  const rates: Record<string, number> = { ...FALLBACK_FIAT_TO_NGN };

  try {
    const apiKey = process.env.EXCHANGERATE_API_KEY;
    if (apiKey) {
      const res = await fetch(
        `https://v6.exchangerate-api.com/v6/${apiKey}/latest/NGN`,
        { next: { revalidate: 0 } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.conversion_rates) {
          for (const fiat of SUPPORTED_FIAT) {
            const rate = data.conversion_rates[fiat];
            if (rate && typeof rate === 'number' && rate > 0) {
              rates[fiat] = 1 / rate; // Convert from "1 NGN = X fiat" to "1 fiat = X NGN"
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('[currency] ExchangeRate-API fetch failed:', error);
  }

  return rates;
}

async function fetchCryptoRates(): Promise<Record<string, number>> {
  const rates: Record<string, number> = { ...FALLBACK_CRYPTO_TO_USD };

  // Primary: CoinAPI.io
  try {
    const coinApiKey = process.env.COINAPI_KEY;
    if (coinApiKey) {
      const symbols = SUPPORTED_CRYPTO.join(';');
      const res = await fetch(
        `https://rest.coinapi.io/v1/assets?filter_asset_id=${symbols}`,
        {
          headers: { 'X-CoinAPI-Key': coinApiKey },
          next: { revalidate: 0 },
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          for (const asset of data) {
            if (
              asset.asset_id &&
              typeof asset.price_usd === 'number' &&
              asset.price_usd > 0
            ) {
              rates[asset.asset_id] = asset.price_usd;
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('[currency] CoinAPI fetch failed, trying LiveCoinWatch fallback:', error);

    // Fallback: LiveCoinWatch
    try {
      const lcwApiKey = process.env.LIVECOINWATCH_API_KEY;
      if (lcwApiKey) {
        const res = await fetch('https://api.livecoinwatch.com/coins/single', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': lcwApiKey,
          },
          body: JSON.stringify({ currency: 'USD', code: 'BNB' }),
          next: { revalidate: 0 },
        });

        // LiveCoinWatch requires per-coin requests, so we'll just try BNB and USDT
        if (res.ok) {
          const data = await res.json();
          if (data?.rate && typeof data.rate === 'number') {
            rates.BNB = data.rate;
          }
        }

        // USDT
        const usdtRes = await fetch('https://api.livecoinwatch.com/coins/single', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': lcwApiKey,
          },
          body: JSON.stringify({ currency: 'USD', code: 'USDT' }),
          next: { revalidate: 0 },
        });
        if (usdtRes.ok) {
          const usdtData = await usdtRes.json();
          if (usdtData?.rate && typeof usdtData.rate === 'number') {
            rates.USDT = usdtData.rate;
          }
        }
      }
    } catch (fallbackError) {
      console.error('[currency] LiveCoinWatch fallback also failed:', fallbackError);
    }
  }

  return rates;
}

async function getRates(): Promise<CachedRates> {
  const now = Date.now();
  if (cachedRates && now - cachedAt < CACHE_TTL) {
    return cachedRates;
  }

  const [fiatToNGN, cryptoToUSD] = await Promise.all([
    fetchFiatRates(),
    fetchCryptoRates(),
  ]);

  cachedRates = { fiatToNGN, cryptoToUSD, fetchedAt: now };
  cachedAt = now;

  return cachedRates;
}

// ── Conversion Logic ──────────────────────────────────────────────────────────

function isCrypto(currency: string): boolean {
  return (SUPPORTED_CRYPTO as readonly string[]).includes(currency);
}

function isFiat(currency: string): boolean {
  return (SUPPORTED_FIAT as readonly string[]).includes(currency);
}

function convert(
  rates: CachedRates,
  from: string,
  to: string,
  amount: number
): { rate: number; result: number } | null {
  // Both fiat
  if (isFiat(from) && isFiat(to)) {
    const fromNGN = rates.fiatToNGN[from];
    const toNGN = rates.fiatToNGN[to];
    if (!fromNGN || !toNGN) return null;
    const ngnAmount = amount * fromNGN;
    const result = ngnAmount / toNGN;
    return { rate: fromNGN / toNGN, result };
  }

  // Both crypto
  if (isCrypto(from) && isCrypto(to)) {
    const fromUSD = rates.cryptoToUSD[from];
    const toUSD = rates.cryptoToUSD[to];
    if (!fromUSD || !toUSD) return null;
    const usdAmount = amount * fromUSD;
    const result = usdAmount / toUSD;
    return { rate: fromUSD / toUSD, result };
  }

  // Fiat → Crypto
  if (isFiat(from) && isCrypto(to)) {
    const fromNGN = rates.fiatToNGN[from];
    const toUSD = rates.cryptoToUSD[to];
    const ngnToUSD = rates.fiatToNGN['USD'];
    if (!fromNGN || !toUSD || !ngnToUSD) return null;

    // Convert fiat to USD first, then USD to crypto
    const usdAmount = (amount * fromNGN) / ngnToUSD;
    const result = usdAmount / toUSD;
    const rate = fromNGN / (ngnToUSD * toUSD);
    return { rate, result };
  }

  // Crypto → Fiat
  if (isCrypto(from) && isFiat(to)) {
    const fromUSD = rates.cryptoToUSD[from];
    const toNGN = rates.fiatToNGN[to];
    const ngnToUSD = rates.fiatToNGN['USD'];
    if (!fromUSD || !toNGN || !ngnToUSD) return null;

    // Convert crypto to USD first, then USD to fiat
    const usdAmount = amount * fromUSD;
    const ngnAmount = usdAmount * ngnToUSD;
    const result = ngnAmount / toNGN;
    const rate = (fromUSD * ngnToUSD) / toNGN;
    return { rate, result };
  }

  return null;
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    const rates = await getRates();

    // ?action=rates — Return all supported currency rates
    if (action === 'rates') {
      return NextResponse.json({
        fiatToNGN: rates.fiatToNGN,
        cryptoToUSD: rates.cryptoToUSD,
        supportedFiat: SUPPORTED_FIAT,
        supportedCrypto: SUPPORTED_CRYPTO,
        fetchedAt: rates.fetchedAt,
        cached: Date.now() - rates.fetchedAt < CACHE_TTL,
      });
    }

    // Default: currency conversion
    const from = (searchParams.get('from') || 'USD').toUpperCase();
    const to = (searchParams.get('to') || 'NGN').toUpperCase();
    const amount = parseFloat(searchParams.get('amount') || '1');

    if (isNaN(amount) || amount < 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    const conversion = convert(rates, from, to, amount);

    if (!conversion) {
      return NextResponse.json(
        { error: `Unsupported currency: ${from} or ${to}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      from,
      to,
      amount,
      rate: Math.round(conversion.rate * 1e8) / 1e8,
      result: Math.round(conversion.result * 1e8) / 1e8,
    });
  } catch (error) {
    console.error('Currency conversion error:', error);
    return NextResponse.json(
      { error: 'Currency conversion failed' },
      { status: 500 }
    );
  }
}

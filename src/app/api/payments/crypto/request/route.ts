import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { nanoid } from 'nanoid';

const CRYPTO_EXPIRY_MINUTES = 30;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, currency } = await req.json();
    if (!orderId || !currency) {
      return NextResponse.json(
        { error: 'orderId and currency are required' },
        { status: 400 }
      );
    }

    const validCurrencies = ['BNB', 'USDT'];
    if (!validCurrencies.includes(currency.toUpperCase())) {
      return NextResponse.json(
        { error: `Supported currencies: ${validCurrencies.join(', ')}` },
        { status: 400 }
      );
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        merchant: { include: { walletAddresses: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.customerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get merchant's wallet address for BSC
    const wallet = order.merchant.walletAddresses.find(
      (w: any) => w.network === 'BSC' && w.isVerified
    ) || order.merchant.walletAddresses.find(
      (w: any) => w.network === 'BSC'
    );

    if (!wallet) {
      return NextResponse.json(
        { error: 'Merchant has no BSC wallet address configured' },
        { status: 400 }
      );
    }

    // Convert NGN to crypto amount
    let cryptoAmount = 0;
    try {
      const curRes = await fetch(
        `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/currency?from=${currency.toUpperCase()}&to=NGN&amount=1`
      );
      if (curRes.ok) {
        const curData = await curRes.json();
        cryptoAmount = order.totalNGN / curData.rate;
      }
    } catch {
      // Fallback calculation
      const fallbackRates: Record<string, number> = {
        BNB: 650000,
        USDT: 1550,
      };
      cryptoAmount = order.totalNGN / (fallbackRates[currency.toUpperCase()] || 1550);
    }

    cryptoAmount = Math.round(cryptoAmount * 1000000) / 1000000;

    const payment = await db.payment.create({
      data: {
        orderId: order.id,
        method: currency.toLowerCase(),
        amount: cryptoAmount,
        reference: `CRYPTO-${nanoid(12)}`,
        status: 'pending',
      },
    });

    const expiresAt = new Date(
      Date.now() + CRYPTO_EXPIRY_MINUTES * 60 * 1000
    ).toISOString();

    return NextResponse.json({
      walletAddress: wallet.address,
      amount: cryptoAmount,
      currency: currency.toUpperCase(),
      qrData: `${wallet.address}?value=${cryptoAmount}&currency=${currency.toUpperCase()}`,
      paymentId: payment.id,
      expiresAt,
      network: 'BSC',
    });
  } catch (error) {
    console.error('Crypto request error:', error);
    return NextResponse.json(
      { error: 'Failed to create crypto payment request' },
      { status: 500 }
    );
  }
}

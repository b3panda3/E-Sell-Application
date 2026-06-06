import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reference } = await req.json();
    if (!reference) {
      return NextResponse.json(
        { error: 'reference is required' },
        { status: 400 }
      );
    }

    const paystackKey = process.env.PAYSTACK_SECRET_KEY;

    if (!paystackKey || paystackKey === 'sk_test_placeholder') {
      // Test mode: auto-confirm the payment
      const payment = await db.payment.findFirst({
        where: { reference },
      });

      if (payment) {
        await db.payment.update({
          where: { id: payment.id },
          data: { status: 'confirmed', verifiedAt: new Date() },
        });

        await db.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: 'confirmed' },
        });

        const order = await db.order.findUnique({
          where: { id: payment.orderId },
        });

        if (order) {
          await db.notification.create({
            data: {
              userId: order.customerId,
              type: 'PAYMENT',
              title: 'Payment Confirmed',
              body: `Your payment of ₦${order.totalNGN.toLocaleString()} has been confirmed (test mode)`,
              referenceId: order.id,
            },
          });

          await db.notification.create({
            data: {
              userId: order.merchantId,
              type: 'PAYMENT',
              title: 'Payment Received',
              body: `Payment of ₦${order.totalNGN.toLocaleString()} confirmed for order #${order.id.slice(0, 8)}`,
              referenceId: order.id,
            },
          });
        }
      }

      return NextResponse.json({
        status: true,
        message: 'Payment verified (test mode)',
        data: { status: 'success', reference },
        testMode: true,
      });
    }

    // Real Paystack verification
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${paystackKey}`,
        },
      }
    );

    const data = await response.json();

    if (data.status && data.data.status === 'success') {
      const payment = await db.payment.findFirst({
        where: { reference },
      });

      if (payment) {
        await db.payment.update({
          where: { id: payment.id },
          data: { status: 'confirmed', verifiedAt: new Date() },
        });

        await db.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: 'confirmed' },
        });

        const order = await db.order.findUnique({
          where: { id: payment.orderId },
        });

        if (order) {
          await db.notification.create({
            data: {
              userId: order.customerId,
              type: 'PAYMENT',
              title: 'Payment Confirmed',
              body: `Your payment of ₦${order.totalNGN.toLocaleString()} has been confirmed`,
              referenceId: order.id,
            },
          });

          await db.notification.create({
            data: {
              userId: order.merchantId,
              type: 'PAYMENT',
              title: 'Payment Received',
              body: `Payment of ₦${order.totalNGN.toLocaleString()} confirmed for order #${order.id.slice(0, 8)}`,
              referenceId: order.id,
            },
          });
        }
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Paystack verify error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get('reference') || searchParams.get('trxref');

    if (!reference) {
      return NextResponse.redirect(
        new URL('/dashboard/customer/purchases?error=no_reference', req.url)
      );
    }

    // Handle Paystack callback redirect
    const paystackKey = process.env.PAYSTACK_SECRET_KEY;

    if (!paystackKey || paystackKey === 'sk_test_placeholder') {
      // Test mode: redirect to purchases with reference
      return NextResponse.redirect(
        new URL(`/dashboard/customer/purchases?reference=${reference}&verified=true`, req.url)
      );
    }

    // Real verification
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${paystackKey}` },
      }
    );

    const data = await response.json();

    if (data.status && data.data.status === 'success') {
      const payment = await db.payment.findFirst({
        where: { reference },
      });

      if (payment) {
        await db.payment.update({
          where: { id: payment.id },
          data: { status: 'confirmed', verifiedAt: new Date() },
        });

        await db.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: 'confirmed' },
        });
      }
    }

    return NextResponse.redirect(
      new URL(`/dashboard/customer/purchases?reference=${reference}&verified=${data.data?.status === 'success'}`, req.url)
    );
  } catch (error) {
    console.error('Paystack callback error:', error);
    return NextResponse.redirect(
      new URL('/dashboard/customer/purchases?error=verification_failed', req.url)
    );
  }
}

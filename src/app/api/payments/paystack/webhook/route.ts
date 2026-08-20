import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

// Paystack webhook handler — receives real-time payment events from Paystack.
// Configure your Paystack dashboard webhook URL to point to:
// https://yourdomain.com/api/payments/paystack/webhook

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-paystack-signature');

    // Verify webhook signature
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret || paystackSecret === 'sk_test_placeholder') {
      console.warn('Paystack webhook received but no valid PAYSTACK_SECRET_KEY configured');
      return NextResponse.json({ error: 'Not configured' }, { status: 503 });
    }

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const hash = crypto
      .createHmac('sha512', paystackSecret)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      console.warn('Invalid Paystack webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);

    // Handle the 'charge.success' event
    if (event.event === 'charge.success') {
      const data = event.data;
      const reference = data.reference;

      // Find the payment by reference
      const payment = await db.payment.findFirst({
        where: { reference },
      });

      if (!payment) {
        console.warn(`Webhook: Payment not found for reference ${reference}`);
        return NextResponse.json({ received: true });
      }

      // Only process if not already confirmed
      if (payment.status === 'confirmed') {
        return NextResponse.json({ received: true });
      }

      // Update payment status
      await db.payment.update({
        where: { id: payment.id },
        data: {
          status: 'confirmed',
          verifiedAt: new Date(),
        },
      });

      // Update order
      await db.order.update({
        where: { id: payment.orderId },
        data: { paymentStatus: 'confirmed' },
      });

      // Fetch order details for notifications
      const order = await db.order.findUnique({
        where: { id: payment.orderId },
      });

      if (order) {
        // Notify customer
        await db.notification.create({
          data: {
            userId: order.customerId,
            type: 'PAYMENT',
            title: 'Payment Confirmed',
            body: `Your payment of ₦${order.totalNGN.toLocaleString()} has been confirmed successfully.`,
            referenceId: order.id,
          },
        });

        // Notify merchant
        await db.notification.create({
          data: {
            userId: order.merchantId,
            type: 'PAYMENT',
            title: 'New Payment Received',
            body: `Payment of ₦${order.totalNGN.toLocaleString()} confirmed for order #${order.id.slice(0, 8)}`,
            referenceId: order.id,
          },
        });
      }
    }

    // Handle failed charges
    if (event.event === 'charge.failed') {
      const data = event.data;
      const reference = data.reference;

      const payment = await db.payment.findFirst({
        where: { reference },
      });

      if (payment && payment.status === 'pending') {
        await db.payment.update({
          where: { id: payment.id },
          data: { status: 'failed' },
        });

        await db.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: 'failed' },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Paystack webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

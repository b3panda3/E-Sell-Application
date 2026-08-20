import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { nanoid } from 'nanoid';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId is required' },
        { status: 400 }
      );
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { payments: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.customerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (order.paymentStatus === 'confirmed') {
      return NextResponse.json({ error: 'Order already paid' }, { status: 400 });
    }

    const reference = `PSK-${nanoid(12)}`;
    const paystackKey = process.env.PAYSTACK_SECRET_KEY;
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // If no real Paystack key, return test mode response
    if (!paystackKey || paystackKey === 'sk_test_placeholder') {
      const payment = await db.payment.create({
        data: {
          orderId: order.id,
          method: 'paystack',
          amount: order.totalNGN,
          reference,
          status: 'pending',
        },
      });

      return NextResponse.json({
        authorization_url: `${baseUrl}/dashboard/customer/purchases?reference=${reference}&test=true`,
        reference,
        access_code: `test_access_${nanoid(8)}`,
        testMode: true,
        paymentId: payment.id,
      });
    }

    // Real Paystack integration
    const response = await fetch(
      'https://api.paystack.co/transaction/initialize',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${paystackKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session.user.email,
          amount: Math.round(order.totalNGN * 100), // Paystack expects kobo
          reference,
          metadata: {
            orderId: order.id,
            userId: session.user.id,
            custom_fields: [
              {
                display_name: 'Order ID',
                variable_name: 'order_id',
                value: order.id,
              },
            ],
          },
          callback_url: `${baseUrl}/api/payments/paystack/verify`,
          channels: ['card', 'bank', 'ussd', 'bank_transfer', 'mobile_money', 'qr'],
        }),
      }
    );

    const data = await response.json();

    if (!data.status) {
      return NextResponse.json(
        { error: data.message || 'Paystack initialization failed' },
        { status: 400 }
      );
    }

    const payment = await db.payment.create({
      data: {
        orderId: order.id,
        method: 'paystack',
        amount: order.totalNGN,
        reference,
        status: 'pending',
      },
    });

    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      reference: data.data.reference,
      access_code: data.data.access_code,
      paymentId: payment.id,
    });
  } catch (error) {
    console.error('Paystack initialize error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize payment' },
      { status: 500 }
    );
  }
}

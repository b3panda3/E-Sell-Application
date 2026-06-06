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

    const { paymentId, txHash } = await req.json();
    if (!paymentId || !txHash) {
      return NextResponse.json(
        { error: 'paymentId and txHash are required' },
        { status: 400 }
      );
    }

    const payment = await db.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (payment.order.customerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update payment with tx hash
    await db.payment.update({
      where: { id: paymentId },
      data: {
        reference: txHash,
        status: 'confirmed',
        verifiedAt: new Date(),
      },
    });

    // Update order payment status
    await db.order.update({
      where: { id: payment.orderId },
      data: { paymentStatus: 'confirmed' },
    });

    // Notify merchant
    await db.notification.create({
      data: {
        userId: payment.order.merchantId,
        type: 'PAYMENT',
        title: 'Crypto Payment Received',
        body: `Crypto payment of ${payment.amount} ${payment.method.toUpperCase()} received for order #${payment.orderId.slice(0, 8)}`,
        referenceId: payment.orderId,
      },
    });

    // Notify customer
    await db.notification.create({
      data: {
        userId: payment.order.customerId,
        type: 'PAYMENT',
        title: 'Crypto Payment Confirmed',
        body: `Your crypto payment has been confirmed for order #${payment.orderId.slice(0, 8)}`,
        referenceId: payment.orderId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Payment confirmed successfully',
    });
  } catch (error) {
    console.error('Crypto confirm error:', error);
    return NextResponse.json(
      { error: 'Failed to confirm payment' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const order = await db.order.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, email: true, image: true } },
        merchant: { select: { id: true, name: true, email: true, image: true } },
        storefront: { select: { id: true, storeName: true } },
        payments: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (
      order.customerId !== session.user.id &&
      order.merchantId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json(
      { error: 'Failed to get order' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as Record<string, unknown>).role as string;
    if (role !== 'MERCHANT') {
      return NextResponse.json(
        { error: 'Only merchants can update order status' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { orderStatus, paymentStatus } = await req.json();

    const order = await db.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.merchantId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const validOrderStatuses = [
      'placed',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
    ];
    const validPaymentStatuses = [
      'pending',
      'confirmed',
      'failed',
      'refunded',
    ];

    const updateData: Record<string, string> = {};
    if (orderStatus && validOrderStatuses.includes(orderStatus)) {
      updateData.orderStatus = orderStatus;
    }
    if (paymentStatus && validPaymentStatuses.includes(paymentStatus)) {
      updateData.paymentStatus = paymentStatus;
    }

    const updated = await db.order.update({
      where: { id },
      data: updateData,
      include: {
        customer: { select: { id: true, name: true } },
        storefront: { select: { storeName: true } },
      },
    });

    // Notify customer of status change
    if (orderStatus) {
      await db.notification.create({
        data: {
          userId: order.customerId,
          type: 'ORDER',
          title: 'Order Status Updated',
          body: `Your order #${id.slice(0, 8)} has been updated to: ${orderStatus}`,
          referenceId: id,
        },
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { nanoid } from 'nanoid';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as Record<string, unknown>).role as string;

    let orders;
    if (role === 'MERCHANT') {
      orders = await db.order.findMany({
        where: { merchantId: session.user.id },
        include: {
          customer: { select: { id: true, name: true, email: true, image: true } },
          storefront: { select: { id: true, storeName: true } },
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      orders = await db.order.findMany({
        where: { customerId: session.user.id },
        include: {
          merchant: { select: { id: true, name: true, email: true, image: true } },
          storefront: { select: { id: true, storeName: true } },
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'Failed to get orders' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storefrontId, paymentMethod } = await req.json();
    if (!storefrontId || !paymentMethod) {
      return NextResponse.json(
        { error: 'storefrontId and paymentMethod are required' },
        { status: 400 }
      );
    }

    const cart = await db.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                storefront: { select: { userId: true } },
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Filter items belonging to the specified storefront
    const storeItems = cart.items.filter(
      (item) => item.product.storefrontId === storefrontId
    );

    if (storeItems.length === 0) {
      return NextResponse.json(
        { error: 'No items from this storefront in cart' },
        { status: 400 }
      );
    }

    const merchantId = storeItems[0].product.storefront.userId;
    let totalNGN = 0;
    const orderItems = storeItems.map((item) => {
      const price = item.product.priceNGN * item.quantity;
      totalNGN += price;
      return {
        productId: item.productId,
        name: item.product.name,
        price: item.product.priceNGN,
        quantity: item.quantity,
      };
    });

    const order = await db.order.create({
      data: {
        customerId: session.user.id,
        merchantId,
        storefrontId,
        items: JSON.stringify(orderItems),
        totalNGN,
        totalCrypto: null,
        paymentMethod,
        paymentStatus: 'pending',
        orderStatus: 'placed',
      },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        storefront: { select: { id: true, storeName: true } },
      },
    });

    // Create payment record
    await db.payment.create({
      data: {
        orderId: order.id,
        method: paymentMethod,
        amount: totalNGN,
        reference: `ORD-${nanoid(12)}`,
        status: 'pending',
      },
    });

    // Remove purchased items from cart
    const itemIds = storeItems.map((item) => item.id);
    await db.cartItem.deleteMany({
      where: { id: { in: itemIds } },
    });

    // Create notification for merchant
    await db.notification.create({
      data: {
        userId: merchantId,
        type: 'ORDER',
        title: 'New Order Received',
        body: `You have a new order from ${order.customer.name} totaling ₦${totalNGN.toLocaleString()}`,
        referenceId: order.id,
      },
    });

    // Create notification for customer
    await db.notification.create({
      data: {
        userId: session.user.id,
        type: 'ORDER',
        title: 'Order Placed Successfully',
        body: `Your order #${order.id.slice(0, 8)} has been placed. Total: ₦${totalNGN.toLocaleString()}`,
        referenceId: order.id,
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

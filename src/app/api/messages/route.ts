import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all conversations (grouped by the other user)
    const messages = await db.message.findMany({
      where: {
        OR: [
          { senderId: session.user.id },
          { recipientId: session.user.id },
        ],
      },
      include: {
        sender: { select: { id: true, name: true, image: true } },
        recipient: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by conversation partner
    const conversationsMap = new Map<
      string,
      {
        partner: { id: string; name: string; image: string | null };
        lastMessage: (typeof messages)[0];
        unreadCount: number;
      }
    >();

    for (const msg of messages) {
      const isSender = msg.senderId === session.user.id;
      const partnerId = isSender ? msg.recipientId : msg.senderId;
      const partner = isSender ? msg.recipient : msg.sender;

      if (!conversationsMap.has(partnerId)) {
        conversationsMap.set(partnerId, {
          partner,
          lastMessage: msg,
          unreadCount: 0,
        });
      }

      const conv = conversationsMap.get(partnerId)!;
      if (!isSender && !msg.readAt) {
        conv.unreadCount += 1;
      }
    }

    const conversations = Array.from(conversationsMap.values());
    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    return NextResponse.json(
      { error: 'Failed to get conversations' },
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

    const { recipientId, content, storefrontId } = await req.json();
    if (!recipientId || !content) {
      return NextResponse.json(
        { error: 'recipientId and content are required' },
        { status: 400 }
      );
    }

    const message = await db.message.create({
      data: {
        senderId: session.user.id,
        recipientId,
        storefrontId: storefrontId || null,
        content,
        type: 'TEXT',
      },
      include: {
        sender: { select: { id: true, name: true, image: true } },
        recipient: { select: { id: true, name: true, image: true } },
      },
    });

    // Create notification for recipient
    await db.notification.create({
      data: {
        userId: recipientId,
        type: 'MESSAGE',
        title: 'New Message',
        body: `${session.user.name}: ${content.slice(0, 100)}`,
        referenceId: message.id,
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

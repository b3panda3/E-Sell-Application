import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;

    // Get messages between current user and the other user
    const messages = await db.message.findMany({
      where: {
        OR: [
          { senderId: session.user.id, recipientId: userId },
          { senderId: userId, recipientId: session.user.id },
        ],
      },
      include: {
        sender: { select: { id: true, name: true, image: true } },
        recipient: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Auto-mark unread messages as read
    await db.message.updateMany({
      where: {
        senderId: userId,
        recipientId: session.user.id,
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Get conversation error:', error);
    return NextResponse.json(
      { error: 'Failed to get conversation' },
      { status: 500 }
    );
  }
}

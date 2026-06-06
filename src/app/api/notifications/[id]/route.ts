import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// PATCH /api/notifications/[id] - Mark a notification as read
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const notification = await db.notification.findUnique({
    where: { id },
  });

  if (!notification) {
    return NextResponse.json(
      { error: 'Notification not found' },
      { status: 404 }
    );
  }

  if (notification.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const updated = await db.notification.update({
    where: { id },
    data: { readAt: new Date() },
  });

  return NextResponse.json({ notification: updated });
}

import { db } from '@/lib/db';

interface CreateNotificationParams {
  userId: string;
  type: 'PAYMENT' | 'MESSAGE' | 'ORDER' | 'SYSTEM';
  title: string;
  body?: string;
  referenceId?: string;
}

export async function createNotification({
  userId,
  type,
  title,
  body,
  referenceId,
}: CreateNotificationParams) {
  try {
    const notification = await db.notification.create({
      data: {
        userId,
        type,
        title,
        body: body || null,
        referenceId: referenceId || null,
      },
    });
    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    return null;
  }
}

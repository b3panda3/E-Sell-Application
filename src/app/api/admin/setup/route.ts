import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, email } = body;

    let targetUserId = userId;

    if (!targetUserId && email) {
      const user = await db.user.findUnique({ where: { email } });
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      targetUserId = user.id;
    }

    if (!targetUserId) {
      return NextResponse.json({ error: 'userId or email is required' }, { status: 400 });
    }

    // Check if already admin
    const existing = await db.adminUser.findUnique({
      where: { userId: targetUserId },
    });

    if (existing) {
      return NextResponse.json({ admin: existing, message: 'User is already an admin' });
    }

    const admin = await db.adminUser.create({
      data: {
        userId: targetUserId,
        role: 'ADMIN',
      },
    });

    return NextResponse.json({ admin }, { status: 201 });
  } catch (error) {
    console.error('Admin setup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

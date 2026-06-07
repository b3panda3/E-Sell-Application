import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

/**
 * POST /api/admin/setup
 * Create an admin user. Security: First admin can be created only if no admins exist.
 * After that, only existing admins can create new admins.
 */
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

    // Security check: Count existing admins
    const adminCount = await db.adminUser.count();

    if (adminCount > 0) {
      // Admins already exist - only existing admins can create new admins
      const requestingAdmin = await db.adminUser.findUnique({
        where: { userId: session.user.id },
      });

      if (!requestingAdmin) {
        return NextResponse.json(
          { error: 'Forbidden: Only existing admins can create new admins' },
          { status: 403 }
        );
      }
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

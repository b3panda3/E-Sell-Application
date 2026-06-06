import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/admin/check - Check if current user is admin
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ isAdmin: false });
    }

    const adminUser = await db.adminUser.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      isAdmin: !!adminUser,
      role: adminUser?.role || null,
    });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json({ isAdmin: false });
  }
}

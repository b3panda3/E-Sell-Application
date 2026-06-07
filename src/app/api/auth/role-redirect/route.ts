import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/auth/role-redirect
 * Redirects the user to the correct dashboard based on their role.
 * Used after OAuth sign-in to avoid hardcoding customer dashboard.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      // Not authenticated, redirect to login
      return NextResponse.redirect(new URL('/login', process.env.NEXTAUTH_URL || 'http://localhost:3000'));
    }

    const role = (session.user as Record<string, unknown>).role as string;

    if (role === 'MERCHANT') {
      return NextResponse.redirect(new URL('/dashboard/merchant', process.env.NEXTAUTH_URL || 'http://localhost:3000'));
    }

    // Default to customer dashboard
    return NextResponse.redirect(new URL('/dashboard/customer', process.env.NEXTAUTH_URL || 'http://localhost:3000'));
  } catch (error) {
    console.error('Role redirect error:', error);
    return NextResponse.redirect(new URL('/dashboard/customer', process.env.NEXTAUTH_URL || 'http://localhost:3000'));
  }
}

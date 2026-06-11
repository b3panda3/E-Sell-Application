import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Check if the path requires authentication
  const isMerchantRoute = path.startsWith('/dashboard/merchant');
  const isCustomerRoute = path.startsWith('/dashboard/customer');
  const isAdminRoute = path.startsWith('/dashboard/admin');
  const isDashboardRoute = isMerchantRoute || isCustomerRoute || isAdminRoute;

  if (!isDashboardRoute) {
    return NextResponse.next();
  }

  // Get the JWT token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Not authenticated - redirect to login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role as string;
  const isAdmin = token.isAdmin as boolean | undefined;

  // Role-based access control
  if (isAdminRoute) {
    // Allow access if user has ADMIN/SUPER_ADMIN role in JWT OR isAdmin flag in JWT
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN' && !isAdmin) {
      // Non-admin trying to access admin dashboard - redirect based on role
      if (role === 'MERCHANT') {
        return NextResponse.redirect(new URL('/dashboard/merchant', request.url));
      }
      return NextResponse.redirect(new URL('/dashboard/customer', request.url));
    }
  }

  if (isMerchantRoute && role !== 'MERCHANT' && role !== 'ADMIN') {
    // Customer trying to access merchant dashboard - redirect to customer dashboard
    return NextResponse.redirect(new URL('/dashboard/customer', request.url));
  }

  if (isCustomerRoute && role !== 'CUSTOMER' && role !== 'ADMIN') {
    // Merchant trying to access customer dashboard - redirect to merchant dashboard
    return NextResponse.redirect(new URL('/dashboard/merchant', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/merchant/:path*',
    '/dashboard/customer/:path*',
    '/dashboard/admin/:path*',
  ],
};

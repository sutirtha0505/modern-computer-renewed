import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { supabase } from '@/lib/supabaseClient';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // If the user is trying to access /login and a session exists, redirect to home.
  if (pathname.startsWith('/login')) {
    const session = await auth();
    if (session && session.user && session.user.id) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Checkout route check: allow access only if referer includes '/product/'
  if (pathname.startsWith('/checkout-single-product')) {
    const referer = request.headers.get('referer');
    if (!referer || !referer.includes('/product/')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // For admin routes, check if the user is logged in and is an admin.
  if (pathname.startsWith('/admin')) {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    const userId = session.user.id;
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user role:', error);
      return NextResponse.redirect(new URL('/restrict-admin-access', request.url));
    }
    if (!data || data.role !== 'admin') {
      return NextResponse.redirect(new URL('/restrict-admin-access', request.url));
    }
  }

  // For /profile routes, ensure that a session exists and that the session user's id matches the url id.
  if (pathname.startsWith('/profile')) {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // Extract the id from the pathname. Assuming URL structure is: /profile/:userId
    const parts = pathname.split('/');
    const userIdFromUrl = parts[2];
    if (!userIdFromUrl || session.user.id !== userIdFromUrl) {
      // Redirect if the logged-in user does not match the profile id in the URL.
      return NextResponse.redirect(new URL('/restrict-profile-access', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/checkout-single-product/:path*',
    '/admin/:path*',
    '/profile/:path*',
    '/login/:path*'
  ]
};

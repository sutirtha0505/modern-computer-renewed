import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if the request is for the checkout page
  if (pathname.startsWith('/checkout-single-product')) {
    const referer = request.headers.get('referer')
    if (!referer || !referer.includes('/product/')) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  

  return NextResponse.next()
}

export const config = {
  matcher: ['/checkout-single-product/:path*' ],
} 
import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';
import { jwtVerify } from 'jose';

const intlMiddleware = createMiddleware(routing);

/**
 * Middleware for handling internationalization and authentication.
 * Next.js automatically executes this file on every request.
 */
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const publicPages = ['/login', '/register'];
  const protectedPages = ['/main'];

  // Helper to remove locale from path to check against pages
  const pathnameWithoutLocale = pathname.replace(/^\/(uk|en|es|pt|fr|de|it|ko|ja|zh|tr|ar|hi|th|zh-CN|zh-TW)/, '') || '/';

  const accessToken = request.cookies.get('access_token')?.value;
  let isTokenValid = false;

  if (accessToken) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'lirnexa_secret');
      await jwtVerify(accessToken, secret);
      isTokenValid = true;
    } catch (error) {
      // Token is invalid or expired
      isTokenValid = false;
    }
  }

  const isPublicPage = publicPages.includes(pathnameWithoutLocale);
  const isProtectedPage = protectedPages.some(page => pathnameWithoutLocale.startsWith(page));

  // 0. Redirect from root / to /main or /login
  if (pathnameWithoutLocale === '/') {
    const locale = request.cookies.get('NEXT_LOCALE')?.value || routing.defaultLocale;
    const target = isTokenValid ? '/main' : '/login';
    return NextResponse.redirect(new URL(`/${locale}${target}`, request.url));
  }

  // 1. If user is authenticated and tries to access public auth pages (login/register)
  if (isTokenValid && isPublicPage) {
    const locale = request.nextUrl.locale || routing.defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}/main`, request.url));
  }

  // 2. If user is NOT authenticated and tries to access protected pages
  if (!isTokenValid && isProtectedPage) {
    const locale = request.cookies.get('NEXT_LOCALE')?.value || routing.defaultLocale;
    
    // Attempt to extract locale from the current path request if possible
    const pathLocaleMatch = pathname.match(/^\/(uk|en|es|pt|fr|de|it|ko|ja|zh|tr|ar|hi|th|zh-CN|zh-TW)/);
    const targetLocale = pathLocaleMatch ? pathLocaleMatch[1] : locale;

    const response = NextResponse.redirect(new URL(`/${targetLocale}/login`, request.url));
    if (accessToken && !isTokenValid) {
        response.cookies.delete('access_token');
        response.cookies.delete('access_token_client');
        response.cookies.delete('has_token');
    }
    return response;
  }

  return intlMiddleware(request);
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(uk|en|es|pt|fr|de|it|ko|ja|zh|tr|ar|hi|th|zh-CN|zh-TW)/:path*']
};

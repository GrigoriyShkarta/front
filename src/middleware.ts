import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

/**
 * Middleware for handling internationalization and authentication.
 * Next.js automatically executes this file on every request.
 */
export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const publicPages = ['/login', '/register'];
  const protectedPages = ['/main'];

  // Helper to remove locale from path to check against pages
  const pathnameWithoutLocale = pathname.replace(/^\/(uk|en|es|pt|fr|de|it|ko|ja|zh|tr|ar|hi|th|zh-CN|zh-TW)/, '') || '/';

  const accessToken = request.cookies.get('access_token')?.value;

  const isPublicPage = publicPages.includes(pathnameWithoutLocale);
  const isProtectedPage = protectedPages.some(page => pathnameWithoutLocale.startsWith(page));

  // 1. If user is authenticated and tries to access public auth pages (login/register)
  if (accessToken && isPublicPage) {
    const locale = request.nextUrl.locale || routing.defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}/main`, request.url));
  }

  // 2. If user is NOT authenticated and tries to access protected pages
  if (!accessToken && isProtectedPage) {
    const locale = request.cookies.get('NEXT_LOCALE')?.value || routing.defaultLocale;
    
    // Attempt to extract locale from the current path request if possible
    const pathLocaleMatch = pathname.match(/^\/(uk|en|es|pt|fr|de|it|ko|ja|zh|tr|ar|hi|th|zh-CN|zh-TW)/);
    const targetLocale = pathLocaleMatch ? pathLocaleMatch[1] : locale;

    return NextResponse.redirect(new URL(`/${targetLocale}/login`, request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(uk|en|es|pt|fr|de|it|ko|ja|zh|tr|ar|hi|th|zh-CN|zh-TW)/:path*']
};

import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path should be excluded from auth checks (e.g. valid static files)
  // The matcher in config already handles most of this, but be safe.
  
  const publicPages = ['/login', '/register'];
  const protectedPages = ['/main'];

  // Helper to remove locale from path to check against pages
  // e.g. /en/login -> /login
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
    // We redirect to login. next-intl middleware will likely handle the locale redirect if we just go to /login? 
    // But better to be explicit: /[locale]/login
    // However, extracting the intended locale from the URL might be safer if the user typed /en/main
    
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

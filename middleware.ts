import createMiddleware from 'next-intl/middleware';
import {NextRequest, NextResponse} from 'next/server';
import {locales} from '@/config';
import { auth } from '@/lib/auth';

export default async function middleware(request: NextRequest) {
  // Check authentication for protected routes
  const pathname = request.nextUrl.pathname;
  const isProtectedRoute = pathname.includes('/institutional') || 
                          pathname.includes('/profile') ||
                          pathname.includes('/dashboard');
  
  if (isProtectedRoute) {
    const session = await auth();
    
    if (!session) {
      // Redirect to login if not authenticated
      const locale = pathname.split('/')[1] || 'es';
      return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
    }
  }

  // Step 1: Use the incoming request
  const defaultLocale = request.headers.get('dashcode-locale') || 'en';
 
  // Step 2: Create and call the next-intl middleware
  const handleI18nRouting = createMiddleware({
    locales,
    defaultLocale
  });
  const response = handleI18nRouting(request);
 
  // Step 3: Alter the response
  response.headers.set('dashcode-locale', defaultLocale);
 
  return response;
}
 
export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(es|en)/:path*']
};
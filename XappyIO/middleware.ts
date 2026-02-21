import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

export const config = {
  // Match all pathnames except for
  // - API routes
  // - _next (Next.js internals)
  // - Static files with extensions
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};

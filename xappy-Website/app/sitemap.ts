import { MetadataRoute } from 'next';
import { locales, defaultLocale } from '@/i18n';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://mobirizer.com';

  const routes = [
    '',
    '/company',
    '/contact',
    '/products',
    '/solutions',
    '/products/d23-ai',
    '/products/whatsapp-commerce',
    '/products/roboguru',
    '/products/ohgrt',
    '/products/xappy',
    '/products/janseva',
    '/solutions/agentic-ai',
    '/solutions/conversational-ai',
    '/solutions/ai-integration',
    '/solutions/custom-development',
    '/privacy-policy',
    '/terms-of-service',
  ];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Generate entries for each route in each locale
  routes.forEach((route) => {
    locales.forEach((locale) => {
      // For default locale (en), no prefix needed
      const url =
        locale === defaultLocale
          ? `${baseUrl}${route}`
          : `${baseUrl}/${locale}${route}`;

      sitemapEntries.push({
        url,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'weekly' : 'monthly',
        priority: route === '' ? 1 : route.startsWith('/products/') ? 0.7 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            locales.map((loc) => [
              loc,
              loc === defaultLocale
                ? `${baseUrl}${route}`
                : `${baseUrl}/${loc}${route}`,
            ])
          ),
        },
      });
    });
  });

  return sitemapEntries;
}

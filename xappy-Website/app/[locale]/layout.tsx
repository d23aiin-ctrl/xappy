import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { BackToTop } from '@/components';
import { JsonLd } from '@/components/seo/JsonLd';
import { generateOrganizationSchema, generateWebsiteSchema } from '@/lib/jsonld';
import { locales, Locale } from '@/i18n';
import './globals.css';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: {
      default: t('siteTitle'),
      template: `%s | ${t('siteName')}`,
    },
    description: t('siteDescription'),
    keywords: t('keywords'),
    authors: [{ name: 'Mobirizer Services Pvt. Ltd.' }],
    robots: 'index, follow',
    themeColor: '#6366f1',
    icons: {
      icon: '/assets/images/favicon.png',
    },
    alternates: {
      canonical: `https://mobirizer.com${locale === 'en' ? '' : `/${locale}`}`,
      languages: {
        en: 'https://mobirizer.com',
        hi: 'https://mobirizer.com/hi',
        ta: 'https://mobirizer.com/ta',
        te: 'https://mobirizer.com/te',
        bn: 'https://mobirizer.com/bn',
      },
    },
    openGraph: {
      title: t('siteTitle'),
      description: t('siteDescription'),
      type: 'website',
      locale: getOGLocale(locale),
      siteName: t('siteName'),
    },
  };
}

function getOGLocale(locale: Locale): string {
  const map: Record<Locale, string> = {
    en: 'en_IN',
    hi: 'hi_IN',
    ta: 'ta_IN',
    te: 'te_IN',
    bn: 'bn_IN',
  };
  return map[locale];
}

export default async function RootLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode;
  params: { locale: Locale };
}>) {
  if (!locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} dir="ltr">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css"
          rel="stylesheet"
        />
        <JsonLd data={[generateOrganizationSchema(), generateWebsiteSchema(locale)]} />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          {children}
          <BackToTop />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

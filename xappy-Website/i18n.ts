import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'hi', 'ta', 'te', 'bn'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  hi: 'हिन्दी',
  ta: 'தமிழ்',
  te: 'తెలుగు',
  bn: 'বাংলা',
};

export const localeNamesShort: Record<Locale, string> = {
  en: 'EN',
  hi: 'हि',
  ta: 'த',
  te: 'తె',
  bn: 'বা',
};

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that the incoming locale is valid
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});

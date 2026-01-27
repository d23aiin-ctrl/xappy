'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { locales, localeNames, localeNamesShort, Locale } from '@/i18n';

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (newLocale: Locale) => {
    // Remove current locale from pathname if present
    let newPath = pathname;

    // If current locale is not 'en', remove it from the path
    if (locale !== 'en') {
      newPath = pathname.replace(`/${locale}`, '') || '/';
    }

    // Add new locale to path (unless it's 'en' which has no prefix)
    if (newLocale !== 'en') {
      newPath = `/${newLocale}${newPath === '/' ? '' : newPath}`;
    }

    router.push(newPath);
  };

  return (
    <div className="relative group">
      <button
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary-blue/5 transition-colors text-text-dark"
        aria-label="Select language"
      >
        <i className="ri-global-line text-lg" />
        <span className="hidden sm:inline text-sm font-medium">{localeNamesShort[locale]}</span>
        <i className="ri-arrow-down-s-line text-sm" />
      </button>

      <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-border p-2 min-w-[160px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        {locales.map((loc) => (
          <button
            key={loc}
            onClick={() => handleChange(loc)}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors text-sm ${
              locale === loc
                ? 'bg-primary-blue/10 text-primary-blue font-medium'
                : 'hover:bg-bg-light text-text-dark'
            }`}
          >
            {localeNames[loc]}
          </button>
        ))}
      </div>
    </div>
  );
}

export default LanguageSwitcher;

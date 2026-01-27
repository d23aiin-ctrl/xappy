'use client';

import Link from 'next/link';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { useTranslations } from 'next-intl';
import { useMobileNav } from '@/hooks';
import { MobileNav } from './MobileNav';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Button } from '@/components/ui';
import { cn } from '@/lib/cn';

interface HeaderProps {
  activePage?: 'home' | 'products' | 'solutions' | 'company' | 'contact';
}

const productKeys = [
  { href: '/products/d23-ai', icon: 'ri-whatsapp-line', key: 'd23ai' },
  { href: '/products/whatsapp-commerce', icon: 'ri-shopping-bag-3-line', key: 'whatsappCommerce' },
  { href: '/products/roboguru', icon: 'ri-graduation-cap-line', key: 'roboguru' },
  { href: '/products/ohgrt', icon: 'ri-voiceprint-line', key: 'ohgrt' },
  { href: '/products/xappy', icon: 'ri-heart-pulse-line', key: 'xappy' },
  { href: '/products/janseva', icon: 'ri-government-line', key: 'janseva' },
];

const solutionKeys = [
  { href: '/solutions/agentic-ai', icon: 'ri-robot-line', key: 'agenticAi' },
  { href: '/solutions/conversational-ai', icon: 'ri-chat-voice-line', key: 'conversationalAi' },
  { href: '/solutions/ai-integration', icon: 'ri-plug-line', key: 'aiIntegration' },
  { href: '/solutions/custom-development', icon: 'ri-code-s-slash-line', key: 'customDevelopment' },
];

export function Header({ activePage }: HeaderProps) {
  const { isOpen, openNav, closeNav } = useMobileNav();
  const t = useTranslations('navigation');
  const tHeader = useTranslations('header');
  const tCommon = useTranslations('common');
  const tProducts = useTranslations('products');
  const tSolutions = useTranslations('solutions');

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/assets/images/logo.png"
              alt="Mobirizer Logo"
              className="h-10 w-auto transition-transform group-hover:scale-105"
            />
            <div className="hidden sm:flex flex-col">
              <span className="font-bold text-lg text-text-dark leading-tight">
                Mobirizer
              </span>
              <span className="text-xs text-text-muted leading-tight">
                {tHeader('tagline')}
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <NavigationMenu.Root className="hidden md:flex">
            <NavigationMenu.List className="flex items-center gap-1">
              {/* Home */}
              <NavigationMenu.Item>
                <NavigationMenu.Link asChild>
                  <Link
                    href="/"
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      activePage === 'home'
                        ? 'text-primary-blue bg-primary-blue/5'
                        : 'text-text-dark hover:text-primary-blue hover:bg-primary-blue/5'
                    )}
                  >
                    {t('home')}
                  </Link>
                </NavigationMenu.Link>
              </NavigationMenu.Item>

              {/* Products Dropdown */}
              <NavigationMenu.Item>
                <NavigationMenu.Trigger
                  className={cn(
                    'group px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1',
                    activePage === 'products'
                      ? 'text-primary-blue bg-primary-blue/5'
                      : 'text-text-dark hover:text-primary-blue hover:bg-primary-blue/5'
                  )}
                >
                  <Link href="/products">{t('products')}</Link>
                  <i className="ri-arrow-down-s-line transition-transform duration-200 group-data-[state=open]:rotate-180"></i>
                </NavigationMenu.Trigger>
                <NavigationMenu.Content className="absolute top-full left-0 w-[550px] bg-white rounded-2xl shadow-xl border border-border p-5 animate-fade-in-down">
                  <div className="grid grid-cols-2 gap-2">
                    {productKeys.map((product) => (
                      <Link
                        key={product.href}
                        href={product.href}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-bg-light transition-colors group/item"
                      >
                        <div className="w-9 h-9 rounded-lg bg-primary-blue/10 flex items-center justify-center flex-shrink-0">
                          <i className={cn(product.icon, 'text-primary-blue text-base')}></i>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-text-dark group-hover/item:text-primary-blue transition-colors">
                            {tProducts(`${product.key}.name`)}
                          </h4>
                          <p className="text-xs text-text-muted">{tProducts(`${product.key}.tagline`)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </NavigationMenu.Content>
              </NavigationMenu.Item>

              {/* Solutions Dropdown */}
              <NavigationMenu.Item>
                <NavigationMenu.Trigger
                  className={cn(
                    'group px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1',
                    activePage === 'solutions'
                      ? 'text-primary-blue bg-primary-blue/5'
                      : 'text-text-dark hover:text-primary-blue hover:bg-primary-blue/5'
                  )}
                >
                  <Link href="/solutions">{t('solutions')}</Link>
                  <i className="ri-arrow-down-s-line transition-transform duration-200 group-data-[state=open]:rotate-180"></i>
                </NavigationMenu.Trigger>
                <NavigationMenu.Content className="absolute top-full left-0 w-[420px] bg-white rounded-2xl shadow-xl border border-border p-5 animate-fade-in-down">
                  <div className="grid grid-cols-2 gap-2">
                    {solutionKeys.map((solution) => (
                      <Link
                        key={solution.href}
                        href={solution.href}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-bg-light transition-colors group/item"
                      >
                        <div className="w-9 h-9 rounded-lg bg-primary-blue/10 flex items-center justify-center flex-shrink-0">
                          <i className={cn(solution.icon, 'text-primary-blue text-base')}></i>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-text-dark group-hover/item:text-primary-blue transition-colors">
                            {tSolutions(`${solution.key}.name`)}
                          </h4>
                          <p className="text-xs text-text-muted">{tSolutions(`${solution.key}.tagline`)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </NavigationMenu.Content>
              </NavigationMenu.Item>

              {/* Company */}
              <NavigationMenu.Item>
                <NavigationMenu.Link asChild>
                  <Link
                    href="/company"
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      activePage === 'company'
                        ? 'text-primary-blue bg-primary-blue/5'
                        : 'text-text-dark hover:text-primary-blue hover:bg-primary-blue/5'
                    )}
                  >
                    {t('company')}
                  </Link>
                </NavigationMenu.Link>
              </NavigationMenu.Item>

              <NavigationMenu.Indicator className="top-full z-10 flex h-2 items-end justify-center overflow-hidden transition-all">
                <div className="relative top-1 h-2 w-2 rotate-45 bg-white border-l border-t border-border" />
              </NavigationMenu.Indicator>
            </NavigationMenu.List>

            <NavigationMenu.Viewport className="absolute top-full left-1/2 -translate-x-1/2 mt-2" />
          </NavigationMenu.Root>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Button asChild variant="cta" size="default" className="hidden sm:inline-flex">
              <Link href="/contact">
                <span>{tCommon('bookDemo')}</span>
                <i className="ri-arrow-right-line"></i>
              </Link>
            </Button>
            <button
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-bg-light transition-colors"
              onClick={openNav}
              aria-label="Open menu"
            >
              <i className="ri-menu-line text-xl text-text-dark"></i>
            </button>
          </div>
        </div>
      </header>
      {/* Spacer for fixed header */}
      <div className="h-[72px]" />

      {/* Mobile Navigation */}
      <MobileNav isOpen={isOpen} onClose={closeNav} activePage={activePage} />
    </>
  );
}

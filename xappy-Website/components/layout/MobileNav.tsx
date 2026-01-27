'use client';

import Link from 'next/link';
import * as Dialog from '@radix-ui/react-dialog';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui';
import { LanguageSwitcher } from './LanguageSwitcher';
import { cn } from '@/lib/cn';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  activePage?: string;
}

const navLinkKeys = [
  { href: '/', icon: 'ri-home-line', labelKey: 'home', page: 'home', type: 'nav' },
  { href: '/products', icon: 'ri-apps-2-line', labelKey: 'products', page: 'products', type: 'nav' },
  { href: '/products/d23-ai', icon: 'ri-whatsapp-line', labelKey: 'd23ai', page: null, indent: true, type: 'product' },
  { href: '/products/whatsapp-commerce', icon: 'ri-shopping-bag-3-line', labelKey: 'whatsappCommerce', page: null, indent: true, type: 'product' },
  { href: '/solutions', icon: 'ri-lightbulb-line', labelKey: 'solutions', page: 'solutions', type: 'nav' },
  { href: '/solutions/agentic-ai', icon: 'ri-robot-line', labelKey: 'agenticAi', page: null, indent: true, type: 'solution' },
  { href: '/solutions/conversational-ai', icon: 'ri-chat-voice-line', labelKey: 'conversationalAi', page: null, indent: true, type: 'solution' },
  { href: '/solutions/ai-integration', icon: 'ri-plug-line', labelKey: 'aiIntegration', page: null, indent: true, type: 'solution' },
  { href: '/solutions/custom-development', icon: 'ri-code-s-slash-line', labelKey: 'customDevelopment', page: null, indent: true, type: 'solution' },
  { href: '/company', icon: 'ri-building-line', labelKey: 'company', page: 'company', type: 'nav' },
  { href: '/contact', icon: 'ri-mail-line', labelKey: 'contact', page: 'contact', type: 'nav' },
];

export function MobileNav({ isOpen, onClose, activePage }: MobileNavProps) {
  const tNav = useTranslations('navigation');
  const tProducts = useTranslations('products');
  const tSolutions = useTranslations('solutions');
  const tCommon = useTranslations('common');
  const tHeader = useTranslations('header');

  const getLabel = (link: typeof navLinkKeys[0]) => {
    if (link.type === 'nav') return tNav(link.labelKey);
    if (link.type === 'product') return tProducts(`${link.labelKey}.name`);
    if (link.type === 'solution') return tSolutions(`${link.labelKey}.name`);
    return link.labelKey;
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm data-[state=open]:animate-fade-in-up data-[state=closed]:animate-fade-out" />

        {/* Content */}
        <Dialog.Content className="fixed top-0 right-0 z-[101] h-full w-[300px] bg-white shadow-2xl data-[state=open]:animate-fade-in-right data-[state=closed]:animate-fade-out-right focus:outline-none">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-border">
            <Link href="/" className="flex items-center gap-3" onClick={onClose}>
              <img
                src="/assets/images/logo.png"
                alt="Mobirizer"
                className="w-9 h-9 rounded-xl"
              />
              <span className="font-bold text-text-dark">Mobirizer</span>
            </Link>
            <Dialog.Close asChild>
              <button
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-bg-light transition-colors"
                aria-label="Close menu"
              >
                <i className="ri-close-line text-xl text-text-dark"></i>
              </button>
            </Dialog.Close>
          </div>

          {/* Navigation Links */}
          <nav className="px-4 py-6">
            <div className="flex flex-col gap-1">
              {navLinkKeys.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-3 py-3 rounded-xl text-sm font-medium transition-all',
                    link.indent ? 'px-8 text-xs' : 'px-4',
                    activePage === link.page
                      ? 'bg-primary-blue/10 text-primary-blue'
                      : 'text-text-dark hover:bg-bg-light hover:text-primary-blue'
                  )}
                  onClick={onClose}
                >
                  <i className={cn(link.icon, link.indent ? 'text-base' : 'text-lg')}></i>
                  {getLabel(link)}
                </Link>
              ))}
            </div>

            {/* Language Switcher */}
            <div className="mt-4 px-4">
              <LanguageSwitcher />
            </div>

            {/* CTA Button */}
            <div className="mt-6 pt-6 border-t border-border">
              <Button asChild variant="cta" size="lg" className="w-full justify-center">
                <Link href="/contact" onClick={onClose}>
                  <span>{tCommon('bookDemo')}</span>
                  <i className="ri-arrow-right-line"></i>
                </Link>
              </Button>
            </div>
          </nav>

          {/* Footer Info */}
          <div className="absolute bottom-0 left-0 right-0 px-6 py-4 border-t border-border bg-bg-light">
            <div className="text-xs text-text-muted text-center">
              {tHeader('tagline')} since 2014
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

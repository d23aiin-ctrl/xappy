'use client';

import { useBackToTop } from '@/hooks';
import { cn } from '@/lib/cn';

export function BackToTop() {
  const { isVisible, scrollToTop } = useBackToTop(300);

  return (
    <button
      type="button"
      className={cn(
        'fixed bottom-6 right-6 z-50 w-12 h-12 bg-gradient-primary text-white rounded-xl shadow-primary-glow flex items-center justify-center transition-all duration-300',
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4 pointer-events-none'
      )}
      onClick={scrollToTop}
      aria-label="Back to top"
    >
      <i className="ri-arrow-up-line text-xl"></i>
    </button>
  );
}

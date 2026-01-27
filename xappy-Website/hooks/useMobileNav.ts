'use client';

import { useState, useCallback, useEffect } from 'react';

export function useMobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  const openNav = useCallback(() => {
    setIsOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeNav = useCallback(() => {
    setIsOpen(false);
    document.body.style.overflow = '';
  }, []);

  const toggleNav = useCallback(() => {
    if (isOpen) {
      closeNav();
    } else {
      openNav();
    }
  }, [isOpen, openNav, closeNav]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return { isOpen, openNav, closeNav, toggleNav };
}

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseCounterAnimationOptions {
  duration?: number;
  threshold?: number;
}

export function useCounterAnimation(
  target: string,
  options: UseCounterAnimationOptions = {}
) {
  const { duration = 2000, threshold = 0.5 } = options;
  const [displayValue, setDisplayValue] = useState('0');
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  const animateCounter = useCallback(() => {
    const suffix = target.replace(/[0-9]/g, '');
    const numTarget = parseInt(target.replace(/[^0-9]/g, ''), 10);

    if (!numTarget || isNaN(numTarget)) {
      setDisplayValue(target);
      return;
    }

    let start = 0;
    const increment = numTarget / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= numTarget) {
        setDisplayValue(target);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start) + suffix);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [target, duration]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            setTimeout(() => animateCounter(), 200);
          }
        });
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [animateCounter, hasAnimated, threshold]);

  return { displayValue, elementRef };
}

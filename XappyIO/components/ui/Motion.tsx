'use client';

import { motion, HTMLMotionProps, Variants, animate } from 'framer-motion';
import { forwardRef, ReactNode, useEffect, useState, useRef } from 'react';
import {
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  staggerContainer,
  blurIn,
} from '@/lib/animations';

// Animation wrapper component
interface AnimatedProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  animation?: 'fadeInUp' | 'fadeInDown' | 'fadeInLeft' | 'fadeInRight' | 'scaleIn' | 'blurIn';
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}

const animationVariants: Record<string, Variants> = {
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  blurIn,
};

export const Animated = forwardRef<HTMLDivElement, AnimatedProps>(
  ({ children, animation = 'fadeInUp', delay = 0, duration, className, once = true, ...props }, ref) => {
    const variants = animationVariants[animation];
    const customVariants: Variants = {
      hidden: variants.hidden,
      visible: {
        ...variants.visible,
        transition: {
          ...(typeof variants.visible === 'object' && 'transition' in variants.visible
            ? variants.visible.transition
            : {}),
          delay,
          ...(duration && { duration }),
        },
      },
    };

    return (
      <motion.div
        ref={ref}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, margin: '-50px' }}
        variants={customVariants}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
Animated.displayName = 'Animated';

// Stagger container for animating children in sequence
interface StaggerProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  once?: boolean;
}

export const Stagger = forwardRef<HTMLDivElement, StaggerProps>(
  ({ children, className, staggerDelay = 0.1, once = true, ...props }, ref) => {
    const variants: Variants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: staggerDelay,
          delayChildren: 0.1,
        },
      },
    };

    return (
      <motion.div
        ref={ref}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, margin: '-50px' }}
        variants={variants}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
Stagger.displayName = 'Stagger';

// Stagger item (child of Stagger)
interface StaggerItemProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  className?: string;
}

export const StaggerItem = forwardRef<HTMLDivElement, StaggerItemProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        variants={fadeInUp}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
StaggerItem.displayName = 'StaggerItem';

// Hover card animation
interface HoverCardProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  className?: string;
  hoverScale?: number;
  hoverY?: number;
}

export const HoverCard = forwardRef<HTMLDivElement, HoverCardProps>(
  ({ children, className, hoverScale = 1.02, hoverY = -8, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ scale: 1, y: 0 }}
        whileHover={{
          scale: hoverScale,
          y: hoverY,
          transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
        }}
        whileTap={{ scale: 0.98 }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
HoverCard.displayName = 'HoverCard';

// Floating animation
interface FloatProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  className?: string;
  intensity?: number;
  duration?: number;
}

export const Float = forwardRef<HTMLDivElement, FloatProps>(
  ({ children, className, intensity = 10, duration = 4, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        animate={{
          y: [-intensity / 2, intensity / 2, -intensity / 2],
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
Float.displayName = 'Float';

// Pulse animation
interface PulseProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  className?: string;
  scale?: number;
  duration?: number;
}

export const Pulse = forwardRef<HTMLDivElement, PulseProps>(
  ({ children, className, scale = 1.05, duration = 2, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        animate={{
          scale: [1, scale, 1],
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
Pulse.displayName = 'Pulse';

// Counter animation for stats
interface CounterProps {
  from?: number;
  to: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}

export function Counter({ from = 0, to, duration = 2, className, suffix = '', prefix = '' }: CounterProps) {
  const [count, setCount] = useState(from);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            const controls = animate(from, to, {
              duration,
              ease: [0.4, 0, 0.2, 1],
              onUpdate: (value) => {
                setCount(Math.round(value));
              },
            });
            return () => controls.stop();
          }
        });
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [from, to, duration, hasAnimated]);

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      {prefix}{count}{suffix}
    </motion.span>
  );
}

// Text reveal animation (word by word)
interface TextRevealProps {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
}

export function TextReveal({ text, className, wordClassName, delay = 0 }: TextRevealProps) {
  const words = text.split(' ');

  return (
    <motion.span
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          className={wordClassName}
          style={{ display: 'inline-block', marginRight: '0.25em' }}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                delay: delay + i * 0.05,
                duration: 0.5,
                ease: [0.4, 0, 0.2, 1],
              },
            },
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}

// Gradient text with animation
interface GradientTextProps {
  children: ReactNode;
  className?: string;
}

export function GradientText({ children, className }: GradientTextProps) {
  return (
    <motion.span
      className={className}
      style={{
        background: 'linear-gradient(135deg, #818cf8, #22c55e, #6366f1, #818cf8)',
        backgroundSize: '300% 300%',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}
      animate={{
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      {children}
    </motion.span>
  );
}

// Parallax scroll effect
interface ParallaxProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  className?: string;
  speed?: number;
}

export const Parallax = forwardRef<HTMLDivElement, ParallaxProps>(
  ({ children, className, speed = 0.5, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ y: 0 }}
        whileInView={{ y: 0 }}
        viewport={{ once: false }}
        style={{ willChange: 'transform' }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
Parallax.displayName = 'Parallax';

// Re-export motion for direct use
export { motion };

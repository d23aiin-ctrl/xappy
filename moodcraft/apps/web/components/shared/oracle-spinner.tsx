'use client';

import { motion } from 'framer-motion';

interface OracleSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function OracleSpinner({ message = 'The Oracle is thinking...', size = 'md' }: OracleSpinnerProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <motion.div
        className={`${sizes[size]} rounded-full border-2 border-oracle-500/30 border-t-oracle-400`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      {message && (
        <p className="mt-4 text-sm text-muted-foreground animate-pulse">{message}</p>
      )}
    </div>
  );
}

import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLMotionProps<'div'> {
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  glow = false,
  className,
  children,
  style,
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(className)}
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-primary)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: glow ? 'var(--shadow-glow)' : 'var(--shadow-md)',
        transition: 'all 0.2s ease-in-out',
        ...style,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'neutral';
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  className,
  children,
  style,
  ...props
}) => {
  const getColors = () => {
    switch (variant) {
      case 'success':
        return {
          bg: 'rgba(16, 185, 129, 0.12)',
          text: '#10b981',
          border: 'rgba(16, 185, 129, 0.25)',
        };
      case 'warning':
        return {
          bg: 'rgba(245, 158, 11, 0.12)',
          text: '#f59e0b',
          border: 'rgba(245, 158, 11, 0.25)',
        };
      case 'neutral':
        return {
          bg: 'rgba(148, 163, 184, 0.12)',
          text: 'var(--text-secondary)',
          border: 'var(--border-primary)',
        };
      case 'primary':
      default:
        return {
          bg: 'var(--accent-light)',
          text: 'var(--accent-primary)',
          border: 'rgba(99, 102, 241, 0.25)',
        };
    }
  };

  const colors = getColors();

  return (
    <span
      className={cn(className)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: 600,
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        letterSpacing: '0.02em',
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
};

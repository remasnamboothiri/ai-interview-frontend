import { HTMLAttributes } from 'react';

type BadgeVariant = 'success' | 'danger' | 'warning' | 'neutral';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'badge-success',
  danger: 'badge-danger',
  warning: 'badge-warning',
  neutral: 'badge-neutral',
};

export const Badge = ({ variant = 'neutral', children, className = '', ...props }: BadgeProps) => {
  return (
    <span className={`badge ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};

interface StatusDotProps extends HTMLAttributes<HTMLSpanElement> {
  active?: boolean;
}

export const StatusDot = ({ active = false, className = '', ...props }: StatusDotProps) => {
  return (
    <span
      className={`status-dot ${active ? 'status-dot-active' : 'status-dot-inactive'} ${className}`}
      {...props}
    />
  );
};

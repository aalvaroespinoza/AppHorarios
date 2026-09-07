import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

const variantClasses: Record<string, string> = {
  default: 'border-line bg-muted text-subtle',
  success: 'border-success/50 bg-success/15 text-success',
  warning: 'border-warning/50 bg-warning/15 text-warning',
  danger: 'border-accent/50 bg-accent/15 text-accent',
};

/**
 * Badge
 * Etiqueta compacta para indicar estados o prioridades.
 * Colores semánticos con contraste en ambos temas.
 */
export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      data-variant={variant}
      className={`inline-flex items-center rounded-2xl border px-2 py-0.5 font-sans text-xs font-bold   ${variantClasses[variant] || variantClasses.default} ${className}`}
    >
      {children}
    </span>
  );
}

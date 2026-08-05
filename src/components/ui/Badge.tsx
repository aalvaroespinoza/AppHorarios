import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

/**
 * Badge
 * Etiqueta compacta para indicar estados o prioridades.
 * Variantes: default | success | warning | danger.
 * TODO: aplicar estilos cuando se defina el sistema de diseño.
 */
export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span data-variant={variant} className={className}>
      {children}
    </span>
  );
}

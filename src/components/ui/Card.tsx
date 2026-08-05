import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

/**
 * Card
 * Contenedor visual base.
 * TODO: aplicar estilos cuando se defina el sistema de diseño.
 */
export function Card({ children, className }: CardProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

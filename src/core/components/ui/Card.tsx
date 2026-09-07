import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

/**
 * Card
 * Contenedor visual compartido.
 */
export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`glass-panel p-4 text-ink shadow-none ${className}`}>
      {children}
    </div>
  );
}

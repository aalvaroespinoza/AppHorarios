import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

/**
 * Card
 * Contenedor visual base estilo Industrial Hardware Console.
 */
export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`rounded-sm border border-zinc-800 bg-zinc-900 p-4 text-zinc-100 shadow-none ${className}`}>
      {children}
    </div>
  );
}

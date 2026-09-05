import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

const variantClasses: Record<string, string> = {
  default: 'border-zinc-700 bg-zinc-800 text-zinc-300',
  success: 'border-acid-green/50 bg-acid-green/15 text-acid-green',
  warning: 'border-amber-500/50 bg-amber-500/15 text-amber-400',
  danger: 'border-safety-orange/50 bg-safety-orange/15 text-safety-orange',
};

/**
 * Badge
 * Etiqueta compacta para indicar estados o prioridades.
 * Estilo terminal industrial con IBM Plex Mono.
 */
export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      data-variant={variant}
      className={`inline-flex items-center rounded-sm border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest ${variantClasses[variant] || variantClasses.default} ${className}`}
    >
      {children}
    </span>
  );
}

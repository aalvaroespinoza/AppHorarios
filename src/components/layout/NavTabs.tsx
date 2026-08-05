'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/',       label: 'Hoy' },
  { href: '/manana', label: 'Mañana' },
] as const;

/**
 * NavTabs
 *
 * Control segmentado estilo iOS para navegar entre
 * la vista de hoy y la de mañana.
 * Resalta automáticamente el tab activo usando `usePathname()`.
 */
export function NavTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación de días"
      className="flex items-center justify-center px-4 pt-3 pb-1"
    >
      {/* Contenedor segmentado */}
      <div
        className="
          flex
          bg-[var(--color-border)]
          rounded-[10px]
          p-[3px]
          gap-[2px]
          w-full max-w-[240px]
        "
      >
        {TABS.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? 'page' : undefined}
              className={`
                flex-1 text-center text-[14px] font-medium
                py-1.5 rounded-[8px]
                transition-all duration-150
                ${
                  isActive
                    ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }
              `}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

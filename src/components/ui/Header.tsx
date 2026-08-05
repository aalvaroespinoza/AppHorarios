/**
 * Header de la aplicación.
 * Fijo en la parte superior, con fondo blanco y separador sutil.
 * Sin lógica ni botones por ahora.
 */
export function Header() {
  return (
    <header
      className="
        sticky top-0 z-50
        h-14
        flex items-center
        px-5
        bg-[var(--color-surface)]
        border-b border-[var(--color-border)]
      "
      style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
    >
      {/* Logo / nombre de la app */}
      <div className="flex items-center gap-2">
        {/* Ícono placeholder — se reemplazará por el ícono real */}
        <span
          className="
            w-7 h-7 rounded-lg
            bg-[var(--color-accent)]
            flex items-center justify-center
            text-white text-xs font-bold
            select-none
          "
          aria-hidden="true"
        >
          AH
        </span>

        <span className="text-[15px] font-semibold text-[var(--color-text-primary)] tracking-tight">
          AppHorarios
        </span>
      </div>
    </header>
  );
}

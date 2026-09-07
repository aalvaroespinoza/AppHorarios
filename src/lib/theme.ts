export type ThemeMode = 'light' | 'dark' | 'auto';

// Self-contained so the same resolver can run before hydration and in React.
export function readBrowserTheme(mode?: ThemeMode): { theme: ThemeMode; isDark: boolean } {
  let theme: ThemeMode = mode || 'dark';
  try {
    const saved = mode || window.localStorage.getItem('app_theme');
    if (saved === 'light' || saved === 'dark' || saved === 'auto') theme = saved;
  } catch { /* Storage may be unavailable; theme still works in this session. */ }
  let isDark = theme !== 'light';
  if (theme === 'auto') {
    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    try {
      const cache = JSON.parse(window.localStorage.getItem('weather_cache_cordoba') || 'null');
      const now = new Date();
      const day = cache?.data?.daily?.find((item: { sunrise?: string; sunset?: string }) =>
        item.sunrise && new Date(item.sunrise).toDateString() === now.toDateString());
      if (day?.sunrise && day?.sunset) {
        const sunrise = new Date(day.sunrise).getTime();
        const sunset = new Date(day.sunset).getTime();
        if (Number.isFinite(sunrise) && Number.isFinite(sunset)) isDark = now.getTime() < sunrise || now.getTime() >= sunset;
      }
    } catch { /* Fall back to the system appearance for missing or stale weather. */ }
  }
  return { theme, isDark };
}

export function applyBrowserTheme(isDark: boolean) {
  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDark ? '#0b1020' : '#f4f6fc');
}

export const themeInitScript = `try { (${applyBrowserTheme.toString()})((${readBrowserTheme.toString()})().isDark); } catch {}`;

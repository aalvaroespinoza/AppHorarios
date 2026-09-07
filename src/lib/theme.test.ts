import { afterEach, describe, expect, it, vi } from 'vitest';
import { applyBrowserTheme, readBrowserTheme, themeInitScript } from './theme';

afterEach(() => { localStorage.clear(); document.documentElement.className = ''; vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('appearance', () => {
  it('uses a saved explicit preference and ignores invalid values', () => {
    localStorage.setItem('app_theme', 'light');
    expect(readBrowserTheme()).toEqual({ theme: 'light', isDark: false });
    localStorage.setItem('app_theme', 'invalid');
    expect(readBrowserTheme()).toEqual({ theme: 'dark', isDark: true });
  });
  it('uses system appearance for auto without valid weather', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    expect(readBrowserTheme('auto').isDark).toBe(false);
  });
  it('can switch appearance when browser storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    expect(readBrowserTheme('light').isDark).toBe(false);
  });
  it('boots with the same preference and updates the browser bar', () => {
    document.head.innerHTML = '<meta name="theme-color" content="#000000">';
    localStorage.setItem('app_theme', 'light');
    new Function(themeInitScript)();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute('content')).toBe('#f4f6fc');
    applyBrowserTheme(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});

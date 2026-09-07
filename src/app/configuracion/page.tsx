'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Moon, Sun, ChevronLeft, Ticket, ChevronRight, BookOpen, Clock, Monitor } from 'lucide-react';
import Link from 'next/link';
import { useBec } from '@/hooks/useBec';
import { useTheme, ThemeMode } from '@/context/ThemeContext';

const MODES: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Oscuro', icon: Moon },
  { value: 'auto', label: 'Auto', icon: Monitor },
];

export default function Configuracion() {
  const bec = useBec();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { setMounted(true); }, []);

  const refreshApp = async () => {
    if (!window.confirm('¿Actualizar los archivos de la app? Tus materias y registros se conservan. Necesitás conexión.')) return;
    if (!navigator.onLine) { setError('Conectate a internet para actualizar la app.'); return; }
    setRefreshing(true);
    try {
      if ('caches' in window) {
        const names = await caches.keys();
        await Promise.all(names.filter((name) => /lifeos|app-?horarios/i.test(name)).map((name) => caches.delete(name)));
      }
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        await registration?.update();
      }
      window.location.reload();
    } catch {
      setRefreshing(false);
      setError('No se pudo actualizar. Tus datos siguen guardados en este dispositivo.');
    }
  };

  if (!mounted) return <main className="page-shell" aria-busy="true"><p className="text-subtle">Cargando configuración…</p></main>;
  const currentDate = new Date();
  const month = currentDate.toLocaleString('es-AR', { month: 'long' });
  const year = currentDate.getFullYear();
  const summary = bec.obtenerResumenMensual(currentDate.getMonth() + 1, year);

  return <main className="page-shell text-ink">
    <header className="mb-6 flex items-center gap-3">
      <Link href="/" aria-label="Volver a Viajes" className="glass-button h-11 w-11 p-0"><ChevronLeft size={22} /></Link>
      <div><p className="section-label">A tu manera</p><h1 className="text-3xl font-semibold tracking-tight">Configuración</h1></div>
    </header>
    <div className="space-y-6">
      <section aria-labelledby="appearance-title">
        <h2 id="appearance-title" className="section-label mb-3">Apariencia</h2>
        <div className="glass-panel p-5">
          <p className="mb-4 text-sm text-subtle">Elegí cómo se ve LifeOS.</p>
          <div className="grid grid-cols-3 gap-2" role="group" aria-label="Tema de pantalla">
            {MODES.map(({ value, label, icon: Icon }) => <button key={value} type="button" onClick={() => setTheme(value)} aria-pressed={theme === value} className={`flex min-h-20 flex-col items-center justify-center gap-2 rounded-2xl border text-sm font-medium transition-colors ${theme === value ? 'aurora-border border-accent bg-accent/10 text-accent' : 'border-line bg-muted text-subtle'}`}><Icon size={22} />{label}</button>)}
          </div>
          <p className="mt-3 text-sm text-subtle">Auto sigue la luz del día o, si falta el clima, la apariencia de tu dispositivo.</p>
        </div>
      </section>
      <section aria-labelledby="access-title">
        <h2 id="access-title" className="section-label mb-3">Tu día a día</h2>
        <div className="glass-panel divide-y divide-line overflow-hidden">
          {[{ href: '/aulas', icon: BookOpen, title: 'Aulas y materias', detail: 'Editá tu cursado' }, { href: '/horarios', icon: Clock, title: 'Horarios de colectivos', detail: 'Consultá todos los servicios' }].map(({ href, icon: Icon, title, detail }) => <Link key={href} href={href} className="flex items-center gap-3 p-5"><Icon className="text-accent" size={22} /><div className="flex-1"><p className="font-medium">{title}</p><p className="text-sm text-subtle">{detail}</p></div><ChevronRight size={18} className="text-subtle" /></Link>)}
        </div>
      </section>
      <section aria-labelledby="bec-title">
        <h2 id="bec-title" className="section-label mb-3">Boleto educativo</h2>
        <div className="glass-panel p-5">
          <div className="flex items-center gap-3"><Ticket size={22} className="text-accent" /><div><p className="font-medium">Tus viajes con BEC</p><p className="text-sm capitalize text-subtle">{month} {year}</p></div></div>
          <div className="mt-5 flex items-end gap-3"><span className="text-5xl font-semibold tracking-tight tabular-nums">{summary.totalCombinado}</span><span className="pb-1 text-sm text-subtle">viajes registrados</span></div>
          <div className="mt-4 flex gap-3 text-sm"><span className="glass-pill bg-muted px-3 py-2">{summary.idaTotal} de ida</span><span className="glass-pill bg-muted px-3 py-2">{summary.vueltaTotal} de vuelta</span></div>
        </div>
      </section>
      <section aria-labelledby="maintenance-title">
        <h2 id="maintenance-title" className="section-label mb-3">La app</h2>
        <button type="button" onClick={refreshApp} disabled={refreshing} className="glass-panel flex w-full items-center gap-3 p-5 text-left">
          <RefreshCw size={21} className="shrink-0 text-accent" /><span className="flex-1"><span className="block font-medium">{refreshing ? 'Actualizando…' : 'Actualizar la app'}</span><span className="text-sm text-subtle">Conserva tus materias y registros</span></span><ChevronRight size={18} className="text-subtle" />
        </button>
        {error && <p role="alert" className="mt-3 text-sm text-danger">{error}</p>}
      </section>
      <p className="py-2 text-center text-sm text-subtle">LifeOS · Un día más simple</p>
    </div>
  </main>;
}

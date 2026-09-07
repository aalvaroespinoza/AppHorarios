"use client";

import { useState, useEffect } from 'react';

export default function RelojMinimalista() {
  const [hora, setHora] = useState('');
  useEffect(() => {
    const update = () => setHora(new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'America/Argentina/Cordoba' }).format(new Date()));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);
  return <time className="tabular-nums text-subtle" aria-label="Hora de Córdoba">{hora || '—:—'}</time>;
}

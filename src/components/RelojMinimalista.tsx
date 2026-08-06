"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RelojMinimalista() {
  const [hora, setHora] = useState<string>('');
  const [clics, setClics] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Función para actualizar la hora
    const actualizarHora = () => {
      const ahora = new Date();
      // Formatear la hora en HH:MM
      const horas = ahora.getHours().toString().padStart(2, '0');
      const minutos = ahora.getMinutes().toString().padStart(2, '0');
      setHora(`${horas}:${minutos}`);
    };

    // Actualizar de inmediato
    actualizarHora();

    // Configurar el intervalo para actualizar cada minuto (o cada segundo para ser exactos al cambio de minuto)
    const intervalo = setInterval(actualizarHora, 1000);

    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    if (clics > 0) {
      const timer = setTimeout(() => {
        setClics(0);
      }, 500);

      if (clics >= 3) {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(50);
        }
        router.push('/horarios');
        setClics(0);
      }

      return () => clearTimeout(timer);
    }
  }, [clics, router]);

  // Para evitar destellos de hidratación en SSR, no mostramos nada hasta que esté montado
  if (!hora) {
    return <span className="text-zinc-500 font-mono text-sm opacity-0 select-none">00:00</span>;
  }

  return (
    <span 
      onClick={() => setClics(c => c + 1)}
      className="text-zinc-500 font-mono text-sm cursor-default select-none"
    >
      {hora}
    </span>
  );
}

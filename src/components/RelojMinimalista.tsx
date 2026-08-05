"use client";

import { useState, useEffect } from 'react';

export default function RelojMinimalista() {
  const [hora, setHora] = useState<string>('');

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

  // Para evitar destellos de hidratación en SSR, no mostramos nada hasta que esté montado
  if (!hora) {
    return <span className="text-zinc-500 font-mono text-sm opacity-0">00:00</span>;
  }

  return (
    <span className="text-zinc-500 font-mono text-sm">
      {hora}
    </span>
  );
}

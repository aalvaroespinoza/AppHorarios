import { NextResponse } from 'next/server';
import { calcularColectivos, timeToMins } from '@/lib/engine/recommendation-engine';
import type { DayOfWeek } from '@/types/common';

export async function GET(request: Request) {
  // Obtener fecha y hora actual en la zona horaria de Argentina
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Argentina/Buenos_Aires',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'long'
  });
  
  const dateObj = new Date();
  
  // Extraemos la hora formateada HH:mm (ej. "14:30")
  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Argentina/Buenos_Aires',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Extraemos el día en inglés para mapearlo con seguridad (ej. "Monday")
  const dayFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Argentina/Buenos_Aires',
    weekday: 'long'
  });

  const horaActualHHMM = timeFormatter.format(dateObj); // "14:30" (o a veces "24:30" dependiendo de la config de JS, mejor usar un enfoque robusto)

  // Enfoque robusto para hora y día en Argentina:
  const argDate = new Date(dateObj.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }));
  const diasSemanales = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  const diaSemana = diasSemanales[argDate.getDay()] as DayOfWeek;
  const h = argDate.getHours().toString().padStart(2, '0');
  const m = argDate.getMinutes().toString().padStart(2, '0');
  const horaCalculada = `${h}:${m}`;

  // Usamos valores por defecto para los toggles (no cursa arquitectura extra, no duerme en cba)
  const { recomendado } = calcularColectivos(diaSemana, 'ida', false, false, horaCalculada);
  
  const headers = { 'Content-Type': 'text/plain; charset=utf-8' };

  if (!recomendado) {
    return new NextResponse("Ya no hay colectivos disponibles para la ida de hoy.", { headers });
  }

  const minsFaltantes = timeToMins(recomendado.horaSalida) - timeToMins(horaCalculada);
  
  let textoSiri = "";
  if (minsFaltantes > 0) {
    textoSiri = `Tu próximo colectivo de la empresa ${recomendado.empresa} sale a las ${recomendado.horaSalida}. Tienes ${minsFaltantes} minutos para salir.`;
  } else if (minsFaltantes === 0) {
    textoSiri = `Tu colectivo de la empresa ${recomendado.empresa} está saliendo ahora mismo a las ${recomendado.horaSalida}.`;
  } else {
    textoSiri = `El colectivo recomendado de la empresa ${recomendado.empresa} para tu horario ya salió a las ${recomendado.horaSalida}.`;
  }

  return new NextResponse(textoSiri, { headers });
}

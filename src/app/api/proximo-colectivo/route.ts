import { NextResponse } from 'next/server';
import { calcularColectivos, OFFSET_PARADA_VUELTA_MIN, addMinutes } from '@/lib/engine/recommendation-engine';
import type { DayOfWeek } from '@/core/types/common';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Parámetros opcionales
  const reqArquitectura = searchParams.get('arquitectura');
  const reqDuerme = searchParams.get('duerme');
  const reqSentido = searchParams.get('sentido');

  // Defaults: Asumimos que cursa arquitectura (salvo que diga 'no') y que NO duerme en Cba (salvo que diga 'si')
  const cursaArquitectura = reqArquitectura === 'no' ? false : true;
  const duermeEnCordoba = reqDuerme === 'si' ? true : false;
  
  // Determinamos el día actual en Argentina
  const formatter = new Intl.DateTimeFormat('en-CA', { 
    timeZone: 'America/Argentina/Buenos_Aires',
    weekday: 'long'
  });
  const now = new Date();
  
  // Convertir día de semana a formato interno (sin tildes, minúsculas)
  const dayStr = formatter.format(now).toLowerCase(); // ej: 'monday'
  const mapDays: Record<string, DayOfWeek> = {
    'monday': 'lunes', 'tuesday': 'martes', 'wednesday': 'miercoles', 
    'thursday': 'jueves', 'friday': 'viernes', 'saturday': 'sabado', 'sunday': 'lunes'
  };
  
  let dia = mapDays[dayStr] || 'lunes';

  // Determinamos la hora actual en Argentina (HH:MM)
  const timeFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/Argentina/Buenos_Aires',
    hour: '2-digit',
    minute: '2-digit'
  });
  const horaActualHHMM = timeFormatter.format(now);
  const hourNum = parseInt(horaActualHHMM.split(':')[0], 10);

  // Determinar sentido
  let sentido: 'ida' | 'vuelta' = hourNum < 13 ? 'ida' : 'vuelta';
  if (reqSentido === 'ida' || reqSentido === 'vuelta') {
    sentido = reqSentido;
  }

  // Ejecutar el motor de recomendación
  const recomendacion = calcularColectivos(dia, sentido, cursaArquitectura, duermeEnCordoba, horaActualHHMM);

  if (!recomendacion.recomendado) {
    return NextResponse.json({
      mensaje: `No hay colectivos de ${sentido} programados para hoy.`,
      horaSalida: null,
      empresa: null,
      sentido,
      minutosRestantes: null
    });
  }

  const rec = recomendacion.recomendado;
  const esVuelta = sentido === 'vuelta';
  
  // Calcular hora real por la parada (para vuelta)
  const horaReal = esVuelta ? addMinutes(rec.horaSalida, OFFSET_PARADA_VUELTA_MIN) : rec.horaSalida;

  // Calcular minutos restantes
  const [hSalida, mSalida] = horaReal.split(':').map(Number);
  const [hActual, mActual] = horaActualHHMM.split(':').map(Number);
  
  // Convertir a minutos del día
  const minutosDiaSalida = hSalida * 60 + mSalida;
  const minutosDiaActual = hActual * 60 + mActual;
  
  let diffMins = minutosDiaSalida - minutosDiaActual;
  
  // Si el colectivo es del día siguiente (por ejemplo pasa la medianoche)
  if (diffMins < 0 && (hSalida >= 0 && hSalida <= 3) && hActual >= 20) {
      diffMins += 24 * 60;
  }

  const empresa = rec.empresa.charAt(0).toUpperCase() + rec.empresa.slice(1).toLowerCase();
  
  let mensaje = `El de las ${horaReal} sale en ${diffMins} minutos (${empresa})`;
  if (diffMins < 0) {
    mensaje = `El último colectivo programado era a las ${horaReal} (${empresa}) y ya salió`;
  } else if (diffMins === 0) {
    mensaje = `El colectivo de las ${horaReal} (${empresa}) está saliendo ahora`;
  }

  return NextResponse.json({
    mensaje,
    horaSalida: horaReal,
    empresa: rec.empresa,
    sentido,
    minutosRestantes: diffMins
  });
}

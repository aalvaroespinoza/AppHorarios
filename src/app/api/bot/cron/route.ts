import { NextRequest, NextResponse } from 'next/server';
import { Telegraf } from 'telegraf';
import { calcularColectivos, OFFSET_PARADA_VUELTA_MIN, addMinutes } from '../../../../lib/engine/recommendation-engine';
import { DayOfWeek } from '../../../../types/common';

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
const CRON_SECRET = process.env.CRON_SECRET;

// Helper estático
const getDiaActual = (d: Date): DayOfWeek | 'domingo' => {
  const map: Record<number, DayOfWeek | 'domingo'> = {
    0: 'domingo', 1: 'lunes', 2: 'martes', 3: 'miercoles',
    4: 'jueves', 5: 'viernes', 6: 'sabado'
  };
  return map[d.getDay()];
};

export async function GET(req: NextRequest) {
  // 1. Verificación de Seguridad Serverless
  // Protegemos el endpoint para que nadie pueda ejecutarlo y mandar mensajes spam
  const authHeader = req.headers.get('authorization');

  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized. Invalid Bearer token.' }, { status: 401 });
  }

  // 2. Verificación de entorno
  if (!botToken || !chatId) {
    return NextResponse.json(
      { error: 'Server Misconfiguration: Faltan credenciales de Telegram' },
      { status: 500 }
    );
  }

  const ahora = new Date();
  ahora.setHours(ahora.getHours() - 3); // Ajuste UTC-3 para Argentina

  const dia = getDiaActual(ahora);
  if (dia === 'domingo' || dia === 'lunes' || dia === 'sabado') {
    return NextResponse.json({ status: 'ok', sent: false, reason: `Es ${dia}, sin clases presenciales.` });
  }

  const diaAcademico = dia as DayOfWeek;
  let mensajeEnviado = false;
  const bot = new Telegraf(botToken);
  
  // Convertimos la hora actual a minutos
  const hStr = ahora.getHours().toString().padStart(2, '0');
  const mStr = ahora.getMinutes().toString().padStart(2, '0');
  const horaActualHHMM = `${hStr}:${mStr}`;
  const minutosActuales = ahora.getHours() * 60 + ahora.getMinutes();

  // Función interna para evaluar y despachar
  const evaluarYNotificar = async (tipo: 'ida' | 'vuelta') => {
    // Por defecto el bot asume que cursa Arquitectura (true) y duerme en Cba (true)
    const rec = calcularColectivos(diaAcademico, tipo, true, true, horaActualHHMM);
    if (rec.recomendado) {
      const horaReal = tipo === 'vuelta' ? addMinutes(rec.recomendado.horaSalida, OFFSET_PARADA_VUELTA_MIN) : rec.recomendado.horaSalida;
      const [h, m] = horaReal.split(':').map(Number);
      const minutosSalida = h * 60 + m;
      const diff = minutosSalida - minutosActuales;

      // 3. Regla de negocio: Exactamente 15 minutos de diferencia
      if (diff === 15) {
        let msg = `🏃‍♂️ ¡Atención! En 15 min pasa el *${rec.recomendado.empresa}* por tu parada (Ministerio) a las *${horaReal}*. ¡Andá saliendo! (Salió de Terminal a las ${rec.recomendado.horaSalida})`;
        if (tipo === 'ida') {
          msg = `🧉 ¡Buen día! Prepará el termo y el mate que en 15 minutos tenés que salir para tomar el *${rec.recomendado.empresa}* de las *${rec.recomendado.horaSalida}*`;
        }
        
        await bot.telegram.sendMessage(
          chatId,
          msg,
          { parse_mode: 'Markdown' }
        );
        mensajeEnviado = true;
      }
    }
  };

  try {
    // 4. Chequeamos la ida y la vuelta
    await evaluarYNotificar('ida');
    await evaluarYNotificar('vuelta');

    // 5. Retornamos respuesta limpia
    return NextResponse.json({ 
      status: 'ok', 
      sent: mensajeEnviado,
      timestamp: ahora.toISOString()
    });

  } catch (error) {
    console.error('Error enviando la alerta Push en Telegram:', error);
    return NextResponse.json({ status: 'error', sent: false }, { status: 500 });
  }
}

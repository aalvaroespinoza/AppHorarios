import { NextRequest, NextResponse } from 'next/server';
import { Telegraf } from 'telegraf';
import { calcularColectivoRecomendado } from '../../../../engine/recommendationEngine';
import { DiaSemana, EscenarioUsuario } from '../../../../types';

// Forzamos la runtime de Node, ya que Telegraf usa dependencias de Node.js que no soportan Edge
// export const runtime = 'nodejs';

// Soportamos varias nomenclaturas de variables de entorno
const botToken = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID || process.env.MY_CHAT_ID;
const CRON_SECRET = process.env.CRON_SECRET || 'apphorarios_secret_123'; // Valor por defecto fallback local

const escenarioPorDefecto: EscenarioUsuario = {
  cursaArquitecturaMartes: true,
  duermeEnCordobaViernes: true,
  minutosCaminandoTerminal: 10,
};

// Helper estático
const getDiaActual = (): DiaSemana => {
  const map: Record<number, DiaSemana> = {
    0: 'domingo', 1: 'lunes', 2: 'martes', 3: 'miercoles',
    4: 'jueves', 5: 'viernes', 6: 'sabado'
  };
  return map[new Date().getDay()];
};

export async function GET(req: NextRequest) {
  // 1. Verificación de Seguridad Serverless
  // Protegemos el endpoint para que nadie pueda ejecutarlo y mandar mensajes spam
  const url = new URL(req.url);
  const authSecret = url.searchParams.get('secret');

  if (authSecret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized. Secret is invalid.' }, { status: 401 });
  }

  // 2. Verificación de entorno
  if (!botToken || !chatId) {
    return NextResponse.json(
      { error: 'Server Misconfiguration: Faltan credenciales de Telegram' },
      { status: 500 }
    );
  }

  const dia = getDiaActual();
  if (dia === 'domingo') {
    return NextResponse.json({ status: 'ok', sent: false, reason: 'Es domingo, sin clases' });
  }

  let mensajeEnviado = false;
  const bot = new Telegraf(botToken);
  const ahora = new Date();
  
  // Convertimos la hora actual a minutos
  const minutosActuales = ahora.getHours() * 60 + ahora.getMinutes();

  // Función interna para evaluar y despachar
  const evaluarYNotificar = async (tipo: 'ida' | 'vuelta') => {
    const rec = calcularColectivoRecomendado(dia, tipo, escenarioPorDefecto);
    if (rec.recomendado) {
      const [h, m] = rec.recomendado.horaSalida.split(':').map(Number);
      const minutosSalida = h * 60 + m;
      const diff = minutosSalida - minutosActuales;

      // 3. Regla de negocio: Exactamente 15 minutos de diferencia
      if (diff === 15) {
        let msg = `🏃‍♂️ ¡Atención! En 15 min sale el *${rec.recomendado.empresa}* de las *${rec.recomendado.horaSalida}*. ¡Andá saliendo para la parada!`;
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

import { NextRequest, NextResponse } from 'next/server';
import { Telegraf } from 'telegraf';
import { calcularColectivos, OFFSET_PARADA_VUELTA_MIN, addMinutes } from '../../../../lib/engine/recommendation-engine';
import { DayOfWeek } from '@/core/types/common';

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

import { supabaseServerAdmin } from '@/lib/server/supabase';
import { GeminiService } from '@/core/ai/service';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized. Invalid Bearer token.' }, { status: 401 });
  }

  if (!botToken || !chatId) {
    return NextResponse.json(
      { error: 'Server Misconfiguration: Faltan credenciales de Telegram' },
      { status: 500 }
    );
  }

  // Ejecutamos el briefing en background para que devuelva 200 rápido y no dé timeout en Vercel
  ejecutarBriefingDiario(botToken, chatId).catch(console.error);

  return NextResponse.json({ status: 'ok', msg: 'Daily Briefing scheduled' }, { status: 200 });
}

async function ejecutarBriefingDiario(token: string, chat: string) {
  try {
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    const hoy = new Date();

    const ayerStr = ayer.toISOString().split('T')[0];
    const hoyStr = hoy.toISOString().split('T')[0];

    // Fetch asíncrono en paralelo de las 3 tablas que se nos solicitan
    const [gastosRes, eventosRes, bateriaRes] = await Promise.all([
      supabaseServerAdmin.from('transacciones').select('*').eq('tipo', 'gasto').gte('fecha', ayerStr).lte('fecha', hoyStr),
      supabaseServerAdmin.from('agenda').select('*').eq('fecha', hoyStr),
      supabaseServerAdmin.from('bateria_mental').select('*').order('created_at', { ascending: false }).limit(1)
    ]);

    const promptData = `
Gastos de ayer: ${JSON.stringify(gastosRes.data || [])}
Eventos de hoy: ${JSON.stringify(eventosRes.data || [])}
Última Batería Mental: ${JSON.stringify(bateriaRes.data || [])}
`;

    // Redacción vía Gemini
    const geminiText = await GeminiService.askText(
      'gemini-3.5-flash',
      'Eres LifeOS. Redacta un saludo de buenos días ultra corto (2 líneas) resumiendo hoy según estos datos crudos. Sé directo.',
      promptData
    );

    // Enviar a Telegram
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const tgBody = {
      chat_id: chat,
      text: geminiText,
      reply_markup: {
        inline_keyboard: [
          [{ text: "☀️ Ver LifeOS", url: "https://apphorarios.vercel.app/lifeos" }]
        ]
      }
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tgBody)
    });

    if (!res.ok) {
      console.error('Error de API Telegram en Daily Briefing:', await res.text());
    } else {
      console.log('Daily Briefing enviado con éxito');
    }

  } catch (error) {
    console.error('Error en ejecutarBriefingDiario:', error);
  }
}


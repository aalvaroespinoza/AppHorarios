import { NextRequest, NextResponse } from 'next/server';
import { Telegraf, Markup } from 'telegraf';
import { calcularColectivos, OFFSET_PARADA_VUELTA_MIN, addMinutes } from '../../../../lib/engine/recommendation-engine';
import { DayOfWeek } from '../../../../types/common';
import { RawScheduleEntry } from '../../../../types/schedule';
import { getScheduleForDay } from '../../../../lib/services';
import { rawScheduleEntries } from '../../../../data/schedules';
import { companies } from '../../../../data/companies';

const botToken = process.env.TELEGRAM_BOT_TOKEN;

if (!botToken) {
  console.error('Falta TELEGRAM_BOT_TOKEN');
}

const bot = new Telegraf(botToken || 'DUMMY_TOKEN_FOR_BUILD');

// --- Helpers estáticos ---
const getDiaActual = (): DayOfWeek | 'domingo' => {
  const map: Record<number, DayOfWeek | 'domingo'> = {
    0: 'domingo', 1: 'lunes', 2: 'martes', 3: 'miercoles',
    4: 'jueves', 5: 'viernes', 6: 'sabado'
  };
  const d = new Date();
  // Ajuste UTC-3 para Argentina si Vercel está en UTC (Opcional, pero recomendado)
  d.setHours(d.getHours() - 3);
  return map[d.getDay()];
};

const getDiaManana = (): DayOfWeek | 'domingo' => {
  const map: Record<number, DayOfWeek | 'domingo'> = {
    0: 'domingo', 1: 'lunes', 2: 'martes', 3: 'miercoles',
    4: 'jueves', 5: 'viernes', 6: 'sabado'
  };
  const d = new Date();
  d.setHours(d.getHours() - 3);
  return map[(d.getDay() + 1) % 7];
};

const getHoraActualArgHHMM = (): string => {
  const d = new Date();
  d.setHours(d.getHours() - 3); // UTC-3 Argentina
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
};

const mainMenu = Markup.inlineKeyboard([
  [Markup.button.callback('📅 Hoy', 'cmd_hoy'), Markup.button.callback('🌅 Mañana', 'cmd_manana')],
  [Markup.button.callback('⏳ Estado Actual', 'cmd_estado')]
]);

// --- Lógica del Bot ---
bot.start((ctx) => {
  const imageUrl = 'https://images.unsplash.com/photo-1590077428593-a55bb07c4665?auto=format&fit=crop&w=800&q=80'; 
  const welcomeText = `👋 *¡Hola\\!* Soy el bot de AppHorarios\\.\n\n¿Qué necesitas consultar hoy?`;
  
  return ctx.replyWithPhoto(
    { url: imageUrl },
    {
      caption: welcomeText,
      parse_mode: 'MarkdownV2',
      ...mainMenu
    }
  );
});

const handleHoy = (ctx: any) => {
  const dia = getDiaActual();
  if (dia === 'domingo' || dia === 'lunes' || dia === 'sabado') {
    return ctx.reply(`☕ Hoy es ${dia}. No viajás, ¡a descansar!`, mainMenu);
  }
  
  const diaAcademico = dia as DayOfWeek;
  const horaActual = getHoraActualArgHHMM();
  const recIda = calcularColectivos(diaAcademico, 'ida', true, true, horaActual);
  const recVuelta = calcularColectivos(diaAcademico, 'vuelta', true, true, horaActual);

  if (!recIda.recomendado && !recVuelta.recomendado) {
    return ctx.reply('Hoy ya no tienes viajes recomendados disponibles.', mainMenu);
  }

  let respuesta = `🚌 *Resumen del día (${dia.toUpperCase()})*\n\n`;
  if (recIda.recomendado) {
    respuesta += `*IDA:*\n`;
    respuesta += `🏆 Recomendado: *${recIda.recomendado.horaSalida}* (${recIda.recomendado.empresa})\n`;
    if (recIda.alternativas.length > 0) {
      respuesta += `⏱️ Siguientes: ${recIda.alternativas.map(a => a.horaSalida).join(', ')}\n`;
    }
  }
  
  if (recVuelta.recomendado) {
    const horaTerminal = recVuelta.recomendado.horaSalida;
    const horaMinisterio = addMinutes(horaTerminal, OFFSET_PARADA_VUELTA_MIN);
    respuesta += `\n*VUELTA:*\n`;
    respuesta += `🏆 Sale de Terminal: *${horaTerminal}* (${recVuelta.recomendado.empresa})\n`;
    respuesta += `📍 *Pasa por tu parada (Ministerio): ${horaMinisterio}*\n`;
    if (recVuelta.alternativas.length > 0) {
      respuesta += `⏱️ Siguientes (desde Terminal): ${recVuelta.alternativas.map(a => a.horaSalida).join(', ')}\n`;
    }
  } else {
    respuesta += `\n*VUELTA:*\nNo hay vuelta recomendada.`;
  }

  return ctx.replyWithMarkdown(respuesta, mainMenu);
};

bot.command('hoy', handleHoy);
bot.action('cmd_hoy', handleHoy);

const handleManana = (ctx: any) => {
  const dia = getDiaManana();
  if (dia === 'domingo' || dia === 'sabado' || dia === 'lunes') {
    return ctx.reply(`🏖️ Mañana es ${dia.charAt(0).toUpperCase() + dia.slice(1)}. No cursás, a disfrutar.`, mainMenu);
  }

  const diaAcademico = dia as DayOfWeek;
  // Se pasa 00:00 para asegurar que traiga todos los horarios del día de mañana
  const recIda = calcularColectivos(diaAcademico, 'ida', true, true, '00:00');
  
  if (!recIda.recomendado) {
    return ctx.reply(`Mañana ${dia.charAt(0).toUpperCase() + dia.slice(1)} no tienes viajes programados.`, mainMenu);
  }

  let respuesta = `🌅 *Mañana ${dia.charAt(0).toUpperCase() + dia.slice(1)}*\n\n`;
  respuesta += `Tu mejor opción de ida es el *${recIda.recomendado.empresa}* de las *${recIda.recomendado.horaSalida}*.`;

  return ctx.replyWithMarkdown(respuesta, mainMenu);
};

bot.command('manana', handleManana);
bot.action('cmd_manana', handleManana);

const handleEstado = (ctx: any) => {
  const dia = getDiaActual();
  if (dia === 'domingo' || dia === 'lunes' || dia === 'sabado') {
    return ctx.reply('No hay viajes hoy.');
  }
  
  const diaAcademico = dia as DayOfWeek;
  const horaActual = getHoraActualArgHHMM();
  const recIda = calcularColectivos(diaAcademico, 'ida', true, true, horaActual);
  const recVuelta = calcularColectivos(diaAcademico, 'vuelta', true, true, horaActual);
  
  let proximo: RawScheduleEntry | null = null;
  let esVuelta = false;
  if (recIda.recomendado) {
    proximo = recIda.recomendado;
  } else if (recVuelta.recomendado) {
    proximo = recVuelta.recomendado;
    esVuelta = true;
  }
  
  if (!proximo) {
    return ctx.reply('No hay más viajes hoy.');
  }
  
  const d = new Date();
  d.setHours(d.getHours() - 3); // UTC-3
  const minutosActuales = d.getHours() * 60 + d.getMinutes();

  const horaReal = esVuelta ? addMinutes(proximo.horaSalida, OFFSET_PARADA_VUELTA_MIN) : proximo.horaSalida;
  const [h, m] = horaReal.split(':').map(Number);
  const diff = (h * 60 + m) - minutosActuales;
  const horas = Math.floor(diff / 60);
  const mins = diff % 60;
  
  let tiempoStr = '';
  if (horas > 0) tiempoStr += `${horas}h `;
  tiempoStr += `${mins}m`;
  
  // Mensaje corto y directo para centro de notificaciones iOS
  const msjRespuesta = `🚌 Próximo en ${tiempoStr}: ${proximo.empresa} a las ${horaReal} (${esVuelta ? 'Vuelta' : 'Ida'})`;
  
  return ctx.reply(msjRespuesta);
};

bot.command('estado', handleEstado);
bot.action('cmd_estado', handleEstado);

const handleHorarios = (ctx: any) => {
  const dia = getDiaActual();
  if (dia === 'domingo' || dia === 'lunes') {
    return ctx.reply('No hay colectivos para UTN los días ' + dia + '.', mainMenu);
  }
  
  const schedule = getScheduleForDay(dia as DayOfWeek, rawScheduleEntries, Object.values(companies));
  
  let msg = `📅 *Grilla Completa - ${dia.toUpperCase()}*\n\n`;
  msg += `*IDA (Despeñaderos → Cba)*\n`;
  if (schedule.ida.length === 0) msg += `No hay servicios.\n`;
  schedule.ida.forEach(v => msg += `- ${v.departureTime} (${v.companyName})\n`);
  
  msg += `\n*VUELTA (Cba → Despeñaderos)*\n`;
  if (schedule.vuelta.length === 0) msg += `No hay servicios.\n`;
  schedule.vuelta.forEach(v => msg += `- ${v.departureTime} (${v.companyName})\n`);
  
  return ctx.replyWithMarkdown(msg, mainMenu);
};

bot.command('horarios', handleHorarios);

const handleAyuda = (ctx: any) => {
  const msg = `ℹ️ *Comandos Disponibles:*\n\n` +
              `/hoy - Muestra recomendaciones para el día actual.\n` +
              `/manana - Muestra recomendaciones para el día siguiente.\n` +
              `/estado - Muestra el tiempo restante en formato corto.\n` +
              `/horarios - Muestra la grilla completa del día.\n` +
              `/ayuda - Muestra este mensaje.`;
  return ctx.replyWithMarkdown(msg, mainMenu);
};

bot.command('ayuda', handleAyuda);

// --- Endpoint de Next.js (Serverless Handler) ---
export async function POST(req: Request) {
  try {
    const body = await req.json();
    await bot.handleUpdate(body);
    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Error procesando el webhook de Telegram:', error);
    return new Response('OK', { status: 200 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { Telegraf, Markup } from 'telegraf';
import { calcularColectivoRecomendado } from '../../../../engine/recommendationEngine';
import { HORARIOS_COLECTIVOS } from '../../../../data/horariosDB';
import { DiaSemana, EscenarioUsuario } from '../../../../types';

// Soportamos ambos nombres de variables de entorno para evitar problemas
const botToken = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;

if (!botToken) {
  throw new Error('El token del bot de Telegram no está definido en las variables de entorno.');
}

const bot = new Telegraf(botToken);

// --- Helpers estáticos ---
const getDiaActual = (): DiaSemana => {
  const map: Record<number, DiaSemana> = {
    0: 'domingo', 1: 'lunes', 2: 'martes', 3: 'miercoles',
    4: 'jueves', 5: 'viernes', 6: 'sabado'
  };
  return map[new Date().getDay()];
};

// Escenario por defecto para el bot (en una app más grande esto vendría de una base de datos de usuarios)
const escenarioPorDefecto: EscenarioUsuario = {
  cursaArquitecturaMartes: true,
  duermeEnCordobaViernes: true,
  minutosCaminandoTerminal: 10,
};

// --- Lógica del Bot ---

bot.start((ctx) => {
  return ctx.reply(
    '👋 ¡Hola! Soy el bot de AppHorarios.\n\n¿Qué necesitas consultar hoy?',
    Markup.inlineKeyboard([
      [Markup.button.callback('🚍 Ver horarios de Ida', 'ver_ida')],
      [Markup.button.callback('🏠 Ver horarios de Vuelta', 'ver_vuelta')]
    ])
  );
});

bot.action('ver_ida', (ctx) => {
  const dia = getDiaActual();
  const horarios = HORARIOS_COLECTIVOS[dia] || [];
  const ida = horarios.filter(h => h.tipo === 'ida');
  
  if (ida.length === 0) {
    return ctx.reply(`Hoy (${dia}) no hay viajes de ida programados en la base de datos.`);
  }

  const texto = ida.map(h => `• *${h.horaSalida}* - ${h.empresa}`).join('\n');
  return ctx.reply(`🚍 *Próximas salidas de Ida (${dia}):*\n\n${texto}`, { parse_mode: 'Markdown' });
});

bot.action('ver_vuelta', (ctx) => {
  const dia = getDiaActual();
  const horarios = HORARIOS_COLECTIVOS[dia] || [];
  const vuelta = horarios.filter(h => h.tipo === 'vuelta');
  
  if (vuelta.length === 0) {
    return ctx.reply(`Hoy (${dia}) no hay viajes de vuelta programados en la base de datos.`);
  }

  const texto = vuelta.map(h => `• *${h.horaSalida}* - ${h.empresa}`).join('\n');
  return ctx.reply(`🏠 *Próximas salidas de Vuelta (${dia}):*\n\n${texto}`, { parse_mode: 'Markdown' });
});

bot.command('hoy', (ctx) => {
  const dia = getDiaActual();
  if (dia === 'domingo') {
    return ctx.reply('☕ Hoy es Domingo. No viajás, ¡a descansar!');
  }

  const recIda = calcularColectivoRecomendado(dia, 'ida', escenarioPorDefecto);
  const recVuelta = calcularColectivoRecomendado(dia, 'vuelta', escenarioPorDefecto);

  if (!recIda.recomendado) {
    return ctx.reply('Hoy no tienes viajes programados según tu configuración.');
  }

  let respuesta = `🚌 *Resumen del día (${dia.toUpperCase()})*\n\n`;
  
  respuesta += `*IDA:*\n`;
  respuesta += `🏆 Recomendado: *${recIda.recomendado.horaSalida}* (${recIda.recomendado.empresa})\n`;
  if (recIda.alternativas.length > 0) {
    respuesta += `⏱️ Siguientes: ${recIda.alternativas.map(a => a.horaSalida).join(', ')}\n`;
  }
  
  if (recVuelta.recomendado) {
    respuesta += `\n*VUELTA:*\n`;
    respuesta += `🏆 Recomendado: *${recVuelta.recomendado.horaSalida}* (${recVuelta.recomendado.empresa})\n`;
    if (recVuelta.alternativas.length > 0) {
      respuesta += `⏱️ Siguientes: ${recVuelta.alternativas.map(a => a.horaSalida).join(', ')}\n`;
    }
  } else {
    respuesta += `\n*VUELTA:*\nNo hay vuelta recomendada (Dormís allá).`;
  }

  return ctx.replyWithMarkdown(respuesta);
});

// --- Endpoint de Next.js (Serverless Handler) ---
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Le pasamos el cuerpo del webhook directamente a Telegraf
    await bot.handleUpdate(body);
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error procesando el webhook de Telegram:', error);
    // Retornamos 200 aunque falle, para que Telegram deje de reintentar solicitudes corruptas infinitamente
    return NextResponse.json({ ok: false, error: 'Internal Error' }, { status: 200 });
  }
}

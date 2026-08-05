import { getHorariosPorDia } from '../services/horariosService.js';
import dayjs from 'dayjs';
import 'dayjs/locale/es.js';

// Usar locale en español para que dayjs retorne los días como "lunes", "martes", etc.
dayjs.locale('es');

// Estructura en memoria para guardar temporalmente los chat_ids
const usuariosRegistrados = new Set();

/**
 * Controlador para el comando /start
 */
export const handleStart = async (ctx) => {
  try {
    const chatId = ctx.chat.id;
    usuariosRegistrados.add(chatId);
    
    // Imprimir el chat_id en consola según lo requerido
    console.log(`[NUEVO USUARIO] Se ha registrado el chat_id: ${chatId} - ${ctx.from.first_name}`);

    const mensaje = `
👋 ¡Hola *${ctx.from.first_name}*! 
Soy tu bot de asistencia para los horarios de colectivo.
He guardado tu \`chat_id\` (${chatId}) para futuras notificaciones.

Comandos disponibles:
/hoy - Muestra los horarios de los colectivos para hoy.
    `;
    
    await ctx.reply(mensaje, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Error en el comando /start:', error);
    await ctx.reply('Hubo un error al procesar tu solicitud. Intenta de nuevo.');
  }
};

/**
 * Controlador para el comando /hoy
 */
export const handleHorariosHoy = async (ctx) => {
  try {
    // 1. Leer el día actual usando dayjs
    const diaActual = dayjs().format('dddd').toLowerCase(); 
    
    // 2. Normalizar el string (quitar tildes por ejemplo: miércoles -> miercoles, sábado -> sabado)
    const diaNormalizado = diaActual.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    // 3. Manejo especial para domingos y lunes
    if (diaNormalizado === 'domingo' || diaNormalizado === 'lunes') {
      return await ctx.reply('Hoy no tenés que viajar a Córdoba. ¡Disfrutá! 🎉');
    }
    
    // 4. Mapear el día y buscar en los datos
    const horariosDelDia = getHorariosPorDia(diaNormalizado);
    
    if (!horariosDelDia || Object.keys(horariosDelDia).length === 0) {
      return await ctx.reply(`📅 Hoy es ${diaActual}, pero no encontré horarios registrados.`);
    }

    // 5. Formatear la respuesta en Markdown
    let respuesta = `📅 *Horarios para hoy (${diaActual})*\n\n`;
    
    for (const [clave, viajes] of Object.entries(horariosDelDia)) {
      if (viajes && viajes.length > 0) {
        // Formatear la clave (ej: "ida_solo_tarde" -> "Ida Solo Tarde")
        const titulo = clave.split('_').map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1)).join(' ');
        respuesta += `🚌 *${titulo}*\n`;
        
        viajes.forEach(viaje => {
          const detalleSalida = viaje.sale_despeñaderos 
            ? `Salida Despeñaderos: ${viaje.sale_despeñaderos}` 
            : `Salida Córdoba: ${viaje.sale_cordoba}`;
          respuesta += `  • _${viaje.empresa}_ - 🕒 ${detalleSalida}\n`;
        });
        respuesta += '\n';
      }
    }

    await ctx.reply(respuesta, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Error en el comando /hoy:', error);
    await ctx.reply('Hubo un error al buscar los horarios. Intenta de nuevo.');
  }
};

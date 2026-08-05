import cron from 'node-cron';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import 'dayjs/locale/es.js';
import { getHorariosPorDia } from './horariosService.js';

// Configurar los plugins de zona horaria y el locale de dayjs
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('es');

export const startNotifier = (bot) => {
  const chatId = process.env.MY_CHAT_ID;
  
  if (!chatId) {
    console.warn('⚠️ MY_CHAT_ID no está configurado en .env. Las alertas no se enviarán.');
    return;
  }

  // Se ejecuta cada 1 minuto
  cron.schedule('* * * * *', () => {
    // 1. Obtener la hora actual en la zona horaria requerida
    const ahora = dayjs().tz('America/Argentina/Cordoba');
    
    // 2. Calcular la hora exacta que será en 15 minutos (Formato HH:mm)
    const en15Minutos = ahora.add(15, 'minute');
    const horaObjetivo = en15Minutos.format('HH:mm');
    
    // 3. Obtener el día actual normalizado (lunes, martes, etc.)
    const diaActual = ahora.format('dddd').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    // 4. Obtener horarios de hoy
    const horariosDelDia = getHorariosPorDia(diaActual);
    
    if (!horariosDelDia) return; // Si es domingo/lunes o no hay datos, no hacemos nada

    // 5. Buscar si algún colectivo sale exactamente a la hora objetivo
    for (const [categoria, viajes] of Object.entries(horariosDelDia)) {
      if (viajes && viajes.length > 0) {
        viajes.forEach(viaje => {
          const horaSalida = viaje.sale_despeñaderos || viaje.sale_cordoba;
          
          if (horaSalida === horaObjetivo) {
            // Coincidencia exacta, enviamos la alerta
            const mensaje = `⚠️ ¡Atención! En 15 minutos (a las ${horaSalida}) sale tu colectivo de la empresa ${viaje.empresa}. ¡Andá yendo para la parada!`;
            
            bot.telegram.sendMessage(chatId, mensaje)
              .then(() => console.log(`[ALERTA ENVIADA] Colectivo de las ${horaSalida} - ${viaje.empresa}`))
              .catch(err => console.error('[ERROR] No se pudo enviar la alerta:', err));
          }
        });
      }
    }
  }, {
    timezone: "America/Argentina/Cordoba"
  });

  console.log('⏱️ Servicio Notifier iniciado. Evaluando colectivos cada minuto.');
};

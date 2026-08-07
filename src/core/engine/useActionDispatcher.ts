import { useFinanzas, Transaccion } from '@/hooks/useFinanzas';
import { useDeadlines, Deadline } from '@/hooks/useDeadlines';
import { useAgenda, CustomEvent } from '@/hooks/useAgenda';
import { ActionPayload, ActionResult } from './types';

export function useActionDispatcher() {
  const finanzas = useFinanzas();
  const deadlines = useDeadlines();
  const agenda = useAgenda();

  const dispatch = async (action: ActionPayload): Promise<ActionResult> => {
    if (action.needs_input) {
      return {
        success: false,
        needs_input: true,
        userMessage: action.reply || "¿Podrías darme más detalles?"
      };
    }

    try {
      switch (action.type) {
        case 'create_expense': {
          const { amount, description, category } = action.payload;
          if (!amount || !description) throw new Error("Faltan datos para el gasto");
          
          const nuevaTransaccion: Transaccion = {
            id: crypto.randomUUID(),
            tipo: 'gasto',
            monto: Number(amount),
            descripcion: description,
            categoria: category || 'General',
            fecha: new Date().toISOString()
          };
          
          finanzas.agregarTransaccion(nuevaTransaccion);
          return {
            success: true,
            data: nuevaTransaccion,
            userMessage: action.reply || `Gasto de $${amount} registrado correctamente.`
          };
        }

        case 'create_reminder':
        case 'create_task':
        case 'TASK': {
          const { title, date, time, priority, datetimeISO } = action.payload;
          if (!title) throw new Error("Falta el título del recordatorio");
          
          let color = 'text-indigo-500';
          if (priority === 'alta') color = 'text-red-500';
          else if (priority === 'media') color = 'text-amber-500';

          const finalDate = datetimeISO ? datetimeISO.split('T')[0] : (date || new Date().toISOString().split('T')[0]);
          const finalTime = datetimeISO && datetimeISO.includes('T') ? datetimeISO.split('T')[1].substring(0, 5) : time;

          const nuevoDeadline: Deadline = {
            id: crypto.randomUUID(),
            titulo: title,
            fecha: finalDate,
            colorIcono: color,
            hora: finalTime,
            prioridad: priority
          };
          
          deadlines.agregarDeadline(nuevoDeadline);
          return {
            success: true,
            data: nuevoDeadline,
            userMessage: action.reply || `Recordatorio "${title}" guardado.`
          };
        }

        case 'create_event':
        case 'EVENT': {
          const { title, date, startTime, endTime, location } = action.payload;
          if (!title || !date) throw new Error("Faltan datos del evento");
          
          const nuevoEvento = {
            id: crypto.randomUUID(),
            titulo: title + (location ? ` (${location})` : ''),
            fecha: date,
            horaInicio: startTime || '12:00',
            horaFin: endTime || startTime || '13:00',
            tipo: 'custom' as const
          };
          
          agenda.agregarEvento(nuevoEvento, true);
          return {
            success: true,
            data: nuevoEvento,
            userMessage: action.reply || `Evento "${title}" agendado para el ${date}.`
          };
        }

        case 'LOG_ENERGY':
        case 'TRACK_HARDWARE':
          // Por ahora solo respondemos al usuario, ya que el backend lo registra
          return {
            success: true,
            userMessage: action.reply || "Anotado."
          };

        case 'query_schedule': {
          const { date } = action.payload;
          if (!date) throw new Error("No especificaste para qué día consultar");
          
          const [year, month, day] = date.split('-').map(Number);
          const d = new Date(year, month - 1, day);
          const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
          const nombreDia = dias[d.getDay()];
          
          const eventosDelDia = agenda.obtenerAgendaDelDia(date);
          
          if (eventosDelDia.length === 0) {
            return {
              success: true,
              data: eventosDelDia,
              userMessage: action.reply || `No tienes nada programado para el ${date}.`
            };
          }
          
          const resumen = eventosDelDia.map(e => `- ${e.horaInicio}: ${e.titulo}`).join('\\n');
          return {
            success: true,
            data: eventosDelDia,
            userMessage: action.reply ? `${action.reply}\\n\\n${resumen}` : `Para el ${date} tienes:\\n${resumen}`
          };
        }

        case 'unknown':
        default:
          return {
            success: true,
            userMessage: action.reply || "No estoy seguro de cómo hacer eso, pero aquí estoy para ayudarte."
          };
      }
    } catch (e: any) {
      return {
        success: false,
        userMessage: `No pude ejecutar la acción: ${e.message}`
      };
    }
  };

  return { dispatch };
}

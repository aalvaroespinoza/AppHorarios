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
        case 'create_task': {
          const { title, date, time, priority } = action.payload;
          if (!title) throw new Error("Falta el título del recordatorio");
          
          let color = 'text-indigo-500';
          if (priority === 'alta') color = 'text-red-500';
          else if (priority === 'media') color = 'text-amber-500';

          const nuevoDeadline: Deadline = {
            id: crypto.randomUUID(),
            titulo: title,
            fecha: date || new Date().toISOString().split('T')[0],
            colorIcono: color,
            hora: time,
            prioridad: priority
          };
          
          deadlines.agregarDeadline(nuevoDeadline);
          return {
            success: true,
            data: nuevoDeadline,
            userMessage: action.reply || `Recordatorio "${title}" guardado.`
          };
        }

        case 'create_event': {
          const { title, date, startTime, endTime } = action.payload;
          if (!title || !date || !startTime) throw new Error("Faltan datos del evento");
          
          const getDayName = (dateStr: string) => {
            const [year, month, day] = dateStr.split('-').map(Number);
            const d = new Date(year, month - 1, day);
            const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
            return dias[d.getDay()];
          };

          const nuevoEvento = {
            id: crypto.randomUUID(),
            titulo: title,
            fecha: date,
            horaInicio: startTime,
            horaFin: endTime || startTime,
            tipo: 'custom' as const
          };
          
          agenda.agregarEvento(nuevoEvento, true);
          return {
            success: true,
            data: nuevoEvento,
            userMessage: action.reply || `Evento "${title}" agendado para el ${getDayName(date)} a las ${startTime}.`
          };
        }

        case 'query_schedule': {
          const { date } = action.payload;
          if (!date) throw new Error("No especificaste para qué día consultar");
          
          const [year, month, day] = date.split('-').map(Number);
          const d = new Date(year, month - 1, day);
          const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
          const nombreDia = dias[d.getDay()];
          
          const eventosDelDia = agenda.obtenerAgendaDelDia(nombreDia);
          
          if (eventosDelDia.length === 0) {
            return {
              success: true,
              data: eventosDelDia,
              userMessage: action.reply || `No tienes nada programado para el ${nombreDia}.`
            };
          }
          
          const resumen = eventosDelDia.map(e => `- ${e.horaInicio}: ${e.titulo}`).join('\\n');
          return {
            success: true,
            data: eventosDelDia,
            userMessage: action.reply ? `${action.reply}\\n\\n${resumen}` : `Para el ${nombreDia} tienes:\\n${resumen}`
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

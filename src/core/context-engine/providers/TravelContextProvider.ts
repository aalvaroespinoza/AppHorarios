import { ContextProvider, ContextEvent } from '../types';
import { calcularColectivos } from '@/lib/engine/recommendation-engine';
import { DayOfWeek } from '@/core/types/common';

export class TravelContextProvider implements ContextProvider {
  name = 'TravelContextProvider';

  getEvents(referenceDate: Date): ContextEvent[] {
    const events: ContextEvent[] = [];
    if (typeof window === 'undefined') return events;

    const pad = (n: number) => String(n).padStart(2, '0');
    const dateStr = `${referenceDate.getFullYear()}-${pad(referenceDate.getMonth()+1)}-${pad(referenceDate.getDate())}`;

    const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const diaName = dias[referenceDate.getDay()] as DayOfWeek;

    const configStored = localStorage.getItem('escenario_config');
    let cursaArquitectura = false;
    let duermeEnCordoba = false;
    if (configStored) {
      try {
        const conf = JSON.parse(configStored);
        cursaArquitectura = conf.cursaArquitectura ?? false;
        duermeEnCordoba = conf.duermeEnCordoba ?? false;
      } catch(e) {}
    }

    // El recommendation-engine actual filtra por "horaParaFiltro". Si evaluamos HOY y el referenceDate es HOY, filtramos por la hora actual.
    // Si referenceDate es del futuro, filtramos por 00:00.
    const isToday = referenceDate.toDateString() === new Date().toDateString();
    let horaParaFiltro = '00:00';
    if (isToday) {
      const now = new Date();
      horaParaFiltro = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    }

    const recIda = calcularColectivos(diaName, 'ida', cursaArquitectura, duermeEnCordoba, horaParaFiltro);
    const recVuelta = calcularColectivos(diaName, 'vuelta', cursaArquitectura, duermeEnCordoba, horaParaFiltro);

    if (recIda.recomendado) {
      const rec = recIda.recomendado;
      
      const [hSalida, mSalida] = rec.horaSalida.split(':');
      const dtSale = new Date(referenceDate);
      dtSale.setHours(Number(hSalida), Number(mSalida) - 10, 0, 0);

      events.push({
        id: `travel-leave-${dateStr}-ida`,
        category: 'travel',
        type: 'leave_home',
        title: `Salir de casa para el colectivo`,
        datetimeISO: dtSale.toISOString(),
        priority: 'low',
        priorityReasons: [],
        source: this.name,
        metadata: { sentido: 'ida', empresa: rec.empresa }
      });

      const [h, m] = rec.horaSalida.split(':');
      const dtBus = new Date(referenceDate);
      dtBus.setHours(Number(h), Number(m), 0, 0);

      events.push({
        id: `travel-bus-${dateStr}-ida`,
        category: 'travel',
        type: 'bus_arrival',
        title: `Colectivo ${rec.empresa} (Ida)`,
        description: `Sale a las ${rec.horaSalida}`,
        datetimeISO: dtBus.toISOString(),
        priority: 'low',
        priorityReasons: [],
        source: this.name,
        metadata: { sentido: 'ida', empresa: rec.empresa }
      });
    }

    if (recVuelta.recomendado) {
      const rec = recVuelta.recomendado;
      const [h, m] = rec.horaSalida.split(':');
      const dtBus = new Date(referenceDate);
      dtBus.setHours(Number(h), Number(m), 0, 0);

      events.push({
        id: `travel-bus-${dateStr}-vuelta`,
        category: 'travel',
        type: 'bus_arrival',
        title: `Colectivo ${rec.empresa} (Vuelta)`,
        description: `Sale a las ${rec.horaSalida}`,
        datetimeISO: dtBus.toISOString(),
        priority: 'low',
        priorityReasons: [],
        source: this.name,
        metadata: { sentido: 'vuelta', empresa: rec.empresa }
      });
    }

    return events;
  }
}

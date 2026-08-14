import { notificationService } from './notification.service';
import { NotificationPayload } from './notification.types';

export interface WeatherContext {
  temp?: number;
  rainProb?: number;
  condition?: string;
}

export interface DepartureAlertOptions {
  busTime: string;
  materia: string;
  weatherContext?: WeatherContext;
  empresa?: string;
  destino?: string;
  leaveHomeTime?: string;
  recommendationId?: string;
}

export interface TravelRecommendation {
  id: string; // stable identifier based on route and time
  claseTime: string;
  colectivoTime: string;
  leaveHomeTime: string;
  empresa?: string;
  destino?: string;
  materia?: string;
  weatherContext?: WeatherContext;
}

export class TravelNotificationService {
  private static instance: TravelNotificationService;
  private notifiedSet: Set<string> = new Set(); // Prevent duplicates per session

  private constructor() {
    this.loadNotified();
  }

  public static getInstance(): TravelNotificationService {
    if (!TravelNotificationService.instance) {
      TravelNotificationService.instance = new TravelNotificationService();
    }
    return TravelNotificationService.instance;
  }

  private ensureLoadedPromise: Promise<void> | null = null;

  private loadNotified() {
    if (typeof window !== 'undefined') {
      if (!this.ensureLoadedPromise) {
        this.ensureLoadedPromise = import('@/core/utils/indexedDB').then(({ idb }) => {
          return idb.get<string[]>('apphorarios_notified_travels')
            .then((arr) => {
              if (arr) this.notifiedSet = new Set(arr);
            })
            .catch(e => console.error('[TravelNotificationService] Error loading notified set', e));
        });
      }
    } else {
      this.ensureLoadedPromise = Promise.resolve();
    }
  }

  private saveNotified() {
    if (typeof window !== 'undefined') {
      import('@/core/utils/indexedDB').then(({ idb }) => {
        idb.set('apphorarios_notified_travels', Array.from(this.notifiedSet))
          .catch(e => console.error('[TravelNotificationService] Error saving notified set', e));
      });
    }
  }

  /**
   * Formatea y envía una alerta proactiva de salida combinando colectivo, cursada y clima.
   * Estructura el payload para OneSignal a través de NotificationService.
   */
  public async sendDepartureAlert({
    busTime,
    materia,
    weatherContext = {},
    empresa,
    destino,
    leaveHomeTime,
    recommendationId
  }: DepartureAlertOptions): Promise<boolean> {
    if (this.ensureLoadedPromise) await this.ensureLoadedPromise;
    const shouldNotify = await notificationService.shouldNotify('travel');
    if (!shouldNotify) return false;

    const notifId = `departure-${recommendationId || `${busTime}-${materia}`}`;
    
    if (this.notifiedSet.has(notifId)) {
      return false; // Ya fue notificado previamente
    }

    const title = `🚍 Tu cole sale a las ${busTime}`;
    const rainProb = weatherContext.rainProb ?? 0;
    const weatherWarning = rainProb > 40 
      ? `⛈️ Alta prob. de lluvia (${rainProb}%). Llevá paraguas.` 
      : weatherContext.temp !== undefined 
        ? `🌡️ Temp: ${weatherContext.temp}°C.` 
        : '';

    const message = `Cursas ${materia} en breve. Salí con tiempo hacia la parada. ${weatherWarning}`.trim();

    const payload: NotificationPayload = {
      category: 'travel',
      title,
      message,
      priority: 'high',
      data: {
        type: 'travel_departure_alert',
        busTime,
        materia,
        empresa,
        destino,
        leaveHomeTime: leaveHomeTime || busTime,
        weatherContext
      }
    };

    // Si tiene hora de salida de casa en el futuro, se programa
    if (leaveHomeTime) {
      const now = new Date();
      const [hours, mins] = leaveHomeTime.split(':').map(Number);
      const scheduleDate = new Date();
      scheduleDate.setHours(hours, mins, 0, 0);

      if (scheduleDate.getTime() > now.getTime()) {
        await notificationService.schedule(payload, scheduleDate);
        this.notifiedSet.add(notifId);
        this.saveNotified();
        return true;
      }
    }

    // Despacho inmediato
    const success = await notificationService.send(payload);
    if (success) {
      this.notifiedSet.add(notifId);
      this.saveNotified();
    }
    return success;
  }

  public async handleRecommendation(recommendation: TravelRecommendation) {
    return this.sendDepartureAlert({
      busTime: recommendation.colectivoTime,
      materia: recommendation.materia || 'tu próxima clase',
      weatherContext: recommendation.weatherContext,
      empresa: recommendation.empresa,
      destino: recommendation.destino,
      leaveHomeTime: recommendation.leaveHomeTime,
      recommendationId: recommendation.id
    });
  }
}

export const travelNotificationService = TravelNotificationService.getInstance();

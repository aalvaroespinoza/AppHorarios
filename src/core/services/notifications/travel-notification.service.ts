import { notificationService } from './notification.service';
import { NotificationPayload } from './notification.types';

export interface TravelRecommendation {
  id: string; // stable identifier based on route and time
  claseTime: string;
  colectivoTime: string;
  leaveHomeTime: string;
  empresa?: string;
  destino?: string;
}

export class TravelNotificationService {
  private static instance: TravelNotificationService;
  private notifiedSet: Set<string> = new Set(); // Prevent duplicates per session. For persistence, this should be in indexedDB or localStorage.

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

  public async handleRecommendation(recommendation: TravelRecommendation) {
    if (this.ensureLoadedPromise) await this.ensureLoadedPromise;
    const shouldNotify = await notificationService.shouldNotify('travel');
    if (!shouldNotify) return;

    // We only implement "Salir de casa" initially.
    const notifId = `leave-home-${recommendation.id}`;
    
    if (this.notifiedSet.has(notifId)) {
      return; // Already notified
    }

    const payload: NotificationPayload = {
      category: 'travel',
      title: '🚍 Tu colectivo sale pronto',
      message: `Salí de casa a las ${recommendation.leaveHomeTime} para tomar el ${recommendation.empresa || 'colectivo'} de las ${recommendation.colectivoTime}${recommendation.destino ? ` hacia ${recommendation.destino}` : ''}.`,
      priority: 'high',
      data: {
        type: 'travel_leave_home',
        recommendationId: recommendation.id,
      }
    };

    // Calculate when to schedule it
    // For now, since the instruction says "El sistema debe poder generar", 
    // we can either schedule it for `leaveHomeTime` or send it if it's time.
    // Assuming we want to actually schedule it:
    const now = new Date();
    // Parse leaveHomeTime (HH:mm)
    const [hours, mins] = recommendation.leaveHomeTime.split(':').map(Number);
    const scheduleDate = new Date();
    scheduleDate.setHours(hours, mins, 0, 0);

    // Only schedule if it's in the future
    if (scheduleDate.getTime() > now.getTime()) {
      await notificationService.schedule(payload, scheduleDate);
      
      this.notifiedSet.add(notifId);
      this.saveNotified();
    }
  }
}

export const travelNotificationService = TravelNotificationService.getInstance();

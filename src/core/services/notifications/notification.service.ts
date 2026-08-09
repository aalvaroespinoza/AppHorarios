import { NotificationPayload, NotificationPreferences } from './notification.types';

export interface INotificationService {
  requestPermission(): Promise<boolean>;
  getPermissionStatus(): Promise<boolean>;
  send(payload: NotificationPayload): Promise<boolean>;
  schedule(payload: NotificationPayload, date: Date): Promise<string | null>;
  cancel(id: string): Promise<boolean>;
  getPreferences(): Promise<NotificationPreferences>;
  updatePreferences(preferences: Partial<NotificationPreferences>): Promise<boolean>;
  shouldNotify(category: keyof NotificationPreferences): Promise<boolean>;
}

export class NotificationService implements INotificationService {
  private static instance: NotificationService;
  private adapter: INotificationService | null = null;
  
  private defaultPreferences: NotificationPreferences = {
    travel: true,
    schedule: true,
    reminder: true,
    system: true,
  };

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public setAdapter(adapter: INotificationService) {
    this.adapter = adapter;
  }

  public async requestPermission(): Promise<boolean> {
    if (this.adapter) {
      return this.adapter.requestPermission();
    }
    console.warn('[NotificationService] No adapter set');
    return false;
  }

  public async getPermissionStatus(): Promise<boolean> {
    if (this.adapter) {
      return this.adapter.getPermissionStatus();
    }
    return false;
  }

  public async send(payload: NotificationPayload): Promise<boolean> {
    const shouldSend = await this.shouldNotify(payload.category);
    if (!shouldSend) {
      return false;
    }
    
    if (this.adapter) {
      return this.adapter.send(payload);
    }
    console.log('[NotificationService] Would send:', payload);
    return true;
  }

  public async schedule(payload: NotificationPayload, date: Date): Promise<string | null> {
    const shouldSend = await this.shouldNotify(payload.category);
    if (!shouldSend) {
      return null;
    }

    if (this.adapter) {
      return this.adapter.schedule(payload, date);
    }
    console.log('[NotificationService] Would schedule for', date, ':', payload);
    return 'mock-id';
  }

  public async cancel(id: string): Promise<boolean> {
    if (this.adapter) {
      return this.adapter.cancel(id);
    }
    console.log('[NotificationService] Would cancel:', id);
    return true;
  }

  public async getPreferences(): Promise<NotificationPreferences> {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('apphorarios_notification_prefs');
        if (stored) {
          return { ...this.defaultPreferences, ...JSON.parse(stored) };
        }
      } catch (e) {
        console.error('[NotificationService] Error reading preferences', e);
      }
    }
    return this.defaultPreferences;
  }

  public async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<boolean> {
    const current = await this.getPreferences();
    const updated = { ...current, ...preferences };
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('apphorarios_notification_prefs', JSON.stringify(updated));
        return true;
      } catch (e) {
        console.error('[NotificationService] Error saving preferences', e);
        return false;
      }
    }
    return false;
  }

  public async shouldNotify(category: keyof NotificationPreferences): Promise<boolean> {
    const prefs = await this.getPreferences();
    return prefs[category] ?? false;
  }
}

export const notificationService = NotificationService.getInstance();

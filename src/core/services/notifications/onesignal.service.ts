import OneSignal from 'react-onesignal';
import { INotificationService } from './notification.service';
import { NotificationPayload, NotificationPreferences } from './notification.types';

export class OneSignalService implements INotificationService {
  private static instance: OneSignalService;
  private initialized = false;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): OneSignalService {
    if (!OneSignalService.instance) {
      OneSignalService.instance = new OneSignalService();
    }
    return OneSignalService.instance;
  }

  public async initialize(): Promise<void> {
    if (typeof window === 'undefined') return;
    
    if (this.initialized) return;
    if (this.initializationPromise) return this.initializationPromise;

    this.initializationPromise = (async () => {
      const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
      if (!appId) {
        throw new Error('NEXT_PUBLIC_ONESIGNAL_APP_ID no está definido. Verificá las variables de entorno.');
      }

      try {
        await OneSignal.init({
          appId,
          allowLocalhostAsSecureOrigin: process.env.NODE_ENV === 'development',
          notifyButton: {
            enable: false,
          } as any,
          serviceWorkerParam: { scope: '/' },
          serviceWorkerPath: 'sw.js',
        });
        
        this.initialized = true;
      } catch (error: any) {
        console.error('[OneSignal] Initialization error:', error);
        throw new Error(`Error de OneSignal: ${error.message || 'Desconocido'}`);
      }
    })();

    return this.initializationPromise;
  }

  public async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined') throw new Error('Entorno no soportado');
    await this.initialize();
    if (!this.initialized) throw new Error('Falló la inicialización de OneSignal');

    try {
      // iOS PWA requires the native prompt, not Slidedown if it's not configured
      // Fallback to requestPermission which uses native browser prompt
      await OneSignal.Notifications.requestPermission();
      const granted = OneSignal.Notifications.permission;
      if (!granted) throw new Error('El usuario rechazó los permisos o el navegador los bloqueó.');
      return true;
    } catch (e: unknown) {
      console.error('[OneSignal] Error requesting permission', e);
      if (e instanceof Error) {
        throw new Error(e.message);
      }
      throw new Error('Error desconocido al solicitar permiso');
    }
  }

  public async getPermissionStatus(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    await this.initialize();
    if (!this.initialized) return false;

    try {
      // OneSignal V16 API
      return OneSignal.Notifications.permission;
    } catch (e) {
      console.error('[OneSignal] Error checking permission', e);
      return false;
    }
  }

  public async send(payload: NotificationPayload): Promise<boolean> {
    // Note: Sending notifications directly from the client is usually not allowed 
    // unless using a specific API or if it's meant to be triggered from the backend.
    // Our backend will handle the actual sending. This is just a stub on the client side 
    // or we can call our API route from here.
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      return response.ok;
    } catch (error) {
      console.error('[OneSignalService] Error sending notification', error);
      return false;
    }
  }

  public async schedule(payload: NotificationPayload, date: Date): Promise<string | null> {
    try {
      // OneSignal expects 'YYYY-MM-DD HH:MM:SS GMT-0000' or similar
      // Or timezone formatted string
      const sendAfter = date.toString(); // API accepts UTC string like "Thu Sep 24 2015 14:00:00 GMT-0700 (PDT)"
      
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...payload, sendAfter }),
      });
      if (response.ok) {
        const data = await response.json();
        return data?.data?.id || 'scheduled';
      }
      return null;
    } catch (error) {
      console.error('[OneSignalService] Error scheduling notification', error);
      return null;
    }
  }

  public async cancel(id: string): Promise<boolean> {
    // Similar to schedule, requires backend logic or local notifications cancellation
    return false;
  }

  // Delegated to NotificationService for now, as OneSignal doesn't manage our internal categories
  public async getPreferences(): Promise<NotificationPreferences> {
    throw new Error('Method not implemented.');
  }

  public async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  public async shouldNotify(category: keyof NotificationPreferences): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}

export const oneSignalService = OneSignalService.getInstance();

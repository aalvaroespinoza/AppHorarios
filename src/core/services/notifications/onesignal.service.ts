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
      try {
        const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
        if (!appId) {
          console.warn('[OneSignal] NEXT_PUBLIC_ONESIGNAL_APP_ID is not defined');
          return;
        }

        await OneSignal.init({
          appId,
          allowLocalhostAsSecureOrigin: process.env.NODE_ENV === 'development',
          notifyButton: {
            enable: false, // We will use custom UI
          } as any,
        });
        
        this.initialized = true;
      } catch (error) {
        console.error('[OneSignal] Initialization error:', error);
      }
    })();

    return this.initializationPromise;
  }

  public async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    await this.initialize();
    if (!this.initialized) return false;

    try {
      await OneSignal.Slidedown.promptPush();
      return this.getPermissionStatus();
    } catch (e) {
      console.error('[OneSignal] Error requesting permission', e);
      return false;
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

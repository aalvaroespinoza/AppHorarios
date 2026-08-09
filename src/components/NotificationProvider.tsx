'use client';

import { useEffect } from 'react';
import { notificationService } from '@/core/services/notifications/notification.service';
import { oneSignalService } from '@/core/services/notifications/onesignal.service';

export default function NotificationProvider() {
  useEffect(() => {
    // Set OneSignal as the adapter for the NotificationService
    notificationService.setAdapter(oneSignalService);
    
    // Attempt to initialize OneSignal in the background
    // This will not block rendering
    oneSignalService.initialize().catch(err => {
      console.warn('[NotificationProvider] Failed to initialize OneSignal', err);
    });
  }, []);

  return null;
}

export type NotificationCategory = 'travel' | 'schedule' | 'reminder' | 'system';

export type NotificationPriority = 'low' | 'normal' | 'high';

export interface NotificationAction {
  actionId: string;
  title: string;
  icon?: string;
  url?: string;
}

export interface NotificationPayload {
  title: string;
  message: string;
  category: NotificationCategory;
  priority?: NotificationPriority;
  data?: Record<string, any>;
  actions?: NotificationAction[];
}

export interface NotificationPreferences {
  travel: boolean;
  schedule: boolean;
  reminder: boolean;
  system: boolean;
}

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotificationService } from './notification.service';
import { oneSignalService } from './onesignal.service';

describe('NotificationService', () => {
  let service: any;

  beforeEach(() => {
    service = (NotificationService as any).getInstance();
    vi.spyOn(oneSignalService, 'send').mockResolvedValue(true);
    vi.spyOn(oneSignalService, 'schedule').mockResolvedValue('mock-id');
  });

  it('should format payload correctly when sending', async () => {
    // For testing payload generation
    const payload = {
      category: 'reminder' as const,
      title: 'Test',
      message: 'Hello'
    };
    
    // We mock shouldNotify to always return true for this test
    vi.spyOn(service, 'shouldNotify').mockResolvedValue(true);
    
    await service.send(payload);
    
    expect(oneSignalService.send).toHaveBeenCalledWith(expect.objectContaining({
      category: 'reminder',
      title: 'Test',
      message: 'Hello'
    }));
  });

  it('should respect preferences in shouldNotify', async () => {
    // We mock localStorage for preferences
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
      if (key === 'apphorarios_notification_prefs') {
        return JSON.stringify({ travel: false, reminder: true, schedule: true, system: true });
      }
      return null;
    });
    
    // Re-load prefs
    service.loadPreferences();

    const canNotifyTravel = await service.shouldNotify('travel');
    const canNotifyReminder = await service.shouldNotify('reminder');
    
    expect(canNotifyTravel).toBe(false);
    expect(canNotifyReminder).toBe(true);
  });
});

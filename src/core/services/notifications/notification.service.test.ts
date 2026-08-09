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

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should format payload correctly when sending', async () => {
    const payload = {
      category: 'reminder' as const,
      title: 'Test',
      message: 'Hello'
    };
    
    // Set mock adapter
    const mockAdapter = {
      send: vi.fn().mockResolvedValue(true),
      schedule: vi.fn(),
      requestPermission: vi.fn(),
      getPermissionStatus: vi.fn(),
      cancel: vi.fn(),
      getPreferences: vi.fn(),
      updatePreferences: vi.fn(),
      shouldNotify: vi.fn()
    };
    service.setAdapter(mockAdapter);
    
    vi.spyOn(service, 'shouldNotify').mockResolvedValue(true);
    
    await service.send(payload);
    
    expect(mockAdapter.send).toHaveBeenCalledWith(expect.objectContaining({
      category: 'reminder',
      title: 'Test',
      message: 'Hello'
    }));
  });

  it('should respect preferences in shouldNotify', async () => {
    vi.spyOn(service, 'getPreferences').mockResolvedValue({ travel: false, reminder: true, schedule: true, system: true });

    const canNotifyTravel = await service.shouldNotify('travel');
    const canNotifyReminder = await service.shouldNotify('reminder');

    
    expect(canNotifyTravel).toBe(false);
    expect(canNotifyReminder).toBe(true);
  });
});


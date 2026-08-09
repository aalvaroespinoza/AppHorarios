import { NotificationService } from './notification.service';
import { NotificationPayload } from './notification.types';

describe('NotificationService', () => {
  let service: any;

  beforeEach(() => {
    // We get the instance and clear the local storage
    service = (NotificationService as any).getInstance();
    localStorage.clear();
  });

  it('should have default preferences enabled', async () => {
    const prefs = await service.getPreferences();
    expect(prefs.travel).toBe(true);
    expect(prefs.schedule).toBe(true);
    expect(prefs.reminder).toBe(true);
    expect(prefs.system).toBe(true);
  });

  it('should update preferences correctly', async () => {
    await service.updatePreferences({ travel: false });
    const prefs = await service.getPreferences();
    expect(prefs.travel).toBe(false);
    expect(prefs.schedule).toBe(true);
  });

  it('shouldNotify should return correct value based on preferences', async () => {
    await service.updatePreferences({ reminder: false });
    expect(await service.shouldNotify('reminder')).toBe(false);
    expect(await service.shouldNotify('system')).toBe(true);
  });

  it('should format payload correctly when sending', async () => {
    const payload: NotificationPayload = {
      category: 'system',
      title: 'Test',
      message: 'Testing',
    };
    
    // Mock the adapter
    const mockAdapter = {
      send: jest.fn().mockResolvedValue(true)
    };
    service.setAdapter(mockAdapter);

    await service.send(payload);
    expect(mockAdapter.send).toHaveBeenCalledWith(payload);
  });
});

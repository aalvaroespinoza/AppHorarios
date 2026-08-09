import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TravelNotificationService } from './travel-notification.service';
import { notificationService } from './notification.service';

describe('TravelNotificationService', () => {
  let service: any;

  beforeEach(() => {
    service = (TravelNotificationService as any).getInstance();
    service.notifiedSet.clear();
    localStorage.clear();
    vi.spyOn(notificationService, 'schedule').mockResolvedValue('mock-id');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should not notify duplicates', async () => {
    const recommendation = {
      id: 'ida-lunes-10:00',
      claseTime: '10:30',
      colectivoTime: '10:00',
      leaveHomeTime: '09:50'
    };

    // First handle should schedule
    await service.handleRecommendation(recommendation);
    expect(notificationService.schedule).toHaveBeenCalledTimes(1);

    // Second handle with same id should not schedule
    await service.handleRecommendation(recommendation);
    expect(notificationService.schedule).toHaveBeenCalledTimes(1);
  });
});

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('@/core/utils/indexedDB', () => ({
  idb: {
    init: vi.fn().mockResolvedValue(undefined),
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(undefined)
  }
}));

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
    vi.useFakeTimers();
    vi.setSystemTime(new Date(new Date().setHours(8, 0, 0, 0))); // 08:00

    const recommendation = {
      id: 'ida-lunes-10:00',
      claseTime: '10:30',
      colectivoTime: '10:00',
      leaveHomeTime: '09:50'
    };

    // We also mock notificationService.shouldNotify just in case
    vi.spyOn(notificationService, 'shouldNotify').mockResolvedValue(true);

    // First handle should schedule
    await service.handleRecommendation(recommendation);
    expect(notificationService.schedule).toHaveBeenCalledTimes(1);

    // Second handle with same id should not schedule
    await service.handleRecommendation(recommendation);
    expect(notificationService.schedule).toHaveBeenCalledTimes(1);
  });
});

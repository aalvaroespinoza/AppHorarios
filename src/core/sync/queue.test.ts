import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SyncQueue } from './queue';
import { getQueue, removeFromQueue, saveToQueue } from '@/core/utils/indexedDB';

vi.mock('@/core/utils/indexedDB', () => ({ getQueue: vi.fn(), removeFromQueue: vi.fn(), saveToQueue: vi.fn() }));

beforeEach(() => { vi.clearAllMocks(); vi.stubGlobal('fetch', vi.fn()); });

describe('sync data retention', () => {
  it.each([404, 500])('keeps an unconfirmed mutation after HTTP %s even beyond five retries', async status => {
    const pending = { id: 'pending', endpoint: '/api/example', method: 'POST' as const, timestamp: 1, retryCount: 6 };
    vi.mocked(getQueue).mockResolvedValue([pending]);
    vi.mocked(fetch).mockResolvedValue({ ok: false, status } as Response);
    expect(await new SyncQueue().processQueue()).toBe(false);
    expect(removeFromQueue).not.toHaveBeenCalled();
    expect(saveToQueue).toHaveBeenCalledWith(expect.objectContaining({ id: 'pending', retryCount: 7 }));
  });
  it('removes only confirmed successful writes', async () => {
    vi.mocked(getQueue).mockResolvedValueOnce([{ id: 'ok', endpoint: '/api/example', method: 'POST', timestamp: 1, retryCount: 0 }]).mockResolvedValueOnce([]);
    vi.mocked(fetch).mockResolvedValue({ ok: true, status: 200 } as Response);
    expect(await new SyncQueue().processQueue()).toBe(true);
    expect(removeFromQueue).toHaveBeenCalledWith('ok');
  });
});

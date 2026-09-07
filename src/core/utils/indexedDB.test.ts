import { afterEach, describe, expect, it, vi } from 'vitest';
import { idb, saveToQueue, removeFromQueue, clearQueue } from './indexedDB';

afterEach(() => { idb.dbPromise = null; });

describe('durable local writes', () => {
  it.each(['value', 'enqueue', 'remove', 'clear'])('confirms %s only when the transaction commits', async operation => {
    const request = { onsuccess: null as (() => void) | null };
    const transaction = {
      objectStore: () => ({ put: () => request, delete: () => request, clear: () => request }),
      oncomplete: null as (() => void) | null,
      onabort: null as (() => void) | null,
    };
    idb.dbPromise = Promise.resolve({ transaction: () => transaction } as unknown as IDBDatabase);
    const pending = operation === 'value' ? idb.set('test', [])
      : operation === 'enqueue' ? saveToQueue({ id: '1', endpoint: '/test', method: 'POST', timestamp: 0, retryCount: 0 })
      : operation === 'remove' ? removeFromQueue('1') : clearQueue();
    const committed = vi.fn();
    void pending.then(committed);
    await Promise.resolve();
    request.onsuccess?.();
    await Promise.resolve();
    expect(committed).not.toHaveBeenCalled();
    transaction.oncomplete?.();
    await pending;
    expect(committed).toHaveBeenCalledOnce();
  });

  it('rejects a rolled-back write', async () => {
    const transaction = { objectStore: () => ({ put: () => ({}) }), onabort: null as (() => void) | null, error: new Error('quota') };
    idb.dbPromise = Promise.resolve({ transaction: () => transaction } as unknown as IDBDatabase);
    const pending = idb.set('test', 1);
    const assertion = expect(pending).rejects.toThrow('quota');
    await Promise.resolve();
    transaction.onabort?.();
    await assertion;
  });
});

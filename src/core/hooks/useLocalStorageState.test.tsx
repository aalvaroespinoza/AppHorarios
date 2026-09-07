import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { idb } from '@/core/utils/indexedDB';
import { useLocalStorageState } from './useLocalStorageState';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
afterEach(() => { vi.restoreAllMocks(); });

describe('keyed local state', () => {
  it('does not overwrite either key during hydration or a key switch', async () => {
    const writes = vi.spyOn(idb, 'set').mockResolvedValue();
    vi.spyOn(idb, 'get').mockImplementation(async key => key === 'monday' ? 'saved bus' : null);
    const container = document.createElement('div');
    const root = createRoot(container);
    function Harness({ storageKey }: { storageKey: string }) {
      const [value, , loaded] = useLocalStorageState<string | null>(storageKey, null);
      return <span>{loaded ? value || 'default' : 'loading'}</span>;
    }
    await act(async () => { root.render(<Harness storageKey="monday" />); });
    expect(container.textContent).toBe('saved bus');
    await act(async () => { root.render(<Harness storageKey="tuesday" />); });
    expect(container.textContent).toBe('default');
    expect(writes).not.toHaveBeenCalled();
    await act(async () => { root.unmount(); });
  });
});

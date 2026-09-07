import { afterEach, describe, expect, it, vi } from 'vitest';
import { idb } from '@/core/utils/indexedDB';
import { getStoredSubjects, getStoredSubjectsSync, saveStoredSubjects, SUBJECTS_STORAGE_KEY, SUBJECTS_UPDATED_EVENT } from './subject.service';

afterEach(() => { vi.restoreAllMocks(); localStorage.clear(); });

describe('subject persistence', () => {
  it('keeps an intentionally empty course list in both stores', async () => {
    localStorage.setItem(SUBJECTS_STORAGE_KEY, '[]');
    expect(getStoredSubjectsSync()).toEqual([]);
    vi.spyOn(idb, 'get').mockResolvedValue([]);
    expect(await getStoredSubjects()).toEqual([]);
  });

  it('uses the existing local mirror if IndexedDB cannot be read', async () => {
    localStorage.setItem(SUBJECTS_STORAGE_KEY, '[]');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(idb, 'get').mockRejectedValue(new Error('unavailable'));
    expect(await getStoredSubjects()).toEqual([]);
  });

  it('does not announce or mirror a failed save', async () => {
    vi.spyOn(idb, 'set').mockRejectedValue(new Error('quota'));
    const dispatch = vi.spyOn(window, 'dispatchEvent');
    await expect(saveStoredSubjects([])).rejects.toThrow('quota');
    expect(dispatch).not.toHaveBeenCalled();
    expect(localStorage.getItem(SUBJECTS_STORAGE_KEY)).toBeNull();
  });

  it('announces a committed save', async () => {
    vi.spyOn(idb, 'set').mockResolvedValue();
    const listener = vi.fn();
    window.addEventListener(SUBJECTS_UPDATED_EVENT, listener, { once: true });
    await saveStoredSubjects([]);
    expect(listener).toHaveBeenCalledOnce();
    expect(localStorage.getItem(SUBJECTS_STORAGE_KEY)).toBe('[]');
  });
});

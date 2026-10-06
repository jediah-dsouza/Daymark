import { describe, expect, it, vi } from 'vitest';
import { createSampleData } from '../../data/sampleData';
import { loadAppData, serializeAppData, STORAGE_KEY } from './localStorage';

function memoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      values.set(key, value);
    }),
    value: (key: string) => values.get(key) ?? null,
  };
}

describe('local workspace repository', () => {
  it('seeds a deterministic dataset when storage is empty and schedules a first save', () => {
    const storage = memoryStorage();
    const result = loadAppData(storage, new Date('2026-10-02T12:00:00.000Z'));
    expect(result.data.tasks).toHaveLength(10);
    expect(result.data.projects).toHaveLength(4);
    expect(result.persistOnMount).toBe(true);
    expect(storage.getItem).toHaveBeenCalledWith(STORAGE_KEY);
  });

  it('preserves malformed serialized data instead of overwriting it automatically', () => {
    const storage = memoryStorage({ [STORAGE_KEY]: '{broken' });
    const result = loadAppData(storage, new Date('2026-10-02T12:00:00.000Z'));
    expect(result.data.tasks).toHaveLength(10);
    expect(result.recoveryMessage).toContain('has not been overwritten');
    expect(result.persistOnMount).toBe(false);
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(storage.value(STORAGE_KEY)).toBe('{broken');
  });

  it('retains valid records and detaches a task whose project is missing', () => {
    const data = createSampleData(new Date('2026-10-02T12:00:00.000Z'));
    data.tasks[0]!.projectId = 'deleted-project';
    data.tasks.push({ ...data.tasks[0]!, id: 'bad-task', priority: 'impossible' as never });
    const storage = memoryStorage({ [STORAGE_KEY]: serializeAppData(data) });
    const result = loadAppData(storage);
    expect(result.data.tasks).toHaveLength(10);
    expect(result.data.tasks[0]?.projectId).toBe(null);
    expect(result.recoveryMessage).toContain('usable task');
    expect(result.persistOnMount).toBe(false);
  });

  it('falls back to in-memory sample data when browser storage cannot be read', () => {
    const storage = {
      getItem: vi.fn(() => {
        throw new Error('blocked');
      }),
      setItem: vi.fn(),
    };
    const result = loadAppData(storage);
    expect(result.status).toBe('memory-only');
    expect(result.data.tasks).toHaveLength(10);
    expect(result.storageMessage).toContain('only');
  });
});

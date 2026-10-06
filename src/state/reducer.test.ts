import { describe, expect, it } from 'vitest';
import { createSampleData } from '../data/sampleData';
import { appDataReducer } from './reducer';

describe('appDataReducer functional updates', () => {
  it('applies a data update to the latest state without mutating the source', () => {
    const initial = createSampleData(new Date(2026, 9, 2, 12));
    const next = appDataReducer(initial, {
      type: 'data/update',
      update: (current) => ({
        ...current,
        tasks: current.tasks.filter((task) => task.id !== 'task-review-yesterday'),
      }),
    });

    expect(next).not.toBe(initial);
    expect(initial.tasks).toHaveLength(10);
    expect(next.tasks).toHaveLength(9);
    expect(next.preferences).toEqual(initial.preferences);
    expect(next.projects).toBe(initial.projects);
  });
});

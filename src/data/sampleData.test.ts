import { describe, expect, it } from 'vitest';
import { createSampleData } from './sampleData';
import { localDateOffset } from '../utils/dates';

describe('Daymark sample data', () => {
  const now = new Date('2026-10-02T12:00:00.000Z');

  it('contains the four named projects and ten PRD tasks', () => {
    const data = createSampleData(now);
    expect(data.projects.map((project) => project.name)).toEqual([
      'Portfolio Refresh',
      'Internship Deliverables',
      'Personal Systems',
      'Learning Lab',
    ]);
    expect(data.tasks).toHaveLength(10);
    expect(data.tasks.map((task) => task.title)).toContain('Prepare Task 2 internship submission');
  });

  it('keeps three open focus tasks due today and two completed tasks due today', () => {
    const data = createSampleData(now);
    const dueToday = data.tasks.filter((task) => task.dueDate === localDateOffset(0, now));
    expect(dueToday.filter((task) => task.status !== 'completed')).toHaveLength(3);
    expect(dueToday.filter((task) => task.status === 'completed')).toHaveLength(2);
    expect(
      data.tasks.filter(
        (task) => task.status !== 'completed' && task.dueDate === localDateOffset(-1, now),
      ),
    ).toHaveLength(1);
  });

  it('includes all workflow statuses and priority values, future work, and an unassigned task', () => {
    const data = createSampleData(now);
    expect(new Set(data.tasks.map((task) => task.status))).toEqual(
      new Set(['inbox', 'todo', 'in-progress', 'completed']),
    );
    expect(new Set(data.tasks.map((task) => task.priority))).toEqual(
      new Set(['none', 'low', 'medium', 'high']),
    );
    expect(data.tasks.some((task) => task.projectId === null)).toBe(true);
    expect(data.tasks.some((task) => task.dueDate === localDateOffset(5, now))).toBe(true);
    expect(data.tasks.some((task) => task.tags.length > 1)).toBe(true);
    expect(data.activity.length).toBeGreaterThanOrEqual(5);
  });
});

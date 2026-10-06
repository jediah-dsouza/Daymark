import { describe, expect, it } from 'vitest';
import { createSampleData } from '../../data/sampleData';
import { localDateNow, localDateOffset } from '../../utils/dates';
import { formatUpcomingGroup, projectToday } from './selectors';

describe('projectToday', () => {
  const now = new Date(2026, 9, 2, 12);
  const sample = createSampleData(now);
  const today = localDateNow(now);

  it('derives the complete sample Today scenario without persisting view state', () => {
    const view = projectToday(sample.tasks, today);
    expect(view.focus.map((task) => task.id)).toEqual([
      'task-internship-submission',
      'task-portfolio-layout',
      'task-accessibility-checklist',
    ]);
    expect(view.overdue.map((task) => task.id)).toEqual(['task-project-readme']);
    expect(view.completedToday).toHaveLength(2);
    expect(view.upcoming.flatMap((group) => group.tasks)).toHaveLength(4);
    expect(view.remainingCount).toBe(3);
    expect(view.completedCount).toBe(2);
    expect(view.completionPercent).toBe(40);
  });

  it('groups upcoming tasks chronologically and labels the next local day', () => {
    const view = projectToday(sample.tasks, today);
    expect(view.upcoming.map((group) => group.date)).toEqual(
      [...view.upcoming.map((group) => group.date)].sort(),
    );
    expect(formatUpcomingGroup(localDateOffset(1, now), today)).toMatch(/^Tomorrow/);
  });

  it('keeps completed work out of open focus and treats an empty day as zero progress', () => {
    const completedOnly = sample.tasks.filter((task) => task.status === 'completed');
    const view = projectToday(completedOnly, today);
    expect(view.focus).toEqual([]);
    expect(view.overdue).toEqual([]);
    expect(view.remainingCount).toBe(0);
    expect(view.completionPercent).toBe(100);
  });
});

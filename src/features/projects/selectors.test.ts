import { describe, expect, it } from 'vitest';
import { createSampleData } from '../../data/sampleData';
import { DEFAULT_TASK_FILTERS } from '../tasks/selectors';
import {
  getProjectSummary,
  selectProjectActivity,
  selectProjects,
  selectProjectTasks,
} from './selectors';

const now = new Date('2026-10-02T12:00:00.000Z');

describe('project selectors', () => {
  it('separates active and archived projects without mutating project order', () => {
    const data = createSampleData(now);
    const projects = [{ ...data.projects[0]!, archived: true }, ...data.projects.slice(1)];
    expect(selectProjects(projects).map((item) => item.id)).toEqual(
      projects
        .filter((item) => !item.archived)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.name.localeCompare(b.name))
        .map((item) => item.id),
    );
    expect(selectProjects(projects, true).map((item) => item.id)).toEqual([projects[0]!.id]);
    expect(projects[0]!.archived).toBe(true);
  });

  it('derives totals, completion percentage and latest task activity from source records', () => {
    const data = createSampleData(now);
    const project = data.projects.find((item) => item.id === 'project-portfolio')!;
    const summary = getProjectSummary(project, data.tasks, data.activity);
    expect(summary.totalTasks).toBe(3);
    expect(summary.completedTasks).toBe(0);
    expect(summary.openTasks).toBe(3);
    expect(summary.completionPercent).toBe(0);
    expect(summary.lastUpdatedAt.localeCompare(project.updatedAt)).toBeGreaterThan(0);
  });

  it('returns zero progress for a project with no assigned work', () => {
    const data = createSampleData(now);
    const summary = getProjectSummary(data.projects[0]!, [], []);
    expect(summary).toMatchObject({
      totalTasks: 0,
      completedTasks: 0,
      openTasks: 0,
      completionPercent: 0,
    });
  });

  it('combines status, priority, search, and sorting only across the selected project', () => {
    const data = createSampleData(now);
    const results = selectProjectTasks('project-internship', data.tasks, data.projects, {
      ...DEFAULT_TASK_FILTERS,
      status: 'todo',
      priority: 'high',
      search: 'submission',
      sort: 'title',
    });
    expect(results.map((task) => task.id)).toEqual(['task-internship-submission']);
  });

  it('includes project changes and activity belonging to its current tasks', () => {
    const data = createSampleData(now);
    data.activity.unshift({
      id: 'activity-project-task',
      type: 'task-updated',
      entityId: 'task-internship-submission',
      message: 'Updated submission details',
      createdAt: now.toISOString(),
    });
    const events = selectProjectActivity('project-internship', data);
    expect(events.some((event) => event.entityId === 'project-internship')).toBe(true);
    expect(events.some((event) => event.entityId === 'task-internship-submission')).toBe(true);
    expect(events).toEqual([...events].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  });
});

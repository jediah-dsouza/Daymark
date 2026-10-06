import { describe, expect, it } from 'vitest';
import { createSampleData } from '../../data/sampleData';
import { localDateOffset } from '../../utils/dates';
import {
  activeTaskFilterCount,
  DEFAULT_TASK_FILTERS,
  selectTasks,
  taskDueDateLabel,
} from './selectors';

describe('Tasks selectors', () => {
  const data = createSampleData(new Date('2026-10-02T12:00:00.000Z'));

  it('searches title, description, and associated project name case-insensitively', () => {
    expect(
      selectTasks(data.tasks, data.projects, { ...DEFAULT_TASK_FILTERS, search: 'case-study' }),
    ).toHaveLength(1);
    expect(
      selectTasks(data.tasks, data.projects, { ...DEFAULT_TASK_FILTERS, search: 'KEYBOARD' }),
    ).toHaveLength(1);
    expect(
      selectTasks(data.tasks, data.projects, {
        ...DEFAULT_TASK_FILTERS,
        search: 'Internship Deliverables',
      }),
    ).toHaveLength(3);
    expect(
      selectTasks(data.tasks, data.projects, { ...DEFAULT_TASK_FILTERS, search: 'not here' }),
    ).toHaveLength(0);
  });

  it('combines status, priority, project and search filters using AND semantics', () => {
    const result = selectTasks(data.tasks, data.projects, {
      ...DEFAULT_TASK_FILTERS,
      search: 'review',
      status: 'todo',
      priority: 'high',
      projectId: 'project-internship',
    });
    expect(result.map((task) => task.id)).toEqual(['task-internship-submission']);
    expect(
      activeTaskFilterCount({ ...DEFAULT_TASK_FILTERS, status: 'todo', priority: 'high' }),
    ).toBe(2);
  });

  it('filters unassigned tasks and leaves a clear-all state unfiltered', () => {
    const result = selectTasks(data.tasks, data.projects, {
      ...DEFAULT_TASK_FILTERS,
      projectId: 'unassigned',
    });
    expect(result.map((task) => task.id)).toEqual(['task-desktop-folders']);
    expect(activeTaskFilterCount(DEFAULT_TASK_FILTERS)).toBe(0);
    expect(selectTasks(data.tasks, data.projects, DEFAULT_TASK_FILTERS)).toHaveLength(10);
  });

  it('sorts by due date, priority, recent creation and case-insensitive title without mutating source', () => {
    const original = [...data.tasks];
    const byDue = selectTasks(data.tasks, data.projects, {
      ...DEFAULT_TASK_FILTERS,
      sort: 'dueDate',
    });
    const byPriority = selectTasks(data.tasks, data.projects, {
      ...DEFAULT_TASK_FILTERS,
      sort: 'priority',
    });
    const byCreated = selectTasks(data.tasks, data.projects, {
      ...DEFAULT_TASK_FILTERS,
      sort: 'createdAt',
    });
    const byTitle = selectTasks(data.tasks, data.projects, {
      ...DEFAULT_TASK_FILTERS,
      sort: 'title',
    });
    expect(byDue[0]?.dueDate).toBe(localDateOffset(-1, new Date('2026-10-02T12:00:00.000Z')));
    const undated = { ...data.tasks[0]!, id: 'task-without-date', dueDate: null };
    const withUndated = selectTasks([...data.tasks, undated], data.projects, {
      ...DEFAULT_TASK_FILTERS,
      sort: 'dueDate',
    });
    expect(withUndated.at(-1)?.id).toBe(undated.id);
    expect(byPriority[0]?.priority).toBe('high');
    expect(byCreated[0]?.id).toBe('task-learning-plan');
    expect(byTitle[0]?.title).toBe('Audit mobile navigation');
    expect(data.tasks).toEqual(original);
  });

  it('formats overdue, today, future, and undated values distinctly', () => {
    const today = localDateOffset(0, new Date('2026-10-02T12:00:00.000Z'));
    expect(taskDueDateLabel(null, today)).toBe('No due date');
    expect(
      taskDueDateLabel(localDateOffset(-1, new Date('2026-10-02T12:00:00.000Z')), today),
    ).toMatch(/^Overdue · /);
    expect(taskDueDateLabel(today, today)).toBe('Due today');
    expect(
      taskDueDateLabel(localDateOffset(1, new Date('2026-10-02T12:00:00.000Z')), today),
    ).toMatch(/^Due /);
  });
});

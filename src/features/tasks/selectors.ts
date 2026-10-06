import type { Project, Task, TaskFilters, TaskPriority, TaskStatus } from '../../types';
import { formatLocalDate, localDateNow } from '../../utils/dates';

export const DEFAULT_TASK_FILTERS: TaskFilters = {
  search: '',
  status: 'all',
  priority: 'all',
  projectId: 'all',
  sort: 'dueDate',
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  inbox: 'Inbox',
  todo: 'To do',
  'in-progress': 'In progress',
  completed: 'Completed',
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  none: 'No priority',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

const priorityOrder: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
  none: 3,
};

function compareDueDate(left: Task, right: Task): number {
  if (left.dueDate === null && right.dueDate !== null) return 1;
  if (left.dueDate !== null && right.dueDate === null) return -1;
  return (
    (left.dueDate ?? '').localeCompare(right.dueDate ?? '') || left.title.localeCompare(right.title)
  );
}

function comparePriority(left: Task, right: Task): number {
  return (
    priorityOrder[left.priority] - priorityOrder[right.priority] ||
    compareDueDate(left, right) ||
    left.title.localeCompare(right.title)
  );
}

export function sortTasks(tasks: Task[], sort: TaskFilters['sort']): Task[] {
  const sorted = [...tasks];
  switch (sort) {
    case 'dueDate':
      return sorted.sort(compareDueDate);
    case 'priority':
      return sorted.sort(comparePriority);
    case 'createdAt':
      return sorted.sort(
        (left, right) =>
          right.createdAt.localeCompare(left.createdAt) || left.title.localeCompare(right.title),
      );
    case 'title':
      return sorted.sort((left, right) =>
        left.title.localeCompare(right.title, undefined, { sensitivity: 'base' }),
      );
  }
}

export function selectTasks(tasks: Task[], projects: Project[], filters: TaskFilters): Task[] {
  const query = filters.search.trim().toLocaleLowerCase();
  const projectById = new Map(projects.map((project) => [project.id, project]));
  const filtered = tasks.filter((task) => {
    if (filters.status !== 'all' && task.status !== filters.status) return false;
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
    if (filters.projectId === 'unassigned' && task.projectId !== null) return false;
    if (
      filters.projectId !== 'all' &&
      filters.projectId !== 'unassigned' &&
      task.projectId !== filters.projectId
    ) {
      return false;
    }
    if (!query) return true;
    const projectName = task.projectId ? (projectById.get(task.projectId)?.name ?? '') : '';
    return [task.title, task.description, projectName].some((value) =>
      value.toLocaleLowerCase().includes(query),
    );
  });
  return sortTasks(filtered, filters.sort);
}

export function activeTaskFilterCount(filters: TaskFilters): number {
  return (
    Number(filters.status !== 'all') +
    Number(filters.priority !== 'all') +
    Number(filters.projectId !== 'all')
  );
}

export function hasActiveTaskCriteria(filters: TaskFilters): boolean {
  return Boolean(filters.search.trim()) || activeTaskFilterCount(filters) > 0;
}

export function taskDueDateLabel(dueDate: string | null, today = localDateNow()): string {
  if (dueDate === null) return 'No due date';
  if (dueDate < today) return `Overdue · ${formatLocalDate(dueDate)}`;
  if (dueDate === today) return 'Due today';
  return `Due ${formatLocalDate(dueDate)}`;
}

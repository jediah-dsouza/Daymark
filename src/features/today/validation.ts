import type { Project, TaskPriority } from '../../types';
import { isValidLocalDate } from '../../utils/dates';

export interface QuickAddDraft {
  title: string;
  priority: string;
  dueDate: string;
  projectId: string;
  tags: string;
}

export interface NewTaskFields {
  title: string;
  priority: TaskPriority;
  dueDate: string | null;
  projectId: string | null;
  tags: string[];
}

export type QuickAddField = keyof QuickAddDraft;
export type QuickAddErrors = Partial<Record<QuickAddField, string>>;

const validPriorities = new Set<TaskPriority>(['none', 'low', 'medium', 'high']);

export function normalizeTaskTags(value: string): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const item of value.split(',')) {
    const tag = item.trim();
    if (!tag) continue;
    const key = tag.toLocaleLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    tags.push(tag);
  }
  return tags;
}

export function validateQuickAdd(
  draft: QuickAddDraft,
  projects: Project[],
  allowArchivedProject = false,
): { errors: QuickAddErrors; value: NewTaskFields | null } {
  const errors: QuickAddErrors = {};
  const title = draft.title.trim();
  if (!title) errors.title = 'Give the task a name.';
  else if (title.length < 2) errors.title = 'Task names must contain at least 2 characters.';
  else if (title.length > 120) errors.title = 'Task names can be up to 120 characters.';

  if (!validPriorities.has(draft.priority as TaskPriority)) {
    errors.priority = 'Choose a valid priority.';
  }
  if (draft.dueDate && !isValidLocalDate(draft.dueDate)) {
    errors.dueDate = 'Enter a valid date.';
  }

  const projectId = draft.projectId || null;
  if (
    projectId &&
    !projects.some(
      (project) => project.id === projectId && (allowArchivedProject || !project.archived),
    )
  ) {
    errors.projectId = 'Choose an available project or leave the project unset.';
  }

  const tags = normalizeTaskTags(draft.tags);
  if (tags.length > 8) errors.tags = 'Use no more than 8 tags.';
  else if (tags.some((tag) => tag.length > 24)) {
    errors.tags = 'Each tag can be up to 24 characters.';
  }

  if (Object.keys(errors).length > 0) return { errors, value: null };
  return {
    errors,
    value: {
      title,
      priority: draft.priority as TaskPriority,
      dueDate: draft.dueDate || null,
      projectId,
      tags,
    },
  };
}

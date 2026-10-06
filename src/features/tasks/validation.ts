import type { Project, Task, TaskStatus } from '../../types';
import {
  validateQuickAdd,
  type QuickAddDraft,
  type QuickAddErrors,
  type NewTaskFields,
} from '../today/validation';

export interface TaskFormDraft extends QuickAddDraft {
  description: string;
  status: string;
}

export interface TaskFormFields extends NewTaskFields {
  description: string;
  status: TaskStatus;
}

export type TaskFormField = keyof TaskFormDraft;
export type TaskFormErrors = Partial<Record<TaskFormField, string>>;

const validStatuses = new Set<TaskStatus>(['inbox', 'todo', 'in-progress', 'completed']);

export function emptyTaskDraft(status: TaskStatus = 'inbox'): TaskFormDraft {
  return {
    title: '',
    description: '',
    status,
    priority: 'none',
    dueDate: '',
    projectId: '',
    tags: '',
  };
}

export function taskToDraft(task: Task): TaskFormDraft {
  return {
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate ?? '',
    projectId: task.projectId ?? '',
    tags: task.tags.join(', '),
  };
}

export function validateTaskForm(
  draft: TaskFormDraft,
  projects: Project[],
): { errors: TaskFormErrors; value: TaskFormFields | null } {
  const quick = validateQuickAdd(draft, projects, true);
  const errors: QuickAddErrors & Partial<Record<'description' | 'status', string>> = {
    ...quick.errors,
  };
  if (draft.description.length > 2_000) {
    errors.description = 'Descriptions can be up to 2,000 characters.';
  }
  if (!validStatuses.has(draft.status as TaskStatus)) {
    errors.status = 'Choose a valid status.';
  }
  if (Object.keys(errors).length > 0 || !quick.value) return { errors, value: null };
  return {
    errors,
    value: {
      ...quick.value,
      description: draft.description,
      status: draft.status as TaskStatus,
    },
  };
}

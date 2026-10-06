import type { Activity, AppData, Task } from '../../types';
import type { TaskFormFields } from './validation';

export interface RemovedTask {
  task: Task;
  taskIndex: number;
  activity: Activity[];
  activityIndexes: number[];
}

function makeId(kind: 'task' | 'activity'): string {
  const token =
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return `${kind}-${token}`;
}

function activityEvent(
  type: Activity['type'],
  entityId: string,
  message: string,
  createdAt: string,
  id = makeId('activity'),
): Activity {
  return { id, type, entityId, message, createdAt };
}

export function createTaskRecord(
  fields: TaskFormFields,
  now = new Date(),
  id = makeId('task'),
  activityId = makeId('activity'),
): { task: Task; activity: Activity } {
  const timestamp = now.toISOString();
  const task: Task = {
    ...fields,
    id,
    tags: [...fields.tags],
    createdAt: timestamp,
    updatedAt: timestamp,
    completedAt: fields.status === 'completed' ? timestamp : null,
  };
  return {
    task,
    activity: activityEvent('task-created', task.id, `Added ${task.title}`, timestamp, activityId),
  };
}

export function updateTaskRecord(
  current: Task,
  fields: TaskFormFields,
  now = new Date(),
  activityId = makeId('activity'),
): { task: Task; activity: Activity } {
  const timestamp = now.toISOString();
  const isCompleted = fields.status === 'completed';
  const task: Task = {
    ...current,
    ...fields,
    tags: [...fields.tags],
    updatedAt: timestamp,
    completedAt: isCompleted ? (current.completedAt ?? timestamp) : null,
  };
  const justCompleted = current.status !== 'completed' && task.status === 'completed';
  return {
    task,
    activity: activityEvent(
      justCompleted ? 'task-completed' : 'task-updated',
      task.id,
      justCompleted ? `Completed ${task.title}` : `Updated ${task.title}`,
      timestamp,
      activityId,
    ),
  };
}

export function toggleTaskRecord(
  current: Task,
  now = new Date(),
  activityId = makeId('activity'),
): { task: Task; activity: Activity } {
  const timestamp = now.toISOString();
  const wasCompleted = current.status === 'completed';
  const task: Task = {
    ...current,
    status: wasCompleted ? 'todo' : 'completed',
    completedAt: wasCompleted ? null : timestamp,
    updatedAt: timestamp,
    tags: [...current.tags],
  };
  return {
    task,
    activity: wasCompleted
      ? activityEvent(
          'task-updated',
          task.id,
          `Returned ${task.title} to active work`,
          timestamp,
          activityId,
        )
      : activityEvent('task-completed', task.id, `Completed ${task.title}`, timestamp, activityId),
  };
}

export function withCreatedTask(data: AppData, task: Task, activity: Activity): AppData {
  return {
    ...data,
    tasks: [task, ...data.tasks],
    activity: [activity, ...data.activity].slice(0, 100),
  };
}

export function withUpdatedTask(data: AppData, task: Task, activity: Activity): AppData {
  return {
    ...data,
    tasks: data.tasks.map((item) => (item.id === task.id ? task : item)),
    activity: [activity, ...data.activity].slice(0, 100),
  };
}

export function withRemovedTask(
  data: AppData,
  taskId: string,
): { data: AppData; removed: RemovedTask | null } {
  const taskIndex = data.tasks.findIndex((task) => task.id === taskId);
  if (taskIndex < 0) return { data, removed: null };
  const task = data.tasks[taskIndex];
  if (!task) return { data, removed: null };
  const indexedActivity = data.activity
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => item.entityId === taskId);
  const activity = indexedActivity.map(({ item }) => item);
  return {
    data: {
      ...data,
      tasks: data.tasks.filter((item) => item.id !== taskId),
      activity: data.activity.filter((item) => item.entityId !== taskId),
    },
    removed: {
      task: { ...task, tags: [...task.tags] },
      taskIndex,
      activity,
      activityIndexes: indexedActivity.map(({ index }) => index),
    },
  };
}

export function withRestoredTask(data: AppData, removed: RemovedTask): AppData {
  if (data.tasks.some((task) => task.id === removed.task.id)) return data;
  const tasks = [...data.tasks];
  tasks.splice(Math.min(removed.taskIndex, tasks.length), 0, {
    ...removed.task,
    tags: [...removed.task.tags],
  });
  const activity = [...data.activity];
  removed.activity.forEach((item, index) => {
    if (activity.some((current) => current.id === item.id)) return;
    const originalIndex = removed.activityIndexes[index] ?? activity.length;
    activity.splice(Math.min(originalIndex, activity.length), 0, item);
  });
  return { ...data, tasks, activity };
}

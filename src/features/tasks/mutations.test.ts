import { describe, expect, it } from 'vitest';
import { createSampleData } from '../../data/sampleData';
import {
  createTaskRecord,
  toggleTaskRecord,
  updateTaskRecord,
  withCreatedTask,
  withRemovedTask,
  withRestoredTask,
  withUpdatedTask,
} from './mutations';
import { emptyTaskDraft, validateTaskForm } from './validation';

const now = new Date('2026-10-02T12:00:00.000Z');
const fields = validateTaskForm(
  { ...emptyTaskDraft('todo'), title: 'Write a brief', description: 'Context', priority: 'medium' },
  [],
).value!;

describe('task mutations', () => {
  it('creates a canonical task and activity and updates shared application data immutably', () => {
    const original = createSampleData(now);
    const { task, activity } = createTaskRecord(fields, now, 'task-new', 'activity-new');
    const next = withCreatedTask(original, task, activity);
    expect(task).toMatchObject({
      id: 'task-new',
      title: 'Write a brief',
      status: 'todo',
      completedAt: null,
    });
    expect(next.tasks[0]?.id).toBe('task-new');
    expect(next.activity[0]).toMatchObject({
      id: 'activity-new',
      type: 'task-created',
      entityId: task.id,
    });
    expect(original.tasks).toHaveLength(10);
  });

  it('updates task fields, completion time and task activity', () => {
    const task = createSampleData(now).tasks[0]!;
    const updateFields = { ...fields, title: 'Revised title', status: 'completed' as const };
    const { task: updated, activity } = updateTaskRecord(
      task,
      updateFields,
      now,
      'activity-update',
    );
    expect(updated).toMatchObject({
      title: 'Revised title',
      status: 'completed',
      completedAt: now.toISOString(),
    });
    expect(activity).toMatchObject({ type: 'task-completed', entityId: task.id });
    const reopened = toggleTaskRecord(
      updated,
      new Date('2026-10-02T13:00:00.000Z'),
      'activity-reopen',
    );
    expect(reopened.task).toMatchObject({ status: 'todo', completedAt: null });
    expect(reopened.activity.type).toBe('task-updated');
    expect(
      withUpdatedTask(createSampleData(now), updated, activity).tasks.find(
        (item) => item.id === task.id,
      ),
    ).toEqual(updated);
  });

  it('completes an active task and records a completion event', () => {
    const task = createSampleData(now).tasks[0]!;
    const result = toggleTaskRecord(task, now, 'activity-complete');
    expect(result.task).toMatchObject({ status: 'completed', completedAt: now.toISOString() });
    expect(result.activity).toMatchObject({
      type: 'task-completed',
      message: `Completed ${task.title}`,
    });
  });

  it('deletes the task and its history, then restores both at their original positions once', () => {
    const original = createSampleData(now);
    const target = original.tasks[3]!;
    const { data: deleted, removed } = withRemovedTask(original, target.id);
    expect(removed?.task.id).toBe(target.id);
    expect(deleted.tasks).toHaveLength(9);
    expect(deleted.activity.some((item) => item.entityId === target.id)).toBe(false);
    const restored = withRestoredTask(deleted, removed!);
    expect(restored.tasks.map((task) => task.id)).toEqual(original.tasks.map((task) => task.id));
    expect(restored.activity).toEqual(original.activity);
    expect(withRestoredTask(restored, removed!)).toBe(restored);
    expect(withRemovedTask(original, 'missing').removed).toBeNull();
  });
});

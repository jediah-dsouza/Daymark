import { describe, expect, it } from 'vitest';
import { SAMPLE_PROJECTS } from '../../data/sampleData';
import { emptyTaskDraft, taskToDraft, validateTaskForm } from './validation';

const draft = () => ({ ...emptyTaskDraft('todo'), title: '  Write notes  ' });

describe('full task form validation', () => {
  it('uses the exact PRD title errors and does not block the submit state', () => {
    expect(validateTaskForm({ ...draft(), title: '   ' }, SAMPLE_PROJECTS).errors.title).toBe(
      'Give the task a name.',
    );
    expect(validateTaskForm({ ...draft(), title: ' x ' }, SAMPLE_PROJECTS).errors.title).toBe(
      'Task names must contain at least 2 characters.',
    );
    expect(
      validateTaskForm({ ...draft(), title: 'x'.repeat(121) }, SAMPLE_PROJECTS).errors.title,
    ).toBe('Task names can be up to 120 characters.');
  });

  it('trims title and duplicate tags while preserving optional description and fields', () => {
    const result = validateTaskForm(
      {
        ...draft(),
        description: 'A note with\nuseful context.',
        priority: 'high',
        dueDate: '2026-10-04',
        projectId: 'project-portfolio',
        tags: ' research, Research, writing ',
      },
      SAMPLE_PROJECTS,
    );
    expect(result.errors).toEqual({});
    expect(result.value).toMatchObject({
      title: 'Write notes',
      description: 'A note with\nuseful context.',
      status: 'todo',
      priority: 'high',
      dueDate: '2026-10-04',
      projectId: 'project-portfolio',
      tags: ['research', 'writing'],
    });
  });

  it('validates description length, enum values, dates, project references, and tag limits', () => {
    const result = validateTaskForm(
      {
        ...draft(),
        description: 'x'.repeat(2_001),
        status: 'finished',
        priority: 'urgent',
        dueDate: '2026-02-30',
        projectId: 'missing-project',
        tags: 'one, two, three, four, five, six, seven, eight, nine',
      },
      SAMPLE_PROJECTS,
    );
    expect(result.value).toBeNull();
    expect(result.errors).toMatchObject({
      description: 'Descriptions can be up to 2,000 characters.',
      status: 'Choose a valid status.',
      priority: 'Choose a valid priority.',
      dueDate: 'Enter a valid date.',
      projectId: 'Choose an available project or leave the project unset.',
      tags: 'Use no more than 8 tags.',
    });
  });

  it('allows a task already assigned to an archived but existing project to retain that link', () => {
    const archived = { ...SAMPLE_PROJECTS[0]!, archived: true };
    const existingTask = {
      id: 'archived-task',
      title: 'Existing work',
      description: '',
      status: 'todo' as const,
      priority: 'none' as const,
      dueDate: null,
      projectId: archived.id,
      tags: [],
      createdAt: '2026-09-30T12:00:00.000Z',
      updatedAt: '2026-09-30T12:00:00.000Z',
      completedAt: null,
    };
    const values = taskToDraft(existingTask);
    expect(validateTaskForm(values, [archived]).errors).toEqual({});
  });

  it('allows optional date, project, tags and description to remain empty', () => {
    const result = validateTaskForm(draft(), SAMPLE_PROJECTS);
    expect(result.value).toMatchObject({
      dueDate: null,
      projectId: null,
      tags: [],
      description: '',
    });
  });
});

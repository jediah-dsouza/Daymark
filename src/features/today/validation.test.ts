import { describe, expect, it } from 'vitest';
import { createSampleData } from '../../data/sampleData';
import type { QuickAddDraft } from './validation';
import { validateQuickAdd } from './validation';

const projects = createSampleData(new Date(2026, 9, 2, 12)).projects;
const draft = (overrides: Partial<QuickAddDraft> = {}): QuickAddDraft => ({
  title: 'New work item',
  priority: 'medium',
  dueDate: '2026-10-02',
  projectId: '',
  tags: '',
  ...overrides,
});

describe('Quick Add validation', () => {
  it('uses the exact required, minimum-length, and maximum-length task-title messages', () => {
    expect(validateQuickAdd(draft({ title: '  ' }), projects).errors.title).toBe(
      'Give the task a name.',
    );
    expect(validateQuickAdd(draft({ title: ' x ' }), projects).errors.title).toBe(
      'Task names must contain at least 2 characters.',
    );
    expect(validateQuickAdd(draft({ title: 'x'.repeat(121) }), projects).errors.title).toBe(
      'Task names can be up to 120 characters.',
    );
    expect(
      validateQuickAdd(draft({ title: `  ${'x'.repeat(120)}  ` }), projects).value?.title,
    ).toBe('x'.repeat(120));
  });

  it('trims the title, normalizes duplicate tags, and permits an unset date and project', () => {
    const result = validateQuickAdd(
      draft({
        title: '  Plan the next session  ',
        dueDate: '',
        projectId: '',
        tags: ' Learning, practice, learning, , ',
      }),
      projects,
    );
    expect(result.errors).toEqual({});
    expect(result.value).toEqual({
      title: 'Plan the next session',
      priority: 'medium',
      dueDate: null,
      projectId: null,
      tags: ['Learning', 'practice'],
    });
  });

  it('rejects impossible dates, unavailable projects, invalid priorities, and excessive tags', () => {
    const invalid = validateQuickAdd(
      draft({
        dueDate: '2026-02-31',
        projectId: 'missing-project',
        priority: 'urgent',
        tags: Array.from({ length: 9 }, (_, index) => `tag-${index}`).join(','),
      }),
      projects,
    );
    expect(invalid.value).toBeNull();
    expect(invalid.errors.dueDate).toBe('Enter a valid date.');
    expect(invalid.errors.projectId).toBe(
      'Choose an available project or leave the project unset.',
    );
    expect(invalid.errors.priority).toBe('Choose a valid priority.');
    expect(invalid.errors.tags).toBe('Use no more than 8 tags.');
  });

  it('rejects an overlong tag without discarding otherwise valid input', () => {
    const result = validateQuickAdd(draft({ tags: 'x'.repeat(25) }), projects);
    expect(result.value).toBeNull();
    expect(result.errors.tags).toBe('Each tag can be up to 24 characters.');
  });
});

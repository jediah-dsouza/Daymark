import { describe, expect, it } from 'vitest';
import { emptyProjectDraft, validateProjectForm } from './validation';

describe('project form validation', () => {
  it('requires a trimmed project name and enforces the exact minimum message', () => {
    expect(validateProjectForm(emptyProjectDraft())).toEqual({
      errors: { name: 'Give the project a name.' },
      value: null,
    });
    expect(validateProjectForm({ ...emptyProjectDraft(), name: ' A ' })).toEqual({
      errors: { name: 'Project names must contain at least 2 characters.' },
      value: null,
    });
  });

  it('normalizes valid fields and accepts the documented boundary lengths', () => {
    const result = validateProjectForm({
      name: `  ${'N'.repeat(60)}  `,
      description: `  ${'d'.repeat(300)}  `,
      colorToken: 'olive',
    });
    expect(result.errors).toEqual({});
    expect(result.value).toEqual({
      name: 'N'.repeat(60),
      description: 'd'.repeat(300),
      colorToken: 'olive',
    });
  });

  it('rejects overlong names, descriptions, and unknown colors with field feedback', () => {
    const result = validateProjectForm({
      name: 'P'.repeat(61),
      description: 'd'.repeat(301),
      colorToken: 'violet',
    });
    expect(result.value).toBeNull();
    expect(result.errors).toEqual({
      name: 'Project names can be up to 60 characters.',
      description: 'Project descriptions can be up to 300 characters.',
      colorToken: 'Choose a valid project color.',
    });
  });
});

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SAMPLE_PROJECTS } from '../../../data/sampleData';
import type { TaskFormFields } from '../validation';
import { TaskFormDialog } from './TaskFormDialog';

function renderCreate(onSave = vi.fn()) {
  const onCancel = vi.fn();
  const view = render(
    <TaskFormDialog
      open
      mode="create"
      task={null}
      projects={SAMPLE_PROJECTS}
      defaultStatus="inbox"
      onCancel={onCancel}
      onSave={onSave}
    />,
  );
  return { ...view, onSave, onCancel, user: userEvent.setup() };
}

describe('TaskFormDialog', () => {
  it('focuses the first invalid field, shows exact title feedback, and creates nothing', async () => {
    const onSave = vi.fn();
    const { user } = renderCreate(onSave);
    const title = screen.getByRole('textbox', { name: 'Task name' });

    expect(title).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Create task' }));

    expect(await screen.findByText('Give the task a name.')).toBeVisible();
    await waitFor(() => expect(title).toHaveFocus());
    expect(onSave).not.toHaveBeenCalled();
  });

  it('submits all validated details with a trimmed title and normalized tags', async () => {
    const onSave = vi.fn();
    const { user } = renderCreate(onSave);
    await user.type(screen.getByRole('textbox', { name: 'Task name' }), '  Prepare notes  ');
    await user.type(screen.getByRole('textbox', { name: 'Description' }), 'Useful context');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Status' }), 'in-progress');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Priority' }), 'high');
    await user.type(screen.getByLabelText('Due date'), '2026-10-05');
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Project' }),
      'project-portfolio',
    );
    await user.type(screen.getByRole('textbox', { name: 'Tags' }), ' research, notes, RESEARCH ');
    await user.click(screen.getByRole('button', { name: 'Create task' }));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave).toHaveBeenCalledWith({
      title: 'Prepare notes',
      description: 'Useful context',
      status: 'in-progress',
      priority: 'high',
      dueDate: '2026-10-05',
      projectId: 'project-portfolio',
      tags: ['research', 'notes'],
    });
  });

  it('disables repeat submission while the save promise is pending', async () => {
    let finishSave: (() => void) | undefined;
    const onSave = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finishSave = resolve;
        }),
    );
    const { user } = renderCreate(onSave);
    await user.type(screen.getByRole('textbox', { name: 'Task name' }), 'Write the outline');
    const submit = screen.getByRole('button', { name: 'Create task' });
    await user.click(submit);

    await waitFor(() => expect(submit).toBeDisabled());
    expect(submit).toHaveAttribute('aria-busy', 'true');
    await user.click(submit);
    expect(onSave).toHaveBeenCalledTimes(1);
    finishSave?.();
    await waitFor(() => expect(submit).toBeEnabled());
  });

  it('keeps entered values and permits retry after a recoverable save failure', async () => {
    const onSave = vi
      .fn<(fields: TaskFormFields) => Promise<void>>()
      .mockRejectedValueOnce(new Error('temporary storage issue'))
      .mockResolvedValueOnce(undefined);
    const { user } = renderCreate(onSave);
    const title = screen.getByRole('textbox', { name: 'Task name' });
    await user.type(title, 'Keep this draft');
    await user.click(screen.getByRole('button', { name: 'Create task' }));

    expect(
      await screen.findByText(
        'Your task could not be saved. Your entries are still here. Try again.',
      ),
    ).toBeVisible();
    expect(title).toHaveValue('Keep this draft');
    await user.click(screen.getByRole('button', { name: 'Create task' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(2));
  });
});

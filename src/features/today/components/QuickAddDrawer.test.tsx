import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { createSampleData } from '../../../data/sampleData';
import { QuickAddDrawer } from './QuickAddDrawer';

const projects = createSampleData(new Date(2026, 9, 2, 12)).projects;

function renderOpenDrawer(onSave = vi.fn(), onClose = vi.fn()) {
  const result = render(
    <QuickAddDrawer
      open
      projects={projects}
      initialDueDate="2026-10-02"
      onClose={onClose}
      onSave={onSave}
    />,
  );
  return { ...result, onSave, onClose };
}

describe('QuickAddDrawer', () => {
  it('shows the exact required-title error, focuses the first invalid field, and creates no record', async () => {
    const user = userEvent.setup();
    const { onSave } = renderOpenDrawer();
    const submit = screen.getByRole('button', { name: 'Add task' });
    submit.focus();
    expect(submit).toHaveFocus();
    await user.click(submit);

    const title = screen.getByRole('textbox', { name: 'Task name' });
    expect(screen.getByText('Give the task a name.')).toBeInTheDocument();
    await waitFor(() => expect(title).toHaveFocus());
    expect(onSave).not.toHaveBeenCalled();
  });

  it('creates a normalized task with a chosen priority/date/project and de-duplicated tags', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onClose = vi.fn();
    renderOpenDrawer(onSave, onClose);

    await user.type(
      screen.getByRole('textbox', { name: 'Task name' }),
      '  Prepare a project handoff  ',
    );
    await user.selectOptions(screen.getByRole('combobox', { name: 'Priority' }), 'high');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Project' }), projects[0]!.id);
    await user.type(screen.getByRole('textbox', { name: 'Tags' }), 'planning, review, Planning');
    await user.click(screen.getByRole('button', { name: 'Add task' }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        title: 'Prepare a project handoff',
        priority: 'high',
        dueDate: '2026-10-02',
        projectId: projects[0]!.id,
        tags: ['planning', 'review'],
      });
    });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('lets the user make the due date explicitly optional', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    renderOpenDrawer(onSave);

    await user.type(screen.getByRole('textbox', { name: 'Task name' }), 'Flexible work');
    await user.click(screen.getByRole('button', { name: 'Clear date' }));
    expect(screen.getByLabelText('Due date')).toHaveValue('');
    await user.click(screen.getByRole('button', { name: 'Add task' }));

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ dueDate: null })),
    );
  });

  it('disables duplicate submission and cancellation only while a save is pending', async () => {
    const user = userEvent.setup();
    let finishSave: (() => void) | undefined;
    const onSave = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finishSave = resolve;
        }),
    );
    const onClose = vi.fn();
    renderOpenDrawer(onSave, onClose);
    await user.type(screen.getByRole('textbox', { name: 'Task name' }), 'Wait for save');

    await user.click(screen.getByRole('button', { name: 'Add task' }));
    expect(screen.getByRole('button', { name: 'Add task' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Add task' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(onSave).toHaveBeenCalledOnce();

    finishSave?.();
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  });

  it('keeps the draft after a save error and allows a successful retry', async () => {
    const user = userEvent.setup();
    const onSave = vi
      .fn<() => Promise<void>>()
      .mockRejectedValueOnce(new Error('temporary write failure'))
      .mockResolvedValueOnce(undefined);
    const onClose = vi.fn();
    renderOpenDrawer(onSave, onClose);
    const title = screen.getByRole('textbox', { name: 'Task name' });
    await user.type(title, 'Keep this draft');
    await user.click(screen.getByRole('button', { name: 'Add task' }));

    expect(await screen.findByText("We couldn't save that task. Try again.")).toBeInTheDocument();
    expect(title).toHaveValue('Keep this draft');
    expect(onClose).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Add task' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
    expect(onSave).toHaveBeenCalledTimes(2);
  });
});

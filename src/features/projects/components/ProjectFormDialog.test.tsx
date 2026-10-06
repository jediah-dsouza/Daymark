import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SAMPLE_PROJECTS } from '../../../data/sampleData';
import type { ProjectFormFields } from '../validation';
import { ProjectFormDialog } from './ProjectFormDialog';

function renderCreate(onSave: (fields: ProjectFormFields) => void | Promise<void> = vi.fn()) {
  const onCancel = vi.fn();
  const view = render(
    <ProjectFormDialog open mode="create" project={null} onCancel={onCancel} onSave={onSave} />,
  );
  return { ...view, onSave, onCancel, user: userEvent.setup() };
}

describe('ProjectFormDialog', () => {
  it('focuses the required name, explains the exact validation error, and creates nothing', async () => {
    const onSave = vi.fn();
    const { user } = renderCreate(onSave);
    const name = screen.getByRole('textbox', { name: 'Project name' });

    expect(name).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Create project' }));

    expect(await screen.findByText('Give the project a name.')).toBeVisible();
    await waitFor(() => expect(name).toHaveFocus());
    expect(onSave).not.toHaveBeenCalled();
  });

  it('submits normalized fields and the selected project color', async () => {
    const onSave = vi.fn();
    const { user } = renderCreate(onSave);
    await user.type(screen.getByRole('textbox', { name: 'Project name' }), '  Reading notes  ');
    await user.type(screen.getByRole('textbox', { name: 'Description' }), '  A shared notebook.  ');
    await user.click(screen.getByRole('radio', { name: /Rust/ }));
    await user.click(screen.getByRole('button', { name: 'Create project' }));

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({
        name: 'Reading notes',
        description: 'A shared notebook.',
        colorToken: 'rust',
      }),
    );
  });

  it('retains values and permits retry after a recoverable save failure', async () => {
    const onSave = vi
      .fn<(fields: ProjectFormFields) => Promise<void>>()
      .mockRejectedValueOnce(new Error('temporary storage issue'))
      .mockResolvedValueOnce(undefined);
    const { user } = renderCreate(onSave);
    const name = screen.getByRole('textbox', { name: 'Project name' });
    await user.type(name, 'Keep this project draft');
    await user.click(screen.getByRole('button', { name: 'Create project' }));

    expect(
      await screen.findByText(
        'Your project could not be saved. Your entries are still here. Try again.',
      ),
    ).toBeVisible();
    expect(name).toHaveValue('Keep this project draft');
    await user.click(screen.getByRole('button', { name: 'Create project' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(2));
  });

  it('prepopulates existing project values for an edit', () => {
    render(
      <ProjectFormDialog
        open
        mode="edit"
        project={SAMPLE_PROJECTS[0]!}
        onCancel={vi.fn()}
        onSave={vi.fn()}
      />,
    );
    expect(screen.getByRole('textbox', { name: 'Project name' })).toHaveValue('Portfolio Refresh');
    expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue(
      'Rework selected case studies and the mobile experience of a personal portfolio.',
    );
    expect(screen.getByRole('radio', { name: /Clay/ })).toBeChecked();
  });
});

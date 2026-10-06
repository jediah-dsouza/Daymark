import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SAMPLE_PROJECTS } from '../../../data/sampleData';
import type { TaskFormFields } from '../../tasks/validation';
import { ProjectTaskComposer } from './ProjectTaskComposer';

function renderComposer(onCreate: (fields: TaskFormFields) => void | Promise<void> = vi.fn()) {
  const project = SAMPLE_PROJECTS[0]!;
  const view = render(
    <ProjectTaskComposer
      project={project}
      projects={SAMPLE_PROJECTS}
      defaultStatus="todo"
      onCreate={onCreate}
    />,
  );
  return { ...view, project, onCreate, user: userEvent.setup() };
}

describe('ProjectTaskComposer', () => {
  it('opens with title focus and validates an empty task without creating it', async () => {
    const onCreate = vi.fn();
    const { user } = renderComposer(onCreate);
    await user.click(screen.getByRole('button', { name: 'Add a task' }));
    const title = screen.getByRole('textbox', { name: 'Task name' });
    expect(title).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Add task' }));
    expect(await screen.findByText('Give the task a name.')).toBeVisible();
    expect(onCreate).not.toHaveBeenCalled();
  });

  it('creates a normalized task with fixed project assignment and the saved default status', async () => {
    const onCreate = vi.fn();
    const { user, project } = renderComposer(onCreate);
    await user.click(screen.getByRole('button', { name: 'Add a task' }));
    await user.type(screen.getByRole('textbox', { name: 'Task name' }), '  Finish chapter notes  ');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Priority' }), 'high');
    await user.type(screen.getByLabelText('Due date'), '2026-10-06');
    await user.click(screen.getByRole('button', { name: 'Add task' }));

    await waitFor(() =>
      expect(onCreate).toHaveBeenCalledWith({
        title: 'Finish chapter notes',
        description: '',
        status: 'todo',
        priority: 'high',
        dueDate: '2026-10-06',
        projectId: project.id,
        tags: [],
      }),
    );
    await waitFor(() => expect(screen.getByRole('button', { name: 'Add a task' })).toHaveFocus());
    expect(screen.queryByRole('textbox', { name: 'Task name' })).not.toBeInTheDocument();
  });

  it('closes on Escape and restores focus to the composer trigger', async () => {
    const { user } = renderComposer();
    const trigger = screen.getByRole('button', { name: 'Add a task' });
    await user.click(trigger);
    expect(screen.getByRole('textbox', { name: 'Task name' })).toHaveFocus();
    await user.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByRole('textbox', { name: 'Task name' })).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveFocus();
  });
});

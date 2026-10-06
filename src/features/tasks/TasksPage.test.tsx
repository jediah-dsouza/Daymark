import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppProvider } from '../../state/AppProvider';
import { TaskDetailPage } from './TaskDetailPage';
import { TasksPage } from './TasksPage';

function renderTaskRoutes(path = '/tasks') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppProvider>
        <Routes>
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/tasks/:taskId" element={<TaskDetailPage />} />
        </Routes>
      </AppProvider>
    </MemoryRouter>,
  );
}

describe('Tasks route', () => {
  it('shows all ten realistic tasks, searches project names, and combines filters', async () => {
    const user = userEvent.setup();
    renderTaskRoutes();
    const list = screen.getByRole('list', { name: 'Tasks' });
    const taskCount = () => list.querySelectorAll(':scope > li').length;
    expect(taskCount()).toBe(10);

    const search = screen.getByRole('searchbox', { name: 'Search tasks and projects' });
    await user.type(search, 'Internship Deliverables');
    expect(taskCount()).toBe(3);
    await user.clear(search);
    await user.type(search, 'review');
    await user.click(screen.getByRole('button', { name: /Filters/ }));
    await user.selectOptions(screen.getByRole('combobox', { name: 'Status' }), 'todo');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Priority' }), 'high');
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Project' }),
      'project-internship',
    );
    expect(taskCount()).toBe(1);
    expect(within(list).getByText('Prepare Task 2 internship submission')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(search).toHaveValue('review');
    expect(taskCount()).toBe(3);
    await user.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(search).toHaveValue('');
    expect(taskCount()).toBe(10);
  });

  it('creates a valid task from the full form and retains its persisted fields', async () => {
    const user = userEvent.setup();
    renderTaskRoutes();
    await user.click(screen.getByRole('button', { name: 'New task' }));
    const dialog = screen.getByRole('dialog', { name: 'New task' });
    await user.type(
      within(dialog).getByRole('textbox', { name: 'Task name' }),
      'Plan the next review',
    );
    await user.type(
      within(dialog).getByRole('textbox', { name: 'Description' }),
      'Share a short agenda first.',
    );
    await user.selectOptions(
      within(dialog).getByRole('combobox', { name: 'Status' }),
      'in-progress',
    );
    await user.selectOptions(within(dialog).getByRole('combobox', { name: 'Priority' }), 'high');
    await user.selectOptions(
      within(dialog).getByRole('combobox', { name: 'Project' }),
      'project-portfolio',
    );
    await user.type(within(dialog).getByRole('textbox', { name: 'Tags' }), 'meeting, review');
    await user.click(within(dialog).getByRole('button', { name: 'Create task' }));

    expect(await screen.findByText('Task created.')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Plan the next review' })).toBeVisible();
    await waitFor(() => {
      const record = JSON.parse(localStorage.getItem('daymark:workspace:v1') ?? 'null');
      const created = record?.data?.tasks?.find(
        (task: { title: string }) => task.title === 'Plan the next review',
      );
      expect(created).toMatchObject({
        description: 'Share a short agenda first.',
        status: 'in-progress',
        priority: 'high',
        projectId: 'project-portfolio',
        tags: ['meeting', 'review'],
      });
    });
  });

  it('edits a real task, records completed history, and deletes with a working Undo', async () => {
    const user = userEvent.setup();
    renderTaskRoutes('/tasks/task-portfolio-layout');
    expect(
      await screen.findByRole('heading', { name: 'Refine portfolio case-study layout', level: 1 }),
    ).toBeVisible();
    expect(
      within(screen.getByRole('region', { name: 'Description' })).getByText(/Tighten the story/),
    ).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Edit task' }));
    const dialog = screen.getByRole('dialog', { name: 'Edit task' });
    const title = within(dialog).getByRole('textbox', { name: 'Task name' });
    await user.clear(title);
    await user.type(title, 'Refine portfolio stories');
    await user.selectOptions(within(dialog).getByRole('combobox', { name: 'Status' }), 'completed');
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    expect(
      await screen.findByRole('heading', { name: 'Refine portfolio stories', level: 1 }),
    ).toBeVisible();
    expect(screen.getByText('Completed Refine portfolio stories')).toBeVisible();
    expect(screen.getByText('Task updated.')).toBeVisible();

    await user.click(screen.getByLabelText('More task actions'));
    await user.click(
      within(screen.getByRole('group', { name: 'Task actions' })).getByRole('button', {
        name: 'Delete task',
      }),
    );
    const deleteDialog = screen.getByRole('dialog', { name: 'Delete this task?' });
    await user.click(within(deleteDialog).getByRole('button', { name: 'Delete task' }));
    expect(await screen.findByRole('heading', { name: 'This task was deleted.' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(
      await screen.findByRole('heading', { name: 'Refine portfolio stories', level: 1 }),
    ).toBeVisible();
    expect(screen.getByText('Task restored.')).toBeVisible();
  });
});

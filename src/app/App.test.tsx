import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { App } from './App';
import { AppProvider } from '../state/AppProvider';

describe('Today workspace', () => {
  it('renders the PRD demonstration groups on the intentional root route', () => {
    render(
      <AppProvider>
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      </AppProvider>,
    );
    expect(screen.getByRole('heading', { name: 'Today, in focus' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Primary navigation' })).toBeInTheDocument();
    const primaryNavigation = screen.getByRole('navigation', { name: 'Primary navigation' });
    expect(within(primaryNavigation).getByRole('link', { name: 'Today' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByText('3 focus tasks', { exact: true })).toBeInTheDocument();
    expect(screen.getByText('1 overdue', { exact: true })).toBeInTheDocument();
    const focus = screen.getByRole('heading', { name: 'Focus for today' }).closest('section');
    const overdue = screen.getByRole('heading', { name: 'Overdue' }).closest('section');
    const upcoming = screen.getByRole('heading', { name: 'Upcoming' }).closest('section');
    const completed = screen.getByRole('heading', { name: 'Completed today' }).closest('section');
    expect(focus?.querySelectorAll('.today-task-list > li')).toHaveLength(3);
    expect(overdue?.querySelectorAll('.today-task-list > li')).toHaveLength(1);
    expect(upcoming?.querySelectorAll('.today-task-list > li')).toHaveLength(4);
    expect(completed?.querySelectorAll('.today-task-list > li')).toHaveLength(2);
    expect(screen.getByRole('region', { name: 'Activity' })).toBeInTheDocument();
    expect(
      screen.getByRole('progressbar', { name: 'Today’s completion progress' }),
    ).toHaveAttribute('aria-valuenow', '40');
  });

  it('sets an accurate document title on an unknown route', () => {
    render(
      <AppProvider>
        <MemoryRouter initialEntries={['/not-a-route']}>
          <App />
        </MemoryRouter>
      </AppProvider>,
    );
    expect(screen.getByRole('heading', { name: 'This page isn’t here.' })).toBeInTheDocument();
    expect(document.title).toBe('Page not found — Daymark');
  });

  it('completes a task, updates progress and activity, and supports immediate Undo', async () => {
    const user = userEvent.setup();
    render(
      <AppProvider>
        <MemoryRouter initialEntries={['/today']}>
          <App />
        </MemoryRouter>
      </AppProvider>,
    );

    const firstTask = screen.getAllByRole('button', { name: /^Complete / })[0];
    expect(firstTask).toBeDefined();
    await user.click(firstTask!);
    expect(screen.getByRole('status')).toHaveTextContent('Task completed.');
    expect(
      screen.getByRole('progressbar', { name: 'Today’s completion progress' }),
    ).toHaveAttribute('aria-valuenow', '50');

    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(screen.getByRole('status')).toHaveTextContent('Completion undone.');
    expect(
      screen.getByRole('progressbar', { name: 'Today’s completion progress' }),
    ).toHaveAttribute('aria-valuenow', '40');
    expect(screen.getByRole('heading', { name: 'Overdue' })).toBeInTheDocument();
  });
});

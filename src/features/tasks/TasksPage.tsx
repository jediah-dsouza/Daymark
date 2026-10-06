import { Plus } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ToastRegion, type ToastMessage } from '../../components/feedback/ToastRegion';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { useApp } from '../../state/AppProvider';
import type { Task, TaskFilters } from '../../types';
import { localDateNow } from '../../utils/dates';
import { TaskRow } from '../today/components/TaskRow';
import { DeleteTaskDialog } from '../today/components/DeleteTaskDialog';
import { TaskFormDialog } from './components/TaskFormDialog';
import { TaskToolbar } from './components/TaskToolbar';
import {
  createTaskRecord,
  toggleTaskRecord,
  withCreatedTask,
  withRemovedTask,
  withRestoredTask,
  withUpdatedTask,
} from './mutations';
import {
  DEFAULT_TASK_FILTERS,
  hasActiveTaskCriteria,
  selectTasks,
  taskDueDateLabel,
} from './selectors';
import type { TaskFormFields } from './validation';
import './tasks.css';

function pluralize(count: number, singular: string): string {
  return `${count} ${singular}${count === 1 ? '' : 's'}`;
}

export function TasksPage() {
  const { data, updateData } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchRef = useRef<HTMLInputElement>(null);
  const [filters, setFilters] = useState<TaskFilters>(DEFAULT_TASK_FILTERS);
  const [formOpen, setFormOpen] = useState(false);
  const [pendingDeletion, setPendingDeletion] = useState<Task | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const tasks = useMemo(
    () => selectTasks(data.tasks, data.projects, filters),
    [data.tasks, data.projects, filters],
  );
  const projectsById = useMemo(
    () => new Map(data.projects.map((project) => [project.id, project])),
    [data.projects],
  );
  const activeCriteria = hasActiveTaskCriteria(filters);

  useEffect(() => {
    document.title = 'Tasks — Daymark';
  }, []);

  useEffect(() => {
    if (searchParams.get('focusSearch') !== '1') return;
    searchRef.current?.focus({ preventScroll: true });
    const next = new URLSearchParams(searchParams);
    next.delete('focusSearch');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 5_000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const changeFilters = (patch: Partial<TaskFilters>) =>
    setFilters((current) => ({ ...current, ...patch }));
  const clearAll = () => setFilters(DEFAULT_TASK_FILTERS);

  const handleCreate = async (fields: TaskFormFields) => {
    const { task, activity } = createTaskRecord(fields);
    updateData((current) => withCreatedTask(current, task, activity));
    setFormOpen(false);
    setToast({ message: 'Task created.', intent: 'success' });
  };

  const handleToggleComplete = (task: Task) => {
    const current = data.tasks.find((item) => item.id === task.id);
    if (!current) return;
    const previous = { ...current, tags: [...current.tags] };
    const { task: updated, activity } = toggleTaskRecord(current);
    updateData((latest) => withUpdatedTask(latest, updated, activity));
    if (previous.status !== 'completed') {
      setToast({
        message: 'Task completed.',
        intent: 'success',
        actionLabel: 'Undo',
        onAction: () => {
          updateData((latest) => ({
            ...latest,
            tasks: latest.tasks.map((item) => (item.id === previous.id ? previous : item)),
            activity: latest.activity.filter((item) => item.id !== activity.id),
          }));
          setToast({ message: 'Completion undone.', intent: 'info' });
        },
      });
    } else {
      setToast({ message: 'Task returned to active work.', intent: 'info' });
    }
  };

  const handleDelete = () => {
    if (!pendingDeletion) return;
    const taskId = pendingDeletion.id;
    const result = withRemovedTask(data, taskId);
    if (!result.removed) {
      setPendingDeletion(null);
      setToast({ message: 'This task was already removed.', intent: 'error' });
      return;
    }
    updateData((current) => withRemovedTask(current, taskId).data);
    const removed = result.removed;
    setPendingDeletion(null);
    setToast({
      message: 'Task deleted.',
      intent: 'success',
      actionLabel: 'Undo',
      onAction: () => {
        updateData((current) => withRestoredTask(current, removed));
        setToast({ message: 'Task restored.', intent: 'info' });
      },
    });
  };

  const hasAnyTasks = data.tasks.length > 0;
  const resultSummary = activeCriteria
    ? `Showing ${tasks.length} of ${pluralize(data.tasks.length, 'task')}.`
    : pluralize(tasks.length, 'task');

  return (
    <div className="page-scaffold tasks-page">
      <header className="tasks-header">
        <div>
          <p className="page-eyebrow">Your work</p>
          <h1>Tasks</h1>
          <p className="page-description">
            Find the work, understand its context, and move it forward.
          </p>
        </div>
        <div className="tasks-header__actions">
          <span className="tasks-header__count" aria-live="polite">
            {pluralize(data.tasks.length, 'task')}
          </span>
          <Button
            variant="primary"
            leadingIcon={<Plus size={17} strokeWidth={2} aria-hidden="true" />}
            onClick={() => setFormOpen(true)}
          >
            New task
          </Button>
        </div>
      </header>

      <TaskToolbar
        filters={filters}
        projects={data.projects}
        searchRef={searchRef}
        onChange={changeFilters}
        onClearFilters={() => changeFilters({ status: 'all', priority: 'all', projectId: 'all' })}
        onClearAll={clearAll}
      />
      {activeCriteria && (
        <p className="task-results-summary" aria-live="polite">
          {resultSummary}
        </p>
      )}

      {tasks.length > 0 ? (
        <section className="tasks-list-section" aria-labelledby="tasks-list-heading">
          <h2 id="tasks-list-heading" className="visually-hidden">
            Task list
          </h2>
          <ul className="today-task-list tasks-list" aria-label="Tasks">
            {tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                project={task.projectId ? projectsById.get(task.projectId) : undefined}
                dateLabel={taskDueDateLabel(task.dueDate, localDateNow())}
                overdue={
                  task.dueDate !== null &&
                  task.dueDate < localDateNow() &&
                  task.status !== 'completed'
                }
                showStatus
                onToggleComplete={handleToggleComplete}
                onDelete={setPendingDeletion}
              />
            ))}
          </ul>
        </section>
      ) : !hasAnyTasks ? (
        <EmptyState
          className="tasks-empty-state"
          title="No tasks yet."
          description="Add the first task when you are ready. Your list will stay here in this browser."
          action={
            <Button
              variant="primary"
              leadingIcon={<Plus size={16} aria-hidden="true" />}
              onClick={() => setFormOpen(true)}
            >
              Create a task
            </Button>
          }
        />
      ) : (
        <EmptyState
          className="tasks-empty-state"
          title={filters.search.trim() ? 'No tasks found.' : 'No tasks match these filters.'}
          description={
            filters.search.trim()
              ? `Nothing matches “${filters.search.trim()}”. Try another word, or search a task description or project name.`
              : 'Try changing one filter, or clear the search and filters to see all tasks.'
          }
          action={
            <Button variant="secondary" onClick={clearAll}>
              Clear search and filters
            </Button>
          }
        />
      )}

      <TaskFormDialog
        open={formOpen}
        mode="create"
        task={null}
        projects={data.projects}
        defaultStatus={data.preferences.defaultTaskStatus}
        onCancel={() => setFormOpen(false)}
        onSave={handleCreate}
      />
      <DeleteTaskDialog
        task={pendingDeletion}
        onCancel={() => setPendingDeletion(null)}
        onConfirm={handleDelete}
      />
      <ToastRegion toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

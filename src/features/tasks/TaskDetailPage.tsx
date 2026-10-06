import { ArrowLeft, Check, CircleCheck, Pencil, Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ToastRegion, type ToastMessage } from '../../components/feedback/ToastRegion';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { useApp } from '../../state/AppProvider';
import type { Task } from '../../types';
import { formatLocalDate, formatTimestamp, localDateNow } from '../../utils/dates';
import { closeDisclosureOnEscape } from '../../utils/keyboard';
import { DeleteTaskDialog } from '../today/components/DeleteTaskDialog';
import { TaskFormDialog } from './components/TaskFormDialog';
import {
  toggleTaskRecord,
  updateTaskRecord,
  withRemovedTask,
  withRestoredTask,
  withUpdatedTask,
} from './mutations';
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from './selectors';
import type { TaskFormFields } from './validation';
import './tasks.css';

export function TaskDetailPage() {
  const { taskId = '' } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, updateData } = useApp();
  const task = data.tasks.find((item) => item.id === taskId);
  const project = task?.projectId ? data.projects.find((item) => item.id === task.projectId) : null;
  const [formOpen, setFormOpen] = useState(false);
  const [pendingDeletion, setPendingDeletion] = useState<Task | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [deletedHere, setDeletedHere] = useState(false);
  const history = useMemo(
    () =>
      data.activity
        .filter((item) => item.entityId === taskId)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    [data.activity, taskId],
  );

  useEffect(() => {
    document.title = `${task?.title ?? 'Task not found'} — Daymark`;
  }, [task?.title]);

  useEffect(() => {
    if (searchParams.get('edit') !== '1' || !task) return;
    setFormOpen(true);
    const next = new URLSearchParams(searchParams);
    next.delete('edit');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams, task]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 5_000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleSave = async (fields: TaskFormFields) => {
    if (!task) return;
    const { task: updated, activity } = updateTaskRecord(task, fields);
    updateData((current) => withUpdatedTask(current, updated, activity));
    setFormOpen(false);
    setToast({ message: 'Task updated.', intent: 'success' });
  };

  const handleToggle = () => {
    if (!task) return;
    const previous = { ...task, tags: [...task.tags] };
    const { task: updated, activity } = toggleTaskRecord(task);
    updateData((current) => withUpdatedTask(current, updated, activity));
    if (task.status !== 'completed') {
      setToast({
        message: 'Task completed.',
        intent: 'success',
        actionLabel: 'Undo',
        onAction: () => {
          updateData((current) => ({
            ...current,
            tasks: current.tasks.map((item) => (item.id === previous.id ? previous : item)),
            activity: current.activity.filter((item) => item.id !== activity.id),
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
    const result = withRemovedTask(data, pendingDeletion.id);
    if (!result.removed) {
      setPendingDeletion(null);
      setToast({ message: 'This task was already removed.', intent: 'error' });
      return;
    }
    const removed = result.removed;
    updateData((current) => withRemovedTask(current, removed.task.id).data);
    setPendingDeletion(null);
    setDeletedHere(true);
    setToast({
      message: 'Task deleted.',
      intent: 'success',
      actionLabel: 'Undo',
      onAction: () => {
        updateData((current) => withRestoredTask(current, removed));
        setDeletedHere(false);
        setToast({ message: 'Task restored.', intent: 'info' });
      },
    });
  };

  if (!task) {
    return (
      <div className="page-scaffold task-detail-page">
        <p className="page-eyebrow">Task detail</p>
        <EmptyState
          className="task-not-found"
          titleLevel={1}
          title={deletedHere ? 'This task was deleted.' : 'Task not found.'}
          description={
            deletedHere
              ? 'The task and its activity were removed. You can undo the deletion from the notification.'
              : 'This task may have been removed, or its address may be incomplete.'
          }
          action={
            <Link className="button button--secondary button--medium" to="/tasks">
              <ArrowLeft size={16} aria-hidden="true" />
              <span>Return to tasks</span>
            </Link>
          }
        />
        <ToastRegion toast={toast} onDismiss={() => setToast(null)} />
        <DeleteTaskDialog
          task={pendingDeletion}
          onCancel={() => setPendingDeletion(null)}
          onConfirm={handleDelete}
        />
      </div>
    );
  }

  const completed = task.status === 'completed';
  const dateLabel = task.dueDate
    ? formatLocalDate(task.dueDate, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'No due date';

  return (
    <div className="page-scaffold task-detail-page">
      <Link className="task-detail-back" to="/tasks">
        <ArrowLeft size={16} aria-hidden="true" />
        <span>All tasks</span>
      </Link>
      <header className="task-detail-header">
        <div className="task-detail-header__main">
          <p className="page-eyebrow">Task detail</p>
          <h1>{task.title}</h1>
          <div className="task-detail-header__status">
            <span className={`task-status task-status--${task.status}`}>
              <span className="task-status__mark" aria-hidden="true" />
              {TASK_STATUS_LABELS[task.status]}
            </span>
            <span className={`priority-label priority-label--${task.priority}`}>
              <span className="priority-label__mark" aria-hidden="true" />
              {TASK_PRIORITY_LABELS[task.priority]}
            </span>
          </div>
        </div>
        <div className="task-detail-header__actions">
          <Button
            variant={completed ? 'quiet' : 'secondary'}
            leadingIcon={<Check size={16} aria-hidden="true" />}
            onClick={handleToggle}
          >
            {completed ? 'Mark incomplete' : 'Mark complete'}
          </Button>
          <Button
            variant="primary"
            leadingIcon={<Pencil size={16} aria-hidden="true" />}
            onClick={() => setFormOpen(true)}
          >
            Edit task
          </Button>
          <details className="task-detail-more" onKeyDown={closeDisclosureOnEscape}>
            <summary aria-label="More task actions" title="More task actions">
              ···
            </summary>
            <div className="task-detail-more__menu" role="group" aria-label="Task actions">
              <button type="button" onClick={() => setPendingDeletion(task)}>
                Delete task
              </button>
            </div>
          </details>
        </div>
      </header>

      <div className="task-detail-layout">
        <section className="task-detail-description" aria-labelledby="task-description-heading">
          <h2 id="task-description-heading">Description</h2>
          {task.description ? (
            <p className="task-detail-description__text">{task.description}</p>
          ) : (
            <p className="task-detail-muted">No description has been added.</p>
          )}
          {task.tags.length > 0 && (
            <div className="task-detail-tags">
              <h3>Tags</h3>
              <ul aria-label="Task tags">
                {task.tags.map((tag) => (
                  <li key={`${task.id}-${tag}`}>{tag}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="task-properties" aria-labelledby="task-properties-heading">
          <h2 id="task-properties-heading">Details</h2>
          <dl>
            <div>
              <dt>Status</dt>
              <dd>{TASK_STATUS_LABELS[task.status]}</dd>
            </div>
            <div>
              <dt>Priority</dt>
              <dd>{TASK_PRIORITY_LABELS[task.priority]}</dd>
            </div>
            <div>
              <dt>Due date</dt>
              <dd>
                {dateLabel}
                {task.dueDate && task.dueDate < localDateNow() && !completed ? ' · overdue' : ''}
              </dd>
            </div>
            <div>
              <dt>Project</dt>
              <dd>
                {project ? (
                  <Link to={`/projects/${project.id}`}>
                    {project.name}
                    {project.archived ? ' (archived)' : ''}
                  </Link>
                ) : (
                  'No project'
                )}
              </dd>
            </div>
            <div>
              <dt>Created</dt>
              <dd>
                <time dateTime={task.createdAt}>{formatTimestamp(task.createdAt)}</time>
              </dd>
            </div>
            <div>
              <dt>Last updated</dt>
              <dd>
                <time dateTime={task.updatedAt}>{formatTimestamp(task.updatedAt)}</time>
              </dd>
            </div>
            {task.completedAt && (
              <div>
                <dt>Completed</dt>
                <dd>
                  <time dateTime={task.completedAt}>{formatTimestamp(task.completedAt)}</time>
                </dd>
              </div>
            )}
          </dl>
        </section>
      </div>

      <section className="task-activity" aria-labelledby="task-activity-heading">
        <div className="task-activity__heading">
          <div>
            <p className="page-eyebrow">Changes to this task</p>
            <h2 id="task-activity-heading">Activity</h2>
          </div>
          <span>{history.length}</span>
        </div>
        {history.length === 0 ? (
          <p className="task-detail-muted">Nothing has been recorded yet.</p>
        ) : (
          <ol className="task-activity__list">
            {history.map((item) => {
              const Icon =
                item.type === 'task-completed'
                  ? CircleCheck
                  : item.type === 'task-created'
                    ? Plus
                    : Pencil;
              return (
                <li key={item.id}>
                  <span aria-hidden="true">
                    <Icon size={16} strokeWidth={1.7} />
                  </span>
                  <p>{item.message}</p>
                  <time dateTime={item.createdAt} title={formatTimestamp(item.createdAt)}>
                    {formatTimestamp(item.createdAt)}
                  </time>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <TaskFormDialog
        open={formOpen}
        mode="edit"
        task={task}
        projects={data.projects}
        defaultStatus={data.preferences.defaultTaskStatus}
        onCancel={() => setFormOpen(false)}
        onSave={handleSave}
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

import { Check, CircleCheck, FolderPlus, Pencil, Plus, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ToastRegion, type ToastMessage } from '../../components/feedback/ToastRegion';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { InlineNotice } from '../../components/ui/InlineNotice';
import { useApp } from '../../state/AppProvider';
import type { Activity, Project, Task } from '../../types';
import { formatLocalDate, formatTimestamp, localDateNow } from '../../utils/dates';
import { DeleteTaskDialog } from './components/DeleteTaskDialog';
import { QuickAddDrawer } from './components/QuickAddDrawer';
import { TaskRow } from './components/TaskRow';
import { formatUpcomingGroup, projectToday } from './selectors';
import type { NewTaskFields } from './validation';
import './today.css';

function createId(kind: 'task' | 'activity'): string {
  const token =
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return `${kind}-${token}`;
}

function currentGreeting(hour = new Date().getHours()): string {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function TaskSection({
  title,
  tasks,
  projects,
  today,
  overdue = false,
  onToggleComplete,
  onDelete,
}: {
  title: string;
  tasks: Task[];
  projects: Map<string, Project>;
  today: string;
  overdue?: boolean;
  onToggleComplete: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  return (
    <section className={`today-section${overdue ? ' today-section--overdue' : ''}`}>
      <div className="today-section__heading">
        <h2>{title}</h2>
        <span className="today-section__count">{tasks.length}</span>
      </div>
      <ul className="today-task-list" aria-label={`${title} tasks`}>
        {tasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            project={task.projectId ? projects.get(task.projectId) : undefined}
            dateLabel={
              task.dueDate === today
                ? 'Due today'
                : task.dueDate
                  ? `Due ${formatLocalDate(task.dueDate)}`
                  : 'No due date'
            }
            overdue={overdue}
            onToggleComplete={onToggleComplete}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </section>
  );
}

function ProgressSummary({
  completed,
  remaining,
  percent,
}: {
  completed: number;
  remaining: number;
  percent: number;
}) {
  const total = completed + remaining;
  return (
    <section className="today-rail-section progress-summary" aria-labelledby="progress-heading">
      <p className="page-eyebrow">A clear measure</p>
      <h2 id="progress-heading">Today’s progress</h2>
      <p className="progress-summary__context">
        {total === 0
          ? 'There are no dated tasks on today’s list yet.'
          : `${percent}% of today’s work is complete.`}
      </p>
      <div
        className="progress-track"
        role="progressbar"
        aria-label="Today’s completion progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <span className="progress-track__value" style={{ width: `${percent}%` }} />
      </div>
      <dl className="progress-summary__counts">
        <div>
          <dt>Completed today</dt>
          <dd>{completed}</dd>
        </div>
        <div>
          <dt>Remaining today</dt>
          <dd>{remaining}</dd>
        </div>
      </dl>
    </section>
  );
}

function ActivitySection({ activity }: { activity: Activity[] }) {
  return (
    <section className="today-rail-section activity-section" aria-labelledby="activity-heading">
      <div className="today-rail-section__heading">
        <p className="page-eyebrow">Recent movement</p>
        <h2 id="activity-heading">Activity</h2>
      </div>
      {activity.length === 0 ? (
        <p className="activity-empty">Your latest task and project changes will appear here.</p>
      ) : (
        <ol className="activity-list">
          {activity.map((item) => {
            const Icon =
              item.type === 'task-completed'
                ? CircleCheck
                : item.type.includes('project')
                  ? FolderPlus
                  : Pencil;
            return (
              <li className="activity-item" key={item.id}>
                <span className="activity-item__mark" aria-hidden="true">
                  <Icon size={15} strokeWidth={1.7} />
                </span>
                <div className="activity-item__body">
                  <p>{item.message}</p>
                  <time dateTime={item.createdAt} title={formatTimestamp(item.createdAt)}>
                    {formatTimestamp(item.createdAt)}
                  </time>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

export function TodayPage() {
  const {
    data,
    updateData,
    persistenceStatus,
    storageMessage,
    recoveryMessage,
    retryPersistence,
    restoreSampleData,
  } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [pendingDeletion, setPendingDeletion] = useState<Task | null>(null);
  const today = localDateNow();
  const projection = useMemo(() => projectToday(data.tasks, today), [data.tasks, today]);
  const projectById = useMemo(
    () => new Map(data.projects.map((project) => [project.id, project])),
    [data.projects],
  );
  const recentActivity = useMemo(() => data.activity.slice(0, 5), [data.activity]);
  const quickAddOpen = searchParams.get('quick') === 'add';
  const openQuickAdd = () => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set('quick', 'add');
      return next;
    });
  };
  const closeQuickAdd = () => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.delete('quick');
        return next;
      },
      { replace: true },
    );
  };

  useEffect(() => {
    document.title = 'Today — Daymark';
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 5_000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleCreateTask = async (fields: NewTaskFields) => {
    const now = new Date().toISOString();
    const task: Task = {
      ...fields,
      id: createId('task'),
      description: '',
      status: data.preferences.defaultTaskStatus,
      createdAt: now,
      updatedAt: now,
      completedAt: null,
    };
    const activity: Activity = {
      id: createId('activity'),
      type: 'task-created',
      entityId: task.id,
      message: `Added ${task.title}`,
      createdAt: now,
    };
    updateData((current) => ({
      ...current,
      tasks: [task, ...current.tasks],
      activity: [activity, ...current.activity].slice(0, 100),
    }));
    setToast({
      message: 'Task added.',
      intent: 'success',
      icon: <Plus size={17} aria-hidden="true" />,
    });
  };

  const handleToggleComplete = (task: Task) => {
    if (task.status === 'completed') {
      const now = new Date().toISOString();
      const activity: Activity = {
        id: createId('activity'),
        type: 'task-updated',
        entityId: task.id,
        message: `Returned ${task.title} to active work`,
        createdAt: now,
      };
      updateData((current) => ({
        ...current,
        tasks: current.tasks.map((item) =>
          item.id === task.id
            ? { ...item, status: 'todo', completedAt: null, updatedAt: now }
            : item,
        ),
        activity: [activity, ...current.activity].slice(0, 100),
      }));
      setToast({ message: 'Task returned to active work.', intent: 'info' });
      return;
    }

    const previous = { ...task, tags: [...task.tags] };
    const now = new Date().toISOString();
    const activityId = createId('activity');
    const activity: Activity = {
      id: activityId,
      type: 'task-completed',
      entityId: task.id,
      message: `Completed ${task.title}`,
      createdAt: now,
    };
    updateData((current) => ({
      ...current,
      tasks: current.tasks.map((item) =>
        item.id === task.id
          ? { ...item, status: 'completed', completedAt: now, updatedAt: now }
          : item,
      ),
      activity: [activity, ...current.activity].slice(0, 100),
    }));
    setToast({
      message: 'Task completed.',
      intent: 'success',
      icon: <Check size={17} aria-hidden="true" />,
      actionLabel: 'Undo',
      onAction: () => {
        updateData((current) => ({
          ...current,
          tasks: current.tasks.map((item) => (item.id === previous.id ? previous : item)),
          activity: current.activity.filter((item) => item.id !== activityId),
        }));
        setToast({ message: 'Completion undone.', intent: 'info' });
      },
    });
  };

  const handleDeleteTask = () => {
    if (!pendingDeletion) return;
    const removedTask = { ...pendingDeletion, tags: [...pendingDeletion.tags] };
    const removedActivity = data.activity.filter((item) => item.entityId === pendingDeletion.id);
    const taskId = pendingDeletion.id;
    updateData((current) => ({
      ...current,
      tasks: current.tasks.filter((item) => item.id !== taskId),
      activity: current.activity.filter((item) => item.entityId !== taskId),
    }));
    setPendingDeletion(null);
    setToast({
      message: 'Task deleted.',
      intent: 'success',
      actionLabel: 'Undo',
      onAction: () => {
        updateData((current) => ({
          ...current,
          tasks: current.tasks.some((item) => item.id === removedTask.id)
            ? current.tasks
            : [removedTask, ...current.tasks],
          activity: [...removedActivity, ...current.activity]
            .filter(
              (item, index, list) =>
                list.findIndex((candidate) => candidate.id === item.id) === index,
            )
            .sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
        }));
        setToast({ message: 'Task restored.', intent: 'info' });
      },
    });
  };

  const saveRecoverySample = () => {
    restoreSampleData();
    setToast({ message: 'Sample data restored.', intent: 'info' });
  };

  const renderTask = (task: Task, dateLabel: string, overdue = false) => (
    <TaskRow
      key={task.id}
      task={task}
      project={task.projectId ? projectById.get(task.projectId) : undefined}
      dateLabel={dateLabel}
      overdue={overdue}
      onToggleComplete={handleToggleComplete}
      onDelete={setPendingDeletion}
    />
  );

  const noOpenDatedWork =
    projection.overdue.length === 0 &&
    projection.focus.length === 0 &&
    projection.upcoming.length === 0;

  return (
    <div className="page-scaffold today-page">
      <header className="today-header">
        <div>
          <p className="page-eyebrow">
            {formatLocalDate(today, { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1>Today, in focus</h1>
          <p className="page-description">
            {currentGreeting()}.{' '}
            {projection.focus.length === 0
              ? 'A clear starting point for the work in front of you.'
              : `${projection.focus.length} task${projection.focus.length === 1 ? '' : 's'} on the list for today.`}
          </p>
          <p className="today-header__counts" aria-live="polite">
            <span>{projection.focus.length} focus tasks</span>
            <span aria-hidden="true">·</span>
            <span>{projection.overdue.length} overdue</span>
          </p>
        </div>
        <Button
          variant="primary"
          size="medium"
          leadingIcon={<Plus size={17} strokeWidth={2} aria-hidden="true" />}
          onClick={openQuickAdd}
        >
          New task
        </Button>
      </header>

      {persistenceStatus === 'memory-only' && (
        <section className="today-error-state" aria-labelledby="today-storage-error-title">
          <span className="today-error-state__mark" aria-hidden="true">
            <Sparkles size={17} />
          </span>
          <div className="today-error-state__copy">
            <h2 id="today-storage-error-title">
              Your work is open, but this browser cannot save it.
            </h2>
            <p>{storageMessage ?? 'Changes will stay in memory until the page closes.'}</p>
          </div>
          <div className="today-error-state__actions">
            <Button size="small" variant="secondary" onClick={retryPersistence}>
              Retry saving
            </Button>
            <Button size="small" variant="quiet" onClick={saveRecoverySample}>
              Reset sample
            </Button>
          </div>
        </section>
      )}
      {recoveryMessage && persistenceStatus === 'available' && (
        <InlineNotice className="today-recovery-notice" intent="warning">
          <span>{recoveryMessage}</span>
          <button className="text-action" type="button" onClick={saveRecoverySample}>
            Restore sample data
          </button>
        </InlineNotice>
      )}

      <div className="today-layout">
        <div className="today-main">
          {projection.overdue.length > 0 && (
            <TaskSection
              title="Overdue"
              tasks={projection.overdue}
              projects={projectById}
              today={today}
              overdue
              onToggleComplete={handleToggleComplete}
              onDelete={setPendingDeletion}
            />
          )}

          {projection.focus.length > 0 ? (
            <TaskSection
              title="Focus for today"
              tasks={projection.focus}
              projects={projectById}
              today={today}
              onToggleComplete={handleToggleComplete}
              onDelete={setPendingDeletion}
            />
          ) : (
            <EmptyState
              className="today-empty-state"
              title={
                projection.overdue.length > 0
                  ? 'No tasks due today.'
                  : 'Nothing needs your attention today.'
              }
              description={
                projection.overdue.length > 0
                  ? 'The overdue work above is the only item asking for attention. Add something new if today needs another priority.'
                  : 'The day is open. Add one thing you would like to make room for.'
              }
              action={
                <Button
                  variant="secondary"
                  leadingIcon={<Plus size={16} aria-hidden="true" />}
                  onClick={openQuickAdd}
                >
                  Add a task for today
                </Button>
              }
            />
          )}

          {projection.upcoming.length > 0 && (
            <section className="today-section upcoming-section" aria-labelledby="upcoming-heading">
              <div className="today-section__heading">
                <div>
                  <p className="page-eyebrow">On the horizon</p>
                  <h2 id="upcoming-heading">Upcoming</h2>
                </div>
                <span className="today-section__count">
                  {projection.upcoming.reduce((total, group) => total + group.tasks.length, 0)}
                </span>
              </div>
              {projection.upcoming.map((group) => (
                <div className="upcoming-group" key={group.date}>
                  <h3>{formatUpcomingGroup(group.date, today)}</h3>
                  <ul
                    className="today-task-list"
                    aria-label={`${formatUpcomingGroup(group.date, today)} tasks`}
                  >
                    {group.tasks.map((task) =>
                      renderTask(task, `Due ${formatLocalDate(group.date)}`),
                    )}
                  </ul>
                </div>
              ))}
            </section>
          )}

          {data.preferences.showCompletedToday && projection.completedToday.length > 0 && (
            <section
              className="today-section completed-section"
              aria-labelledby="completed-heading"
            >
              <div className="today-section__heading">
                <h2 id="completed-heading">Completed today</h2>
                <span className="today-section__count">{projection.completedToday.length}</span>
              </div>
              <ul className="today-task-list" aria-label="Completed today tasks">
                {projection.completedToday.map((task) => renderTask(task, 'Completed today'))}
              </ul>
            </section>
          )}

          {noOpenDatedWork && !projection.completedToday.length && (
            <p className="today-quiet-note">
              Your completed work and recent activity remain below.
            </p>
          )}
        </div>

        <aside className="today-rail" aria-label="Today summary">
          <ProgressSummary
            completed={projection.completedCount}
            remaining={projection.remainingCount}
            percent={projection.completionPercent}
          />
          <ActivitySection activity={recentActivity} />
          <Link className="today-rail__all-work" to="/tasks">
            <span>Review all work</span>
            <span aria-hidden="true">→</span>
          </Link>
        </aside>
      </div>

      <QuickAddDrawer
        open={quickAddOpen}
        projects={data.projects}
        initialDueDate={today}
        onClose={closeQuickAdd}
        onSave={handleCreateTask}
      />
      <DeleteTaskDialog
        task={pendingDeletion}
        onCancel={() => setPendingDeletion(null)}
        onConfirm={handleDeleteTask}
      />
      <ToastRegion toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

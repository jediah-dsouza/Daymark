import { Archive, ArrowLeft, CircleCheck, FolderKanban, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ToastRegion, type ToastMessage } from '../../components/feedback/ToastRegion';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { useApp } from '../../state/AppProvider';
import type { Project, Task, TaskFilters } from '../../types';
import { formatTimestamp, localDateNow } from '../../utils/dates';
import { closeDisclosureOnEscape } from '../../utils/keyboard';
import { DeleteTaskDialog } from '../today/components/DeleteTaskDialog';
import { TaskRow } from '../today/components/TaskRow';
import {
  createTaskRecord,
  toggleTaskRecord,
  withCreatedTask,
  withRemovedTask,
  withRestoredTask,
  withUpdatedTask,
} from '../tasks/mutations';
import { DEFAULT_TASK_FILTERS, hasActiveTaskCriteria, taskDueDateLabel } from '../tasks/selectors';
import { TaskToolbar } from '../tasks/components/TaskToolbar';
import type { TaskFormFields } from '../tasks/validation';
import { DeleteProjectDialog } from './components/DeleteProjectDialog';
import { ProjectFormDialog } from './components/ProjectFormDialog';
import { ProjectTaskComposer } from './components/ProjectTaskComposer';
import { getProjectSummary, selectProjectActivity, selectProjectTasks } from './selectors';
import {
  updateProjectRecord,
  withArchivedProject,
  withRemovedProject,
  withUpdatedProject,
} from './mutations';
import type { ProjectFormFields } from './validation';
import './projects.css';

export function ProjectDetailPage() {
  const { projectId = '' } = useParams();
  const navigate = useNavigate();
  const { data, updateData } = useApp();
  const project = data.projects.find((item) => item.id === projectId);
  const [filters, setFilters] = useState<TaskFilters>({ ...DEFAULT_TASK_FILTERS });
  const searchRef = useRef<HTMLInputElement | null>(null);
  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const [pendingProjectDeletion, setPendingProjectDeletion] = useState<Project | null>(null);
  const [pendingTaskDeletion, setPendingTaskDeletion] = useState<Task | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const taskMatches = useMemo(
    () => selectProjectTasks(projectId, data.tasks, data.projects, filters),
    [projectId, data.tasks, data.projects, filters],
  );
  const projectTasks = useMemo(
    () => data.tasks.filter((task) => task.projectId === projectId),
    [projectId, data.tasks],
  );
  const summary = project ? getProjectSummary(project, data.tasks, data.activity) : null;
  const activity = useMemo(() => selectProjectActivity(projectId, data), [projectId, data]);

  useEffect(() => {
    document.title = `${project?.name ?? 'Project not found'} — Daymark`;
  }, [project?.name]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 5_000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const updateProject = async (fields: ProjectFormFields) => {
    if (!project) return;
    const updated = updateProjectRecord(project, fields);
    updateData((current) => withUpdatedProject(current, updated.project, updated.activity));
    setProjectFormOpen(false);
    setToast({ message: 'Project updated.', intent: 'success' });
  };

  const toggleArchive = () => {
    if (!project) return;
    const nextArchived = !project.archived;
    updateData((current) => withArchivedProject(current, project.id, nextArchived));
    setToast({
      message: nextArchived ? `${project.name} archived.` : `${project.name} restored.`,
      intent: 'success',
    });
  };

  const deleteProject = async () => {
    if (!pendingProjectDeletion) return;
    const result = withRemovedProject(data, pendingProjectDeletion.id);
    if (!result.removed) {
      setPendingProjectDeletion(null);
      setToast({ message: 'This project was already removed.', intent: 'error' });
      return;
    }
    updateData(() => result.data);
    setPendingProjectDeletion(null);
    navigate(`/projects?removed=${result.unassignedCount}`, { replace: true });
  };

  const createProjectTask = async (fields: TaskFormFields) => {
    const created = createTaskRecord(fields);
    updateData((current) => withCreatedTask(current, created.task, created.activity));
    setToast({ message: 'Task added to this project.', intent: 'success' });
  };

  const toggleTask = (task: Task) => {
    const previous = { ...task, tags: [...task.tags] };
    const updated = toggleTaskRecord(task);
    updateData((current) => withUpdatedTask(current, updated.task, updated.activity));
    if (task.status !== 'completed') {
      setToast({
        message: 'Task completed.',
        intent: 'success',
        actionLabel: 'Undo',
        onAction: () => {
          updateData((current) => ({
            ...current,
            tasks: current.tasks.map((item) => (item.id === previous.id ? previous : item)),
            activity: current.activity.filter((item) => item.id !== updated.activity.id),
          }));
          setToast({ message: 'Completion undone.', intent: 'info' });
        },
      });
    } else {
      setToast({ message: 'Task returned to active work.', intent: 'info' });
    }
  };

  const deleteTask = async () => {
    if (!pendingTaskDeletion) return;
    const result = withRemovedTask(data, pendingTaskDeletion.id);
    if (!result.removed) {
      setPendingTaskDeletion(null);
      setToast({ message: 'This task was already removed.', intent: 'error' });
      return;
    }
    const removed = result.removed;
    updateData(() => result.data);
    setPendingTaskDeletion(null);
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

  if (!project || !summary) {
    return (
      <div className="page-scaffold project-detail-page">
        <p className="page-eyebrow">Project detail</p>
        <EmptyState
          className="project-not-found"
          titleLevel={1}
          title="Project not found."
          description="This project may have been removed, or its address may be incomplete. Its tasks remain in your workspace."
          action={
            <Link className="button button--secondary button--medium" to="/projects">
              <ArrowLeft size={16} aria-hidden="true" />
              <span>Return to projects</span>
            </Link>
          }
        />
        <ToastRegion toast={toast} onDismiss={() => setToast(null)} />
        <DeleteProjectDialog
          project={pendingProjectDeletion}
          taskCount={
            pendingProjectDeletion
              ? data.tasks.filter((task) => task.projectId === pendingProjectDeletion.id).length
              : 0
          }
          onCancel={() => setPendingProjectDeletion(null)}
          onConfirm={deleteProject}
        />
      </div>
    );
  }

  const activeCriteria = hasActiveTaskCriteria(filters);
  const clearFilters = () =>
    setFilters((current) => ({ ...current, status: 'all', priority: 'all' }));
  const clearAll = () => setFilters({ ...DEFAULT_TASK_FILTERS });

  return (
    <div className="page-scaffold project-detail-page">
      <Link className="project-detail-back" to="/projects">
        <ArrowLeft size={16} aria-hidden="true" />
        <span>All projects</span>
      </Link>

      <header className="project-detail-header">
        <div className="project-detail-header__main">
          <div className="project-detail-title-row">
            <span className={`project-dot project-dot--${project.colorToken}`} aria-hidden="true" />
            <p className="page-eyebrow">
              {project.archived ? 'Archived project' : 'Project workspace'}
            </p>
          </div>
          <h1>{project.name}</h1>
          <p className="project-detail-header__description">
            {project.description || 'No description has been added.'}
          </p>
        </div>
        <div className="project-detail-header__actions">
          <Button
            variant="secondary"
            leadingIcon={<Pencil size={16} aria-hidden="true" />}
            onClick={() => setProjectFormOpen(true)}
          >
            Edit project
          </Button>
          <details className="project-detail-more" onKeyDown={closeDisclosureOnEscape}>
            <summary aria-label="More project actions" title="More project actions">
              <span aria-hidden="true">···</span>
            </summary>
            <div className="project-detail-more__menu" role="group" aria-label="Project actions">
              <button type="button" onClick={toggleArchive}>
                <Archive size={15} aria-hidden="true" />
                {project.archived ? 'Restore project' : 'Archive project'}
              </button>
              <button
                className="project-detail-more__delete"
                type="button"
                onClick={() => setPendingProjectDeletion(project)}
              >
                <Trash2 size={15} aria-hidden="true" /> Delete project
              </button>
            </div>
          </details>
        </div>
      </header>

      {project.archived && (
        <div className="project-archived-notice">
          <Archive size={16} aria-hidden="true" />
          <p>
            This project is archived. Its tasks and history are preserved; new tasks can’t be
            assigned here.
          </p>
          <Button variant="quiet" size="small" onClick={toggleArchive}>
            Restore project
          </Button>
        </div>
      )}

      <section className="project-progress-summary" aria-labelledby="project-progress-heading">
        <div className="project-progress-summary__title">
          <div>
            <p className="page-eyebrow">Progress from real work</p>
            <h2 id="project-progress-heading">Project progress</h2>
          </div>
          <span className="project-progress-summary__percent">{summary.completionPercent}%</span>
        </div>
        <div
          className="project-progress project-progress--large"
          role="progressbar"
          aria-label={`${project.name} completion`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={summary.completionPercent}
          aria-valuetext={`${summary.completedTasks} of ${summary.totalTasks} tasks complete`}
        >
          <span
            className={`project-progress__fill project-progress__fill--${project.colorToken}`}
            style={{ width: `${summary.completionPercent}%` }}
          />
        </div>
        <dl className="project-progress-summary__counts">
          <div>
            <dt>Completed</dt>
            <dd>{summary.completedTasks}</dd>
          </div>
          <div>
            <dt>Open</dt>
            <dd>{summary.openTasks}</dd>
          </div>
          <div>
            <dt>All tasks</dt>
            <dd>{summary.totalTasks}</dd>
          </div>
          <div>
            <dt>Updated</dt>
            <dd>
              <time dateTime={summary.lastUpdatedAt}>{formatTimestamp(summary.lastUpdatedAt)}</time>
            </dd>
          </div>
        </dl>
      </section>

      <section className="project-task-section" aria-labelledby="project-task-heading">
        <div className="project-task-section__heading">
          <div>
            <p className="page-eyebrow">Work in this project</p>
            <h2 id="project-task-heading">
              Tasks <span>{projectTasks.length}</span>
            </h2>
          </div>
          {!project.archived && (
            <ProjectTaskComposer
              project={project}
              projects={data.projects}
              defaultStatus={data.preferences.defaultTaskStatus}
              onCreate={createProjectTask}
            />
          )}
        </div>

        {project.archived ? (
          <div className="project-task-archive-note">
            <p>Task assignments are unchanged. Restore this project to add new work.</p>
          </div>
        ) : null}

        <TaskToolbar
          filters={filters}
          projects={data.projects}
          searchRef={searchRef}
          onChange={(patch) =>
            setFilters((current) => ({ ...current, ...patch, projectId: 'all' }))
          }
          onClearFilters={clearFilters}
          onClearAll={clearAll}
          showProjectFilter={false}
        />

        {projectTasks.length === 0 && !activeCriteria ? (
          <EmptyState
            className="project-tasks-empty"
            title="No tasks in this project yet."
            description={
              project.archived
                ? 'This archived project has no remaining task history.'
                : 'Use the task composer above to start a focused list. Progress appears here as work is completed.'
            }
          />
        ) : taskMatches.length === 0 ? (
          <EmptyState
            className="project-tasks-empty"
            title="No tasks match those filters."
            description="Clear the search or filters to see the project’s full task list."
            action={
              <Button variant="secondary" onClick={clearAll}>
                Clear search and filters
              </Button>
            }
          />
        ) : (
          <>
            {activeCriteria && (
              <p className="project-task-results" aria-live="polite">
                {taskMatches.length} of {projectTasks.length} tasks shown
              </p>
            )}
            <ul className="project-task-list" aria-label={`${project.name} tasks`}>
              {taskMatches.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  project={project}
                  dateLabel={taskDueDateLabel(task.dueDate)}
                  overdue={Boolean(
                    task.dueDate && task.dueDate < localDateNow() && task.status !== 'completed',
                  )}
                  showStatus
                  showProject={false}
                  onToggleComplete={toggleTask}
                  onDelete={setPendingTaskDeletion}
                />
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="project-activity" aria-labelledby="project-activity-heading">
        <div className="project-activity__heading">
          <div>
            <p className="page-eyebrow">Changes across this work</p>
            <h2 id="project-activity-heading">Project activity</h2>
          </div>
          <span>{activity.length}</span>
        </div>
        {activity.length === 0 ? (
          <p className="project-muted">No activity has been recorded yet.</p>
        ) : (
          <ol className="project-activity__list">
            {activity.map((item) => {
              const Icon =
                item.type === 'task-completed'
                  ? CircleCheck
                  : item.type === 'task-created'
                    ? Plus
                    : item.type === 'project-created'
                      ? FolderKanban
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

      <ProjectFormDialog
        open={projectFormOpen}
        mode="edit"
        project={project}
        onCancel={() => setProjectFormOpen(false)}
        onSave={updateProject}
      />
      <DeleteProjectDialog
        project={pendingProjectDeletion}
        taskCount={
          data.tasks.filter((task) => task.projectId === pendingProjectDeletion?.id).length
        }
        onCancel={() => setPendingProjectDeletion(null)}
        onConfirm={deleteProject}
      />
      <DeleteTaskDialog
        task={pendingTaskDeletion}
        onCancel={() => setPendingTaskDeletion(null)}
        onConfirm={deleteTask}
      />
      <ToastRegion toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

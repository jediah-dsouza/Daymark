import { Check, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Project, Task } from '../../../types';
import { closeDisclosureOnEscape } from '../../../utils/keyboard';

export interface TaskRowProps {
  task: Task;
  project?: Project;
  dateLabel: string;
  overdue?: boolean;
  showStatus?: boolean;
  showProject?: boolean;
  onToggleComplete: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const priorityLabel: Record<Task['priority'], string> = {
  none: 'No priority',
  low: 'Low priority',
  medium: 'Medium priority',
  high: 'High priority',
};

const statusLabel: Record<Task['status'], string> = {
  inbox: 'Inbox',
  todo: 'To do',
  'in-progress': 'In progress',
  completed: 'Completed',
};

export function TaskRow({
  task,
  project,
  dateLabel,
  overdue = false,
  showStatus = false,
  showProject = true,
  onToggleComplete,
  onDelete,
}: TaskRowProps) {
  const completed = task.status === 'completed';
  return (
    <li className={`task-row${completed ? ' task-row--completed' : ''}`}>
      <button
        className="task-row__completion"
        type="button"
        aria-pressed={completed}
        aria-label={completed ? `Mark ${task.title} incomplete` : `Complete ${task.title}`}
        title={completed ? 'Mark incomplete' : 'Complete task'}
        onClick={() => onToggleComplete(task)}
      >
        {completed && <Check size={14} strokeWidth={2.2} aria-hidden="true" />}
      </button>
      <div className="task-row__body">
        <h3 className="task-row__title" title={task.title}>
          <Link to={`/tasks/${task.id}`}>{task.title}</Link>
        </h3>
        <div className="task-row__metadata">
          {showStatus && (
            <span className={`task-status task-status--${task.status}`}>
              <span className="task-status__mark" aria-hidden="true" />
              {statusLabel[task.status]}
            </span>
          )}
          <span className={`priority-label priority-label--${task.priority}`}>
            <span className="priority-label__mark" aria-hidden="true" />
            {priorityLabel[task.priority]}
          </span>
          <span className={overdue ? 'task-row__due task-row__due--overdue' : 'task-row__due'}>
            {dateLabel}
          </span>
          {showProject &&
            (project ? (
              <Link className="task-row__project" to={`/projects/${project.id}`}>
                <span
                  className={`project-dot project-dot--${project.colorToken}`}
                  aria-hidden="true"
                />
                {project.name}
              </Link>
            ) : (
              <span className="task-row__project task-row__project--none">No project</span>
            ))}
        </div>
        {task.tags.length > 0 && (
          <ul className="task-row__tags" aria-label="Task tags">
            {task.tags.map((tag) => (
              <li key={`${task.id}-${tag}`}>{tag}</li>
            ))}
          </ul>
        )}
      </div>
      <details className="task-row__actions" onKeyDown={closeDisclosureOnEscape}>
        <summary aria-label={`More actions for ${task.title}`} title="More actions">
          <MoreHorizontal size={19} aria-hidden="true" />
        </summary>
        <div
          className="task-row__action-list"
          role="group"
          aria-label={`Actions for ${task.title}`}
        >
          <Link to={`/tasks/${task.id}`}>View details</Link>
          <Link to={`/tasks/${task.id}?edit=1`}>Edit task</Link>
          <button type="button" onClick={() => onToggleComplete(task)}>
            {completed ? 'Mark incomplete' : 'Mark complete'}
          </button>
          <button className="task-row__delete-action" type="button" onClick={() => onDelete(task)}>
            Delete task
          </button>
        </div>
      </details>
    </li>
  );
}

import { Archive, ChevronRight, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Project } from '../../../types';
import { formatTimestamp } from '../../../utils/dates';
import { closeDisclosureOnEscape } from '../../../utils/keyboard';
import type { ProjectSummary } from '../selectors';

export function ProjectCard({
  project,
  summary,
  onEdit,
  onArchive,
  onDelete,
}: {
  project: Project;
  summary: ProjectSummary;
  onEdit: (project: Project) => void;
  onArchive: (project: Project) => void;
  onDelete: (project: Project) => void;
}) {
  return (
    <article className={`project-card project-card--${project.colorToken}`}>
      <div className="project-card__heading">
        <div className="project-card__identity">
          <span className={`project-dot project-dot--${project.colorToken}`} aria-hidden="true" />
          <Link className="project-card__open" to={`/projects/${project.id}`}>
            <span className="project-card__eyebrow">
              {project.archived ? 'Archived project' : 'Project'}
            </span>
            <h2>{project.name}</h2>
          </Link>
        </div>
        <details className="project-card__actions" onKeyDown={closeDisclosureOnEscape}>
          <summary aria-label={`More actions for ${project.name}`} title="More project actions">
            <MoreHorizontal size={19} aria-hidden="true" />
          </summary>
          <div
            className="project-card__menu"
            role="group"
            aria-label={`Actions for ${project.name}`}
          >
            <button type="button" onClick={() => onEdit(project)}>
              <Pencil size={15} aria-hidden="true" /> Edit project
            </button>
            <button type="button" onClick={() => onArchive(project)}>
              <Archive size={15} aria-hidden="true" />
              {project.archived ? 'Restore project' : 'Archive project'}
            </button>
            <button
              className="project-card__delete"
              type="button"
              onClick={() => onDelete(project)}
            >
              <Trash2 size={15} aria-hidden="true" /> Delete project
            </button>
          </div>
        </details>
      </div>

      <p className="project-card__description">
        {project.description || 'No description has been added.'}
      </p>
      <div className="project-card__progress-heading">
        <span>
          {summary.completedTasks} of {summary.totalTasks} tasks complete
        </span>
        <span>{summary.completionPercent}%</span>
      </div>
      <div
        className="project-progress"
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
      <footer className="project-card__footer">
        <span>{summary.openTasks} open</span>
        <span>
          Updated{' '}
          <time dateTime={summary.lastUpdatedAt}>{formatTimestamp(summary.lastUpdatedAt)}</time>
        </span>
        <Link to={`/projects/${project.id}`} aria-label={`Open ${project.name}`}>
          Open <ChevronRight size={15} aria-hidden="true" />
        </Link>
      </footer>
    </article>
  );
}

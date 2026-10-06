import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { ToastRegion, type ToastMessage } from '../../components/feedback/ToastRegion';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { useApp } from '../../state/AppProvider';
import type { Project } from '../../types';
import { DeleteProjectDialog } from './components/DeleteProjectDialog';
import { ProjectCard } from './components/ProjectCard';
import { ProjectFormDialog } from './components/ProjectFormDialog';
import {
  createProjectRecord,
  updateProjectRecord,
  withArchivedProject,
  withCreatedProject,
  withRemovedProject,
  withUpdatedProject,
} from './mutations';
import { getProjectSummary, selectProjects } from './selectors';
import type { ProjectFormFields } from './validation';
import './projects.css';

export function ProjectsPage() {
  const { data, updateData } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showArchived, setShowArchived] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [pendingDeletion, setPendingDeletion] = useState<Project | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [focusView, setFocusView] = useState<'active' | 'archived' | null>(null);
  const activeViewRef = useRef<HTMLButtonElement>(null);
  const archivedViewRef = useRef<HTMLButtonElement>(null);
  const visibleProjects = useMemo(
    () => selectProjects(data.projects, showArchived),
    [data.projects, showArchived],
  );
  const activeCount = data.projects.filter((project) => !project.archived).length;
  const archivedCount = data.projects.length - activeCount;

  useEffect(() => {
    document.title = 'Projects — Daymark';
  }, []);

  useEffect(() => {
    if (!focusView) return;
    (focusView === 'active' ? activeViewRef.current : archivedViewRef.current)?.focus({
      preventScroll: true,
    });
    setFocusView(null);
  }, [focusView]);

  useEffect(() => {
    if (!searchParams.has('removed')) return;
    const count = Number(searchParams.get('removed')) || 0;
    setToast({
      message: `Project deleted. ${count} ${count === 1 ? 'task was' : 'tasks were'} kept and unassigned.`,
      intent: 'success',
    });
    const next = new URLSearchParams(searchParams);
    next.delete('removed');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 5_000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleSave = async (fields: ProjectFormFields) => {
    if (editingProject) {
      const updated = updateProjectRecord(editingProject, fields);
      updateData((current) => withUpdatedProject(current, updated.project, updated.activity));
      setToast({ message: 'Project updated.', intent: 'success' });
    } else {
      const created = createProjectRecord(fields);
      updateData((current) => withCreatedProject(current, created.project, created.activity));
      setShowArchived(false);
      setToast({ message: 'Project created.', intent: 'success' });
    }
    setFormOpen(false);
    setEditingProject(null);
  };

  const handleArchive = (project: Project) => {
    const nextArchived = !project.archived;
    updateData((current) => withArchivedProject(current, project.id, nextArchived));
    setFocusView(showArchived ? 'archived' : 'active');
    setToast({
      message: nextArchived ? `${project.name} archived.` : `${project.name} restored.`,
      intent: 'success',
    });
  };

  const handleDelete = async () => {
    if (!pendingDeletion) return;
    const result = withRemovedProject(data, pendingDeletion.id);
    if (!result.removed) {
      setPendingDeletion(null);
      setToast({ message: 'This project was already removed.', intent: 'error' });
      return;
    }
    updateData(() => result.data);
    setPendingDeletion(null);
    setToast({
      message: `Project deleted. ${result.unassignedCount} ${result.unassignedCount === 1 ? 'task was' : 'tasks were'} kept and unassigned.`,
      intent: 'success',
    });
  };

  const openCreate = () => {
    setEditingProject(null);
    setFormOpen(true);
  };

  const openEdit = (project: Project) => {
    setEditingProject(project);
    setFormOpen(true);
  };

  return (
    <div className="page-scaffold projects-page">
      <header className="projects-header">
        <div>
          <p className="page-eyebrow">Your work, in context</p>
          <h1>Projects</h1>
          <p className="page-description">
            Group related work and follow progress made by the tasks themselves.
          </p>
        </div>
        <div className="projects-header__actions">
          <span className="projects-header__count" aria-live="polite">
            {showArchived ? `${archivedCount} archived` : `${activeCount} active`}
          </span>
          <Button
            variant="primary"
            leadingIcon={<Plus size={16} aria-hidden="true" />}
            onClick={openCreate}
          >
            New project
          </Button>
        </div>
      </header>

      <div className="project-views" role="group" aria-label="Project view">
        <button
          ref={activeViewRef}
          type="button"
          className={`project-views__button${!showArchived ? ' is-current' : ''}`}
          aria-pressed={!showArchived}
          onClick={() => setShowArchived(false)}
        >
          Active <span>{activeCount}</span>
        </button>
        <button
          ref={archivedViewRef}
          type="button"
          className={`project-views__button${showArchived ? ' is-current' : ''}`}
          aria-pressed={showArchived}
          onClick={() => setShowArchived(true)}
        >
          Archived <span>{archivedCount}</span>
        </button>
      </div>

      {visibleProjects.length === 0 ? (
        <EmptyState
          className="projects-empty-state"
          title={showArchived ? 'No archived projects' : 'Nothing grouped yet.'}
          description={
            showArchived
              ? 'Projects you archive will stay here, with their task history intact.'
              : 'Create a project when a few tasks belong together. You can keep working without one, too.'
          }
          action={
            showArchived ? undefined : (
              <Button
                variant="secondary"
                leadingIcon={<Plus size={16} aria-hidden="true" />}
                onClick={openCreate}
              >
                Create your first project
              </Button>
            )
          }
        />
      ) : (
        <section
          className="project-grid"
          aria-label={showArchived ? 'Archived projects' : 'Active projects'}
        >
          {visibleProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              summary={getProjectSummary(project, data.tasks, data.activity)}
              onEdit={openEdit}
              onArchive={handleArchive}
              onDelete={setPendingDeletion}
            />
          ))}
        </section>
      )}

      <ProjectFormDialog
        open={formOpen}
        mode={editingProject ? 'edit' : 'create'}
        project={editingProject}
        onCancel={() => {
          setFormOpen(false);
          setEditingProject(null);
        }}
        onSave={handleSave}
      />
      <DeleteProjectDialog
        project={pendingDeletion}
        taskCount={
          pendingDeletion
            ? data.tasks.filter((task) => task.projectId === pendingDeletion.id).length
            : 0
        }
        onCancel={() => setPendingDeletion(null)}
        onConfirm={handleDelete}
      />
      <ToastRegion toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

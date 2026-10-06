import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Plus, X } from 'lucide-react';
import type { Project, TaskStatus } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { IconButton } from '../../../components/ui/IconButton';
import { InlineNotice } from '../../../components/ui/InlineNotice';
import { SelectField } from '../../../components/ui/SelectField';
import { TextField } from '../../../components/ui/TextField';
import {
  emptyTaskDraft,
  validateTaskForm,
  type TaskFormDraft,
  type TaskFormFields,
  type TaskFormErrors,
} from '../../tasks/validation';
import { TASK_PRIORITY_LABELS } from '../../tasks/selectors';

const priorityOptions = Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export function ProjectTaskComposer({
  project,
  projects,
  defaultStatus,
  onCreate,
}: {
  project: Project;
  projects: Project[];
  defaultStatus: TaskStatus;
  onCreate: (fields: TaskFormFields) => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<TaskFormDraft>(() => ({
    ...emptyTaskDraft(defaultStatus),
    projectId: project.id,
  }));
  const [errors, setErrors] = useState<TaskFormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const savingRef = useRef(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (open) {
      wasOpenRef.current = true;
      document.getElementById('project-task-title')?.focus({ preventScroll: true });
    } else if (wasOpenRef.current) {
      wasOpenRef.current = false;
      triggerRef.current?.focus({ preventScroll: true });
    }
  }, [open]);

  const updateField = (field: 'title' | 'priority' | 'dueDate', value: string) => {
    const next = { ...draft, [field]: value };
    setDraft(next);
    setFormError(null);
    if (submitted) setErrors(validateTaskForm(next, projects).errors);
  };

  const closeComposer = () => {
    setOpen(false);
    setErrors({});
    setSubmitted(false);
    setFormError(null);
    setDraft({ ...emptyTaskDraft(defaultStatus), projectId: project.id });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (savingRef.current) return;
    const result = validateTaskForm(draft, projects);
    setSubmitted(true);
    setErrors(result.errors);
    if (!result.value) {
      const firstInvalidId = result.errors.title
        ? 'project-task-title'
        : result.errors.dueDate
          ? 'project-task-due-date'
          : null;
      if (firstInvalidId) document.getElementById(firstInvalidId)?.focus({ preventScroll: true });
      return;
    }
    savingRef.current = true;
    setSaving(true);
    setFormError(null);
    try {
      await onCreate(result.value as TaskFormFields);
      closeComposer();
    } catch {
      setFormError('Your task could not be saved. Your entries are still here. Try again.');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key !== 'Escape' || saving) return;
    event.preventDefault();
    event.stopPropagation();
    closeComposer();
  };

  return (
    <section className="project-task-composer" aria-label="Add a project task">
      <button
        ref={triggerRef}
        type="button"
        className={`button button--${open ? 'secondary' : 'primary'} button--medium`}
        aria-expanded={open}
        aria-controls="project-task-composer-form"
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <X size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
        <span>{open ? 'Close composer' : 'Add a task'}</span>
      </button>
      {open && (
        <form
          id="project-task-composer-form"
          className="project-task-composer__form"
          noValidate
          onSubmit={handleSubmit}
          onKeyDown={handleKeyDown}
        >
          <div className="project-task-composer__intro">
            <div>
              <p className="page-eyebrow">A note for this project</p>
              <h2>New task</h2>
            </div>
            <IconButton
              label="Close task composer"
              title="Close task composer"
              variant="quiet"
              icon={<X size={17} aria-hidden="true" />}
              disabled={saving}
              onClick={closeComposer}
            />
          </div>
          <p className="project-task-composer__assignment">
            This task will be assigned to <strong>{project.name}</strong>.
          </p>
          {formError && <InlineNotice intent="danger">{formError}</InlineNotice>}
          <TextField
            id="project-task-title"
            label="Task name"
            required
            autoComplete="off"
            value={draft.title}
            error={errors.title}
            onChange={(event) => updateField('title', event.target.value)}
            placeholder="What needs to move forward?"
          />
          <div className="project-task-composer__fields">
            <SelectField
              id="project-task-priority"
              label="Priority"
              options={priorityOptions}
              value={draft.priority}
              error={errors.priority}
              onChange={(event) => updateField('priority', event.target.value)}
            />
            <TextField
              id="project-task-due-date"
              label="Due date"
              type="date"
              value={draft.dueDate}
              error={errors.dueDate}
              hint="Optional · past dates are allowed."
              onChange={(event) => updateField('dueDate', event.target.value)}
            />
          </div>
          <p className="project-task-composer__note">
            Starts as {defaultStatus === 'inbox' ? 'Inbox' : 'To do'} · add a description or tags
            from the task details.
          </p>
          <div className="project-task-composer__actions">
            <Button variant="secondary" disabled={saving} onClick={closeComposer}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              Add task
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}

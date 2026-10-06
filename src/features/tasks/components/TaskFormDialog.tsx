import { useEffect, useRef, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { Project, Task, TaskStatus } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { IconButton } from '../../../components/ui/IconButton';
import { InlineNotice } from '../../../components/ui/InlineNotice';
import { NativeDialog } from '../../../components/ui/NativeDialog';
import { SelectField } from '../../../components/ui/SelectField';
import { TextAreaField } from '../../../components/ui/TextAreaField';
import { TextField } from '../../../components/ui/TextField';
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from '../selectors';
import {
  emptyTaskDraft,
  taskToDraft,
  validateTaskForm,
  type TaskFormDraft,
  type TaskFormErrors,
  type TaskFormField,
  type TaskFormFields,
} from '../validation';

const fieldIds: Record<TaskFormField, string> = {
  title: 'task-form-title',
  description: 'task-form-description-field',
  status: 'task-form-status',
  priority: 'task-form-priority',
  dueDate: 'task-form-due-date',
  projectId: 'task-form-project',
  tags: 'task-form-tags',
};

const statusOptions = (Object.entries(TASK_STATUS_LABELS) as [TaskStatus, string][]).map(
  ([value, label]) => ({ value, label }),
);
const priorityOptions = Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export interface TaskFormDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  task: Task | null;
  projects: Project[];
  defaultStatus: TaskStatus;
  onCancel: () => void;
  onSave: (fields: TaskFormFields) => void | Promise<void>;
}

export function TaskFormDialog({
  open,
  mode,
  task,
  projects,
  defaultStatus,
  onCancel,
  onSave,
}: TaskFormDialogProps) {
  const [draft, setDraft] = useState<TaskFormDraft>(() =>
    task ? taskToDraft(task) : emptyTaskDraft(defaultStatus),
  );
  const [errors, setErrors] = useState<TaskFormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [focusField, setFocusField] = useState<TaskFormField | null>(null);
  const savingRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    setDraft(task ? taskToDraft(task) : emptyTaskDraft(defaultStatus));
    setErrors({});
    setSubmitted(false);
    setSaving(false);
    setFormError(null);
    setFocusField(null);
    savingRef.current = false;
  }, [open, task?.id, defaultStatus]);

  useEffect(() => {
    if (!open || !focusField) return;
    document.getElementById(fieldIds[focusField])?.focus({ preventScroll: true });
    setFocusField(null);
  }, [open, focusField, errors]);

  const updateField = <Field extends TaskFormField>(field: Field, value: TaskFormDraft[Field]) => {
    const nextDraft = { ...draft, [field]: value };
    setDraft(nextDraft);
    setFormError(null);
    if (submitted) setErrors(validateTaskForm(nextDraft, projects).errors);
  };

  const handleBlur = () => {
    if (submitted) setErrors(validateTaskForm(draft, projects).errors);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (savingRef.current) return;
    const result = validateTaskForm(draft, projects);
    setSubmitted(true);
    setErrors(result.errors);
    if (!result.value) {
      setFocusField((Object.keys(result.errors)[0] as TaskFormField | undefined) ?? 'title');
      return;
    }

    savingRef.current = true;
    setSaving(true);
    setFormError(null);
    try {
      await onSave(result.value as TaskFormFields);
    } catch {
      setFormError('Your task could not be saved. Your entries are still here. Try again.');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const availableProjects = projects
    .filter((project) => !project.archived || project.id === task?.projectId)
    .map((project) => ({
      value: project.id,
      label: `${project.name}${project.archived ? ' (archived)' : ''}`,
    }));

  return (
    <NativeDialog
      open={open}
      className="task-form-dialog"
      labelledBy="task-form-heading"
      describedBy="task-form-dialog-description"
      initialFocusSelector={`#${fieldIds.title}`}
      onRequestClose={() => {
        if (!saving) onCancel();
      }}
    >
      <header className="task-form-dialog__header">
        <div>
          <p className="page-eyebrow">{mode === 'create' ? 'Capture work' : 'Task details'}</p>
          <h2 id="task-form-heading">{mode === 'create' ? 'New task' : 'Edit task'}</h2>
          <p id="task-form-dialog-description">
            {mode === 'create'
              ? 'Give the work a clear name. Add context and a date when useful.'
              : 'Update the task details. Your changes are saved in this browser.'}
          </p>
        </div>
        <IconButton
          label="Close task form"
          title="Close task form"
          icon={<X size={18} aria-hidden="true" />}
          disabled={saving}
          onClick={onCancel}
        />
      </header>

      <form className="task-form" noValidate onSubmit={handleSubmit}>
        <div className="task-form__fields">
          {formError && <InlineNotice intent="danger">{formError}</InlineNotice>}
          <TextField
            id={fieldIds.title}
            label="Task name"
            required
            autoComplete="off"
            value={draft.title}
            error={errors.title}
            onBlur={handleBlur}
            onChange={(event) => updateField('title', event.target.value)}
            placeholder="e.g. Send the finished portfolio review"
          />
          <TextAreaField
            id={fieldIds.description}
            label="Description"
            rows={4}
            value={draft.description}
            hint="Optional context, links, or a few useful next steps. Up to 2,000 characters."
            error={errors.description}
            onBlur={handleBlur}
            onChange={(event) => updateField('description', event.target.value)}
            placeholder="Add details that will help you pick this up later."
          />
          <div className="task-form__field-row">
            <SelectField
              id={fieldIds.status}
              label="Status"
              options={statusOptions}
              value={draft.status}
              error={errors.status}
              onBlur={handleBlur}
              onChange={(event) => updateField('status', event.target.value)}
            />
            <SelectField
              id={fieldIds.priority}
              label="Priority"
              options={priorityOptions}
              value={draft.priority}
              error={errors.priority}
              onBlur={handleBlur}
              onChange={(event) => updateField('priority', event.target.value)}
            />
          </div>
          <div className="task-form__field-row">
            <TextField
              id={fieldIds.dueDate}
              label="Due date"
              type="date"
              value={draft.dueDate}
              error={errors.dueDate}
              hint="YYYY-MM-DD. Past dates are allowed."
              onBlur={handleBlur}
              onChange={(event) => updateField('dueDate', event.target.value)}
            />
            <SelectField
              id={fieldIds.projectId}
              label="Project"
              placeholder="No project"
              options={availableProjects}
              value={draft.projectId}
              error={errors.projectId}
              onBlur={handleBlur}
              onChange={(event) => updateField('projectId', event.target.value)}
            />
          </div>
          <TextField
            id={fieldIds.tags}
            label="Tags"
            value={draft.tags}
            hint="Separate tags with commas. Up to 8 tags; 24 characters each."
            error={errors.tags}
            onBlur={handleBlur}
            onChange={(event) => updateField('tags', event.target.value)}
            placeholder="writing, research"
          />
        </div>
        <footer className="task-form__footer">
          <span className="task-form__hint">Enter to save · Esc to close</span>
          <div className="task-form__actions">
            <Button variant="secondary" disabled={saving} onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              {mode === 'create' ? 'Create task' : 'Save changes'}
            </Button>
          </div>
        </footer>
      </form>
    </NativeDialog>
  );
}

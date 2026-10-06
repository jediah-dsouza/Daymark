import { useEffect, useRef, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { Project } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { IconButton } from '../../../components/ui/IconButton';
import { InlineNotice } from '../../../components/ui/InlineNotice';
import { NativeDialog } from '../../../components/ui/NativeDialog';
import { TextAreaField } from '../../../components/ui/TextAreaField';
import { TextField } from '../../../components/ui/TextField';
import {
  emptyProjectDraft,
  PROJECT_COLOR_OPTIONS,
  validateProjectForm,
  type ProjectFormDraft,
  type ProjectFormErrors,
  type ProjectFormField,
  type ProjectFormFields,
} from '../validation';

const fieldIds: Record<ProjectFormField, string> = {
  name: 'project-form-name',
  description: 'project-form-description-field',
  colorToken: 'project-form-color',
};

export function ProjectFormDialog({
  open,
  mode,
  project,
  onCancel,
  onSave,
}: {
  open: boolean;
  mode: 'create' | 'edit';
  project: Project | null;
  onCancel: () => void;
  onSave: (fields: ProjectFormFields) => void | Promise<void>;
}) {
  const [draft, setDraft] = useState<ProjectFormDraft>(() => emptyProjectDraft(project));
  const [errors, setErrors] = useState<ProjectFormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [focusField, setFocusField] = useState<ProjectFormField | null>(null);
  const savingRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    setDraft(emptyProjectDraft(project));
    setErrors({});
    setSubmitted(false);
    setSaving(false);
    setFormError(null);
    setFocusField(null);
    savingRef.current = false;
  }, [open, project?.id]);

  useEffect(() => {
    if (!open || !focusField) return;
    document.getElementById(fieldIds[focusField])?.focus({ preventScroll: true });
    setFocusField(null);
  }, [open, focusField, errors]);

  const updateField = <Field extends ProjectFormField>(
    field: Field,
    value: ProjectFormDraft[Field],
  ) => {
    const nextDraft = { ...draft, [field]: value };
    setDraft(nextDraft);
    setFormError(null);
    if (submitted) setErrors(validateProjectForm(nextDraft).errors);
  };

  const handleBlur = () => {
    if (submitted) setErrors(validateProjectForm(draft).errors);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (savingRef.current) return;
    const result = validateProjectForm(draft);
    setSubmitted(true);
    setErrors(result.errors);
    if (!result.value) {
      setFocusField((Object.keys(result.errors)[0] as ProjectFormField | undefined) ?? 'name');
      return;
    }

    savingRef.current = true;
    setSaving(true);
    setFormError(null);
    try {
      await onSave(result.value);
    } catch {
      setFormError('Your project could not be saved. Your entries are still here. Try again.');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <NativeDialog
      open={open}
      className="project-form-dialog"
      labelledBy="project-form-heading"
      describedBy="project-form-dialog-description"
      initialFocusSelector={`#${fieldIds.name}`}
      onRequestClose={() => {
        if (!saving) onCancel();
      }}
    >
      <header className="project-form-dialog__header">
        <div>
          <p className="page-eyebrow">Organize your work</p>
          <h2 id="project-form-heading">{mode === 'create' ? 'New project' : 'Edit project'}</h2>
          <p id="project-form-dialog-description">
            Give related work a clear home. Tasks stay in your workspace if this project is removed.
          </p>
        </div>
        <IconButton
          label="Close project form"
          title="Close project form"
          icon={<X size={18} aria-hidden="true" />}
          disabled={saving}
          onClick={onCancel}
        />
      </header>

      <form className="project-form" noValidate onSubmit={handleSubmit}>
        {formError && <InlineNotice intent="danger">{formError}</InlineNotice>}
        <TextField
          id={fieldIds.name}
          label="Project name"
          required
          autoComplete="off"
          value={draft.name}
          error={errors.name}
          hint="Use 2–60 characters."
          onBlur={handleBlur}
          onChange={(event) => updateField('name', event.target.value)}
          placeholder="e.g. Spring research notes"
        />
        <TextAreaField
          id={fieldIds.description}
          label="Description"
          rows={3}
          value={draft.description}
          error={errors.description}
          hint="Optional context, up to 300 characters."
          onBlur={handleBlur}
          onChange={(event) => updateField('description', event.target.value)}
          placeholder="What belongs in this project?"
        />
        <fieldset
          className="project-color-fieldset"
          aria-describedby={errors.colorToken ? 'project-form-color-error' : undefined}
        >
          <legend>Project color</legend>
          <div className="project-color-options">
            {PROJECT_COLOR_OPTIONS.map((option) => (
              <label className="project-color-option" key={option.value}>
                <input
                  id={`${fieldIds.colorToken}-${option.value}`}
                  type="radio"
                  name={fieldIds.colorToken}
                  value={option.value}
                  checked={draft.colorToken === option.value}
                  onBlur={handleBlur}
                  onChange={() => updateField('colorToken', option.value)}
                />
                <span
                  className={`project-color-option__swatch project-dot--${option.value}`}
                  aria-hidden="true"
                />
                <span className="project-color-option__copy">
                  <span>{option.label}</span>
                  <span>{option.description}</span>
                </span>
              </label>
            ))}
          </div>
          {errors.colorToken && (
            <p id="project-form-color-error" className="field__error" role="alert">
              {errors.colorToken}
            </p>
          )}
        </fieldset>
        <footer className="project-form__footer">
          <span className="project-form__hint">Escape to close</span>
          <div className="project-form__actions">
            <Button variant="secondary" disabled={saving} onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              {mode === 'create' ? 'Create project' : 'Save changes'}
            </Button>
          </div>
        </footer>
      </form>
    </NativeDialog>
  );
}

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { Project, TaskPriority } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { IconButton } from '../../../components/ui/IconButton';
import { NativeDialog } from '../../../components/ui/NativeDialog';
import { SelectField } from '../../../components/ui/SelectField';
import { TextField } from '../../../components/ui/TextField';
import type { NewTaskFields, QuickAddDraft, QuickAddField } from '../validation';
import { validateQuickAdd } from '../validation';

const FIELD_IDS: Record<QuickAddField, string> = {
  title: 'quick-add-title',
  priority: 'quick-add-priority',
  dueDate: 'quick-add-date',
  projectId: 'quick-add-project',
  tags: 'quick-add-tags',
};

const createDraft = (initialDueDate: string): QuickAddDraft => ({
  title: '',
  priority: 'none',
  dueDate: initialDueDate,
  projectId: '',
  tags: '',
});

export interface QuickAddDrawerProps {
  open: boolean;
  projects: Project[];
  initialDueDate: string;
  onClose: () => void;
  onSave: (value: NewTaskFields) => void | Promise<void>;
}

export function QuickAddDrawer({
  open,
  projects,
  initialDueDate,
  onClose,
  onSave,
}: QuickAddDrawerProps) {
  const [draft, setDraft] = useState(() => createDraft(initialDueDate));
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<QuickAddField, boolean>>>({});
  const [focusField, setFocusField] = useState<QuickAddField | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const submittingRef = useRef(false);
  const fieldsRef = useRef<HTMLDivElement>(null);
  const [showFieldScrollHint, setShowFieldScrollHint] = useState(false);
  const validation = validateQuickAdd(draft, projects);
  const visibleErrors = Object.fromEntries(
    Object.entries(validation.errors).filter(
      ([field]) => submitted || touched[field as QuickAddField],
    ),
  ) as typeof validation.errors;
  const visibleErrorCount = Object.keys(visibleErrors).length;

  useEffect(() => {
    if (!open) return;
    setDraft(createDraft(initialDueDate));
    setSubmitted(false);
    setTouched({});
    setFocusField(null);
    setSubmitError(null);
    setSaving(false);
    submittingRef.current = false;
  }, [initialDueDate, open]);

  useEffect(() => {
    const fields = fieldsRef.current;
    if (!open || !fields) {
      setShowFieldScrollHint(false);
      return;
    }

    const updateHint = () => {
      const tagHint = fields.querySelector(`#${FIELD_IDS.tags}-hint`);
      const visibleTail = fields.querySelector('.quick-add-form__submit-error') ?? tagHint;
      const hasVisibleContentBelow =
        visibleTail !== null &&
        visibleTail.getBoundingClientRect().bottom > fields.getBoundingClientRect().bottom + 4;
      const canScrollFurther = fields.scrollTop + fields.clientHeight < fields.scrollHeight - 4;
      setShowFieldScrollHint(hasVisibleContentBelow && canScrollFurther);
    };
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updateHint);
    observer?.observe(fields);
    Array.from(fields.children).forEach((child) => observer?.observe(child));
    fields.addEventListener('scroll', updateHint, { passive: true });
    window.addEventListener('resize', updateHint);
    const frame = window.requestAnimationFrame(updateHint);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', updateHint);
      fields.removeEventListener('scroll', updateHint);
      observer?.disconnect();
    };
  }, [open, submitError, visibleErrorCount]);

  useEffect(() => {
    if (!focusField) return;
    document.getElementById(FIELD_IDS[focusField])?.focus({ preventScroll: true });
    setFocusField(null);
  }, [focusField]);

  const updateField = (field: QuickAddField, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const markTouched = (field: QuickAddField) => {
    setTouched((current) => ({ ...current, [field]: true }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    const result = validateQuickAdd(draft, projects);
    if (!result.value) {
      const firstInvalid = (Object.keys(FIELD_IDS) as QuickAddField[]).find(
        (field) => result.errors[field],
      );
      if (firstInvalid) setFocusField(firstInvalid);
      return;
    }
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSaving(true);
    setSubmitError(null);
    try {
      await onSave(result.value);
      onClose();
    } catch {
      setSubmitError("We couldn't save that task. Try again.");
    } finally {
      submittingRef.current = false;
      setSaving(false);
    }
  };

  const projectOptions = projects
    .filter((project) => !project.archived)
    .map((project) => ({ value: project.id, label: project.name }));

  return (
    <NativeDialog
      open={open}
      className="quick-add-dialog"
      labelledBy="quick-add-heading"
      describedBy="quick-add-description"
      initialFocusSelector="#quick-add-title"
      onRequestClose={onClose}
    >
      <div className="drawer-header">
        <div>
          <p className="page-eyebrow">Quick add</p>
          <h2 id="quick-add-heading">New task</h2>
          <p id="quick-add-description" className="drawer-description">
            Capture the work. You can add more detail later.
          </p>
        </div>
        <IconButton
          label="Close new task form"
          title="Close new task form"
          variant="quiet"
          icon={<X size={18} aria-hidden="true" />}
          onClick={onClose}
        />
      </div>

      <form className="quick-add-form" noValidate onSubmit={handleSubmit}>
        <div ref={fieldsRef} className="quick-add-form__fields">
          <TextField
            id={FIELD_IDS.title}
            label="Task name"
            required
            maxLength={120}
            value={draft.title}
            placeholder="What needs doing?"
            error={visibleErrors.title}
            onChange={(event) => updateField('title', event.currentTarget.value)}
            onBlur={() => markTouched('title')}
          />
          <div className="quick-add-form__pair">
            <SelectField
              id={FIELD_IDS.priority}
              label="Priority"
              value={draft.priority as TaskPriority}
              options={[
                { value: 'none', label: 'No priority' },
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
              ]}
              error={visibleErrors.priority}
              onChange={(event) => updateField('priority', event.currentTarget.value)}
              onBlur={() => markTouched('priority')}
            />
            <div className="quick-add-date-field">
              <TextField
                id={FIELD_IDS.dueDate}
                label="Due date"
                type="date"
                value={draft.dueDate}
                hint="Today by default. Clear the date if it is flexible."
                error={visibleErrors.dueDate}
                onChange={(event) => updateField('dueDate', event.currentTarget.value)}
                onBlur={() => markTouched('dueDate')}
              />
              <button
                className="field-clear-action"
                type="button"
                disabled={!draft.dueDate || saving}
                onClick={() => updateField('dueDate', '')}
              >
                Clear date
              </button>
            </div>
          </div>
          <SelectField
            id={FIELD_IDS.projectId}
            label="Project"
            value={draft.projectId}
            placeholder="No project"
            options={projectOptions}
            error={visibleErrors.projectId}
            onChange={(event) => updateField('projectId', event.currentTarget.value)}
            onBlur={() => markTouched('projectId')}
          />
          <TextField
            id={FIELD_IDS.tags}
            label="Tags"
            value={draft.tags}
            placeholder="e.g. writing, follow-up"
            hint="Separate tags with commas. Up to 8 tags, 24 characters each."
            error={visibleErrors.tags}
            onChange={(event) => updateField('tags', event.currentTarget.value)}
            onBlur={() => markTouched('tags')}
          />
          {submitError && (
            <p className="field__error quick-add-form__submit-error" role="alert">
              {submitError}
            </p>
          )}
        </div>
        <div className="quick-add-form__footer">
          <p className="drawer-keyboard-hint">
            <kbd>Esc</kbd> to close
          </p>
          {showFieldScrollHint && <p className="quick-add-scroll-hint">More task details below</p>}
          <div className="drawer-actions">
            <Button variant="secondary" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={saving}>
              Add task
            </Button>
          </div>
        </div>
      </form>
    </NativeDialog>
  );
}

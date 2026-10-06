import { useId, type InputHTMLAttributes } from 'react';

export interface CheckboxFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'id' | 'type'
> {
  id?: string;
  label: string;
  hint?: string;
  error?: string;
}

export function CheckboxField({
  id,
  label,
  hint,
  error,
  className = '',
  'aria-describedby': externalDescription,
  ...inputProps
}: CheckboxFieldProps) {
  const generatedId = useId().replaceAll(':', '');
  const fieldId = id ?? `checkbox-${generatedId}`;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [externalDescription, hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={['checkbox-field', className].filter(Boolean).join(' ')}>
      <label className="checkbox-field__label" htmlFor={fieldId}>
        <input
          {...inputProps}
          id={fieldId}
          className="checkbox-field__input"
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
        />
        <span>{label}</span>
      </label>
      {hint && (
        <p id={hintId} className="field__hint checkbox-field__hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

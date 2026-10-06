import { useId, type InputHTMLAttributes } from 'react';

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> {
  id?: string;
  label: string;
  type?: 'text' | 'search' | 'email' | 'url' | 'number' | 'date';
  hint?: string;
  error?: string;
  wrapperClassName?: string;
}

export function TextField({
  id,
  label,
  type = 'text',
  hint,
  error,
  required = false,
  className = '',
  wrapperClassName = '',
  'aria-describedby': externalDescription,
  ...inputProps
}: TextFieldProps) {
  const generatedId = useId().replaceAll(':', '');
  const fieldId = id ?? `field-${generatedId}`;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [externalDescription, hintId, errorId].filter(Boolean).join(' ') || undefined;
  const fieldClasses = ['field__input', error ? 'field__input--error' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={['field', wrapperClassName].filter(Boolean).join(' ')}>
      <label className="field__label" htmlFor={fieldId}>
        <span>{label}</span>
        {required && (
          <span className="field__required" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <input
        {...inputProps}
        id={fieldId}
        type={type}
        className={fieldClasses}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
      />
      {hint && (
        <p id={hintId} className="field__hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="field__error" role="alert">
          {error}
        </p>
      )}
      {!error && <span className="field__error-space" aria-hidden="true" />}
    </div>
  );
}

import { useId, type TextareaHTMLAttributes } from 'react';

export interface TextAreaFieldProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'id'
> {
  id?: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  wrapperClassName?: string;
}

export function TextAreaField({
  id,
  label,
  hint,
  error,
  required = false,
  className = '',
  wrapperClassName = '',
  'aria-describedby': externalDescription,
  ...textareaProps
}: TextAreaFieldProps) {
  const generatedId = useId().replaceAll(':', '');
  const fieldId = id ?? `textarea-${generatedId}`;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [externalDescription, hintId, errorId].filter(Boolean).join(' ') || undefined;
  const fieldClasses = [
    'field__input',
    'field__input--textarea',
    error ? 'field__input--error' : '',
    className,
  ]
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
      <textarea
        {...textareaProps}
        id={fieldId}
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

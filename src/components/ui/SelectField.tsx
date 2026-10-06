import { useId, type SelectHTMLAttributes } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  id?: string;
  label: string;
  options: SelectOption[];
  hint?: string;
  error?: string;
  placeholder?: string;
  wrapperClassName?: string;
}

export function SelectField({
  id,
  label,
  options,
  hint,
  error,
  placeholder,
  required = false,
  className = '',
  wrapperClassName = '',
  'aria-describedby': externalDescription,
  ...selectProps
}: SelectFieldProps) {
  const generatedId = useId().replaceAll(':', '');
  const fieldId = id ?? `select-${generatedId}`;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [externalDescription, hintId, errorId].filter(Boolean).join(' ') || undefined;
  const fieldClasses = [
    'field__input',
    'field__input--select',
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
      <select
        {...selectProps}
        id={fieldId}
        className={fieldClasses}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
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

import { LoaderCircle } from 'lucide-react';
import type { HTMLAttributes } from 'react';

export function Divider({ className = '', ...props }: HTMLAttributes<HTMLHRElement>) {
  return <hr {...props} className={['divider', className].filter(Boolean).join(' ')} />;
}

export function VisuallyHidden({ className = '', ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span {...props} className={['visually-hidden', className].filter(Boolean).join(' ')} />;
}

export function LoadingIndicator({
  label = 'Loading',
  className = '',
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={['loading-indicator', className].filter(Boolean).join(' ')}
      role="status"
      aria-label={label}
    >
      <LoaderCircle className="loading-indicator__icon" size={20} aria-hidden="true" />
    </span>
  );
}

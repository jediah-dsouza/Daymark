import { Check, Info, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { IconButton } from '../ui/IconButton';

export interface ToastMessage {
  message: string;
  intent?: 'success' | 'info' | 'error';
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
}

export function ToastRegion({
  toast,
  onDismiss,
}: {
  toast: ToastMessage | null;
  onDismiss: () => void;
}) {
  if (!toast) return null;
  const intent = toast.intent ?? 'success';
  const Icon = intent === 'success' ? Check : Info;
  return (
    <div className="toast-region" aria-label="Notifications">
      <div
        className={`toast toast--${intent}`}
        role={intent === 'error' ? 'alert' : 'status'}
        aria-live={intent === 'error' ? 'assertive' : 'polite'}
        aria-atomic="true"
      >
        <span className="toast__icon" aria-hidden="true">
          {toast.icon ?? <Icon size={17} strokeWidth={1.9} />}
        </span>
        <span className="toast__message">{toast.message}</span>
        {toast.actionLabel && toast.onAction && (
          <button className="toast__action" type="button" onClick={toast.onAction}>
            {toast.actionLabel}
          </button>
        )}
        <IconButton
          label="Dismiss notification"
          title="Dismiss notification"
          variant="quiet"
          icon={<X size={16} aria-hidden="true" />}
          onClick={onDismiss}
        />
      </div>
    </div>
  );
}

import { useLayoutEffect, useRef, type DialogHTMLAttributes, type ReactNode } from 'react';

function restoreFocus(opener: HTMLElement | null) {
  const returnTarget =
    opener?.isConnected === true ? opener : document.getElementById('main-content');
  returnTarget?.focus({ preventScroll: true });
}

export interface NativeDialogProps extends Omit<DialogHTMLAttributes<HTMLDialogElement>, 'open'> {
  open: boolean;
  labelledBy: string;
  describedBy?: string;
  initialFocusSelector?: string;
  onRequestClose: () => void;
  children: ReactNode;
}

export function NativeDialog({
  open,
  labelledBy,
  describedBy,
  initialFocusSelector,
  onRequestClose,
  children,
  className = '',
  ...dialogProps
}: NativeDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      const activeElement = document.activeElement;
      openerRef.current = activeElement instanceof HTMLElement ? activeElement : null;
      dialog.showModal();
      if (initialFocusSelector) {
        dialog.querySelector<HTMLElement>(initialFocusSelector)?.focus({ preventScroll: true });
      }
    } else if (!open && dialog.open) {
      dialog.close();
      const opener = openerRef.current;
      openerRef.current = null;
      restoreFocus(opener);
    }
  }, [open, initialFocusSelector]);

  useLayoutEffect(() => {
    return () => {
      const dialog = dialogRef.current;
      if (!dialog?.open) return;

      dialog.close();
      const opener = openerRef.current;
      openerRef.current = null;
      queueMicrotask(() => restoreFocus(opener));
    };
  }, []);

  return (
    <dialog
      {...dialogProps}
      ref={dialogRef}
      className={['native-dialog', className].filter(Boolean).join(' ')}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onCancel={(event) => {
        event.preventDefault();
        onRequestClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onRequestClose();
      }}
    >
      {children}
    </dialog>
  );
}

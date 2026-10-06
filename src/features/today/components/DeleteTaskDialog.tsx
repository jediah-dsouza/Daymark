import { useEffect, useRef, useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { NativeDialog } from '../../../components/ui/NativeDialog';
import type { Task } from '../../../types';

export function DeleteTaskDialog({
  task,
  onCancel,
  onConfirm,
}: {
  task: Task | null;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}) {
  const [deleting, setDeleting] = useState(false);
  const deletingRef = useRef(false);
  useEffect(() => {
    if (task === null) {
      setDeleting(false);
      deletingRef.current = false;
    }
  }, [task]);

  const handleConfirm = async () => {
    if (deletingRef.current) return;
    deletingRef.current = true;
    setDeleting(true);
    try {
      await onConfirm();
    } finally {
      deletingRef.current = false;
      setDeleting(false);
    }
  };

  return (
    <NativeDialog
      open={task !== null}
      className="confirmation-dialog"
      labelledBy="delete-task-heading"
      describedBy="delete-task-description"
      onRequestClose={onCancel}
    >
      <div className="confirmation-dialog__content">
        <p className="page-eyebrow">Remove task</p>
        <h2 id="delete-task-heading">Delete this task?</h2>
        <p id="delete-task-description">
          <strong>{task?.title}</strong> will be removed from your workspace. You can undo this for
          a few seconds after deleting it.
        </p>
        <div className="drawer-actions">
          <Button variant="secondary" autoFocus disabled={deleting} onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" loading={deleting} onClick={handleConfirm}>
            Delete task
          </Button>
        </div>
      </div>
    </NativeDialog>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { NativeDialog } from '../../../components/ui/NativeDialog';
import type { Project } from '../../../types';

export function DeleteProjectDialog({
  project,
  taskCount,
  onCancel,
  onConfirm,
}: {
  project: Project | null;
  taskCount: number;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}) {
  const [deleting, setDeleting] = useState(false);
  const deletingRef = useRef(false);

  useEffect(() => {
    if (project === null) {
      setDeleting(false);
      deletingRef.current = false;
    }
  }, [project]);

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
      open={project !== null}
      className="confirmation-dialog"
      labelledBy="delete-project-heading"
      describedBy="delete-project-description"
      onRequestClose={onCancel}
    >
      <div className="confirmation-dialog__content">
        <p className="page-eyebrow">Remove project</p>
        <h2 id="delete-project-heading">Delete this project?</h2>
        <p id="delete-project-description">
          <strong>{project?.name}</strong> will be removed from your workspace.{' '}
          {taskCount > 0 ? (
            <>
              {taskCount} associated {taskCount === 1 ? 'task will' : 'tasks will'} stay in your
              workspace and become unassigned. No tasks will be deleted.
            </>
          ) : (
            'No tasks are currently assigned to this project.'
          )}
        </p>
        <div className="drawer-actions">
          <Button variant="secondary" autoFocus disabled={deleting} onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" loading={deleting} onClick={handleConfirm}>
            Delete project
          </Button>
        </div>
      </div>
    </NativeDialog>
  );
}

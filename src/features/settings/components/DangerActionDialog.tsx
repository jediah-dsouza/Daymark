import { Button } from '../../../components/ui/Button';
import { NativeDialog } from '../../../components/ui/NativeDialog';

export type SettingsDangerAction = 'restore' | 'clear';

interface DangerActionDialogProps {
  action: SettingsDangerAction | null;
  taskCount: number;
  projectCount: number;
  activityCount: number;
  onCancel: () => void;
  onConfirm: () => void;
}

function countLabel(count: number, singular: string): string {
  return `${count} ${singular}${count === 1 ? '' : 's'}`;
}

export function DangerActionDialog({
  action,
  taskCount,
  projectCount,
  activityCount,
  onCancel,
  onConfirm,
}: DangerActionDialogProps) {
  const restoring = action === 'restore';
  const title = restoring ? 'Restore the sample workspace?' : 'Clear local data?';

  return (
    <NativeDialog
      open={action !== null}
      className="settings-action-dialog"
      labelledBy="settings-action-heading"
      describedBy="settings-action-description"
      initialFocusSelector="#settings-action-cancel"
      onRequestClose={onCancel}
    >
      <div className="settings-action-dialog__body">
        <p className="page-eyebrow">Review this action</p>
        <h2 id="settings-action-heading">{title}</h2>
        {restoring ? (
          <>
            <p id="settings-action-description">
              Replace {countLabel(taskCount, 'task')}, {countLabel(projectCount, 'project')}, and{' '}
              {activityCount} activity {activityCount === 1 ? 'entry' : 'entries'} with the Daymark
              demonstration workspace? Preferences will return to their defaults.
            </p>
            <p className="settings-action-dialog__consequence">
              Changes you have not exported will be lost. This action cannot be undone.
            </p>
          </>
        ) : (
          <>
            <p id="settings-action-description">
              Remove all tasks, projects, and activity from this browser and reset preferences to
              their defaults. Your workspace will remain empty after reload.
            </p>
            <p className="settings-action-dialog__consequence">
              Export a copy first if you may need this data. This action cannot be undone.
            </p>
          </>
        )}
        <dl className="settings-action-dialog__counts">
          <div>
            <dt>Tasks</dt>
            <dd>{taskCount}</dd>
          </div>
          <div>
            <dt>Projects</dt>
            <dd>{projectCount}</dd>
          </div>
          <div>
            <dt>Activity entries</dt>
            <dd>{activityCount}</dd>
          </div>
        </dl>
      </div>
      <footer className="settings-action-dialog__footer">
        <Button id="settings-action-cancel" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {restoring ? 'Restore sample data' : 'Clear local data'}
        </Button>
      </footer>
    </NativeDialog>
  );
}

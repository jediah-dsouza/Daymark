import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { CheckboxField } from '../../components/ui/CheckboxField';
import { SelectField } from '../../components/ui/SelectField';
import { ToastRegion, type ToastMessage } from '../../components/feedback/ToastRegion';
import { useApp } from '../../state/AppProvider';
import type { DefaultTaskStatus, ThemePreference } from '../../types';
import { serializeAppData } from '../../services/storage/localStorage';
import { localDateNow } from '../../utils/dates';
import { DangerActionDialog, type SettingsDangerAction } from './components/DangerActionDialog';
import './settings.css';

const themeChoices: Array<{
  value: ThemePreference;
  label: string;
  description: string;
}> = [
  { value: 'system', label: 'System', description: 'Follow your device setting.' },
  { value: 'light', label: 'Light', description: 'Warm paper and graphite.' },
  { value: 'dark', label: 'Dark', description: 'Low-glare ink and paper.' },
];

const sectionLinks = [
  { id: 'settings-appearance', label: 'Appearance' },
  { id: 'settings-preferences', label: 'Preferences' },
  { id: 'settings-data', label: 'Data' },
  { id: 'settings-about', label: 'About Daymark' },
];

const taskStatusOptions = [
  { value: 'inbox', label: 'Inbox' },
  { value: 'todo', label: 'To do' },
];

function createExportFilename(): string {
  return `daymark-workspace-${localDateNow()}.json`;
}

export function SettingsPage() {
  const { data, updatePreferences, persistenceStatus, restoreSampleData, clearLocalData } =
    useApp();
  const [pendingAction, setPendingAction] = useState<SettingsDangerAction | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    document.title = 'Settings — Daymark';
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 5_000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const announcePreference = (message: string) => {
    setToast({ message, intent: 'success' });
  };

  const changeTheme = (theme: ThemePreference) => {
    updatePreferences({ theme });
    announcePreference(`${theme[0]!.toUpperCase()}${theme.slice(1)} appearance selected.`);
  };

  const changeDefaultTaskStatus = (status: DefaultTaskStatus) => {
    updatePreferences({ defaultTaskStatus: status });
    announcePreference('Default task status updated.');
  };

  const handleExport = () => {
    let url: string | null = null;
    try {
      const blob = new Blob([serializeAppData(data, 2)], { type: 'application/json' });
      url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = createExportFilename();
      anchor.rel = 'noopener';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      const objectUrl = url;
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1_000);
      setToast({ message: 'Workspace export downloaded.', intent: 'success' });
    } catch {
      if (url) URL.revokeObjectURL(url);
      setToast({
        message:
          'Your workspace could not be exported. Check browser download settings and try again.',
        intent: 'error',
      });
    }
  };

  const handleConfirmAction = () => {
    if (!pendingAction) return;
    if (pendingAction === 'restore') {
      const saved = restoreSampleData();
      setPendingAction(null);
      setToast(
        saved
          ? { message: 'Sample workspace restored.', intent: 'success' }
          : {
              message: 'Sample data is open in this page but could not be saved to this browser.',
              intent: 'error',
            },
      );
      return;
    }

    const saved = clearLocalData();
    setPendingAction(null);
    setToast(
      saved
        ? { message: 'Local workspace cleared.', intent: 'success' }
        : {
            message: 'Local data could not be cleared. Your current workspace is unchanged.',
            intent: 'error',
          },
    );
  };

  return (
    <div className="page-scaffold settings-page">
      <header className="page-heading">
        <p className="page-eyebrow">Your workspace</p>
        <h1>Settings</h1>
        <p className="page-description">
          Set the pace for your workspace, then decide what stays in this browser.
        </p>
      </header>

      <div className="settings-layout">
        <nav className="settings-nav" aria-label="Settings sections">
          <p className="settings-nav__label">On this page</p>
          <ol>
            {sectionLinks.map(({ id, label }) => (
              <li key={id}>
                <a href={`#${id}`}>{label}</a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="settings-content">
          <section
            id="settings-appearance"
            className="settings-section"
            aria-labelledby="settings-appearance-title"
          >
            <div className="settings-section__intro">
              <p className="page-eyebrow">01 · Appearance</p>
              <h2 id="settings-appearance-title">A workspace that feels right.</h2>
              <p>Theme, motion, and density apply as soon as you change them.</p>
            </div>
            <div className="settings-section__controls">
              <fieldset className="settings-theme-fieldset">
                <legend>Theme</legend>
                <div className="settings-theme-options">
                  {themeChoices.map((choice) => (
                    <label
                      key={choice.value}
                      className={`settings-theme-choice${data.preferences.theme === choice.value ? ' is-selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="settings-theme"
                        value={choice.value}
                        checked={data.preferences.theme === choice.value}
                        onChange={() => changeTheme(choice.value)}
                      />
                      <span className="settings-theme-choice__copy">
                        <span className="settings-theme-choice__label">{choice.label}</span>
                        <span className="settings-theme-choice__description">
                          {choice.description}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="settings-toggle-list">
                <CheckboxField
                  className="settings-toggle"
                  id="settings-reduced-motion"
                  label="Reduce motion"
                  hint="Keep changes immediate and quiet across the workspace."
                  checked={data.preferences.reducedMotion}
                  onChange={(event) => {
                    updatePreferences({ reducedMotion: event.currentTarget.checked });
                    announcePreference(
                      event.currentTarget.checked
                        ? 'Reduced motion is on.'
                        : 'Reduced motion is off.',
                    );
                  }}
                />
                <CheckboxField
                  className="settings-toggle"
                  id="settings-compact-mode"
                  label="Compact layout"
                  hint="Use less vertical space in navigation, task lists, and project summaries."
                  checked={data.preferences.compactMode}
                  onChange={(event) => {
                    updatePreferences({ compactMode: event.currentTarget.checked });
                    announcePreference(
                      event.currentTarget.checked
                        ? 'Compact layout is on.'
                        : 'Compact layout is off.',
                    );
                  }}
                />
              </div>
            </div>
          </section>

          <section
            id="settings-preferences"
            className="settings-section"
            aria-labelledby="settings-preferences-title"
          >
            <div className="settings-section__intro">
              <p className="page-eyebrow">02 · Preferences</p>
              <h2 id="settings-preferences-title">Keep the defaults useful.</h2>
              <p>New work starts with these choices. You can change each task later.</p>
            </div>
            <div className="settings-section__controls">
              <CheckboxField
                className="settings-toggle"
                id="settings-show-completed"
                label="Show completed tasks on Today"
                hint="Completed work still counts toward progress when this list is hidden."
                checked={data.preferences.showCompletedToday}
                onChange={(event) => {
                  updatePreferences({ showCompletedToday: event.currentTarget.checked });
                  announcePreference(
                    event.currentTarget.checked
                      ? 'Completed tasks will appear on Today.'
                      : 'Completed tasks are hidden on Today.',
                  );
                }}
              />
              <SelectField
                id="settings-default-task-status"
                className="settings-default-status"
                wrapperClassName="settings-default-status__field"
                label="Default task status"
                hint="Used for Quick Add, New Task, and tasks created inside a project."
                options={taskStatusOptions}
                value={data.preferences.defaultTaskStatus}
                onChange={(event) =>
                  changeDefaultTaskStatus(event.currentTarget.value as DefaultTaskStatus)
                }
              />
            </div>
          </section>

          <section
            id="settings-data"
            className="settings-section settings-section--data"
            aria-labelledby="settings-data-title"
          >
            <div className="settings-section__intro">
              <p className="page-eyebrow">03 · Data</p>
              <h2 id="settings-data-title">Your work stays here.</h2>
              <p>Daymark stores this workspace in browser storage on this device.</p>
              <p className="settings-storage-status" aria-live="polite">
                <span
                  className={`status-dot${persistenceStatus === 'memory-only' ? ' settings-storage-status__dot--warning' : ''}`}
                  aria-hidden="true"
                />
                {persistenceStatus === 'available'
                  ? 'Saved in this browser'
                  : 'Changes are held in this page only'}
              </p>
            </div>
            <div className="settings-section__controls">
              <dl className="settings-data-counts" aria-label="Current workspace contents">
                <div>
                  <dt>Tasks</dt>
                  <dd>{data.tasks.length}</dd>
                </div>
                <div>
                  <dt>Projects</dt>
                  <dd>{data.projects.length}</dd>
                </div>
                <div>
                  <dt>Activity entries</dt>
                  <dd>{data.activity.length}</dd>
                </div>
              </dl>
              <div className="settings-data-actions">
                <div className="settings-data-action">
                  <div>
                    <h3>Export a copy</h3>
                    <p>Download tasks, projects, activity, and preferences as a JSON file.</p>
                  </div>
                  <Button
                    variant="secondary"
                    leadingIcon={<Download size={16} aria-hidden="true" />}
                    onClick={handleExport}
                  >
                    Export data
                  </Button>
                </div>
                <div className="settings-data-action">
                  <div>
                    <h3>Restore sample workspace</h3>
                    <p>Replace current work with the original Daymark demonstration data.</p>
                  </div>
                  <Button variant="secondary" onClick={() => setPendingAction('restore')}>
                    Restore sample data
                  </Button>
                </div>
                <div className="settings-data-action settings-data-action--danger">
                  <div>
                    <h3>Clear local data</h3>
                    <p>Remove all workspace records and keep an empty workspace after reload.</p>
                  </div>
                  <Button variant="danger" onClick={() => setPendingAction('clear')}>
                    Clear local data
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <section
            id="settings-about"
            className="settings-section settings-section--about"
            aria-labelledby="settings-about-title"
          >
            <div className="settings-section__intro">
              <p className="page-eyebrow">04 · About</p>
              <h2 id="settings-about-title">Daymark, in brief.</h2>
              <p>A focused work journal for choosing and completing today’s work.</p>
            </div>
            <dl className="settings-about-list">
              <div>
                <dt>Version</dt>
                <dd>1.0.0</dd>
              </div>
              <div>
                <dt>Project context</dt>
                <dd>A local-first internship project built around a complete task workflow.</dd>
              </div>
              <div>
                <dt>Technology</dt>
                <dd>React 19, TypeScript, Vite, and browser local storage.</dd>
              </div>
              <div>
                <dt>Data location</dt>
                <dd>This browser on this device. No account or server sync is used.</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>

      <DangerActionDialog
        action={pendingAction}
        taskCount={data.tasks.length}
        projectCount={data.projects.length}
        activityCount={data.activity.length}
        onCancel={() => setPendingAction(null)}
        onConfirm={handleConfirmAction}
      />
      <ToastRegion toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppProvider } from '../../state/AppProvider';
import { STORAGE_KEY } from '../../services/storage/localStorage';
import type { AppData } from '../../types';
import { SettingsPage } from './SettingsPage';

afterEach(() => vi.restoreAllMocks());

function renderSettings() {
  return render(
    <AppProvider>
      <MemoryRouter initialEntries={['/settings']}>
        <SettingsPage />
      </MemoryRouter>
    </AppProvider>,
  );
}

function storedData(): AppData {
  const record = localStorage.getItem(STORAGE_KEY);
  if (!record) throw new Error('Expected Daymark data in local storage.');
  return (JSON.parse(record) as { data: AppData }).data;
}

describe('Settings route', () => {
  it('applies and persists theme, motion, density, Today visibility, and the default task status', async () => {
    const user = userEvent.setup();
    renderSettings();

    await user.click(screen.getByRole('radio', { name: /Light/ }));
    await user.click(screen.getByLabelText('Reduce motion'));
    await user.click(screen.getByLabelText('Compact layout'));
    await user.click(screen.getByLabelText('Show completed tasks on Today'));
    await user.selectOptions(screen.getByRole('combobox', { name: 'Default task status' }), 'todo');

    await waitFor(() => {
      expect(storedData().preferences).toMatchObject({
        theme: 'light',
        reducedMotion: true,
        compactMode: true,
        showCompletedToday: false,
        defaultTaskStatus: 'todo',
      });
    });
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    expect(document.documentElement).toHaveAttribute('data-reduced-motion', 'true');
    expect(document.documentElement).toHaveAttribute('data-compact', 'true');
    expect(document.title).toBe('Settings — Daymark');
  });

  it('confirms before clearing, keeps cancellation safe, and persists a valid empty workspace', async () => {
    const user = userEvent.setup();
    renderSettings();
    const clearButton = screen.getByRole('button', { name: 'Clear local data' });
    const initialTaskCount = storedData().tasks.length;
    expect(initialTaskCount).toBeGreaterThan(0);

    await user.click(clearButton);
    let dialog = screen.getByRole('dialog', { name: 'Clear local data?' });
    expect(dialog).toHaveTextContent('Your workspace will remain empty after reload.');
    expect(dialog).toHaveTextContent('This action cannot be undone.');
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(clearButton).toHaveFocus());
    expect(storedData().tasks).toHaveLength(initialTaskCount);

    await user.click(clearButton);
    dialog = screen.getByRole('dialog', { name: 'Clear local data?' });
    await user.click(within(dialog).getByRole('button', { name: 'Clear local data' }));

    await waitFor(() => expect(storedData().tasks).toHaveLength(0));
    expect(storedData()).toMatchObject({
      tasks: [],
      projects: [],
      activity: [],
      preferences: {
        theme: 'system',
        compactMode: false,
        reducedMotion: false,
        showCompletedToday: true,
        defaultTaskStatus: 'inbox',
      },
    });
    expect(screen.getByRole('status')).toHaveTextContent('Local workspace cleared.');
  });

  it('restores the sample workspace and resets preferences only after explicit confirmation', async () => {
    const user = userEvent.setup();
    renderSettings();
    await user.click(screen.getByRole('radio', { name: /Dark/ }));
    await waitFor(() => expect(storedData().preferences.theme).toBe('dark'));

    const restoreButton = screen.getByRole('button', { name: 'Restore sample data' });
    await user.click(restoreButton);
    const dialog = screen.getByRole('dialog', { name: 'Restore the sample workspace?' });
    expect(dialog).toHaveTextContent('Replace');
    expect(dialog).toHaveTextContent('Preferences will return to their defaults.');
    expect(dialog).toHaveTextContent('Changes you have not exported will be lost.');
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(restoreButton).toHaveFocus());
    expect(storedData().preferences.theme).toBe('dark');

    await user.click(restoreButton);
    const confirmDialog = screen.getByRole('dialog', { name: 'Restore the sample workspace?' });
    await user.click(within(confirmDialog).getByRole('button', { name: 'Restore sample data' }));
    await waitFor(() => {
      expect(storedData().tasks).toHaveLength(10);
      expect(storedData().preferences.theme).toBe('system');
    });
    expect(storedData().projects.length).toBeGreaterThan(0);
    expect(screen.getByRole('status')).toHaveTextContent('Sample workspace restored.');
  });

  it('keeps the previous saved workspace when sample restore cannot be persisted', async () => {
    const user = userEvent.setup();
    renderSettings();
    await user.click(screen.getByRole('radio', { name: /Dark/ }));
    await waitFor(() => expect(storedData().preferences.theme).toBe('dark'));
    const originalSerialized = localStorage.getItem(STORAGE_KEY);
    if (originalSerialized === null) throw new Error('Expected a saved Daymark workspace.');

    const original = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (
      this: Storage,
      key: string,
      value: string,
    ) {
      if (key === STORAGE_KEY)
        throw new DOMException('Storage quota exceeded', 'QuotaExceededError');
      return original.call(this, key, value);
    });

    await user.click(screen.getByRole('button', { name: 'Restore sample data' }));
    const dialog = screen.getByRole('dialog', { name: 'Restore the sample workspace?' });
    await user.click(within(dialog).getByRole('button', { name: 'Restore sample data' }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Sample data is open in this page but could not be saved to this browser.',
    );
    expect(screen.getByText('Changes are held in this page only')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('radio', { name: /System/ })).toBeChecked());
    expect(localStorage.getItem(STORAGE_KEY)).toBe(originalSerialized);
    expect(storedData().preferences.theme).toBe('dark');
  });

  it('reports a clear failure honestly and leaves stored user data unchanged', async () => {
    const user = userEvent.setup();
    renderSettings();
    const original = Storage.prototype.setItem;
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (
      this: Storage,
      key: string,
      value: string,
    ) {
      if (key === STORAGE_KEY)
        throw new DOMException('Storage quota exceeded', 'QuotaExceededError');
      return original.call(this, key, value);
    });
    const initialTaskCount = storedData().tasks.length;

    await user.click(screen.getByRole('button', { name: 'Clear local data' }));
    const dialog = screen.getByRole('dialog', { name: 'Clear local data?' });
    await user.click(within(dialog).getByRole('button', { name: 'Clear local data' }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Local data could not be cleared. Your current workspace is unchanged.',
    );
    expect(storedData().tasks).toHaveLength(initialTaskCount);
    expect(screen.getByText('Changes are held in this page only')).toBeInTheDocument();
    setItem.mockRestore();
  });
});

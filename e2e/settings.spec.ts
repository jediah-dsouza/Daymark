import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const auditAccessibility = async (page: Page) => {
  await page.waitForTimeout(250);
  return page.evaluate(async () => {
    type AxeNode = { target: string[]; html: string; failureSummary?: string };
    type AxeResult = {
      violations: Array<{
        id: string;
        impact: string | null;
        help: string;
        nodes: AxeNode[];
      }>;
    };
    type AxeRunner = {
      run: (
        context: Document,
        options: { runOnly: { type: 'tag'; values: string[] } },
      ) => Promise<AxeResult>;
    };
    const axe = (window as Window & { axe?: AxeRunner }).axe;
    if (!axe) throw new Error('axe-core did not load');
    const result = await axe.run(document, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'],
      },
    });
    return result.violations.map(({ id, impact, help, nodes }) => ({
      id,
      impact,
      help,
      count: nodes.length,
      nodes: nodes.map(({ target, html, failureSummary }) => ({ target, html, failureSummary })),
    }));
  });
};

const readPreferences = (page: Page) =>
  page.evaluate(() => {
    const record = localStorage.getItem('daymark:workspace:v1');
    return record ? JSON.parse(record).data.preferences : null;
  });

const readWorkspace = (page: Page) =>
  page.evaluate(() => {
    const record = localStorage.getItem('daymark:workspace:v1');
    return record ? JSON.parse(record).data : null;
  });

test('Settings preferences persist and affect Today, full task, Quick Add, and Project tasks', async ({
  page,
}) => {
  await page.goto('/settings');
  await expect(page.getByRole('heading', { name: 'Settings', level: 1 })).toBeVisible();
  await expect(page).toHaveTitle('Settings — Daymark');

  await page.emulateMedia({ colorScheme: 'dark' });
  await page.getByRole('radio', { name: /System/ }).check();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('radio', { name: /Light/ }).check();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('checkbox', { name: 'Reduce motion' }).check();
  await page.getByRole('checkbox', { name: 'Compact layout' }).check();
  await page.getByRole('checkbox', { name: 'Show completed tasks on Today' }).uncheck();
  await page.getByRole('combobox', { name: 'Default task status' }).selectOption('todo');

  await expect
    .poll(() => readPreferences(page))
    .toMatchObject({
      theme: 'light',
      reducedMotion: true,
      compactMode: true,
      showCompletedToday: false,
      defaultTaskStatus: 'todo',
    });
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('html')).toHaveAttribute('data-reduced-motion', 'true');
  await expect(page.locator('html')).toHaveAttribute('data-compact', 'true');
  await expect(page.getByRole('radio', { name: /Light/ })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Reduce motion' })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Compact layout' })).toBeChecked();
  await expect(
    page.getByRole('checkbox', { name: 'Show completed tasks on Today' }),
  ).not.toBeChecked();
  await expect(page.getByRole('combobox', { name: 'Default task status' })).toHaveValue('todo');

  await page.goto('/today');
  await expect(page.getByRole('heading', { name: 'Completed today' })).toHaveCount(0);
  const compactRowPadding = await page
    .locator('.task-row')
    .first()
    .evaluate((element) => getComputedStyle(element).paddingTop);
  expect(compactRowPadding).toBe('9px');

  await page.goto('/tasks');
  await page.getByRole('button', { name: 'New task' }).click();
  const fullTaskDialog = page.getByRole('dialog', { name: 'New task' });
  await expect(fullTaskDialog.getByRole('combobox', { name: 'Status' })).toHaveValue('todo');
  await page.keyboard.press('Escape');

  await page.goto('/today?quick=add');
  const quickAddDialog = page.getByRole('dialog', { name: 'New task' });
  await quickAddDialog
    .getByRole('textbox', { name: 'Task name' })
    .fill('Capture quick-add default');
  await quickAddDialog.getByRole('button', { name: 'Add task' }).click();
  await expect(quickAddDialog).toBeHidden();
  await expect
    .poll(async () => {
      const workspace = await readWorkspace(page);
      return workspace?.tasks.find(
        (task: { title: string }) => task.title === 'Capture quick-add default',
      )?.status;
    })
    .toBe('todo');

  await page.goto('/projects/project-portfolio');
  await page.getByRole('button', { name: 'Add a task' }).click();
  await expect(page.getByText('Starts as To do')).toBeVisible();
  await page.getByRole('textbox', { name: 'Task name' }).fill('Capture project default');
  await page.getByRole('button', { name: 'Add task' }).click();
  await expect
    .poll(async () => {
      const workspace = await readWorkspace(page);
      return workspace?.tasks.find(
        (task: { title: string }) => task.title === 'Capture project default',
      );
    })
    .toMatchObject({ status: 'todo', projectId: 'project-portfolio' });
});

test('JSON export is readable, and restoring sample data requires explicit confirmation', async ({
  page,
}, testInfo) => {
  await page.goto('/settings');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export data' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^daymark-workspace-\d{4}-\d{2}-\d{2}\.json$/);
  const exportPath = testInfo.outputPath(download.suggestedFilename());
  await download.saveAs(exportPath);
  const exported = JSON.parse(await readFile(exportPath, 'utf8')) as {
    schemaVersion: number;
    data: { tasks: unknown[]; projects: unknown[]; activity: unknown[]; preferences: unknown };
  };
  expect(exported.schemaVersion).toBe(1);
  expect(exported.data.tasks).toHaveLength(10);
  expect(exported.data.projects.length).toBeGreaterThan(0);
  expect(exported.data.activity.length).toBeGreaterThan(0);
  expect(exported.data.preferences).toBeTruthy();
  await expect(page.getByRole('status')).toContainText('Workspace export downloaded.');

  await page.getByRole('radio', { name: /Dark/ }).check();
  const restoreButton = page.getByRole('button', { name: 'Restore sample data' });
  await restoreButton.click();
  const dialog = page.getByRole('dialog', { name: 'Restore the sample workspace?' });
  await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();
  await expect(dialog).toContainText('Changes you have not exported will be lost.');
  await expect(dialog).toContainText('This action cannot be undone.');
  await page.addScriptTag({ path: resolve(process.cwd(), 'node_modules/axe-core/axe.min.js') });
  expect(await auditAccessibility(page)).toEqual([]);

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(restoreButton).toBeFocused();
  expect(await readPreferences(page)).toMatchObject({ theme: 'dark' });

  await restoreButton.click();
  const confirmDialog = page.getByRole('dialog', { name: 'Restore the sample workspace?' });
  await confirmDialog.getByRole('button', { name: 'Restore sample data' }).click();
  await expect(confirmDialog).toBeHidden();
  await expect(restoreButton).toBeFocused();
  await expect(page.getByRole('status')).toContainText('Sample workspace restored.');
  await expect.poll(() => readPreferences(page)).toMatchObject({ theme: 'system' });
  await expect.poll(async () => (await readWorkspace(page))?.tasks.length).toBe(10);
});

test('clearing is confirmed, survives reload as an empty workspace, and reports storage failure without data loss', async ({
  page,
}) => {
  await page.goto('/settings');
  const initialData = await readWorkspace(page);
  const clearButton = page.getByRole('button', { name: 'Clear local data' });
  await clearButton.click();
  const dialog = page.getByRole('dialog', { name: 'Clear local data?' });
  await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();
  await expect(dialog).toContainText('Your workspace will remain empty after reload.');
  await expect(dialog).toContainText('Export a copy first if you may need this data.');
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(clearButton).toBeFocused();
  expect(await readWorkspace(page)).toEqual(initialData);

  await clearButton.click();
  const confirmDialog = page.getByRole('dialog', { name: 'Clear local data?' });
  await confirmDialog.getByRole('button', { name: 'Clear local data' }).click();
  await expect(confirmDialog).toBeHidden();
  await expect(clearButton).toBeFocused();
  await expect(page.getByRole('status')).toContainText('Local workspace cleared.');
  await expect
    .poll(async () => readWorkspace(page))
    .toMatchObject({
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

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Settings', level: 1 })).toBeVisible();
  await expect(page.locator('.settings-data-counts dd')).toHaveText(['0', '0', '0']);
  expect(await readWorkspace(page)).toMatchObject({ tasks: [], projects: [], activity: [] });

  await page.evaluate(() => {
    const originalSetItem = Storage.prototype.setItem;
    (
      window as Window & { __daymarkOriginalSetItem?: Storage['setItem'] }
    ).__daymarkOriginalSetItem = originalSetItem;
    Storage.prototype.setItem = function (key: string, value: string) {
      if (key === 'daymark:workspace:v1') {
        throw new DOMException('Storage quota exceeded', 'QuotaExceededError');
      }
      return originalSetItem.call(this, key, value);
    };
  });
  await page.getByRole('button', { name: 'Clear local data' }).click();
  const failedClearDialog = page.getByRole('dialog', { name: 'Clear local data?' });
  await failedClearDialog.getByRole('button', { name: 'Clear local data' }).click();
  await expect(page.getByLabel('Notifications').getByRole('alert')).toContainText(
    'Local data could not be cleared. Your current workspace is unchanged.',
  );
  await expect(page.getByText('Changes are held in this page only')).toBeVisible();
  await expect(page.getByText(/could not clear the saved workspace/i)).toBeVisible();
  expect(await readWorkspace(page)).toMatchObject({ tasks: [], projects: [], activity: [] });
  await page.evaluate(() => {
    const browserWindow = window as Window & { __daymarkOriginalSetItem?: Storage['setItem'] };
    if (browserWindow.__daymarkOriginalSetItem) {
      Storage.prototype.setItem = browserWindow.__daymarkOriginalSetItem;
      delete browserWindow.__daymarkOriginalSetItem;
    }
  });
  await page.addScriptTag({ path: resolve(process.cwd(), 'node_modules/axe-core/axe.min.js') });
  expect(await auditAccessibility(page)).toEqual([]);

  const retryButton = page.getByRole('button', { name: 'Retry saving' });
  await retryButton.click();
  await expect(page.locator('.settings-storage-status')).toHaveText('Saved in this browser');
  await expect
    .poll(async () => readWorkspace(page))
    .toMatchObject({
      tasks: [],
      projects: [],
      activity: [],
    });

  await page.evaluate(() => {
    const browserWindow = window as Window & { __daymarkOriginalSetItem?: Storage['setItem'] };
    browserWindow.__daymarkOriginalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key: string, value: string) {
      if (key === 'daymark:workspace:v1') {
        throw new DOMException('Storage quota exceeded', 'QuotaExceededError');
      }
      return browserWindow.__daymarkOriginalSetItem!.call(this, key, value);
    };
  });
  await page.getByRole('button', { name: 'Restore sample data' }).click();
  const failedRestoreDialog = page.getByRole('dialog', { name: 'Restore the sample workspace?' });
  await failedRestoreDialog.getByRole('button', { name: 'Restore sample data' }).click();
  await expect(page.getByLabel('Notifications').getByRole('alert')).toContainText(
    'Sample data is open in this page but could not be saved to this browser.',
  );
  await expect(page.getByText('Changes are held in this page only')).toBeVisible();
  await expect(page.getByText(/could not save to local storage/i)).toBeVisible();
  expect(await readWorkspace(page)).toMatchObject({ tasks: [], projects: [], activity: [] });
  expect(await auditAccessibility(page)).toEqual([]);

  await page.evaluate(() => {
    const browserWindow = window as Window & { __daymarkOriginalSetItem?: Storage['setItem'] };
    if (browserWindow.__daymarkOriginalSetItem) {
      Storage.prototype.setItem = browserWindow.__daymarkOriginalSetItem;
      delete browserWindow.__daymarkOriginalSetItem;
    }
  });
  await page.getByRole('button', { name: 'Retry saving' }).click();
  await expect(page.locator('.settings-storage-status')).toHaveText('Saved in this browser');
  await expect.poll(async () => (await readWorkspace(page))?.tasks.length).toBe(10);
});

test('Settings and its confirmation dialogs meet WCAG AA and stay within 320–1440px', async ({
  page,
}) => {
  await page.goto('/settings');
  await page.addScriptTag({ path: resolve(process.cwd(), 'node_modules/axe-core/axe.min.js') });
  expect(await auditAccessibility(page)).toEqual([]);

  await page.getByRole('radio', { name: /Dark/ }).check();
  expect(await auditAccessibility(page)).toEqual([]);
  await page.getByRole('radio', { name: /Light/ }).check();
  expect(await auditAccessibility(page)).toEqual([]);

  for (const width of [320, 375, 768, 860, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 820 });
    const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(
      documentWidth,
      `Settings must not overflow horizontally at ${width}px`,
    ).toBeLessThanOrEqual(width);
    await expect(page.getByRole('heading', { name: 'Settings', level: 1 })).toBeVisible();
  }

  await page.setViewportSize({ width: 320, height: 780 });
  const clearButton = page.getByRole('button', { name: 'Clear local data' });
  await clearButton.scrollIntoViewIfNeeded();
  await clearButton.click();
  const dialog = page.getByRole('dialog', { name: 'Clear local data?' });
  await expect(dialog).toBeVisible();
  expect(await auditAccessibility(page)).toEqual([]);
  const bounds = await dialog.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
  await page.keyboard.press('Escape');
  await expect(clearButton).toBeFocused();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
    'the open mobile confirmation must not create horizontal overflow',
  ).toBeLessThanOrEqual(320);
});

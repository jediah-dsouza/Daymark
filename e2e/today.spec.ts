import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';

test('Quick Add validates before creating, saves real fields, and survives reload', async ({
  page,
}) => {
  await page.goto('/today');
  const headerCreate = page.locator('.today-header').getByRole('button', { name: 'New task' });
  await headerCreate.click();

  const dialog = page.getByRole('dialog', { name: 'New task' });
  await expect(dialog).toBeVisible();
  const title = dialog.getByRole('textbox', { name: 'Task name' });
  await expect(title).toBeFocused();
  await dialog.getByRole('button', { name: 'Add task' }).click();
  await expect(dialog.getByText('Give the task a name.')).toBeVisible();
  await expect(title).toBeFocused();
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem('daymark:workspace:v1') ?? '{}').data.tasks.length,
    ),
  ).toBe(10);
  await expect(
    page.getByRole('link', { name: 'A task that must never exist', exact: true }),
  ).toHaveCount(0);

  await title.fill('Prepare the project handoff');
  await dialog.getByRole('combobox', { name: 'Priority' }).selectOption('high');
  const project = dialog.getByRole('combobox', { name: 'Project' });
  const projectId = await project.locator('option').nth(1).getAttribute('value');
  expect(projectId).toBeTruthy();
  await project.selectOption(projectId!);
  await dialog.getByRole('textbox', { name: 'Tags' }).fill('planning, review, PLANNING');
  await dialog.getByRole('button', { name: 'Add task' }).click();

  await expect(dialog).toBeHidden();
  await expect(page.getByText('Task added.', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Prepare the project handoff', exact: true }),
  ).toBeVisible();
  await expect(page.getByText('4 focus tasks', { exact: true })).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const record = JSON.parse(localStorage.getItem('daymark:workspace:v1') ?? '{}');
        return record.data.tasks.find(
          (task: { title: string }) => task.title === 'Prepare the project handoff',
        );
      }),
    )
    .toMatchObject({
      priority: 'high',
      projectId,
      tags: ['planning', 'review'],
      dueDate: expect.any(String),
    });

  await page.reload();
  await expect(
    page.getByRole('link', { name: 'Prepare the project handoff', exact: true }),
  ).toBeVisible();
});

test('completion updates Today groups and progress, records activity, and supports Undo', async ({
  page,
}) => {
  await page.goto('/today');
  const overdueRow = page.locator('.today-section--overdue .task-row').first();
  const taskTitle = (await overdueRow.locator('.task-row__title').innerText()).trim();
  await overdueRow.getByRole('button', { name: `Complete ${taskTitle}` }).click();

  await expect(page.locator('.today-section--overdue .task-row')).toHaveCount(0);
  await expect(
    page.locator('.completed-section .task-row').filter({ hasText: taskTitle }),
  ).toHaveCount(1);
  await expect(page.getByText('Task completed.', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('progressbar', { name: 'Today’s completion progress' }),
  ).toHaveAttribute('aria-valuenow', '50');
  await expect(page.getByText(`Completed ${taskTitle}`, { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(page.locator('.today-section--overdue .task-row')).toHaveCount(1);
  await expect(page.getByText('Completion undone.', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('progressbar', { name: 'Today’s completion progress' }),
  ).toHaveAttribute('aria-valuenow', '40');
  await page.reload();
  await expect(page.locator('.today-section--overdue .task-row .task-row__title')).toContainText(
    taskTitle,
  );
});

test('delete asks for confirmation, can be undone, and persists the restored task', async ({
  page,
}) => {
  await page.goto('/today');
  const focusSection = page
    .locator('.today-section')
    .filter({ has: page.getByRole('heading', { name: 'Focus for today' }) });
  const row = focusSection.locator('.task-row').first();
  const taskTitle = (await row.locator('.task-row__title').innerText()).trim();
  await row.locator('summary').click();
  await row.getByRole('button', { name: 'Delete task' }).click();

  const dialog = page.getByRole('dialog', { name: 'Delete this task?' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText(taskTitle);
  await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();
  await dialog.getByRole('button', { name: 'Delete task' }).click();
  await expect(page.getByRole('link', { name: taskTitle, exact: true })).toHaveCount(0);
  await expect(page.getByText('Task deleted.', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(page.getByRole('link', { name: taskTitle, exact: true })).toBeVisible();
  await expect(page.getByText('Task restored.', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('link', { name: taskTitle, exact: true })).toBeVisible();
});

test('Quick Add closes with Escape and restores focus to its trigger', async ({ page }) => {
  await page.goto('/today');
  const trigger = page.locator('.today-header').getByRole('button', { name: 'New task' });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'New task' });
  await expect(dialog.getByRole('textbox', { name: 'Task name' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('Today and its modal are accessible at mobile widths in light and dark themes', async ({
  page,
}) => {
  await page.goto('/today');
  await page.addScriptTag({ path: resolve(process.cwd(), 'node_modules/axe-core/axe.min.js') });
  const audit = async () =>
    page.evaluate(async () => {
      type AxeResult = {
        violations: Array<{ id: string; impact: string | null; help: string; nodes: unknown[] }>;
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
      }));
    });

  expect(await audit()).toEqual([]);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.locator('.today-header').getByRole('button', { name: 'New task' }).click();
  const lightDialog = page.getByRole('dialog', { name: 'New task' });
  await expect(lightDialog).toBeVisible();
  expect(await audit()).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(lightDialog).toBeHidden();
  await page.setViewportSize({ width: 1280, height: 850 });

  const themeControl = page.getByRole('button', { name: /Theme: System/i });
  await themeControl.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: /Theme: Light/i }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.waitForTimeout(240);
  expect(await audit()).toEqual([]);

  for (const { width, height } of [
    { width: 320, height: 568 },
    { width: 375, height: 812 },
    { width: 768, height: 850 },
    { width: 1024, height: 850 },
  ]) {
    await page.setViewportSize({ width, height });
    const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(documentWidth, `Today must not overflow at ${width}px`).toBeLessThanOrEqual(width);
    const trigger = page.locator('.today-header').getByRole('button', { name: 'New task' });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'New task' });
    await expect(dialog).toBeVisible();
    if (width <= 680) {
      expect(await audit()).toEqual([]);
      const submitBounds = await dialog.getByRole('button', { name: 'Add task' }).boundingBox();
      expect(submitBounds).not.toBeNull();
      expect(submitBounds!.y).toBeGreaterThanOrEqual(0);
      expect(submitBounds!.y + submitBounds!.height).toBeLessThanOrEqual(height);
      const fields = dialog.locator('.quick-add-form__fields');
      const tags = dialog.getByRole('textbox', { name: 'Tags' });
      if (width <= 360 && height <= 640) {
        const fieldsBounds = await fields.boundingBox();
        const dueDateBounds = await dialog.getByLabel('Due date').boundingBox();
        expect(fieldsBounds).not.toBeNull();
        expect(dueDateBounds).not.toBeNull();
        expect(dueDateBounds!.y + dueDateBounds!.height).toBeLessThanOrEqual(
          fieldsBounds!.y + fieldsBounds!.height,
        );
        await expect(dialog.getByText('More task details below')).toBeVisible();
      }
      await fields.evaluate((element) => {
        element.scrollTop = element.scrollHeight;
      });
      const fieldsBounds = await fields.boundingBox();
      const tagsBounds = await tags.boundingBox();
      const submitAfterScroll = await dialog
        .getByRole('button', { name: 'Add task' })
        .boundingBox();
      expect(fieldsBounds).not.toBeNull();
      expect(tagsBounds).not.toBeNull();
      expect(submitAfterScroll).not.toBeNull();
      expect(tagsBounds!.y).toBeGreaterThanOrEqual(fieldsBounds!.y);
      expect(tagsBounds!.y + tagsBounds!.height).toBeLessThanOrEqual(
        fieldsBounds!.y + fieldsBounds!.height,
      );
      expect(submitAfterScroll!.y).toBeCloseTo(submitBounds!.y, 0);
      if (width <= 360 && height <= 640) {
        await expect(dialog.getByText('More task details below')).toHaveCount(0);
      }
    }
    const bounds = await dialog.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  }
});

test('empty Today explains the open day and keeps a working create action', async ({ page }) => {
  await page.goto('/today');
  await page.evaluate(() => {
    const record = JSON.parse(localStorage.getItem('daymark:workspace:v1') ?? 'null');
    if (!record?.data) throw new Error('The sample workspace did not persist.');
    record.data.tasks = [];
    record.data.activity = [];
    localStorage.setItem('daymark:workspace:v1', JSON.stringify(record));
  });
  await page.reload();

  await expect(
    page.getByRole('heading', { name: 'Nothing needs your attention today.' }),
  ).toBeVisible();
  await expect(
    page.getByRole('progressbar', { name: 'Today’s completion progress' }),
  ).toHaveAttribute('aria-valuenow', '0');
  await expect(
    page.getByText('Your latest task and project changes will appear here.'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Add a task for today' }).click();
  await expect(page.getByRole('dialog', { name: 'New task' })).toBeVisible();
});

test('memory-only storage failure is clear, offers recovery, and saves after retry', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const state = window as Window & { __daymarkOriginalSetItem?: Storage['setItem'] };
    const originalSetItem = Storage.prototype.setItem;
    state.__daymarkOriginalSetItem = originalSetItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === 'daymark:workspace:v1') {
        throw new DOMException('Quota exceeded', 'QuotaExceededError');
      }
      originalSetItem.call(this, key, value);
    };
  });
  await page.goto('/today');

  const recovery = page.locator('.today-error-state');
  await expect(
    recovery.getByRole('heading', { name: 'Your work is open, but this browser cannot save it.' }),
  ).toBeVisible();
  await expect(recovery).toContainText('may not survive a reload');
  await expect(recovery.getByRole('button', { name: 'Retry saving' })).toBeEnabled();
  await expect(recovery.getByRole('button', { name: 'Reset sample' })).toBeEnabled();
  expect(await page.evaluate(() => localStorage.getItem('daymark:workspace:v1'))).toBeNull();

  await page.evaluate(() => {
    const state = window as Window & { __daymarkOriginalSetItem?: Storage['setItem'] };
    if (!state.__daymarkOriginalSetItem) throw new Error('The original storage writer is missing.');
    Storage.prototype.setItem = state.__daymarkOriginalSetItem;
  });
  await recovery.getByRole('button', { name: 'Retry saving' }).click();
  await expect(recovery).toHaveCount(0);
  await expect
    .poll(() =>
      page.evaluate(() => {
        const record = JSON.parse(localStorage.getItem('daymark:workspace:v1') ?? 'null');
        return record?.data?.tasks?.length ?? 0;
      }),
    )
    .toBe(10);
});

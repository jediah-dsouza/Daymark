import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';

test('global search shortcut, project-name search, combined filters and clear behavior work', async ({
  page,
}) => {
  await page.goto('/today');
  await page.keyboard.press('Control+k');
  const search = page.getByRole('searchbox', { name: 'Search tasks and projects' });
  const list = page.getByRole('list', { name: 'Tasks' });
  const taskRows = list.locator(':scope > li');
  await expect(search).toBeFocused();
  await expect(page).toHaveURL(/\/tasks(?:\?|$)/);
  await expect(taskRows).toHaveCount(10);

  await search.fill('Internship Deliverables');
  await expect(taskRows).toHaveCount(3);
  await search.fill('review');
  await page.getByRole('button', { name: /Filters/ }).click();
  await page.getByRole('combobox', { name: 'Status' }).selectOption('todo');
  await page.getByRole('combobox', { name: 'Priority' }).selectOption('high');
  await page.getByRole('combobox', { name: 'Project' }).selectOption('project-internship');
  await expect(taskRows).toHaveCount(1);
  await expect(
    list.getByRole('link', { name: 'Prepare Task 2 internship submission' }),
  ).toBeVisible();
  await expect(page.getByText(/Filters:.*To do.*High.*Internship Deliverables/i)).toBeVisible();

  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(search).toHaveValue('review');
  await expect(taskRows).toHaveCount(3);
  await page.getByRole('button', { name: 'Clear all' }).click();
  await expect(search).toHaveValue('');
  await expect(taskRows).toHaveCount(10);
  await page.getByLabel('Sort by').selectOption('title');
  await expect(taskRows.first()).toContainText('Audit mobile navigation');

  const rowActions = taskRows
    .filter({ hasText: 'Refine portfolio case-study layout' })
    .locator('details.task-row__actions');
  const rowSummary = rowActions.locator('summary');
  await rowSummary.click();
  await page.keyboard.press('Escape');
  await expect(rowSummary).toBeFocused();
  await expect(rowActions).not.toHaveAttribute('open', '');
});

test('full task creation validates, persists, opens detail, edits, and can be deleted/restored', async ({
  page,
}) => {
  await page.goto('/tasks');
  const newTaskButton = page.getByRole('button', { name: 'New task' });
  await newTaskButton.click();
  const createDialog = page.getByRole('dialog', { name: 'New task' });
  const title = createDialog.getByRole('textbox', { name: 'Task name' });
  await expect(title).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(createDialog).toBeHidden();
  await expect(newTaskButton).toBeFocused();
  await newTaskButton.click();
  await expect(title).toBeFocused();
  await createDialog.getByRole('button', { name: 'Create task' }).click();
  await expect(createDialog.getByText('Give the task a name.')).toBeVisible();
  await expect(title).toBeFocused();
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem('daymark:workspace:v1') ?? '{}').data.tasks.length,
    ),
  ).toBe(10);

  await title.fill('Prepare the weekly handoff');
  await createDialog
    .getByRole('textbox', { name: 'Description' })
    .fill('Summarize decisions and next steps.');
  await createDialog.getByRole('combobox', { name: 'Status' }).selectOption('todo');
  await createDialog.getByRole('combobox', { name: 'Priority' }).selectOption('high');
  await createDialog.getByLabel('Due date').fill('2026-10-05');
  await createDialog.getByRole('combobox', { name: 'Project' }).selectOption('project-internship');
  await createDialog.getByRole('textbox', { name: 'Tags' }).fill('writing, handoff, WRITING');
  await createDialog.getByRole('button', { name: 'Create task' }).click();
  await expect(createDialog).toBeHidden();
  await expect(newTaskButton).toBeFocused();
  await expect(page.getByText('Task created.', { exact: true })).toBeVisible();
  const taskLink = page.getByRole('link', { name: 'Prepare the weekly handoff', exact: true });
  await expect(taskLink).toBeVisible();
  await taskLink.click();
  await expect(page).toHaveURL(/\/tasks\/task-/);
  await expect(
    page.getByRole('heading', { name: 'Prepare the weekly handoff', level: 1 }),
  ).toBeVisible();
  await expect(
    page
      .getByRole('region', { name: 'Description' })
      .getByText('Summarize decisions and next steps.'),
  ).toBeVisible();
  await expect(
    page.getByRole('region', { name: 'Details' }).getByRole('link', {
      name: 'Internship Deliverables',
    }),
  ).toBeVisible();
  await expect(page.getByText('Added Prepare the weekly handoff')).toBeVisible();

  await page.getByRole('button', { name: 'Edit task' }).click();
  const editDialog = page.getByRole('dialog', { name: 'Edit task' });
  await editDialog
    .getByRole('textbox', { name: 'Task name' })
    .fill('Prepare the final weekly handoff');
  await editDialog
    .getByRole('textbox', { name: 'Description' })
    .fill('Decisions, owners, and next steps.');
  await editDialog.getByRole('button', { name: 'Save changes' }).click();
  await expect(
    page.getByRole('heading', { name: 'Prepare the final weekly handoff', level: 1 }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Edit task' })).toBeFocused();
  await expect(page.getByText('Updated Prepare the final weekly handoff')).toBeVisible();
  await expect(page.getByText('Task updated.', { exact: true })).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const data = JSON.parse(localStorage.getItem('daymark:workspace:v1') ?? '{}').data;
        return data.tasks.find(
          (task: { title: string }) => task.title === 'Prepare the final weekly handoff',
        );
      }),
    )
    .toMatchObject({
      status: 'todo',
      priority: 'high',
      dueDate: '2026-10-05',
      projectId: 'project-internship',
      tags: ['writing', 'handoff'],
      description: 'Decisions, owners, and next steps.',
    });

  const detailActions = page.locator('.task-detail-more');
  const detailSummary = detailActions.locator('summary');
  await detailSummary.click();
  await page.keyboard.press('Escape');
  await expect(detailSummary).toBeFocused();
  await expect(detailActions).not.toHaveAttribute('open', '');
  await detailSummary.click();
  await page
    .getByRole('group', { name: 'Task actions' })
    .getByRole('button', { name: 'Delete task' })
    .click();
  const deleteDialog = page.getByRole('dialog', { name: 'Delete this task?' });
  await expect(deleteDialog).toContainText('Prepare the final weekly handoff');
  await deleteDialog.getByRole('button', { name: 'Delete task' }).click();
  await expect(page.getByRole('heading', { name: 'This task was deleted.' })).toBeVisible();
  await expect(page.locator('#main-content')).toBeFocused();
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(
    page.getByRole('heading', { name: 'Prepare the final weekly handoff', level: 1 }),
  ).toBeVisible();
  await expect(page.getByText('Task restored.', { exact: true })).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Prepare the final weekly handoff', level: 1 }),
  ).toBeVisible();
});

test('task list, create form and task detail remain accessible and within narrow viewports', async ({
  page,
}) => {
  await page.goto('/tasks');
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
  for (const { width, height } of [
    { width: 320, height: 568 },
    { width: 375, height: 812 },
    { width: 768, height: 850 },
    { width: 1024, height: 850 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize({ width, height });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
      `Tasks overflow at ${width}px`,
    ).toBeLessThanOrEqual(width);
    await page.getByRole('button', { name: 'New task' }).click();
    const dialog = page.getByRole('dialog', { name: 'New task' });
    await expect(dialog).toBeVisible();
    const dialogBounds = await dialog.boundingBox();
    expect(dialogBounds).not.toBeNull();
    expect(dialogBounds!.x).toBeGreaterThanOrEqual(0);
    expect(dialogBounds!.x + dialogBounds!.width).toBeLessThanOrEqual(width + 1);
    expect(dialogBounds!.y).toBeGreaterThanOrEqual(0);
    expect(dialogBounds!.y + dialogBounds!.height).toBeLessThanOrEqual(height + 1);
    if (width <= 768) expect(await audit()).toEqual([]);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  }

  await page.getByRole('link', { name: 'Refine portfolio case-study layout' }).click();
  await expect(
    page.getByRole('heading', { name: 'Refine portfolio case-study layout', level: 1 }),
  ).toBeVisible();
  await expect(await audit()).toEqual([]);
  const theme = page.getByRole('button', { name: /Theme:/i });
  await theme.click();
  await page.getByRole('button', { name: /Theme: Light/i }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.waitForTimeout(240);
  await expect(await audit()).toEqual([]);
});

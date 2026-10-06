import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';

const auditAccessibility = async (page: import('@playwright/test').Page) => {
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

test('project create/edit, archive/restore and persistence retain context and keyboard focus', async ({
  page,
}) => {
  await page.goto('/projects');
  await expect(page.getByRole('heading', { name: 'Projects', level: 1 })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Active 4' })).toBeVisible();
  await expect(page.locator('.project-card')).toHaveCount(4);

  await page.getByRole('button', { name: 'New project' }).click();
  const createDialog = page.getByRole('dialog', { name: 'New project' });
  const name = createDialog.getByRole('textbox', { name: 'Project name' });
  await expect(name).toBeFocused();
  await createDialog.getByRole('button', { name: 'Create project' }).click();
  await expect(createDialog.getByText('Give the project a name.')).toBeVisible();
  await expect(name).toBeFocused();

  await name.fill('Reading notebook');
  await createDialog.getByRole('textbox', { name: 'Description' }).fill('A home for source notes.');
  await createDialog.getByRole('radio', { name: /Rust/ }).check();
  await createDialog.getByRole('button', { name: 'Create project' }).click();
  await expect(createDialog).toBeHidden();
  await expect(page.getByText('Project created.', { exact: true })).toBeVisible();
  let card = page.locator('.project-card').filter({ hasText: 'Reading notebook' });
  await expect(card).toBeVisible();
  await page.reload();
  card = page.locator('.project-card').filter({ hasText: 'Reading notebook' });
  await expect(card).toBeVisible();

  await card.locator('details summary').click();
  await card
    .getByRole('group', { name: 'Actions for Reading notebook' })
    .getByRole('button', { name: 'Edit project' })
    .click();
  const editDialog = page.getByRole('dialog', { name: 'Edit project' });
  await expect(editDialog.getByRole('textbox', { name: 'Project name' })).toHaveValue(
    'Reading notebook',
  );
  await editDialog.getByRole('textbox', { name: 'Project name' }).fill('Reading field notes');
  await editDialog.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('link', { name: 'Reading field notes', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Edit project' })).toBeFocused();

  const renamedCard = page.locator('.project-card').filter({ hasText: 'Reading field notes' });
  const renamedActions = renamedCard.locator('details');
  if (!(await renamedActions.evaluate((node) => (node as HTMLDetailsElement).open))) {
    await renamedActions.locator('summary').click();
  }
  await renamedCard
    .getByRole('group', { name: 'Actions for Reading field notes' })
    .getByRole('button', { name: 'Archive project' })
    .click();
  await expect(renamedCard).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Active 4' })).toBeFocused();
  await page.getByRole('button', { name: 'Archived 1' }).click();
  const archivedCard = page.locator('.project-card').filter({ hasText: 'Reading field notes' });
  await expect(archivedCard).toBeVisible();
  await archivedCard.getByRole('link', { name: 'Open Reading field notes' }).click();
  await expect(page.getByText('Archived project', { exact: true })).toBeVisible();
  await expect(page.locator('.project-archived-notice')).toContainText(
    'Its tasks and history are preserved; new tasks can’t be assigned here.',
  );
  await expect(page.getByRole('button', { name: 'Add a task' })).toHaveCount(0);
  await page
    .locator('.project-archived-notice')
    .getByRole('button', { name: 'Restore project' })
    .click();
  await expect(page.getByText('Project workspace', { exact: true })).toBeVisible();
  await page.locator('#main-content').getByRole('link', { name: 'All projects' }).click();
  await expect(page.getByRole('button', { name: 'Active 5' })).toBeVisible();

  const restoredCard = page.locator('.project-card').filter({ hasText: 'Reading field notes' });
  await restoredCard.locator('details summary').click();
  await restoredCard
    .getByRole('group', { name: 'Actions for Reading field notes' })
    .getByRole('button', { name: 'Archive project' })
    .click();
  await expect(restoredCard).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Active 4' })).toBeFocused();
  await page.getByRole('button', { name: 'Archived 1' }).click();
  const finalArchivedCard = page
    .locator('.project-card')
    .filter({ hasText: 'Reading field notes' });
  await finalArchivedCard.locator('details summary').click();
  await finalArchivedCard
    .getByRole('group', { name: 'Actions for Reading field notes' })
    .getByRole('button', { name: 'Restore project' })
    .click();
  await expect(finalArchivedCard).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Archived 0' })).toBeFocused();
  await page.getByRole('button', { name: 'Active 5' }).click();
  await expect(page.getByRole('link', { name: 'Reading field notes', exact: true })).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const data = JSON.parse(localStorage.getItem('daymark:workspace:v1') ?? '{}').data;
        return data.projects.find(
          (project: { name: string }) => project.name === 'Reading field notes',
        );
      }),
    )
    .toMatchObject({
      archived: false,
      colorToken: 'rust',
      description: 'A home for source notes.',
    });
});

test('project tasks are filtered and progress is derived; deletion preserves and unassigns tasks', async ({
  page,
}) => {
  await page.goto('/projects/project-portfolio');
  await expect(page.getByRole('heading', { name: 'Portfolio Refresh', level: 1 })).toBeVisible();
  const progress = page.getByRole('progressbar', { name: 'Portfolio Refresh completion' });
  await expect(progress).toHaveAttribute('aria-valuenow', '0');
  const taskList = page.getByRole('list', { name: 'Portfolio Refresh tasks' });
  await expect(taskList.locator(':scope > li')).toHaveCount(3);

  await page.getByRole('button', { name: 'Add a task' }).click();
  const title = page.getByRole('textbox', { name: 'Task name' });
  await expect(title).toBeFocused();
  await page.getByRole('button', { name: 'Add task' }).click();
  await expect(page.getByText('Give the task a name.')).toBeVisible();
  await title.fill('Document project handoff');
  await page.getByRole('combobox', { name: 'Priority' }).selectOption('high');
  await page.getByLabel('Due date').fill('2026-10-06');
  await page.getByRole('button', { name: 'Add task' }).click();
  await expect(taskList.getByRole('link', { name: 'Document project handoff' })).toBeVisible();
  await expect(page.getByText('Task added to this project.', { exact: true })).toBeVisible();

  await page.getByRole('searchbox', { name: 'Search tasks and projects' }).fill('project handoff');
  await page.getByRole('button', { name: /^Filters/ }).click();
  await page.getByRole('combobox', { name: 'Status' }).selectOption('inbox');
  await page.getByRole('combobox', { name: 'Priority' }).selectOption('high');
  await expect(taskList.locator(':scope > li')).toHaveCount(1);
  await expect(taskList.getByRole('link', { name: 'Document project handoff' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.getByRole('searchbox', { name: 'Search tasks and projects' })).toHaveValue(
    'project handoff',
  );
  await page.getByRole('button', { name: 'Clear all' }).click();
  await expect(taskList.locator(':scope > li')).toHaveCount(4);

  await taskList.getByRole('button', { name: 'Complete Document project handoff' }).click();
  await expect(progress).toHaveAttribute('aria-valuenow', '25');
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(progress).toHaveAttribute('aria-valuenow', '0');
  await taskList.getByRole('button', { name: 'Complete Document project handoff' }).click();
  await expect(progress).toHaveAttribute('aria-valuenow', '25');

  await page.locator('.project-detail-more summary').click();
  await page
    .getByRole('group', { name: 'Project actions' })
    .getByRole('button', { name: 'Delete project' })
    .click();
  const deleteDialog = page.getByRole('dialog', { name: 'Delete this project?' });
  await expect(deleteDialog).toContainText(
    '4 associated tasks will stay in your workspace and become unassigned.',
  );
  await expect(deleteDialog).toContainText('No tasks will be deleted.');
  await page.addScriptTag({ path: resolve(process.cwd(), 'node_modules/axe-core/axe.min.js') });
  expect(await auditAccessibility(page)).toEqual([]);
  await deleteDialog.getByRole('button', { name: 'Delete project' }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(page.locator('#main-content')).toBeFocused();
  await expect(
    page.getByText('Project deleted. 4 tasks were kept and unassigned.', { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Portfolio Refresh', exact: true })).toHaveCount(0);

  await page.goto('/tasks');
  const taskSearch = page.getByRole('searchbox', { name: 'Search tasks and projects' });
  await taskSearch.fill('Document project handoff');
  const unassignedTaskLink = page.getByRole('link', {
    name: 'Document project handoff',
    exact: true,
  });
  await expect(unassignedTaskLink).toBeVisible();
  await unassignedTaskLink.click();
  await expect(page.getByRole('region', { name: 'Details' })).toContainText('No project');
  await expect(page.getByText('Unassigned from Portfolio Refresh')).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Document project handoff', level: 1 }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => {
      const data = JSON.parse(localStorage.getItem('daymark:workspace:v1') ?? '{}').data;
      return data.tasks.find(
        (task: { title: string }) => task.title === 'Document project handoff',
      );
    }),
  ).toMatchObject({ status: 'completed', projectId: null });
});

test('Project routes, forms and composer meet WCAG AA and remain within 320–1440px', async ({
  page,
}) => {
  await page.goto('/projects');
  await page.addScriptTag({ path: resolve(process.cwd(), 'node_modules/axe-core/axe.min.js') });
  expect(await auditAccessibility(page)).toEqual([]);

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
      `project index overflow at ${width}px`,
    ).toBeLessThanOrEqual(width);
  }

  await page.getByRole('button', { name: 'New project' }).click();
  const projectDialog = page.getByRole('dialog', { name: 'New project' });
  expect(await auditAccessibility(page)).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(projectDialog).toBeHidden();
  await page.getByRole('link', { name: 'Internship Deliverables', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Internship Deliverables', level: 1 }),
  ).toBeVisible();
  expect(await auditAccessibility(page)).toEqual([]);
  await page.getByRole('button', { name: 'Add a task' }).click();
  expect(await auditAccessibility(page)).toEqual([]);

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
      `project detail overflow at ${width}px`,
    ).toBeLessThanOrEqual(width);
  }

  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Add a task' })).toBeFocused();
  await page.goto('/projects/unknown-project');
  await expect(page.getByRole('heading', { level: 1, name: 'Project not found.' })).toBeVisible();
  await expect(page).toHaveTitle('Project not found — Daymark');
});

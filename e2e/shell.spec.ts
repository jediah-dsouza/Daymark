import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';

test('the shell composes without horizontal overflow across mobile, tablet, and desktop widths', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Today, in focus' })).toBeVisible();

  for (const width of [320, 375, 768, 860, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(
      documentWidth,
      `page should not overflow horizontally at ${width}px`,
    ).toBeLessThanOrEqual(width);
    if (width < 681) {
      await expect(page.locator('.mobile-navigation')).toBeVisible();
      await expect(page.locator('.sidebar')).toBeHidden();
    } else {
      await expect(page.locator('.sidebar')).toBeVisible();
      await expect(page.locator('.mobile-navigation')).toBeHidden();
    }
  }
});

test('mobile navigation reaches all four primary routes and tracks the active route', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 780 });
  await page.goto('/');
  const navigation = page.getByRole('navigation', { name: 'Primary mobile navigation' });
  await expect(navigation).toBeVisible();

  for (const [label, path] of [
    ['Today', '/'],
    ['Tasks', '/tasks'],
    ['Projects', '/projects'],
    ['Settings', '/settings'],
  ]) {
    const link = navigation.getByRole('link', { name: label });
    await expect(link).toHaveAttribute('href', path);
    await link.click();
    await expect(link).toHaveAttribute('aria-current', 'page');
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
      `mobile navigation to ${label} must not overflow at 320px`,
    ).toBeLessThanOrEqual(320);
  }
});

test('keyboard entry reaches the skip link and theme preference survives reload', async ({
  page,
}) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();

  const themeButton = page.getByRole('button', { name: /Theme: System/i });
  await themeButton.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const record = localStorage.getItem('daymark:workspace:v1');
        return record ? JSON.parse(record).data.preferences.theme : null;
      }),
    )
    .toBe('light');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.getByRole('button', { name: /Theme: Light/i })).toBeVisible();
});

test('project, missing-entity, and catch-all routes communicate identity and useful titles', async ({
  page,
}) => {
  await page.goto('/projects/project-portfolio');
  await expect(page.getByRole('heading', { level: 1, name: 'Portfolio Refresh' })).toBeVisible();
  await expect(page).toHaveTitle('Portfolio Refresh — Daymark');

  await page.goto('/tasks/unknown-task');
  await expect(page.getByRole('heading', { level: 1, name: 'Task not found.' })).toBeVisible();
  await expect(page).toHaveTitle('Task not found — Daymark');

  await page.goto('/not-a-route');
  await expect(
    page.getByRole('heading', { level: 1, name: 'This page isn’t here.' }),
  ).toBeVisible();
  await expect(page).toHaveTitle('Page not found — Daymark');
});

test('the static route manifest matches the page route patterns', async ({ request }) => {
  const response = await request.get('/manus-routes.json');
  expect(response.status()).toBe(200);
  const manifest = (await response.json()) as { routes: Array<{ path: string; title?: string }> };
  expect(manifest.routes.map(({ path }) => path)).toEqual([
    '/',
    '/today',
    '/tasks',
    '/tasks/:taskId',
    '/projects',
    '/projects/:projectId',
    '/settings',
  ]);
});

test('light and dark shells have no automated WCAG A/AA or best-practice findings', async ({
  page,
}) => {
  await page.goto('/');
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
  await page.getByRole('button', { name: /Theme: System/i }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.waitForTimeout(180);
  expect(await audit()).toEqual([]);

  await page.getByRole('button', { name: /Theme: Light/i }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.waitForTimeout(180);
  expect(await audit()).toEqual([]);
});

test('the authored favicon and shell assets load without console or HTTP errors', async ({
  page,
}) => {
  const failures: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') failures.push(message.text());
  });
  page.on('response', (response) => {
    if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`);
  });

  await page.goto('/');
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/favicon.svg');
  const favicon = await page.request.get('/favicon.svg');
  expect(favicon.status()).toBe(200);
  expect(favicon.headers()['content-type']).toContain('image/svg+xml');
  expect(failures).toEqual([]);
});

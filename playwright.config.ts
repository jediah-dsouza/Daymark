import { existsSync } from 'node:fs';
import { defineConfig } from '@playwright/test';

const systemChromium =
  process.env.CHROMIUM_PATH ?? (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
const launchOptions = {
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
  ...(systemChromium ? { executablePath: systemChromium } : {}),
};
function resolveBrowserName(value: string | undefined): 'chromium' | 'firefox' | 'webkit' {
  if (value === undefined || value === 'chromium') return 'chromium';
  if (value === 'firefox' || value === 'webkit') return value;
  throw new Error('PLAYWRIGHT_BROWSER must be one of: chromium, firefox, webkit.');
}
const browserName = resolveBrowserName(process.env.PLAYWRIGHT_BROWSER);

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  timeout: 30_000,
  use: {
    baseURL: 'http://127.0.0.1:3000',
    browserName,
    viewport: { width: 1440, height: 900 },
    ...(browserName === 'chromium' ? { launchOptions } : {}),
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'pnpm dev',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});

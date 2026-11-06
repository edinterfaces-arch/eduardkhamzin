import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/browser.spec.js',
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  use: { baseURL: process.env.PORTFOLIO_URL || 'http://localhost:4173', browserName: 'chromium', headless: true },
  reporter: 'list',
});

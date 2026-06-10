import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  use: {
    baseURL: 'http://localhost:5173',
    headless: false,
  },

  webServer: {
    command: 'npm run start:dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
});
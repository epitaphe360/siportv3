import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export default defineConfig({
  testDir: 'e2e',
  testMatch: ['**/*.spec.ts'],
  timeout: 30000,
  workers: 1,
  retries: 0,
  fullyParallel: false,
  use: {
    baseURL: 'http://localhost:9323',
    headless: true,
    viewport: { width: 1280, height: 800 },
  },
  webServer: {
    command: 'npm run dev',
    port: 9323,
    reuseExistingServer: true,
    timeout: 60000,
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } }
  ]
});

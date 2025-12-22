import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export default defineConfig({
  testDir: 'e2e',
  testMatch: ['**/*.spec.ts'],
  timeout: 60000, // 60 secondes par test
  workers: 1, // Un seul worker pour éviter les crashes mémoire
  retries: 1, // 1 retry en cas d'échec
  fullyParallel: false,
  maxFailures: 50, // Arrêter après 50 échecs pour voir les patterns
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results.json' }]
  ],
  use: {
    baseURL: 'http://localhost:9323',
    headless: true,
    viewport: { width: 1280, height: 800 },
    actionTimeout: 15000,
    navigationTimeout: 30000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    port: 9323,
    reuseExistingServer: true,
    timeout: 120000, // 2 minutes pour démarrer le serveur
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } }
  ]
});

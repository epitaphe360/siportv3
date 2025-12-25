import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export default defineConfig({
  testDir: 'e2e',
  testMatch: ['**/*.spec.ts'],
  timeout: 30000, // 30 secondes par test (plus rapide)
  workers: 3, // 3 workers en parallèle
  retries: 0, // Pas de retry pour aller plus vite
  fullyParallel: true, // Parallélisation complète
  maxFailures: 100, // Continuer plus longtemps pour voir tous les bugs
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results.json' }]
  ],
  use: {
    baseURL: 'http://localhost:9323',
    headless: true,
    viewport: { width: 1280, height: 800 },
    actionTimeout: 10000,
    navigationTimeout: 60000,
    trace: 'off', // Désactivé pour la vitesse
    screenshot: 'only-on-failure',
    video: 'off',
  },
  webServer: {
    command: 'npm run dev',
    port: 9323,
    reuseExistingServer: true,
    timeout: 120000,
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } }
  ]
});

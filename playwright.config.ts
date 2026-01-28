import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export default defineConfig({
  testDir: '.',
  testMatch: ['**/*.spec.ts'],
  timeout: 30000, // 30 secondes par test (plus rapide)
  workers: 1, // 1 worker pour éviter les conflits de screenshots
  retries: 0, // Pas de retry pour aller plus vite
  fullyParallel: false, // Pas de parallélisation
  maxFailures: 1, // S'arrêter dès la première erreur pour corriger
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results.json' }]
  ],
  use: {
    baseURL: 'http://localhost:9324',
    headless: true,
    viewport: { width: 1280, height: 800 },
    actionTimeout: 10000,
    navigationTimeout: 60000,
    trace: 'off', // Désactivé pour la vitesse
    screenshot: 'on', // Prendre tous les screenshots
    screenshotDir: 'screenshoots/inscription partenaire',
    video: 'off',
  },
  webServer: {
    command: 'npm run dev -- --port 9324',
    port: 9324,
    reuseExistingServer: true,
    timeout: 120000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } }
  ]
});

import { Page, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

/**
 * ============================================================================
 * E2E TEST HELPERS & UTILITIES
 * ============================================================================
 */

// Supabase client for database operations
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Database Cleanup Helpers
 */
export class DatabaseHelper {
  /**
   * Delete all test data created during tests
   */
  static async cleanupTestData() {
    try {
      // Delete test users (emails containing 'test.com' or starting with specific prefixes)
      await supabase
        .from('users')
        .delete()
        .or('email.like.%test.com,email.like.visitor_%,email.like.exhibitor_%,email.like.partner_%');

      // Delete test events
      await supabase
        .from('events')
        .delete()
        .like('title', '%Test%');

      // Delete test appointments
      await supabase
        .from('appointments')
        .delete()
        .is('created_at', 'gte', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      console.log('✅ Test data cleaned up successfully');
    } catch (error) {
      console.error('❌ Error cleaning up test data:', error);
    }
  }

  /**
   * Reset specific table
   */
  static async resetTable(tableName: string) {
    try {
      await supabase.from(tableName).delete().neq('id', '00000000-0000-0000-0000-000000000000');
      console.log(`✅ Table ${tableName} reset`);
    } catch (error) {
      console.error(`❌ Error resetting table ${tableName}:`, error);
    }
  }

  /**
   * Create a test user
   */
  static async createTestUser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
  }) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            role: userData.role,
          },
        },
      });

      if (error) throw error;
      console.log(`✅ Test user created: ${userData.email}`);
      return data;
    } catch (error) {
      console.error('❌ Error creating test user:', error);
      return null;
    }
  }

  /**
   * Delete a specific user by email
   */
  static async deleteUserByEmail(email: string) {
    try {
      await supabase.from('users').delete().eq('email', email);
      console.log(`✅ User deleted: ${email}`);
    } catch (error) {
      console.error(`❌ Error deleting user ${email}:`, error);
    }
  }
}

/**
 * Mock Data Generators
 */
export class DataGenerator {
  /**
   * Generate random email
   */
  static randomEmail(prefix = 'test'): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(7)}@test.com`;
  }

  /**
   * Generate random phone number (Morocco format)
   */
  static randomPhone(): string {
    const number = Math.floor(Math.random() * 90000000) + 10000000;
    return `+212 6 ${number.toString().substring(0, 2)} ${number.toString().substring(2, 4)} ${number.toString().substring(4, 6)} ${number.toString().substring(6, 8)}`;
  }

  /**
   * Generate random company name
   */
  static randomCompanyName(): string {
    const prefixes = ['Tech', 'Innov', 'Digital', 'Smart', 'Cloud', 'Cyber', 'Data'];
    const suffixes = ['Solutions', 'Systems', 'Corp', 'Industries', 'Labs', 'Group', 'Ventures'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return `${prefix}${suffix} ${Date.now()}`;
  }

  /**
   * Generate random product data
   */
  static randomProduct() {
    return {
      name: `Product ${Date.now()}`,
      description: 'This is a test product for E2E testing',
      price: Math.floor(Math.random() * 10000) + 100,
      category: ['software', 'hardware', 'service', 'consulting'][Math.floor(Math.random() * 4)],
    };
  }

  /**
   * Generate random event data
   */
  static randomEvent() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    return {
      title: `Test Event ${Date.now()}`,
      description: 'This is a test event for E2E testing',
      startDate: tomorrow.toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '12:00',
      location: 'Test Hall A',
      capacity: 100,
      category: 'conference',
    };
  }
}

/**
 * Page Navigation Helpers
 */
export class NavigationHelper {
  /**
   * Wait for page to be fully loaded
   */
  static async waitForPageLoad(page: Page) {
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
  }

  /**
   * Safe navigation with retry
   */
  static async navigateTo(page: Page, url: string, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        return;
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        console.log(`Retry ${i + 1}/${maxRetries} for ${url}`);
        await page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Scroll to element and ensure it's visible
   */
  static async scrollToElement(page: Page, selector: string) {
    await page.locator(selector).scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
  }
}

/**
 * Form Helpers
 */
export class FormHelper {
  /**
   * Fill form with retry on failure
   */
  static async fillInput(page: Page, selector: string, value: string, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await page.fill(selector, value);
        const filledValue = await page.inputValue(selector);
        if (filledValue === value) return;
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await page.waitForTimeout(500);
      }
    }
  }

  /**
   * Upload file with validation
   */
  static async uploadFile(page: Page, selector: string, filePath: string) {
    const fileInput = page.locator(selector);
    await fileInput.setInputFiles(filePath);

    // Wait for upload to complete
    await page.waitForTimeout(1000);
  }

  /**
   * Select option with retry
   */
  static async selectOption(page: Page, selector: string, value: string) {
    await page.selectOption(selector, value);
    await page.waitForTimeout(300);
  }
}

/**
 * API Helpers
 */
export class APIHelper {
  /**
   * Intercept and mock API response
   */
  static async mockAPIResponse(page: Page, url: string, response: any) {
    await page.route(url, route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    });
  }

  /**
   * Wait for specific API call
   */
  static async waitForAPICall(page: Page, urlPattern: string, timeout = 10000) {
    return await page.waitForResponse(
      response => response.url().includes(urlPattern) && response.status() === 200,
      { timeout }
    );
  }

  /**
   * Get all API calls made during action
   */
  static async captureAPICalls(page: Page, action: () => Promise<void>) {
    const apiCalls: any[] = [];

    page.on('response', response => {
      if (response.url().includes('/api/')) {
        apiCalls.push({
          url: response.url(),
          status: response.status(),
          method: response.request().method(),
        });
      }
    });

    await action();

    return apiCalls;
  }
}

/**
 * Screenshot Helpers
 */
export class ScreenshotHelper {
  /**
   * Take screenshot with custom name
   */
  static async capture(page: Page, name: string) {
    await page.screenshot({
      path: `e2e/screenshots/${name}-${Date.now()}.png`,
      fullPage: true,
    });
  }

  /**
   * Compare screenshots
   */
  static async compareScreenshot(page: Page, name: string) {
    const screenshot = await page.screenshot({ fullPage: true });
    // Note: Actual comparison would require additional library like pixelmatch
    return screenshot;
  }
}

/**
 * Wait Helpers
 */
export class WaitHelper {
  /**
   * Wait for element to be visible with timeout
   */
  static async waitForVisible(page: Page, selector: string, timeout = 10000) {
    await page.waitForSelector(selector, { state: 'visible', timeout });
  }

  /**
   * Wait for element to disappear
   */
  static async waitForHidden(page: Page, selector: string, timeout = 10000) {
    await page.waitForSelector(selector, { state: 'hidden', timeout });
  }

  /**
   * Wait for specific text to appear
   */
  static async waitForText(page: Page, text: string, timeout = 10000) {
    await page.waitForSelector(`text=${text}`, { timeout });
  }

  /**
   * Smart wait - waits for either loading to finish or content to appear
   */
  static async smartWait(page: Page, contentSelector: string) {
    try {
      // Wait for loading indicator to disappear
      await page.waitForSelector('[data-testid="loading"]', { state: 'hidden', timeout: 2000 });
    } catch {
      // Loading indicator might not exist, continue
    }

    // Wait for content
    await page.waitForSelector(contentSelector, { state: 'visible', timeout: 10000 });
  }
}

/**
 * Assertion Helpers
 */
export class AssertionHelper {
  /**
   * Assert element contains text
   */
  static async assertTextContains(page: Page, selector: string, expectedText: string) {
    const element = page.locator(selector);
    await expect(element).toContainText(expectedText);
  }

  /**
   * Assert multiple elements exist
   */
  static async assertElementsExist(page: Page, selectors: string[]) {
    for (const selector of selectors) {
      await expect(page.locator(selector)).toBeVisible();
    }
  }

  /**
   * Assert URL matches pattern
   */
  static async assertURLMatches(page: Page, pattern: RegExp) {
    await expect(page).toHaveURL(pattern);
  }

  /**
   * Assert element count
   */
  static async assertElementCount(page: Page, selector: string, expectedCount: number) {
    await expect(page.locator(selector)).toHaveCount(expectedCount);
  }
}

/**
 * Performance Helpers
 */
export class PerformanceHelper {
  /**
   * Measure page load time
   */
  static async measurePageLoad(page: Page, url: string) {
    const startTime = Date.now();
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    console.log(`Page ${url} loaded in ${loadTime}ms`);
    return loadTime;
  }

  /**
   * Get Core Web Vitals
   */
  static async getCoreWebVitals(page: Page) {
    return await page.evaluate(() => {
      return new Promise(resolve => {
        const vitals: any = {};

        // FCP - First Contentful Paint
        const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
        if (fcpEntry) {
          vitals.fcp = fcpEntry.startTime;
        }

        // LCP - Largest Contentful Paint
        new PerformanceObserver(list => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          vitals.lcp = lastEntry.renderTime || lastEntry.loadTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // CLS - Cumulative Layout Shift
        let cls = 0;
        new PerformanceObserver(list => {
          for (const entry of list.getEntries() as any[]) {
            if (!entry.hadRecentInput) {
              cls += entry.value;
            }
          }
          vitals.cls = cls;
        }).observe({ entryTypes: ['layout-shift'] });

        setTimeout(() => resolve(vitals), 3000);
      });
    });
  }
}

/**
 * Authentication Helpers (additional to the ones in complete-user-journeys.spec.ts)
 */
export class AuthHelper {
  /**
   * Logout
   */
  static async logout(page: Page) {
    await page.click('[data-testid="user-menu"]');
    await page.click('button:has-text("Déconnexion")');
    await expect(page).toHaveURL(/.*\/login/);
  }

  /**
   * Check if user is logged in
   */
  static async isLoggedIn(page: Page): Promise<boolean> {
    try {
      await page.waitForSelector('[data-testid="user-menu"]', { timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get current user info
   */
  static async getCurrentUser(page: Page) {
    return await page.evaluate(() => {
      const userDataStr = localStorage.getItem('user');
      return userDataStr ? JSON.parse(userDataStr) : null;
    });
  }
}

/**
 * Export all helpers
 */
export const Helpers = {
  Database: DatabaseHelper,
  Data: DataGenerator,
  Navigation: NavigationHelper,
  Form: FormHelper,
  API: APIHelper,
  Screenshot: ScreenshotHelper,
  Wait: WaitHelper,
  Assert: AssertionHelper,
  Performance: PerformanceHelper,
  Auth: AuthHelper,
};

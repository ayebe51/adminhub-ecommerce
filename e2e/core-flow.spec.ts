import { test, expect } from '@playwright/test';

test.describe('E-Commerce Admin Portal Core Flow', () => {
  test('should load the dashboard, open command palette, and navigate to products', async ({ page }) => {
    // 1. Visit the homepage (Dashboard)
    await page.goto('/');

    // Check title (React app defaults to Vite + React if index.html is not changed, 
    // but let's check for visual elements like the Sidebar)
    await expect(page.locator('text=AdminHub').first()).toBeVisible();

    // 2. Open Command Palette shortcut (Ctrl+K)
    // using userAgent check if Mac vs Windows for the shortcut might be needed,
    // but Playwright run generally handles standard modifiers.
    // The AppShell handles both generic 'k' and modifier.
    await page.keyboard.down('Control');
    await page.keyboard.press('k');
    await page.keyboard.up('Control');
    
    // Check if palette is visible
    const paletteInput = page.locator('input[placeholder*="Type a command or search"]');
    await expect(paletteInput).toBeVisible();

    // Close palette
    await page.keyboard.press('Escape');
    await expect(paletteInput).not.toBeVisible();

    // 3. Navigate to Products using standard click
    await page.click('text="Products"');
    
    // Check we arrived at the product page
    await expect(page.locator('h1', { hasText: 'Products' })).toBeVisible();

    // 4. Ag-Grid check
    // Ensure the AG Grid wrapper is rendered, proving the virtualized table loaded
    await expect(page.locator('.ag-root-wrapper')).toBeVisible({ timeout: 10000 });
  });
});

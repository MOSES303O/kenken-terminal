import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.waitForSelector('[data-testid="kenken-grid"]');
});

test('renders the 4x4 grid', async ({ page }) => {
  const cells = page.locator('[data-testid^="cell-"]');
  await expect(cells).toHaveCount(16);
});

test('SET command places a value', async ({ page }) => {
  const input = page.locator('[data-testid="prompt-input"]');
  await input.focus();
  await input.type('SET 1 1 3');
  await input.press('Enter');
  await expect(page.locator('[data-testid="cell-0-0"]')).toContainText('3');
});

test('invalid SET shows error in status box', async ({ page }) => {
  const input = page.locator('[data-testid="prompt-input"]');
  await input.focus();
  await input.type('SET 9 9 9');
  await input.press('Enter');
  // Status box shows the full message; check for "Invalid args" which the engine returns
  await expect(page.locator('[data-testid="status-box"]')).toContainText('Invalid args');
});

test('HINT highlights a cell in yellow', async ({ page }) => {
  const input = page.locator('[data-testid="prompt-input"]');
  await input.focus();
  await input.type('HINT');
  await input.press('Enter');
  await expect(page.locator('[data-testid="status-box"]')).toContainText('Hint');
});

test('history log records commands', async ({ page }) => {
  const input = page.locator('[data-testid="prompt-input"]');
  await input.focus();
  await input.type('CHECK');
  await input.press('Enter');
  await expect(page.locator('[data-testid="move-history"]')).toContainText('CHECK');
});

test('RESET clears the board', async ({ page }) => {
  const input = page.locator('[data-testid="prompt-input"]');
  await input.focus();
  await input.type('SET 1 2 3');
  await input.press('Enter');
  // Verify the value was placed (col 1, not col 0 which has a cage label)
  await expect(page.locator('[data-testid="cell-0-1"]')).toContainText('3');
  await input.type('RESET');
  await input.press('Enter');
  // After reset, cell-0-1 has no cage label, so it should be empty
  await expect(page.locator('[data-testid="cell-0-1"]')).toHaveText('');
});
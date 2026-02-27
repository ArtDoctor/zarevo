import { expect, test } from '@playwright/test';

test('main page redirects to /home', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveURL(/\/home/);
});

test('clicking Validate on home shows sign in popup', async ({ page }) => {
	await page.goto('/home');
	await page.getByRole('button', { name: 'Validate' }).click();
	await expect(page.getByRole('dialog')).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
});

test('clicking Advanced on home navigates to /home/advanced', async ({ page }) => {
	await page.goto('/home');
	await page.getByRole('button', { name: 'Advanced' }).click();
	await expect(page).toHaveURL(/\/home\/advanced/);
	await expect(page.getByRole('heading', { name: 'Advanced Validation' })).toBeVisible();
});

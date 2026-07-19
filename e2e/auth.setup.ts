import { test as setup } from '@playwright/test';
import fs from 'fs';

const ACCOUNTS = [
  { role: 'student', email: 'darshil.student@rowan.edu', pw: 'D@rshil1601' },
  { role: 'vendor',  email: 'test2@handout.app', pw: 'Test123' },
  { role: 'admin',   email: 'darshil@admin.app', pw: 'D@rshil1601' },
];

if (!fs.existsSync('.auth')) fs.mkdirSync('.auth');

for (const a of ACCOUNTS) {
  setup(`authenticate ${a.role}`, async ({ page }) => {
    setup.setTimeout(60_000);
    await page.goto('/auth/login', { waitUntil: 'load' });
    await page.waitForTimeout(1200); // hydrate
    await page.locator('input[type="email"]').first().fill(a.email);
    await page.locator('input[type="password"]').first().fill(a.pw);
    await page.getByRole('button', { name: 'Sign in →' }).first().click();
    // Wait until the Supabase auth cookie is written (login succeeded)
    await page.waitForFunction(() => document.cookie.includes('auth-token'), null, { timeout: 20_000 });
    await page.waitForTimeout(800);
    await page.context().storageState({ path: `.auth/${a.role}.json` });
    console.log(`  ✓ ${a.role} session saved`);
  });
}

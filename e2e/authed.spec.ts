import { test, expect, Page } from '@playwright/test';

const STUDENT = [
  '/student/dashboard', '/student/roommates', '/student/food', '/student/services',
  '/student/messages', '/student/bookings', '/student/orders', '/student/profile',
  '/student/settings', '/student/notifications', '/student/welcome', '/student/verify',
  '/student/cart', '/student/membership', '/student/search', '/student/saved',
  '/student/wallet', '/student/referral', '/student/community', '/student/events',
  '/student/study-groups', '/student/subletting', '/student/handouts', '/student/coupons',
  '/student/billing', '/student/ride-share', '/student/dating',
];
const VENDOR = [
  '/vendor/dashboard', '/vendor/orders', '/vendor/welcome', '/vendor/reviews',
  '/vendor/schedule', '/vendor/coupons', '/vendor/messages', '/vendor/profile',
  '/vendor/analytics', '/vendor/earnings',
];
const ADMIN = [
  '/admin', '/admin/users', '/admin/providers', '/admin/bookings', '/admin/reports',
  '/admin/analytics', '/admin/verifications', '/admin/welcome-requests', '/admin/moderation',
  '/admin/coupons', '/admin/settings',
];

const IGNORE = [/React DevTools/i, /\[Fast Refresh\]/i];

function collect(page: Page, bag: { c: string[]; e: string[]; net: string[] }) {
  page.on('console', m => { if (m.type() === 'error' && !IGNORE.some(r => r.test(m.text())) && !/hydrat/i.test(m.text())) bag.c.push(m.text().slice(0, 200)); });
  page.on('pageerror', e => bag.e.push(e.message.slice(0, 200)));
  page.on('response', r => { const s = r.status(); if (s >= 400 && !r.url().includes('favicon')) bag.net.push(`${s} ${r.url().split('/').slice(-2).join('/').slice(0, 40)}`); });
}

async function checkPage(page: Page, route: string) {
  const bag = { c: [] as string[], e: [] as string[], net: [] as string[] };
  collect(page, bag);
  await page.goto(route, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1800); // allow client fetch + render

  // authenticated: must NOT bounce to login
  expect(page.url(), `${route} bounced to login (session lost)`).not.toContain('/auth/login');
  // not blank
  const txt = (await page.locator('body').innerText()).trim();
  expect(txt.length, `${route} is blank`).toBeGreaterThan(20);
  // no horizontal overflow
  const of = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
  expect(of, `${route} horizontal overflow @${page.viewportSize()?.width}px`).toBeFalsy();
  // no crashes
  expect(bag.e, `${route} JS errors: ${bag.e.join(' | ')}`).toHaveLength(0);
  expect(bag.c, `${route} console errors: ${bag.c.join(' | ')}`).toHaveLength(0);
  if (bag.net.length) console.log(`  [net≥400] ${route}: ${bag.net.join(', ')}`);
}

test.describe('STUDENT', () => {
  test.use({ storageState: '.auth/student.json' });
  for (const r of STUDENT) test(`student ${r}`, async ({ page }) => { await checkPage(page, r); });
  test('student CANNOT access admin', async ({ page }) => {
    await page.goto('/admin/users', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    expect(page.url(), 'student reached admin page!').not.toMatch(/\/admin\/users$/);
  });
});

test.describe('VENDOR', () => {
  test.use({ storageState: '.auth/vendor.json' });
  for (const r of VENDOR) test(`vendor ${r}`, async ({ page }) => { await checkPage(page, r); });
  test('vendor CANNOT access admin', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    expect(page.url(), 'vendor reached admin!').not.toMatch(/\/admin\/?$/);
  });
});

test.describe('ADMIN', () => {
  test.use({ storageState: '.auth/admin.json' });
  for (const r of ADMIN) test(`admin ${r}`, async ({ page }) => { await checkPage(page, r); });
});

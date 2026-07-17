import { test, expect, Page } from '@playwright/test';

/* Public routes (no auth required) */
const PUBLIC = [
  '/landing', '/about', '/contact', '/help',
  '/legal/terms', '/legal/privacy', '/legal/safety',
  '/auth/login', '/auth/signup', '/auth/forgot-password', '/auth/reset-password',
];

/* Protected routes — should redirect unauthenticated users to /auth/login */
const PROTECTED = [
  '/student/dashboard', '/student/food', '/student/services', '/student/roommates',
  '/student/messages', '/student/welcome', '/student/verify', '/student/cart',
  '/vendor/dashboard', '/vendor/orders', '/vendor/welcome',
  '/admin', '/admin/users', '/admin/welcome-requests',
];

/* Console noise we don't count as bugs */
const IGNORE = [
  /Download the React DevTools/i,
  /\[Fast Refresh\]/i,
  /hydrat/i,            // logged separately
  /Supabase/i,          // anon data fetches on public pages
];

function attachCollectors(page: Page, bag: { console: string[]; pageerr: string[]; failed: string[]; hydration: string[] }) {
  page.on('console', m => {
    if (m.type() !== 'error') return;
    const t = m.text();
    if (/hydrat/i.test(t)) { bag.hydration.push(t); return; }
    if (IGNORE.some(r => r.test(t))) return;
    bag.console.push(t);
  });
  page.on('pageerror', e => bag.pageerr.push(e.message));
  page.on('response', r => {
    const s = r.status();
    const u = r.url();
    if (s >= 400 && !u.includes('/rest/v1/') && !u.includes('favicon')) bag.failed.push(`${s} ${u}`);
  });
}

test.describe('Public route crawl', () => {
  for (const route of PUBLIC) {
    test(`GET ${route}`, async ({ page }) => {
      const bag = { console: [] as string[], pageerr: [] as string[], failed: [] as string[], hydration: [] as string[] };
      attachCollectors(page, bag);

      const resp = await page.goto(route, { waitUntil: 'domcontentloaded' });
      expect(resp, `${route} returned no response`).toBeTruthy();
      expect(resp!.status(), `${route} HTTP status`).toBeLessThan(400);

      // page not blank
      const bodyText = (await page.locator('body').innerText()).trim();
      expect(bodyText.length, `${route} is blank`).toBeGreaterThan(20);

      // no horizontal overflow (responsive)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
      expect(overflow, `${route} has horizontal overflow at ${page.viewportSize()?.width}px`).toBeFalsy();

      // images have alt text
      const noAlt = await page.$$eval('img', imgs => imgs.filter(i => !i.alt && !i.getAttribute('aria-hidden')).map(i => i.currentSrc || i.src));
      // report but don't hard-fail on decorative
      if (noAlt.length) console.log(`  [a11y] ${route}: ${noAlt.length} img(s) missing alt`);

      // hard failures
      expect(bag.pageerr, `${route} uncaught JS errors: ${bag.pageerr.join(' | ')}`).toHaveLength(0);
      expect(bag.console, `${route} console errors: ${bag.console.join(' | ')}`).toHaveLength(0);
      if (bag.hydration.length) console.log(`  [hydration] ${route}: ${bag.hydration.length} warning(s)`);
      if (bag.failed.length) console.log(`  [network] ${route}: ${bag.failed.join(', ')}`);
    });
  }
});

test.describe('Protected routes redirect to login', () => {
  for (const route of PROTECTED) {
    test(`AUTH-GUARD ${route}`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500); // allow client-side guard to redirect
      const url = page.url();
      expect(url, `${route} did not redirect unauthenticated user to login`).toContain('/auth/login');
    });
  }
});

test.describe('Landing interactions', () => {
  test('nav + hero CTAs work', async ({ page }) => {
    await page.goto('/landing', { waitUntil: 'domcontentloaded' });
    // Every anchor points somewhere real
    const badHrefs = await page.$$eval('a[href]', as =>
      as.map(a => a.getAttribute('href') || '').filter(h => h === '' || h === '#')
    );
    expect(badHrefs, `dead anchors on landing: ${badHrefs.length}`).toHaveLength(0);

    // Sign up CTA navigates to signup
    const signup = page.locator('a[href="/auth/signup"]').first();
    await expect(signup).toBeVisible();
    await signup.click();
    await page.waitForURL(/\/auth\/signup/);
    expect(page.url()).toContain('/auth/signup');
  });
});

import { test } from '@playwright/test';

test('web vitals — landing', async ({ page }) => {
  await page.goto('/landing', { waitUntil: 'load' });
  const vitals = await page.evaluate(() => new Promise<any>(resolve => {
    const out: any = {};
    const paints = performance.getEntriesByType('paint');
    out.FCP = Math.round(paints.find(p => p.name === 'first-contentful-paint')?.startTime || 0);
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    out.DOMContentLoaded = Math.round(nav?.domContentLoadedEventEnd || 0);
    out.Load = Math.round(nav?.loadEventEnd || 0);
    out.TransferKB = Math.round((nav?.transferSize || 0) / 1024);
    // LCP
    try {
      new PerformanceObserver(list => {
        const es = list.getEntries();
        out.LCP = Math.round(es[es.length - 1].startTime);
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {}
    setTimeout(() => resolve(out), 800);
  }));
  console.log('\n=== Landing web vitals ===');
  console.log(`  FCP: ${vitals.FCP}ms   LCP: ${vitals.LCP ?? 'n/a'}ms   DCL: ${vitals.DOMContentLoaded}ms   Load: ${vitals.Load}ms   Transfer: ${vitals.TransferKB}KB`);
});

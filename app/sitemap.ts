import type { MetadataRoute } from 'next';

// Public, indexable pages only. Everything behind auth (student/admin/provider),
// the auth screens, onboarding and debug are intentionally excluded — see robots.ts.
const BASE = 'https://www.handout.casa';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes: { path: string; priority: number }[] = [
    { path: '',                priority: 1.0 },
    { path: '/landing',        priority: 1.0 },
    { path: '/about',          priority: 0.7 },
    { path: '/contact',        priority: 0.6 },
    { path: '/help',           priority: 0.6 },
    { path: '/legal/terms',    priority: 0.4 },
    { path: '/legal/privacy',  priority: 0.4 },
    { path: '/legal/safety',   priority: 0.4 },
  ];
  return routes.map(({ path, priority }) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority,
  }));
}

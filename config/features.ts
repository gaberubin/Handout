// ════════════════════════════════════════════════════════════════════════
// HANDOUT — BETA MODE FEATURE FLAGS
//
// Single source of truth for what's live in the public beta vs. what's
// preserved-but-hidden behind a "Coming Soon" page.
//
// NOTHING is deleted. Flip BETA_MODE to false to instantly re-enable every
// future feature (routes, pages, APIs and SQL all still exist) with no code
// changes anywhere else.
//
// This is a PLAIN module (no React, no 'use client') so it can be imported by
// middleware (edge runtime) AND client components alike.
// ════════════════════════════════════════════════════════════════════════

export const BETA_MODE = true;

// Version shown in Beta badges / topbar.
export const APP_VERSION = '1.0';

// One consistent label for preserved-but-hidden features (replaces "Coming Soon").
export const WHATS_NEXT = "What's Next";

// ── Beta features (fully accessible) ──────────────────────────────────────
export const BETA_FEATURES = [
  'dashboard',
  'roommates',
  'campus_connect',
  'community',
  'marketplace',
  'events',
  'find_people',
  'messages',
  'rewards',
  'profile',
] as const;

// ── Coming-soon features (preserved, gated behind /coming-soon) ───────────
// key → display metadata used by the Coming Soon page.
export const COMING_SOON: Record<string, { title: string; emoji: string; blurb: string }> = {
  food:           { title: 'Food Plans & Tiffins', emoji: '🍱', blurb: 'Homemade tiffins and campus meal plans from trusted local cooks.' },
  airport_pickup: { title: 'Airport Pickup',       emoji: '🚗', blurb: 'Get picked up when you land and settle in with a welcome package.' },
  services:       { title: 'Student Services',     emoji: '💼', blurb: 'Babysitting, dog sitting, elder care, moving help, tutoring and more.' },
  jobs:           { title: 'Student Jobs',         emoji: '🎓', blurb: 'On- and off-campus jobs and gigs built for students.' },
  premium:        { title: 'Premium',              emoji: '✨', blurb: 'Optional premium perks — everything is free during the beta.' },
  payments:       { title: 'Payments & Orders',    emoji: '💳', blurb: 'In-app payments, orders, wallet and coupons.' },
  ride_share:     { title: 'Ride Share',           emoji: '🚙', blurb: 'Share rides with students heading the same way.' },
};

// ── Route → coming-soon feature map ───────────────────────────────────────
// Any request whose path matches one of these prefixes is redirected to
// /coming-soon?feature=<key> while BETA_MODE is on. The page itself is never
// deleted — it simply isn't reachable during the beta.
const GATED_ROUTES: { prefix: string; feature: string }[] = [
  { prefix: '/student/food',       feature: 'food' },
  { prefix: '/student/services',   feature: 'services' },
  { prefix: '/student/welcome',    feature: 'airport_pickup' },
  { prefix: '/student/membership', feature: 'premium' },
  { prefix: '/student/billing',    feature: 'payments' },
  { prefix: '/student/orders',     feature: 'payments' },
  { prefix: '/student/bookings',   feature: 'payments' },
  { prefix: '/student/cart',       feature: 'payments' },
  { prefix: '/student/checkout',   feature: 'payments' },
  { prefix: '/student/wallet',     feature: 'payments' },
  { prefix: '/student/coupons',    feature: 'payments' },
  { prefix: '/student/ride-share', feature: 'ride_share' },
];

// Returns the coming-soon feature key for a path, or null if it's allowed.
// When BETA_MODE is off, nothing is gated.
export function comingSoonFeatureForPath(pathname: string): string | null {
  if (!BETA_MODE) return null;
  const hit = GATED_ROUTES.find(r => pathname === r.prefix || pathname.startsWith(r.prefix + '/'));
  return hit ? hit.feature : null;
}

// Is a given feature key currently gated?
export function isComingSoon(feature: string): boolean {
  return BETA_MODE && feature in COMING_SOON;
}

// Coming-soon items rendered in the sidebar "Coming Soon" section.
export const COMING_SOON_NAV: { feature: string; label: string }[] = [
  { feature: 'food',           label: 'Food Plans' },
  { feature: 'airport_pickup', label: 'Airport Pickup' },
  { feature: 'services',       label: 'Student Services' },
  { feature: 'jobs',           label: 'Jobs' },
  { feature: 'premium',        label: 'Premium' },
];

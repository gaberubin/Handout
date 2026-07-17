// Rewards / points helpers (Feature 1).
// The server (db/feature-1-points.sql) is authoritative for point AMOUNTS —
// these values are for display only. All awarding is fire-and-forget: a points
// failure must never break the action that triggered it.

import { createClient } from '@/lib/supabase/client';

export type PointAction =
  | 'create_post' | 'send_message' | 'rsvp_event' | 'refer_friend'
  | 'complete_profile' | 'get_verified' | 'daily_login'
  | 'list_item' | 'set_connection_profile';

// Mirror of award_points() in db/feature-1-points.sql (display only).
export const POINT_VALUES: Record<PointAction, number> = {
  get_verified: 60,
  refer_friend: 50,
  complete_profile: 40,
  set_connection_profile: 25,
  list_item: 20,
  create_post: 15,
  rsvp_event: 10,
  daily_login: 5,
  send_message: 2,
};

// Ordered list used to render the "How to earn" section on the Rewards page.
export const POINT_RULES: { action: PointAction; label: string; hint: string }[] = [
  { action: 'get_verified',           label: 'Get verified',            hint: 'Confirm your student ID once' },
  { action: 'refer_friend',           label: 'Refer a friend',          hint: 'For each friend who joins' },
  { action: 'complete_profile',       label: 'Complete your profile',   hint: 'Add your details' },
  { action: 'set_connection_profile', label: 'Set up Find Your People',  hint: 'Tell us who you want to meet' },
  { action: 'list_item',              label: 'List an item',            hint: 'Sell books in the Marketplace' },
  { action: 'create_post',            label: 'Post in Community',       hint: 'Up to 5× a day' },
  { action: 'rsvp_event',             label: 'RSVP to an event',        hint: 'Up to 10× a day' },
  { action: 'send_message',           label: 'Message a student',       hint: 'Up to 10× a day' },
  { action: 'daily_login',            label: 'Daily check-in',          hint: 'Come back each day for a streak' },
];

// Fire-and-forget. Never throws into the calling action.
export async function awardPoints(action: PointAction): Promise<void> {
  try {
    await createClient().rpc('award_points', { p_action: action });
  } catch {
    /* points are non-critical — ignore (e.g. migration not run yet) */
  }
}

// Records a daily login, updates the streak, and returns the fresh totals.
// Returns null if the migration hasn't been run yet (so callers can fall back).
export async function touchDailyLogin(): Promise<{ points: number; streak: number } | null> {
  try {
    const { data, error } = await createClient().rpc('touch_daily_login');
    if (error) return null;
    const row = Array.isArray(data) ? data[0] : data;
    return row ? { points: row.points ?? 0, streak: row.streak ?? 0 } : null;
  } catch {
    return null;
  }
}

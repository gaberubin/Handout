import { createClient } from '@/lib/supabase/client';

// Campus isolation: students only see content from their own university.
// A student's campus is their student_profiles.university. If it's not set,
// we DON'T isolate (return '') so their app never looks empty — they can still
// browse and are nudged to set their university in their profile.
export async function getMyCampus(): Promise<string> {
  try {
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return '';
    const { data } = await sb.from('student_profiles').select('university').eq('user_id', user.id).maybeSingle();
    return (data?.university || '').trim();
  } catch {
    return '';
  }
}

// Client-side campus filter: keep rows on my campus. When I have no campus set,
// keep everything (no isolation). Case-insensitive.
export function sameCampus(rowCampus: string | null | undefined, myCampus: string): boolean {
  if (!myCampus) return true;               // viewer hasn't set a campus → show all
  if (!rowCampus) return true;              // row's campus unknown → show it (never let a listing vanish for everyone)
  return rowCampus.trim().toLowerCase() === myCampus.trim().toLowerCase();
}

// Build a PostgREST `.or()` filter string for campus isolation that:
//  • matches rows on my campus,
//  • NEVER hides a row whose campus is unknown (NULL) — a listing posted before
//    isolation existed, or by someone who hasn't set their university yet, stays
//    visible instead of silently disappearing for every other student,
//  • always keeps the viewer's own rows visible (pass userId + its column).
// The campus value is double-quoted so names with spaces/commas stay safe.
export function campusOrFilter(myCampus: string, userId?: string, userIdCol = 'user_id'): string {
  const q = `"${(myCampus || '').replace(/"/g, '')}"`;
  const parts = [`campus.eq.${q}`, 'campus.is.null'];
  if (userId) parts.push(`${userIdCol}.eq.${userId}`);
  return parts.join(',');
}

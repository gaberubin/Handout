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
  if (!rowCampus) return false;             // row has no campus → hide from a scoped viewer
  return rowCampus.trim().toLowerCase() === myCampus.trim().toLowerCase();
}

'use client';
import { createClient } from '@/lib/supabase/client';

/** Guard for authed dashboards. Self-heals a missing profile row and never
 *  redirects to the page it's already on (loop-safe).
 *
 *  IMPORTANT: this runs in the BROWSER (every caller is a 'use client'
 *  component), so it must use the browser client. The previous version used the
 *  server client, which calls `cookies()` from next/headers — that throws in the
 *  browser, so the guard crashed before the page could finish loading, leaving
 *  authed pages stuck on "Loading…". The browser client reads the same auth
 *  cookie and validates the user via getUser(). */
export async function requireRole(expectedRole: 'student' | 'vendor' | 'admin') {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { go('/auth/login'); return null; }

  let { data: u } = await supabase.from('users').select('*').eq('id', user.id).single();
  if (!u) {
    // Never self-heal to admin — clamp any metadata role to student/provider only.
    const metaRole = (user.user_metadata as any)?.role;
    const role = (metaRole === 'provider') ? 'provider' : 'student';
    await supabase.from('users').insert({
      id: user.id, email: user.email,
      full_name: (user.user_metadata as any)?.full_name || user.email?.split('@')[0], role,
    });
    const r = await supabase.from('users').select('*').eq('id', user.id).single();
    u = r.data;
  }
  if (!u) { go('/auth/login'); return null; }

  // Verification gate: everyone except admins must be approved to reach a dashboard.
  if (u.role !== 'admin' && u.verification_status !== 'approved') {
    go('/onboarding');
    return null;
  }

  // Both 'vendor' and 'provider' roles map to the vendor portal
  const isVendorRole = u.role === 'vendor' || u.role === 'provider';
  const effectiveRole = isVendorRole ? 'vendor' : u.role;

  if (effectiveRole !== expectedRole) {
    go(u.role === 'admin' ? '/admin/users' : isVendorRole ? '/vendor/dashboard' : '/student/dashboard');
    return null;
  }
  return { authUser: user, profile: u };
}

function go(dest: string) {
  if (typeof window !== 'undefined' && window.location.pathname !== dest) window.location.href = dest;
}

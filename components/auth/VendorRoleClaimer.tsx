'use client';

// Google/Apple OAuth carries none of our own metadata, so a user who picks
// "Vendor" on the signup form and then signs up with Google is created as a
// plain 'student' (handle_new_user defaults to student) and lands on the student
// dashboard.
//
// We pass ?role=vendor on the callback URL, but Supabase only preserves the
// query string when that exact URL is in its Redirect-URL allowlist — so we
// can't rely on it. This component is the dependable half: OAuthButtons stashes
// the chosen role in localStorage (same origin, survives the OAuth round trip)
// and we claim it here on the first authenticated page render.
//
// Guarded: only applies to an account created in the last 15 minutes, so a stale
// key can never flip an established student account.

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

const KEY = 'handout_signup_role';

export function VendorRoleClaimer() {
  useEffect(() => {
    (async () => {
      let intent: string | null = null;
      try { intent = localStorage.getItem(KEY); } catch { return; }
      if (intent !== 'vendor') return;

      try {
        const sb = createClient();
        const { data: { user } } = await sb.auth.getUser();
        if (!user) return;                       // not signed in yet — try next mount

        const created = new Date(user.created_at as string).getTime();
        const isBrandNew = Number.isFinite(created) && (Date.now() - created) < 15 * 60 * 1000;
        if (!isBrandNew) { try { localStorage.removeItem(KEY); } catch {} return; }

        // Only promotes a student row — never touches an admin or existing vendor.
        const { error } = await sb.from('users').update({ role: 'vendor' })
          .eq('id', user.id).eq('role', 'student');

        try { localStorage.removeItem(KEY); } catch {}
        if (!error) window.location.href = '/vendor/onboarding';
      } catch { /* non-fatal — user simply stays where they are */ }
    })();
  }, []);

  return null;
}

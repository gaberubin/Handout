// Referral capture + claim.
//
// Flow: A shares /auth/signup?ref=REF-xxxxxxxx → B lands there, we stash the
// code in localStorage (survives the whole signup / email-confirm / Google
// redirect dance). The first time B is authenticated inside the app,
// claimStoredReferral() calls the claim_referral() RPC, which records the
// referral and banks Plus days for BOTH sides (A +15, B +7). Fully automatic.

import { createClient } from '@/lib/supabase/client';

const KEY = 'handout_ref';

// Read ?ref= off the current URL and remember it. Safe to call on any page.
export function captureRefFromUrl(): void {
  if (typeof window === 'undefined') return;
  try {
    const code = new URLSearchParams(window.location.search).get('ref');
    if (code && /^REF-[0-9a-f]{6,}$/i.test(code.trim())) {
      localStorage.setItem(KEY, code.trim());
    }
  } catch { /* private mode / storage disabled — ignore */ }
}

// If a code is stored and the user is signed in, claim it once, then clear it.
// Fire-and-forget: any failure is swallowed so it never blocks the app. We only
// keep the code for a retry when the RPC itself threw (network) — a definitive
// result (claimed, self-referral, already-referred, etc.) clears it.
export async function claimStoredReferral(): Promise<void> {
  if (typeof window === 'undefined') return;
  let code: string | null = null;
  try { code = localStorage.getItem(KEY); } catch { /* ignore */ }
  if (!code) return;
  try {
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;                     // not logged in yet — try again next mount
    const { error } = await sb.rpc('claim_referral', { p_code: code });
    if (!error) { try { localStorage.removeItem(KEY); } catch { /* ignore */ } }
  } catch { /* transient — keep code for next mount */ }
}

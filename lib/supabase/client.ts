import { createBrowserClient } from '@supabase/ssr';
import { type SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | undefined;

/** Browser Supabase client.
 *
 *  Uses @supabase/ssr's createBrowserClient so the auth session is stored in
 *  COOKIES — the same place the server client, middleware, and server actions
 *  read it from. This keeps the session in sync across client and server, so a
 *  user who logs in on the client stays logged in when the middleware and
 *  server components run.
 *
 *  (Previously this used supabase-js with persistSession/localStorage, which
 *  the server could not see. The session never reached the cookie, so the
 *  middleware bounced logged-in users back to /auth/login and client queries
 *  ran as the anonymous role — making it look like the database was not
 *  connected.)
 */
/** One-time cleanup: the very first version of this app stored the auth
 *  session in localStorage under 'handout-auth'. That stale session makes the
 *  client think you're logged in (so the nav shows Dashboard/Sign out) while
 *  the server sees no cookie and bounces you. Purge any such legacy entries so
 *  the only source of truth is the cookie. */
function purgeLegacySession() {
  if (typeof window === 'undefined') return;
  try {
    const keys = Object.keys(window.localStorage);
    for (const k of keys) {
      if (k === 'handout-auth' || k.startsWith('sb-') || k.includes('supabase')) {
        window.localStorage.removeItem(k);
      }
    }
  } catch { /* ignore */ }
}

export function createClient() {
  if (_client) return _client;

  // Fail loudly with a clear message instead of rendering a blank screen if the
  // connection can't be configured.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      'Cannot connect to the database: missing NEXT_PUBLIC_SUPABASE_URL or ' +
      'NEXT_PUBLIC_SUPABASE_ANON_KEY. Check your .env.local and restart the dev server.'
    );
  }

  purgeLegacySession();
  _client = createBrowserClient(url, key);
  return _client;
}

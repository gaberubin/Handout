import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { BETA_MODE } from '@/config/features';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code    = searchParams.get('code');
  const nextRaw = searchParams.get('next') ?? '';
  // Guard against open redirect: only allow relative paths that don't start with //
  const explicitNext = nextRaw.startsWith('/') && !nextRaw.startsWith('//') ? nextRaw : '';

  // The provider (or Supabase) can bounce back with an error instead of a code.
  // The most common one for us: our .edu-only DB guardrail rejects a non-.edu
  // Google account, which Supabase surfaces as "Database error saving new user".
  const providerError = searchParams.get('error');
  const providerDesc  = searchParams.get('error_description') || '';
  if (providerError) {
    const eduBlocked = /saving new user|\.edu/i.test(providerDesc);
    return NextResponse.redirect(`${origin}/auth/login?error=${eduBlocked ? 'edu_required' : 'oauth_failed'}`);
  }

  if (code) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session) {
      // If the caller specified an exact destination (e.g. password reset), honour it.
      if (explicitNext) return NextResponse.redirect(`${origin}${explicitNext}`);

      // Otherwise route by role + verification status
      const uid = data.session.user.id;

      // OAuth carries no metadata of ours, so a "Sign up with Google" as Vendor
      // lands here as a default 'student'. If the signup form asked for vendor,
      // apply it — but ONLY to a just-created account, so replaying this URL can
      // never flip an established student account.
      if (searchParams.get('role') === 'vendor') {
        try {
          const createdAt = new Date(data.session.user.created_at as string).getTime();
          const isBrandNew = Number.isFinite(createdAt) && (Date.now() - createdAt) < 10 * 60 * 1000;
          if (isBrandNew) {
            await supabase.from('users').update({ role: 'vendor' }).eq('id', uid).eq('role', 'student');
          }
        } catch { /* non-fatal — fall through to normal routing */ }
      }

      let role = 'student', status = 'unsubmitted';
      try {
        const { data: prof } = await supabase
          .from('users')
          .select('role, verification_status')
          .eq('id', uid)
          .single();
        if (prof?.role) role = prof.role;
        if (prof?.verification_status) status = prof.verification_status;
      } catch { /* use defaults */ }

      if (role === 'admin') return NextResponse.redirect(`${origin}/admin/users`);
      if (role === 'vendor' || role === 'provider') {
        // A vendor who just signed up has no business profile yet — send them to
        // onboarding first; returning vendors go straight to the dashboard.
        const justSignedUp = searchParams.get('role') === 'vendor';
        return NextResponse.redirect(`${origin}${justSignedUp ? '/vendor/onboarding' : '/vendor/dashboard'}`);
      }
      // In Beta, ID verification is optional — new Google/Apple users go straight
      // to the dashboard (the "Become Verified" card is available there).
      // Outside Beta, students must pass verification first.
      if (!BETA_MODE && status !== 'approved') return NextResponse.redirect(`${origin}/onboarding`);
      return NextResponse.redirect(`${origin}/student/dashboard`);
    }

    // Exchange failed — the .edu guardrail also surfaces here as a DB error.
    if (error && /saving new user|\.edu/i.test(error.message || '')) {
      return NextResponse.redirect(`${origin}/auth/login?error=edu_required`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=callback_error`);
}

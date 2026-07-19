import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { BETA_MODE } from '@/config/features';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code    = searchParams.get('code');
  const nextRaw = searchParams.get('next') ?? '';
  // Guard against open redirect: only allow relative paths that don't start with //
  const explicitNext = nextRaw.startsWith('/') && !nextRaw.startsWith('//') ? nextRaw : '';

  if (code) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session) {
      // If the caller specified an exact destination (e.g. password reset), honour it.
      if (explicitNext) return NextResponse.redirect(`${origin}${explicitNext}`);

      // Otherwise route by role + verification status
      const uid = data.session.user.id;
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
      if (role === 'vendor' || role === 'provider') return NextResponse.redirect(`${origin}/vendor/dashboard`);
      // In Beta, ID verification is optional — new Google/Apple users go straight
      // to the dashboard (the "Become Verified" card is available there).
      // Outside Beta, students must pass verification first.
      if (!BETA_MODE && status !== 'approved') return NextResponse.redirect(`${origin}/onboarding`);
      return NextResponse.redirect(`${origin}/student/dashboard`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=callback_error`);
}

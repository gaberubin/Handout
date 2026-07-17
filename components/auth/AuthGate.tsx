'use client';

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AuthModal } from './AuthModal';

type Mode = 'signup' | 'login';
type GateCtx = {
  user: any;
  loading: boolean;
  /** Run `action` if logged in; otherwise open the sign-up modal and run it after auth. */
  requireAuth: (action?: () => void, reason?: string) => void;
  openAuth: (mode?: Mode, reason?: string) => void;
  signOut: () => Promise<void>;
};

const Ctx = createContext<GateCtx | null>(null);
export function useAuthGate(): GateCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAuthGate must be used inside <AuthGateProvider>');
  return c;
}

export function AuthGateProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('signup');
  const [reason, setReason] = useState<string | undefined>();
  const pending = useRef<null | (() => void)>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => { setUser(data.user); setLoading(false); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  const openAuth = useCallback((m: Mode = 'signup', r?: string) => {
    setMode(m); setReason(r); setOpen(true);
  }, []);

  const requireAuth = useCallback((action?: () => void, r?: string) => {
    // Always verify the LIVE session — never trust cached state for gated actions.
    createClient().auth.getUser().then(({ data }) => {
      if (data.user) { setUser(data.user); action && action(); return; }
      setUser(null);
      pending.current = action ?? null;
      openAuth('login', r || 'Sign in or create a free account to continue');
    });
  }, [openAuth]);

  const onSuccess = useCallback(async (u: any) => {
    setUser(u); setOpen(false);
    const a = pending.current; pending.current = null;
    let role = (u?.user_metadata as any)?.role || 'student';
    let status = 'unsubmitted';
    try {
      const supabase = createClient();
      const { data: prof } = await supabase.from('users').select('role, verification_status').eq('id', u.id).single();
      if (prof?.role) role = prof.role;
      if (prof?.verification_status) status = prof.verification_status;
    } catch { /* fall back to metadata role */ }
    // Must be verified (admins are exempt) before reaching any dashboard or running an action.
    if (role !== 'admin' && status !== 'approved') { window.location.href = '/onboarding'; return; }
    if (a) { setTimeout(a, 80); return; }
    window.location.href =
      role === 'admin'  ? '/admin/users' :
      role === 'vendor' ? '/vendor/dashboard' :
                          '/student/dashboard';
  }, []);

  const signOut = useCallback(async () => {
    await createClient().auth.signOut();
    setUser(null);
  }, []);

  return (
    <Ctx.Provider value={{ user, loading, requireAuth, openAuth, signOut }}>
      {children}
      <AuthModal
        open={open} mode={mode} reason={reason}
        onClose={() => { setOpen(false); pending.current = null; }}
        onSuccess={onSuccess} setMode={setMode}
      />
    </Ctx.Provider>
  );
}

'use client';

import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import { OAuthButtons } from '@/components/auth/OAuthButtons';
import { OTP_ENABLED, BETA_MODE } from '@/config/features';

const LG_LockIcon = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;

export default function LoginPage() {
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  // Surface errors handed back by /auth/callback (e.g. a non-.edu Google
  // account) — otherwise the user is bounced here with no explanation.
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('error');
    if (!code) return;
    setError(
      code === 'edu_required'
        ? 'Handout is for students — please sign in with your university .edu email address.'
        : code === 'oauth_failed'
        ? 'We could not complete that sign-in. Please try again.'
        : 'Sign-in did not complete. Please try again.'
    );
    window.history.replaceState({}, '', '/auth/login');
  }, []);

  // OTP step
  const [step, setStep]           = useState<'form'|'otp'>('form');
  const [otpPhone, setOtpPhone]   = useState('');        // formatted for display
  const [otpDest, setOtpDest]     = useState('');        // redirect after verify
  const [digits, setDigits]       = useState<string[]>(Array(6).fill(''));
  const [devCode, setDevCode]     = useState('');
  const [otpErr, setOtpErr]       = useState('');
  const [otpBusy, setOtpBusy]     = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const codeRefs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));

  function startCountdown() {
    setCountdown(60);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown(c => { if (c <= 1) { clearInterval(timerRef.current!); return 0; } return c - 1; });
    }, 1000);
  }

  async function doLogin() {
    if (loading) return;
    setError(''); setLoading(true);
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const { data, error: err } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (err) { setError(err.message); setLoading(false); return; }
      if (!data.session) { setError('Could not sign you in. Please try again.'); setLoading(false); return; }

      // Determine destination
      let role = 'student', status = 'unsubmitted', rawPhone = '';
      try {
        const { data: prof } = await supabase.from('users').select('role, verification_status, phone').eq('id', data.session.user.id).single();
        if (prof?.role)                role = prof.role;
        if (prof?.verification_status) status = prof.verification_status;
        if (prof?.phone)               rawPhone = prof.phone.replace(/\D/g, '');
      } catch { /* fall back */ }

      // Verification is optional during Beta — skip the onboarding gate.
      const dest =
        role === 'admin'                             ? '/admin/users' :
        (role === 'vendor' || role === 'provider')   ? '/vendor/dashboard' :
        (!BETA_MODE && status !== 'approved')        ? '/onboarding' :
                                                        '/student/dashboard';

      // If user has a phone, send OTP before granting access.
      // OTP is disabled project-wide right now (OTP_ENABLED) for a frictionless
      // beta login — this whole path is preserved and re-enables with one flag flip.
      if (OTP_ENABLED && rawPhone.length >= 10) {
        const { data: fnData } = await supabase.functions.invoke('send-phone-otp', {
          body: { phone: rawPhone },
        });
        setDevCode(fnData?.code || '');
        setOtpPhone(rawPhone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3'));
        setOtpDest(dest);
        setLoading(false);
        setStep('otp');
        startCountdown();
        setTimeout(() => codeRefs[0].current?.focus(), 100);
        return;
      }

      // No phone on record — let them in directly
      setLoading(false);
      window.location.assign(dest);
    } catch (e: any) {
      setError(e?.message || 'Something went wrong');
      setLoading(false);
    }
  }

  function handleDigit(idx: number, val: string) {
    const d = val.replace(/\D/g, '').slice(-1);
    const arr = [...digits]; arr[idx] = d;
    setDigits(arr);
    if (d && idx < 5) codeRefs[idx + 1].current?.focus();
    if (d && arr.filter(Boolean).length === 6) verifyOtp(arr.join(''));
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      const arr = [...digits]; arr[idx - 1] = '';
      setDigits(arr); codeRefs[idx - 1].current?.focus();
    }
  }

  async function verifyOtp(override?: string) {
    const code = override ?? digits.join('');
    if (code.length !== 6) { setOtpErr('Enter all 6 digits'); return; }
    setOtpErr(''); setOtpBusy(true);
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    const raw = otpPhone.replace(/\D/g, '');
    try {
      const { data, error } = await supabase.rpc('verify_phone_otp', { p_phone: raw, p_code: code });
      if (error) throw error;
      if (!data) { setOtpErr('Incorrect code or expired. Try again.'); setOtpBusy(false); return; }
      window.location.assign(otpDest);
    } catch (e: any) {
      setOtpErr(e.message || 'Verification failed'); setOtpBusy(false);
    }
  }

  async function resendOtp() {
    if (countdown > 0 || otpBusy) return;
    setOtpErr(''); setOtpBusy(true);
    const { createClient } = await import('@/lib/supabase/client');
    const { data: fnData } = await createClient().functions.invoke('send-phone-otp', {
      body: { phone: otpPhone.replace(/\D/g, '') },
    });
    setDevCode(fnData?.code || '');
    setDigits(Array(6).fill(''));
    startCountdown();
    setOtpBusy(false);
    setTimeout(() => codeRefs[0].current?.focus(), 50);
  }

  async function cancelOtp() {
    const { createClient } = await import('@/lib/supabase/client');
    await createClient().auth.signOut();
    setStep('form');
    setDigits(Array(6).fill(''));
    setOtpErr('');
  }

  // ── OTP SCREEN ─────────────────────────────────────────────────────────────
  if (step === 'otp') {
    return (
      <div style={{ minHeight:'100vh', display:'flex', background:'#F1F7F3' }}>
        <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'space-between', padding:48, background:'radial-gradient(ellipse at 30% 50%,rgba(18,161,80,0.08) 0%,transparent 70%)', borderRight:'1px solid rgba(18,36,28,0.09)', maxWidth:520 }} className="login-left">
          <Link href="/landing" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
            <div style={{ width:36, height:36, background:'#12A150', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:800, fontSize:18, color:'#ffffff' }}>H</div>
            <span style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:700, fontSize:20, color:'#12241C' }}>Handout</span>
          </Link>
          <div>
            <h1 style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:'clamp(44px,5vw,72px)', fontWeight:800, letterSpacing:-3, lineHeight:0.92, color:'#12241C', marginBottom:20 }}>Welcome back.</h1>
            <p style={{ fontSize:17, color:'#4c6157', lineHeight:1.65, maxWidth:360 }}>One quick step to keep your account secure.</p>
          </div>
          <div style={{ fontSize:12, color:'#7d9188' }}>© 2026 Handout. All rights reserved.</div>
        </div>

        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'48px 32px' }}>
          <div style={{ width:'100%', maxWidth:400, background:'#FFFFFF', border:'1px solid rgba(18,36,28,0.09)', borderRadius:24, padding:'40px 36px' }}>
            <div style={{ textAlign:'center', marginBottom:28 }}>
              <div style={{ width:64, height:64, borderRadius:20, background:'rgba(18,161,80,0.10)', border:'1px solid rgba(18,161,80,0.22)', display:'inline-flex', alignItems:'center', justifyContent:'center', marginBottom:16, color:'var(--amber)' }}><LG_LockIcon /></div>
              <h2 style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:24, fontWeight:800, letterSpacing:-0.5, color:'#12241C', marginBottom:8 }}>Two-step verification</h2>
              <p style={{ fontSize:13.5, color:'#4c6157', lineHeight:1.6 }}>
                We sent a code to<br />
                <span style={{ color:'#12A150', fontWeight:700 }}>{otpPhone}</span>
              </p>
            </div>

            {devCode && (
              <div style={{ marginBottom:16, padding:'10px 14px', background:'rgba(255,212,121,0.1)', border:'1px solid rgba(255,212,121,0.3)', borderRadius:8, fontSize:12, color:'#E08A1E', textAlign:'center' }}>
                🛠 Dev mode — code: <strong style={{ letterSpacing:3, fontSize:15 }}>{devCode}</strong>
                <div style={{ color:'#7d9188', marginTop:4 }}>(SMS is sent in production via Twilio)</div>
              </div>
            )}

            {otpErr && (
              <div style={{ marginBottom:14, background:'rgba(194,91,78,0.10)', border:'1px solid rgba(194,91,78,0.3)', color:'#C25B4E', borderRadius:10, padding:'10px 12px', fontSize:13 }}>
                {otpErr}
              </div>
            )}

            <div style={{ display:'flex', gap:8, justifyContent:'center', margin:'8px 0 24px' }}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={codeRefs[i]}
                  type="text" inputMode="numeric" maxLength={1}
                  value={d}
                  disabled={otpBusy}
                  onChange={e => handleDigit(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  onFocus={e => e.target.select()}
                  style={{
                    width:46, height:56, textAlign:'center', fontSize:22, fontWeight:800,
                    background: d ? 'rgba(18,161,80,0.08)' : 'rgba(18,36,28,0.04)',
                    border:`2px solid ${d ? 'rgba(18,161,80,0.45)' : 'rgba(18,36,28,0.12)'}`,
                    borderRadius:12, color:'#12241C', outline:'none', caretColor:'transparent',
                  }}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => verifyOtp()}
              disabled={otpBusy || digits.filter(Boolean).length < 6}
              style={{ width:'100%', height:48, background:'#12A150', color:'#ffffff', border:'none', borderRadius:100, fontSize:15, fontWeight:700, cursor: (otpBusy || digits.filter(Boolean).length < 6) ? 'not-allowed' : 'pointer', opacity: (otpBusy || digits.filter(Boolean).length < 6) ? 0.55 : 1 }}
            >
              {otpBusy ? 'Verifying…' : 'Verify & sign in →'}
            </button>

            <p style={{ textAlign:'center', fontSize:13, color:'#7d9188', marginTop:20 }}>
              Didn&apos;t get the code?{' '}
              {countdown > 0
                ? <span>Resend in {countdown}s</span>
                : <button onClick={resendOtp} disabled={otpBusy} style={{ color:'#12A150', fontWeight:600, background:'none', border:'none', cursor:'pointer', fontSize:13 }}>Resend code</button>
              }
            </p>

            <p style={{ textAlign:'center', marginTop:12 }}>
              <button onClick={cancelOtp} style={{ fontSize:12, color:'#7d9188', background:'none', border:'none', cursor:'pointer', textDecoration:'underline' }}>← Cancel & sign out</button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── LOGIN FORM ──────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'#F1F7F3' }}>
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'space-between', padding:48, background:'radial-gradient(ellipse at 30% 50%,rgba(18,161,80,0.08) 0%,transparent 70%)', borderRight:'1px solid rgba(18,36,28,0.09)', maxWidth:520 }} className="login-left">
        <Link href="/landing" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
          <div style={{ width:36, height:36, background:'#12A150', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:800, fontSize:18, color:'#ffffff' }}>H</div>
          <span style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:700, fontSize:20, color:'#12241C' }}>Handout</span>
        </Link>
        <div>
          <h1 style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:'clamp(44px,5vw,72px)', fontWeight:800, letterSpacing:-3, lineHeight:0.92, color:'#12241C', marginBottom:20 }}>Welcome back.</h1>
          <p style={{ fontSize:17, color:'#4c6157', lineHeight:1.65, maxWidth:360 }}>Sign in to find roommates, food, and trusted services near your campus.</p>
        </div>
        <div style={{ fontSize:12, color:'#7d9188' }}>© 2026 Handout. All rights reserved.</div>
      </div>

      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'48px 32px' }}>
        <div style={{ width:'100%', maxWidth:400, background:'#FFFFFF', border:'1px solid rgba(18,36,28,0.09)', borderRadius:24, padding:'40px 36px' }}>
          <div style={{ display:'flex', background:'rgba(18,36,28,0.04)', borderRadius:12, padding:4, marginBottom:32 }}>
            <div style={{ flex:1, height:36, display:'flex', alignItems:'center', justifyContent:'center', background:'#E7F1EA', borderRadius:9, fontSize:13, fontWeight:700, color:'#12241C' }}>Log in</div>
            <Link href="/auth/signup" style={{ flex:1, height:36, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:500, color:'#7d9188', textDecoration:'none' }}>Sign up</Link>
          </div>

          <h2 style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:28, fontWeight:800, letterSpacing:-1, color:'#12241C', marginBottom:6 }}>Sign in</h2>
          <p style={{ fontSize:14, color:'#7d9188', marginBottom:24 }}>Enter your details to continue.</p>

          <OAuthButtons mode="login" />

          {error && (
            <div style={{ background:'rgba(220,38,38,0.1)', border:'1px solid rgba(220,38,38,0.25)', borderRadius:10, padding:'12px 14px', fontSize:13, color:'#C25B4E', marginBottom:18 }}>
              {error}
            </div>
          )}

          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') doLogin(); }} placeholder="you@university.edu" disabled={loading} style={inputStyle} />
            </div>
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <label style={labelStyle}>Password</label>
                <Link href="/auth/forgot-password" style={{ fontSize:12, color:'#12A150', textDecoration:'none' }}>Forgot?</Link>
              </div>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') doLogin(); }} placeholder="••••••••" disabled={loading} style={inputStyle} />
            </div>
            <button type="button" onClick={doLogin} disabled={loading} style={{ marginTop:8, height:48, background:'#12A150', color:'#ffffff', border:'none', borderRadius:100, fontSize:15, fontWeight:700, cursor:loading?'wait':'pointer', width:'100%' }}>
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </div>

          <p style={{ textAlign:'center', fontSize:13, color:'#7d9188', marginTop:20 }}>
            Don't have an account? <Link href="/auth/signup" style={{ color:'#12A150', fontWeight:600 }}>Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const labelStyle = { fontSize:12, fontWeight:600, color:'#4c6157', display:'block' as const };
const inputStyle = { width:'100%', height:44, padding:'0 14px', background:'rgba(18,36,28,0.04)', border:'1px solid rgba(18,36,28,0.09)', borderRadius:10, color:'#12241C', fontSize:14, boxSizing:'border-box' as const };

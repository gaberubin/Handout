'use client';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { captureRefFromUrl } from '@/lib/referral';
import { UniversitySelect } from '@/components/ui/UniversitySelect';
import { MajorSelect } from '@/components/ui/MajorSelect';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { OAuthButtons } from '@/components/auth/OAuthButtons';
import { OTP_ENABLED } from '@/config/features';
import { validateEduEmail } from '@/lib/validation';

const SU_CapIcon   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>;
const SU_BriefIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
const SU_PhoneIcon = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>;

export default function SignupPage() {
  const [fullName, setFullName]     = useState('');
  const [email, setEmail]           = useState('');
  const [phone, setPhone]           = useState('');
  const [university, setUniversity] = useState('');
  const [major, setMajor]           = useState('');
  const [password, setPassword]     = useState('');
  const [role, setRole]             = useState<'student'|'vendor'>('student');
  const [agreed, setAgreed]         = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  // Remember an incoming referral code (?ref=REF-…) so it survives signup +
  // email confirm + any OAuth redirect; it's claimed once the user is inside.
  useEffect(() => { captureRefFromUrl(); }, []);

  // OTP step
  const [step, setStep]         = useState<'form'|'otp'>('form');
  const [digits, setDigits]     = useState<string[]>(Array(6).fill(''));
  const [devCode, setDevCode]   = useState('');
  const [otpErr, setOtpErr]     = useState('');
  const [otpBusy, setOtpBusy]   = useState(false);
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

  async function handleSubmit() {
    setError('');
    if (fullName.length < 2)              { setError('Enter your full name'); return; }
    if (role === 'student') {
      const eduErr = validateEduEmail(email);
      if (eduErr) { setError(eduErr); return; }
    } else if (!email.includes('@'))      { setError('Enter a valid email'); return; }
    // Beta: phone is OPTIONAL. Only validate it when the user chooses to add one.
    if (phone && phone.replace(/\D/g,'').length < 10) { setError('Enter a valid 10-digit phone number'); return; }
    if (password.length < 6)             { setError('Password needs 6+ chars'); return; }
    if (!agreed)                         { setError('You must accept the Terms to continue'); return; }

    setLoading(true);
    const supabase = createClient();

    // Block duplicate accounts by phone number (email uniqueness is already
    // enforced by Supabase auth itself).
    const rawPhoneCheck = phone.replace(/\D/g, '');
    if (rawPhoneCheck) {
      const { data: taken } = await supabase.rpc('phone_number_taken', { p_phone: rawPhoneCheck });
      if (taken) { setError('An account already exists with this phone number.'); setLoading(false); return; }
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { full_name: fullName, role },
        // Without this, Supabase points the confirmation email at the project's
        // Site URL, which drops the auth token and dumps the student back on the
        // login page. Send them through our callback so the session is created.
        emailRedirectTo: `${window.location.origin}/auth/callback${role === 'vendor' ? '?role=vendor' : ''}`,
      },
    });

    if (signUpError) { setError(signUpError.message); setLoading(false); return; }
    if (!data.user)  { setError('Signup failed'); setLoading(false); return; }

    // Persist profile
    const raw = phone.replace(/\D/g, '');
    await supabase.from('users').update({ full_name: fullName, phone: raw, role }).eq('id', data.user.id);
    if (role === 'student') {
      await supabase.from('student_profiles').upsert({ user_id: data.user.id, university, major });
    }

    // Beta: no mandatory ID verification. Students go straight to the dashboard;
    // an OPTIONAL "Become Verified" card is offered there. Vendors keep onboarding.
    const dest = role === 'vendor' ? '/vendor/onboarding' : '/student/dashboard';

    // Phone verification is optional — skip it entirely when no number was given.
    // OTP is also disabled project-wide right now (OTP_ENABLED) to keep signup
    // frictionless — this code path is preserved and re-enables with one flag flip.
    if (!raw || !OTP_ENABLED) {
      setLoading(false);
      window.location.href = dest;
      return;
    }

    // Optional phone OTP (kept for users who add a number)
    const { data: fnData, error: fnErr } = await supabase.functions.invoke('send-phone-otp', {
      body: { phone: raw },
    });

    if (fnErr) {
      // If OTP send fails, still proceed — phone is not required in beta.
      setLoading(false);
      window.location.href = dest;
      return;
    }

    setDevCode(fnData?.code || '');
    setLoading(false);
    setStep('otp');
    startCountdown();
  }

  function handleDigit(idx: number, val: string) {
    const d = val.replace(/\D/g, '').slice(-1);
    const arr = [...digits];
    arr[idx] = d;
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
    const supabase = createClient();
    const raw = phone.replace(/\D/g, '');
    try {
      const { data, error } = await supabase.rpc('verify_phone_otp', { p_phone: raw, p_code: code });
      if (error) throw error;
      if (!data) { setOtpErr('Incorrect code or expired. Try again.'); setOtpBusy(false); return; }
      window.location.href = role === 'vendor' ? '/vendor/onboarding' : '/student/dashboard';
    } catch (e: any) {
      setOtpErr(e.message || 'Verification failed'); setOtpBusy(false);
    }
  }

  async function resendOtp() {
    if (countdown > 0) return;
    setOtpErr(''); setOtpBusy(true);
    const supabase = createClient();
    const raw = phone.replace(/\D/g, '');
    const { data: fnData } = await supabase.functions.invoke('send-phone-otp', { body: { phone: raw } });
    setDevCode(fnData?.code || '');
    setDigits(Array(6).fill(''));
    startCountdown();
    setOtpBusy(false);
    setTimeout(() => codeRefs[0].current?.focus(), 50);
  }

  // ── OTP SCREEN ──────────────────────────────────────────────────────────────
  if (step === 'otp') {
    const fmtPhone = phone.replace(/\D/g,'').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    return (
      <div style={{ minHeight:'100vh', display:'flex', background:'#F1F7F3' }}>
        <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'space-between', padding:48, background:'radial-gradient(ellipse at 30% 50%,rgba(18,161,80,0.08) 0%,transparent 70%)', borderRight:'1px solid rgba(18,36,28,0.09)', maxWidth:520 }} className="login-left">
          <Link href="/landing" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
            <div style={{ width:36, height:36, background:'#12A150', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:800, fontSize:18, color:'#ffffff' }}>H</div>
            <span style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:700, fontSize:20, color:'#12241C' }}>Handout</span>
          </Link>
          <div>
            <h1 style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:'clamp(44px,5vw,72px)', fontWeight:800, letterSpacing:-3, lineHeight:0.92, color:'#12241C', marginBottom:20 }}>One last step.</h1>
            <p style={{ fontSize:17, color:'#4c6157', lineHeight:1.65, maxWidth:360 }}>Verify your phone to secure your account.</p>
          </div>
          <div style={{ fontSize:12, color:'#7d9188' }}>© 2026 Handout. All rights reserved.</div>
        </div>

        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'48px 32px' }}>
          <div style={{ width:'100%', maxWidth:420, background:'#FFFFFF', border:'1px solid rgba(18,36,28,0.09)', borderRadius:24, padding:'40px 36px' }}>
            <div style={{ textAlign:'center', marginBottom:28 }}>
              <div style={{ width:64, height:64, borderRadius:20, background:'rgba(18,161,80,0.10)', border:'1px solid rgba(18,161,80,0.22)', display:'inline-flex', alignItems:'center', justifyContent:'center', marginBottom:16, color:'var(--amber)' }}><SU_PhoneIcon /></div>
              <h2 style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:24, fontWeight:800, letterSpacing:-0.5, color:'#12241C', marginBottom:8 }}>Verify your phone</h2>
              <p style={{ fontSize:13.5, color:'#4c6157', lineHeight:1.6 }}>
                We sent a 6-digit code to<br />
                <span style={{ color:'#12A150', fontWeight:700 }}>{fmtPhone}</span>
              </p>
            </div>

            {devCode && (
              <div style={{ marginBottom:16, padding:'10px 14px', background:'rgba(255,212,121,0.1)', border:'1px solid rgba(255,212,121,0.3)', borderRadius:8, fontSize:12, color:'#E08A1E', textAlign:'center' }}>
                🛠 Dev mode — code: <strong style={{ letterSpacing:3, fontSize:15 }}>{devCode}</strong>
                <div style={{ color:'#7d9188', marginTop:4 }}>(In production this is sent via Twilio SMS)</div>
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
              {otpBusy ? 'Verifying…' : 'Verify & continue →'}
            </button>

            <p style={{ textAlign:'center', fontSize:13, color:'#7d9188', marginTop:20 }}>
              Didn&apos;t get the code?{' '}
              {countdown > 0
                ? <span>Resend in {countdown}s</span>
                : <button onClick={resendOtp} disabled={otpBusy} style={{ color:'#12A150', fontWeight:600, background:'none', border:'none', cursor:'pointer', fontSize:13 }}>Resend code</button>
              }
            </p>

            <p style={{ textAlign:'center', marginTop:12 }}>
              <button onClick={() => setStep('form')} style={{ fontSize:12, color:'#7d9188', background:'none', border:'none', cursor:'pointer', textDecoration:'underline' }}>← Back to sign up</button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── SIGNUP FORM ──────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'#F1F7F3' }}>
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'space-between', padding:48, background:'radial-gradient(ellipse at 30% 50%,rgba(18,161,80,0.08) 0%,transparent 70%)', borderRight:'1px solid rgba(18,36,28,0.09)', maxWidth:520 }} className="login-left">
        <Link href="/landing" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
          <div style={{ width:36, height:36, background:'#12A150', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:800, fontSize:18, color:'#ffffff' }}>H</div>
          <span style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:700, fontSize:20, color:'#12241C' }}>Handout</span>
        </Link>
        <div>
          <h1 style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:'clamp(44px,5vw,72px)', fontWeight:800, letterSpacing:-3, lineHeight:0.92, color:'#12241C', marginBottom:20 }}>Join the community.</h1>
          <p style={{ fontSize:17, color:'#4c6157', lineHeight:1.65, maxWidth:360 }}>Free to join. No credit card needed.</p>
        </div>
        <div style={{ fontSize:12, color:'#7d9188' }}>© 2026 Handout. All rights reserved.</div>
      </div>

      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'48px 32px', overflowY:'auto' }}>
        <div style={{ width:'100%', maxWidth:420, background:'#FFFFFF', border:'1px solid rgba(18,36,28,0.09)', borderRadius:24, padding:'40px 36px' }}>
          <div style={{ display:'flex', background:'rgba(18,36,28,0.04)', borderRadius:12, padding:4, marginBottom:28 }}>
            <Link href="/auth/login" style={{ flex:1, height:36, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:500, color:'#7d9188', textDecoration:'none' }}>Log in</Link>
            <div style={{ flex:1, height:36, display:'flex', alignItems:'center', justifyContent:'center', background:'#E7F1EA', borderRadius:9, fontSize:13, fontWeight:700, color:'#12241C' }}>Sign up</div>
          </div>

          <h2 style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:26, fontWeight:800, letterSpacing:-1, color:'#12241C', marginBottom:20 }}>Create account</h2>

          <p style={{ fontSize:12, fontWeight:600, color:'#4c6157', marginBottom:10 }}>I'm joining as a…</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
            {([['student','Student'],['vendor','Vendor']] as const).map(([r,label]) => (
              <button key={r} type="button" onClick={() => setRole(r)} style={{ border:`2px solid ${role===r?'#12A150':'rgba(18,36,28,0.09)'}`, borderRadius:14, padding:'14px 10px', textAlign:'center', background:role===r?'rgba(18,161,80,0.08)':'transparent', cursor:'pointer' }}>
                <div style={{ marginBottom:4, display:'flex', justifyContent:'center', color: role===r?'#12A150':'#7d9188' }}>{r==='student'?<SU_CapIcon />:<SU_BriefIcon />}</div>
                <div style={{ fontSize:13, fontWeight:700, color:'#12241C' }}>{label}</div>
              </button>
            ))}
          </div>

          <OAuthButtons mode="signup" role={role} />

          {error && <div style={{ background:'rgba(220,38,38,0.1)', border:'1px solid rgba(220,38,38,0.25)', borderRadius:10, padding:'12px 14px', fontSize:13, color:'#C25B4E', marginBottom:16 }}>{error}</div>}

          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div>
              <label style={labelStyle}>Full name *</label>
              <input type="text" value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="First and last name" disabled={loading} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Email *</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@university.edu" disabled={loading} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Phone number <span style={{ color:'#7d9188', fontWeight:400 }}>(optional)</span></label>
              <PhoneInput value={phone} onChange={setPhone} disabled={loading} />
            </div>
            {role === 'student' && (
              <>
                <div>
                  <label style={labelStyle}>University</label>
                  <UniversitySelect value={university} onChange={setUniversity} disabled={loading} />
                </div>
                <div>
                  <label style={labelStyle}>Major</label>
                  <MajorSelect value={major} onChange={setMajor} disabled={loading} />
                </div>
              </>
            )}
            <div>
              <label style={labelStyle}>Password *</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="6+ characters" disabled={loading} style={inputStyle} />
            </div>

            <label style={{ display:'flex', alignItems:'flex-start', gap:8, fontSize:12, color:'#4c6157', cursor:'pointer', lineHeight:1.5, marginTop:6 }}>
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginTop:2, accentColor:'#12A150', cursor:'pointer', width:16, height:16 }} />
              <span>
                I agree to Handout's{' '}
                <Link href="/legal/terms" target="_blank" style={{ color:'#12A150' }}>Terms</Link>
                {' '}and{' '}
                <Link href="/legal/privacy" target="_blank" style={{ color:'#12A150' }}>Privacy Policy</Link>. I am 18+.
              </span>
            </label>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !agreed}
              style={{
                marginTop:6, height:48,
                background: agreed ? '#12A150' : 'rgba(18,161,80,0.3)',
                color:'#ffffff', border:'none', borderRadius:100, fontSize:15, fontWeight:700,
                cursor: (loading || !agreed) ? 'not-allowed' : 'pointer', width:'100%',
              }}
            >
              {loading ? 'Creating account…' : 'Create account →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const labelStyle = { fontSize:12, fontWeight:600, color:'#4c6157', display:'block' as const, marginBottom:6 };
const inputStyle = { width:'100%', height:44, padding:'0 14px', background:'rgba(18,36,28,0.04)', border:'1px solid rgba(18,36,28,0.09)', borderRadius:10, color:'#12241C', fontSize:14, boxSizing:'border-box' as const };

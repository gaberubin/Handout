'use client';

import { useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Props {
  initialPhone?: string;
  initialVerified?: boolean;
  onVerified?: (phone: string) => void;
  inputStyle?: React.CSSProperties;
  labelStyle?: React.CSSProperties;
}

function digits(v: string) { return v.replace(/\D/g, ''); }
function fmt(v: string) {
  const d = digits(v).slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

const BASE_I: React.CSSProperties = {
  height: 44, padding: '0 14px',
  background: 'rgba(18,36,28,0.05)',
  border: '1px solid rgba(18,36,28,0.12)',
  borderRadius: 10, color: '#12241C', fontSize: 14,
  boxSizing: 'border-box', outline: 'none',
};
const L: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 700,
  color: '#4c6157', marginBottom: 6, letterSpacing: 0.4,
};

type Phase = 'idle' | 'sending' | 'code_sent' | 'verifying' | 'verified' | 'error';

export function PhoneOTPVerify({ initialPhone = '', initialVerified = false, onVerified, inputStyle, labelStyle }: Props) {
  const [phone, setPhone] = useState(initialPhone ? fmt(digits(initialPhone)) : '');
  const [phase, setPhase] = useState<Phase>(initialVerified ? 'verified' : 'idle');
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const codeRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const raw = digits(phone);
  const phoneValid = raw.length === 10;
  const I = { ...BASE_I, ...(inputStyle || {}) };

  function startCountdown() {
    setCountdown(60);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown(c => { if (c <= 1) { clearInterval(timerRef.current!); return 0; } return c - 1; });
    }, 1000);
  }

  async function sendCode() {
    if (!phoneValid) { setErrMsg('Enter a valid 10-digit US number'); return; }
    setErrMsg(''); setPhase('sending');
    const supabase = createClient();
    try {
      const { data, error } = await supabase.functions.invoke('send-phone-otp', {
        body: { phone: raw },
      });
      if (error) throw error;
      setDevCode(data?.code || '');
      setPhase('code_sent');
      setCode('');
      startCountdown();
    } catch (e: any) {
      setErrMsg(e.message || 'Failed to send code'); setPhase('error');
    }
  }

  function handleDigit(idx: number, val: string) {
    const d = val.replace(/\D/g, '').slice(-1);
    const arr = code.padEnd(6, ' ').split('');
    arr[idx] = d || ' ';
    const next = arr.join('').replace(/ /g, '');
    setCode(next);
    if (d && idx < 5) codeRefs[idx + 1].current?.focus();
    if (next.length === 6) verify(next);
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !code[idx] && idx > 0) {
      const arr = code.padEnd(6, ' ').split('');
      arr[idx - 1] = ' ';
      setCode(arr.join('').replace(/ /g, ''));
      codeRefs[idx - 1].current?.focus();
    }
  }

  async function verify(overrideCode?: string) {
    const c = (overrideCode ?? code).trim();
    if (c.length !== 6) { setErrMsg('Enter the full 6-digit code'); return; }
    setErrMsg(''); setPhase('verifying');
    const supabase = createClient();
    try {
      const { data, error } = await supabase.rpc('verify_phone_otp', { p_phone: raw, p_code: c });
      if (error) throw error;
      if (!data) { setErrMsg('Incorrect code or expired. Try again.'); setPhase('code_sent'); return; }
      setPhase('verified');
      onVerified?.(raw);
    } catch (e: any) {
      setErrMsg(e.message || 'Verification failed'); setPhase('code_sent');
    }
  }

  if (phase === 'verified') {
    return (
      <div>
        <label style={{ ...L, ...(labelStyle || {}) }}>Phone number</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 44, padding: '0 14px', background: 'rgba(18,161,80,0.06)', border: '1px solid rgba(18,161,80,0.3)', borderRadius: 10 }}>
          <span style={{ fontSize: 14, color: '#12241C', flex: 1 }}>{fmt(phone)}</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#12A150', display: 'flex', alignItems: 'center', gap: 4 }}>✅ Verified</span>
        </div>
        <button onClick={() => { setPhase('idle'); setCode(''); setDevCode(''); }}
          style={{ marginTop: 6, fontSize: 11, color: '#7d9188', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
          Change number
        </button>
      </div>
    );
  }

  return (
    <div>
      <label style={{ ...L, ...(labelStyle || {}) }}>Phone number</label>

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          style={{ ...I, flex: 1 }}
          type="tel" inputMode="numeric"
          placeholder="(856) 123-4567"
          value={phone}
          onChange={e => { setPhone(fmt(e.target.value)); setPhase('idle'); setDevCode(''); setCode(''); }}
          disabled={phase === 'code_sent' || phase === 'sending' || phase === 'verifying'}
        />
        <button
          onClick={sendCode}
          disabled={!phoneValid || phase === 'sending' || (phase === 'code_sent' && countdown > 0)}
          style={{
            flexShrink: 0, height: 44, padding: '0 16px', borderRadius: 10, border: 'none',
            background: phase === 'code_sent' && countdown > 0 ? 'rgba(18,36,28,0.06)' : '#12A150',
            color: phase === 'code_sent' && countdown > 0 ? '#7d9188' : '#ffffff',
            fontSize: 13, fontWeight: 700, cursor: (phase === 'sending' || (phase === 'code_sent' && countdown > 0)) ? 'default' : 'pointer',
            opacity: !phoneValid ? 0.5 : 1, whiteSpace: 'nowrap',
          }}>
          {phase === 'sending' ? 'Sending…' : phase === 'code_sent' && countdown > 0 ? `Resend (${countdown}s)` : phase === 'code_sent' ? 'Resend' : 'Send code'}
        </button>
      </div>

      {devCode && (
        <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(255,212,121,0.1)', border: '1px solid rgba(255,212,121,0.3)', borderRadius: 8, fontSize: 12, color: '#E08A1E' }}>
          🛠 Dev mode — your code: <strong style={{ letterSpacing: 3, fontSize: 15 }}>{devCode}</strong>
          <span style={{ color: '#7d9188', marginLeft: 8 }}>(SMS is sent in production via Twilio)</span>
        </div>
      )}

      {(phase === 'code_sent' || phase === 'verifying') && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 12, color: '#4c6157', marginBottom: 10 }}>
            Enter the 6-digit code sent to {fmt(phone)}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-start' }}>
            {[0,1,2,3,4,5].map(i => (
              <input
                key={i}
                ref={codeRefs[i]}
                type="text" inputMode="numeric" maxLength={1}
                value={code[i] || ''}
                onChange={e => handleDigit(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                onFocus={e => e.target.select()}
                style={{
                  width: 44, height: 54, textAlign: 'center', fontSize: 22, fontWeight: 800,
                  background: 'rgba(18,36,28,0.05)', border: `2px solid ${code[i] ? '#12A150' : 'rgba(18,36,28,0.12)'}`,
                  borderRadius: 10, color: '#12241C', outline: 'none',
                  transition: 'border-color 0.15s',
                }}
              />
            ))}
          </div>
          <button
            onClick={() => verify()}
            disabled={code.length !== 6 || phase === 'verifying'}
            style={{ marginTop: 12, height: 42, padding: '0 24px', borderRadius: 100, border: 'none', background: '#12A150', color: '#ffffff', fontSize: 13, fontWeight: 800, cursor: code.length < 6 ? 'default' : 'pointer', opacity: code.length < 6 ? 0.5 : 1 }}>
            {phase === 'verifying' ? 'Verifying…' : 'Verify →'}
          </button>
        </div>
      )}

      {errMsg && (
        <div style={{ marginTop: 8, fontSize: 12, color: '#C25B4E', display: 'flex', alignItems: 'center', gap: 5 }}>
          ⚠ {errMsg}
        </div>
      )}
    </div>
  );
}

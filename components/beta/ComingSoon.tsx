'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { COMING_SOON } from '@/config/features';

const RocketIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
    <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
  </svg>
);
const HomeIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const BellIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const CheckIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;

export function ComingSoon({ feature }: { feature?: string }) {
  const meta = (feature && COMING_SOON[feature]) || { title: 'This feature', emoji: '🚀', blurb: '' };
  const [joined, setJoined] = useState(false);
  const [busy, setBusy] = useState(false);

  async function joinWaitlist() {
    if (joined || busy) return;
    setBusy(true);
    try {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (user) {
        // Best-effort — table is optional; a failure still shows confirmation.
        await sb.from('beta_waitlist').upsert(
          { user_id: user.id, feature: feature || 'general' },
          { onConflict: 'user_id,feature' }
        );
      }
    } catch { /* non-critical */ }
    setBusy(false);
    setJoined(true);
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '32px 0' }}>
      <div style={{ background: '#fff', border: '1px solid rgba(18,36,28,0.09)', borderRadius: 24, padding: '44px 36px', textAlign: 'center', boxShadow: '0 18px 40px rgba(18,36,28,0.06)' }}>

        <div style={{ fontSize: 44, lineHeight: 1, marginBottom: 6 }}>{meta.emoji}</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#12A150', marginBottom: 14 }}>
          <RocketIcon />
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(18,161,80,0.10)', border: '1px solid rgba(18,161,80,0.22)', borderRadius: 100, padding: '5px 13px', marginBottom: 16 }}>
          <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#0F8A44' }}>What&apos;s Next</span>
        </div>

        <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 30, fontWeight: 800, letterSpacing: -1, color: '#12241C', margin: '0 0 12px' }}>
          {meta.title}
        </h1>

        <p style={{ fontSize: 15, color: '#4C6157', lineHeight: 1.7, margin: '0 auto 8px', maxWidth: 420 }}>
          {meta.blurb || 'This feature is currently under development.'}
        </p>
        <p style={{ fontSize: 14, color: '#7D9188', lineHeight: 1.7, margin: '0 auto 28px', maxWidth: 420 }}>
          We&apos;re focusing on building the best student community first. Thank you for being an early Handout Beta user.
        </p>

        {joined ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(18,161,80,0.10)', border: '1px solid rgba(18,161,80,0.25)', borderRadius: 100, padding: '11px 20px', color: '#0F8A44', fontSize: 14, fontWeight: 700, marginBottom: 22 }}>
            <CheckIcon /> You&apos;re on the waitlist — we&apos;ll notify you at launch.
          </div>
        ) : (
          <button onClick={joinWaitlist} disabled={busy} className="ft-btn ft-btn-p" style={{ height: 46, padding: '0 24px', fontSize: 14, marginBottom: 22 }}>
            <BellIcon /> {busy ? 'Joining…' : 'Join the waitlist'}
          </button>
        )}

        <div>
          <Link href="/student/dashboard" className="ft-btn ft-btn-o" style={{ height: 44, padding: '0 22px', fontSize: 14 }}>
            <HomeIcon /> Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

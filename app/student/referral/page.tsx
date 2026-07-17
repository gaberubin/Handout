'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { StudentLayout } from '@/components/layout/StudentLayout';

/* ── SVG icons ── */
const LinkIcon  = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
const SignUpIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const GiftIcon  = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>;
const GiftHeroIcon = () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>;
const PhoneIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>;
const MailIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;

export default function ReferralPage() {
  const [me, setMe] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { window.location.href = '/auth/login'; return; }
      const { data: u } = await sb.from('users').select('*').eq('id', user.id).single();
      setMe(u || { id: user.id, email: user.email });
      // Load referrals this user made
      const { data: refs } = await sb.from('referrals').select('*').eq('referrer_id', user.id).order('created_at', { ascending: false });
      setReferrals(refs || []);
      setLoading(false);
    })();
  }, []);

  const referralCode = me ? `REF-${me.id.slice(0, 8).toUpperCase()}` : '';
  const referralLink = me ? `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/signup?ref=${referralCode}` : '';
  const joined = referrals.filter(r => r.joined_at).length;
  const needed = 3;
  const progress = Math.min(joined, needed);
  const earned = Math.floor(joined / needed);

  function copyLink() {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const steps = [
    { n: 1, Icon: LinkIcon,   title: 'Share your link', desc: 'Send your unique referral link to friends via text, Instagram, or WhatsApp.' },
    { n: 2, Icon: SignUpIcon, title: 'They sign up', desc: 'Your friend joins Handout using your link. Takes under 2 minutes.' },
    { n: 3, Icon: GiftIcon,   title: 'You both get rewarded', desc: 'Once 3 friends join, you get 1 month of Plus free. They get 2 weeks free.' },
  ];

  return (
    <StudentLayout title="Refer & Earn">
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Hero banner */}
        <div style={{ background: 'linear-gradient(135deg,rgba(18,161,80,0.08),rgba(124,107,209,0.08))', border: '1px solid rgba(18,161,80,0.18)', borderRadius: 24, padding: '40px 36px', marginBottom: 28, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', width: 300, height: 300, background: 'radial-gradient(circle,rgba(18,161,80,0.07) 0%,transparent 70%)', top: -80, right: -40, borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ marginBottom: 16, color: 'var(--amber)', display: 'inline-flex', justifyContent: 'center' }}><GiftHeroIcon /></div>
          <h1 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 'clamp(28px,4vw,42px)', fontWeight: 800, letterSpacing: -1.5, color: 'var(--white)', marginBottom: 10 }}>
            Invite friends,<br /><span style={{ color: 'var(--amber)' }}>get Plus free.</span>
          </h1>
          <p style={{ fontSize: 16, color: 'var(--muted)', marginBottom: 0, lineHeight: 1.6 }}>
            Invite 3 friends to Handout. Once they sign up, you get <strong style={{ color: 'var(--white)' }}>1 month of Plus free</strong>.<br />They get <strong style={{ color: 'var(--white)' }}>2 weeks of Plus free</strong> just for joining.
          </p>
        </div>

        {/* Progress tracker */}
        <div style={{ background: 'var(--navy2)', border: '1px solid var(--border)', borderRadius: 20, padding: '28px 28px', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Your progress</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--white)', letterSpacing: -1 }}>
                {progress}<span style={{ fontSize: 16, color: 'var(--muted)', fontWeight: 400 }}>/{needed} friends joined</span>
              </div>
            </div>
            {earned > 0 && (
              <div style={{ background: 'rgba(18,161,80,0.12)', border: '1px solid rgba(18,161,80,0.3)', borderRadius: 12, padding: '8px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#12A150', textTransform: 'uppercase', letterSpacing: 1 }}>Earned</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#12A150' }}>{earned} mo free</div>
              </div>
            )}
          </div>
          {/* Progress bar */}
          <div style={{ height: 8, background: 'rgba(18,36,28,0.06)', borderRadius: 100, overflow: 'hidden', marginBottom: 10 }}>
            <div style={{ height: '100%', width: `${(progress / needed) * 100}%`, background: 'linear-gradient(90deg,var(--amber),#12A150)', borderRadius: 100, transition: 'width 0.6s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {Array.from({ length: needed }, (_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: i < progress ? '#12A150' : 'var(--muted)', fontWeight: 600 }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', background: i < progress ? 'rgba(18,161,80,0.2)' : 'rgba(18,36,28,0.06)', border: `1px solid ${i < progress ? '#12A150' : 'rgba(18,36,28,0.09)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>
                  {i < progress ? '✓' : i + 1}
                </span>
                Friend {i + 1} {i < progress ? '✓' : ''}
              </div>
            ))}
          </div>
        </div>

        {/* Referral link */}
        <div style={{ background: 'var(--navy2)', border: '1px solid var(--border)', borderRadius: 20, padding: '24px 28px', marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>Your referral link</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, height: 48, background: 'rgba(18,36,28,0.04)', border: '1px solid rgba(18,36,28,0.09)', borderRadius: 12, padding: '0 16px', display: 'flex', alignItems: 'center', fontSize: 13, color: 'var(--light)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontFamily: 'monospace' }}>
              {loading ? '—' : referralLink}
            </div>
            <button onClick={copyLink} style={{ height: 48, padding: '0 24px', borderRadius: 12, background: copied ? 'rgba(18,161,80,0.15)' : 'var(--amber)', color: copied ? '#12A150' : '#ffffff', fontWeight: 800, fontSize: 14, cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s', border: copied ? '1px solid rgba(18,161,80,0.4)' : 'none' } as any}>
              {copied ? '✓ Copied!' : 'Copy link'}
            </button>
          </div>
          <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { label: 'WhatsApp', Icon: PhoneIcon, color: '#25D366', bg: 'rgba(37,211,102,0.08)', href: `https://wa.me/?text=${encodeURIComponent(`Hey! Join me on Handout — find roommates, home-cooked food, and more. Use my link: ${referralLink}`)}` },
              { label: 'Email', Icon: MailIcon, color: '#12A150', bg: 'rgba(18,161,80,0.08)', href: `mailto:?subject=Join me on Handout&body=${encodeURIComponent(`Hey!\n\nI've been using Handout to find roommates and home-cooked food near campus. You'll love it.\n\nJoin using my link and get 2 weeks free: ${referralLink}`)}` },
            ].map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                style={{ padding: '8px 18px', borderRadius: 100, fontSize: 13, fontWeight: 700, background: s.bg, color: s.color, border: `1px solid ${s.color}33`, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <s.Icon />{s.label}
              </a>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div style={{ background: 'var(--navy2)', border: '1px solid var(--border)', borderRadius: 20, padding: '24px 28px', marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 18 }}>How it works</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {steps.map((s, i) => (
              <div key={s.n} style={{ display: 'flex', gap: 16, paddingBottom: i < steps.length - 1 ? 20 : 0, position: 'relative' }}>
                {i < steps.length - 1 && <div style={{ position: 'absolute', left: 19, top: 40, width: 1, height: 'calc(100% - 20px)', background: 'rgba(18,36,28,0.07)' }} />}
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(18,161,80,0.1)', border: '1px solid rgba(18,161,80,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--amber)' }}><s.Icon /></div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--white)', marginBottom: 4 }}>{s.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Referral history */}
        {referrals.length > 0 && (
          <div style={{ background: 'var(--navy2)', border: '1px solid var(--border)', borderRadius: 20, padding: '24px 28px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>People you referred</div>
            {referrals.map(r => (
              <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(18,36,28,0.05)' }}>
                <div>
                  <div style={{ fontSize: 14, color: 'var(--white)', fontWeight: 600 }}>{r.referred_email || 'Friend'}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.joined_at ? `Joined ${new Date(r.joined_at).toLocaleDateString()}` : 'Invited — waiting to join'}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 100, background: r.joined_at ? 'rgba(18,161,80,0.1)' : 'rgba(18,36,28,0.06)', color: r.joined_at ? '#12A150' : 'var(--muted)', border: `1px solid ${r.joined_at ? 'rgba(18,161,80,0.25)' : 'rgba(18,36,28,0.09)'}` }}>
                  {r.joined_at ? '✓ Joined' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        )}

      </div>
    </StudentLayout>
  );
}

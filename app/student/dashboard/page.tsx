'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { DashStats } from '@/components/ui/DashStats';
import { BetaBadge } from '@/components/beta/BetaBadge';

const PeopleIcon    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const GlobeIcon     = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const BagIcon       = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
const HeartIcon     = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const CalIcon       = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const StarIcon      = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;

const EXPLORE = [
  { href: '/student/roommates',           Icon: PeopleIcon, label: 'Find Roommate',    desc: 'Post or browse listings',  color: '#12A150', bg: 'rgba(18,161,80,.1)' },
  { href: '/student/community',           Icon: GlobeIcon,  label: 'Community',        desc: 'Feed & campus updates',    color: '#2563EB', bg: 'rgba(37,99,235,.1)' },
  { href: '/student/community?tab=market',Icon: BagIcon,    label: 'Marketplace',      desc: 'Buy & sell with students', color: '#E08A1E', bg: 'rgba(226,138,30,.12)' },
  { href: '/student/events',              Icon: CalIcon,    label: 'Campus Events',    desc: 'RSVP to what’s on',        color: '#2E7D5B', bg: 'rgba(46,125,91,.12)' },
  { href: '/student/dating',              Icon: HeartIcon,  label: 'Campus Connect',   desc: 'Meet Rowan students',      color: '#C25B4E', bg: 'rgba(194,91,78,.12)' },
  { href: '/student/find-people',         Icon: StarIcon,   label: 'Find Your People', desc: 'Study, gym & project buds', color: '#7C6BD1', bg: 'rgba(124,107,209,.14)' },
];

export default function DashboardPage() {
  const [me, setMe] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { requireRole } = await import('@/lib/auth/role-guard');
      const guard = await requireRole('student');
      if (!guard) return;
      const { data } = await createClient().from('users').select('*').eq('id', guard.authUser.id).single();
      setMe(data || { id: guard.authUser.id, email: guard.authUser.email });
    })();
  }, []);

  const firstName = me?.full_name?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Banked Plus days (earned via referrals). Plus perks aren't live yet, so we
  // tell the user their days are saved and will unlock when Plus launches.
  const plusUntil = me?.plus_until ? new Date(me.plus_until) : null;
  const plusDaysLeft = plusUntil ? Math.max(0, Math.ceil((plusUntil.getTime() - Date.now()) / 86400000)) : 0;

  return (
    <StudentLayout title="Dashboard">
      <div className="page-enter" style={{ maxWidth: 1100, margin: '0 auto' }}>

        <div style={{ marginBottom: 22 }}>
          <h2 className="ft-num" style={{ fontSize: 26, color: '#12241C', letterSpacing: -0.8, margin: 0 }}>
            {greeting}, {firstName} 👋
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 7, flexWrap: 'wrap' }}>
            {me?.university && <span style={{ fontSize: 14, color: '#4c6157' }}>{me.university}</span>}
            <BetaBadge compact />
          </div>
        </div>

        {me && plusDaysLeft > 0 && (
          <div style={{ marginBottom: 22, background: '#fff', border: '1px solid rgba(226,138,30,0.32)', borderRadius: 18, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(226,138,30,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 22 }}>🎁</div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#12241C', marginBottom: 3 }}>
                You’ve banked {plusDaysLeft} {plusDaysLeft === 1 ? 'day' : 'days'} of Plus 🔒
              </div>
              <div style={{ fontSize: 13, color: '#4c6157', lineHeight: 1.55 }}>
                Plus perks aren’t unlocked yet — everything on Handout is free during the beta. Your days are <strong style={{ color: '#12241C' }}>saved</strong>, and the moment we launch Plus they’ll activate automatically. Refer more friends to stack extra days.
              </div>
            </div>
            <Link href="/student/referral" className="ft-btn ft-btn-o" style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>Refer &amp; earn</Link>
          </div>
        )}

        {me && me.verification_status !== 'approved' && !me.is_verified && (
          <div style={{ marginBottom: 22, background: 'linear-gradient(120deg,#12A150,#0d7a3d)', borderRadius: 18, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', color: '#fff' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div className="ft-num" style={{ fontSize: 16, marginBottom: 3 }}>Become Verified <span style={{ fontWeight: 500, opacity: 0.85 }}>· optional</span></div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,.85)' }}>Verification increases trust and unlocks future features. It only takes a minute.</div>
            </div>
            <Link href="/student/verify" className="ft-btn" style={{ background: '#fff', color: '#12A150', padding: '10px 18px', fontSize: 13 }}>Get verified →</Link>
          </div>
        )}

        <DashStats meId={me?.id} />

        <h3 className="ft-num" style={{ fontSize: 15, color: '#12241C', margin: '26px 0 14px' }}>Explore</h3>
        <div className="stagger-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(285px,1fr))', gap: 14 }}>
          {EXPLORE.map(a => (
            <Link key={a.href} href={a.href} style={{ textDecoration: 'none' }}>
              <div className="ft-card" style={{ borderRadius: 16, padding: '16px 18px' }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: a.bg, color: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}><a.Icon /></div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#12241C', marginBottom: 2 }}>{a.label}</div>
                <div style={{ fontSize: 12, color: '#7d9188' }}>{a.desc}</div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </StudentLayout>
  );
}

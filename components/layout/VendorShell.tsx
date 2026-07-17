'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { requireRole } from '@/lib/auth/role-guard';
import { NotificationBell } from '@/components/ui/NotificationBell';
import { FeedbackButton } from '@/components/beta/FeedbackButton';
import { BETA_MODE } from '@/config/features';

/* ── Vendor nav SVG icons (18×18, stroke-2) ── */
const HomeIcon     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>;
const BoxIcon      = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
const EarnIcon     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const ChatIcon     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const UserIcon     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const ChartIcon    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const CalIcon      = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const TagIcon      = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;

const StarIcon     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const PlaneIcon    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19.5 2.5c-1.5-1.5-3.5-1.5-5 0L11 6 2.8 4.2l-2.3 2.3 5.6 4.7-.6.6-2.8-.1-1.4 1.4 2.8 2.8 2.8 2.8 1.4-1.4-.1-2.8.6-.6 4.7 5.6 2.3-2.3z"/></svg>;

// `soon` items are payment/future-service tools — hidden from the vendor nav
// during the free Beta (pages & APIs preserved).
const NAV = [
  { href: '/vendor/dashboard',  Icon: HomeIcon,  label: 'Dashboard' },
  { href: '/vendor/orders',     Icon: BoxIcon,   label: 'Orders',   soon: true },
  { href: '/vendor/welcome',    Icon: PlaneIcon, label: 'Welcome',  soon: true },
  { href: '/vendor/reviews',    Icon: StarIcon,  label: 'Reviews' },
  { href: '/vendor/schedule',   Icon: CalIcon,   label: 'Schedule' },
  { href: '/vendor/coupons',    Icon: TagIcon,   label: 'Coupons',  soon: true },
  { href: '/vendor/messages',   Icon: ChatIcon,  label: 'Messages' },
  { href: '/vendor/profile',    Icon: UserIcon,  label: 'My Profile' },
].filter(n => !(BETA_MODE && (n as any).soon));

export function VendorShell({ active, title, noPad, children }: { active: string; title: string; noPad?: boolean; children: (me: any) => React.ReactNode }) {
  const [me, setMe] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const g = await requireRole('vendor');
      if (!g) return;
      setMe(g.profile);
      setLoading(false);
    })();
  }, []);

  async function signOut() {
    await createClient().auth.signOut();
    window.location.href = '/';
  }

  const initials = (me?.full_name || me?.email || '?').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div style={{ [noPad ? 'height' : 'minHeight']: '100vh', background: '#F1F7F3', display: 'flex', overflow: noPad ? 'hidden' : undefined }}>
      <aside style={{ width: 248, flexShrink: 0, background: '#0A1426', borderRight: '1px solid rgba(18,36,28,0.09)', display: 'flex', flexDirection: 'column', padding: '24px 16px', position: 'sticky', top: 0, height: '100vh' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', padding: '0 8px', marginBottom: 28 }}>
          <div style={{ width: 36, height: 36, background: '#12A150', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, color: '#ffffff' }}>H</div>
          <div><div style={{ fontWeight: 700, fontSize: 18, color: '#12241C', lineHeight: 1 }}>Handout</div><div style={{ fontSize: 10, color: '#12A150', fontWeight: 700, letterSpacing: 1 }}>VENDOR</div></div>
        </Link>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
          {NAV.map((item) => {
            const on = item.label === active;
            return (
              <Link key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 10, textDecoration: 'none', background: on ? 'rgba(18,161,80,0.12)' : 'transparent', color: on ? '#12A150' : '#4c6157', fontSize: 14, fontWeight: on ? 700 : 500 }}>
                <span style={{ display: 'inline-flex', opacity: on ? 1 : 0.55 }}><item.Icon /></span>{item.label}
              </Link>
            );
          })}
        </nav>
        <Link href="/vendor/profile" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 8px', borderTop: '1px solid rgba(18,36,28,0.09)', marginTop: 12, textDecoration: 'none', cursor: 'pointer' }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#12A150', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{initials}</div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#12241C', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{me?.full_name || 'My account'}</div>
            <div style={{ fontSize: 11, color: '#7d9188' }}>View profile & sign out →</div>
          </div>
        </Link>
      </aside>

      <main style={noPad
        ? { flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minWidth: 0 }
        : { flex: 1, padding: '32px 40px', overflowY: 'auto', minWidth: 0 }}>
        {loading ? <div style={{ color: '#4c6157', padding: 32 }}>Loading…</div> : (
          <>
            <div style={noPad
              ? { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', borderBottom: '1px solid rgba(18,36,28,0.09)', flexShrink: 0 }
              : { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: noPad ? 20 : 30, fontWeight: 800, letterSpacing: noPad ? -0.5 : -1.5, color: '#12241C' }}>{title}</h1>
              <NotificationBell />
            </div>
            {children(me)}
          </>
        )}
      </main>
      <FeedbackButton />
    </div>
  );
}

'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useCart } from '@/lib/cart-store';
import { BETA_MODE } from '@/config/features';
import { BetaBadge } from '@/components/beta/BetaBadge';

export function Topbar({ title }: { title: string }) {
  const [initials, setInitials] = useState('');
  const [searchQ, setSearchQ] = useState('');
  const { count: cartCount } = useCart();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return;
      const { data: u } = await sb.from('users').select('full_name,email').eq('id', user.id).single();
      const display = u?.full_name || u?.email || user.email || '';
      setInitials(display.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '?');
    })();
  }, []);

  return (
    <header className="topbar">
      <h1 className="topbar-title">{title}</h1>
      <div className="topbar-search hidden sm:flex">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--muted)', flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="search"
          placeholder="Search anything…"
          aria-label="Search"
          value={searchQ}
          onChange={e => setSearchQ(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && searchQ.trim()) {
              router.push(`/student/search?q=${encodeURIComponent(searchQ.trim())}`);
            }
          }}
        />
      </div>
      {/* Cart is a payment feature — hidden during the free Beta (preserved for future) */}
      {!BETA_MODE && (
        <Link href="/student/cart" className="topbar-icon-btn" aria-label="Cart" style={{ textDecoration: 'none', position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          {cartCount > 0 && (
            <span style={{ position: 'absolute', top: -4, right: -4, minWidth: 16, height: 16, borderRadius: 999, background: 'var(--amber)', color: '#ffffff', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', lineHeight: 1 }}>
              {cartCount > 9 ? '9+' : cartCount}
            </span>
          )}
        </Link>
      )}
      <Link href="/student/notifications" className="topbar-icon-btn" aria-label="Notifications" style={{ textDecoration: 'none', position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <span className="topbar-notif-dot" />
      </Link>
      {/* Premium upgrade is hidden during the free Beta (kept for future release) */}
      {!BETA_MODE && <Link href="/student/membership" className="btn btn-primary btn-sm">⭐ Upgrade</Link>}
      {/* Beta badge replaces the upgrade CTA */}
      {BETA_MODE && <span className="hidden sm:inline-flex"><BetaBadge compact /></span>}
      <Link href="/student/profile" className="avatar avatar-sm" style={{ background: '#12A150', color: '#ffffff', cursor: 'pointer', textDecoration: 'none' }}>
        {initials || '?'}
      </Link>
    </header>
  );
}

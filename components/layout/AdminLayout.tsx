'use client';
import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { requireRole } from '@/lib/auth/role-guard';
import { createClient } from '@/lib/supabase/client';
import { A } from '@/components/admin/AdminUI';
import { FeedbackButton } from '@/components/beta/FeedbackButton';
import { BETA_MODE } from '@/config/features';

// `soon: true` marks tools for features that aren't part of the free Beta
// (bookings/coupons/welcome-requests = payments & future services). The pages
// and APIs are preserved — they're just hidden from the admin sidebar in Beta.
const nav = [
  { href: '/admin',               icon: '◈', label: 'Dashboard'     },
  { href: '/admin/users',         icon: '◉', label: 'Users'         },
  { href: '/admin/verifications', icon: '◻', label: 'Verifications' },
  { href: '/admin/providers',     icon: '◆', label: 'Providers'     },
  { href: '/admin/bookings',      icon: '◷', label: 'Bookings',      soon: true },
  { href: '/admin/welcome-requests', icon: '✈', label: 'Welcome Requests', soon: true },
  { href: '/admin/reports',       icon: '◑', label: 'Reports'       },
  { href: '/admin/moderation',    icon: '◈', label: 'Moderation'    },
  { href: '/admin/coupons',       icon: '◇', label: 'Coupons',      soon: true },
  { href: '/admin/analytics',     icon: '◴', label: 'Analytics'     },
  { href: '/admin/settings',      icon: '◎', label: 'Settings'      },
].filter(n => !(BETA_MODE && (n as any).soon));

export function AdminLayout({ children, title }: { children: ReactNode; title: string }) {
  const path = usePathname();
  const [authed, setAuthed] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const isActive = (href: string) => path === href || (href !== '/admin' && path.startsWith(href));

  useEffect(() => {
    (async () => {
      const ok = await requireRole('admin');
      if (ok) {
        setAuthed(true);
        const { data: { user } } = await createClient().auth.getUser();
        setAdminEmail(user?.email ?? '');
      }
    })();
  }, []);

  async function signOut() {
    await createClient().auth.signOut();
    window.location.href = '/';
  }

  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: A.bg, flexDirection: 'column', gap: 14 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: `${A.red}20`, border: `1px solid ${A.red}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🛡️</div>
        <div style={{ fontSize: 14, color: A.muted }}>Verifying admin access…</div>
      </div>
    );
  }

  const initials = adminEmail ? adminEmail.slice(0, 2).toUpperCase() : 'AD';

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: A.bg }}>

      {/* ── SIDEBAR ── */}
      <aside style={{ width: 224, background: A.surface, borderRight: `1px solid ${A.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>

        {/* Brand */}
        <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${A.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: A.red, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: '#fff', flexShrink: 0 }}>A</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: A.text, letterSpacing: -0.3 }}>Handout</div>
              <div style={{ fontSize: 10, color: A.muted, marginTop: 1, letterSpacing: 0.5 }}>Admin Console</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 10px' }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.18)', padding: '8px 10px 4px' }}>Administration</div>
          {nav.map(item => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 9,
                  fontSize: 13, fontWeight: active ? 600 : 400, color: active ? A.text : A.muted,
                  background: active ? `${A.red}18` : 'transparent',
                  textDecoration: 'none', marginBottom: 2,
                  borderLeft: active ? `2px solid ${A.red}` : '2px solid transparent',
                  paddingLeft: active ? 8 : 10,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!active) { const el = e.currentTarget as HTMLElement; el.style.color = A.light; el.style.background = 'rgba(18,36,28,0.04)'; }}}
                onMouseLeave={e => { if (!active) { const el = e.currentTarget as HTMLElement; el.style.color = A.muted; el.style.background = 'transparent'; }}}
              >
                <span style={{ fontSize: 14, width: 16, textAlign: 'center', color: active ? A.red : A.muted, flexShrink: 0 }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.18)', padding: '16px 10px 4px' }}>Switch view</div>
          <Link href="/student/dashboard"
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 9, fontSize: 13, color: A.muted, textDecoration: 'none', transition: 'all 0.15s' }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = A.light; el.style.background = 'rgba(18,36,28,0.04)'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = A.muted; el.style.background = 'transparent'; }}
          >
            <span style={{ fontSize: 14, width: 16, textAlign: 'center', flexShrink: 0 }}>←</span>
            Back to App
          </Link>
        </nav>

        {/* Footer */}
        <div style={{ padding: '14px 16px', borderTop: `1px solid ${A.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${A.red}22`, border: `1px solid ${A.red}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, color: A.red, flexShrink: 0 }}>{initials}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: A.text }}>Admin</div>
              <div style={{ fontSize: 10, color: A.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{adminEmail || 'Full access'}</div>
            </div>
          </div>
          <button onClick={signOut}
            style={{ width: '100%', height: 34, background: 'rgba(18,36,28,0.04)', border: `1px solid ${A.border}`, borderRadius: 8, color: A.light, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Bricolage Grotesque', sans-serif", transition: 'background 0.15s' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(18,36,28,0.09)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(18,36,28,0.04)'}
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{ height: 52, background: A.surface, borderBottom: `1px solid ${A.border}`, display: 'flex', alignItems: 'center', padding: '0 28px', gap: 14, flexShrink: 0 }}>
          <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 15, fontWeight: 700, color: A.text, letterSpacing: -0.3, flex: 1 }}>{title}</h1>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 6, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: A.red, background: `${A.red}14`, border: `1px solid ${A.red}30` }}>
            ● Admin
          </span>
        </header>
        {/* Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px 28px 80px', background: A.bg }}>
          {children}
        </main>
      </div>
      <FeedbackButton />
    </div>
  );
}

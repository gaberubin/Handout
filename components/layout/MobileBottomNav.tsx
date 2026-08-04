'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { COMING_SOON_NAV } from '@/config/features';

/* ── SVG icon components ─────────────────────────────────────────────────── */
const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const PeopleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const CommunityIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);
const ChatIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const MoreIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>
  </svg>
);
const StarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

// Everything that doesn't fit in the 4 primary tabs. Mobile previously exposed
// only 5 of ~14 features — Campus Connect, Marketplace, Events, Find Your
// People and Refer & Earn were unreachable on a phone. The "More" sheet gives
// mobile the same coverage as the desktop sidebar.
const MORE_LINKS = [
  { href: '/student/dating',           emoji: '💚', label: 'Campus Connect' },
  { href: '/student/community?tab=market', emoji: '📚', label: 'Marketplace' },
  { href: '/student/events',           emoji: '🎉', label: 'Events' },
  { href: '/student/find-people',      emoji: '⭐', label: 'Find Your People' },
  { href: '/student/rewards',          emoji: '🏆', label: 'Rewards' },
  { href: '/student/referral',         emoji: '🎁', label: 'Refer & Earn' },
  { href: '/student/saved',            emoji: '🔖', label: 'Saved' },
  { href: '/student/verify',           emoji: '🛡️', label: 'Get Verified' },
  { href: '/student/profile',          emoji: '👤', label: 'Profile' },
  { href: '/student/settings',         emoji: '⚙️', label: 'Settings' },
  { href: '/help',                     emoji: '❓', label: 'Help' },
];

export function MobileBottomNav() {
  const p = usePathname();
  const [open, setOpen] = useState(false);

  // Close the sheet whenever the route changes, and lock body scroll while open.
  useEffect(() => { setOpen(false); }, [p]);
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const items = [
    { href: '/student/dashboard',  icon: <HomeIcon />,      label: 'Home' },
    { href: '/student/roommates',  icon: <PeopleIcon />,    label: 'Rooms' },
    { href: '/student/community',  icon: <CommunityIcon />, label: 'Community' },
    { href: '/student/messages',   icon: <ChatIcon />,      label: 'Chat' },
  ];

  return (
    <>
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position:'fixed', inset:0, background:'rgba(18,36,28,0.5)', backdropFilter:'blur(4px)', zIndex:998 }}
        />
      )}

      {open && (
        <div style={{
          position:'fixed', left:0, right:0, bottom:0, zIndex:999,
          background:'#fff', borderTopLeftRadius:22, borderTopRightRadius:22,
          padding:'10px 16px calc(84px + env(safe-area-inset-bottom))',
          maxHeight:'72vh', overflowY:'auto', boxShadow:'0 -8px 30px rgba(18,36,28,0.18)',
        }}>
          <div style={{ width:40, height:4, borderRadius:100, background:'rgba(18,36,28,0.15)', margin:'6px auto 14px' }} />
          <p style={{ margin:'0 0 12px', fontSize:12, fontWeight:800, letterSpacing:1, textTransform:'uppercase', color:'#7D9188' }}>All features</p>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
            {MORE_LINKS.map(l => {
              const active = p.startsWith(l.href.split('?')[0]);
              return (
                <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                  style={{
                    display:'flex', flexDirection:'column', alignItems:'center', gap:6,
                    padding:'14px 6px', borderRadius:14, textDecoration:'none',
                    background: active ? 'rgba(18,161,80,0.08)' : '#F1F7F3',
                    border:`1px solid ${active ? 'rgba(18,161,80,0.3)' : 'rgba(18,36,28,0.07)'}`,
                    color:'#12241C',
                  }}>
                  <span style={{ fontSize:21, lineHeight:1 }}>{l.emoji}</span>
                  <span style={{ fontSize:11.5, fontWeight:700, textAlign:'center', lineHeight:1.25 }}>{l.label}</span>
                </Link>
              );
            })}
          </div>

          {COMING_SOON_NAV.length > 0 && (
            <>
              <p style={{ margin:'18px 0 10px', fontSize:12, fontWeight:800, letterSpacing:1, textTransform:'uppercase', color:'#7D9188' }}>What&apos;s Next</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {COMING_SOON_NAV.map(f => (
                  <Link key={f.feature} href={`/coming-soon?feature=${f.feature}`} onClick={() => setOpen(false)}
                    style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 13px', borderRadius:100, background:'#F1F7F3', border:'1px solid rgba(18,36,28,0.07)', fontSize:12.5, fontWeight:600, color:'#7D9188', textDecoration:'none' }}>
                    {f.label}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {items.map(item => (
          <Link key={item.href} href={item.href}
            className={`mobile-nav-item ${p.startsWith(item.href) ? 'active' : ''}`}>
            <span className="mobile-nav-item-icon">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          aria-label="More features"
          aria-expanded={open}
          className={`mobile-nav-item ${open ? 'active' : ''}`}
          style={{ background:'none', border:'none', cursor:'pointer', font:'inherit' }}>
          <span className="mobile-nav-item-icon"><MoreIcon /></span>
          <span>More</span>
        </button>
      </nav>
    </>
  );
}

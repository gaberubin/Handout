'use client';

import Link from 'next/link';

const EC_People  = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const EC_Food    = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>;
const EC_Ride    = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
const EC_Book    = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const EC_Box     = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
const EC_More    = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const EC_Brain   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.44-4.14z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.44-4.14z"/></svg>;
const EC_Shield  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const EC_Grid    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>;
const EC_Cap     = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>;
const EC_Bulb    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>;

const CATS = [
  { Icon: EC_People, title: 'Roommates',    desc: 'Find your perfect roommate match',  href: '/browse?c=roommates', color: 'rgba(18,161,80,0.12)',   border: 'rgba(18,161,80,0.20)' },
  { Icon: EC_Food,   title: 'Tiffin / Food', desc: 'Home-cooked meals near campus',    href: '/browse?c=food',      color: 'rgba(18,161,80,0.12)',  border: 'rgba(18,161,80,0.22)' },
  { Icon: EC_Ride,   title: 'Airport Rides', desc: 'Pickup and drop from all airports',href: '/browse?c=services',  color: 'rgba(18,161,80,0.12)',   border: 'rgba(18,161,80,0.20)' },
  { Icon: EC_Book,   title: 'Tutoring',      desc: 'Expert help for your classes',     href: '/browse?c=services',  color: 'rgba(124,107,209,0.12)', border: 'rgba(124,107,209,0.22)' },
  { Icon: EC_Box,    title: 'Moving Help',   desc: 'Affordable crews, same-day avail.',href: '/browse?c=services',  color: 'rgba(18,161,80,0.12)',  border: 'rgba(18,161,80,0.22)' },
  { Icon: EC_More,   title: 'Other Help',    desc: 'Anything else you need',           href: '/browse',             color: 'rgba(18,161,80,0.08)',   border: 'rgba(255,255,255,0.10)' },
];

const FEATS = [
  { Icon: EC_Brain,  t: 'Smart Matching',    d: 'Compatibility scoring that actually works' },
  { Icon: EC_Shield, t: 'Verified & Safe',   d: 'ID-checked students and service providers' },
  { Icon: EC_Grid,   t: 'All in One Place',  d: 'Roommates, tiffin, rides, tutoring & more' },
  { Icon: EC_Cap,    t: 'Rowan Community',   d: 'Built by students, for students' },
];

export function ExploreCategories() {
  return (
    <section style={{ padding: '40px 48px 100px', maxWidth: 1280, margin: '0 auto' }}>

      <div className="section-label">
        <div className="section-label-line" />
        <span className="section-label-text">Categories</span>
        <span className="section-label-num">02</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 32 }}>
        <h2 data-sr style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 'clamp(32px,4.5vw,54px)', fontWeight: 800, letterSpacing: -2, lineHeight: 1.04 }}>
          Explore <em style={{ fontStyle: 'normal', fontWeight: 300, color: 'var(--amber)' }}>by category</em>
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: 14, maxWidth: 280, lineHeight: 1.6 }}>
          Choose a category to find exactly what you need — no account required to browse.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 14 }}>
        {CATS.map((c, i) => (
          <Link key={c.title} href={c.href} className={`cat-card sr d${i + 1}`} data-sr>
            <div className="cat-icon-wrap" style={{ background: c.color, borderColor: c.border, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <c.Icon />
            </div>
            <div style={{ fontWeight: 800, color: 'var(--white)', fontSize: 15, letterSpacing: -0.3 }}>{c.title}</div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 5, lineHeight: 1.55 }}>{c.desc}</div>
          </Link>
        ))}
      </div>

      {/* CTA banner */}
      <div style={{ marginTop: 18, background: 'rgba(18,161,80,0.06)', border: '1px solid rgba(18,161,80,0.18)', borderRadius: 18, padding: '20px 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(18,161,80,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--amber)' }}><EC_Bulb /></div>
          <div>
            <div style={{ fontWeight: 800, color: 'var(--white)', fontSize: 14, letterSpacing: -0.2 }}>Can&apos;t find what you&apos;re looking for?</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>Browse everything and message the community directly.</div>
          </div>
        </div>
        <Link href="/browse" className="btn btn-primary btn-md" style={{ borderRadius: 100, flexShrink: 0 }}>Post a request →</Link>
      </div>

      {/* Trust features */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 1, marginTop: 38, background: 'var(--border)', borderRadius: 18, overflow: 'hidden', border: '1px solid var(--border)' }}>
        {FEATS.map((f) => (
          <div key={f.t} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '20px 22px', background: 'var(--navy)', transition: 'background 0.2s' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--navy2)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--navy)'}
          >
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(18,36,28,0.05)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--amber)' }}><f.Icon /></div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--white)', fontSize: 13, letterSpacing: -0.2 }}>{f.t}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3, lineHeight: 1.55 }}>{f.d}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

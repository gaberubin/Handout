'use client';
import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const DashPLIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>;
const BookPLIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const EarnPLIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const UserPLIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const StarPLIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const GearPLIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const BackPLIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;

const nav = [
  { href: '/provider',          Icon: DashPLIcon, label: 'Dashboard' },
  { href: '/provider/bookings', Icon: BookPLIcon, label: 'Bookings' },
  { href: '/provider/earnings', Icon: EarnPLIcon, label: 'Earnings' },
  { href: '/provider/profile',  Icon: UserPLIcon, label: 'Profile' },
  { href: '/provider/reviews',  Icon: StarPLIcon, label: 'Reviews' },
  { href: '/provider/settings', Icon: GearPLIcon, label: 'Settings' },
];

export function ProviderLayout({ children, title }: { children: ReactNode; title: string }) {
  const p = usePathname();
  const active = (href: string) => p === href || (href !== '/provider' && p.startsWith(href));
  return (
    <div className="app-layout">
      <aside className="sidebar hidden md:flex flex-col" style={{ background: '#060F1E' }}>
        <div className="sidebar-brand">
          <div className="sidebar-logo" style={{ background: '#12A150', color: 'white' }}>H</div>
          <div>
            <div className="sidebar-name">Handout</div>
            <div className="sidebar-sub">Provider Portal</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          <div className="sidebar-section-label">Provider Menu</div>
          {nav.map(item => (
            <Link key={item.href} href={item.href} className={`sidebar-link ${active(item.href) ? 'active' : ''}`} style={active(item.href) ? { borderLeftColor: '#12A150', background: 'rgba(37,99,235,0.10)' } : {}}>
              <span className="sidebar-link-icon" style={{ display: 'inline-flex' }}><item.Icon /></span>
              <span>{item.label}</span>
            </Link>
          ))}
          <div className="sidebar-section-label" style={{ marginTop: 16 }}>Switch</div>
          <Link href="/student/dashboard" className="sidebar-link">
            <span className="sidebar-link-icon" style={{ display: 'inline-flex' }}><BackPLIcon /></span>
            <span>Student View</span>
          </Link>
        </nav>
        <div className="sidebar-footer">
          <div className="avatar avatar-sm" style={{ background: '#0891B2', color: 'white' }}>RJ</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--white)' }}>Raj Johar</div>
            <div style={{ fontSize: 10, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ display: 'inline-flex', color: '#E08A1E' }}><StarPLIcon /></span> Provider · 4.9
            </div>
          </div>
        </div>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <h1 className="topbar-title">{title}</h1>
          <Link href="/student/dashboard" className="btn btn-outline btn-sm hidden sm:flex" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><BackPLIcon /> Student View</Link>
          <div className="avatar avatar-sm" style={{ background: '#0891B2', color: 'white' }}>RJ</div>
        </header>
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { StudentLayout } from '@/components/layout/StudentLayout';

const SearchIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const ChevronIcon = ({ open }: { open: boolean }) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}><polyline points="6 9 12 15 18 9"/></svg>;
const CartIcon    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>;
const UserIcon    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const TagIcon     = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
const HomeIcon    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const StarIcon    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const MsgIcon     = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;

const CATEGORIES = [
  { icon: <CartIcon />, label: 'Orders & Food', color: '#12A150' },
  { icon: <UserIcon />, label: 'Account & Profile', color: '#7C6BD1' },
  { icon: <TagIcon />,  label: 'Coupons & Wallet', color: '#12A150' },
  { icon: <HomeIcon />, label: 'Roommates', color: '#E08A1E' },
  { icon: <StarIcon />, label: 'Membership & Pro', color: '#FF9F6B' },
  { icon: <MsgIcon />,  label: 'Messages', color: '#FF6B9D' },
];

const FAQS = [
  {
    cat: 'Orders & Food',
    q: 'How do I track my food order?',
    a: 'Go to Orders in the sidebar. Each order card shows its current status — Placed, Preparing, On the Way, or Delivered. Tap an order to see the full timeline.',
  },
  {
    cat: 'Orders & Food',
    q: 'Can I cancel an order after placing it?',
    a: 'You can cancel within 60 seconds of placing the order using the undo button. After that, contact the vendor directly via the Messages page.',
  },
  {
    cat: 'Orders & Food',
    q: 'How do I add items to my cart?',
    a: 'Browse the Food page, select a vendor, and tap "Add to Cart" on any menu item. Your cart persists across the session.',
  },
  {
    cat: 'Coupons & Wallet',
    q: 'How do I apply a coupon code?',
    a: 'At checkout (Cart page), enter your promo code in the "Promo code" field in the Order Summary section and tap Apply.',
  },
  {
    cat: 'Coupons & Wallet',
    q: 'How do I earn wallet credits?',
    a: 'Refer friends using your referral link — you earn $15 for each friend who signs up. Credits are also given through platform promotions and welcome bonuses.',
  },
  {
    cat: 'Coupons & Wallet',
    q: 'Where can I see my available coupons?',
    a: 'Visit the Coupons page from your dashboard. You\'ll see all available codes with their discount values and copy buttons.',
  },
  {
    cat: 'Account & Profile',
    q: 'How do I change my profile photo?',
    a: 'Go to Profile in the sidebar and tap the camera icon on your avatar. You can upload any image from your device.',
  },
  {
    cat: 'Account & Profile',
    q: 'How do I verify my phone number?',
    a: 'Go to Profile and tap "Verify Phone." Enter your number and you\'ll receive a 6-digit OTP via SMS to confirm.',
  },
  {
    cat: 'Roommates',
    q: 'How do I post a roommate listing?',
    a: 'Go to Roommates and tap "Post Listing." Fill in your university, rent, room type, and move-in date. Your listing is visible to students at the same university.',
  },
  {
    cat: 'Membership & Pro',
    q: 'What does the Pro membership include?',
    a: 'Pro members get 15% off all tiffin orders, 10% off services, exclusive promo codes, early access to new features, and priority support.',
  },
  {
    cat: 'Membership & Pro',
    q: 'How do I upgrade to Pro?',
    a: 'Go to Membership from the sidebar and select a plan. Monthly and semester plans are available.',
  },
  {
    cat: 'Messages',
    q: 'Can I message a vendor before booking?',
    a: 'Yes. On any vendor\'s detail page, tap the "Message" button to start a conversation before making a booking.',
  },
];

const card: React.CSSProperties = { background: '#FFFFFF', border: '1px solid rgba(18,36,28,0.09)', borderRadius: 16 };

export default function HelpPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const filtered = FAQS.filter(f => {
    const matchCat = !activeCategory || f.cat === activeCategory;
    const matchSearch = !search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <StudentLayout title="Help Center">
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 0 60px' }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#12241C', margin: '0 0 4px', fontFamily: "'Bricolage Grotesque',sans-serif" }}>Help Center</h1>
          <p style={{ fontSize: 14, color: '#7d9188', margin: '0 0 24px' }}>Find answers or reach out — we're here to help.</p>

          {/* Search */}
          <div style={{ position: 'relative', marginBottom: 24 }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#7d9188', display: 'flex' }}><SearchIcon /></span>
            <input value={search} onChange={e => { setSearch(e.target.value); setActiveCategory(null); }}
              placeholder="Search help articles…"
              style={{ width: '100%', height: 48, paddingLeft: 44, paddingRight: 16, background: 'rgba(18,36,28,0.05)', border: '1px solid rgba(18,36,28,0.12)', borderRadius: 12, color: '#12241C', fontSize: 15, boxSizing: 'border-box', outline: 'none' }} />
          </div>

          {/* Categories */}
          {!search && (
            <div className="rg-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 28 }}>
              {CATEGORIES.map(c => (
                <button key={c.label} onClick={() => setActiveCategory(activeCategory === c.label ? null : c.label)}
                  style={{ ...card, padding: '16px 12px', textAlign: 'center', border: activeCategory === c.label ? `1px solid ${c.color}60` : '1px solid rgba(18,36,28,0.09)', background: activeCategory === c.label ? `${c.color}12` : '#FFFFFF', cursor: 'pointer' }}>
                  <div style={{ display: 'inline-flex', color: c.color, marginBottom: 6 }}>{c.icon}</div>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#12241C' }}>{c.label}</p>
                </button>
              ))}
            </div>
          )}

          {/* FAQ list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
            {filtered.length === 0 && (
              <p style={{ color: '#7d9188', fontSize: 14, textAlign: 'center', padding: 40 }}>No results for "{search}"</p>
            )}
            {filtered.map((f, i) => (
              <div key={i} style={{ ...card, overflow: 'hidden' }}>
                <button onClick={() => setOpenIdx(openIdx === i ? null : i)}
                  style={{ width: '100%', padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', gap: 12, textAlign: 'left' }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#12241C', flex: 1 }}>{f.q}</span>
                  <span style={{ color: '#7d9188', flexShrink: 0 }}><ChevronIcon open={openIdx === i} /></span>
                </button>
                {openIdx === i && (
                  <div style={{ padding: '0 18px 16px', fontSize: 14, color: '#4c6157', lineHeight: 1.65, borderTop: '1px solid rgba(18,36,28,0.06)' }}>
                    <div style={{ paddingTop: 14 }}>{f.a}</div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact card */}
          <div style={{ ...card, padding: '20px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: '#12241C' }}>Still need help?</p>
              <p style={{ margin: 0, fontSize: 13, color: '#7d9188' }}>Send us a message and we'll respond within 24 hours.</p>
            </div>
            <Link href="/student/report" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: '#12A150', borderRadius: 100, color: '#ffffff', fontSize: 13, fontWeight: 700, textDecoration: 'none', flexShrink: 0 }}>
              <MsgIcon /> Contact Us
            </Link>
          </div>
        </div>
      
    </StudentLayout>
  );
}

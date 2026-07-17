'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { DEFAULT_WELCOME_PACKAGES } from '@/lib/welcome-packages';

const WC_PlaneIcon   = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19.5 2.5c-1.5-1.5-3.5-1.5-5 0L11 6 2.8 4.2l-2.3 2.3 5.6 4.7-.6.6-2.8-.1-1.4 1.4 2.8 2.8 2.8 2.8 1.4-1.4-.1-2.8.6-.6 4.7 5.6 2.3-2.3z"/></svg>;
const WC_PeopleIcon  = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const WC_ArrivalIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19.5 2.5c-1.5-1.5-3.5-1.5-5 0L11 6 2.8 4.2l-2.3 2.3 5.6 4.7-.6.6-2.8-.1-1.4 1.4 2.8 2.8 2.8 2.8 1.4-1.4-.1-2.8.6-.6 4.7 5.6 2.3-2.3z"/></svg>;
const WC_HomeIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const WC_FoodIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>;
const WC_CarIcon     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
const WC_CartIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>;
const WC_CapIcon     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>;
const WC_ChatIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;

const COMMUNITIES = ['Any', 'South Indian', 'North Indian', 'Gujarati', 'Punjabi', 'Pakistani', 'Bangladeshi', 'Chinese', 'Korean', 'Vietnamese', 'Filipino', 'Latino', 'African', 'European', 'Middle Eastern'];

export default function WelcomePackagesPage() {
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState<any[]>([]);
  const [community, setCommunity] = useState('Any');
  const [tier, setTier] = useState<'all'|'basic'|'standard'|'premium'|'custom'>('all');

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/auth/login'; return; }
      const { data } = await supabase
        .from('welcome_packages')
        .select('*, users:public_profiles(full_name)')
        .eq('is_active', true)
        .order('price', { ascending: true });
      setPackages(data || []);
      setLoading(false);
    })();
  }, []);

  // Curated catalog first, then any host-created packages from the DB.
  const allPackages = [...DEFAULT_WELCOME_PACKAGES, ...packages];
  const visible = allPackages.filter(p => {
    if (community !== 'Any' && (p.community || 'Any') !== community) return false;
    if (tier !== 'all' && p.tier !== tier) return false;
    return true;
  });

  return (
    <StudentLayout title="Welcome Packages">
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Hero — Fresh Trust dark-green panel (matches Screens mockup) */}
        <div style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #0E2A19, #12341f)', border: '1px solid rgba(95,208,140,0.18)', borderRadius: 20, padding: '28px 32px', marginBottom: 24 }}>
          <div style={{ position: 'absolute', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(95,208,140,0.16), transparent 70%)', top: -140, right: -60, pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#5fd08c', marginBottom: 6 }}>FOR NEW INTERNATIONAL STUDENTS</div>
            <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1, color: '#ffffff', marginBottom: 8, display:'flex', alignItems:'center', gap:10 }}>Welcome Packages <span style={{ display:'inline-flex', color:'#5fd08c' }}><WC_PlaneIcon /></span></h2>
            <p style={{ fontSize: 14, color: '#a9c4b3', lineHeight: 1.6, maxWidth: 560, margin: 0 }}>
              Land in the USA without the stress. A host from your community picks you up, hosts you with home-cooked meals for a few nights, and helps you settle in.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Community</div>
            <select value={community} onChange={e => setCommunity(e.target.value)}
              style={{ height: 38, padding: '0 14px', background: 'var(--navy2)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--white)', fontSize: 13, outline: 'none' }}>
              {COMMUNITIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Tier</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['all','basic','standard','premium','custom'] as const).map(t => (
                <button key={t} onClick={() => setTier(t)}
                  style={{ padding: '8px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: `1px solid ${tier === t ? 'var(--amber)' : 'var(--border)'}`, background: tier === t ? 'rgba(18,161,80,0.12)' : 'transparent', color: tier === t ? 'var(--amber)' : 'var(--muted)', textTransform: 'capitalize' }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {visible.length === 0 ? (
          <div style={{ background: 'var(--navy2)', border: '1px solid var(--border)', borderRadius: 16, padding: '40px', textAlign: 'center' }}>
            <div style={{ marginBottom: 8, display:'inline-flex', color:'var(--muted)' }}><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19.5 2.5c-1.5-1.5-3.5-1.5-5 0L11 6 2.8 4.2l-2.3 2.3 5.6 4.7-.6.6-2.8-.1-1.4 1.4 2.8 2.8 2.8 2.8 1.4-1.4-.1-2.8.6-.6 4.7 5.6 2.3-2.3z"/></svg></div>
            <p style={{ fontSize: 15, color: 'var(--light)', marginBottom: 6 }}>No packages match these filters yet.</p>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>Try changing the community or tier filter, or check back soon.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
            {visible.map(p => <PackageCard key={p.id} pkg={p} />)}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}

function PackageCard({ pkg }: { pkg: any }) {
  const hostName = pkg.users?.full_name || 'Host';
  const tierColor = pkg.tier === 'premium' ? '#7C6BD1' : pkg.tier === 'standard' ? '#12A150' : pkg.tier === 'basic' ? '#2E7D5B' : '#0E9E8E';

  return (
    <div style={{ background: 'var(--navy2)', border: '1px solid var(--border)', borderRadius: 18, padding: 24, display: 'flex', flexDirection: 'column', transition: 'border-color 0.15s' }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(18,161,80,0.3)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, padding: '4px 10px', borderRadius: 100, background: `${tierColor}22`, color: tierColor, textTransform: 'uppercase' }}>{pkg.tier}</span>
        {pkg.community && <span style={{ fontSize: 11, color: 'var(--muted)', display:'inline-flex', alignItems:'center', gap:3 }}><WC_PeopleIcon /> {pkg.community}</span>}
      </div>
      <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--white)', marginBottom: 4 }}>{pkg.title}</h3>
      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14 }}>by {hostName}</p>
      <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--amber)', marginBottom: 14 }}>${pkg.price}</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
        {pkg.airport_pickup && <Item icon={<WC_ArrivalIcon />} text={`Airport pickup${pkg.airport_served ? ` (${pkg.airport_served})` : ''}`} />}
        {pkg.nights_stay > 0 && <Item icon={<WC_HomeIcon />} text={`${pkg.nights_stay} nights stay`} />}
        {pkg.meals_included > 0 && <Item icon={<WC_FoodIcon />} text={`${pkg.meals_included} home-cooked meals`} />}
        {pkg.dropoff_included && <Item icon={<WC_CarIcon />} text="Drop-off to your apartment" />}
        {pkg.grocery_run && <Item icon={<WC_CartIcon />} text="Grocery run included" />}
        {pkg.campus_tour && <Item icon={<WC_CapIcon />} text="Campus tour" />}
        {pkg.sim_card_help && <Item icon={<WC_ChatIcon />} text="SIM card setup help" />}
        {pkg.bank_account_help && <Item icon={<WC_ChatIcon />} text="Bank account setup" />}
        {pkg.housing_hunt_help && <Item icon={<WC_HomeIcon />} text="Housing search help" />}
      </div>

      {pkg.description && <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 14 }}>{pkg.description}</p>}

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {pkg.curated ? (
          <Link href={`/student/welcome/${pkg.id}`}
            style={{ display: 'block', textAlign: 'center', height: 42, lineHeight: '42px', background: 'var(--amber)', borderRadius: 100, color: '#ffffff', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
            View package
          </Link>
        ) : (
          <Link href={`/student/messages?to=${pkg.host_id}&name=${encodeURIComponent(hostName)}`}
            style={{ display: 'block', textAlign: 'center', height: 42, lineHeight: '42px', background: 'var(--amber)', borderRadius: 100, color: '#ffffff', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
            Contact Host
          </Link>
        )}
        {!pkg.curated && (
          <Link href={`/student/welcome/${pkg.id}`}
            style={{ display: 'block', textAlign: 'center', height: 38, lineHeight: '38px', background: 'rgba(18,36,28,0.04)', border: '1px solid var(--border)', borderRadius: 100, color: 'var(--white)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
            See full details & add-ons →
          </Link>
        )}
      </div>
    </div>
  );
}

function Item({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--light)' }}>
      <span style={{ display: 'inline-flex', color: 'var(--amber)' }}>{icon}</span>{text}
    </div>
  );
}

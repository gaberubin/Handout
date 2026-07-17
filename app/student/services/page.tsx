'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { createClient } from '@/lib/supabase/client';

const CheckIcon = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const StarIcon  = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;

const CATS = ['All', 'Airport Rides', 'Tutoring', 'Babysitting', 'Moving', 'Handyman', 'Cleaning'];

function ini(s: string) { return (s || '?').split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase(); }
const COLORS = ['#12A150','#2E7D5B','#E08A1E','#C25B4E','#7C6BD1','#4c6157','#0E2A19'];
const color = (i: number) => COLORS[i % COLORS.length];

export default function ServicesPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [cat, setCat] = useState('All');

  // Honor ?cat=Tutoring etc. from deep links (e.g. Search quick-links)
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('cat');
    if (q && CATS.includes(q)) setCat(q);
  }, []);

  useEffect(() => {
    (async () => {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { window.location.href = '/auth/login'; return; }
      const { data } = await sb.from('service_listings')
        .select('*, users:public_profiles(full_name, avatar_url)')
        .eq('is_active', true)
        .neq('user_id', user.id)
        .order('created_at', { ascending: false });
      setListings(data || []);
    })();
  }, []);

  const visible = cat === 'All' ? listings : listings.filter(l => l.category?.toLowerCase().includes(cat.toLowerCase()));

  return (
    <StudentLayout title="Services">
      <div className="page-enter" style={{ maxWidth: 1100, margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="ft-num" style={{ fontSize: 26, color: '#12241C', margin: 0 }}>Trusted services</h1>
            <p style={{ fontSize: 14, color: '#4c6157', marginTop: 4 }}>Background-checked providers for everything you need.</p>
          </div>
          <Link href="/vendor/onboarding" className="ft-btn ft-btn-p">＋ Offer a service</Link>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 22 }}>
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)}
              style={{ padding: '8px 15px', borderRadius: 100, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', border: 'none',
                background: cat === c ? '#12A150' : '#fff',
                color: cat === c ? '#fff' : '#4c6157',
                boxShadow: cat === c ? 'none' : '0 0 0 1px rgba(18,36,28,0.12)' }}>
              {c}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#7d9188', fontSize: 14 }}>No listings found.</div>
        ) : (
          <div className="stagger-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(285px,1fr))', gap: 16 }}>
            {visible.map((s, i) => {
              const name = s.users?.full_name || 'Provider';
              const avg = s.avg_rating || 0;
              return (
                <div key={s.id} className="ft-card" style={{ padding: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 13 }}>
                    <div style={{ width: 46, height: 46, borderRadius: 14, background: color(i), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                      {s.users?.avatar_url ? <img src={s.users.avatar_url} style={{ width: '100%', height: '100%', borderRadius: 14, objectFit: 'cover' }} alt="" /> : ini(name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#12241C', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {name}
                        {s.is_verified && <span style={{ color: '#12A150', display: 'inline-flex' }}><CheckIcon /></span>}
                      </div>
                      <div style={{ fontSize: 12, color: '#7d9188' }}>{s.title}</div>
                    </div>
                    {s.is_top_rated && <span style={{ fontSize: 9.5, fontWeight: 800, background: '#FDF0DC', color: '#B5761A', padding: '3px 8px', borderRadius: 100 }}>Top Rated</span>}
                  </div>
                  {avg > 0 && (
                    <div style={{ fontSize: 12, color: '#7d9188', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ color: '#E08A1E', display: 'inline-flex' }}><StarIcon /></span>
                      {avg.toFixed(1)} · {s.review_count || 0} reviews
                    </div>
                  )}
                  {s.tags?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                      {s.tags.slice(0, 3).map((t: string) => (
                        <span key={t} style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 100, background: '#E7F1EA', color: '#2E7D5B' }}>{t}</span>
                      ))}
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="ft-num" style={{ fontSize: 16, color: '#12A150' }}>
                      ${s.rate}/{s.rate_type || 'hr'}
                    </span>
                    <Link href={`/student/services/vendor/${s.user_id}`} className="ft-btn ft-btn-p" style={{ fontSize: 12, padding: '8px 16px' }}>Book now</Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}

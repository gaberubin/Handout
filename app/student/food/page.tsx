'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { createClient } from '@/lib/supabase/client';

const CheckIcon = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const StarIcon  = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const PinIcon   = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;

const CUISINES = ['All', 'Indian', 'Chinese', 'Pakistani', 'Korean', 'Halal', 'Vegetarian'];
const BG_COLORS = ['#EAF3ED','#E7F1EA','#FFF2E0','#FBEDE9','#F0EDF7','#F1F7F3'];

export default function FoodPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [cuisine, setCuisine] = useState('All');
  const [search, setSearch]   = useState('');

  useEffect(() => {
    (async () => {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { window.location.href = '/auth/login'; return; }
      const { data } = await sb.from('tiffin_listings')
        .select('*, users:public_profiles(full_name, avatar_url)')
        .eq('is_active', true)
        .neq('user_id', user.id)
        .order('created_at', { ascending: false });
      setListings(data || []);
    })();
  }, []);

  const visible = listings.filter(l => {
    const q = search.toLowerCase();
    if (q && !l.name?.toLowerCase().includes(q) && !l.cuisine_type?.toLowerCase().includes(q)) return false;
    if (cuisine !== 'All' && !l.cuisine_type?.toLowerCase().includes(cuisine.toLowerCase())) return false;
    return true;
  });

  return (
    <StudentLayout title="Food & Tiffin">
      <div className="page-enter" style={{ maxWidth: 1100, margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="ft-num" style={{ fontSize: 26, color: '#12241C', margin: 0 }}>Food & Tiffin</h1>
            <p style={{ fontSize: 14, color: '#4c6157', marginTop: 4 }}>Home-cooked meals from verified cooks near campus.</p>
          </div>
          <Link href="/vendor/onboarding" className="ft-btn ft-btn-p">＋ Become a cook</Link>
        </div>

        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or cuisine…"
          style={{ width: '100%', maxWidth: 380, height: 42, padding: '0 16px', borderRadius: 100, border: '1px solid rgba(18,36,28,0.12)', background: '#fff', fontSize: 13, color: '#12241C', outline: 'none', marginBottom: 14 }}
        />

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 22 }}>
          {CUISINES.map(c => (
            <button key={c} onClick={() => setCuisine(c)}
              style={{ padding: '8px 15px', borderRadius: 100, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', border: 'none',
                background: cuisine === c ? '#12A150' : '#fff',
                color: cuisine === c ? '#fff' : '#4c6157',
                boxShadow: cuisine === c ? 'none' : '0 0 0 1px rgba(18,36,28,0.12)' }}>
              {c}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#7d9188', fontSize: 14 }}>No listings found.</div>
        ) : (
          <div className="stagger-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(285px,1fr))', gap: 16 }}>
            {visible.map((l, i) => (
              <div key={l.id} className="ft-card" style={{ overflow: 'hidden' }}>
                <div style={{ height: 96, background: BG_COLORS[i % BG_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 42 }}>
                  {l.emoji || '🍱'}
                </div>
                <div style={{ padding: '15px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#12241C' }}>{l.name}</div>
                    {l.is_verified && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#12A150' }}>
                        <CheckIcon /> Verified
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: '#7d9188', marginBottom: 11, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    {l.avg_rating > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: '#E08A1E' }}><StarIcon />{l.avg_rating.toFixed(1)}</span>}
                    {l.cuisine_type && <span>{l.cuisine_type}</span>}
                    {l.location && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><PinIcon />{l.location}</span>}
                  </div>
                  {l.tags?.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                      {l.tags.slice(0, 3).map((t: string) => (
                        <span key={t} style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 100, background: '#E7F1EA', color: '#2E7D5B' }}>{t}</span>
                      ))}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                    <div>
                      <span className="ft-num" style={{ fontSize: 18, color: '#12241C' }}>${l.price_per_meal}</span>
                      <span style={{ fontSize: 11, color: '#7d9188' }}> / meal · ${l.price_per_month || (l.price_per_meal * 18)}/mo</span>
                    </div>
                    <Link href={`/student/food/${l.id}`} className="ft-btn ft-btn-p" style={{ fontSize: 12, padding: '8px 16px' }}>Subscribe</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}

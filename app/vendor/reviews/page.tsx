'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { VendorShell } from '@/components/layout/VendorShell';

/* ── Icons ── */
const StarFillIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const ChatIcon     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const TrophyIcon   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="8 21 12 17 16 21"/><line x1="12" y1="17" x2="12" y2="10"/><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"/></svg>;
const FilterIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
const UserIcon     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

function ini(name: string) {
  return (name || '?').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
}

function Stars({ value, size = 13 }: { value: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1,2,3,4,5].map(n => (
        <span key={n} style={{ color: n <= value ? '#E08A1E' : 'rgba(18,36,28,0.12)', fontSize: size }}>
          <StarFillIcon />
        </span>
      ))}
    </span>
  );
}

const TYPES = ['All', 'service', 'food'];
const SORTS = [
  { value: 'newest',  label: 'Newest' },
  { value: 'highest', label: 'Highest rating' },
  { value: 'lowest',  label: 'Lowest rating' },
];

const card: React.CSSProperties = {
  background: '#FFFFFF', 
  border: '1px solid rgba(18,36,28,0.09)', borderRadius: 16,
};

export default function VendorReviewsPage() {
  const [reviews, setReviews]   = useState<any[]>([]);
  const [names, setNames]       = useState<Record<string, string>>({});
  const [loading, setLoading]   = useState(true);
  const [typeFilter, setTypeFilter] = useState('All');
  const [ratingFilter, setRatingFilter] = useState(0);
  const [sort, setSort]         = useState('newest');
  const [me, setMe]             = useState<any>(null);

  useEffect(() => {
    (async () => {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return;
      const { data: u } = await sb.from('users').select('*').eq('id', user.id).single();
      setMe(u);

      const { data } = await sb.from('reviews')
        .select('*')
        .eq('reviewee_id', user.id)
        .order('created_at', { ascending: false });

      const rs = data || [];
      setReviews(rs);

      const uids = [...new Set(rs.map((r: any) => r.reviewer_id).filter(Boolean))] as string[];
      if (uids.length) {
        const { data: users } = await sb.from('public_profiles').select('id, full_name, avatar_url').in('id', uids);
        const map: Record<string, string> = {};
        (users || []).forEach((u: any) => { map[u.id] = u.full_name || 'Student'; });
        setNames(map);
      }
      setLoading(false);
    })();
  }, []);

  const filtered = reviews
    .filter(r => {
      if (typeFilter !== 'All' && r.listing_type !== typeFilter) return false;
      if (ratingFilter > 0 && r.rating !== ratingFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === 'highest') return b.rating - a.rating;
      if (sort === 'lowest')  return a.rating - b.rating;
      return 0;
    });

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const dist = [5,4,3,2,1].map(n => ({ n, count: reviews.filter(r => r.rating === n).length }));

  return (
    <VendorShell active="Reviews" title="Reviews">
      {() => (
        <div style={{ maxWidth: 800 }}>

          {/* Summary cards */}
          <div className="rg-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
            {[
              { label: 'Average rating', value: reviews.length ? avg.toFixed(1) : '—', icon: <StarFillIcon />, color: '#E08A1E', sub: `${reviews.length} total review${reviews.length !== 1 ? 's' : ''}` },
              { label: '5-star reviews', value: dist[0].count, icon: <TrophyIcon />, color: '#12A150', sub: reviews.length ? `${Math.round((dist[0].count / reviews.length) * 100)}% of all reviews` : '—' },
              { label: 'With comments', value: reviews.filter(r => r.comment).length, icon: <ChatIcon />, color: '#12A150', sub: 'Written feedback' },
            ].map(s => (
              <div key={s.label} style={{ ...card, padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ color: s.color, display: 'inline-flex' }}>{s.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#7d9188', textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</span>
                </div>
                <p style={{ margin: 0, fontSize: 30, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
                <p style={{ margin: '6px 0 0', fontSize: 12, color: '#7d9188' }}>{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Rating distribution */}
          {reviews.length > 0 && (
            <div style={{ ...card, padding: '18px 20px', marginBottom: 20 }}>
              <p style={{ margin: '0 0 14px', fontSize: 11, fontWeight: 800, color: '#7d9188', textTransform: 'uppercase', letterSpacing: 1 }}>Rating breakdown</p>
              <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <p style={{ margin: 0, fontSize: 52, fontWeight: 800, color: '#E08A1E', lineHeight: 1 }}>{avg.toFixed(1)}</p>
                  <Stars value={Math.round(avg)} size={16} />
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#7d9188' }}>{reviews.length} reviews</p>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {dist.map(({ n, count }) => {
                    const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                        onClick={() => setRatingFilter(ratingFilter === n ? 0 : n)}>
                        <span style={{ fontSize: 12, color: ratingFilter === n ? '#E08A1E' : '#7d9188', fontWeight: ratingFilter === n ? 700 : 400, width: 8 }}>{n}</span>
                        <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'rgba(18,36,28,0.07)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: ratingFilter === n ? '#E08A1E' : 'rgba(255,212,121,0.5)', borderRadius: 4, transition: 'width .3s' }} />
                        </div>
                        <span style={{ fontSize: 12, color: '#7d9188', width: 24, textAlign: 'right' }}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
            {/* Type */}
            <div style={{ display: 'flex', gap: 4 }}>
              {TYPES.map(t => (
                <button key={t} onClick={() => setTypeFilter(t)}
                  style={{ padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: `1px solid ${typeFilter === t ? 'rgba(18,161,80,0.4)' : 'rgba(18,36,28,0.09)'}`, background: typeFilter === t ? 'rgba(18,161,80,0.12)' : 'rgba(18,36,28,0.04)', color: typeFilter === t ? '#12A150' : '#7d9188' }}>
                  {t === 'All' ? 'All types' : t === 'service' ? 'Services' : 'Food'}
                </button>
              ))}
            </div>

            {/* Star filter chips */}
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#7d9188', display: 'inline-flex', alignItems: 'center', gap: 4 }}><FilterIcon />Stars:</span>
              {[5,4,3,2,1].map(n => (
                <button key={n} onClick={() => setRatingFilter(ratingFilter === n ? 0 : n)}
                  style={{ padding: '5px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: `1px solid ${ratingFilter === n ? 'rgba(255,212,121,0.5)' : 'rgba(18,36,28,0.09)'}`, background: ratingFilter === n ? 'rgba(255,212,121,0.12)' : 'rgba(18,36,28,0.04)', color: ratingFilter === n ? '#E08A1E' : '#7d9188' }}>
                  ★{n}
                </button>
              ))}
            </div>

            {/* Sort */}
            <select value={sort} onChange={e => setSort(e.target.value)}
              style={{ marginLeft: 'auto', height: 34, padding: '0 12px', borderRadius: 100, background: 'rgba(18,36,28,0.06)', border: '1px solid rgba(18,36,28,0.09)', color: '#12241C', fontSize: 12, outline: 'none' }}>
              {SORTS.map(s => <option key={s.value} value={s.value} style={{ background: '#FFFFFF' }}>{s.label}</option>)}
            </select>
          </div>

          <p style={{ fontSize: 12, color: '#7d9188', marginBottom: 14 }}>
            {loading ? 'Loading…' : `${filtered.length} review${filtered.length !== 1 ? 's' : ''}${typeFilter !== 'All' || ratingFilter ? ' (filtered)' : ''}`}
          </p>

          {/* Review list */}
          {!loading && filtered.length === 0 ? (
            <div style={{ ...card, padding: '48px 24px', textAlign: 'center' }}>
              <Stars value={0} />
              <p style={{ color: '#7d9188', fontSize: 14, margin: '12px 0 4px' }}>
                {reviews.length === 0 ? 'No reviews yet.' : 'No reviews match your filters.'}
              </p>
              {reviews.length === 0 && <p style={{ color: '#7d9188', fontSize: 12, margin: 0 }}>Reviews from students will appear here after they book your services.</p>}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(loading ? Array(4).fill(null) : filtered).map((r, i) => {
                if (!r) return (
                  <div key={i} style={{ ...card, padding: '16px 18px' }}>
                    <div style={{ height: 14, borderRadius: 7, background: 'rgba(18,36,28,0.06)', width: '40%', marginBottom: 8 }} className="skeleton" />
                    <div style={{ height: 12, borderRadius: 6, background: 'rgba(18,36,28,0.04)', width: '70%' }} className="skeleton" />
                  </div>
                );

                const rName = names[r.reviewer_id] || 'Student';
                const typeLabel = r.listing_type === 'service' ? 'Service' : r.listing_type === 'food' ? 'Food/Tiffin' : r.listing_type || 'Review';
                const typeColor = r.listing_type === 'service' ? '#7C6BD1' : r.listing_type === 'food' ? '#E08A1E' : '#7d9188';

                return (
                  <div key={r.id} style={{ ...card, padding: '16px 20px' }}>
                    <div style={{ display: 'flex', gap: 14 }}>
                      {/* Avatar */}
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#5A4BB8,#12A150)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#ffffff', flexShrink: 0 }}>
                        {ini(rName)}
                      </div>

                      <div style={{ flex: 1 }}>
                        {/* Header row */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 14, fontWeight: 700, color: '#12241C' }}>{rName}</span>
                              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 100, background: `${typeColor}18`, color: typeColor, border: `1px solid ${typeColor}30`, fontWeight: 600 }}>{typeLabel}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                              <Stars value={r.rating} />
                              <span style={{ fontSize: 11, color: '#7d9188' }}>{timeAgo(r.created_at)}</span>
                            </div>
                          </div>

                          {/* Rating badge */}
                          <div style={{ padding: '4px 10px', borderRadius: 8, background: r.rating >= 4 ? 'rgba(18,161,80,0.1)' : r.rating >= 3 ? 'rgba(255,212,121,0.1)' : 'rgba(194,91,78,0.1)', border: `1px solid ${r.rating >= 4 ? 'rgba(18,161,80,0.25)' : r.rating >= 3 ? 'rgba(255,212,121,0.25)' : 'rgba(194,91,78,0.25)'}` }}>
                            <span style={{ fontSize: 16, fontWeight: 800, color: r.rating >= 4 ? '#12A150' : r.rating >= 3 ? '#E08A1E' : '#C25B4E' }}>{r.rating}.0</span>
                          </div>
                        </div>

                        {/* Comment */}
                        {r.comment ? (
                          <div style={{ padding: '10px 14px', background: 'rgba(18,36,28,0.04)', borderRadius: 10, border: '1px solid rgba(18,36,28,0.07)' }}>
                            <p style={{ margin: 0, fontSize: 14, color: '#4c6157', lineHeight: 1.6 }}>"{r.comment}"</p>
                          </div>
                        ) : (
                          <p style={{ margin: 0, fontSize: 12, color: '#7d9188', fontStyle: 'italic' }}>No written comment</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </VendorShell>
  );
}

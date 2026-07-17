'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { StudentLayout } from '@/components/layout/StudentLayout';

/* ── Icons ── */
const PinIcon     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const CalIcon     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const BedIcon     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>;
const ChatIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const SearchIcon  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const ImgIcon     = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
const SchoolIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>;
const AddIcon     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const XIcon       = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

function fmt(date?: string) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtDuration(from?: string, to?: string) {
  if (!from || !to) return null;
  const days = Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000);
  if (days < 7)  return `${days}d`;
  if (days < 30) return `${Math.round(days / 7)}w`;
  return `${Math.round(days / 30)} mo`;
}

type Listing = {
  id: string; title: string; description?: string; location?: string;
  rent?: number; room_type?: string; university?: string;
  available_from?: string; sublet_end_date?: string;
  gender_preference?: string; occupancy?: string;
  media?: { url: string; type: string }[];
  user_id: string;
};

const ROOM_TYPES = ['Any', 'Single', 'Shared', 'Studio', 'Apartment'];
const SORT_OPTIONS = [
  { value: 'newest',  label: 'Newest first' },
  { value: 'price_asc', label: 'Price: low → high' },
  { value: 'price_desc', label: 'Price: high → low' },
];

export default function SublettingPage() {
  const router = useRouter();
  const [listings, setListings]   = useState<Listing[]>([]);
  const [names, setNames]         = useState<Record<string, string>>({});
  const [loading, setLoading]     = useState(true);
  const [meId, setMeId]           = useState('');
  const [q, setQ]                 = useState('');
  const [roomType, setRoomType]   = useState('Any');
  const [maxRent, setMaxRent]     = useState('');
  const [sort, setSort]           = useState('newest');

  useEffect(() => {
    (async () => {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }
      setMeId(user.id);

      const { data } = await sb.from('roommate_listings')
        .select('*')
        .eq('listing_type', 'sublet')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      const ls: Listing[] = data || [];
      setListings(ls);

      const uids = [...new Set(ls.map(l => l.user_id))];
      if (uids.length) {
        const { data: users } = await sb.from('public_profiles').select('id, full_name').in('id', uids);
        const map: Record<string, string> = {};
        (users || []).forEach((u: any) => { map[u.id] = u.full_name || 'Student'; });
        setNames(map);
      }
      setLoading(false);
    })();
  }, []);

  const filtered = listings
    .filter(l => {
      if (q) {
        const hay = `${l.title} ${l.description || ''} ${l.location || ''} ${l.university || ''}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      if (roomType !== 'Any' && l.room_type && !l.room_type.toLowerCase().includes(roomType.toLowerCase())) return false;
      if (maxRent && l.rent && l.rent > parseInt(maxRent)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === 'price_asc')  return (a.rent ?? 0) - (b.rent ?? 0);
      if (sort === 'price_desc') return (b.rent ?? 0) - (a.rent ?? 0);
      return 0; // newest: already sorted by DB
    });

  return (
    <StudentLayout title="Subletting">
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 0 80px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#12241C', margin: 0, letterSpacing: -0.5 }}>Sublet Listings</h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#7d9188' }}>Short-term room & apartment sublets near campus</p>
          </div>
          <Link href="/student/roommates" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 100, background: '#12A150', color: '#ffffff', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
            <AddIcon /> Post a sublet
          </Link>
        </div>

        {/* Search + Filters */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
          {/* Search */}
          <div style={{ flex: '1 1 220px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#7d9188', pointerEvents: 'none' }}><SearchIcon /></span>
            <input
              value={q} onChange={e => setQ(e.target.value)}
              placeholder="Search by title, location…"
              style={{ width: '100%', height: 40, paddingLeft: 36, paddingRight: 36, boxSizing: 'border-box', background: 'rgba(18,36,28,0.06)', border: '1px solid rgba(18,36,28,0.09)', borderRadius: 100, color: '#12241C', fontSize: 13, outline: 'none' }}
            />
            {q && <button onClick={() => setQ('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#7d9188', cursor: 'pointer', display: 'flex' }}><XIcon /></button>}
          </div>

          {/* Room type */}
          <select value={roomType} onChange={e => setRoomType(e.target.value)}
            style={{ height: 40, padding: '0 14px', borderRadius: 100, background: 'rgba(18,36,28,0.06)', border: '1px solid rgba(18,36,28,0.09)', color: '#12241C', fontSize: 13, outline: 'none' }}>
            {ROOM_TYPES.map(t => <option key={t} value={t} style={{ background: '#FFFFFF' }}>{t === 'Any' ? 'Room type' : t}</option>)}
          </select>

          {/* Max rent */}
          <input
            value={maxRent} onChange={e => setMaxRent(e.target.value.replace(/\D/, ''))}
            placeholder="Max $/mo"
            style={{ width: 100, height: 40, padding: '0 14px', borderRadius: 100, background: 'rgba(18,36,28,0.06)', border: '1px solid rgba(18,36,28,0.09)', color: '#12241C', fontSize: 13, outline: 'none' }}
          />

          {/* Sort */}
          <select value={sort} onChange={e => setSort(e.target.value)}
            style={{ height: 40, padding: '0 14px', borderRadius: 100, background: 'rgba(18,36,28,0.06)', border: '1px solid rgba(18,36,28,0.09)', color: '#12241C', fontSize: 13, outline: 'none' }}>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value} style={{ background: '#FFFFFF' }}>{o.label}</option>)}
          </select>
        </div>

        {/* Result count */}
        <p style={{ fontSize: 12, color: '#7d9188', marginBottom: 16 }}>
          {loading ? 'Loading…' : `${filtered.length} listing${filtered.length !== 1 ? 's' : ''}`}
        </p>

        {/* Grid */}
        {!loading && filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: 'rgba(255,255,255,0.4)', borderRadius: 16, border: '1px solid rgba(18,36,28,0.07)' }}>
            <p style={{ color: '#7d9188', fontSize: 14, margin: '0 0 12px' }}>No sublet listings match your filters.</p>
            <Link href="/student/roommates" style={{ color: '#12A150', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>Post your own →</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {(loading ? Array(6).fill(null) : filtered).map((l, i) => {
              if (!l) return (
                <div key={i} style={{ background: '#FFFFFF', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(18,36,28,0.09)' }}>
                  <div style={{ height: 160, background: 'rgba(18,36,28,0.04)' }} className="skeleton" />
                  <div style={{ padding: 16 }}>
                    <div style={{ height: 14, borderRadius: 7, background: 'rgba(18,36,28,0.06)', marginBottom: 8, width: '70%' }} className="skeleton" />
                    <div style={{ height: 12, borderRadius: 6, background: 'rgba(18,36,28,0.04)', marginBottom: 6, width: '50%' }} className="skeleton" />
                  </div>
                </div>
              );

              const images = (l.media || []).filter((m: any) => m.type === 'image');
              const thumb  = images[0]?.url;
              const poster = names[l.user_id] || 'Student';
              const dur    = fmtDuration(l.available_from, l.sublet_end_date);

              return (
                <div key={l.id}
                  onClick={() => router.push(`/student/roommates/${l.id}`)}
                  style={{ background: '#FFFFFF', border: '1px solid rgba(18,36,28,0.09)', borderRadius: 16, overflow: 'hidden', cursor: 'pointer', transition: 'border-color .15s, transform .12s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(18,161,80,0.3)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(18,36,28,0.09)'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}>

                  {/* Thumbnail */}
                  {thumb ? (
                    <img src={thumb} alt="" style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <div style={{ height: 140, background: 'rgba(18,36,28,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(18,36,28,0.12)' }}>
                      <ImgIcon />
                    </div>
                  )}

                  <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {/* Price + duration */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 20, fontWeight: 800, color: '#12A150', letterSpacing: -0.5 }}>
                        {l.rent ? `$${l.rent}/mo` : 'Price TBD'}
                      </span>
                      {dur && (
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: 'rgba(255,212,121,0.12)', color: '#E08A1E', border: '1px solid rgba(255,212,121,0.25)' }}>
                          {dur} sublet
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#12241C', lineHeight: 1.3 }}>{l.title}</p>

                    {/* Meta */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {l.location && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#7d9188' }}><PinIcon />{l.location}</span>
                      )}
                      {l.university && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#7d9188' }}><SchoolIcon />{l.university}</span>
                      )}
                      {l.room_type && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#7d9188' }}><BedIcon />{l.room_type}</span>
                      )}
                      {(l.available_from || l.sublet_end_date) && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#7d9188' }}>
                          <CalIcon />{fmt(l.available_from)} → {fmt(l.sublet_end_date)}
                        </span>
                      )}
                    </div>

                    {/* Tags */}
                    {(l.gender_preference || l.occupancy) && (
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        {l.gender_preference && l.gender_preference !== 'any' && (
                          <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: 'rgba(18,36,28,0.06)', color: '#7d9188' }}>{l.gender_preference}</span>
                        )}
                        {l.occupancy && l.occupancy !== 'Any' && (
                          <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: 'rgba(18,36,28,0.06)', color: '#7d9188' }}>{l.occupancy}</span>
                        )}
                      </div>
                    )}

                    {/* Action row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid rgba(18,36,28,0.07)', marginTop: 2 }}>
                      <span style={{ fontSize: 12, color: '#7d9188' }}>by {poster.split(' ')[0]}</span>
                      {l.user_id !== meId && (
                        <button
                          onClick={e => { e.stopPropagation(); router.push(`/student/messages?to=${l.user_id}&name=${encodeURIComponent(poster)}`); }}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 100, background: 'rgba(18,161,80,0.12)', border: '1px solid rgba(18,161,80,0.25)', color: '#12A150', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                          <ChatIcon /> Contact
                        </button>
                      )}
                    </div>
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

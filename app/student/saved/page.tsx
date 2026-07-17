'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { createClient } from '@/lib/supabase/client';

const HeartIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const StarIcon   = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="#E08A1E" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const TrashIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>;
const ArrowIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const EmptyIcon  = () => <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;

const card: React.CSSProperties = { background: '#FFFFFF', border: '1px solid rgba(18,36,28,0.09)', borderRadius: 16 };

type Tab = 'services' | 'food' | 'handouts';

export default function SavedPage() {
  const [tab, setTab] = useState<Tab>('services');
  const [saved, setSaved] = useState<any[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => { load(tab); }, [tab]);

  async function load(t: Tab) {
    setReady(false);
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { window.location.href = '/auth/login'; return; }

    const tableMap: Record<Tab, string> = { services: 'saved_services', food: 'saved_vendors', handouts: 'saved_handouts' };
    const table = tableMap[t];

    const { data } = await sb.from(table).select('*, listing:listing_id(*)').eq('user_id', user.id).order('created_at', { ascending: false });
    setSaved(data || []);
    setReady(true);
  }

  async function remove(id: string) {
    const tableMap: Record<Tab, string> = { services: 'saved_services', food: 'saved_vendors', handouts: 'saved_handouts' };
    await createClient().from(tableMap[tab]).delete().eq('id', id);
    setSaved(prev => prev.filter(s => s.id !== id));
  }

  const linkMap: Record<Tab, (item: any) => string> = {
    services: (item) => `/student/services/${item.listing_id}`,
    food: (item) => `/student/food/${item.listing_id}`,
    handouts: (item) => `/student/handouts/${item.listing_id}`,
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'services', label: 'Services' },
    { key: 'food', label: 'Food' },
    { key: 'handouts', label: 'Handouts' },
  ];

  return (
    <StudentLayout title="Saved">
        <div style={{ maxWidth: 620, margin: '0 auto', padding: '24px 0 60px' }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#12241C', margin: '0 0 4px', fontFamily: "'Bricolage Grotesque',sans-serif" }}>Saved</h1>
          <p style={{ fontSize: 14, color: '#7d9188', margin: '0 0 22px' }}>Items you've bookmarked for later.</p>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 22 }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{ padding: '7px 16px', borderRadius: 100, border: tab === t.key ? 'none' : '1px solid rgba(18,36,28,0.12)', background: tab === t.key ? '#12A150' : 'transparent', color: tab === t.key ? '#ffffff' : '#7d9188', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                {t.label}
              </button>
            ))}
          </div>

          {!ready && <p style={{ color: '#7d9188', fontSize: 14 }}>Loading…</p>}

          {ready && saved.length === 0 && (
            <div style={{ ...card, padding: 48, textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', color: '#7d9188', marginBottom: 12, opacity: 0.4 }}><EmptyIcon /></div>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#12241C', margin: '0 0 6px' }}>Nothing saved yet</p>
              <p style={{ fontSize: 13, color: '#7d9188', margin: '0 0 20px' }}>Tap the heart icon on any listing to save it here.</p>
              <Link href={tab === 'food' ? '/student/food' : tab === 'handouts' ? '/student/handouts' : '/student/services'}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px', background: '#12A150', borderRadius: 100, color: '#ffffff', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                Browse {tab} <ArrowIcon />
              </Link>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {saved.map((s, i) => {
              const listing = s.listing || {};
              const title = listing.title || listing.name || listing.subject || 'Listing';
              const subtitle = listing.category || listing.cuisine || listing.course_code || '';
              const rating = listing.avg_rating || listing.rating;
              return (
                <div key={i} style={{ ...card, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  {/* Avatar */}
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, rgba(18,161,80,0.2), rgba(124,107,209,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 20 }}>{tab === 'food' ? '🍱' : tab === 'handouts' ? '📄' : '⚙️'}</span>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#12241C', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                      {subtitle && <span style={{ fontSize: 12, color: '#7d9188' }}>{subtitle}</span>}
                      {rating && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12, color: '#E08A1E' }}><StarIcon />{Number(rating).toFixed(1)}</span>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <Link href={linkMap[tab](s)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: 'rgba(18,161,80,0.1)', border: '1px solid rgba(18,161,80,0.25)', borderRadius: 8, color: '#12A150', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
                      View <ArrowIcon />
                    </Link>
                    <button onClick={() => remove(s.id)} style={{ padding: '6px 10px', background: 'rgba(194,91,78,0.08)', border: '1px solid rgba(194,91,78,0.2)', borderRadius: 8, color: '#C25B4E', cursor: 'pointer' }}>
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      
    </StudentLayout>
  );
}

'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { createClient } from '@/lib/supabase/client';

const FoodIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>;
const WrenchIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>;
const EmptyIcon  = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;

const TABS = [
  { key: 'all',       l: 'All' },
  { key: 'confirmed', l: 'Confirmed' },
  { key: 'pending',   l: 'Pending' },
  { key: 'completed', l: 'Completed' },
  { key: 'cancelled', l: 'Cancelled' },
];

const sttClr = (s: string) => s === 'confirmed' ? '#12A150' : s === 'pending' ? '#E08A1E' : s === 'completed' ? '#4c6157' : '#C25B4E';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [names, setNames]       = useState<Record<string, string>>({});
  const [tab, setTab]           = useState('all');
  const [ready, setReady]       = useState(false);

  useEffect(() => {
    (async () => {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return;
      const { data } = await sb.from('bookings').select('*').eq('student_id', user.id).order('created_at', { ascending: false });
      const all = data || [];
      setBookings(all);
      const ids = Array.from(new Set(all.map((b: any) => b.provider_id).filter(Boolean))) as string[];
      if (ids.length) {
        const { data: users } = await sb.from('public_profiles').select('id,full_name').in('id', ids);
        const map: Record<string, string> = {};
        (users || []).forEach((u: any) => { map[u.id] = u.full_name || 'Provider'; });
        setNames(map);
      }
      setReady(true);
    })();
  }, []);

  async function cancel(id: string) {
    await createClient().from('bookings').update({ status: 'cancelled' }).eq('id', id);
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
  }

  const visible = tab === 'all' ? bookings : bookings.filter(b => b.status === tab);

  return (
    <StudentLayout title="My Bookings">
      <div className="page-enter" style={{ maxWidth: 800, margin: '0 auto' }}>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ padding: '8px 16px', borderRadius: 100, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none',
                background: tab === t.key ? '#12A150' : 'rgba(18,36,28,0.06)',
                color: tab === t.key ? '#fff' : '#7d9188' }}>
              {t.l}
            </button>
          ))}
        </div>

        {!ready ? (
          <div style={{ color: '#7d9188', fontSize: 14, padding: '24px 0' }}>Loading…</div>
        ) : visible.length === 0 ? (
          <div style={{ background: '#fff', border: '1px dashed rgba(18,36,28,0.12)', borderRadius: 16, padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ color: '#7d9188', display: 'inline-flex', marginBottom: 12 }}><EmptyIcon /></div>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#12241C', marginBottom: 6 }}>Nothing here yet.</p>
            <p style={{ fontSize: 13, color: '#7d9188', marginBottom: 20 }}>Browse services or food to make your first booking.</p>
            <Link href="/student/services" className="ft-btn ft-btn-p">Browse listings</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {visible.map(b => (
              <div key={b.id} className="ft-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: b.listing_type === 'tiffin' ? '#FFF2E0' : '#E7F1EA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: b.listing_type === 'tiffin' ? '#E08A1E' : '#12A150', flexShrink: 0 }}>
                  {b.listing_type === 'tiffin' ? <FoodIcon /> : <WrenchIcon />}
                </div>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ fontWeight: 700, color: '#12241C', fontSize: 14, textTransform: 'capitalize', marginBottom: 3 }}>
                    {b.listing_type} with {names[b.provider_id] || 'Provider'}
                  </div>
                  <div style={{ fontSize: 12, color: '#7d9188' }}>{new Date(b.created_at).toLocaleDateString()}</div>
                  <span style={{ display: 'inline-block', marginTop: 5, fontSize: 10.5, fontWeight: 700, textTransform: 'capitalize', padding: '3px 10px', borderRadius: 100, color: sttClr(b.status), background: `${sttClr(b.status)}15`, border: `1px solid ${sttClr(b.status)}44` }}>
                    {b.status}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {b.total_price != null && <span className="ft-num" style={{ fontSize: 16, color: '#12241C' }}>${b.total_price}</span>}
                  {b.status === 'pending' && (
                    <button onClick={() => cancel(b.id)} style={{ padding: '7px 14px', background: 'transparent', color: '#C25B4E', border: '1px solid rgba(194,91,78,0.3)', borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  )}
                  {b.status === 'confirmed' && (
                    <Link href={`/student/messages?to=${b.provider_id}&name=${encodeURIComponent(names[b.provider_id] || 'Provider')}`}
                      style={{ padding: '7px 14px', background: 'rgba(18,161,80,0.1)', color: '#12A150', border: '1px solid rgba(18,161,80,0.25)', borderRadius: 100, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
                      Message
                    </Link>
                  )}
                  <Link href={`/student/bookings/${b.id}`} style={{ padding: '7px 14px', background: 'rgba(18,36,28,0.05)', color: '#4c6157', border: '1px solid rgba(18,36,28,0.1)', borderRadius: 100, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>Details</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}

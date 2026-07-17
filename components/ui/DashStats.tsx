'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const BedIcon   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>;
const CalIcon   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const CheckIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const MsgIcon   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;

const STATS = [
  { key: 'listings', label: 'Active listings', Icon: BedIcon,   color: '#12A150', bg: 'rgba(18,161,80,.1)' },
  { key: 'bookings', label: 'My bookings',     Icon: CalIcon,   color: '#E08A1E', bg: 'rgba(226,138,30,.12)' },
  { key: 'accepted', label: 'Accepted',        Icon: CheckIcon, color: '#2E7D5B', bg: 'rgba(46,125,91,.12)' },
  { key: 'messages', label: 'Messages',        Icon: MsgIcon,   color: '#4c6157', bg: 'rgba(76,97,87,.1)' },
];

export function DashStats({ meId }: { meId?: string }) {
  const [s, setS] = useState({ listings: 0, bookings: 0, accepted: 0, messages: 0 });
  const [upcoming, setUpcoming] = useState<any[]>([]);

  useEffect(() => {
    if (!meId) return;
    (async () => {
      const sb = createClient();
      const n = async (t: string, col: string, extra?: (q: any) => any) => {
        let q = sb.from(t).select('*', { count: 'exact', head: true }).eq(col, meId);
        const { count } = await (extra ? extra(q) : q);
        return count || 0;
      };
      const [listings, bookings, accepted, messages] = await Promise.all([
        n('roommate_listings', 'user_id'),
        n('bookings', 'student_id'),
        n('bookings', 'student_id', q => q.eq('status', 'confirmed')),
        n('messages', 'receiver_id'),
      ]);
      setS({ listings, bookings, accepted, messages });
      const { data } = await sb.from('bookings').select('*').eq('student_id', meId)
        .in('status', ['pending', 'confirmed']).order('created_at', { ascending: false }).limit(4);
      setUpcoming(data || []);
    })();
  }, [meId]);

  const sttBg  = (st: string) => st === 'confirmed' ? 'rgba(18,161,80,.1)'    : 'rgba(226,138,30,.12)';
  const sttClr = (st: string) => st === 'confirmed' ? '#12A150' : '#E08A1E';

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, marginBottom: 16 }}>
        {STATS.map(d => (
          <div key={d.key} className="ft-card" style={{ borderRadius: 16, padding: '18px 20px' }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: d.bg, color: d.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}><d.Icon /></div>
            <div className="ft-num" style={{ fontSize: 28, color: '#12241C', lineHeight: 1 }}>{(s as any)[d.key]}</div>
            <div style={{ fontSize: 12.5, color: '#7d9188', marginTop: 5 }}>{d.label}</div>
          </div>
        ))}
      </div>
      {upcoming.length > 0 && (
        <div className="ft-card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid rgba(18,36,28,0.09)' }}>
            <span className="ft-num" style={{ fontSize: 15, color: '#12241C' }}>Upcoming bookings</span>
            <Link href="/student/bookings" className="ft-btn" style={{ background: '#E7F1EA', color: '#0F8A44', padding: '7px 14px', fontSize: 12 }}>View all</Link>
          </div>
          {upcoming.map(b => (
            <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 18px', borderBottom: '1px solid rgba(18,36,28,0.05)' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: b.listing_type === 'tiffin' ? '#FFF2E0' : '#E7F1EA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                {b.listing_type === 'tiffin' ? '🍱' : '🔧'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#12241C', textTransform: 'capitalize', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.listing_type} booking</div>
                <div style={{ fontSize: 12, color: '#7d9188', marginTop: 2 }}>{new Date(b.created_at).toLocaleDateString()}</div>
              </div>
              <span style={{ fontSize: 10.5, fontWeight: 700, padding: '4px 10px', borderRadius: 100, background: sttBg(b.status), color: sttClr(b.status), textTransform: 'capitalize' }}>{b.status}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

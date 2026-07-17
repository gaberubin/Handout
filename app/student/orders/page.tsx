'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { createClient } from '@/lib/supabase/client';

const FoodIcon    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>;
const SvcIcon     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>;
const ArrowIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const EmptyIcon   = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>;

const STATUS_COLOR: Record<string, string> = {
  pending: '#FFB347', placed: '#FFB347',
  accepted: '#12A150', confirmed: '#12A150', preparing: '#12A150',
  on_the_way: '#7C6BD1', out_for_delivery: '#7C6BD1',
  delivered: '#12A150', completed: '#12A150',
  cancelled: '#C25B4E',
};

const card: React.CSSProperties = { background: '#FFFFFF', border: '1px solid rgba(18,36,28,0.09)', borderRadius: 16 };

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    (async () => {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { window.location.href = '/auth/login'; return; }
      const { data: bk } = await sb.from('bookings').select('*').eq('student_id', user.id).order('created_at', { ascending: false });
      const list = bk || [];
      const pids = Array.from(new Set(list.map((b: any) => b.provider_id).filter(Boolean)));
      const nm: Record<string, string> = {};
      if (pids.length) {
        const { data } = await sb.from('public_profiles').select('id,full_name').in('id', pids as string[]);
        (data || []).forEach((u: any) => { nm[u.id] = u.full_name || 'Vendor'; });
      }
      setOrders(list);
      setNames(nm);
      setReady(true);
    })();
  }, []);

  const filtered = orders.filter(o => {
    if (tab === 'active') return !['delivered', 'completed', 'cancelled'].includes(o.status);
    if (tab === 'completed') return ['delivered', 'completed'].includes(o.status);
    return true;
  });

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const tabs = ['all', 'active', 'completed'] as const;

  return (
    <StudentLayout title="Orders">
        <div style={{ maxWidth: 620, margin: '0 auto', padding: '24px 0 60px' }}>
          <h1 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 24, fontWeight: 800, color: '#12241C', margin: '0 0 4px' }}>Order History</h1>
          <p style={{ fontSize: 14, color: '#7d9188', margin: '0 0 22px' }}>Track and manage all your orders and bookings.</p>

          <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
            {tabs.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: '7px 16px', borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: `1px solid ${tab === t ? '#12A150' : 'rgba(18,36,28,0.12)'}`, background: tab === t ? 'rgba(18,161,80,0.1)' : 'transparent', color: tab === t ? '#12A150' : '#7d9188', textTransform: 'capitalize' }}>
                {t}
              </button>
            ))}
          </div>

          {!ready && <p style={{ color: '#7d9188', fontSize: 14 }}>Loading…</p>}

          {ready && filtered.length === 0 && (
            <div style={{ ...card, padding: 48, textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', color: '#7d9188', marginBottom: 12 }}><EmptyIcon /></div>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#12241C', margin: '0 0 6px' }}>No orders yet</p>
              <p style={{ fontSize: 13, color: '#7d9188', margin: '0 0 20px' }}>Place your first order from the food or services section.</p>
              <Link href="/student/food" style={{ display: 'inline-block', padding: '9px 22px', background: '#12A150', borderRadius: 100, color: '#ffffff', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>Browse Food</Link>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(o => {
              const statusColor = STATUS_COLOR[o.status] || '#7d9188';
              const isFood = o.listing_type === 'tiffin';
              return (
                <Link key={o.id} href={`/student/orders/${o.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ ...card, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, transition: 'border-color .2s', borderColor: 'rgba(18,36,28,0.09)' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(18,161,80,0.3)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(18,36,28,0.09)')}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: isFood ? 'rgba(18,161,80,0.1)' : 'rgba(124,107,209,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isFood ? '#12A150' : '#7C6BD1', flexShrink: 0 }}>
                      {isFood ? <FoodIcon /> : <SvcIcon />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#12241C', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {names[o.provider_id] || (isFood ? 'Food Order' : 'Service Booking')}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: '#7d9188' }}>{fmt(o.created_at)} · #{o.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#12241C' }}>${Number(o.total_price || o.price || 0).toFixed(2)}</p>
                      <span style={{ fontSize: 11, fontWeight: 600, color: statusColor, textTransform: 'capitalize' }}>{o.status?.replace(/_/g, ' ')}</span>
                    </div>
                    <div style={{ color: '#7d9188', flexShrink: 0 }}><ArrowIcon /></div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      
    </StudentLayout>
  );
}

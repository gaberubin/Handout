'use client';

import { useEffect, useState } from 'react';
import { VendorShell } from '@/components/layout/VendorShell';
import { createClient } from '@/lib/supabase/client';

const VO_BoxIcon = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;

export default function VendorOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<'pending' | 'accepted' | 'all'>('pending');

  async function load() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: bk } = await supabase.from('bookings').select('*').eq('provider_id', user.id).order('created_at', { ascending: false });
    const list = bk || [];
    // resolve student names + listing names
    const sids = Array.from(new Set(list.map(b => b.student_id)));
    const names: Record<string, string> = {};
    if (sids.length) {
      const { data: us } = await supabase.from('public_profiles').select('id, full_name').in('id', sids);
      (us || []).forEach((u: any) => { names[u.id] = u.full_name || 'Student'; });
    }
    const tIds = list.filter(b => b.listing_type === 'tiffin').map(b => b.listing_id);
    const sIds = list.filter(b => b.listing_type === 'service').map(b => b.listing_id);
    const lname: Record<string, string> = {};
    if (tIds.length) { const { data } = await supabase.from('tiffin_listings').select('id,name').in('id', tIds); (data || []).forEach((x: any) => lname[x.id] = x.name); }
    if (sIds.length) { const { data } = await supabase.from('service_listings').select('id,title').in('id', sIds); (data || []).forEach((x: any) => lname[x.id] = x.title); }
    setOrders(list.map(b => ({ ...b, studentName: names[b.student_id] || 'Student', listingName: lname[b.listing_id] || (b.listing_type === 'tiffin' ? 'Food order' : 'Service request') })));
    setReady(true);
  }
  useEffect(() => { load(); const t = setInterval(load, 8000); return () => clearInterval(t); }, []);

  async function setStatus(id: string, status: string) {
    const supabase = createClient();
    const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
    if (error) { alert('Could not update: ' + error.message); return; }
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  }

  const color = (s: string) => s === 'pending' ? '#E08A1E' : s === 'confirmed' ? '#12A150' : s === 'completed' ? '#12A150' : '#C25B4E';
  const visible = tab === 'all' ? orders : tab === 'pending' ? orders.filter(o => o.status === 'pending') : orders.filter(o => o.status !== 'pending' && o.status !== 'cancelled');
  const pendingCount = orders.filter(o => o.status === 'pending').length;

  const tabBtn = (key: typeof tab, label: string): React.CSSProperties => ({
    padding: '8px 18px', borderRadius: 100, fontSize: 13, fontWeight: 700, cursor: 'pointer',
    background: tab === key ? '#12A150' : 'rgba(18,36,28,0.05)',
    color: tab === key ? '#ffffff' : '#4c6157',
    border: tab === key ? 'none' : '1px solid rgba(18,36,28,0.09)',
  });

  return (
    <VendorShell active="Orders" title="Orders">
      {() => (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
            <button style={tabBtn('pending', '')} onClick={() => setTab('pending')}>Pending{pendingCount > 0 ? ` (${pendingCount})` : ''}</button>
            <button style={tabBtn('accepted', '')} onClick={() => setTab('accepted')}>Accepted</button>
            <button style={tabBtn('all', '')} onClick={() => setTab('all')}>All</button>
          </div>

          {!ready ? <div style={{ color: '#7d9188' }}>Loading orders…</div> :
          visible.length === 0 ? (
            <div style={{ background: '#FFFFFF', border: '1px dashed rgba(18,36,28,0.12)', borderRadius: 16, padding: 48, textAlign: 'center' }}>
              <div style={{ marginBottom: 10, display:'inline-flex', color:'#7d9188' }}><VO_BoxIcon /></div>
              <p style={{ fontSize: 16, color: '#4c6157', marginBottom: 6 }}>
                {tab === 'pending' ? 'No pending requests.' : tab === 'accepted' ? 'Nothing accepted yet.' : 'No orders yet.'}
              </p>
              <p style={{ fontSize: 13, color: '#7d9188' }}>When a student books one of your listings, it shows up here.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {visible.map((o) => (
                <div key={o.id} style={{ background: '#FFFFFF', border: '1px solid rgba(18,36,28,0.09)', borderRadius: 14, padding: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ minWidth: 200 }}>
                    <div style={{ fontWeight: 700, color: '#12241C', fontSize: 15 }}>
                      {o.item_name || o.listingName}{o.qty > 1 ? <span style={{ color: '#7d9188', fontWeight: 600 }}> × {o.qty}</span> : null}
                    </div>
                    <div style={{ fontSize: 13, color: '#7d9188', marginTop: 4 }}>from {o.studentName} · {new Date(o.created_at).toLocaleDateString()}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', marginTop: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'capitalize', padding: '3px 10px', borderRadius: 100, color: color(o.status), background: 'rgba(18,36,28,0.05)', border: `1px solid ${color(o.status)}44` }}>{o.status === 'confirmed' ? 'accepted' : o.status}</span>
                      {o.fulfillment && (
                        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'capitalize', padding: '3px 10px', borderRadius: 100, color: '#4c6157', background: 'rgba(18,36,28,0.05)', border: '1px solid rgba(18,36,28,0.12)' }}>
                          {o.fulfillment === 'delivery' ? '🚚 delivery' : '🏠 pickup'}
                        </span>
                      )}
                      {o.payment_method && (
                        <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'capitalize', padding: '3px 10px', borderRadius: 100, color: '#7d9188', background: 'rgba(18,36,28,0.03)', border: '1px solid rgba(18,36,28,0.09)' }}>{o.payment_method}</span>
                      )}
                    </div>
                    {o.fulfillment === 'delivery' && o.delivery_address && (
                      <div style={{ fontSize: 12, color: '#4c6157', marginTop: 8, display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                        <span style={{ flexShrink: 0, marginTop: 1 }}>📍</span>
                        <span>{o.delivery_address}</span>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {o.total_price != null && <span style={{ fontWeight: 800, color: '#12A150', fontSize: 16 }}>${o.total_price}</span>}
                    {o.status === 'pending' && (
                      <button onClick={() => setStatus(o.id, 'confirmed')} style={{ padding: '8px 16px', background: '#12A150', color: '#ffffff', border: 'none', borderRadius: 100, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Accept</button>
                    )}
                    {o.status === 'confirmed' && (
                      <button onClick={() => setStatus(o.id, 'completed')} style={{ padding: '8px 16px', background: 'rgba(18,161,80,0.15)', color: '#12A150', border: '1px solid rgba(18,161,80,0.3)', borderRadius: 100, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Mark completed</button>
                    )}
                    {o.status === 'pending' && (
                      <button onClick={() => setStatus(o.id, 'cancelled')} style={{ padding: '8px 14px', background: 'transparent', color: '#C25B4E', border: '1px solid rgba(194,91,78,0.3)', borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Decline</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </VendorShell>
  );
}

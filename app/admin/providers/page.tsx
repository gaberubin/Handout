'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { createClient } from '@/lib/supabase/client';

export default function AdminProviders() {
  const [rows, setRows] = useState<any[]>([]);
  const [listings, setListings] = useState(0);
  const [ratingsMap, setRatingsMap] = useState<Record<string, { avg: number; count: number }>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from('users').select('*').eq('role', 'vendor').order('created_at', { ascending: false });
      setRows(data || []);
      const c = async (t: string) => { const { count } = await supabase.from(t).select('*', { count: 'exact', head: true }); return count || 0; };
      setListings(await c('tiffin_listings') + await c('service_listings'));
      // Load ratings per vendor
      const { data: revs } = await supabase.from('reviews').select('reviewee_id, rating');
      const rm: Record<string, { sum: number; count: number }> = {};
      (revs || []).forEach((r: any) => {
        if (!rm[r.reviewee_id]) rm[r.reviewee_id] = { sum: 0, count: 0 };
        rm[r.reviewee_id].sum += r.rating; rm[r.reviewee_id].count++;
      });
      const out: Record<string, { avg: number; count: number }> = {};
      Object.entries(rm).forEach(([id, v]) => { out[id] = { avg: Math.round((v.sum / v.count) * 10) / 10, count: v.count }; });
      setRatingsMap(out);
      setReady(true);
    })();
  }, []);

  async function toggleVerify(u: any) {
    const supabase = createClient();
    const next = !u.is_verified;
    const { error } = await supabase.from('users').update({ is_verified: next, verification_status: next ? 'approved' : 'pending' }).eq('id', u.id);
    if (error) { alert(error.message); return; }
    setRows(prev => prev.map(r => r.id === u.id ? { ...r, is_verified: next } : r));
  }
  async function remove(u: any) {
    if (!confirm(`Delete vendor ${u.email}? This removes their data.`)) return;
    const supabase = createClient();
    const { error } = await supabase.from('users').delete().eq('id', u.id);
    if (error) { alert(error.message); return; }
    setRows(prev => prev.filter(r => r.id !== u.id));
  }

  const card: React.CSSProperties = { background: '#FFFFFF', border: '1px solid rgba(18,36,28,0.09)', borderRadius: 14, padding: 20 };
  const PR_BriefIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
  const PR_CheckIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
  const PR_ClockIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
  const PR_BoxIcon   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>;
  const PR_StarIcon  = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="#E08A1E" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
  const Stat = ({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) => (
    <div style={card}><div style={{ display:'inline-flex', color:'#12A150' }}>{icon}</div><div style={{ fontSize: 28, fontWeight: 800, color: '#12241C', marginTop: 6 }}>{ready ? value : '—'}</div><div style={{ fontSize: 12, color: '#7d9188', marginTop: 2 }}>{label}</div></div>
  );

  return (
    <AdminLayout title="Providers">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, marginBottom: 20 }}>
        <Stat label="Total providers" value={rows.length} icon={<PR_BriefIcon />} />
        <Stat label="Verified" value={rows.filter(r => r.is_verified).length} icon={<PR_CheckIcon />} />
        <Stat label="Pending verification" value={rows.filter(r => !r.is_verified).length} icon={<PR_ClockIcon />} />
        <Stat label="Active listings" value={listings} icon={<PR_BoxIcon />} />
      </div>

      <div style={{ ...card, padding: 0 }}>
        <div style={{ padding: 16, borderBottom: '1px solid rgba(18,36,28,0.09)', fontWeight: 700, color: '#12241C' }}>All providers</div>
        {!ready ? <div style={{ padding: 24, color: '#7d9188' }}>Loading…</div> :
        rows.length === 0 ? <div style={{ padding: 24, color: '#7d9188', fontSize: 13 }}>No vendors yet — they appear here when people sign up as vendors.</div> : (
          rows.map(u => (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid rgba(18,36,28,0.05)', flexWrap: 'wrap' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#5A4BB8', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13 }}>{(u.full_name || u.email || '?').slice(0, 2).toUpperCase()}</div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#12241C' }}>{u.full_name || '—'}</div>
                <div style={{ fontSize: 12, color: '#7d9188' }}>{u.email}</div>
              </div>
              {ratingsMap[u.id] ? (
                <span style={{ fontSize: 12, fontWeight: 700, color: '#E08A1E', display:'inline-flex', alignItems:'center', gap:3 }}><PR_StarIcon /> {ratingsMap[u.id].avg} <span style={{ fontWeight: 400, color: '#7d9188' }}>({ratingsMap[u.id].count})</span></span>
              ) : <span style={{ fontSize: 11, color: '#7d9188' }}>No reviews</span>}
              <span style={{ fontSize: 11, fontWeight: 700, color: u.is_verified ? '#12A150' : '#E08A1E' }}>{u.is_verified ? 'VERIFIED' : 'PENDING'}</span>
              <button onClick={() => toggleVerify(u)} style={{ padding: '7px 14px', background: 'rgba(18,161,80,0.1)', color: '#12A150', border: '1px solid rgba(18,161,80,0.3)', borderRadius: 100, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>{u.is_verified ? 'Unverify' : 'Verify'}</button>
              <button onClick={() => remove(u)} style={{ padding: '7px 14px', background: 'transparent', color: '#C25B4E', border: '1px solid rgba(194,91,78,0.3)', borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Delete</button>
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
}

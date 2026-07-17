'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { createClient } from '@/lib/supabase/client';

export default function AdminReports() {
  const [s, setS] = useState({ revenue: 0, users: 0, bookings: 0, vendors: 0 });
  const [growth, setGrowth] = useState<{ m: string; n: number }[]>([]);
  const [breakdown, setBreakdown] = useState<{ label: string; amt: number }[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
      const c = async (t: string, f?: (q: any) => any) => { let q = supabase.from(t).select('*', { count: 'exact', head: true }); if (f) q = f(q); const { count } = await q; return count || 0; };
      const users = await c('users', q => q.gte('created_at', monthStart.toISOString()));
      const bookings = await c('bookings', q => q.gte('created_at', monthStart.toISOString()));
      const vendors = await c('users', q => q.eq('role', 'vendor'));
      const { data: paid } = await supabase.from('bookings').select('total_price, listing_type').eq('status', 'completed');
      const revenue = (paid || []).reduce((a: number, b: any) => a + (Number(b.total_price) || 0), 0);
      const by: Record<string, number> = {};
      (paid || []).forEach((b: any) => { by[b.listing_type || 'other'] = (by[b.listing_type || 'other'] || 0) + (Number(b.total_price) || 0); });
      setBreakdown([
        { label: 'Food / Tiffin', amt: by['tiffin'] || 0 },
        { label: 'Services', amt: by['service'] || 0 },
        { label: 'Other', amt: Object.entries(by).filter(([k]) => k !== 'tiffin' && k !== 'service').reduce((a, [, v]) => a + v, 0) },
      ]);
      // real signups for the last 5 months
      const months: { m: string; n: number }[] = [];
      for (let i = 4; i >= 0; i--) {
        const a = new Date(); a.setMonth(a.getMonth() - i, 1); a.setHours(0, 0, 0, 0);
        const b = new Date(a); b.setMonth(b.getMonth() + 1);
        const n = await c('users', q => q.gte('created_at', a.toISOString()).lt('created_at', b.toISOString()));
        months.push({ m: a.toLocaleString('en', { month: 'short' }), n });
      }
      setGrowth(months);
      setS({ revenue, users, bookings, vendors });
      setReady(true);
    })();
  }, []);

  const card: React.CSSProperties = { background: '#FFFFFF', border: '1px solid rgba(18,36,28,0.09)', borderRadius: 14, padding: 20 };
  const RP_DollarIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
  const RP_PeopleIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
  const RP_CalIcon    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
  const RP_BriefIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
  const Stat = ({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) => (
    <div style={card}><div style={{ display:'inline-flex', color:'#12A150' }}>{icon}</div><div style={{ fontSize: 28, fontWeight: 800, color: '#12241C', marginTop: 6 }}>{ready ? value : '—'}</div><div style={{ fontSize: 12, color: '#7d9188', marginTop: 2 }}>{label}</div></div>
  );
  const maxN = Math.max(1, ...growth.map(g => g.n));
  const totalRev = Math.max(1, breakdown.reduce((a, b) => a + b.amt, 0));
  const colors = ['#12A150', '#12A150', '#7C6BD1'];

  return (
    <AdminLayout title="Reports & Analytics">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 14, marginBottom: 20 }}>
        <Stat label="Total revenue (completed)" value={`$${s.revenue.toLocaleString()}`} icon={<RP_DollarIcon />} />
        <Stat label="New users this month" value={s.users} icon={<RP_PeopleIcon />} />
        <Stat label="Bookings this month" value={s.bookings} icon={<RP_CalIcon />} />
        <Stat label="Total providers" value={s.vendors} icon={<RP_BriefIcon />} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 14 }}>
        <div style={card}>
          <div style={{ fontWeight: 700, color: '#12241C', marginBottom: 16 }}>Sign-ups (last 5 months)</div>
          {!ready ? <div style={{ color: '#7d9188' }}>Loading…</div> : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 140 }}>
              {growth.map(g => (
                <div key={g.m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontSize: 12, color: '#4c6157', fontWeight: 700 }}>{g.n}</div>
                  <div style={{ width: '70%', height: Math.max(4, (g.n / maxN) * 100), background: g.n > 0 ? '#12A150' : 'rgba(18,36,28,0.09)', borderRadius: 6 }} />
                  <div style={{ fontSize: 11, color: '#7d9188' }}>{g.m}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={card}>
          <div style={{ fontWeight: 700, color: '#12241C', marginBottom: 16 }}>Revenue breakdown</div>
          {!ready ? <div style={{ color: '#7d9188' }}>Loading…</div> :
          s.revenue === 0 ? <div style={{ color: '#7d9188', fontSize: 13 }}>No completed bookings yet — revenue appears here once services are completed.</div> : (
            breakdown.map((b, i) => (
              <div key={b.label} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <span style={{ color: '#4c6157' }}>{b.label}</span>
                  <span style={{ color: '#12241C', fontWeight: 700 }}>${b.amt.toLocaleString()} ({Math.round((b.amt / totalRev) * 100)}%)</span>
                </div>
                <div style={{ height: 8, background: 'rgba(18,36,28,0.06)', borderRadius: 100 }}>
                  <div style={{ height: '100%', width: `${(b.amt / totalRev) * 100}%`, background: colors[i % 3], borderRadius: 100 }} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

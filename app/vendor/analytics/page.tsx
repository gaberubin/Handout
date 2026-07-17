'use client';

import { useEffect, useState } from 'react';
import { VendorShell } from '@/components/layout/VendorShell';
import { createClient } from '@/lib/supabase/client';

const TrendUpIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const StarIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const OrderIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
const RevenueIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const UserIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;

const card: React.CSSProperties = { background: '#FFFFFF', border: '1px solid rgba(18,36,28,0.09)', borderRadius: 16 };

const BAR_COLORS = ['#12A150','#12A150','#7C6BD1','#E08A1E','#FF9F6B','#FF6B9D','#12A150'];

interface Stats { orders: number; revenue: number; avgRating: number; customers: number; }

export default function VendorAnalyticsPage() {
  const [stats, setStats]       = useState<Stats>({ orders: 0, revenue: 0, avgRating: 0, customers: 0 });
  const [recentOrders, setRecent] = useState<any[]>([]);
  const [weeklyRevenue, setWeekly] = useState<number[]>([0,0,0,0,0,0,0]);
  const [ready, setReady]       = useState(false);
  const [period, setPeriod]     = useState<'7d'|'30d'|'all'>('30d');

  useEffect(() => {
    (async () => {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return;

      const since = period === '7d' ? new Date(Date.now() - 7*86400000).toISOString()
                  : period === '30d' ? new Date(Date.now() - 30*86400000).toISOString()
                  : '2000-01-01';

      const { data: bookings } = await sb.from('bookings').select('*').eq('provider_id', user.id).gte('created_at', since);
      const allOrders = [...(bookings || [])];

      const revenue  = allOrders.reduce((s: number, o: any) => s + (o.total_price || o.price || 0), 0);
      const customers = new Set(allOrders.map((o: any) => o.student_id || o.user_id)).size;

      const { data: reviews } = await sb.from('reviews').select('rating').eq('reviewee_id', user.id);
      const avgRating = reviews?.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

      // Build weekly revenue (last 7 days)
      const days = Array(7).fill(0);
      allOrders.forEach((o: any) => {
        const d = new Date(o.created_at);
        const dayAgo = Math.floor((Date.now() - d.getTime()) / 86400000);
        if (dayAgo < 7) days[6 - dayAgo] += (o.total_price || o.price || 0);
      });

      setStats({ orders: allOrders.length, revenue, avgRating, customers });
      setWeekly(days);
      setRecent(allOrders.slice(0, 5));
      setReady(true);
    })();
  }, [period]);

  const maxBar = Math.max(...weeklyRevenue, 1);
  const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const today = new Date().getDay();
  const dayLabels = Array(7).fill(0).map((_, i) => DAYS[(today - 6 + i + 7) % 7]);

  const statCards = [
    { label: 'Total Orders', value: stats.orders, icon: <OrderIcon />, color: '#12A150' },
    { label: 'Revenue', value: `$${stats.revenue.toFixed(2)}`, icon: <RevenueIcon />, color: '#12A150' },
    { label: 'Avg Rating', value: stats.avgRating ? stats.avgRating.toFixed(1) : '—', icon: <StarIcon />, color: '#E08A1E' },
    { label: 'Customers', value: stats.customers, icon: <UserIcon />, color: '#7C6BD1' },
  ];

  return (
    <VendorShell active="Analytics" title="Analytics">
      {() => (
        <div style={{ maxWidth: 800 }}>
          {/* Period tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 22 }}>
            {(['7d','30d','all'] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                style={{ padding: '7px 16px', borderRadius: 100, border: period === p ? 'none' : '1px solid rgba(18,36,28,0.12)', background: period === p ? '#12A150' : 'transparent', color: period === p ? '#ffffff' : '#7d9188', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                {p === '7d' ? 'Last 7 days' : p === '30d' ? 'Last 30 days' : 'All time'}
              </button>
            ))}
          </div>

          {/* Stat cards */}
          <div className="rg-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
            {statCards.map((s, i) => (
              <div key={i} style={{ ...card, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>{s.icon}</div>
                <div>
                  <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#12241C', fontFamily: "'Bricolage Grotesque',sans-serif" }}>{s.value}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: '#7d9188' }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bar chart */}
          <div style={{ ...card, padding: '20px 22px', marginBottom: 20 }}>
            <p style={{ margin: '0 0 18px', fontSize: 13, fontWeight: 700, color: '#12241C', display: 'flex', alignItems: 'center', gap: 6 }}><TrendUpIcon /> Daily Revenue (Last 7 Days)</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
              {weeklyRevenue.map((v, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 10, color: '#7d9188' }}>{v > 0 ? `$${v.toFixed(0)}` : ''}</span>
                  <div style={{ width: '100%', height: `${Math.max((v / maxBar) * 90, 4)}px`, background: BAR_COLORS[i], borderRadius: '6px 6px 0 0', transition: 'height .4s ease' }} />
                  <span style={{ fontSize: 10, color: '#7d9188' }}>{dayLabels[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent orders */}
          <div style={card}>
            <p style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 700, color: '#12241C', padding: '20px 20px 0' }}>Recent Orders</p>
            {!ready ? (
              <p style={{ padding: '0 20px 20px', color: '#7d9188', fontSize: 13 }}>Loading…</p>
            ) : recentOrders.length === 0 ? (
              <p style={{ padding: '0 20px 20px', color: '#7d9188', fontSize: 13 }}>No orders yet in this period.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {recentOrders.map((o, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderTop: '1px solid rgba(18,36,28,0.06)' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 13, color: '#12241C', fontWeight: 600 }}>Order #{(o.id || '').slice(0, 8).toUpperCase()}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: '#7d9188' }}>{new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#12A150' }}>${(o.total_price || o.price || 0).toFixed(2)}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: '#7d9188', textTransform: 'capitalize' }}>{o.status || 'pending'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </VendorShell>
  );
}

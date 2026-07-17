'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { AdminCard, AdminCardHead, AdminTable, AdminTh, AdminTd, AdminTr, AdminLoading } from '@/components/admin/AdminUI';
import { createClient } from '@/lib/supabase/client';

const TrendIcon   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const UsersIcon   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const OrderIcon   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
const DollarIcon  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const StarIcon    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const HomeIcon    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;

const BAR_COLORS = ['#12A150','#2E7D5B','#0E2A19','#4c6157','#C25B4E','#0F8A44','#12A150'];

interface PlatformStats {
  totalUsers: number; students: number; vendors: number;
  totalBookings: number; totalRevenue: number;
  totalRoommates: number; avgRating: number; proMembers: number;
}

export default function AdminAnalyticsPage() {
  const [stats, setStats]   = useState<PlatformStats>({ totalUsers:0,students:0,vendors:0,totalBookings:0,totalRevenue:0,totalRoommates:0,avgRating:0,proMembers:0 });
  const [topVendors, setTopVendors] = useState<any[]>([]);
  const [weeklySignups, setWeeklySignups] = useState<number[]>([0,0,0,0,0,0,0]);
  const [ready, setReady]   = useState(false);
  const [period, setPeriod] = useState<'7d'|'30d'|'all'>('30d');

  useEffect(() => {
    (async () => {
      const sb = createClient();
      const since = period === '7d' ? new Date(Date.now()-7*86400000).toISOString()
                  : period === '30d' ? new Date(Date.now()-30*86400000).toISOString()
                  : '2000-01-01';

      const [{ count: totalUsers }, { count: students }, { count: vendors }, bookingsRes, roommatesRes, reviewsRes, proRes] = await Promise.all([
        sb.from('users').select('*', { count: 'exact', head: true }),
        sb.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student'),
        sb.from('users').select('*', { count: 'exact', head: true }).eq('role', 'provider'),
        sb.from('bookings').select('*').gte('created_at', since),
        sb.from('roommate_listings').select('*', { count: 'exact', head: true }),
        sb.from('reviews').select('rating'),
        sb.from('users').select('*', { count: 'exact', head: true }).eq('membership_plan', 'pro'),
      ]);

      const bookings = bookingsRes.data || [];
      const revenue  = bookings.reduce((s, b) => s + (b.total_price || b.price || 0), 0);
      const avgRating = reviewsRes.data?.length ? reviewsRes.data.reduce((s, r) => s + r.rating, 0) / reviewsRes.data.length : 0;

      // Weekly signups
      const { data: recentUsers } = await sb.from('users').select('created_at').gte('created_at', new Date(Date.now()-7*86400000).toISOString());
      const days = Array(7).fill(0);
      (recentUsers || []).forEach(u => {
        const dAgo = Math.floor((Date.now() - new Date(u.created_at).getTime()) / 86400000);
        if (dAgo < 7) days[6-dAgo]++;
      });

      // Top vendors by bookings
      const vendorMap: Record<string, number> = {};
      bookings.forEach(b => { if (b.provider_id) vendorMap[b.provider_id] = (vendorMap[b.provider_id]||0)+1; });
      const topIds = Object.entries(vendorMap).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([id])=>id);
      const { data: topUsers } = topIds.length ? await sb.from('users').select('id,full_name,email').in('id', topIds) : { data: [] };
      const topV = (topUsers||[]).map(u => ({ ...u, bookings: vendorMap[u.id]||0 })).sort((a,b)=>b.bookings-a.bookings);

      setStats({ totalUsers:totalUsers||0, students:students||0, vendors:vendors||0, totalBookings:bookings.length, totalRevenue:revenue, totalRoommates:roommatesRes.count||0, avgRating, proMembers:proRes.count||0 });
      setWeeklySignups(days);
      setTopVendors(topV);
      setReady(true);
    })();
  }, [period]);

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: <UsersIcon />, color: '#12A150', sub: `${stats.students} students · ${stats.vendors} vendors` },
    { label: 'Bookings', value: stats.totalBookings, icon: <OrderIcon />, color: '#2E7D5B', sub: `In selected period` },
    { label: 'Platform Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, icon: <DollarIcon />, color: '#4c6157', sub: 'From all bookings' },
    { label: 'Pro Members', value: stats.proMembers, icon: <StarIcon />, color: '#2E7D5B', sub: 'Active subscriptions' },
    { label: 'Avg Rating', value: stats.avgRating ? stats.avgRating.toFixed(1) : '—', icon: <StarIcon />, color: '#E08A1E', sub: 'Across all reviews' },
    { label: 'Room Listings', value: stats.totalRoommates, icon: <HomeIcon />, color: '#0E2A19', sub: 'Active listings' },
  ];

  const maxBar = Math.max(...weeklySignups, 1);
  const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const today = new Date().getDay();
  const dayLabels = Array(7).fill(0).map((_,i) => DAYS[(today-6+i+7)%7]);

  return (
    <AdminLayout title="Analytics">
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Platform Analytics</h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#666' }}>Real-time overview of platform health.</p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['7d','30d','all'] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                style={{ padding: '7px 16px', borderRadius: 6, border: '1px solid rgba(18,36,28,0.09)', background: period===p ? '#12A150' : '#fff', color: period===p ? '#fff' : '#4c6157', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                {p==='7d'?'7 days':p==='30d'?'30 days':'All time'}
              </button>
            ))}
          </div>
        </div>

        {/* Stat grid */}
        <div className="rg-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 22 }}>
          {statCards.map((s, i) => (
            <AdminCard key={i}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>{s.icon}</div>
                <div>
                  <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111' }}>{s.value}</p>
                  <p style={{ margin: '1px 0 0', fontSize: 11, color: '#888' }}>{s.label}</p>
                </div>
              </div>
              <p style={{ margin: '8px 0 0', fontSize: 11, color: '#aaa' }}>{s.sub}</p>
            </AdminCard>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 22 }}>
          {/* Signup bar chart */}
          <AdminCard>
            <AdminCardHead title={<><TrendIcon /> New Signups (Last 7 Days)</>} />
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120, paddingTop: 8 }}>
              {weeklySignups.map((v, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 10, color: '#888' }}>{v||''}</span>
                  <div style={{ width: '100%', height: `${Math.max((v/maxBar)*90,4)}px`, background: BAR_COLORS[i], borderRadius: '4px 4px 0 0', transition: 'height .4s' }} />
                  <span style={{ fontSize: 10, color: '#888' }}>{dayLabels[i]}</span>
                </div>
              ))}
            </div>
          </AdminCard>

          {/* Platform split */}
          <AdminCard>
            <AdminCardHead title={<><UsersIcon /> User Breakdown</>} />
            {[
              { label: 'Students', value: stats.students, total: stats.totalUsers, color: '#12A150' },
              { label: 'Vendors', value: stats.vendors, total: stats.totalUsers, color: '#2E7D5B' },
              { label: 'Pro Members', value: stats.proMembers, total: stats.students, color: '#4c6157' },
            ].map((r, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: '#555' }}>{r.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#333' }}>{r.value}</span>
                </div>
                <div style={{ height: 8, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${r.total > 0 ? (r.value/r.total)*100 : 0}%`, background: r.color, borderRadius: 4, transition: 'width .6s' }} />
                </div>
              </div>
            ))}
          </AdminCard>
        </div>

        {/* Top vendors */}
        <AdminCard>
          <AdminCardHead title={<><OrderIcon /> Top Vendors by Bookings</>} />
          {!ready ? <AdminLoading /> : topVendors.length === 0 ? (
            <p style={{ color: '#888', fontSize: 13, padding: '8px 0 4px' }}>No booking data for this period.</p>
          ) : (
            <AdminTable>
              <thead><tr><AdminTh>#</AdminTh><AdminTh>Vendor</AdminTh><AdminTh>Email</AdminTh><AdminTh>Bookings</AdminTh></tr></thead>
              <tbody>
                {topVendors.map((v, i) => (
                  <AdminTr key={v.id}>
                    <AdminTd><strong>{i+1}</strong></AdminTd>
                    <AdminTd>{v.full_name || 'Unknown'}</AdminTd>
                    <AdminTd muted>{v.email}</AdminTd>
                    <AdminTd><strong style={{ color: '#12A150' }}>{v.bookings}</strong></AdminTd>
                  </AdminTr>
                ))}
              </tbody>
            </AdminTable>
          )}
        </AdminCard>
      </div>
    </AdminLayout>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { AdminStat, AdminCard, AdminCardHead, AdminTable, AdminTh, AdminTd, AdminTr, AdminAvatar, AdminBadge, AdminEmpty, AdminLoading, A } from '@/components/admin/AdminUI';
import { createClient } from '@/lib/supabase/client';

const AD_PeopleIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const AD_BriefIcon   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
const AD_CalIcon     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const AD_DollarIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const AD_CardIcon    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>;
const AD_StarIcon    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const AD_GiftIcon    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>;
const AD_AlertIcon   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>;

export default function AdminDashboard() {
  const [stats, setStats]     = useState({ students: 0, vendors: 0, bookings: 0, revenue: 0, pending: 0, reviews: 0, referrals: 0 });
  const [users,  setUsers]    = useState<any[]>([]);
  const [bks,    setBks]      = useState<any[]>([]);
  const [listing, setListing] = useState<{ label: string; n: number; color: string }[]>([]);
  const [ready,  setReady]    = useState(false);

  useEffect(() => {
    (async () => {
      const sb = createClient();
      const count = async (table: string, filter?: (q: any) => any) => {
        let q = sb.from(table).select('*', { count: 'exact', head: true });
        if (filter) q = filter(q);
        const { count: c } = await q;
        return c || 0;
      };

      const [students, vendors, bookings, pending, reviews, referrals] = await Promise.all([
        count('users', q => q.eq('role', 'student')),
        count('users', q => q.eq('role', 'vendor')),
        count('bookings'),
        count('verifications', q => q.eq('status', 'pending')),
        count('reviews'),
        count('referrals', q => q.not('joined_at', 'is', null)),
      ]);
      const { data: paid } = await sb.from('bookings').select('total_price').eq('status', 'completed');
      const revenue = (paid || []).reduce((a: number, b: any) => a + (Number(b.total_price) || 0), 0);
      setStats({ students, vendors, bookings, revenue, pending, reviews, referrals });

      // Recent sign-ups: real signups only (students/vendors) — admins are staff,
      // not signups, so hide them here to match the "Students"/"Vendors" stats above.
      const { data: ru } = await sb.from('users').select('*').neq('role', 'admin').order('created_at', { ascending: false }).limit(10);
      setUsers(ru || []);

      const { data: bkRaw } = await sb.from('bookings').select('*').order('created_at', { ascending: false }).limit(7);
      const list = bkRaw || [];
      const ids = Array.from(new Set([...list.map((b: any) => b.student_id), ...list.map((b: any) => b.provider_id)].filter(Boolean)));
      const nm: Record<string, string> = {};
      if (ids.length) {
        const { data } = await sb.from('users').select('id,full_name').in('id', ids);
        (data || []).forEach((u: any) => (nm[u.id] = u.full_name || '—'));
      }
      setBks(list.map((b: any) => ({ ...b, sName: nm[b.student_id] || '—', pName: nm[b.provider_id] || '—' })));

      const [tiffin, services, rooms] = await Promise.all([
        count('tiffin_listings'),
        count('service_listings'),
        count('roommate_listings'),
      ]);
      setListing([
        { label: 'Tiffin / Food', n: tiffin,   color: A.green },
        { label: 'Services',      n: services,  color: A.cyan  },
        { label: 'Roommates',     n: rooms,     color: A.amber },
      ]);
      setReady(true);
    })();
  }, []);

  const maxL = Math.max(1, ...listing.map(l => l.n));

  return (
    <AdminLayout title="Dashboard">

      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(155px,1fr))', gap: 12, marginBottom: 22 }}>
        <AdminStat label="Students"              value={stats.students}                        icon={<AD_PeopleIcon />}  accent={A.cyan}  ready={ready} />
        <AdminStat label="Vendors"               value={stats.vendors}                         icon={<AD_BriefIcon />}   accent={A.amber} ready={ready} />
        <AdminStat label="Total bookings"        value={stats.bookings}                        icon={<AD_CalIcon />}     accent={A.green} ready={ready} />
        <AdminStat label="Platform revenue"      value={`$${stats.revenue.toLocaleString()}`} icon={<AD_DollarIcon />}  accent={A.cyan}  ready={ready} />
        <AdminStat label="Pending verifications" value={stats.pending}                         icon={<AD_CardIcon />}    accent={A.red}   ready={ready} />
        <AdminStat label="Reviews submitted"     value={stats.reviews}                         icon={<AD_StarIcon />}    accent={A.amber} ready={ready} />
        <AdminStat label="Successful referrals"  value={stats.referrals}                       icon={<AD_GiftIcon />}    accent={A.green} ready={ready} />
      </div>

      {/* ALERT */}
      {ready && stats.pending > 0 && (
        <Link href="/admin/verifications" style={{ textDecoration: 'none', display: 'block', marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', background: `${A.red}12`, border: `1px solid ${A.red}35`, borderRadius: 12, cursor: 'pointer', transition: 'background 0.2s' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = `${A.red}1c`}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = `${A.red}12`}>
            <span style={{ display: 'inline-flex', color: A.red }}><AD_CardIcon /></span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: A.text }}>{stats.pending} verification{stats.pending > 1 ? 's' : ''} awaiting review</div>
              <div style={{ fontSize: 11, color: A.muted, marginTop: 1 }}>Click to review identity documents →</div>
            </div>
          </div>
        </Link>
      )}

      {/* TWO COLUMNS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16, marginBottom: 16 }}>
        <AdminCard>
          <AdminCardHead title="Recent sign-ups" right={<Link href="/admin/users" style={{ fontSize: 12, color: A.cyan, textDecoration: 'none', fontWeight: 600 }}>View all →</Link>} />
          {!ready ? <AdminLoading /> : users.length === 0 ? <AdminEmpty title="No users yet" /> : (
            <AdminTable>
              <thead><tr><AdminTh>User</AdminTh><AdminTh>Role</AdminTh><AdminTh>Joined</AdminTh></tr></thead>
              <tbody>
                {users.map(u => (
                  <AdminTr key={u.id}>
                    <AdminTd>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <AdminAvatar name={u.full_name} email={u.email} size={32} />
                        <div><div style={{ fontWeight: 600 }}>{u.full_name || '—'}</div><div style={{ fontSize: 11, color: A.muted }}>{u.email}</div></div>
                      </div>
                    </AdminTd>
                    <AdminTd><span style={{ fontSize: 11, textTransform: 'capitalize', color: A.light }}>{u.role}</span></AdminTd>
                    <AdminTd muted>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</AdminTd>
                  </AdminTr>
                ))}
              </tbody>
            </AdminTable>
          )}
        </AdminCard>

        <AdminCard>
          <AdminCardHead title="Recent bookings" right={<Link href="/admin/bookings" style={{ fontSize: 12, color: A.cyan, textDecoration: 'none', fontWeight: 600 }}>View all →</Link>} />
          {!ready ? <AdminLoading /> : bks.length === 0 ? <AdminEmpty title="No bookings yet" desc="They appear here once students start booking." /> : (
            <AdminTable>
              <thead><tr><AdminTh>Booking</AdminTh><AdminTh>Amount</AdminTh><AdminTh>Status</AdminTh></tr></thead>
              <tbody>
                {bks.map(b => (
                  <AdminTr key={b.id}>
                    <AdminTd>
                      <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{b.listing_type || 'Booking'}</div>
                      <div style={{ fontSize: 11, color: A.muted }}>{b.sName} → {b.pName}</div>
                    </AdminTd>
                    <AdminTd><span style={{ fontWeight: 700, color: A.cyan }}>{b.total_price != null ? `$${b.total_price}` : '—'}</span></AdminTd>
                    <AdminTd><AdminBadge status={b.status || 'unknown'} /></AdminTd>
                  </AdminTr>
                ))}
              </tbody>
            </AdminTable>
          )}
        </AdminCard>
      </div>

      {/* LISTINGS CHART */}
      <AdminCard padding={22}>
        <div style={{ fontWeight: 700, color: A.text, fontSize: 13, marginBottom: 18, letterSpacing: -0.2 }}>Live listings</div>
        {!ready ? <AdminLoading /> :
        listing.every(l => l.n === 0)
          ? <AdminEmpty title="No listings yet" desc="This fills in as vendors post listings." />
          : listing.map(l => (
            <div key={l.label} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: A.light }}>{l.label}</span>
                <span style={{ color: A.text, fontWeight: 700 }}>{l.n}</span>
              </div>
              <div style={{ height: 5, background: 'rgba(18,36,28,0.05)', borderRadius: 100, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(l.n / maxL) * 100}%`, background: l.color, borderRadius: 100 }} />
              </div>
            </div>
          ))
        }
      </AdminCard>
    </AdminLayout>
  );
}

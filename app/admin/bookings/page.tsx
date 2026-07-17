'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { AdminStat, AdminCard, AdminCardHead, AdminTable, AdminTh, AdminTd, AdminTr, AdminBadge, AdminEmpty, AdminLoading, AdminSearchBar, A } from '@/components/admin/AdminUI';
import { createClient } from '@/lib/supabase/client';

const BK_CalIcon    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const BK_ClockIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const BK_CheckIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const BK_FlagIcon   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>;
const BK_DollarIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const BK_XIcon      = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const BK_FoodIcon   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>;
const BK_RoomIcon   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const BK_SvcIcon    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>;
const BK_ListingIcon = ({ t }: { t: string }) => t === 'tiffin' ? <BK_FoodIcon /> : t === 'room' ? <BK_RoomIcon /> : <BK_SvcIcon />;

export default function AdminBookings() {
  const [rows,  setRows]  = useState<any[]>([]);
  const [ready, setReady] = useState(false);
  const [q, setQ]         = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    (async () => {
      const sb = createClient();
      const { data: bk } = await sb.from('bookings').select('*').order('created_at', { ascending: false }).limit(200);
      const list = bk || [];
      const ids = Array.from(new Set([...list.map((b: any) => b.student_id), ...list.map((b: any) => b.provider_id)].filter(Boolean)));
      const names: Record<string, string> = {};
      if (ids.length) {
        const { data } = await sb.from('users').select('id,full_name,email').in('id', ids);
        (data || []).forEach((u: any) => (names[u.id] = u.full_name || u.email || '—'));
      }
      setRows(list.map((b: any) => ({ ...b, sName: names[b.student_id] || '—', pName: names[b.provider_id] || '—' })));
      setReady(true);
    })();
  }, []);

  const count = (s?: string) => s ? rows.filter(r => r.status === s).length : rows.length;
  const revenue = rows.filter(r => r.status === 'completed').reduce((a, b) => a + (Number(b.total_price) || 0), 0);

  const visible = rows.filter(r => {
    const okStatus = statusFilter === 'all' || r.status === statusFilter;
    const hay = `${r.sName} ${r.pName} ${r.listing_type || ''}`.toLowerCase();
    return okStatus && (!q || hay.includes(q.toLowerCase()));
  });

  const statusSel = (
    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
      style={{ height: 36, padding: '0 12px', background: A.card, border: `1px solid ${A.border}`, borderRadius: 9, color: A.light, fontSize: 13, cursor: 'pointer', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
      <option value="all">All statuses</option>
      <option value="pending">Pending</option>
      <option value="confirmed">Confirmed</option>
      <option value="completed">Completed</option>
      <option value="cancelled">Cancelled</option>
    </select>
  );


  return (
    <AdminLayout title="Bookings">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(145px,1fr))', gap: 12, marginBottom: 22 }}>
        <AdminStat label="Total"       value={count()}              icon={<BK_CalIcon />}     accent={A.cyan}  ready={ready} />
        <AdminStat label="Pending"     value={count('pending')}     icon={<BK_ClockIcon />}   accent={A.amber} ready={ready} />
        <AdminStat label="Confirmed"   value={count('confirmed')}   icon={<BK_CheckIcon />}   accent={A.cyan}  ready={ready} />
        <AdminStat label="Completed"   value={count('completed')}   icon={<BK_FlagIcon />}    accent={A.green} ready={ready} />
        <AdminStat label="Revenue"     value={`$${revenue.toLocaleString()}`} icon={<BK_DollarIcon />} accent={A.green} ready={ready} />
        <AdminStat label="Cancelled"   value={count('cancelled')}   icon={<BK_XIcon />}       accent={A.red}   ready={ready} />
      </div>

      <AdminCard>
        <AdminCardHead title={`All bookings${ready ? ` (${visible.length})` : ''}`} />
        <AdminSearchBar value={q} onChange={setQ} placeholder="Search student, provider or type…" right={statusSel} />

        {!ready ? <AdminLoading /> :
        visible.length === 0 ? <AdminEmpty title="No bookings found" desc="They appear here once students start booking services." /> : (
          <AdminTable>
            <thead>
              <tr>
                <AdminTh>Type</AdminTh>
                <AdminTh>Student → Provider</AdminTh>
                <AdminTh>Date</AdminTh>
                <AdminTh>Amount</AdminTh>
                <AdminTh>Status</AdminTh>
              </tr>
            </thead>
            <tbody>
              {visible.map(r => (
                <AdminTr key={r.id}>
                  <AdminTd>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ display: 'inline-flex', color: A.muted }}><BK_ListingIcon t={r.listing_type} /></span>
                      <span style={{ textTransform: 'capitalize', fontSize: 13, fontWeight: 600 }}>{r.listing_type || 'Booking'}</span>
                    </div>
                  </AdminTd>
                  <AdminTd>
                    <span style={{ color: A.light }}>{r.sName}</span>
                    <span style={{ color: A.muted, margin: '0 6px' }}>→</span>
                    <span style={{ color: A.light }}>{r.pName}</span>
                  </AdminTd>
                  <AdminTd muted>{r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}</AdminTd>
                  <AdminTd><span style={{ fontWeight: 700, color: A.cyan }}>{r.total_price != null ? `$${r.total_price}` : '—'}</span></AdminTd>
                  <AdminTd><AdminBadge status={r.status || 'unknown'} /></AdminTd>
                </AdminTr>
              ))}
            </tbody>
          </AdminTable>
        )}
      </AdminCard>
    </AdminLayout>
  );
}

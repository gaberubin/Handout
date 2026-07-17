'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { AdminCard, AdminCardHead, AdminTable, AdminTh, AdminTd, AdminTr, AdminEmpty, AdminLoading, AdminSearchBar, AdminTabBar, AdminBtn, A } from '@/components/admin/AdminUI';
import { createClient } from '@/lib/supabase/client';

const MRoomIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const MFoodIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>;
const MSvcIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>;
const MStarIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const MStarFill  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="#E08A1E" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const MStarEmpty = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="rgba(18,36,28,0.12)" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const MGridIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>;

type Kind = 'all' | 'room' | 'tiffin' | 'service' | 'reviews';

export default function AdminModeration() {
  const [rows,    setRows]    = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [ready,   setReady]   = useState(false);
  const [tab,     setTab]     = useState<Kind>('all');
  const [q,       setQ]       = useState('');

  useEffect(() => {
    (async () => {
      const sb = createClient();
      const [{ data: rm }, { data: tf }, { data: sv }] = await Promise.all([
        sb.from('roommate_listings').select('id,title,location,created_at,user_id,is_active'),
        sb.from('tiffin_listings').select('id,name,location,created_at,user_id,is_active'),
        sb.from('service_listings').select('id,title,location,created_at,user_id,is_active'),
      ]);
      const all = [
        ...(rm || []).map((r: any) => ({ ...r, kind: 'room',    label: r.title || 'Room listing', table: 'roommate_listings', Icon: MRoomIcon })),
        ...(tf || []).map((r: any) => ({ ...r, kind: 'tiffin',  label: r.name  || 'Food listing', table: 'tiffin_listings',   Icon: MFoodIcon })),
        ...(sv || []).map((r: any) => ({ ...r, kind: 'service', label: r.title || 'Service',       table: 'service_listings',  Icon: MSvcIcon  })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      const uids = Array.from(new Set(all.map(r => r.user_id).filter(Boolean)));
      const names: Record<string, string> = {};
      if (uids.length) {
        const { data } = await sb.from('users').select('id,full_name,email').in('id', uids);
        (data || []).forEach((u: any) => (names[u.id] = u.full_name || u.email || '—'));
      }
      setRows(all.map(r => ({ ...r, owner: names[r.user_id] || '—' })));

      // Load reviews
      const { data: rv } = await sb.from('reviews').select('id,rating,comment,created_at,reviewer_id,reviewee_id').order('created_at', { ascending: false });
      const rvUids = Array.from(new Set([...(rv||[]).map((r:any)=>r.reviewer_id), ...(rv||[]).map((r:any)=>r.reviewee_id)].filter(Boolean)));
      const rvNames: Record<string,string> = {};
      if (rvUids.length) {
        const { data: us } = await sb.from('users').select('id,full_name,email').in('id', rvUids);
        (us||[]).forEach((u:any) => { rvNames[u.id] = u.full_name || u.email || '—'; });
      }
      setReviews((rv||[]).map((r:any) => ({ ...r, reviewerName: rvNames[r.reviewer_id]||'—', vendorName: rvNames[r.reviewee_id]||'—' })));
      setReady(true);
    })();
  }, []);

  async function remove(r: any) {
    if (!confirm(`Remove "${r.label}"?\n\nThe owner keeps their account — only this listing is deleted.`)) return;
    const { error } = await createClient().from(r.table).delete().eq('id', r.id);
    if (error) { alert(error.message); return; }
    setRows(prev => prev.filter(x => !(x.id === r.id && x.table === r.table)));
  }

  async function deleteReview(id: string) {
    if (!confirm('Delete this review? This cannot be undone.')) return;
    const { error } = await createClient().from('reviews').delete().eq('id', id);
    if (error) { alert(error.message); return; }
    setReviews(prev => prev.filter(r => r.id !== id));
  }

  const byKind   = (k: string) => k === 'all' ? rows : rows.filter(r => r.kind === k);
  const visible  = byKind(tab).filter(r => {
    if (!q) return true;
    return `${r.label} ${r.owner} ${r.location || ''}`.toLowerCase().includes(q.toLowerCase());
  });
  const visibleReviews = reviews.filter(r => {
    if (!q) return true;
    return `${r.reviewerName} ${r.vendorName} ${r.comment || ''}`.toLowerCase().includes(q.toLowerCase());
  });

  const tabs = [
    { key: 'all',     label: `All (${rows.length})` },
    { key: 'room',    label: `Rooms (${byKind('room').length})` },
    { key: 'tiffin',  label: `Food (${byKind('tiffin').length})` },
    { key: 'service', label: `Services (${byKind('service').length})` },
    { key: 'reviews', label: `Reviews (${reviews.length})` },
  ];

  return (
    <AdminLayout title="Moderation">
      <p style={{ fontSize: 13, color: A.muted, marginBottom: 18 }}>
        Every live listing on the platform. Remove anything that violates the rules.
      </p>

      <AdminTabBar tabs={tabs} active={tab} onChange={k => setTab(k as Kind)} />

      <AdminCard>
        <AdminSearchBar value={q} onChange={setQ} placeholder={tab === 'reviews' ? 'Search by reviewer, vendor or comment…' : 'Search by title, owner or location…'} />

        {!ready ? <AdminLoading /> : tab === 'reviews' ? (
          visibleReviews.length === 0 ? (
            <AdminEmpty icon={<MStarIcon />} title="No reviews found" desc={reviews.length === 0 ? 'No reviews have been submitted yet.' : 'Try adjusting your search.'} />
          ) : (
            <>
              <AdminTable>
                <thead>
                  <tr>
                    <AdminTh>Reviewer</AdminTh>
                    <AdminTh>Vendor</AdminTh>
                    <AdminTh>Rating</AdminTh>
                    <AdminTh>Comment</AdminTh>
                    <AdminTh>Date</AdminTh>
                    <AdminTh right>Action</AdminTh>
                  </tr>
                </thead>
                <tbody>
                  {visibleReviews.map(r => (
                    <AdminTr key={r.id}>
                      <AdminTd><span style={{ color: A.light }}>{r.reviewerName}</span></AdminTd>
                      <AdminTd><span style={{ color: A.light }}>{r.vendorName}</span></AdminTd>
                      <AdminTd>
                        <span style={{ display: 'flex', gap: 1 }}>{Array.from({ length: 5 }).map((_, i) => <span key={i} style={{ display: 'inline-flex' }}>{i < r.rating ? <MStarFill /> : <MStarEmpty />}</span>)}</span>
                        <span style={{ color: A.muted, fontSize: 11, marginLeft: 4 }}>{r.rating}/5</span>
                      </AdminTd>
                      <AdminTd muted>
                        <span style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{r.comment || '—'}</span>
                      </AdminTd>
                      <AdminTd muted>{r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}</AdminTd>
                      <AdminTd right>
                        <AdminBtn variant="danger" onClick={() => deleteReview(r.id)}>Delete</AdminBtn>
                      </AdminTd>
                    </AdminTr>
                  ))}
                </tbody>
              </AdminTable>
              <div style={{ padding: '10px 20px', borderTop: `1px solid ${A.border}`, fontSize: 12, color: A.muted }}>
                {visibleReviews.length} review{visibleReviews.length !== 1 ? 's' : ''}
              </div>
            </>
          )
        ) : visible.length === 0 ? (
          <AdminEmpty icon={<MGridIcon />} title="No listings found" desc={rows.length === 0 ? 'No listings have been posted yet.' : 'Try adjusting your search or filter.'} />
        ) : (
          <>
            <AdminTable>
              <thead>
                <tr>
                  <AdminTh>Listing</AdminTh>
                  <AdminTh>Owner</AdminTh>
                  <AdminTh>Location</AdminTh>
                  <AdminTh>Posted</AdminTh>
                  <AdminTh right>Action</AdminTh>
                </tr>
              </thead>
              <tbody>
                {visible.map(r => (
                  <AdminTr key={r.table + r.id}>
                    <AdminTd>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(18,36,28,0.05)', border: `1px solid ${A.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                          <span style={{ display: 'inline-flex', color: A.muted }}><r.Icon /></span>
                        </div>
                        <div style={{ fontWeight: 600, fontSize: 13, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label}</div>
                      </div>
                    </AdminTd>
                    <AdminTd><span style={{ color: A.light }}>{r.owner}</span></AdminTd>
                    <AdminTd muted>{r.location || '—'}</AdminTd>
                    <AdminTd muted>{r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}</AdminTd>
                    <AdminTd right>
                      <AdminBtn variant="danger" onClick={() => remove(r)}>Remove</AdminBtn>
                    </AdminTd>
                  </AdminTr>
                ))}
              </tbody>
            </AdminTable>
            <div style={{ padding: '10px 20px', borderTop: `1px solid ${A.border}`, fontSize: 12, color: A.muted }}>
              {visible.length} listing{visible.length !== 1 ? 's' : ''}
            </div>
          </>
        )}
      </AdminCard>
    </AdminLayout>
  );
}

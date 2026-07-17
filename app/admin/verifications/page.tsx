'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { AdminCard, AdminCardHead, AdminBadge, AdminAvatar, AdminEmpty, AdminLoading, AdminTabBar, AdminBtn, A } from '@/components/admin/AdminUI';
import { createClient } from '@/lib/supabase/client';

const VRoleIcon  = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const VPhoneIcon = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.38 2 2 0 0 1 3.58 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.08 6.08l1.02-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const VPinIcon   = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const VCardIcon  = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>;
const VCalIcon   = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const VSearchIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const VCheckIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;

export default function AdminVerifications() {
  const [rows,    setRows]    = useState<any[]>([]);
  const [ready,   setReady]   = useState(false);
  const [tab,     setTab]     = useState<'pending' | 'all'>('pending');
  const [viewing, setViewing] = useState<string | null>(null);

  async function load() {
    const { data } = await createClient()
      .from('verifications')
      .select('*, users(full_name, email, role, country, country_code, phone, city, state, zip, address)')
      .order('submitted_at', { ascending: false });
    setRows(data || []);
    setReady(true);
  }
  useEffect(() => { load(); }, []);

  async function decide(v: any, status: 'approved' | 'rejected') {
    let notes: string | null = null;
    if (status === 'rejected') { notes = prompt('Reason for rejection (shown to the user):') || 'Details did not match.'; }
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    const [e1, e2] = await Promise.all([
      sb.from('verifications').update({ status, notes, reviewed_at: new Date().toISOString(), reviewed_by: user?.id }).eq('id', v.id).then(r => r.error),
      sb.from('users').update({ verification_status: status, is_verified: status === 'approved' }).eq('id', v.user_id).then(r => r.error),
    ]);
    if (e1 || e2) { alert('Update failed: ' + (e1 || e2)?.message); return; }
    setRows(prev => prev.map(r => r.id === v.id ? { ...r, status, notes } : r));
  }

  async function viewDoc(path: string | null, label: string, key: string) {
    if (!path) { alert(`No ${label} on file.`); return; }
    setViewing(key);
    const { data, error } = await createClient().storage.from('id-documents').createSignedUrl(path, 120);
    setViewing(null);
    if (error || !data) { alert(`Could not open ${label}: ` + (error?.message || 'no file')); return; }
    window.open(data.signedUrl, '_blank');
  }

  const pendingCount = rows.filter(r => r.status === 'pending').length;
  const visible      = tab === 'pending' ? rows.filter(r => r.status === 'pending') : rows;

  return (
    <AdminLayout title="Verifications">
      <AdminTabBar
        tabs={[
          { key: 'pending', label: `Pending (${pendingCount})` },
          { key: 'all',     label: `All (${rows.length})` },
        ]}
        active={tab}
        onChange={k => setTab(k as any)}
      />

      {!ready ? <AdminLoading /> :
      visible.length === 0 ? (
        <AdminCard padding={0}>
          <AdminEmpty icon={<VCheckIcon />} title={tab === 'pending' ? 'No pending verifications' : 'No verifications yet'} desc="All caught up — nothing awaiting review." />
        </AdminCard>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(310px,1fr))', gap: 14 }}>
          {visible.map(v => {
            const u = v.users || {};
            return (
              <AdminCard key={v.id} padding={0}>
                {/* Header */}
                <div style={{ padding: '16px 18px', borderBottom: `1px solid ${A.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <AdminAvatar name={u.full_name} email={u.email} size={38} color={v.status === 'approved' ? A.green : v.status === 'rejected' ? A.rose : A.amber} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: A.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.full_name || '—'}</div>
                    <div style={{ fontSize: 11, color: A.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                  </div>
                  <AdminBadge status={v.status} />
                </div>

                {/* Details */}
                <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {[
                    { Icon: VRoleIcon,  val: u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1) : '—' },
                    { Icon: VPhoneIcon, val: [u.country_code, u.phone].filter(Boolean).join(' ') || '—' },
                    { Icon: VPinIcon,   val: [u.address, u.city, u.state, u.zip, u.country].filter(Boolean).join(', ') || '—' },
                    { Icon: VCardIcon,  val: [v.id_type, v.id_number].filter(Boolean).join(': ') || '—' },
                    ...(v.submitted_at ? [{ Icon: VCalIcon, val: new Date(v.submitted_at).toLocaleDateString() }] : []),
                  ].map((row, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, alignItems: 'flex-start' }}>
                      <span style={{ flexShrink: 0, display: 'inline-flex', color: A.muted }}><row.Icon /></span>
                      <span style={{ color: A.light, lineHeight: 1.5 }}>{row.val}</span>
                    </div>
                  ))}
                  {v.notes && (
                    <div style={{ marginTop: 4, padding: '8px 10px', background: `${A.rose}10`, border: `1px solid ${A.rose}25`, borderRadius: 8, fontSize: 12, color: A.rose }}>
                      Note: {v.notes}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ padding: '12px 18px', borderTop: `1px solid ${A.border}`, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <AdminBtn variant="ghost" onClick={() => viewDoc(v.id_doc_path, 'ID card', v.id + ':id')} disabled={viewing === v.id + ':id'}>
                    {viewing === v.id + ':id' ? 'Opening…' : <span style={{ display:'inline-flex', alignItems:'center', gap:5 }}><VSearchIcon /> View ID</span>}
                  </AdminBtn>
                  {v.selfie_path && (
                    <AdminBtn variant="ghost" onClick={() => viewDoc(v.selfie_path, 'selfie', v.id + ':selfie')} disabled={viewing === v.id + ':selfie'}>
                      {viewing === v.id + ':selfie' ? 'Opening…' : <span style={{ display:'inline-flex', alignItems:'center', gap:5 }}><VSearchIcon /> View Selfie</span>}
                    </AdminBtn>
                  )}
                  {v.status !== 'approved' && (
                    <AdminBtn variant="primary" onClick={() => decide(v, 'approved')}>Approve</AdminBtn>
                  )}
                  {v.status !== 'rejected' && (
                    <AdminBtn variant="danger" onClick={() => decide(v, 'rejected')}>Reject</AdminBtn>
                  )}
                </div>
              </AdminCard>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}

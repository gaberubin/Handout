'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { AdminStat, AdminCard, AdminCardHead, AdminTable, AdminTh, AdminTd, AdminTr, AdminAvatar, AdminBadge, RoleBadge, AdminEmpty, AdminLoading, AdminSearchBar, AdminBtn, A } from '@/components/admin/AdminUI';
import { createClient } from '@/lib/supabase/client';

const US_PersonIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const US_CapIcon    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>;
const US_BriefIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
const US_LockIcon   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;

export default function AdminUsersPage() {
  const [users, setUsers]         = useState<any[]>([]);
  const [ready, setReady]         = useState(false);
  const [q, setQ]                 = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  async function load() {
    const { data } = await createClient().from('users').select('*').order('created_at', { ascending: false });
    setUsers(data || []);
    setReady(true);
  }
  useEffect(() => { load(); }, []);

  async function remove(id: string, name: string) {
    if (!confirm(`Delete ${name || 'this user'} and all their data? This cannot be undone.`)) return;
    const { error } = await createClient().from('users').delete().eq('id', id);
    if (error) { alert('Delete failed: ' + error.message); return; }
    setUsers(prev => prev.filter(u => u.id !== id));
  }

  async function toggleVerify(u: any) {
    const next = !u.is_verified;
    const { error } = await createClient().from('users').update({ is_verified: next, verification_status: next ? 'approved' : 'pending' }).eq('id', u.id);
    if (error) { alert('Update failed: ' + error.message); return; }
    setUsers(prev => prev.map(x => x.id === u.id ? { ...x, is_verified: next } : x));
  }

  const students  = users.filter(u => u.role === 'student').length;
  const vendors   = users.filter(u => u.role === 'vendor' || u.role === 'provider').length;
  const unverified = users.filter(u => !u.is_verified).length;

  const visible = users.filter(u => {
    const okRole = roleFilter === 'all' || u.role === roleFilter;
    const hay = `${u.full_name || ''} ${u.email || ''}`.toLowerCase();
    return okRole && (!q || hay.includes(q.toLowerCase()));
  });

  const filterSelect = (
    <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
      style={{ height: 36, padding: '0 12px', background: A.card, border: `1px solid ${A.border}`, borderRadius: 9, color: A.light, fontSize: 13, cursor: 'pointer', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
      <option value="all">All roles</option>
      <option value="student">Student</option>
      <option value="vendor">Vendor</option>
      <option value="admin">Admin</option>
    </select>
  );

  return (
    <AdminLayout title="Users">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 22 }}>
        <AdminStat label="Total users"           value={ready ? users.length : 0}  icon={<US_PersonIcon />} accent={A.cyan}  ready={ready} />
        <AdminStat label="Students"              value={ready ? students : 0}       icon={<US_CapIcon />}    accent={A.cyan}  ready={ready} />
        <AdminStat label="Vendors"               value={ready ? vendors : 0}        icon={<US_BriefIcon />}  accent={A.amber} ready={ready} />
        <AdminStat label="Pending verification"  value={ready ? unverified : 0}     icon={<US_LockIcon />}   accent={A.red}   ready={ready} />
      </div>

      <AdminCard>
        <AdminSearchBar value={q} onChange={setQ} placeholder="Search by name or email…" right={filterSelect} />

        {!ready ? <AdminLoading /> :
        visible.length === 0 ? <AdminEmpty title="No users found" desc="Try adjusting your search or filter." /> : (
          <AdminTable>
            <thead>
              <tr>
                <AdminTh>User</AdminTh>
                <AdminTh>Role</AdminTh>
                <AdminTh>Status</AdminTh>
                <AdminTh>Joined</AdminTh>
                <AdminTh right>Actions</AdminTh>
              </tr>
            </thead>
            <tbody>
              {visible.map(u => (
                <AdminTr key={u.id}>
                  <AdminTd>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <AdminAvatar name={u.full_name} email={u.email} size={34} color={u.role === 'admin' ? A.red : A.cyan} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{u.full_name || '—'}</div>
                        <div style={{ fontSize: 11, color: A.muted }}>{u.email}</div>
                      </div>
                    </div>
                  </AdminTd>
                  <AdminTd><RoleBadge role={u.role || '—'} /></AdminTd>
                  <AdminTd><AdminBadge status={u.is_verified ? 'approved' : 'pending'} label={u.is_verified ? 'Verified' : 'Pending'} /></AdminTd>
                  <AdminTd muted>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</AdminTd>
                  <AdminTd right>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <AdminBtn variant="ghost" onClick={() => toggleVerify(u)}>
                        {u.is_verified ? 'Unverify' : 'Verify'}
                      </AdminBtn>
                      <AdminBtn variant="danger" onClick={() => remove(u.id, u.full_name)}>Delete</AdminBtn>
                    </div>
                  </AdminTd>
                </AdminTr>
              ))}
            </tbody>
          </AdminTable>
        )}

        {ready && visible.length > 0 && (
          <div style={{ padding: '10px 20px', borderTop: `1px solid ${A.border}`, fontSize: 12, color: A.muted }}>
            {visible.length} of {users.length} user{users.length !== 1 ? 's' : ''}
          </div>
        )}
      </AdminCard>
    </AdminLayout>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { A } from '@/components/admin/AdminUI';
import { createClient } from '@/lib/supabase/client';

const STATUS_COLOR: Record<string, string> = {
  pending: '#B5761A', assigned: '#12A150', confirmed: '#12A150', completed: '#0F8A44', cancelled: '#C25B4E',
};
const STATUS_BG: Record<string, string> = {
  pending: '#FDF0DC', assigned: '#E7F1EA', confirmed: '#E7F1EA', completed: '#E7F1EA', cancelled: '#FBEDE9',
};

export default function AdminWelcomeRequests() {
  const [rows, setRows] = useState<any[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [hosts, setHosts] = useState<any[]>([]);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<'pending' | 'assigned' | 'all'>('pending');
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    const sb = createClient();
    const { data } = await sb.from('welcome_requests').select('*').order('created_at', { ascending: false }).limit(300);
    const list = data || [];
    setRows(list);
    // resolve student + host names
    const ids = Array.from(new Set([...list.map(r => r.student_id), ...list.map(r => r.assigned_host_id)].filter(Boolean))) as string[];
    const nm: Record<string, string> = {};
    if (ids.length) {
      const { data: us } = await sb.from('users').select('id, full_name, email').in('id', ids);
      (us || []).forEach((u: any) => { nm[u.id] = u.full_name || u.email || '—'; });
    }
    setNames(nm);
    // hosts to assign = vendor / provider users
    const { data: hs } = await sb.from('users').select('id, full_name, email, role').in('role', ['vendor', 'provider']);
    setHosts(hs || []);
    setReady(true);
  }
  useEffect(() => { load(); }, []);

  async function assign(id: string, hostId: string) {
    if (!hostId) return;
    setBusy(id);
    const sb = createClient();
    const { error } = await sb.from('welcome_requests').update({ assigned_host_id: hostId, status: 'assigned' }).eq('id', id);
    setBusy(null);
    if (error) { alert('Could not assign: ' + error.message); return; }
    setRows(prev => prev.map(r => r.id === id ? { ...r, assigned_host_id: hostId, status: 'assigned' } : r));
  }
  async function setStatus(id: string, status: string) {
    setBusy(id);
    const sb = createClient();
    const { error } = await sb.from('welcome_requests').update({ status }).eq('id', id);
    setBusy(null);
    if (error) { alert('Could not update: ' + error.message); return; }
    setRows(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  }

  const visible = rows.filter(r => tab === 'all' ? true : tab === 'pending' ? r.status === 'pending' : r.status !== 'pending' && r.status !== 'cancelled');
  const pendingCount = rows.filter(r => r.status === 'pending').length;

  const tabBtn = (k: typeof tab): React.CSSProperties => ({
    padding: '7px 16px', borderRadius: 100, fontSize: 13, fontWeight: 700, cursor: 'pointer',
    background: tab === k ? A.green : 'rgba(18,36,28,0.05)', color: tab === k ? '#fff' : A.light,
    border: tab === k ? 'none' : `1px solid ${A.border}`,
  });

  return (
    <AdminLayout title="Welcome Requests">
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button style={tabBtn('pending')} onClick={() => setTab('pending')}>Pending{pendingCount ? ` (${pendingCount})` : ''}</button>
        <button style={tabBtn('assigned')} onClick={() => setTab('assigned')}>Assigned</button>
        <button style={tabBtn('all')} onClick={() => setTab('all')}>All</button>
      </div>

      {!ready ? (
        <div style={{ color: A.muted }}>Loading requests…</div>
      ) : visible.length === 0 ? (
        <div style={{ background: A.card, border: `1px dashed ${A.border}`, borderRadius: 16, padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 30, marginBottom: 8 }}>✈️</div>
          <p style={{ fontSize: 15, color: A.text, fontWeight: 700, margin: '0 0 6px' }}>
            {tab === 'pending' ? 'No pending requests.' : tab === 'assigned' ? 'Nothing assigned yet.' : 'No welcome requests yet.'}
          </p>
          <p style={{ fontSize: 13, color: A.muted, margin: 0 }}>When students request a welcome package, it appears here to assign a host.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {visible.map(r => (
            <div key={r.id} style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 14, padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: A.text }}>{r.package_title || 'Welcome package'}</span>
                    {r.package_tier && <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', padding: '2px 8px', borderRadius: 100, background: 'rgba(18,161,80,0.1)', color: '#0F8A44' }}>{r.package_tier}</span>}
                    <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'capitalize', padding: '3px 10px', borderRadius: 100, background: STATUS_BG[r.status] || '#EDEFEE', color: STATUS_COLOR[r.status] || A.muted }}>{r.status}</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: A.muted, marginTop: 4 }}>
                    {names[r.student_id] || 'Student'} · requested {new Date(r.created_at).toLocaleDateString()}
                  </div>
                </div>
                {r.package_price != null && <span style={{ fontSize: 18, fontWeight: 800, color: A.green }}>${r.package_price}</span>}
              </div>

              {/* Arrival details grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '8px 20px', fontSize: 13, color: A.light, marginBottom: 14 }}>
                <Detail label="Arriving at" value={[r.arrival_airport, r.arrival_date, r.arrival_time].filter(Boolean).join(' · ')} />
                {r.flight_number && <Detail label="Flight" value={r.flight_number} />}
                <Detail label="Destination" value={[r.destination_city, r.destination_address].filter(Boolean).join(' — ')} />
                {r.university && <Detail label="University" value={r.university} />}
                <Detail label="Community" value={r.community_pref} />
                <Detail label="Travellers" value={String(r.num_people || 1)} />
                {r.dietary && <Detail label="Dietary" value={r.dietary} />}
                <Detail label="Phone" value={r.contact_phone} />
                {r.notes && <Detail label="Notes" value={r.notes} full />}
              </div>

              {/* Assignment controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', borderTop: `1px solid ${A.border}`, paddingTop: 12 }}>
                {r.assigned_host_id ? (
                  <span style={{ fontSize: 13, color: A.text, fontWeight: 600 }}>
                    Host: <span style={{ color: '#0F8A44' }}>{names[r.assigned_host_id] || 'Assigned'}</span>
                  </span>
                ) : (
                  <span style={{ fontSize: 13, color: A.muted }}>No host assigned</span>
                )}
                <select
                  defaultValue=""
                  disabled={busy === r.id}
                  onChange={e => assign(r.id, e.target.value)}
                  style={{ height: 36, padding: '0 12px', borderRadius: 8, border: `1px solid ${A.border}`, background: '#fff', color: A.text, fontSize: 13, cursor: 'pointer', marginLeft: 'auto' }}>
                  <option value="" disabled>{r.assigned_host_id ? 'Reassign host…' : 'Assign a host…'}</option>
                  {hosts.map(h => <option key={h.id} value={h.id}>{h.full_name || h.email}</option>)}
                </select>
                {r.status !== 'completed' && r.status !== 'cancelled' && (
                  <>
                    {r.status === 'assigned' && <button onClick={() => setStatus(r.id, 'completed')} disabled={busy === r.id} style={btn('#E7F1EA', '#0F8A44')}>Mark completed</button>}
                    <button onClick={() => setStatus(r.id, 'cancelled')} disabled={busy === r.id} style={btn('transparent', '#C25B4E', true)}>Cancel</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

function Detail({ label, value, full }: { label: string; value: string; full?: boolean }) {
  if (!value) return null;
  return (
    <div style={{ gridColumn: full ? '1 / -1' : undefined }}>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: A.muted, marginBottom: 2 }}>{label}</div>
      <div style={{ color: A.text }}>{value}</div>
    </div>
  );
}

const btn = (bg: string, color: string, outline?: boolean): React.CSSProperties => ({
  height: 36, padding: '0 14px', borderRadius: 100, fontSize: 13, fontWeight: 700, cursor: 'pointer',
  background: bg, color, border: outline ? `1px solid ${color}55` : 'none',
});

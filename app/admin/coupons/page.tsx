'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { A, AdminBadge, AdminBtn, AdminEmpty, AdminLoading } from '@/components/admin/AdminUI';
import { createClient } from '@/lib/supabase/client';

const PlusIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const TrashIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>;

const input: React.CSSProperties = {
  width: '100%', height: 38, padding: '0 12px',
  background: A.bg,
  border: `1px solid rgba(18,36,28,0.09)`,
  borderRadius: 8, fontSize: 13, color: A.text,
  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
};
const label: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 600,
  color: A.muted, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5,
};
const fieldGroup = (span?: boolean): React.CSSProperties => ({
  display: 'flex', flexDirection: 'column',
  ...(span ? { gridColumn: '1 / -1' } : {}),
});

const EMPTY = { code: '', type: 'percent', value: '', description: '', min_order: '0', max_discount: '', expires_at: '' };

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [ready, setReady]     = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [form, setForm]       = useState({ ...EMPTY });
  const F = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: k === 'code' ? e.target.value.toUpperCase() : e.target.value }));

  async function load() {
    const { data } = await createClient().from('coupons').select('*').order('created_at', { ascending: false });
    setCoupons(data || []);
    setReady(true);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!form.code.trim() || !form.value) return;
    setSaving(true);
    await createClient().from('coupons').insert({
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value: parseFloat(form.value),
      description: form.description.trim() || null,
      min_order: form.min_order ? parseFloat(form.min_order) : 0,
      max_discount: form.max_discount ? parseFloat(form.max_discount) : null,
      expires_at: form.expires_at || null,
      is_active: true,
      usage_count: 0,
    });
    setSaving(false);
    setShowForm(false);
    setForm({ ...EMPTY });
    load();
  }

  async function toggle(id: string, active: boolean) {
    await createClient().from('coupons').update({ is_active: !active }).eq('id', id);
    setCoupons(p => p.map(c => c.id === id ? { ...c, is_active: !active } : c));
  }

  async function remove(id: string) {
    if (!confirm('Delete this coupon?')) return;
    await createClient().from('coupons').delete().eq('id', id);
    setCoupons(p => p.filter(c => c.id !== id));
  }

  const fmtDiscount = (c: any) => c.type === 'percent' ? `${c.value}%` : `$${c.value}`;

  return (
    <AdminLayout title="Coupons">
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: A.text }}>Coupons</h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: A.muted }}>Create and manage platform-wide promo codes</p>
          </div>
          {!showForm && (
            <button onClick={() => setShowForm(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: A.red, border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              <PlusIcon /> New Coupon
            </button>
          )}
        </div>

        {/* Create form */}
        {showForm && (
          <div style={{ background: A.surface, border: `1px solid rgba(18,36,28,0.09)`, borderRadius: 12, padding: '20px 22px', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: A.text }}>New Coupon</p>
              <button onClick={() => { setShowForm(false); setForm({ ...EMPTY }); }}
                style={{ background: 'none', border: 'none', color: A.muted, cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>✕</button>
            </div>

            <div className="rg-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px 16px' }}>
              <div style={fieldGroup()}>
                <label style={label}>Code</label>
                <input style={input} value={form.code} onChange={F('code')} placeholder="SAVE20" maxLength={20} />
              </div>
              <div style={fieldGroup()}>
                <label style={label}>Type</label>
                <select style={input} value={form.type} onChange={F('type')}>
                  <option value="percent">Percentage (%)</option>
                  <option value="fixed">Fixed amount ($)</option>
                </select>
              </div>
              <div style={fieldGroup()}>
                <label style={label}>Value</label>
                <input style={input} type="number" value={form.value} onChange={F('value')} placeholder={form.type === 'percent' ? '10' : '5'} />
              </div>
              <div style={fieldGroup()}>
                <label style={label}>Min Order ($)</label>
                <input style={input} type="number" value={form.min_order} onChange={F('min_order')} placeholder="0" />
              </div>
              <div style={fieldGroup()}>
                <label style={label}>Max Discount ($)</label>
                <input style={input} type="number" value={form.max_discount} onChange={F('max_discount')} placeholder="No cap" />
              </div>
              <div style={fieldGroup()}>
                <label style={label}>Expires At</label>
                <input type="date" value={form.expires_at} onChange={F('expires_at')}
                  style={{ ...input, colorScheme: 'dark' }} />
              </div>
              <div style={fieldGroup(true)}>
                <label style={label}>Description</label>
                <input style={input} value={form.description} onChange={F('description')} placeholder="e.g. 10% off your first order" />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
              <button onClick={save} disabled={saving}
                style={{ padding: '8px 20px', background: A.red, border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, fontFamily: 'inherit' }}>
                {saving ? 'Creating…' : 'Create Coupon'}
              </button>
              <button onClick={() => { setShowForm(false); setForm({ ...EMPTY }); }}
                style={{ padding: '8px 16px', background: 'rgba(18,36,28,0.05)', border: `1px solid rgba(18,36,28,0.09)`, borderRadius: 8, color: A.light, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div style={{ background: A.surface, border: `1px solid rgba(18,36,28,0.09)`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid rgba(18,36,28,0.07)`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: A.text }}>All Coupons <span style={{ color: A.muted, fontWeight: 400 }}>({coupons.length})</span></p>
          </div>

          {!ready ? <AdminLoading /> : coupons.length === 0 ? (
            <AdminEmpty title="No coupons yet — create one above." />
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid rgba(18,36,28,0.07)` }}>
                  {['Code', 'Discount', 'Min Order', 'Uses', 'Expires', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: A.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {coupons.map((c, i) => (
                  <tr key={c.id} style={{ borderBottom: i < coupons.length - 1 ? `1px solid rgba(18,36,28,0.05)` : 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(18,36,28,0.03)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13, color: A.cyan }}>{c.code}</span>
                      {c.description && <p style={{ margin: '2px 0 0', fontSize: 11, color: A.muted }}>{c.description}</p>}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: A.cyan, fontSize: 14 }}>{fmtDiscount(c)}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: A.light }}>{c.min_order > 0 ? `$${c.min_order}` : '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: A.light }}>{c.usage_count || 0}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: A.light }}>
                      {c.expires_at ? new Date(c.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <AdminBadge status={c.is_active ? 'active' : 'inactive'} />
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <button onClick={() => toggle(c.id, c.is_active)}
                          style={{ padding: '5px 12px', borderRadius: 6, border: `1px solid rgba(18,36,28,0.09)`, background: 'rgba(18,36,28,0.04)', color: A.light, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>
                          {c.is_active ? 'Disable' : 'Enable'}
                        </button>
                        <button onClick={() => remove(c.id)}
                          style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid rgba(220,38,38,0.25)`, borderRadius: 6, background: 'rgba(220,38,38,0.06)', color: A.rose, cursor: 'pointer' }}>
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </AdminLayout>
  );
}

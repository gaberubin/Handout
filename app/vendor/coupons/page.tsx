'use client';

import { useEffect, useState } from 'react';
import { VendorShell } from '@/components/layout/VendorShell';
import { createClient } from '@/lib/supabase/client';
import { validateText, validatePrice, validateInt } from '@/lib/validation';

const PlusIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const TagIcon   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
const TrashIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>;

const card: React.CSSProperties = { background: '#FFFFFF', border: '1px solid rgba(18,36,28,0.09)', borderRadius: 16, padding: 22 };
const I: React.CSSProperties = { width: '100%', height: 42, padding: '0 14px', background: 'rgba(18,36,28,0.04)', border: '1px solid rgba(18,36,28,0.12)', borderRadius: 10, color: '#12241C', fontSize: 14, boxSizing: 'border-box' };
const L: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: '#4c6157', display: 'block', marginBottom: 5 };

export default function VendorCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [ready, setReady] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uid, setUid] = useState('');
  const [form, setForm] = useState({ code: '', type: 'percent', value: '', description: '', min_order: '', expires_at: '' });
  const [formErr, setFormErr] = useState('');

  useEffect(() => {
    (async () => {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return;
      setUid(user.id);
      const { data } = await sb.from('coupons').select('*').eq('vendor_id', user.id).order('created_at', { ascending: false });
      setCoupons(data || []);
      setReady(true);
    })();
  }, []);

  async function save() {
    // Validate: code (letters/numbers 3–20), value in range, min order numeric
    const codeErr = validateText(form.code, 'Code', { min: 3, max: 20 });
    const valErr = form.type === 'percent'
      ? validateInt(form.value, 'Percentage', { min: 1, max: 100, required: true })
      : validatePrice(form.value, 'Amount', { min: 1, max: 1000 });
    const minErr = form.min_order.trim() ? validatePrice(form.min_order, 'Min order', { min: 0, max: 100000, required: false }) : '';
    if (codeErr || valErr || minErr) { setFormErr(codeErr || valErr || minErr); return; }
    setFormErr('');
    setSaving(true);
    const sb = createClient();
    await sb.from('coupons').insert({
      code: form.code.trim().toUpperCase(),
      type: form.type, value: parseFloat(form.value),
      description: form.description.trim() || null,
      min_order: form.min_order ? parseFloat(form.min_order) : 0,
      expires_at: form.expires_at || null,
      is_active: true, usage_count: 0, vendor_id: uid,
    });
    setSaving(false);
    setShowForm(false);
    setForm({ code: '', type: 'percent', value: '', description: '', min_order: '', expires_at: '' });
    const sb2 = createClient();
    const { data } = await sb2.from('coupons').select('*').eq('vendor_id', uid).order('created_at', { ascending: false });
    setCoupons(data || []);
  }

  async function toggle(id: string, active: boolean) {
    await createClient().from('coupons').update({ is_active: !active }).eq('id', id);
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, is_active: !active } : c));
  }

  async function remove(id: string) {
    if (!confirm('Delete coupon?')) return;
    await createClient().from('coupons').delete().eq('id', id);
    setCoupons(prev => prev.filter(c => c.id !== id));
  }

  const fmt = (c: any) => c.type === 'percent' ? `${c.value}% off` : `$${c.value} off`;

  return (
    <VendorShell active="Coupons" title="Coupons">
      {() => (
        <div style={{ maxWidth: 700 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
            <p style={{ margin: 0, fontSize: 13, color: '#7d9188' }}>Create discount codes for your listings.</p>
            <button onClick={() => setShowForm(!showForm)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: '#12A150', border: 'none', borderRadius: 100, color: '#ffffff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              <PlusIcon /> New Code
            </button>
          </div>

          {showForm && (
            <div style={{ ...card, marginBottom: 18 }}>
              <p style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: '#12241C', display: 'flex', alignItems: 'center', gap: 6 }}><TagIcon /> Create Discount Code</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={L}>Code</label><input style={I} value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="MYSTORE10" maxLength={20} /></div>
                <div><label style={L}>Type</label>
                  <select style={{ ...I, cursor: 'pointer' }} value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed ($)</option>
                  </select>
                </div>
                <div><label style={L}>Value</label><input style={I} type="number" value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} placeholder={form.type === 'percent' ? '10' : '5'} /></div>
                <div><label style={L}>Min Order ($)</label><input style={I} type="number" value={form.min_order} onChange={e => setForm(p => ({ ...p, min_order: e.target.value }))} placeholder="0" /></div>
                <div><label style={L}>Expires At</label><input style={I} type="date" value={form.expires_at} onChange={e => setForm(p => ({ ...p, expires_at: e.target.value }))} /></div>
                <div><label style={L}>Description</label><input style={I} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Optional description" /></div>
              </div>
              {formErr && <div style={{ fontSize: 12, color: '#C25B4E', fontWeight: 600, marginTop: 12 }}>{formErr}</div>}
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button onClick={save} disabled={saving} style={{ padding: '9px 20px', background: '#12A150', border: 'none', borderRadius: 100, color: '#ffffff', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>{saving ? 'Saving…' : 'Create'}</button>
                <button onClick={() => setShowForm(false)} style={{ padding: '9px 20px', background: 'transparent', border: '1px solid rgba(18,36,28,0.12)', borderRadius: 100, color: '#7d9188', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          )}

          {!ready && <p style={{ color: '#7d9188', fontSize: 14 }}>Loading…</p>}

          {ready && coupons.length === 0 && !showForm && (
            <div style={{ ...card, textAlign: 'center', padding: 40 }}>
              <div style={{ display: 'inline-flex', color: '#7d9188', marginBottom: 10 }}><TagIcon /></div>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#12241C', margin: '0 0 6px' }}>No discount codes yet</p>
              <p style={{ fontSize: 13, color: '#7d9188', margin: 0 }}>Create codes to attract more customers.</p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {coupons.map(c => (
              <div key={c.id} style={{ ...card, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(18,161,80,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#12A150', flexShrink: 0 }}><TagIcon /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 14, color: '#12A150' }}>{c.code}</span>
                    <span style={{ fontSize: 11, background: 'rgba(18,161,80,0.12)', color: '#12A150', borderRadius: 4, padding: '2px 6px', fontWeight: 700 }}>{fmt(c)}</span>
                    <span style={{ fontSize: 10, background: c.is_active ? 'rgba(18,161,80,0.15)' : 'rgba(18,36,28,0.06)', color: c.is_active ? '#12A150' : '#7d9188', borderRadius: 4, padding: '2px 6px', fontWeight: 700 }}>{c.is_active ? 'Active' : 'Off'}</span>
                  </div>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#7d9188' }}>{c.description || '—'} · {c.usage_count || 0} uses</p>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button onClick={() => toggle(c.id, c.is_active)} style={{ padding: '5px 12px', border: '1px solid rgba(18,36,28,0.12)', borderRadius: 8, background: 'transparent', color: '#7d9188', fontSize: 12, cursor: 'pointer' }}>{c.is_active ? 'Disable' : 'Enable'}</button>
                  <button onClick={() => remove(c.id)} style={{ padding: '5px 8px', border: '1px solid rgba(255,100,100,0.25)', borderRadius: 8, background: 'rgba(255,100,100,0.08)', color: '#C25B4E', cursor: 'pointer' }}><TrashIcon /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </VendorShell>
  );
}

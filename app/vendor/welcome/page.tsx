'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { VendorShell } from '@/components/layout/VendorShell';
import { validateText, validateParagraph, validatePrice, validateInt, keepDigits } from '@/lib/validation';

const TIERS = ['basic', 'standard', 'premium', 'custom'] as const;
const COMMUNITIES = ['Any', 'South Indian', 'North Indian', 'Gujarati', 'Punjabi', 'Pakistani', 'Bangladeshi', 'Chinese', 'Korean', 'Vietnamese', 'Filipino', 'Latino', 'African', 'European', 'Middle Eastern'];

const SERVICES: { key: string; label: string }[] = [
  { key: 'airport_pickup',    label: 'Airport pickup' },
  { key: 'dropoff_included',  label: 'Drop-off to apartment' },
  { key: 'grocery_run',       label: 'Grocery run' },
  { key: 'campus_tour',       label: 'Campus tour' },
  { key: 'sim_card_help',     label: 'SIM card setup' },
  { key: 'bank_account_help', label: 'Bank account setup' },
  { key: 'housing_hunt_help', label: 'Housing search help' },
];

const tierColor = (t: string) => t === 'premium' ? '#7C6BD1' : t === 'standard' ? '#12A150' : t === 'basic' ? '#2E7D5B' : '#0E9E8E';

type Form = {
  id?: string;
  title: string; tier: string; community: string; price: string;
  airport_served: string; nights_stay: string; meals_included: string;
  description: string; notes: string;
  airport_pickup: boolean; dropoff_included: boolean; grocery_run: boolean;
  campus_tour: boolean; sim_card_help: boolean; bank_account_help: boolean; housing_hunt_help: boolean;
};

const EMPTY: Form = {
  title: '', tier: 'basic', community: 'Any', price: '',
  airport_served: '', nights_stay: '', meals_included: '',
  description: '', notes: '',
  airport_pickup: false, dropoff_included: false, grocery_run: false,
  campus_tour: false, sim_card_help: false, bank_account_help: false, housing_hunt_help: false,
};

export default function VendorWelcomePage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [ready, setReady] = useState(false);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState('');

  async function load() {
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;
    const { data } = await sb.from('welcome_packages').select('*').eq('host_id', user.id).order('created_at', { ascending: false });
    setPackages(data || []);
    setReady(true);
  }
  useEffect(() => { load(); }, []);

  function set<K extends keyof Form>(k: K, v: Form[K]) {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k as string]) setErrors(e => ({ ...e, [k as string]: '' }));
  }

  function openCreate() { setForm(EMPTY); setErrors({}); setSaveErr(''); setModal(true); }
  function openEdit(p: any) {
    setForm({
      id: p.id, title: p.title || '', tier: p.tier || 'basic', community: p.community || 'Any',
      price: p.price != null ? String(p.price) : '',
      airport_served: p.airport_served || '', nights_stay: p.nights_stay ? String(p.nights_stay) : '',
      meals_included: p.meals_included ? String(p.meals_included) : '',
      description: p.description || '', notes: p.notes || '',
      airport_pickup: !!p.airport_pickup, dropoff_included: !!p.dropoff_included, grocery_run: !!p.grocery_run,
      campus_tour: !!p.campus_tour, sim_card_help: !!p.sim_card_help, bank_account_help: !!p.bank_account_help,
      housing_hunt_help: !!p.housing_hunt_help,
    });
    setErrors({}); setSaveErr(''); setModal(true);
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    e.title = validateText(form.title, 'Title', { min: 3, max: 60 });
    e.price = validatePrice(form.price, 'Price', { min: 1, max: 5000 });
    if (form.airport_pickup) e.airport_served = validateText(form.airport_served, 'Airport', { min: 2, max: 40 });
    e.nights_stay = validateInt(form.nights_stay, 'Nights', { min: 0, max: 60, required: false });
    e.meals_included = validateInt(form.meals_included, 'Meals', { min: 0, max: 200, required: false });
    e.description = validateParagraph(form.description, 'Description', { min: 0, max: 600 });
    e.notes = validateParagraph(form.notes, 'Notes', { max: 400 });
    // require at least one included service so a package isn't empty
    const anyService = SERVICES.some(s => (form as any)[s.key]) || Number(form.nights_stay) > 0 || Number(form.meals_included) > 0;
    if (!anyService) e.services = 'Include at least one service';
    const cleaned = Object.fromEntries(Object.entries(e).filter(([, v]) => v));
    setErrors(cleaned);
    return Object.keys(cleaned).length === 0;
  }

  async function save() {
    if (!validate() || saving) return;
    setSaving(true); setSaveErr('');
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { setSaveErr('Please sign in again.'); setSaving(false); return; }
    const row = {
      host_id: user.id,
      title: form.title.trim(),
      tier: form.tier,
      community: form.community,
      price: Number(form.price),
      airport_served: form.airport_pickup ? form.airport_served.trim() : null,
      nights_stay: form.nights_stay ? Number(form.nights_stay) : 0,
      meals_included: form.meals_included ? Number(form.meals_included) : 0,
      description: form.description.trim() || null,
      notes: form.notes.trim() || null,
      airport_pickup: form.airport_pickup, dropoff_included: form.dropoff_included, grocery_run: form.grocery_run,
      campus_tour: form.campus_tour, sim_card_help: form.sim_card_help, bank_account_help: form.bank_account_help,
      housing_hunt_help: form.housing_hunt_help,
      is_active: true,
    };
    const q = form.id
      ? sb.from('welcome_packages').update(row).eq('id', form.id)
      : sb.from('welcome_packages').insert(row);
    const { error } = await q;
    setSaving(false);
    if (error) { setSaveErr(error.message); return; }
    setModal(false);
    load();
  }

  async function remove(id: string) {
    if (!confirm('Delete this welcome package?')) return;
    await createClient().from('welcome_packages').delete().eq('id', id);
    setPackages(prev => prev.filter(p => p.id !== id));
  }

  return (
    <VendorShell active="Welcome" title="Welcome Packages">
      {() => (
        <div style={{ maxWidth: 900 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            <p style={{ fontSize: 14, color: '#4c6157', margin: 0, maxWidth: 520 }}>
              Host newly-arrived international students — offer airport pickup, a few nights' stay, meals and settle-in help. Create a package and students can request it.
            </p>
            <button onClick={openCreate} style={btnPrimary}>＋ Add welcome package</button>
          </div>

          {!ready ? (
            <p style={{ color: '#7d9188' }}>Loading…</p>
          ) : packages.length === 0 ? (
            <div style={{ background: '#fff', border: '1px dashed rgba(18,36,28,0.14)', borderRadius: 16, padding: 44, textAlign: 'center' }}>
              <div style={{ fontSize: 30, marginBottom: 8 }}>✈️</div>
              <p style={{ fontSize: 15, color: '#12241C', fontWeight: 700, margin: '0 0 6px' }}>No packages yet</p>
              <p style={{ fontSize: 13, color: '#7d9188', margin: '0 0 18px' }}>Create your first welcome package to start hosting students.</p>
              <button onClick={openCreate} style={btnPrimary}>＋ Add welcome package</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
              {packages.map(p => (
                <div key={p.id} style={{ background: '#fff', border: '1px solid rgba(18,36,28,0.09)', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, padding: '4px 10px', borderRadius: 100, background: `${tierColor(p.tier)}22`, color: tierColor(p.tier), textTransform: 'uppercase' }}>{p.tier || 'basic'}</span>
                    <span style={{ fontSize: 22, fontWeight: 800, color: '#12A150', fontFamily: "'Bricolage Grotesque',sans-serif" }}>${p.price}</span>
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: '#12241C', margin: '0 0 4px' }}>{p.title}</h3>
                  <p style={{ fontSize: 12, color: '#7d9188', margin: '0 0 14px' }}>{p.community && p.community !== 'Any' ? `${p.community} · ` : ''}{[p.airport_pickup && 'Airport', p.nights_stay > 0 && `${p.nights_stay}n`, p.meals_included > 0 && `${p.meals_included} meals`].filter(Boolean).join(' · ') || 'Custom'}</p>
                  <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
                    <button onClick={() => openEdit(p)} style={btnOutline}>Edit</button>
                    <button onClick={() => remove(p.id)} style={btnDanger}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {modal && (
            <div style={overlay} onClick={() => setModal(false)}>
              <div style={modalCard} onClick={e => e.stopPropagation()}>
                <h3 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 20, fontWeight: 800, color: '#12241C', margin: '0 0 18px' }}>
                  {form.id ? 'Edit package' : 'New welcome package'}
                </h3>

                <Field label="Title" error={errors.title}>
                  <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Full Landing — Gujarati host" style={inp(errors.title)} maxLength={60} />
                </Field>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field label="Tier">
                    <select value={form.tier} onChange={e => set('tier', e.target.value)} style={inp('')}>
                      {TIERS.map(t => <option key={t} value={t} style={{ textTransform: 'capitalize' }}>{t}</option>)}
                    </select>
                  </Field>
                  <Field label="Community">
                    <select value={form.community} onChange={e => set('community', e.target.value)} style={inp('')}>
                      {COMMUNITIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </Field>
                </div>

                <Field label="Price (USD)" error={errors.price}>
                  <input value={form.price} onChange={e => set('price', e.target.value.replace(/[^\d.]/g, '').slice(0, 8))} inputMode="decimal" placeholder="e.g. 120" style={inp(errors.price)} />
                </Field>

                <div style={{ fontSize: 11, fontWeight: 700, color: '#4c6157', textTransform: 'uppercase', letterSpacing: 0.4, margin: '4px 0 8px' }}>Services included</div>
                {errors.services && <div style={errStyle}>{errors.services}</div>}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                  {SERVICES.map(s => (
                    <button key={s.key} type="button" onClick={() => set(s.key as keyof Form, !(form as any)[s.key] as any)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', textAlign: 'left', fontSize: 13, fontWeight: 600,
                        border: `1.5px solid ${(form as any)[s.key] ? '#12A150' : 'rgba(18,36,28,0.12)'}`,
                        background: (form as any)[s.key] ? 'rgba(18,161,80,0.08)' : '#fff',
                        color: (form as any)[s.key] ? '#0F8A44' : '#4c6157',
                      }}>
                      <span style={{ width: 16, height: 16, borderRadius: 5, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: (form as any)[s.key] ? '#12A150' : 'transparent', border: (form as any)[s.key] ? 'none' : '1.5px solid rgba(18,36,28,0.2)', color: '#fff', fontSize: 11 }}>{(form as any)[s.key] ? '✓' : ''}</span>
                      {s.label}
                    </button>
                  ))}
                </div>

                {form.airport_pickup && (
                  <Field label="Airport(s) served" error={errors.airport_served}>
                    <input value={form.airport_served} onChange={e => set('airport_served', e.target.value)} placeholder="e.g. PHL / EWR" style={inp(errors.airport_served)} maxLength={40} />
                  </Field>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field label="Nights of stay" error={errors.nights_stay}>
                    <input value={form.nights_stay} onChange={e => set('nights_stay', keepDigits(e.target.value, 2))} inputMode="numeric" placeholder="0" style={inp(errors.nights_stay)} />
                  </Field>
                  <Field label="Home-cooked meals" error={errors.meals_included}>
                    <input value={form.meals_included} onChange={e => set('meals_included', keepDigits(e.target.value, 3))} inputMode="numeric" placeholder="0" style={inp(errors.meals_included)} />
                  </Field>
                </div>

                <Field label="Description" error={errors.description}>
                  <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="What's this package about?" style={{ ...inp(errors.description), height: 'auto', resize: 'vertical', fontFamily: 'inherit' }} maxLength={600} />
                </Field>

                <Field label="Additional notes (optional)" error={errors.notes}>
                  <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} placeholder="Anything students should know" style={{ ...inp(errors.notes), height: 'auto', resize: 'vertical', fontFamily: 'inherit' }} maxLength={400} />
                </Field>

                {saveErr && <div style={{ ...errStyle, marginBottom: 12 }}>{saveErr}</div>}

                <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                  <button onClick={() => setModal(false)} style={{ ...btnOutline, flex: 1 }}>Cancel</button>
                  <button onClick={save} disabled={saving} style={{ ...btnPrimary, flex: 1, opacity: saving ? 0.6 : 1 }}>{saving ? 'Saving…' : form.id ? 'Save changes' : 'Create package'}</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </VendorShell>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#4c6157', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</label>
      {children}
      {error && <div style={errStyle}>{error}</div>}
    </div>
  );
}

const inp = (err?: string): React.CSSProperties => ({
  width: '100%', boxSizing: 'border-box', height: 42, padding: '0 13px',
  background: '#F1F7F3', border: `1.5px solid ${err ? '#C25B4E' : 'rgba(18,36,28,0.12)'}`,
  borderRadius: 10, color: '#12241C', fontSize: 14, outline: 'none',
});
const errStyle: React.CSSProperties = { fontSize: 11.5, color: '#C25B4E', marginTop: 5, fontWeight: 600 };
const btnPrimary: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, height: 42, padding: '0 18px', background: '#12A150', color: '#fff', border: 'none', borderRadius: 100, fontSize: 14, fontWeight: 700, cursor: 'pointer' };
const btnOutline: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 1, height: 40, background: '#fff', color: '#12241C', border: '1.5px solid rgba(18,36,28,0.12)', borderRadius: 100, fontSize: 13, fontWeight: 700, cursor: 'pointer' };
const btnDanger: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 1, height: 40, background: '#FBEDE9', color: '#C25B4E', border: 'none', borderRadius: 100, fontSize: 13, fontWeight: 700, cursor: 'pointer' };
const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(18,36,28,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 };
const modalCard: React.CSSProperties = { background: '#fff', borderRadius: 20, padding: 26, width: '100%', maxWidth: 520, maxHeight: '92vh', overflowY: 'auto' };

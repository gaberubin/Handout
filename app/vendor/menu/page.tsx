'use client';

// Vendor → My Food. Lets a vendor create and manage their own tiffin/food
// listings (public.tiffin_listings, guarded by the tl_write RLS policy:
// auth.uid() = user_id).
//
// NOTE: students cannot see these yet — /student/food is still gated behind
// BETA_MODE via GATED_ROUTES in config/features.ts, so listings created here
// stay vendor-side until we flip that flag on.

import { useEffect, useState } from 'react';
import { VendorShell } from '@/components/layout/VendorShell';
import { createClient } from '@/lib/supabase/client';
import { validateText, validateParagraph, validatePrice } from '@/lib/validation';

type Row = {
  id: string; name: string; cuisine: string | null; diet_type: string | null;
  description: string | null; price_per_meal: number | null; price_per_week: number | null;
  price_per_month: number | null; meals_per_day: number | null; location: string | null;
  contact_phone: string | null; is_active: boolean;
};

const CUISINES = ['Indian', 'Chinese', 'Mexican', 'Italian', 'American', 'Mediterranean', 'Other'];
const DIETS    = ['Vegetarian', 'Vegan', 'Non-veg', 'Halal', 'Jain', 'Mixed'];

const INP: React.CSSProperties = { width:'100%', height:44, padding:'0 14px', background:'#F1F7F3', border:'1px solid rgba(18,36,28,0.12)', borderRadius:10, color:'#12241C', fontSize:14, outline:'none', boxSizing:'border-box' };
const LBL: React.CSSProperties = { display:'block', fontSize:11.5, fontWeight:700, color:'#4c6157', marginBottom:6, textTransform:'uppercase', letterSpacing:0.4 };
const OVERLAY: React.CSSProperties = { position:'fixed', inset:0, background:'rgba(18,36,28,0.55)', backdropFilter:'blur(8px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 };

const EMPTY = { name:'', cuisine:'Indian', diet_type:'Vegetarian', description:'', price_per_meal:'', price_per_week:'', price_per_month:'', meals_per_day:'1', location:'', contact_phone:'' };

export default function VendorMenuPage() {
  const [me, setMe]         = useState<any>(null);
  const [rows, setRows]     = useState<Row[]>([]);
  const [loading, setLoad]  = useState(true);
  const [open, setOpen]     = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm]     = useState<any>(EMPTY);
  const [err, setErr]       = useState('');
  const [busy, setBusy]     = useState(false);

  async function load(uid: string) {
    const sb = createClient();
    const { data } = await sb.from('tiffin_listings').select('*').eq('user_id', uid).order('created_at', { ascending:false });
    setRows((data || []) as Row[]);
    setLoad(false);
  }

  // VendorShell already runs requireRole('vendor'), so we only resolve the
  // current user here to scope the listing query.
  useEffect(() => {
    (async () => {
      const { data: { user } } = await createClient().auth.getUser();
      if (!user) return;
      setMe({ id: user.id });
      load(user.id);
    })();
  }, []);

  function openNew() { setEditId(null); setForm(EMPTY); setErr(''); setOpen(true); }
  function openEdit(r: Row) {
    setEditId(r.id); setErr('');
    setForm({
      name:r.name || '', cuisine:r.cuisine || 'Indian', diet_type:r.diet_type || 'Vegetarian',
      description:r.description || '', price_per_meal:r.price_per_meal ?? '', price_per_week:r.price_per_week ?? '',
      price_per_month:r.price_per_month ?? '', meals_per_day:String(r.meals_per_day ?? 1),
      location:r.location || '', contact_phone:r.contact_phone || '',
    });
    setOpen(true);
  }

  async function save() {
    const nameErr = validateText(form.name, 'Name', { min:3, max:80 });
    const descErr = validateParagraph(form.description, 'Description', { max:600 });
    const mealErr = form.price_per_meal ? validatePrice(String(form.price_per_meal), 'Price per meal', { min:0, max:500 }) : '';
    if (nameErr || descErr || mealErr) { setErr(nameErr || descErr || mealErr); return; }
    if (!form.price_per_meal && !form.price_per_week && !form.price_per_month) { setErr('Add at least one price (meal, week or month).'); return; }

    setBusy(true); setErr('');
    const sb = createClient();
    const payload = {
      user_id: me.id,
      name: form.name.trim(),
      cuisine: form.cuisine || null,
      diet_type: form.diet_type || null,
      description: form.description.trim() || null,
      price_per_meal:  form.price_per_meal  ? Number(form.price_per_meal)  : null,
      price_per_week:  form.price_per_week  ? Number(form.price_per_week)  : null,
      price_per_month: form.price_per_month ? Number(form.price_per_month) : null,
      meals_per_day: Number(form.meals_per_day) || 1,
      location: form.location.trim() || null,
      contact_phone: form.contact_phone.trim() || null,
      is_active: true,
    };
    const { error } = editId
      ? await sb.from('tiffin_listings').update(payload).eq('id', editId)
      : await sb.from('tiffin_listings').insert(payload);
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setOpen(false);
    load(me.id);
  }

  async function toggleActive(r: Row) {
    const sb = createClient();
    await sb.from('tiffin_listings').update({ is_active: !r.is_active }).eq('id', r.id);
    load(me.id);
  }

  async function remove(r: Row) {
    if (!confirm(`Delete "${r.name}"? This can't be undone.`)) return;
    const sb = createClient();
    await sb.from('tiffin_listings').delete().eq('id', r.id);
    load(me.id);
  }

  return (
    <VendorShell active="menu" title="My Food">
      {() => (
      <>
      <div style={{ maxWidth:1000, margin:'0 auto' }}>

        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, flexWrap:'wrap', marginBottom:18 }}>
          <div>
            <h1 className="ft-num" style={{ fontSize:24, color:'#12241C', margin:0 }}>My Food Listings</h1>
            <p style={{ fontSize:13.5, color:'#4c6157', marginTop:4 }}>Create your tiffin and meal plans. Add as many as you like.</p>
          </div>
          <button onClick={openNew} className="ft-btn ft-btn-p" style={{ padding:'10px 18px' }}>＋ Add food listing</button>
        </div>

        {/* Not-yet-visible-to-students notice */}
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', borderRadius:12, background:'rgba(226,138,30,0.07)', border:'1px solid rgba(226,138,30,0.25)', fontSize:12.5, color:'#4C6157', lineHeight:1.5, marginBottom:20 }}>
          <span style={{ fontSize:15 }}>🔒</span>
          <span><strong style={{ color:'#12241C' }}>Not live to students yet.</strong> Food is still in “What’s Next”, so anything you add here is saved but hidden from students until we switch it on.</span>
        </div>

        {loading ? (
          <p style={{ fontSize:13.5, color:'#7D9188' }}>Loading…</p>
        ) : rows.length === 0 ? (
          <div style={{ background:'#fff', border:'1px solid rgba(18,36,28,0.09)', borderRadius:18, padding:'44px 22px', textAlign:'center' }}>
            <div style={{ fontSize:30, marginBottom:8 }}>🍱</div>
            <p style={{ fontSize:15, fontWeight:700, color:'#12241C', margin:'0 0 5px' }}>No food listings yet</p>
            <p style={{ fontSize:13, color:'#7D9188', margin:'0 0 16px' }}>Add your first tiffin or meal plan so it’s ready the moment food goes live.</p>
            <button onClick={openNew} className="ft-btn ft-btn-p" style={{ padding:'10px 20px' }}>＋ Add food listing</button>
          </div>
        ) : (
          <div className="rg-2" style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:14 }}>
            {rows.map(r => (
              <div key={r.id} className="ft-card" style={{ padding:18, display:'flex', flexDirection:'column', gap:9 }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10 }}>
                  <span style={{ fontSize:16, fontWeight:800, color:'#12241C' }}>{r.name}</span>
                  <span style={{ fontSize:10.5, fontWeight:800, padding:'3px 9px', borderRadius:100, background:r.is_active?'rgba(18,161,80,0.1)':'rgba(18,36,28,0.06)', color:r.is_active?'#0F8A44':'#7D9188' }}>
                    {r.is_active ? 'Active' : 'Paused'}
                  </span>
                </div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {r.cuisine   && <Chip>{r.cuisine}</Chip>}
                  {r.diet_type && <Chip>{r.diet_type}</Chip>}
                  {r.meals_per_day ? <Chip>{r.meals_per_day} meal/day</Chip> : null}
                </div>
                {r.description && <p style={{ margin:0, fontSize:13, color:'#4c6157', lineHeight:1.5 }}>{r.description}</p>}
                <div style={{ display:'flex', gap:14, flexWrap:'wrap', fontSize:13 }}>
                  {r.price_per_meal  != null && <span><b className="ft-num" style={{ color:'#12A150' }}>${Number(r.price_per_meal).toFixed(0)}</b> <span style={{ color:'#7D9188' }}>/meal</span></span>}
                  {r.price_per_week  != null && <span><b className="ft-num" style={{ color:'#12A150' }}>${Number(r.price_per_week).toFixed(0)}</b> <span style={{ color:'#7D9188' }}>/week</span></span>}
                  {r.price_per_month != null && <span><b className="ft-num" style={{ color:'#12A150' }}>${Number(r.price_per_month).toFixed(0)}</b> <span style={{ color:'#7D9188' }}>/month</span></span>}
                </div>
                {r.location && <span style={{ fontSize:12.5, color:'#7D9188' }}>📍 {r.location}</span>}
                <div style={{ display:'flex', gap:8, marginTop:'auto', paddingTop:6 }}>
                  <button onClick={() => openEdit(r)} className="ft-btn ft-btn-o" style={{ flex:1, justifyContent:'center' }}>Edit</button>
                  <button onClick={() => toggleActive(r)} className="ft-btn ft-btn-o" style={{ flex:1, justifyContent:'center' }}>{r.is_active ? 'Pause' : 'Activate'}</button>
                  <button onClick={() => remove(r)} className="ft-btn ft-btn-o" style={{ justifyContent:'center', color:'#C25B4E', borderColor:'rgba(194,91,78,0.3)' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {open && (
        <div style={OVERLAY} onClick={() => setOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background:'#fff', border:'1px solid rgba(18,36,28,0.12)', borderRadius:22, padding:'26px 24px', width:'100%', maxWidth:560, maxHeight:'92vh', overflowY:'auto' }}>
            <h3 style={{ fontSize:19, fontWeight:800, color:'#12241C', margin:'0 0 18px' }}>{editId ? 'Edit food listing' : 'Add food listing'}</h3>

            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label style={LBL}>Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name:e.target.value })} placeholder="e.g. Homemade Gujarati Tiffin" style={INP} />
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={LBL}>Cuisine</label>
                  <select value={form.cuisine} onChange={e => setForm({ ...form, cuisine:e.target.value })} style={INP}>
                    {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={LBL}>Diet</label>
                  <select value={form.diet_type} onChange={e => setForm({ ...form, diet_type:e.target.value })} style={INP}>
                    {DIETS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={LBL}>Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description:e.target.value })} rows={3}
                  placeholder="What's included, portion size, delivery or pickup details…"
                  style={{ ...INP, height:'auto', padding:'10px 14px', resize:'none' }} />
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                <div>
                  <label style={LBL}>$ / meal</label>
                  <input value={form.price_per_meal} onChange={e => setForm({ ...form, price_per_meal:e.target.value.replace(/[^\d.]/g,'') })} inputMode="decimal" placeholder="8" style={INP} />
                </div>
                <div>
                  <label style={LBL}>$ / week</label>
                  <input value={form.price_per_week} onChange={e => setForm({ ...form, price_per_week:e.target.value.replace(/[^\d.]/g,'') })} inputMode="decimal" placeholder="50" style={INP} />
                </div>
                <div>
                  <label style={LBL}>$ / month</label>
                  <input value={form.price_per_month} onChange={e => setForm({ ...form, price_per_month:e.target.value.replace(/[^\d.]/g,'') })} inputMode="decimal" placeholder="180" style={INP} />
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={LBL}>Meals per day</label>
                  <input value={form.meals_per_day} onChange={e => setForm({ ...form, meals_per_day:e.target.value.replace(/\D/g,'') })} inputMode="numeric" placeholder="1" style={INP} />
                </div>
                <div>
                  <label style={LBL}>Contact phone</label>
                  <input value={form.contact_phone} onChange={e => setForm({ ...form, contact_phone:e.target.value })} placeholder="Optional" style={INP} />
                </div>
              </div>

              <div>
                <label style={LBL}>Location</label>
                <input value={form.location} onChange={e => setForm({ ...form, location:e.target.value })} placeholder="e.g. Glassboro, NJ" style={INP} />
              </div>
            </div>

            {err && <div style={{ marginTop:14, padding:'10px 14px', borderRadius:10, background:'rgba(194,91,78,0.10)', border:'1px solid rgba(194,91,78,0.3)', color:'#C25B4E', fontSize:13 }}>{err}</div>}

            <div style={{ display:'flex', gap:10, marginTop:20 }}>
              <button onClick={save} disabled={busy} className="ft-btn ft-btn-p" style={{ height:44, flex:1, justifyContent:'center', fontSize:14 }}>{busy ? 'Saving…' : (editId ? 'Save changes' : 'Add listing')}</button>
              <button onClick={() => setOpen(false)} className="ft-btn ft-btn-o" style={{ height:44, padding:'0 20px', fontSize:14 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      </>
      )}
    </VendorShell>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span style={{ fontSize:11.5, fontWeight:700, padding:'3px 10px', borderRadius:100, background:'rgba(18,36,28,0.05)', color:'#4c6157' }}>{children}</span>;
}

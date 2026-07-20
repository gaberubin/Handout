'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { validateText, validateParagraph, validatePrice } from '@/lib/validation';
import { awardPoints } from '@/lib/points';
import { getMyCampus } from '@/lib/campus';

/* ── Icons ── */
const CalIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const PinIcon    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const ClockIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const UsersIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const AddIcon    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const CheckIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const XIcon      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const TagIcon    = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;

const CATEGORIES = ['All','Academic','Social','Sports','Career','Culture','Tech','Health','Other'];
const CATEGORY_COLORS: Record<string,string> = {
  Academic:'#5B8AF0', Social:'#C25B4E', Sports:'#12A150', Career:'#12A150',
  Culture:'#E08A1E', Tech:'#7C6BD1', Health:'#F97316', Other:'#7d9188', General:'#7d9188',
};

function fmt(d: string) { return new Date(d+'T00:00').toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' }); }
function ini(name: string) { return (name||'?').split(' ').map((n:string)=>n[0]).join('').slice(0,2).toUpperCase(); }

const card: React.CSSProperties = { background:'#FFFFFF', border:'1px solid rgba(18,36,28,0.09)', borderRadius:16 };
const MODAL0 = { title:'', description:'', category:'Academic', location:'', event_date:'', event_time:'', is_free:true, price:'' };

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents]     = useState<any[]>([]);
  const [rsvps, setRsvps]       = useState<Record<string,number>>({});
  const [myRsvps, setMyRsvps]   = useState<Set<string>>(new Set());
  const [names, setNames]       = useState<Record<string,string>>({});
  const [me, setMe]             = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [cat, setCat]           = useState('All');
  const [showPast, setShowPast] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]         = useState<any>(MODAL0);
  const [saving, setSaving]     = useState(false);
  const [formErr, setFormErr]   = useState('');
  const [toggling, setToggling] = useState<string|null>(null);

  const today = new Date().toISOString().split('T')[0];

  async function load(uid: string) {
    const sb = createClient();
    const campus = await getMyCampus();
    let evQ = sb.from('campus_events').select('*').eq('is_active', true).order('event_date', { ascending: true });
    if (campus) evQ = evQ.eq('campus', campus);   // campus isolation — only my university
    const [{ data: evs }, { data: rs }, { data: myRs }] = await Promise.all([
      evQ,
      sb.from('event_rsvps').select('event_id'),
      sb.from('event_rsvps').select('event_id').eq('user_id', uid),
    ]);
    const eList = evs || [];
    setEvents(eList);

    const counts: Record<string,number> = {};
    (rs||[]).forEach((r:any) => { counts[r.event_id] = (counts[r.event_id]||0) + 1; });
    setRsvps(counts);
    setMyRsvps(new Set((myRs||[]).map((r:any) => r.event_id)));

    const uids = [...new Set(eList.map((e:any) => e.user_id))] as string[];
    if (uids.length) {
      const { data: users } = await sb.from('public_profiles').select('id, full_name').in('id', uids);
      const nm: Record<string,string> = {};
      (users||[]).forEach((u:any) => { nm[u.id] = u.full_name||'Student'; });
      setNames(nm);
    }
  }

  useEffect(() => {
    (async () => {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }
      const { data: u } = await sb.from('users').select('*').eq('id', user.id).single();
      setMe(u||{id:user.id});
      await load(user.id);
      setLoading(false);
    })();
  }, []);

  async function toggleRsvp(ev: any) {
    if (!me) return;
    setToggling(ev.id);
    const sb = createClient();
    if (myRsvps.has(ev.id)) {
      await sb.from('event_rsvps').delete().eq('event_id', ev.id).eq('user_id', me.id);
      setMyRsvps(prev => { const s = new Set(prev); s.delete(ev.id); return s; });
      setRsvps(prev => ({ ...prev, [ev.id]: Math.max(0, (prev[ev.id]||1) - 1) }));
    } else {
      await sb.from('event_rsvps').insert({ event_id: ev.id, user_id: me.id });
      awardPoints('rsvp_event');
      setMyRsvps(prev => new Set([...prev, ev.id]));
      setRsvps(prev => ({ ...prev, [ev.id]: (prev[ev.id]||0) + 1 }));
    }
    setToggling(null);
  }

  async function submit() {
    const tErr = validateText(form.title, 'Event title', { min: 3, max: 80 });
    const dateErr = form.event_date ? '' : 'Event date is required';
    const locErr = form.location ? validateText(form.location, 'Location', { min: 2, max: 80, required: false }) : '';
    const descErr = validateParagraph(form.description, 'Description', { max: 600 });
    const priceErr = !form.is_free ? validatePrice(form.price, 'Price', { min: 0, max: 5000 }) : '';
    if (tErr || dateErr || locErr || descErr || priceErr) { setFormErr(tErr || dateErr || locErr || descErr || priceErr); return; }
    setFormErr('');
    setSaving(true);
    const sb = createClient();
    await sb.from('campus_events').insert({ ...form, user_id: me.id, price: form.is_free ? null : parseFloat(form.price)||null });
    setSaving(false);
    setShowModal(false);
    setForm(MODAL0);
    await load(me.id);
  }

  async function deleteEvent(id: string) {
    if (!confirm('Delete this event?')) return;
    const sb = createClient();
    await sb.from('campus_events').update({ is_active: false }).eq('id', id);
    setEvents(prev => prev.filter(e => e.id !== id));
  }

  const filtered = events.filter(e => {
    if (cat !== 'All' && e.category !== cat) return false;
    if (!showPast && e.event_date < today) return false;
    return true;
  });

  const upcoming = filtered.filter(e => e.event_date >= today);
  const past     = filtered.filter(e => e.event_date < today);

  function EventCard({ e }: { e: any }) {
    const catColor = CATEGORY_COLORS[e.category] || '#7d9188';
    const isOwn = me && e.user_id === me.id;
    const isRsvpd = myRsvps.has(e.id);
    const count = rsvps[e.id] || 0;
    const isPast = e.event_date < today;

    return (
      <div style={{ ...card, overflow:'hidden', opacity: isPast ? 0.7 : 1, transition:'border-color .15s, transform .12s' }}
        onMouseEnter={e2 => { (e2.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.2)'; (e2.currentTarget as HTMLElement).style.transform='translateY(-2px)'; }}
        onMouseLeave={e2 => { (e2.currentTarget as HTMLElement).style.borderColor='rgba(18,36,28,0.09)'; (e2.currentTarget as HTMLElement).style.transform='none'; }}>

        {/* Image or color bar */}
        {e.image_url ? (
          <img src={e.image_url} alt="" style={{ width:'100%', height:140, objectFit:'cover', display:'block' }} />
        ) : (
          <div style={{ height:8, background:`linear-gradient(90deg, ${catColor}, ${catColor}88)` }} />
        )}

        <div style={{ padding:'14px 16px' }}>
          {/* Category + date */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
            <span style={{ fontSize:10, fontWeight:700, padding:'2px 9px', borderRadius:100, background:`${catColor}18`, color:catColor, border:`1px solid ${catColor}30`, display:'inline-flex', alignItems:'center', gap:4 }}>
              <TagIcon />{e.category || 'General'}
            </span>
            {isPast && <span style={{ fontSize:10, fontWeight:700, color:'#7d9188' }}>Past</span>}
          </div>

          <h3 style={{ margin:'0 0 6px', fontSize:15, fontWeight:800, color:'#12241C', lineHeight:1.3 }}>{e.title}</h3>

          <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:8 }}>
            <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'#7d9188' }}>
              <CalIcon />{fmt(e.event_date)}{e.event_time && <>&nbsp;·&nbsp;<ClockIcon />{e.event_time}</>}
            </span>
            {e.location && <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'#7d9188' }}><PinIcon />{e.location}</span>}
            <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'#7d9188' }}>
              <UsersIcon />{count} going · {e.is_free ? <span style={{ color:'#12A150', fontWeight:700 }}>Free</span> : <span style={{ color:'#E08A1E', fontWeight:700 }}>${e.price}</span>}
            </span>
          </div>

          {e.description && <p style={{ margin:'0 0 10px', fontSize:13, color:'#4c6157', lineHeight:1.5 }}>{e.description.slice(0,120)}{e.description.length>120?'…':''}</p>}

          {/* Actions */}
          <div style={{ display:'flex', gap:8, paddingTop:10, borderTop:'1px solid rgba(18,36,28,0.07)' }}>
            {!isOwn && !isPast && (
              <button onClick={() => toggleRsvp(e)} disabled={toggling===e.id}
                style={{ flex:1, height:36, borderRadius:100, fontSize:12, fontWeight:700, cursor:'pointer', border:'none', background:isRsvpd?'rgba(18,161,80,0.12)':'rgba(18,161,80,0.12)', color:isRsvpd?'#12A150':'#12A150', display:'inline-flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                {toggling===e.id ? '…' : isRsvpd ? <><CheckIcon />Going</> : '+ RSVP'}
              </button>
            )}
            {isOwn && (
              <button onClick={() => deleteEvent(e.id)} style={{ flex:1, height:36, borderRadius:100, fontSize:12, fontWeight:700, cursor:'pointer', border:'1px solid rgba(194,91,78,0.2)', background:'rgba(194,91,78,0.06)', color:'#C25B4E' }}>
                Delete
              </button>
            )}
            {isPast && !isOwn && (
              <div style={{ flex:1, height:36, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, color:'#7d9188' }}>Event ended</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <StudentLayout title="Events">
      <div style={{ maxWidth:900, margin:'0 auto', padding:'28px 0 80px' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:800, color:'#12241C', margin:0, letterSpacing:-0.5 }}>Campus Events</h1>
            <p style={{ margin:'4px 0 0', fontSize:13, color:'#7d9188' }}>What's happening on campus</p>
          </div>
          <button onClick={() => setShowModal(true)} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'9px 18px', borderRadius:100, background:'#12A150', color:'#ffffff', fontWeight:700, fontSize:13, border:'none', cursor:'pointer' }}>
            <AddIcon /> Post event
          </button>
        </div>

        {/* Category filter */}
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:16 }}>
          {CATEGORIES.map(c => {
            const col = CATEGORY_COLORS[c] || '#7d9188';
            return (
              <button key={c} onClick={() => setCat(c)}
                style={{ padding:'6px 14px', borderRadius:100, fontSize:12, fontWeight:600, cursor:'pointer', border:`1px solid ${cat===c?`${col}60`:'rgba(18,36,28,0.09)'}`, background:cat===c?`${col}18`:'rgba(18,36,28,0.04)', color:cat===c?col:'#7d9188' }}>
                {c}
              </button>
            );
          })}
          <button onClick={() => setShowPast(v => !v)}
            style={{ padding:'6px 14px', borderRadius:100, fontSize:12, fontWeight:600, cursor:'pointer', border:`1px solid ${showPast?'rgba(255,255,255,0.2)':'rgba(18,36,28,0.09)'}`, background:showPast?'rgba(18,36,28,0.09)':'rgba(18,36,28,0.04)', color:showPast?'#12241C':'#7d9188', marginLeft:'auto' }}>
            {showPast ? 'Hide past' : 'Show past'}
          </button>
        </div>

        {loading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(285px,1fr))', gap:16 }}>
            {Array(6).fill(null).map((_,i) => <div key={i} style={{ ...card, height:280 }} className="skeleton" />)}
          </div>
        ) : upcoming.length === 0 && past.length === 0 ? (
          <div style={{ ...card, padding:'48px 24px', textAlign:'center' }}>
            <span style={{ fontSize:36 }}>🎉</span>
            <p style={{ color:'#7d9188', fontSize:14, margin:'12px 0 4px' }}>No upcoming events.</p>
            <p style={{ color:'#7d9188', fontSize:12, margin:0 }}>Post one for your campus!</p>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <>
                <p style={{ fontSize:11, fontWeight:800, color:'#7d9188', textTransform:'uppercase', letterSpacing:1, margin:'0 0 14px' }}>Upcoming · {upcoming.length}</p>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(285px,1fr))', gap:16, marginBottom:28 }}>
                  {upcoming.map(e => <EventCard key={e.id} e={e} />)}
                </div>
              </>
            )}
            {showPast && past.length > 0 && (
              <>
                <p style={{ fontSize:11, fontWeight:800, color:'#7d9188', textTransform:'uppercase', letterSpacing:1, margin:'0 0 14px' }}>Past · {past.length}</p>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(285px,1fr))', gap:16 }}>
                  {past.map(e => <EventCard key={e.id} e={e} />)}
                </div>
              </>
            )}
          </>
        )}

        {/* Post modal */}
        {showModal && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 }} onClick={() => setShowModal(false)}>
            <div style={{ background:'#FFFFFF', borderRadius:20, border:'1px solid rgba(18,36,28,0.12)', width:'100%', maxWidth:480, padding:'24px 28px', maxHeight:'90vh', overflowY:'auto' }} onClick={e => e.stopPropagation()}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
                <h2 style={{ margin:0, fontSize:18, fontWeight:800, color:'#12241C' }}>Post an Event</h2>
                <button onClick={() => setShowModal(false)} style={{ background:'none', border:'none', color:'#7d9188', cursor:'pointer', display:'flex' }}><XIcon /></button>
              </div>

              {[
                { label:'Title *', key:'title', placeholder:'Event name' },
                { label:'Location', key:'location', placeholder:'Room / Building / Online' },
              ].map(f => (
                <div key={f.key} style={{ marginBottom:12 }}>
                  <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#7d9188', marginBottom:4, textTransform:'uppercase', letterSpacing:0.5 }}>{f.label}</label>
                  <input value={form[f.key]} onChange={e => setForm((p:any) => ({...p, [f.key]:e.target.value}))} placeholder={f.placeholder}
                    style={{ width:'100%', height:38, padding:'0 12px', boxSizing:'border-box', background:'rgba(18,36,28,0.06)', border:'1px solid rgba(18,36,28,0.09)', borderRadius:10, color:'#12241C', fontSize:13, outline:'none' }} />
                </div>
              ))}

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                <div>
                  <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#7d9188', marginBottom:4, textTransform:'uppercase', letterSpacing:0.5 }}>Date *</label>
                  <input type="date" value={form.event_date} onChange={e => setForm((p:any) => ({...p, event_date:e.target.value}))}
                    style={{ width:'100%', height:38, padding:'0 12px', boxSizing:'border-box', background:'rgba(18,36,28,0.06)', border:'1px solid rgba(18,36,28,0.09)', borderRadius:10, color:'#12241C', fontSize:13, outline:'none', colorScheme:'dark' }} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#7d9188', marginBottom:4, textTransform:'uppercase', letterSpacing:0.5 }}>Time</label>
                  <input type="time" value={form.event_time} onChange={e => setForm((p:any) => ({...p, event_time:e.target.value}))}
                    style={{ width:'100%', height:38, padding:'0 12px', boxSizing:'border-box', background:'rgba(18,36,28,0.06)', border:'1px solid rgba(18,36,28,0.09)', borderRadius:10, color:'#12241C', fontSize:13, outline:'none', colorScheme:'dark' }} />
                </div>
              </div>

              <div style={{ marginBottom:12 }}>
                <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#7d9188', marginBottom:4, textTransform:'uppercase', letterSpacing:0.5 }}>Category</label>
                <select value={form.category} onChange={e => setForm((p:any) => ({...p, category:e.target.value}))}
                  style={{ width:'100%', height:38, padding:'0 12px', background:'rgba(18,36,28,0.06)', border:'1px solid rgba(18,36,28,0.09)', borderRadius:10, color:'#12241C', fontSize:13, outline:'none' }}>
                  {CATEGORIES.filter(c=>c!=='All').map(c => <option key={c} value={c} style={{ background:'#FFFFFF' }}>{c}</option>)}
                </select>
              </div>

              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:form.is_free ? 12 : 0 }}>
                <label style={{ fontSize:13, color:'#12241C', display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
                  <input type="checkbox" checked={form.is_free} onChange={e => setForm((p:any) => ({...p, is_free:e.target.checked, price:''}))} />
                  Free event
                </label>
                {!form.is_free && (
                  <input type="number" min={0} step={1} value={form.price} onChange={e => setForm((p:any) => ({...p, price:e.target.value}))} placeholder="Price ($)"
                    style={{ flex:1, height:38, padding:'0 12px', background:'rgba(18,36,28,0.06)', border:'1px solid rgba(18,36,28,0.09)', borderRadius:10, color:'#12241C', fontSize:13, outline:'none' }} />
                )}
              </div>

              <div style={{ marginBottom:20, marginTop:12 }}>
                <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#7d9188', marginBottom:4, textTransform:'uppercase', letterSpacing:0.5 }}>Description</label>
                <textarea value={form.description} onChange={e => setForm((p:any) => ({...p, description:e.target.value}))} placeholder="Tell people what's happening…" rows={3}
                  style={{ width:'100%', padding:'10px 12px', boxSizing:'border-box', background:'rgba(18,36,28,0.06)', border:'1px solid rgba(18,36,28,0.09)', borderRadius:10, color:'#12241C', fontSize:13, outline:'none', resize:'none', fontFamily:'inherit' }} />
              </div>

              {formErr && <div style={{ fontSize:12, color:'#C25B4E', fontWeight:600, marginBottom:10 }}>{formErr}</div>}
              <button onClick={submit} disabled={!form.title || !form.event_date || saving}
                style={{ width:'100%', height:44, borderRadius:12, background:(form.title && form.event_date) ? '#12A150' : 'rgba(18,36,28,0.09)', color:(form.title && form.event_date) ? '#ffffff' : '#7d9188', fontWeight:800, fontSize:14, border:'none', cursor:(form.title && form.event_date) ? 'pointer' : 'default' }}>
                {saving ? 'Posting…' : 'Post Event'}
              </button>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}

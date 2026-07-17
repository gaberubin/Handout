'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { StudentLayout } from '@/components/layout/StudentLayout';

/* ── Icons ── */
const CarIcon    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
const PinIcon    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const CalIcon    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const ClockIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const SeatIcon   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const ChatIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const ArrowIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const XIcon      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const AddIcon    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const PhoneIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.09 6.09l1.97-1.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;

function ini(name: string) { return (name||'?').split(' ').map((n:string)=>n[0]).join('').slice(0,2).toUpperCase(); }
function fmtDate(d: string) { return new Date(d + 'T00:00').toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' }); }

const card: React.CSSProperties = { background:'#FFFFFF', border:'1px solid rgba(18,36,28,0.09)', borderRadius:16 };

const MODAL_INITIAL = { type:'offer', from_location:'', to_location:'', departure_date:'', departure_time:'', seats_available:1, price_per_seat:'', description:'', contact_phone:'' };

export default function RideSharePage() {
  const router = useRouter();
  const [listings, setListings] = useState<any[]>([]);
  const [names, setNames]       = useState<Record<string,string>>({});
  const [avatars, setAvatars]   = useState<Record<string,string>>({});
  const [me, setMe]             = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<'all'|'offer'|'request'>('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]         = useState<any>(MODAL_INITIAL);
  const [saving, setSaving]     = useState(false);

  async function load(uid: string) {
    const sb = createClient();
    const { data } = await sb.from('ride_share_listings').select('*').eq('is_active', true).order('departure_date', { ascending: true });
    const ls = data || [];
    setListings(ls);
    const uids = [...new Set(ls.map((l:any) => l.user_id))] as string[];
    if (uids.length) {
      const { data: users } = await sb.from('public_profiles').select('id, full_name, avatar_url').in('id', uids);
      const nm: Record<string,string> = {}, av: Record<string,string> = {};
      (users||[]).forEach((u:any) => { nm[u.id] = u.full_name||'Student'; av[u.id] = u.avatar_url||''; });
      setNames(nm); setAvatars(av);
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

  async function submit() {
    if (!form.from_location || !form.to_location || !form.departure_date) return;
    setSaving(true);
    const sb = createClient();
    await sb.from('ride_share_listings').insert({ ...form, user_id: me.id, price_per_seat: form.price_per_seat ? parseFloat(form.price_per_seat) : null, seats_available: parseInt(form.seats_available)||1 });
    setSaving(false);
    setShowModal(false);
    setForm(MODAL_INITIAL);
    await load(me.id);
  }

  async function deleteListing(id: string) {
    if (!confirm('Delete this listing?')) return;
    const sb = createClient();
    await sb.from('ride_share_listings').update({ is_active: false }).eq('id', id);
    setListings(p => p.filter(l => l.id !== id));
  }

  const visible = listings.filter(l => filter === 'all' || l.type === filter);
  const today = new Date().toISOString().split('T')[0];

  return (
    <StudentLayout title="Ride Share">
      <div style={{ maxWidth:900, margin:'0 auto', padding:'28px 0 80px' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:800, color:'#12241C', margin:0, letterSpacing:-0.5 }}>Ride Share</h1>
            <p style={{ margin:'4px 0 0', fontSize:13, color:'#7d9188' }}>Share rides, split costs, travel together</p>
          </div>
          <button onClick={() => setShowModal(true)} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'9px 18px', borderRadius:100, background:'#12A150', color:'#ffffff', fontWeight:700, fontSize:13, border:'none', cursor:'pointer' }}>
            <AddIcon /> Post a ride
          </button>
        </div>

        {/* Filter tabs */}
        <div style={{ display:'flex', gap:6, marginBottom:20 }}>
          {(['all','offer','request'] as const).map(t => (
            <button key={t} onClick={() => setFilter(t)}
              style={{ padding:'7px 18px', borderRadius:100, fontSize:12, fontWeight:700, cursor:'pointer', border:`1px solid ${filter===t?'rgba(18,161,80,0.4)':'rgba(18,36,28,0.09)'}`, background:filter===t?'rgba(18,161,80,0.12)':'rgba(18,36,28,0.04)', color:filter===t?'#12A150':'#7d9188' }}>
              {t==='all'?'All rides':t==='offer'?'🚗 Offering ride':'🙋 Need a ride'}
            </button>
          ))}
        </div>

        {/* Stats bar */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
          {[
            { label:'Total rides', value: listings.length },
            { label:'Offering rides', value: listings.filter(l=>l.type==='offer').length },
            { label:'Looking for ride', value: listings.filter(l=>l.type==='request').length },
          ].map(s => (
            <div key={s.label} style={{ ...card, padding:'14px 18px', textAlign:'center' }}>
              <p style={{ margin:0, fontSize:24, fontWeight:800, color:'#12A150' }}>{loading ? '—' : s.value}</p>
              <p style={{ margin:'3px 0 0', fontSize:11, color:'#7d9188' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Listings */}
        {loading ? (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {Array(3).fill(null).map((_,i) => (
              <div key={i} style={{ ...card, padding:20, height:90 }} className="skeleton" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div style={{ ...card, padding:'48px 24px', textAlign:'center' }}>
            <span style={{ fontSize:40 }}>🚗</span>
            <p style={{ color:'#7d9188', fontSize:14, margin:'12px 0 4px' }}>No ride listings yet.</p>
            <p style={{ color:'#7d9188', fontSize:12, margin:0 }}>Be the first to post a ride!</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {visible.map(l => {
              const name = names[l.user_id] || 'Student';
              const isOffer = l.type === 'offer';
              const isOwn = me && l.user_id === me.id;
              const isPast = l.departure_date < today;

              return (
                <div key={l.id} style={{ ...card, padding:'18px 20px', opacity: isPast ? 0.6 : 1 }}>
                  <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
                    {/* Avatar */}
                    <div style={{ width:42, height:42, borderRadius:'50%', background:'linear-gradient(135deg,#5A4BB8,#12A150)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:14, color:'#ffffff', flexShrink:0 }}>
                      {avatars[l.user_id] ? <img src={avatars[l.user_id]} alt="" style={{ width:42, height:42, borderRadius:'50%', objectFit:'cover' }} /> : ini(name)}
                    </div>

                    <div style={{ flex:1 }}>
                      {/* Route */}
                      <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:6 }}>
                        <span style={{ fontSize:15, fontWeight:800, color:'#12241C' }}>{l.from_location}</span>
                        <span style={{ color:'#12A150', display:'inline-flex' }}><ArrowIcon /></span>
                        <span style={{ fontSize:15, fontWeight:800, color:'#12241C' }}>{l.to_location}</span>
                        <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:100, background:isOffer?'rgba(18,161,80,0.12)':'rgba(18,161,80,0.12)', color:isOffer?'#12A150':'#12A150', border:`1px solid ${isOffer?'rgba(18,161,80,0.25)':'rgba(18,161,80,0.25)'}` }}>
                          {isOffer ? '🚗 Offering' : '🙋 Needs ride'}
                        </span>
                        {isPast && <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:100, background:'rgba(194,91,78,0.1)', color:'#C25B4E', border:'1px solid rgba(194,91,78,0.25)' }}>Past</span>}
                      </div>

                      {/* Meta */}
                      <div style={{ display:'flex', flexWrap:'wrap', gap:12, fontSize:12, color:'#7d9188', marginBottom:l.description ? 8 : 0 }}>
                        <span style={{ display:'flex', alignItems:'center', gap:4 }}><CalIcon />{fmtDate(l.departure_date)}</span>
                        {l.departure_time && <span style={{ display:'flex', alignItems:'center', gap:4 }}><ClockIcon />{l.departure_time}</span>}
                        {isOffer && <span style={{ display:'flex', alignItems:'center', gap:4 }}><SeatIcon />{l.seats_available} seat{l.seats_available!==1?'s':''}</span>}
                        {l.price_per_seat ? <span style={{ color:'#12A150', fontWeight:700 }}>${l.price_per_seat}/seat</span> : <span style={{ color:'#12A150', fontWeight:700 }}>Free</span>}
                        <span style={{ color:'#7d9188' }}>by {name}</span>
                      </div>

                      {l.description && <p style={{ margin:'6px 0 0', fontSize:13, color:'#4c6157', lineHeight:1.5 }}>{l.description}</p>}
                    </div>

                    {/* Actions */}
                    <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                      {!isOwn && (
                        <>
                          <button onClick={() => router.push(`/student/messages?to=${l.user_id}&name=${encodeURIComponent(name)}&msg=${encodeURIComponent(`Hi! I'm interested in your ride from ${l.from_location} to ${l.to_location} on ${fmtDate(l.departure_date)}.`)}`)}
                            style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'8px 14px', borderRadius:100, background:'rgba(18,161,80,0.12)', border:'1px solid rgba(18,161,80,0.25)', color:'#12A150', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                            <ChatIcon /> Message
                          </button>
                          {l.contact_phone && (
                            <a href={`tel:${l.contact_phone}`} style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'8px 14px', borderRadius:100, background:'rgba(18,36,28,0.04)', border:'1px solid rgba(18,36,28,0.09)', color:'#7d9188', fontSize:12, fontWeight:700, textDecoration:'none' }}>
                              <PhoneIcon /> Call
                            </a>
                          )}
                        </>
                      )}
                      {isOwn && (
                        <button onClick={() => deleteListing(l.id)} style={{ padding:'8px 12px', borderRadius:100, background:'rgba(194,91,78,0.08)', border:'1px solid rgba(194,91,78,0.2)', color:'#C25B4E', fontSize:12, cursor:'pointer' }}>
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Post modal */}
        {showModal && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 }} onClick={() => setShowModal(false)}>
            <div style={{ background:'#FFFFFF', borderRadius:20, border:'1px solid rgba(18,36,28,0.12)', width:'100%', maxWidth:480, padding:'24px 28px', maxHeight:'90vh', overflowY:'auto' }} onClick={e => e.stopPropagation()}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
                <h2 style={{ margin:0, fontSize:18, fontWeight:800, color:'#12241C' }}>Post a Ride</h2>
                <button onClick={() => setShowModal(false)} style={{ background:'none', border:'none', color:'#7d9188', cursor:'pointer', display:'flex' }}><XIcon /></button>
              </div>

              {/* Type toggle */}
              <div style={{ display:'flex', gap:8, marginBottom:20 }}>
                {(['offer','request'] as const).map(t => (
                  <button key={t} onClick={() => setForm((f:any) => ({...f, type:t}))}
                    style={{ flex:1, padding:'10px 0', borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer', border:`1px solid ${form.type===t?'rgba(18,161,80,0.4)':'rgba(18,36,28,0.09)'}`, background:form.type===t?'rgba(18,161,80,0.12)':'rgba(18,36,28,0.04)', color:form.type===t?'#12A150':'#7d9188' }}>
                    {t==='offer'?'🚗 I\'m offering a ride':'🙋 I need a ride'}
                  </button>
                ))}
              </div>

              {/* Fields */}
              {[
                { label:'From *', key:'from_location', placeholder:'Departure city / address' },
                { label:'To *', key:'to_location', placeholder:'Destination city / address' },
              ].map(f => (
                <div key={f.key} style={{ marginBottom:14 }}>
                  <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#7d9188', marginBottom:5, textTransform:'uppercase', letterSpacing:0.5 }}>{f.label}</label>
                  <input value={form[f.key]} onChange={e => setForm((p:any) => ({...p, [f.key]:e.target.value}))} placeholder={f.placeholder}
                    style={{ width:'100%', height:40, padding:'0 14px', boxSizing:'border-box', background:'rgba(18,36,28,0.06)', border:'1px solid rgba(18,36,28,0.09)', borderRadius:10, color:'#12241C', fontSize:13, outline:'none' }} />
                </div>
              ))}

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
                <div>
                  <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#7d9188', marginBottom:5, textTransform:'uppercase', letterSpacing:0.5 }}>Date *</label>
                  <input type="date" value={form.departure_date} min={today} onChange={e => setForm((p:any) => ({...p, departure_date:e.target.value}))}
                    style={{ width:'100%', height:40, padding:'0 12px', boxSizing:'border-box', background:'rgba(18,36,28,0.06)', border:'1px solid rgba(18,36,28,0.09)', borderRadius:10, color:'#12241C', fontSize:13, outline:'none', colorScheme:'dark' }} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#7d9188', marginBottom:5, textTransform:'uppercase', letterSpacing:0.5 }}>Time</label>
                  <input type="time" value={form.departure_time} onChange={e => setForm((p:any) => ({...p, departure_time:e.target.value}))}
                    style={{ width:'100%', height:40, padding:'0 12px', boxSizing:'border-box', background:'rgba(18,36,28,0.06)', border:'1px solid rgba(18,36,28,0.09)', borderRadius:10, color:'#12241C', fontSize:13, outline:'none', colorScheme:'dark' }} />
                </div>
              </div>

              {form.type === 'offer' && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
                  <div>
                    <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#7d9188', marginBottom:5, textTransform:'uppercase', letterSpacing:0.5 }}>Seats</label>
                    <input type="number" min={1} max={8} value={form.seats_available} onChange={e => setForm((p:any) => ({...p, seats_available:e.target.value}))}
                      style={{ width:'100%', height:40, padding:'0 12px', boxSizing:'border-box', background:'rgba(18,36,28,0.06)', border:'1px solid rgba(18,36,28,0.09)', borderRadius:10, color:'#12241C', fontSize:13, outline:'none' }} />
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#7d9188', marginBottom:5, textTransform:'uppercase', letterSpacing:0.5 }}>Price/seat ($)</label>
                    <input type="number" min={0} step={0.5} value={form.price_per_seat} onChange={e => setForm((p:any) => ({...p, price_per_seat:e.target.value}))} placeholder="0 = free"
                      style={{ width:'100%', height:40, padding:'0 12px', boxSizing:'border-box', background:'rgba(18,36,28,0.06)', border:'1px solid rgba(18,36,28,0.09)', borderRadius:10, color:'#12241C', fontSize:13, outline:'none' }} />
                  </div>
                </div>
              )}

              <div style={{ marginBottom:14 }}>
                <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#7d9188', marginBottom:5, textTransform:'uppercase', letterSpacing:0.5 }}>Phone (optional)</label>
                <input value={form.contact_phone} onChange={e => setForm((p:any) => ({...p, contact_phone:e.target.value}))} placeholder="+1 (555) 000-0000"
                  style={{ width:'100%', height:40, padding:'0 14px', boxSizing:'border-box', background:'rgba(18,36,28,0.06)', border:'1px solid rgba(18,36,28,0.09)', borderRadius:10, color:'#12241C', fontSize:13, outline:'none' }} />
              </div>

              <div style={{ marginBottom:20 }}>
                <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#7d9188', marginBottom:5, textTransform:'uppercase', letterSpacing:0.5 }}>Notes</label>
                <textarea value={form.description} onChange={e => setForm((p:any) => ({...p, description:e.target.value}))} placeholder="Any details, meeting point, luggage, etc." rows={3}
                  style={{ width:'100%', padding:'10px 14px', boxSizing:'border-box', background:'rgba(18,36,28,0.06)', border:'1px solid rgba(18,36,28,0.09)', borderRadius:10, color:'#12241C', fontSize:13, outline:'none', resize:'none', fontFamily:'inherit' }} />
              </div>

              <button onClick={submit} disabled={!form.from_location || !form.to_location || !form.departure_date || saving}
                style={{ width:'100%', height:46, borderRadius:12, background:form.from_location && form.to_location && form.departure_date ? '#12A150' : 'rgba(18,36,28,0.09)', color:form.from_location && form.to_location && form.departure_date ? '#ffffff' : '#7d9188', fontWeight:800, fontSize:14, border:'none', cursor:'pointer' }}>
                {saving ? 'Posting…' : 'Post Ride'}
              </button>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}

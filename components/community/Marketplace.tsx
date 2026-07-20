'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { processPickedFiles } from '@/lib/imageCompress';
import { validateParagraph, validatePrice } from '@/lib/validation';
import { awardPoints } from '@/lib/points';
import { BETA_MODE } from '@/config/features';

/* ── Icons ── */
const ChatIcon  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const PlusIcon  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const TrashIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const ShieldIcon= () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const BoxIcon   = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
const BookmarkIcon = ({ filled = false }: { filled?: boolean }) => <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>;
const FlagIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>;

const CATEGORIES = ['Textbook', 'Furniture', 'Electronics', 'Other'];
const MAX_PHOTOS = 5;

const INP: React.CSSProperties = { width:'100%', height:44, padding:'0 14px', background:'#F1F7F3', border:'1px solid rgba(18,36,28,0.12)', borderRadius:10, color:'#12241C', fontSize:14, outline:'none', boxSizing:'border-box' };
const OVERLAY: React.CSSProperties = { position:'fixed', inset:0, background:'rgba(18,36,28,0.55)', backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 };

type Listing = { id:string; user_id:string; title:string; description:string; price:number; category:string; media:string[]; created_at:string };
type Me = { id:string; verification_status?:string; is_verified?:boolean } | null;

function ini(s: string) { return (s || '?').split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase(); }

export function Marketplace({ me }: { me: Me }) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [sellers, setSellers]   = useState<Record<string, string>>({});
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [migrated, setMigrated] = useState(true);
  const [saved, setSaved]       = useState<Set<string>>(new Set());

  // BETA: any signed-in student can list. Verification stays optional (it still
  // earns the verified badge) — flip BETA_MODE off to require it again.
  const canSell = !!me && (BETA_MODE || me.verification_status === 'approved' || me.is_verified === true);

  async function load() {
    const sb = createClient();
    const { data, error } = await sb.from('market_listings').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(60);
    if (error) { setMigrated(false); setLoading(false); return; }
    const rows = (data || []) as Listing[];
    setListings(rows);
    if (rows.length) {
      const ids = Array.from(new Set(rows.map(r => r.user_id)));
      const { data: pp } = await sb.from('public_profiles').select('id, full_name').in('id', ids);
      const map: Record<string, string> = {};
      (pp || []).forEach((r: any) => { map[r.id] = r.full_name; });
      setSellers(map);
    }
    // Load this user's saved listings (optional table — ignore if not migrated)
    if (me) {
      try {
        const { data: sv } = await sb.from('market_saves').select('listing_id').eq('user_id', me.id);
        if (sv) setSaved(new Set(sv.map((r: any) => r.listing_id)));
      } catch { /* market_saves not migrated yet */ }
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggleSave(id: string) {
    if (!me) return;
    const sb = createClient();
    if (saved.has(id)) {
      await sb.from('market_saves').delete().eq('user_id', me.id).eq('listing_id', id);
      setSaved(prev => { const s = new Set(prev); s.delete(id); return s; });
    } else {
      const { error } = await sb.from('market_saves').insert({ user_id: me.id, listing_id: id });
      if (!error) setSaved(prev => new Set(prev).add(id));
    }
  }

  async function reportListing(id: string) {
    if (!me) return;
    const reason = window.prompt('Report this listing — what’s the issue? (optional)');
    if (reason === null) return; // cancelled
    const sb = createClient();
    await sb.from('market_reports').insert({ listing_id: id, reporter_id: me.id, reason: reason || null });
    alert('Thanks — our team will review this listing.');
  }

  async function removeListing(id: string) {
    if (!confirm('Remove this listing?')) return;
    const sb = createClient();
    const { error } = await sb.from('market_listings').update({ is_active: false }).eq('id', id);
    if (error) { alert(error.message); return; }
    setListings(prev => prev.filter(l => l.id !== id));
  }

  const shown = filter === 'All' ? listings : listings.filter(l => l.category === filter);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {showForm && me && <PostModal me={me} onClose={() => setShowForm(false)} onPosted={() => { setShowForm(false); load(); }} />}

      {/* Header + post button */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
        <div>
          <p style={{ margin:'0 0 2px', fontSize:15, fontWeight:800, color:'#12241C' }}>Student Marketplace</p>
          <p style={{ margin:0, fontSize:12.5, color:'#7D9188' }}>Buy & sell textbooks and dorm items with students on campus.</p>
        </div>
        {canSell ? (
          <button onClick={() => setShowForm(true)} className="ft-btn ft-btn-p" style={{ padding:'9px 16px' }}><PlusIcon /> Post an item</button>
        ) : (
          <Link href="/student/verify" className="ft-btn ft-btn-o" style={{ padding:'9px 16px' }}><ShieldIcon /> Get verified to sell</Link>
        )}
      </div>

      {/* Safety notice — Handout is not part of the transaction */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', borderRadius:12, background:'rgba(37,99,235,0.05)', border:'1px solid rgba(37,99,235,0.15)', fontSize:12.5, color:'#4C6157', lineHeight:1.5 }}>
        <span style={{ color:'#2563EB', display:'inline-flex', flexShrink:0 }}><ShieldIcon /></span>
        <span><strong style={{ color:'#12241C' }}>Trade safely.</strong> Meet in public campus locations and inspect items before exchanging money. Handout does not process payments during Beta.</span>
      </div>

      {!migrated && (
        <div style={{ border:'1px solid rgba(224,138,30,0.3)', borderRadius:14, padding:16, background:'rgba(224,138,30,0.06)', fontSize:13, color:'#4C6157' }}>
          The Marketplace isn’t active yet. Run <code style={{ background:'rgba(18,36,28,0.06)', padding:'1px 6px', borderRadius:6 }}>db/feature-3-marketplace.sql</code> in Supabase to enable it.
        </div>
      )}

      {/* Category filter */}
      {migrated && (
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {['All', ...CATEGORIES].map(c => (
            <button key={c} onClick={() => setFilter(c)} style={{
              padding:'6px 14px', borderRadius:100, fontSize:12.5, fontWeight:700, cursor:'pointer',
              border:`1px solid ${filter === c ? '#12A150' : 'rgba(18,36,28,0.12)'}`,
              background: filter === c ? '#12A150' : '#fff', color: filter === c ? '#fff' : '#7D9188', transition:'all .15s',
            }}>{c}</button>
          ))}
        </div>
      )}

      {/* Grid */}
      {migrated && (loading ? (
        <p style={{ fontSize:13, color:'#7D9188' }}>Loading listings…</p>
      ) : shown.length === 0 ? (
        <div style={{ background:'#fff', border:'1px solid rgba(18,36,28,0.09)', borderRadius:18, padding:'44px 22px', textAlign:'center' }}>
          <div style={{ color:'#7D9188', display:'inline-flex', marginBottom:10 }}><BoxIcon /></div>
          <p style={{ fontSize:13, color:'#7D9188', margin:0 }}>{filter === 'All' ? 'No items listed yet — be the first to sell something!' : `No ${filter.toLowerCase()} listings yet.`}</p>
        </div>
      ) : (
        <div className="rg-3" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
          {shown.map(l => {
            const img = Array.isArray(l.media) && l.media.length ? l.media[0] : '';
            const seller = sellers[l.user_id] || 'Student';
            const mine = me?.id === l.user_id;
            return (
              <div key={l.id} className="ft-card" style={{ overflow:'hidden', display:'flex', flexDirection:'column' }}>
                <div style={{ height:150, background:'#F1F7F3', position:'relative', flexShrink:0 }}>
                  {img
                    ? <img src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#B7C6BD' }}><BoxIcon /></div>}
                  <span style={{ position:'absolute', top:10, left:10, fontSize:10.5, fontWeight:800, color:'#0F8A44', background:'rgba(255,255,255,0.94)', borderRadius:100, padding:'3px 9px' }}>{l.category || 'Item'}</span>
                </div>
                <div style={{ padding:14, display:'flex', flexDirection:'column', gap:8, flex:1 }}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8 }}>
                    <span style={{ fontSize:14, fontWeight:700, color:'#12241C', lineHeight:1.3 }}>{l.title}</span>
                    <span className="ft-num" style={{ fontSize:15, color:'#12A150', flexShrink:0 }}>{l.price != null ? `$${Number(l.price).toFixed(0)}` : '—'}</span>
                  </div>
                  {l.description && <p style={{ margin:0, fontSize:12.5, color:'#4C6157', lineHeight:1.5, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{l.description}</p>}
                  <div style={{ display:'flex', alignItems:'center', gap:7, marginTop:2 }}>
                    <div style={{ width:24, height:24, borderRadius:'50%', background:'#12241C', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800, flexShrink:0 }}>{ini(seller)}</div>
                    <span style={{ fontSize:12, color:'#7D9188', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{seller}</span>
                  </div>
                  {mine ? (
                    <button onClick={() => removeListing(l.id)} className="ft-btn ft-btn-o" style={{ justifyContent:'center', marginTop:'auto', color:'#C25B4E', borderColor:'rgba(194,91,78,0.3)' }}><TrashIcon /> Remove</button>
                  ) : (
                    <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:'auto' }}>
                      <Link href={`/student/messages?to=${l.user_id}&name=${encodeURIComponent(seller)}&msg=${encodeURIComponent(`Hi! Is your "${l.title}" still available?`)}`} className="ft-btn ft-btn-p" style={{ justifyContent:'center' }}><ChatIcon /> Message seller</Link>
                      <div style={{ display:'flex', gap:8 }}>
                        <button onClick={() => toggleSave(l.id)} className="ft-btn ft-btn-o" style={{ flex:1, justifyContent:'center', color: saved.has(l.id) ? '#0F8A44' : undefined, borderColor: saved.has(l.id) ? 'rgba(18,161,80,0.4)' : undefined }}><BookmarkIcon filled={saved.has(l.id)} /> {saved.has(l.id) ? 'Saved' : 'Save'}</button>
                        <button onClick={() => reportListing(l.id)} className="ft-btn ft-btn-o" style={{ flex:1, justifyContent:'center' }}><FlagIcon /> Report</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ── Post-an-item modal (reuses processPickedFiles compression + listing-media bucket) ── */
function PostModal({ me, onClose, onPosted }: { me: { id:string }; onClose: () => void; onPosted: () => void }) {
  const [title, setTitle]       = useState('');
  const [category, setCategory] = useState('Textbook');
  const [price, setPrice]       = useState('');
  const [desc, setDesc]         = useState('');
  const [files, setFiles]       = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [busy, setBusy]         = useState(false);
  const [err, setErr]           = useState('');

  async function pick(list: FileList | null) {
    setErr('');
    const { files: picked, error } = await processPickedFiles(list);
    const images = picked.filter(f => f.type.startsWith('image/'));
    const next = [...files, ...images].slice(0, MAX_PHOTOS);
    setFiles(next);
    setPreviews(next.map(f => URL.createObjectURL(f)));
    if (error) setErr(error);
    else if (images.length + files.length > MAX_PHOTOS) setErr(`Up to ${MAX_PHOTOS} photos.`);
  }
  function removePhoto(i: number) {
    const next = files.filter((_, idx) => idx !== i);
    setFiles(next); setPreviews(next.map(f => URL.createObjectURL(f)));
  }

  async function submit() {
    // Item titles legitimately contain ":", "&", "/", edition numbers etc. — length-check only.
    const t = title.trim();
    const tErr = !t ? 'Title is required' : t.length < 3 ? 'Title must be at least 3 characters' : t.length > 90 ? 'Title must be under 90 characters' : '';
    const pErr = validatePrice(price, 'Price', { min: 0, max: 100000 });
    const dErr = validateParagraph(desc, 'Description', { max: 800 });
    if (tErr || pErr || dErr) { setErr(tErr || pErr || dErr); return; }
    setBusy(true); setErr('');
    const sb = createClient();

    const urls: string[] = [];
    for (const f of files) {
      const path = `${me.id}/market/${Date.now()}-${f.name.replace(/[^\w.\-]/g, '_')}`;
      const { error: upErr } = await sb.storage.from('listing-media').upload(path, f);
      if (!upErr) urls.push(sb.storage.from('listing-media').getPublicUrl(path).data.publicUrl);
    }

    const { error } = await sb.from('market_listings').insert({
      user_id: me.id, title: title.trim(), description: desc.trim() || null,
      price: parseFloat(price), category, media: urls, is_active: true,
    });
    setBusy(false);
    if (error) { setErr(error.message.includes('policy') ? 'Please sign in again to post an item.' : error.message); return; }
    awardPoints('list_item');
    onPosted();
  }

  return (
    <div style={OVERLAY} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background:'#fff', border:'1px solid rgba(18,36,28,0.12)', borderRadius:24, padding:'26px 24px', width:'100%', maxWidth:480, maxHeight:'92vh', overflowY:'auto' }}>
        <h3 style={{ fontSize:19, fontWeight:800, color:'#12241C', margin:'0 0 4px' }}>Post an item</h3>
        <p style={{ fontSize:12.5, color:'#7D9188', margin:'0 0 20px' }}>Books & dorm items only — no food or services.</p>

        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div>
            <label style={{ fontSize:12, color:'#7D9188', display:'block', marginBottom:6 }}>Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Calculus textbook (8th ed.)" style={INP} />
          </div>
          <div>
            <label style={{ fontSize:12, color:'#7D9188', display:'block', marginBottom:8 }}>Category</label>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {CATEGORIES.map(c => (
                <button key={c} type="button" onClick={() => setCategory(c)} style={{
                  padding:'7px 14px', borderRadius:100, fontSize:12.5, fontWeight:700, cursor:'pointer',
                  border:`1px solid ${category === c ? '#12A150' : 'rgba(18,36,28,0.12)'}`,
                  background: category === c ? 'rgba(18,161,80,0.10)' : 'transparent', color: category === c ? '#0F8A44' : '#7D9188',
                }}>{c}</button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize:12, color:'#7D9188', display:'block', marginBottom:6 }}>Price (USD)</label>
            <input value={price} onChange={e => setPrice(e.target.value.replace(/[^\d.]/g, ''))} inputMode="decimal" placeholder="e.g. 40" style={INP} />
          </div>
          <div>
            <label style={{ fontSize:12, color:'#7D9188', display:'block', marginBottom:6 }}>Description <span style={{ color:'#9aa8a0' }}>(optional)</span></label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} placeholder="Condition, edition, pickup details…" style={{ ...INP, height:'auto', padding:'10px 14px', resize:'none' }} />
          </div>
          <div>
            <label style={{ fontSize:12, color:'#7D9188', display:'block', marginBottom:8 }}>Photos <span style={{ color:'#9aa8a0' }}>(up to {MAX_PHOTOS})</span></label>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {previews.map((src, i) => (
                <div key={i} style={{ position:'relative', width:64, height:64, borderRadius:10, overflow:'hidden', border:'1px solid rgba(18,36,28,0.12)' }}>
                  <img src={src} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  <button onClick={() => removePhoto(i)} style={{ position:'absolute', top:2, right:2, width:18, height:18, borderRadius:'50%', background:'rgba(18,36,28,0.7)', color:'#fff', border:'none', cursor:'pointer', fontSize:11, lineHeight:1, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
                </div>
              ))}
              {files.length < MAX_PHOTOS && (
                <label style={{ width:64, height:64, borderRadius:10, border:'1.5px dashed rgba(18,36,28,0.2)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#7D9188', flexShrink:0 }}>
                  <PlusIcon />
                  <input type="file" accept="image/*" multiple hidden onChange={e => pick(e.target.files)} />
                </label>
              )}
            </div>
          </div>
        </div>

        {err && <div style={{ marginTop:14, padding:'10px 14px', borderRadius:10, background:'rgba(194,91,78,0.10)', border:'1px solid rgba(194,91,78,0.3)', color:'#C25B4E', fontSize:13 }}>{err}</div>}

        <div style={{ display:'flex', gap:10, marginTop:20 }}>
          <button onClick={submit} disabled={busy} className="ft-btn ft-btn-p" style={{ height:44, padding:'0 22px', fontSize:14, flex:1, justifyContent:'center' }}>{busy ? 'Posting…' : 'Post item'}</button>
          <button onClick={onClose} className="ft-btn ft-btn-o" style={{ height:44, padding:'0 20px', fontSize:14 }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

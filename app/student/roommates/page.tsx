'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { validateText, validateParagraph, validatePrice, validateIntlPhone } from '@/lib/validation';
import { processPickedFiles } from '@/lib/imageCompress';

const MAX_PHOTOS = 7;
type Media = { url: string; type: string };

const PinIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const CalIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const MoneyIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;

const FILTERS = ['all', 'have', 'need', 'sublet'] as const;
const COLORS   = ['#12A150','#2E7D5B','#C25B4E','#7C6BD1','#E08A1E','#4c6157','#0E2A19'];

function ini(s: string) { return (s || '?').split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase(); }

function ChipRow({ label, options, value, set }: { label: string; options: string[]; value: string; set: (v: string) => void }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#4c6157', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</label>
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
        {options.map(o => (
          <button type="button" key={o} onClick={() => set(value === o ? '' : o)}
            style={{ padding: '7px 13px', borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              border: `1px solid ${value === o ? '#12A150' : 'rgba(18,36,28,0.12)'}`,
              background: value === o ? 'rgba(18,161,80,0.10)' : '#fff',
              color: value === o ? '#0F8A44' : '#4c6157' }}>{o}</button>
        ))}
      </div>
    </div>
  );
}
function match(a: any, b: any) {
  let total = 0, score = 0;
  const flex = ['No preference', 'any', 'Any', '', null, undefined];
  const cmp = (x: any, y: any) => { total++; if (flex.includes(x) || flex.includes(y)) { score += 0.7; return; } if (String(x).toLowerCase() === String(y).toLowerCase()) score++; };
  [['diet','diet'],['smoking','smoking'],['pets','pets'],['gender_preference','gender_preference']].forEach(([ak, bk]) => cmp(a[ak], b[bk]));
  total++; score += (a.university && b.university && a.university.toLowerCase() === b.university.toLowerCase()) ? 1 : 0.5;
  total++; const ar = Number(a.rent), br = Number(b.rent);
  if (ar && br) { const d = Math.abs(ar - br) / Math.max(ar, br); score += d <= 0.15 ? 1 : d <= 0.3 ? 0.6 : 0.2; } else score += 0.5;
  return Math.round((score / total) * 100);
}

export default function RoommatesPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [names, setNames]       = useState<Record<string, string>>({});
  const [me, setMe]             = useState<any>(null);
  const [myListing, setMyListing] = useState<any>(null);
  const [filter, setFilter]     = useState<'all'|'have'|'need'|'sublet'>('all');
  const [showModal, setShowModal] = useState(false);
  const [myUni, setMyUni]   = useState('');
  // form — basics
  const [fType, setFType]   = useState<'have'|'need'|'sublet'>('have');
  const [fTitle, setFTitle] = useState('');
  const [fLoc, setFLoc]     = useState('');
  const [fRent, setFRent]   = useState('');
  const [fDate, setFDate]   = useState('');
  const [fDesc, setFDesc]   = useState('');
  // form — house details (asked for 'have' / 'sublet')
  const [fRoom, setFRoom]   = useState('');
  const [fOcc, setFOcc]     = useState('');
  const [fPhone, setFPhone] = useState('');
  // form — roommate preferences (all types; these drive the match %)
  const [fGender, setFGender] = useState('Any');
  const [fDiet, setFDiet]     = useState('No preference');
  const [fSmoke, setFSmoke]   = useState('No preference');
  const [fPets, setFPets]     = useState('No preference');
  // form — house photos (up to 7)
  const [photos, setPhotos]   = useState<Media[]>([]);
  const [uploading, setUploading] = useState(false);
  const [photoErr, setPhotoErr] = useState('');
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState('');
  const [fieldErrs, setFieldErrs] = useState<Record<string, string>>({});
  const clearErr = (k: string) => setFieldErrs(e => (e[k] ? { ...e, [k]: '' } : e));

  useEffect(() => {
    (async () => {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { window.location.href = '/auth/login'; return; }
      const [{ data: u }, { data: ls }, { data: sp }] = await Promise.all([
        sb.from('users').select('*').eq('id', user.id).single(),
        sb.from('roommate_listings').select('*').eq('is_active', true).order('created_at', { ascending: false }),
        sb.from('student_profiles').select('university').eq('user_id', user.id).maybeSingle(),
      ]);
      setMe(u);
      setMyUni(sp?.university || '');
      const all = ls || [];
      setListings(all);
      setMyListing(all.find(x => x.user_id === user.id) || null);
      const ids = Array.from(new Set(all.map((x: any) => x.user_id))) as string[];
      if (ids.length) {
        const { data: users } = await sb.from('public_profiles').select('id,full_name').in('id', ids);
        const map: Record<string, string> = {};
        (users || []).forEach((u: any) => { map[u.id] = u.full_name || 'Student'; });
        setNames(map);
      }
    })();
  }, []);

  const visible = filter === 'all' ? listings : listings.filter(l => l.listing_type === filter);

  const hasRoom = fType === 'have' || fType === 'sublet';

  function openModal(prefill?: any) {
    setFormErr(''); setFieldErrs({});
    if (prefill) {
      setFType(prefill.listing_type || 'have');
      setFTitle(prefill.title || ''); setFLoc(prefill.location || '');
      setFRent(prefill.rent ? String(prefill.rent) : ''); setFDate(prefill.available_from || '');
      setFDesc(prefill.description || '');
      setFRoom(prefill.room_type || ''); setFOcc(prefill.occupancy || ''); setFPhone(prefill.contact_phone || '');
      setFGender(prefill.gender_preference || 'Any'); setFDiet(prefill.diet || 'No preference');
      setFSmoke(prefill.smoking || 'No preference'); setFPets(prefill.pets || 'No preference');
      setPhotos(Array.isArray(prefill.media) ? prefill.media : []);
    } else {
      setPhotos([]);
    }
    setPhotoErr('');
    setShowModal(true);
  }

  async function pickPhotos(list: FileList | null) {
    if (!me) return;
    setPhotoErr('');
    const { files, error } = await processPickedFiles(list);
    const images = files.filter(f => f.type.startsWith('image/'));
    if (error) setPhotoErr(error);
    const room = MAX_PHOTOS - photos.length;
    if (room <= 0) { setPhotoErr(`You can add up to ${MAX_PHOTOS} photos.`); return; }
    const take = images.slice(0, room);
    if (images.length > room) setPhotoErr(`Only ${MAX_PHOTOS} photos allowed — extra photos were skipped.`);
    setUploading(true);
    const sb = createClient();
    const added: Media[] = [];
    for (const f of take) {
      const path = `${me.id}/roommate/${Date.now()}-${f.name.replace(/[^\w.\-]/g, '_')}`;
      const { error: upErr } = await sb.storage.from('listing-media').upload(path, f);
      if (!upErr) added.push({ url: sb.storage.from('listing-media').getPublicUrl(path).data.publicUrl, type: 'image' });
    }
    setPhotos(p => [...p, ...added]);
    setUploading(false);
  }
  function removePhoto(i: number) { setPhotos(p => p.filter((_, idx) => idx !== i)); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!me || saving) return;

    // ── Validate all fields (letters/numbers, ranges, limits) ──
    const errs: Record<string, string> = {
      title:       validateText(fTitle, 'Title', { min: 3, max: 60 }),
      location:    validateText(fLoc, 'Location', { min: 2, max: 60 }),
      rent:        validatePrice(fRent, fType === 'need' ? 'Budget' : 'Rent', { min: 1, max: 20000 }),
      description: validateParagraph(fDesc, 'Description', { max: 600 }),
    };
    if (fPhone.trim()) errs.phone = validateIntlPhone(fPhone);
    const cleaned = Object.fromEntries(Object.entries(errs).filter(([, v]) => v));
    setFieldErrs(cleaned);
    if (Object.keys(cleaned).length) return;

    setSaving(true); setFormErr('');
    const sb = createClient();
    const { error } = await sb.from('roommate_listings').upsert({
      ...(myListing ? { id: myListing.id } : {}),
      user_id: me.id, listing_type: fType, title: fTitle, location: fLoc,
      rent: fRent ? Number(fRent) : null, available_from: fDate || null, description: fDesc,
      room_type: hasRoom ? (fRoom || null) : null,
      occupancy: hasRoom ? (fOcc || null) : null,
      contact_phone: hasRoom ? (fPhone || null) : null,
      gender_preference: fGender, diet: fDiet, smoking: fSmoke, pets: fPets,
      media: hasRoom ? photos : [],
      university: myUni || null, is_active: true,
    });
    setSaving(false);
    if (error) { setFormErr(error.message); return; }
    setShowModal(false);
    window.location.reload();
  }

  const inp: React.CSSProperties = { width: '100%', height: 42, padding: '0 13px', background: '#F1F7F3', border: '1px solid rgba(18,36,28,0.12)', borderRadius: 10, color: '#12241C', fontSize: 13, outline: 'none' };
  const inpErr = (err?: string): React.CSSProperties => ({ ...inp, border: `1.5px solid ${err ? '#C25B4E' : 'rgba(18,36,28,0.12)'}` });
  const fLbl: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 700, color: '#4c6157', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.4 };
  const fErr: React.CSSProperties = { fontSize: 11.5, color: '#C25B4E', marginTop: 5, fontWeight: 600 };

  return (
    <StudentLayout title="Roommates">
      <div className="page-enter" style={{ maxWidth: 1100, margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="ft-num" style={{ fontSize: 26, color: '#12241C', margin: 0 }}>Find a roommate</h1>
            <p style={{ fontSize: 14, color: '#4c6157', marginTop: 4 }}>Verified students, matched to your lifestyle.</p>
          </div>
          <button onClick={() => openModal(myListing || undefined)} className="ft-btn ft-btn-p">{myListing ? 'Edit my listing' : '＋ Post a listing'}</button>
        </div>

        {myListing && (
          <div style={{ background: '#E7F1EA', border: '1px solid rgba(18,161,80,0.25)', borderRadius: 14, padding: '12px 16px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, fontSize: 13, color: '#12241C', fontWeight: 600 }}>Your listing: {myListing.title}</div>
            <button onClick={() => openModal(myListing)}
              style={{ fontSize: 12, color: '#0F8A44', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Edit</button>
            <button onClick={async () => { await createClient().from('roommate_listings').delete().eq('id', myListing.id); setMyListing(null); window.location.reload(); }}
              style={{ fontSize: 12, color: '#C25B4E', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 22 }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '8px 15px', borderRadius: 100, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', border: 'none', textTransform: 'capitalize',
                background: filter === f ? '#12A150' : '#fff',
                color: filter === f ? '#fff' : '#4c6157',
                boxShadow: filter === f ? 'none' : '0 0 0 1px rgba(18,36,28,0.12)' }}>
              {f === 'all' ? 'All matches' : f === 'have' ? 'Have a room' : f === 'need' ? 'Need a room' : 'Sublet'}
            </button>
          ))}
        </div>

        <div className="stagger-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(285px,1fr))', gap: 16 }}>
          {visible.map((l, i) => {
            const pct = match(myListing || me || {}, l);
            const cover = Array.isArray(l.media) ? l.media.find((m: any) => m?.type === 'image')?.url : null;
            return (
              <div key={l.id} className="ft-card" style={{ padding: 18 }}>
                {cover && (
                  <div style={{ margin: '-18px -18px 14px', height: 150, background: '#E7F1EA', position: 'relative', overflow: 'hidden', borderRadius: '18px 18px 0 0' }}>
                    <img src={cover} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {l.media.filter((m: any) => m?.type === 'image').length > 1 && (
                      <span style={{ position: 'absolute', bottom: 8, right: 8, fontSize: 10.5, fontWeight: 700, color: '#fff', background: 'rgba(18,36,28,0.6)', borderRadius: 100, padding: '3px 9px' }}>📷 {l.media.filter((m: any) => m?.type === 'image').length}</span>
                    )}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 50, background: COLORS[i % COLORS.length], color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{ini(names[l.user_id] || '')}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#12241C' }}>{names[l.user_id] || 'Student'}</div>
                    <div style={{ fontSize: 12, color: '#7d9188' }}>{l.listing_type === 'have' ? 'Has a room' : l.listing_type === 'need' ? 'Looking for room' : 'Sublet'}</div>
                  </div>
                  <span className="ft-num" style={{ fontSize: 15, color: '#12A150' }}>{pct}%</span>
                </div>
                <div style={{ height: 6, background: '#E7F1EA', borderRadius: 6, overflow: 'hidden', marginBottom: 14 }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#12A150,#5fd08c)', borderRadius: 6 }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5, color: '#4c6157', marginBottom: 14 }}>
                  {l.rent     && <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: '#7d9188', display: 'flex' }}><MoneyIcon /></span>${l.rent}/mo</span>}
                  {l.available_from && <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: '#7d9188', display: 'flex' }}><CalIcon /></span>Move-in: {l.available_from}</span>}
                  {l.location && <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: '#7d9188', display: 'flex' }}><PinIcon /></span>{l.location}</span>}
                </div>
                {(() => {
                  const chips = [l.room_type, l.occupancy,
                    l.diet !== 'No preference' ? l.diet : null,
                    l.smoking === 'Non-smoker' ? 'Non-smoker' : null,
                    l.pets === 'Pets OK' ? 'Pet-friendly' : l.pets === 'No pets' ? 'No pets' : null,
                  ].filter(Boolean) as string[];
                  return chips.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                      {chips.slice(0, 3).map(t => <span key={t} style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 100, background: '#E7F1EA', color: '#2E7D5B' }}>{t}</span>)}
                    </div>
                  );
                })()}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
                  <Link href={`/student/roommates/${l.id}`} className="ft-btn ft-btn-o" style={{ justifyContent: 'center' }}>View profile</Link>
                  <Link href={`/student/messages?to=${l.user_id}&name=${encodeURIComponent(names[l.user_id] || 'Student')}`} className="ft-btn ft-btn-p" style={{ justifyContent: 'center' }}>Connect</Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setShowModal(false)}>
          <form onSubmit={submit} style={{ background: '#fff', borderRadius: 20, padding: 28, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h3 className="ft-num" style={{ fontSize: 20, color: '#12241C', margin: '0 0 20px' }}>Post a listing</h3>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {(['have','need','sublet'] as const).map(t => (
                <button type="button" key={t} onClick={() => setFType(t)}
                  style={{ flex: 1, padding: '8px 0', borderRadius: 100, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none', textTransform: 'capitalize',
                    background: fType === t ? '#12A150' : '#F1F7F3', color: fType === t ? '#fff' : '#4c6157' }}>{t}</button>
              ))}
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={fLbl}>Title</label>
              <input value={fTitle} onChange={e => { setFTitle(e.target.value); clearErr('title'); }} placeholder="e.g. Cozy room near campus" style={inpErr(fieldErrs.title)} maxLength={60} />
              {fieldErrs.title && <div style={fErr}>{fieldErrs.title}</div>}
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={fLbl}>Location</label>
              <input value={fLoc} onChange={e => { setFLoc(e.target.value); clearErr('location'); }} placeholder="e.g. Glassboro, NJ" style={inpErr(fieldErrs.location)} maxLength={60} />
              {fieldErrs.location && <div style={fErr}>{fieldErrs.location}</div>}
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={fLbl}>{fType === 'need' ? 'Monthly Budget ($)' : 'Monthly Rent ($)'}</label>
              <input value={fRent} onChange={e => { setFRent(e.target.value.replace(/[^\d.]/g, '').slice(0, 8)); clearErr('rent'); }} inputMode="decimal" placeholder="e.g. 800" style={inpErr(fieldErrs.rent)} />
              {fieldErrs.rent && <div style={fErr}>{fieldErrs.rent}</div>}
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={fLbl}>{fType === 'need' ? 'Move-in Date' : 'Available From'}</label>
              <input value={fDate} onChange={e => setFDate(e.target.value)} type="date" style={inp} />
            </div>

            {/* House details — only when there's a room to describe */}
            {hasRoom && (
              <div style={{ background: '#F7FAF8', border: '1px solid rgba(18,36,28,0.08)', borderRadius: 14, padding: '14px 14px 4px', marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#0F8A44', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 }}>🏠 House details</div>
                <ChipRow label="Room type" options={['Private room', 'Shared room', 'Entire place']} value={fRoom} set={setFRoom} />
                <ChipRow label="Apartment size" options={['Studio', '1B1B', '2B1B', '2B2B', '3B+']} value={fOcc} set={setFOcc} />
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#4c6157', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.4 }}>Contact phone <span style={{ fontWeight: 500, textTransform: 'none' }}>(optional — shown as a Call button)</span></label>
                  <input value={fPhone} onChange={e => { setFPhone(e.target.value); clearErr('phone'); }} placeholder="+1 (856) 555-0142" type="tel" style={inpErr(fieldErrs.phone)} />
                  {fieldErrs.phone && <div style={fErr}>{fieldErrs.phone}</div>}
                </div>

                {/* House photos — up to 7 */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#4c6157', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.4 }}>Photos <span style={{ fontWeight: 500, textTransform: 'none' }}>(up to {MAX_PHOTOS} — show the room & place)</span></label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {photos.map((m, i) => (
                      <div key={i} style={{ position: 'relative', width: 66, height: 66, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(18,36,28,0.12)', flexShrink: 0 }}>
                        <img src={m.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button type="button" onClick={() => removePhoto(i)} aria-label="Remove photo" style={{ position: 'absolute', top: 2, right: 2, width: 18, height: 18, borderRadius: '50%', background: 'rgba(18,36,28,0.72)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                      </div>
                    ))}
                    {photos.length < MAX_PHOTOS && (
                      <label style={{ width: 66, height: 66, borderRadius: 10, border: '1.5px dashed rgba(18,36,28,0.22)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: uploading ? 'wait' : 'pointer', color: '#7d9188', flexShrink: 0, fontSize: 20 }}>
                        {uploading ? <span style={{ fontSize: 11 }}>…</span> : '＋'}
                        <input type="file" accept="image/*" multiple hidden disabled={uploading} onChange={e => { pickPhotos(e.target.files); e.target.value = ''; }} />
                      </label>
                    )}
                  </div>
                  {photoErr && <div style={fErr}>{photoErr}</div>}
                </div>
              </div>
            )}

            {/* Roommate preferences — drive the compatibility % */}
            <div style={{ background: '#F7FAF8', border: '1px solid rgba(18,36,28,0.08)', borderRadius: 14, padding: '14px 14px 4px', marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#0F8A44', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 }}>🤝 Roommate preferences</div>
              <p style={{ fontSize: 11.5, color: '#7d9188', margin: '0 0 12px' }}>These power your compatibility score with other students.</p>
              <ChipRow label="Preferred gender" options={['Any', 'Male', 'Female']} value={fGender} set={setFGender} />
              <ChipRow label="Diet" options={['No preference', 'Vegetarian', 'Non-vegetarian']} value={fDiet} set={setFDiet} />
              <ChipRow label="Smoking" options={['Non-smoker', 'Smoker OK', 'No preference']} value={fSmoke} set={setFSmoke} />
              <ChipRow label="Pets" options={['Pets OK', 'No pets', 'No preference']} value={fPets} set={setFPets} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={fLbl}>Description</label>
              <textarea value={fDesc} onChange={e => { setFDesc(e.target.value); clearErr('description'); }} rows={3} maxLength={600} placeholder={hasRoom ? 'Describe the place — furnishing, utilities, lease length, who lives there…' : 'What are you looking for?'} style={{ ...inpErr(fieldErrs.description), height: 'auto', padding: '10px 13px', resize: 'vertical' }} />
              {fieldErrs.description && <div style={fErr}>{fieldErrs.description}</div>}
            </div>
            {formErr && (
              <div style={{ marginBottom: 14, padding: '10px 13px', background: '#FBEDE9', border: '1px solid rgba(194,91,78,0.3)', borderRadius: 10, fontSize: 12.5, color: '#C25B4E' }}>
                Could not save: {formErr}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => setShowModal(false)} className="ft-btn ft-btn-o" style={{ flex: 1 }}>Cancel</button>
              <button type="submit" className="ft-btn ft-btn-p" style={{ flex: 1 }} disabled={saving}>{saving ? 'Saving…' : myListing ? 'Save changes' : 'Post listing'}</button>
            </div>
          </form>
        </div>
      )}
    </StudentLayout>
  );
}

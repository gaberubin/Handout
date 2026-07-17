'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/* ── Onboarding SVG icons ── */
const OB_Food  = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>;
const OB_Tutor = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const OB_Ride  = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.38 2 2 0 0 1 3.58 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.08 6.08l1.02-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const OB_Baby  = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/><path d="M6.5 10a5.5 5.5 0 0 1 11 0v2H6.5v-2z"/><path d="M3 16a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v4H3v-4z"/></svg>;
const OB_Clean = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const OB_Pet   = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg>;
const OB_Move  = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
const OB_Other = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;

const SERVICES = [
  { id:'food',        Icon: OB_Food,  label:'Home-cooked Food',  desc:'Tiffin, meal prep, home kitchen' },
  { id:'tutoring',    Icon: OB_Tutor, label:'Tutoring',          desc:'Academic subjects, test prep' },
  { id:'rides',       Icon: OB_Ride,  label:'Airport Rides',     desc:'Licensed driver, flat rates' },
  { id:'babysitting', Icon: OB_Baby,  label:'Babysitting',       desc:'Childcare for student families' },
  { id:'cleaning',    Icon: OB_Clean, label:'Cleaning',          desc:'Home, apartment, deep clean' },
  { id:'petcare',     Icon: OB_Pet,   label:'Pet Care',          desc:'Dog walking, sitting, grooming' },
  { id:'moving',      Icon: OB_Move,  label:'Moving Help',       desc:'Local moves, furniture, boxes' },
  { id:'other',       Icon: OB_Other, label:'Other / Multiple',  desc:'Tell us what you offer' },
];

const I: React.CSSProperties = { width:'100%', height:46, padding:'0 14px', background:'rgba(18,36,28,0.05)', border:'1px solid rgba(18,36,28,0.12)', borderRadius:10, color:'#12241C', fontSize:14, boxSizing:'border-box', outline:'none' };
const L: React.CSSProperties = { display:'block', fontSize:12, fontWeight:700, color:'#4c6157', marginBottom:6, letterSpacing:0.4 };

export default function VendorOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  // Step 3 listing fields
  const [lTitle, setLTitle] = useState('');
  const [lDesc, setLDesc] = useState('');
  const [lPrice, setLPrice] = useState('');
  const [lUnit, setLUnit] = useState('per hour');

  async function finish() {
    setErr(''); setSaving(true);
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { router.push('/auth/login'); return; }

    // Update user role + profile
    await sb.from('users').update({ role: 'vendor', full_name: name.trim() || undefined }).eq('id', user.id);
    await sb.from('provider_profiles').upsert({ user_id: user.id, bio: bio.trim(), phone: phone.trim(), location: location.trim(), services: selected }, { onConflict: 'user_id' });

    // Create first listing if filled
    if (lTitle.trim()) {
      const isFood = selected.includes('food') && selected.length === 1;
      if (isFood) {
        await sb.from('tiffin_listings').insert({ user_id: user.id, name: lTitle.trim(), description: lDesc.trim(), price_per_meal: parseFloat(lPrice) || null, location: location.trim(), cuisine: 'Other', is_active: true });
      } else {
        await sb.from('service_listings').insert({ user_id: user.id, title: lTitle.trim(), description: lDesc.trim(), rate: lPrice ? parseFloat(lPrice) : null, rate_type: lUnit || 'hr', category: selected[0] || 'other', location: location.trim(), is_active: true });
      }
    }

    // Notification to self welcoming them
    await sb.from('notifications').insert({ user_id: user.id, type: 'system', title: 'Welcome to Handout!', message: 'Your provider profile is live. Students can now find and book your services.' });

    setSaving(false);
    router.push('/vendor/dashboard');
  }

  const progress = ((step - 1) / 3) * 100;

  return (
    <div style={{ minHeight:'100vh', background:'#F1F7F3', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px 16px' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:32 }}>
        <div style={{ width:34, height:34, background:'#12A150', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:17, color:'#ffffff' }}>H</div>
        <span style={{ fontWeight:800, fontSize:18, color:'#12241C', letterSpacing:-0.5 }}>Handout for Vendors</span>
      </div>

      {/* Progress bar */}
      <div style={{ width:'100%', maxWidth:520, marginBottom:28 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
          {['What you offer','Your profile','First listing','All done'].map((s,i) => (
            <span key={i} style={{ fontSize:11, fontWeight:700, color: step > i+1 ? '#12A150' : step === i+1 ? '#12A150' : 'rgba(255,255,255,0.2)', textTransform:'uppercase', letterSpacing:0.5 }}>{s}</span>
          ))}
        </div>
        <div style={{ height:4, background:'rgba(18,36,28,0.06)', borderRadius:100 }}>
          <div style={{ height:'100%', width:`${progress}%`, background:'linear-gradient(90deg,#12A150,#12A150)', borderRadius:100, transition:'width 0.4s ease' }} />
        </div>
      </div>

      <div style={{ width:'100%', maxWidth:520, background:'var(--navy2)', border:'1px solid rgba(18,36,28,0.09)', borderRadius:24, padding:'32px 28px' }}>

        {/* ── STEP 1: What do you offer ── */}
        {step === 1 && (
          <>
            <h2 style={{ fontSize:24, fontWeight:800, color:'#12241C', letterSpacing:-0.8, marginBottom:6 }}>What do you offer?</h2>
            <p style={{ fontSize:14, color:'#7d9188', marginBottom:24 }}>Pick one or more — you can add more later.</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:24 }}>
              {SERVICES.map(s => {
                const on = selected.includes(s.id);
                return (
                  <button key={s.id} onClick={() => setSelected(on ? selected.filter(x=>x!==s.id) : [...selected, s.id])}
                    style={{ padding:'14px', borderRadius:14, border:`1.5px solid ${on?'#12A150':'rgba(18,36,28,0.09)'}`, background:on?'rgba(18,161,80,0.07)':'transparent', cursor:'pointer', textAlign:'left', transition:'all 0.15s' }}>
                    <div style={{ marginBottom:6, display:'inline-flex', color: on?'#12A150':'#7d9188' }}><s.Icon /></div>
                    <div style={{ fontSize:13, fontWeight:700, color: on?'#12A150':'#12241C', marginBottom:2 }}>{s.label}</div>
                    <div style={{ fontSize:11, color:'#7d9188', lineHeight:1.4 }}>{s.desc}</div>
                  </button>
                );
              })}
            </div>
            <button onClick={() => { if (!selected.length) { setErr('Pick at least one service'); return; } setErr(''); setStep(2); }}
              style={{ width:'100%', height:48, borderRadius:100, background:'#12A150', color:'#ffffff', fontWeight:800, fontSize:15, border:'none', cursor:'pointer' }}>
              Continue →
            </button>
            {err && <p style={{ color:'#C25B4E', fontSize:13, marginTop:10, textAlign:'center' }}>{err}</p>}
          </>
        )}

        {/* ── STEP 2: Profile ── */}
        {step === 2 && (
          <>
            <h2 style={{ fontSize:24, fontWeight:800, color:'#12241C', letterSpacing:-0.8, marginBottom:6 }}>Your profile</h2>
            <p style={{ fontSize:14, color:'#7d9188', marginBottom:24 }}>This is what students see when they find you.</p>
            <div style={{ display:'flex', flexDirection:'column', gap:14, marginBottom:24 }}>
              <div><label style={L}>YOUR NAME</label><input style={I} value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Priya's Kitchen" /></div>
              <div><label style={L}>SHORT BIO</label>
                <textarea value={bio} onChange={e=>setBio(e.target.value)} placeholder="Tell students about yourself and what makes your service great…"
                  style={{ ...I, height:'auto', padding:'10px 14px', resize:'vertical', lineHeight:1.5, fontFamily:'inherit' }} rows={3} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div><label style={L}>PHONE (optional)</label><input style={I} value={phone} onChange={e=>setPhone(e.target.value)} placeholder="10-digit number" /></div>
                <div><label style={L}>YOUR CITY / AREA</label><input style={I} value={location} onChange={e=>setLocation(e.target.value)} placeholder="e.g. Glassboro, NJ" /></div>
              </div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setStep(1)} style={{ flex:1, height:48, borderRadius:100, background:'transparent', border:'1px solid rgba(18,36,28,0.12)', color:'#7d9188', fontWeight:700, cursor:'pointer' }}>← Back</button>
              <button onClick={() => { if (!name.trim()) { setErr('Enter your name or business name'); return; } setErr(''); setStep(3); }}
                style={{ flex:2, height:48, borderRadius:100, background:'#12A150', color:'#ffffff', fontWeight:800, fontSize:15, border:'none', cursor:'pointer' }}>
                Continue →
              </button>
            </div>
            {err && <p style={{ color:'#C25B4E', fontSize:13, marginTop:10, textAlign:'center' }}>{err}</p>}
          </>
        )}

        {/* ── STEP 3: First listing ── */}
        {step === 3 && (
          <>
            <h2 style={{ fontSize:24, fontWeight:800, color:'#12241C', letterSpacing:-0.8, marginBottom:6 }}>Add your first listing</h2>
            <p style={{ fontSize:14, color:'#7d9188', marginBottom:24 }}>Students will see this when they browse. You can skip and add it later.</p>
            <div style={{ display:'flex', flexDirection:'column', gap:14, marginBottom:24 }}>
              <div><label style={L}>LISTING TITLE</label><input style={I} value={lTitle} onChange={e=>setLTitle(e.target.value)} placeholder={selected.includes('food') ? 'e.g. Daily Indian Tiffin – 2 meals' : 'e.g. Calculus tutoring – all levels'} /></div>
              <div><label style={L}>DESCRIPTION</label>
                <textarea value={lDesc} onChange={e=>setLDesc(e.target.value)} placeholder="What's included? What makes it great?"
                  style={{ ...I, height:'auto', padding:'10px 14px', resize:'vertical', lineHeight:1.5, fontFamily:'inherit' }} rows={3} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div><label style={L}>PRICE ($)</label><input style={I} type="number" value={lPrice} onChange={e=>setLPrice(e.target.value)} placeholder="e.g. 15" /></div>
                <div><label style={L}>UNIT</label>
                  <select value={lUnit} onChange={e=>setLUnit(e.target.value)} style={{ ...I, cursor:'pointer', appearance:'none' as any }}>
                    {['per hour','per meal','per session','per trip','per visit','per day'].map(u=><option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setStep(2)} style={{ flex:1, height:48, borderRadius:100, background:'transparent', border:'1px solid rgba(18,36,28,0.12)', color:'#7d9188', fontWeight:700, cursor:'pointer' }}>← Back</button>
              <button onClick={finish} disabled={saving}
                style={{ flex:2, height:48, borderRadius:100, background:'#12A150', color:'#ffffff', fontWeight:800, fontSize:15, border:'none', cursor:'pointer', opacity: saving?0.7:1 }}>
                {saving ? 'Setting up…' : lTitle.trim() ? 'Finish & go live' : 'Skip & finish →'}
              </button>
            </div>
            {err && <p style={{ color:'#C25B4E', fontSize:13, marginTop:10, textAlign:'center' }}>{err}</p>}
          </>
        )}

      </div>

      <p style={{ marginTop:20, fontSize:12, color:'#7d9188', textAlign:'center' }}>
        Already have an account? <a href="/vendor/dashboard" style={{ color:'#12A150', textDecoration:'none' }}>Go to dashboard →</a>
      </p>
    </div>
  );
}

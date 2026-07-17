'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { COUNTRIES, US_STATES, dialFor } from '@/lib/countries';
import { CountrySelect } from '@/components/ui/CountrySelect';
import { AddressAutocomplete } from '@/components/ui/AddressAutocomplete';
// CountrySelect + dialFor still used for address block below
import { validateName, validateZip, validateRequired, validateIdNumber, normalizeIntl } from '@/lib/validation';
import { UniversitySelect } from '@/components/ui/UniversitySelect';

const GENDERS = ['Male', 'Female', 'Non-binary', 'Other'];
const ID_TYPES = ["Driver's License", 'Passport', 'National ID', 'State ID'];

export default function Onboarding() {
  const [phase, setPhase] = useState<'loading' | 'form' | 'pending' | 'rejected'>('loading');
  const [role, setRole] = useState('student');
  const [notes, setNotes] = useState('');

  // form state
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('');
  const [country, setCountry] = useState('United States');
  const [phone, setPhone] = useState('');
  const [stateV, setStateV] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [address, setAddress] = useState('');
  const [university, setUniversity] = useState('');
  const [idType, setIdType] = useState("Driver's License");
  const [idNumber, setIdNumber] = useState('');
  const [idFile, setIdFile] = useState<File | null>(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/auth/login'; return; }
      const { data: u } = await supabase.from('users').select('*').eq('id', user.id).single();
      setRole(u?.role || 'student');
      setFullName(u?.full_name || '');
      // Admins have full access — never show them the verification form.
      if (u?.role === 'admin') { window.location.href = '/admin/users'; return; }
      if (u?.verification_status === 'approved') {
        window.location.href = u.role === 'vendor' ? '/vendor/dashboard' : u.role === 'admin' ? '/admin/users' : '/student/dashboard';
        return;
      }
      const { data: v } = await supabase.from('verifications').select('*').eq('user_id', user.id).maybeSingle();
      if (v?.status === 'pending') { setPhase('pending'); return; }
      if (v?.status === 'rejected') { setNotes(v.notes || ''); setPhase('rejected'); return; }
      setPhase('form');
    })();
  }, []);

  const dial = dialFor(country);
  const isUS = country === 'United States';

  async function submit() {
    setErr('');
    const e =
      validateName(fullName) ||
      validateRequired(gender, 'Gender') ||
      validateRequired(country, 'Country') ||
      (!phone ? 'Phone number is required' : '') ||
      (isUS ? validateRequired(stateV, 'State') : '') ||
      validateRequired(city, 'City') ||
      validateZip(zip) ||
      validateRequired(address, 'Address') ||
      validateRequired(university, 'University') ||
      validateIdNumber(idNumber) ||
      (!idFile ? 'Please upload a photo of your ID' : '');
    if (e) { setErr(e); return; }

    setBusy(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setBusy(false); return; }

    // Upload ID to the PRIVATE bucket (path must start with the user's id)
    const ext = (idFile!.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `${user.id}/id-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from('id-documents').upload(path, idFile!, { upsert: true });
    if (upErr) { setBusy(false); setErr('ID upload failed: ' + upErr.message + ' (run db/storage-setup.sql)'); return; }

    // Make sure the user's row exists (it may have been wiped by a schema rebuild).
    // ignoreDuplicates → does nothing if the row already exists, so the real role is kept.
    const metaRole = (user.user_metadata as any)?.role || role || 'student';
    await supabase.from('users').upsert(
      { id: user.id, email: user.email, role: metaRole },
      { onConflict: 'id', ignoreDuplicates: true }
    );

    // Save profile details
    const { error: uErr } = await supabase.from('users').update({
      full_name: fullName.trim(), gender, country, country_code: dial,
      state: isUS ? stateV : stateV.trim(), city: city.trim(), zip: zip.trim(),
      address: address.trim(), phone: normalizeIntl(phone),
      verification_status: 'pending', onboarded: true,
    }).eq('id', user.id);
    if (uErr) { setBusy(false); setErr('Could not save: ' + uErr.message); return; }

    if (role === 'student') {
      await supabase.from('student_profiles').upsert({ user_id: user.id, university: university.trim() }, { onConflict: 'user_id' });
    } else {
      await supabase.from('provider_profiles').upsert({ user_id: user.id, service_area: city.trim() }, { onConflict: 'user_id' });
    }

    const { error: vErr } = await supabase.from('verifications').upsert({
      user_id: user.id, id_type: idType, id_number: idNumber.trim(),
      id_doc_path: path, status: 'pending', notes: null, submitted_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
    if (vErr) { setBusy(false); setErr('Could not submit verification: ' + vErr.message); return; }

    setBusy(false);
    setPhase('pending');
  }

  async function signOut() { await createClient().auth.signOut(); window.location.href = '/'; }

  // Beta: verification is OPTIONAL. Skipping marks onboarding complete and lets
  // the student into the app — the verification system stays fully intact.
  async function skipForNow() {
    setBusy(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from('users').update({ onboarded: true }).eq('id', user.id);
    window.location.href = role === 'vendor' ? '/vendor/dashboard' : '/student/dashboard';
  }

  const L: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#4c6157', display: 'block', marginBottom: 6 };
  const I: React.CSSProperties = { width: '100%', height: 44, padding: '0 14px', background: 'rgba(18,36,28,0.04)', border: '1px solid rgba(18,36,28,0.12)', borderRadius: 10, color: '#12241C', fontSize: 14, boxSizing: 'border-box' };
  const wrap: React.CSSProperties = { minHeight: '100vh', background: '#F1F7F3', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 };

  if (phase === 'loading') return <div style={{ ...wrap, color: '#7d9188' }}>Loading…</div>;

  if (phase === 'pending') return (
    <div style={wrap}><div style={{ maxWidth: 440, textAlign: 'center', background: '#FFFFFF', border: '1px solid rgba(18,36,28,0.09)', borderRadius: 20, padding: 40 }}>
      <div style={{ fontSize: 44, marginBottom: 14, display:'inline-flex', color:'var(--amber)' }}><svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
      <h1 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 24, fontWeight: 800, color: '#12241C', marginBottom: 10 }}>Verification submitted</h1>
      <p style={{ fontSize: 14, color: '#4c6157', lineHeight: 1.6, marginBottom: 22 }}>Thanks! Our team is reviewing your ID. You'll get access to your dashboard as soon as you're approved. This usually takes a little while.</p>
      <button onClick={signOut} style={{ height: 44, padding: '0 22px', background: 'rgba(18,36,28,0.06)', border: '1px solid rgba(18,36,28,0.12)', borderRadius: 100, color: '#12241C', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Sign out</button>
    </div></div>
  );

  return (
    <div style={{ ...wrap, alignItems: 'flex-start' }}>
      <div style={{ width: '100%', maxWidth: 560, margin: '40px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 36, height: 36, background: '#12A150', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, color: '#ffffff' }}>H</div>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#12241C' }}>Handout</div>
        </div>
        <h1 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 28, fontWeight: 800, letterSpacing: -1, color: '#12241C', marginBottom: 6 }}>Verify your identity <span style={{ fontSize: 14, fontWeight: 700, color: '#12A150' }}>· optional</span></h1>
        <p style={{ fontSize: 14, color: '#7d9188', marginBottom: 22 }}>Verification is optional during Beta — it boosts trust and unlocks future features. You can skip this and do it anytime. Your ID is private; only admins can see it.</p>

        {phase === 'rejected' && (
          <div style={{ background: 'rgba(194,91,78,0.1)', border: '1px solid rgba(194,91,78,0.3)', color: '#C25B4E', borderRadius: 10, padding: '12px 14px', fontSize: 13, marginBottom: 16 }}>
            Your previous submission was rejected{notes ? `: ${notes}` : '.'} Please re-submit with correct details.
          </div>
        )}
        {err && <div style={{ background: 'rgba(194,91,78,0.1)', border: '1px solid rgba(194,91,78,0.3)', color: '#C25B4E', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>{err}</div>}

        <div style={{ background: '#FFFFFF', border: '1px solid rgba(18,36,28,0.09)', borderRadius: 18, padding: 26, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div><label style={L}>Full legal name</label><input style={I} value={fullName} onChange={e => setFullName(e.target.value)} maxLength={60} placeholder="As it appears on your ID" /></div>

          <div>
            <label style={L}>Gender</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {GENDERS.map(g => (
                <button key={g} type="button" onClick={() => setGender(g)} style={{ padding: '9px 16px', borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: `1px solid ${gender === g ? '#12A150' : 'rgba(18,36,28,0.12)'}`, background: gender === g ? 'rgba(18,161,80,0.12)' : 'transparent', color: gender === g ? '#12A150' : '#4c6157' }}>{g}</button>
              ))}
            </div>
          </div>

          <div>
            <label style={L}>Phone number</label>
            <input
              style={I}
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/[^\d\s\-()+ ]/g, ''))}
              placeholder="(856) 123-4567"
            />
          </div>

          <div>
            <label style={L}>Street address <span style={{ color: '#7d9188' }}>(start typing — autofills city/state/ZIP)</span></label>
            <AddressAutocomplete
              style={I}
              onTextChange={(v) => setAddress(v)}
              onSelect={(a) => {
                if (a.street) setAddress(a.street);
                if (a.city) setCity(a.city);
                if (a.state) setStateV(a.state);
                if (a.zip) setZip(a.zip);
                if (a.country && COUNTRIES.some(c => c.name === a.country)) setCountry(a.country);
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={L}>State / Province</label>
              {isUS
                ? <select style={{ ...I, cursor: 'pointer' }} value={stateV} onChange={e => setStateV(e.target.value)}><option value="">Select…</option>{US_STATES.map(s => <option key={s} value={s}>{s}</option>)}</select>
                : <input style={I} value={stateV} onChange={e => setStateV(e.target.value)} placeholder="State / Province" />}
            </div>
            <div><label style={L}>City</label><input style={I} value={city} onChange={e => setCity(e.target.value)} placeholder="City" /></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={L}>ZIP / Postal code</label><input style={I} value={zip} onChange={e => setZip(e.target.value)} placeholder="08028" /></div>
            <div><label style={L}>University</label><UniversitySelect value={university} onChange={setUniversity} inputStyle={I} /></div>
          </div>

          <div style={{ height: 1, background: 'rgba(18,36,28,0.09)', margin: '4px 0' }} />
          <div style={{ fontSize: 13, fontWeight: 700, color: '#12241C', display:'flex', alignItems:'center', gap:6 }}><span style={{ display:'inline-flex', color:'var(--amber)' }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></span> ID verification</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={L}>ID type</label><select style={{ ...I, cursor: 'pointer' }} value={idType} onChange={e => setIdType(e.target.value)}>{ID_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            <div><label style={L}>ID number</label><input style={I} value={idNumber} onChange={e => setIdNumber(e.target.value)} placeholder="License / passport no." /></div>
          </div>

          <div>
            <label style={L}>Photo of your ID <span style={{ color: '#7d9188' }}>(stays private)</span></label>
            <input type="file" accept="image/*,application/pdf" onChange={e => setIdFile(e.target.files?.[0] || null)} style={{ ...I, height: 'auto', padding: 10, cursor: 'pointer' }} />
            {idFile && <p style={{ fontSize: 12, color: '#12A150', marginTop: 6 }}>{idFile.name}</p>}
          </div>

          <button onClick={submit} disabled={busy} style={{ height: 48, background: '#12A150', color: '#ffffff', border: 'none', borderRadius: 100, fontWeight: 700, fontSize: 15, cursor: 'pointer', opacity: busy ? 0.6 : 1 }}>{busy ? 'Submitting…' : 'Submit for verification'}</button>
          <button onClick={skipForNow} disabled={busy} style={{ height: 46, background: 'transparent', color: '#12A150', border: '1.5px solid rgba(18,161,80,0.3)', borderRadius: 100, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Skip for now — explore Handout →</button>
          <button onClick={signOut} style={{ height: 42, background: 'transparent', color: '#7d9188', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Sign out</button>
        </div>
      </div>
    </div>
  );
}

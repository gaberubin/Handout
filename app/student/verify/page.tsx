'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { processPickedFiles } from '@/lib/imageCompress';
import { validateText } from '@/lib/validation';
import { awardPoints } from '@/lib/points';

/* ── Icons ── */
const ShieldCheck = ({ size = 22 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>;
const CardIcon = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><line x1="6" y1="14" x2="10" y2="14"/></svg>;
const SelfieIcon = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
const CheckCircle = ({ size = 64 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const ClockIcon = ({ size = 64 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;

type Phase = 'loading' | 'form' | 'pending' | 'approved' | 'rejected';

export default function StudentVerifyPage() {
  const [phase, setPhase] = useState<Phase>('loading');
  const [me, setMe] = useState<any>(null);
  const [notes, setNotes] = useState<string>('');

  const [idNumber, setIdNumber] = useState('');
  const [idFile, setIdFile] = useState<File | null>(null);
  const [idPreview, setIdPreview] = useState<string | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [saveErr, setSaveErr] = useState('');

  const idRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { window.location.href = '/auth/login'; return; }
      const [{ data: u }, { data: v }] = await Promise.all([
        sb.from('users').select('id, full_name, is_verified, verification_status').eq('id', user.id).single(),
        sb.from('verifications').select('status, notes, id_number').eq('user_id', user.id).maybeSingle(),
      ]);
      setMe(u);
      setNotes(v?.notes || '');
      if (v?.id_number) setIdNumber(v.id_number);
      if (u?.is_verified || v?.status === 'approved') setPhase('approved');
      else if (v?.status === 'pending') setPhase('pending');
      else if (v?.status === 'rejected') setPhase('rejected');
      else setPhase('form');
    })();
  }, []);

  async function pick(kind: 'id' | 'selfie', list: FileList | null) {
    const { files, error } = await processPickedFiles(list);
    const f = files[0];
    if (error && !f) { setErrors(e => ({ ...e, [kind]: error })); return; }
    if (!f) return;
    const url = URL.createObjectURL(f);
    if (kind === 'id') { setIdFile(f); setIdPreview(url); }
    else { setSelfieFile(f); setSelfiePreview(url); }
    setErrors(e => ({ ...e, [kind]: '' }));
  }

  function validate(): boolean {
    const e: Record<string, string> = {
      idNumber: validateText(idNumber, 'Student ID number', { min: 3, max: 30 }),
    };
    if (!idFile) e.id = 'Upload a photo of your student ID card';
    if (!selfieFile) e.selfie = 'Take or upload a selfie';
    const cleaned = Object.fromEntries(Object.entries(e).filter(([, v]) => v));
    setErrors(cleaned);
    return Object.keys(cleaned).length === 0;
  }

  async function submit() {
    if (!validate() || busy) return;
    setBusy(true); setSaveErr('');
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { setSaveErr('Please sign in again.'); setBusy(false); return; }

    try {
      const up = async (file: File, tag: string) => {
        const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
        const path = `${user.id}/${tag}-${Date.now()}.${ext}`;
        const { error } = await sb.storage.from('id-documents').upload(path, file, { upsert: true });
        if (error) throw new Error(`${tag} upload failed: ${error.message} (run db/storage-setup.sql)`);
        return path;
      };
      const idPath = await up(idFile!, 'id');
      const selfiePath = await up(selfieFile!, 'selfie');

      const { error: vErr } = await sb.from('verifications').upsert({
        user_id: user.id, id_type: 'Student ID', id_number: idNumber.trim(),
        id_doc_path: idPath, selfie_path: selfiePath,
        status: 'pending', notes: null, submitted_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
      if (vErr) throw new Error(vErr.message);

      await sb.from('users').update({ verification_status: 'pending' }).eq('id', user.id);
      awardPoints('get_verified');
      setBusy(false); setPhase('pending');
    } catch (err: any) {
      setBusy(false); setSaveErr(err.message || 'Something went wrong.');
    }
  }

  /* ── Status screens ── */
  if (phase === 'loading') return <StudentLayout title="Verification"><div style={{ padding: 40, color: '#7d9188' }}>Loading…</div></StudentLayout>;

  if (phase === 'approved') return (
    <StudentLayout title="Verification">
      <StatusCard color="#12A150" bg="rgba(18,161,80,0.10)" icon={<CheckCircle />}
        title="You're verified ✓"
        body="Your student status is confirmed. The verified badge now shows on your profile, roommate listings, and Campus Connect."
        cta={{ href: '/student/profile', label: 'View profile' }} />
    </StudentLayout>
  );

  if (phase === 'pending') return (
    <StudentLayout title="Verification">
      <StatusCard color="#B5761A" bg="#FDF0DC" icon={<ClockIcon />}
        title="Verification under review"
        body="We've received your student ID and selfie. Our team reviews submissions within 24 hours — you'll get a notification once it's approved."
        cta={{ href: '/student/dashboard', label: 'Back to dashboard' }} />
    </StudentLayout>
  );

  return (
    <StudentLayout title="Verification">
      <div style={{ maxWidth: 620, margin: '0 auto' }}>
        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg,#12A150,#0d7a3d)', borderRadius: 20, padding: '24px 26px', color: '#fff', marginBottom: 22, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><ShieldCheck size={26} /></div>
          <div>
            <h2 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 20, fontWeight: 800, margin: '0 0 3px' }}>Become verified <span style={{ fontSize: 12, fontWeight: 700, background: 'rgba(255,255,255,0.2)', borderRadius: 100, padding: '2px 9px', marginLeft: 4, verticalAlign: 'middle' }}>Optional</span></h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', margin: 0, lineHeight: 1.5 }}>Every Beta feature is free without verifying. Verification just adds trust — it&apos;s completely up to you.</p>
          </div>
        </div>

        {/* Why verify — optional benefits */}
        <div style={{ background: '#fff', border: '1px solid rgba(18,36,28,0.09)', borderRadius: 16, padding: '18px 20px', marginBottom: 22 }}>
          <p style={{ margin: '0 0 12px', fontSize: 13.5, fontWeight: 800, color: '#12241C' }}>What verified students get</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 10 }}>
            {[
              ['🛡️', 'Higher trust', 'Students know you’re real'],
              ['✅', 'Verified badge', 'Shown on your profile & listings'],
              ['🏠', 'Better roommate visibility', 'Stand out in matching'],
              ['⭐', 'Priority in future features', 'First access as we ship more'],
            ].map(([e, t, d]) => (
              <div key={t} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{e}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#12241C' }}>{t}</div>
                  <div style={{ fontSize: 11.5, color: '#7D9188' }}>{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {phase === 'rejected' && (
          <div style={{ background: '#FBEDE9', border: '1px solid rgba(194,91,78,0.3)', borderRadius: 12, padding: '12px 15px', marginBottom: 18, fontSize: 13, color: '#C25B4E' }}>
            <strong>Previous submission was rejected.</strong>{notes ? ` Reason: ${notes}` : ''} Please re-submit clear photos below.
          </div>
        )}

        {/* Student ID number */}
        <div style={{ marginBottom: 18 }}>
          <label style={lbl}>Student ID number</label>
          <input value={idNumber} onChange={e => { setIdNumber(e.target.value); setErrors(x => ({ ...x, idNumber: '' })); }} placeholder="As printed on your student ID card" style={inp(errors.idNumber)} maxLength={30} />
          {errors.idNumber && <div style={err}>{errors.idNumber}</div>}
        </div>

        {/* Uploads */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 6 }} className="rg-2">
          <UploadTile
            title="Student ID card" hint="Photo of your college/university ID"
            Icon={CardIcon} preview={idPreview} err={errors.id}
            onClick={() => idRef.current?.click()} />
          <UploadTile
            title="Selfie" hint="A clear photo of your face"
            Icon={SelfieIcon} preview={selfiePreview} err={errors.selfie}
            onClick={() => selfieRef.current?.click()} />
        </div>
        <input ref={idRef} type="file" accept="image/*" hidden onChange={e => pick('id', e.target.files)} />
        <input ref={selfieRef} type="file" accept="image/*" capture="user" hidden onChange={e => pick('selfie', e.target.files)} />

        <p style={{ fontSize: 12, color: '#7d9188', lineHeight: 1.6, margin: '16px 0 20px' }}>
          🔒 Your ID and selfie are stored privately and only reviewed by our verification team. They're never shown to other students.
        </p>

        {saveErr && <div style={{ ...err, marginBottom: 14, padding: '10px 13px', background: '#FBEDE9', border: '1px solid rgba(194,91,78,0.3)', borderRadius: 10 }}>{saveErr}</div>}

        <button onClick={submit} disabled={busy}
          style={{ width: '100%', height: 50, background: '#12A150', color: '#fff', border: 'none', borderRadius: 100, fontSize: 15, fontWeight: 800, cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.7 : 1 }}>
          {busy ? 'Submitting…' : 'Submit for verification'}
        </button>
      </div>
    </StudentLayout>
  );
}

function UploadTile({ title, hint, Icon, preview, err, onClick }: { title: string; hint: string; Icon: React.FC; preview: string | null; err?: string; onClick: () => void }) {
  return (
    <div>
      <button onClick={onClick} type="button"
        style={{ width: '100%', aspectRatio: '4/3', borderRadius: 16, border: `1.5px dashed ${err ? '#C25B4E' : preview ? '#12A150' : 'rgba(18,36,28,0.18)'}`, background: preview ? '#000' : '#F1F7F3', cursor: 'pointer', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12 }}>
        {preview ? (
          <>
            <img src={preview} alt={title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            <span style={{ position: 'absolute', bottom: 8, right: 8, background: '#12A150', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 100 }}>Change</span>
          </>
        ) : (
          <>
            <span style={{ color: '#12A150' }}><Icon /></span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#12241C' }}>{title}</span>
            <span style={{ fontSize: 11, color: '#7d9188', textAlign: 'center', lineHeight: 1.4 }}>{hint}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#0F8A44', marginTop: 2 }}>Tap to add photo</span>
          </>
        )}
      </button>
      {err && <div style={errStyle}>{err}</div>}
    </div>
  );
}

function StatusCard({ color, bg, icon, title, body, cta }: { color: string; bg: string; icon: React.ReactNode; title: string; body: string; cta: { href: string; label: string } }) {
  return (
    <div style={{ maxWidth: 460, margin: '32px auto', textAlign: 'center', padding: '0 20px' }}>
      <div style={{ width: 96, height: 96, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px', color }}>{icon}</div>
      <h2 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 24, fontWeight: 800, color: '#12241C', marginBottom: 10 }}>{title}</h2>
      <p style={{ fontSize: 14, color: '#7d9188', lineHeight: 1.65, marginBottom: 28 }}>{body}</p>
      <Link href={cta.href} style={{ display: 'inline-block', padding: '12px 28px', background: '#12A150', borderRadius: 100, color: '#fff', fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>{cta.label}</Link>
    </div>
  );
}

const lbl: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 700, color: '#4c6157', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 };
const inp = (e?: string): React.CSSProperties => ({ width: '100%', boxSizing: 'border-box', height: 44, padding: '0 14px', background: '#F1F7F3', border: `1.5px solid ${e ? '#C25B4E' : 'rgba(18,36,28,0.12)'}`, borderRadius: 10, color: '#12241C', fontSize: 14, outline: 'none' });
const err: React.CSSProperties = { fontSize: 11.5, color: '#C25B4E', marginTop: 5, fontWeight: 600 };
const errStyle: React.CSSProperties = { fontSize: 11.5, color: '#C25B4E', marginTop: 5, fontWeight: 600 };

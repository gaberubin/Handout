'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { getDefaultPackage } from '@/lib/welcome-packages';
import { validateText, validateParagraph, validateInt, validateIntlPhone } from '@/lib/validation';

const COMMUNITIES = ['Any', 'South Indian', 'North Indian', 'Gujarati', 'Punjabi', 'Pakistani', 'Bangladeshi', 'Chinese', 'Korean', 'Vietnamese', 'Filipino', 'Latino', 'African', 'European', 'Middle Eastern'];

const BackIcon    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const CheckIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const PlaneIcon   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21 4 19.5 2.5 18 1 16 1 14.5 2.5L11 6 2.8 4.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 6.2 7.3c.4.4.9.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>;
const HouseIcon   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const FoodWIcon   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>;
const CarWIcon    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
const CartWIcon   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>;
const CapWIcon    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>;
const PhoneWIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>;
const BankWIcon   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const HouseHuntIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const ChatWIcon   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const PhoneCallIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.38 2 2 0 0 1 3.58 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.08 6.08l1.02-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;

const INCLUSIONS = [
  { key: 'airport_pickup',    Icon: PlaneIcon,    label: (p: any) => `Airport pickup${p.airport_served ? ` — ${p.airport_served}` : ''}` },
  { key: 'nights_stay',       Icon: HouseIcon,    label: (p: any) => `${p.nights_stay} night${p.nights_stay !== 1 ? 's' : ''} accommodation`, check: (p: any) => p.nights_stay > 0 },
  { key: 'meals_included',    Icon: FoodWIcon,    label: (p: any) => `${p.meals_included} home-cooked meal${p.meals_included !== 1 ? 's' : ''}`, check: (p: any) => p.meals_included > 0 },
  { key: 'dropoff_included',  Icon: CarWIcon,     label: () => 'Drop-off to your apartment' },
  { key: 'grocery_run',       Icon: CartWIcon,    label: () => 'Grocery run included' },
  { key: 'campus_tour',       Icon: CapWIcon,     label: () => 'Campus orientation tour' },
  { key: 'sim_card_help',     Icon: PhoneWIcon,   label: () => 'SIM card setup help' },
  { key: 'bank_account_help', Icon: BankWIcon,    label: () => 'Bank account setup guidance' },
  { key: 'housing_hunt_help', Icon: HouseHuntIcon,label: () => 'Help with housing search' },
];

export default function WelcomePackageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [pkg, setPkg] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ── Request-intake modal ──
  const [showReq, setShowReq] = useState(false);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState('');
  const [req, setReq] = useState({
    arrival_airport: '', arrival_date: '', arrival_time: '', flight_number: '',
    destination_city: '', destination_address: '', university: '',
    community_pref: 'Any', num_people: '1', dietary: '', notes: '', contact_phone: '',
  });
  const [reqErr, setReqErr] = useState<Record<string, string>>({});
  const setR = (k: string, v: string) => { setReq(s => ({ ...s, [k]: v })); if (reqErr[k]) setReqErr(e => ({ ...e, [k]: '' })); };

  function openRequest() {
    setSaveErr(''); setReqErr({});
    setReq(s => ({ ...s, community_pref: pkg?.community && pkg.community !== 'Any' ? pkg.community : 'Any' }));
    // prefill university + phone from profile
    (async () => {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return;
      const [{ data: u }, { data: sp }] = await Promise.all([
        sb.from('users').select('phone').eq('id', user.id).maybeSingle(),
        sb.from('student_profiles').select('university').eq('user_id', user.id).maybeSingle(),
      ]);
      setReq(s => ({ ...s, university: sp?.university || s.university, contact_phone: u?.phone || s.contact_phone }));
    })();
    setShowReq(true);
  }

  function validateReq(): boolean {
    const e: Record<string, string> = {
      arrival_airport:  validateText(req.arrival_airport, 'Airport', { min: 2, max: 40 }),
      destination_city: validateText(req.destination_city, 'City', { min: 2, max: 60 }),
      num_people:       validateInt(req.num_people, 'People', { min: 1, max: 20, required: true }),
      contact_phone:    validateIntlPhone(req.contact_phone),
      notes:            validateParagraph(req.notes, 'Notes', { max: 400 }),
    };
    if (!req.arrival_date) e.arrival_date = 'Arrival date is required';
    if (req.destination_address.trim()) e.destination_address = validateText(req.destination_address, 'Address', { min: 3, max: 120, required: false });
    if (req.dietary.trim()) e.dietary = validateText(req.dietary, 'Dietary', { min: 2, max: 60, required: false });
    const cleaned = Object.fromEntries(Object.entries(e).filter(([, v]) => v));
    setReqErr(cleaned);
    return Object.keys(cleaned).length === 0;
  }

  async function submitRequest() {
    if (!validateReq() || saving) return;
    setSaving(true); setSaveErr('');
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { setSaveErr('Please sign in again.'); setSaving(false); return; }
    const hostId = pkg?.host_id || null;   // curated → null (admin assigns); host pkg → that host
    const { error } = await sb.from('welcome_requests').insert({
      student_id: user.id,
      package_ref: String(pkg?.id ?? ''),
      package_title: pkg?.title || null,
      package_tier: pkg?.tier || null,
      package_price: pkg?.price ?? null,
      arrival_airport: req.arrival_airport.trim(),
      arrival_date: req.arrival_date || null,
      arrival_time: req.arrival_time.trim() || null,
      flight_number: req.flight_number.trim() || null,
      destination_city: req.destination_city.trim(),
      destination_address: req.destination_address.trim() || null,
      university: req.university.trim() || null,
      community_pref: req.community_pref,
      num_people: Number(req.num_people) || 1,
      dietary: req.dietary.trim() || null,
      notes: req.notes.trim() || null,
      contact_phone: req.contact_phone.trim(),
      status: hostId ? 'assigned' : 'pending',
      assigned_host_id: hostId,
    });
    setSaving(false);
    if (error) { setSaveErr(error.message); return; }
    setShowReq(false); setDone(true);
  }

  useEffect(() => {
    if (!id) return;
    // Curated catalog packages resolve instantly, no DB row needed.
    const curated = getDefaultPackage(id);
    if (curated) { setPkg(curated); setLoading(false); return; }
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/auth/login'; return; }
      const { data } = await supabase
        .from('welcome_packages')
        .select('*, users:public_profiles(id, full_name, avatar_url)')
        .eq('id', id)
        .single();
      if (!data) { router.push('/student/welcome'); return; }
      setPkg(data);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return (
    <StudentLayout title="Welcome Package">
      <div style={{ maxWidth: 720, margin: '40px auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[1, 2, 3].map(i => <div key={i} style={{ height: 80, background: 'var(--navy2)', borderRadius: 16, opacity: 0.4 }} />)}
      </div>
    </StudentLayout>
  );

  const host = pkg.users;
  const hostName = host?.full_name || 'Host';
  const hostInitials = hostName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  const tierColor = pkg.tier === 'premium' ? '#7C6BD1' : pkg.tier === 'standard' ? '#12A150' : pkg.tier === 'basic' ? '#2E7D5B' : '#0E9E8E';
  const isCurated = !!pkg.curated;

  const activeInclusions = INCLUSIONS.filter(inc => {
    if (inc.check) return inc.check(pkg);
    return !!pkg[inc.key];
  });

  return (
    <StudentLayout title={pkg.title || 'Welcome Package'}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        {/* Back */}
        <button onClick={() => router.back()}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: 13, cursor: 'pointer', marginBottom: 20, padding: 0 }}>
          <BackIcon /> Back to Welcome Packages
        </button>

        {/* Hero */}
        <div style={{ background: 'var(--navy2)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ height: 6, background: `linear-gradient(90deg,${tierColor},${tierColor}88)` }} />
          <div style={{ padding: '24px 24px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, padding: '3px 10px', borderRadius: 100, background: `${tierColor}22`, color: tierColor, textTransform: 'uppercase' }}>{pkg.tier}</span>
              {pkg.community && <span style={{ fontSize: 12, color: 'var(--muted)', display:'inline-flex', alignItems:'center', gap:3 }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> {pkg.community} community</span>}
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--white)', marginBottom: 6, letterSpacing: -0.5 }}>{pkg.title}</h1>
            <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--amber)', marginBottom: 8, letterSpacing: -1 }}>
              ${pkg.price}
              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--muted)', marginLeft: 6 }}>total</span>
            </div>
            {pkg.description && <p style={{ fontSize: 14, color: 'var(--light)', lineHeight: 1.65, margin: 0 }}>{pkg.description}</p>}
          </div>
        </div>

        <div className="rg-side" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 280px', gap: 20, alignItems: 'start' }}>
          {/* Left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* What's included */}
            <section style={{ background: 'var(--navy2)', border: '1px solid var(--border)', borderRadius: 18, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(18,36,28,0.07)' }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--white)' }}>What's Included</span>
              </div>
              {activeInclusions.length === 0 ? (
                <div style={{ padding: '20px', fontSize: 13, color: 'var(--muted)' }}>Contact host for details on what's included.</div>
              ) : (
                <div style={{ padding: '8px 0' }}>
                  {activeInclusions.map((inc, i) => (
                    <div key={inc.key} style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: i < activeInclusions.length - 1 ? '1px solid rgba(18,36,28,0.04)' : 'none' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(18,161,80,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--amber)' }}>
                        <inc.Icon />
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--light)', fontWeight: 500 }}>{inc.label(pkg)}</div>
                      <div style={{ marginLeft: 'auto', color: '#12A150', flexShrink: 0 }}><CheckIcon /></div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Notes */}
            {pkg.notes && (
              <section style={{ background: 'var(--navy2)', border: '1px solid var(--border)', borderRadius: 18, padding: '18px 20px' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--white)', marginBottom: 8 }}>Additional Notes</div>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.65, margin: 0 }}>{pkg.notes}</p>
              </section>
            )}
          </div>

          {/* Right: host card + CTA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {isCurated ? (
              /* Curated catalog package — matched with a verified host on request */
              <div style={{ background: 'var(--navy2)', border: '1px solid var(--border)', borderRadius: 16, padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ display: 'inline-flex', color: '#12A150' }}><CheckIcon /></span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--white)' }}>Handout Verified Package</span>
                </div>
                <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>
                  A standard Handout welcome package. Request it and we'll match you with a background-checked host from your community — you confirm the details together.
                </p>
              </div>
            ) : (
              /* Host card */
              <div style={{ background: 'var(--navy2)', border: '1px solid var(--border)', borderRadius: 16, padding: '18px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 12 }}>Your Host</div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                  {host?.avatar_url
                    ? <img src={host.avatar_url} alt={hostInitials} style={{ width: 48, height: 48, borderRadius: 14, objectFit: 'cover', flexShrink: 0 }} />
                    : <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(18,161,80,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: 'var(--amber)', flexShrink: 0 }}>{hostInitials}</div>}
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--white)' }}>{hostName}</div>
                    {host?.email && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{host.email}</div>}
                  </div>
                </div>
                {host?.phone && <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8, display:'flex', alignItems:'center', gap:4 }}><PhoneCallIcon />{host.phone}</div>}
              </div>
            )}

            {/* Request package → intake form */}
            {done ? (
              <div style={{ background: 'rgba(18,161,80,0.08)', border: '1px solid rgba(18,161,80,0.25)', borderRadius: 12, padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: 26, marginBottom: 6 }}>✅</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#0F8A44', marginBottom: 4 }}>Request received!</div>
                <div style={{ fontSize: 12.5, color: 'var(--body)', lineHeight: 1.5 }}>
                  {isCurated
                    ? 'Our team will match you with a verified host from your community and reach out over messages within 24 hours.'
                    : `We've sent your arrival details to ${hostName}. They'll confirm over messages within 24 hours.`}
                </div>
              </div>
            ) : (
              <button onClick={openRequest}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, background: 'var(--amber)', border: 'none', borderRadius: 12, color: '#ffffff', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
                <span style={{ display:'inline-flex', alignItems:'center', gap:6 }}><ChatWIcon /> Request this package</span>
              </button>
            )}

            <div style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.5 }}>
              Tell us your arrival details and we'll {isCurated ? 'match you with a host' : 'send them to your host'}. No payment now.
            </div>

            <Link href="/student/welcome"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 38, background: 'transparent', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--muted)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
              Browse other packages
            </Link>
          </div>
        </div>
      </div>

      {/* ── Request intake modal ── */}
      {showReq && (
        <div style={reqOverlay} onClick={() => setShowReq(false)}>
          <div style={reqModal} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 20, fontWeight: 800, color: '#12241C', margin: '0 0 4px' }}>Request your welcome</h3>
            <p style={{ fontSize: 13, color: '#7d9188', margin: '0 0 18px' }}>{pkg.title} · ${pkg.price}. Fill in your arrival details — we'll match you with a host.</p>

            <RField label="Arrival airport" error={reqErr.arrival_airport}>
              <input value={req.arrival_airport} onChange={e => setR('arrival_airport', e.target.value)} placeholder="e.g. JFK, LAX, ORD — any airport" style={reqInp(reqErr.arrival_airport)} maxLength={40} />
            </RField>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <RField label="Arrival date" error={reqErr.arrival_date}>
                <input type="date" value={req.arrival_date} onChange={e => setR('arrival_date', e.target.value)} style={reqInp(reqErr.arrival_date)} />
              </RField>
              <RField label="Arrival time (optional)">
                <input value={req.arrival_time} onChange={e => setR('arrival_time', e.target.value)} placeholder="e.g. 3:45 PM" style={reqInp('')} maxLength={20} />
              </RField>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <RField label="Flight number (optional)">
                <input value={req.flight_number} onChange={e => setR('flight_number', e.target.value.toUpperCase())} placeholder="e.g. AA184" style={reqInp('')} maxLength={12} />
              </RField>
              <RField label="Travellers" error={reqErr.num_people}>
                <input value={req.num_people} onChange={e => setR('num_people', e.target.value.replace(/\D/g, '').slice(0, 2))} inputMode="numeric" placeholder="1" style={reqInp(reqErr.num_people)} />
              </RField>
            </div>

            <RField label="Preferred destination city" error={reqErr.destination_city}>
              <input value={req.destination_city} onChange={e => setR('destination_city', e.target.value)} placeholder="City you're arriving to — anywhere" style={reqInp(reqErr.destination_city)} maxLength={60} />
            </RField>

            <RField label="Address / area (optional)" error={reqErr.destination_address}>
              <input value={req.destination_address} onChange={e => setR('destination_address', e.target.value)} placeholder="Dorm, apartment, or neighbourhood if known" style={reqInp(reqErr.destination_address)} maxLength={120} />
            </RField>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <RField label="University (optional)">
                <input value={req.university} onChange={e => setR('university', e.target.value)} placeholder="Your university" style={reqInp('')} maxLength={80} />
              </RField>
              <RField label="Preferred community">
                <select value={req.community_pref} onChange={e => setR('community_pref', e.target.value)} style={reqInp('')}>
                  {COMMUNITIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </RField>
            </div>

            <RField label="Dietary preferences (optional)" error={reqErr.dietary}>
              <input value={req.dietary} onChange={e => setR('dietary', e.target.value)} placeholder="e.g. Vegetarian, Halal, no nuts" style={reqInp(reqErr.dietary)} maxLength={60} />
            </RField>

            <RField label="Contact phone" error={reqErr.contact_phone}>
              <input value={req.contact_phone} onChange={e => setR('contact_phone', e.target.value)} type="tel" placeholder="+1 (856) 555-0142" style={reqInp(reqErr.contact_phone)} maxLength={20} />
            </RField>

            <RField label="Anything else? (optional)" error={reqErr.notes}>
              <textarea value={req.notes} onChange={e => setR('notes', e.target.value)} rows={2} placeholder="Special requests, extra luggage, family with you…" style={{ ...reqInp(reqErr.notes), height: 'auto', resize: 'vertical', fontFamily: 'inherit' }} maxLength={400} />
            </RField>

            {saveErr && <div style={{ ...reqErrStyle, marginBottom: 12 }}>{saveErr}</div>}

            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button onClick={() => setShowReq(false)} style={reqBtnOutline}>Cancel</button>
              <button onClick={submitRequest} disabled={saving} style={{ ...reqBtnPrimary, opacity: saving ? 0.6 : 1 }}>{saving ? 'Sending…' : 'Send request'}</button>
            </div>
          </div>
        </div>
      )}
    </StudentLayout>
  );
}

function RField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 13 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#4c6157', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</label>
      {children}
      {error && <div style={reqErrStyle}>{error}</div>}
    </div>
  );
}

const reqInp = (err?: string): React.CSSProperties => ({
  width: '100%', boxSizing: 'border-box', height: 42, padding: '0 13px',
  background: '#F1F7F3', border: `1.5px solid ${err ? '#C25B4E' : 'rgba(18,36,28,0.12)'}`,
  borderRadius: 10, color: '#12241C', fontSize: 14, outline: 'none',
});
const reqErrStyle: React.CSSProperties = { fontSize: 11.5, color: '#C25B4E', marginTop: 5, fontWeight: 600 };
const reqOverlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(18,36,28,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 };
const reqModal: React.CSSProperties = { background: '#fff', borderRadius: 20, padding: 26, width: '100%', maxWidth: 520, maxHeight: '92vh', overflowY: 'auto' };
const reqBtnPrimary: React.CSSProperties = { flex: 1, height: 44, background: '#12A150', color: '#fff', border: 'none', borderRadius: 100, fontSize: 14, fontWeight: 700, cursor: 'pointer' };
const reqBtnOutline: React.CSSProperties = { flex: 1, height: 44, background: '#fff', color: '#12241C', border: '1.5px solid rgba(18,36,28,0.12)', borderRadius: 100, fontSize: 14, fontWeight: 700, cursor: 'pointer' };

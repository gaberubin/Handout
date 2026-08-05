'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { StudentLayout } from '@/components/layout/StudentLayout';

/* ── Icons ── */
const BackIcon    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const PinIcon     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const CalIcon     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const BedIcon     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>;
const SchoolIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>;
const ChatIcon    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const UserIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const DollarIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const PhoneIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.09 6.09l1.97-1.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const CheckIcon   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const XIcon       = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const ImgIcon     = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;

const card: React.CSSProperties = {
  background: '#FFFFFF', 
  border: '1px solid rgba(18,36,28,0.09)', borderRadius: 16,
};

function fmt(date?: string) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function Badge({ label, ok }: { label: string; ok?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(18,36,28,0.04)', borderRadius: 10, border: '1px solid rgba(18,36,28,0.07)' }}>
      <span style={{ color: ok ? '#12A150' : '#C25B4E', display: 'inline-flex' }}>{ok ? <CheckIcon /> : <XIcon />}</span>
      <span style={{ fontSize: 13, color: '#4c6157' }}>{label}</span>
    </div>
  );
}

export default function RoommateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [listing, setListing] = useState<any>(null);
  const [poster, setPoster] = useState<any>(null);
  const [myListing, setMyListing] = useState<any>(null);
  const [meId, setMeId] = useState('');
  const [imgIdx, setImgIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }
      setMeId(user.id);

      const [{ data: l }, { data: mine }] = await Promise.all([
        sb.from('roommate_listings').select('*').eq('id', id).single(),
        sb.from('roommate_listings').select('*').eq('user_id', user.id).eq('is_active', true).maybeSingle(),
      ]);
      if (!l) { setLoading(false); return; }
      setListing(l);
      setMyListing(mine);

      const { data: u } = await sb.from('public_profiles').select('id, full_name, avatar_url').eq('id', l.user_id).single();
      setPoster(u);
      setLoading(false);
    })();
  }, [id]);

  function matchScore(a: any, b: any) {
    if (!a || !b) return null;
    let total = 0, score = 0;
    const flex = ['No preference', 'any', 'Any', '', null, undefined];
    const cmp = (x: any, y: any) => { total++; if (flex.includes(x) || flex.includes(y)) { score += 0.7; return; } if (String(x).toLowerCase() === String(y).toLowerCase()) score += 1; };
    cmp(a.diet, b.diet); cmp(a.smoking, b.smoking); cmp(a.pets, b.pets); cmp(a.occupancy, b.occupancy);
    total++;
    if (a.university && b.university) score += a.university.toLowerCase() === b.university.toLowerCase() ? 1 : 0.3;
    else score += 0.5;
    return Math.round((score / total) * 100);
  }

  if (loading) return (
    <StudentLayout title="Listing">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, color: '#7d9188', fontSize: 14 }}>Loading…</div>
    </StudentLayout>
  );

  if (!listing) return (
    <StudentLayout title="Not Found">
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <p style={{ color: '#7d9188', fontSize: 14 }}>This listing doesn't exist or was removed.</p>
        <Link href="/student/roommates" style={{ color: '#12A150', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>← Back to Roommates</Link>
      </div>
    </StudentLayout>
  );

  const media: { url: string; type: string }[] = listing.media || [];
  const images = media.filter(m => m.type === 'image');
  const typeLabel = listing.listing_type === 'have' ? 'Room Available' : listing.listing_type === 'sublet' ? 'Subletting' : 'Looking for Room';
  const typeColor = listing.listing_type === 'sublet' ? '#E08A1E' : listing.listing_type === 'have' ? '#12A150' : '#12A150';
  const match = matchScore(myListing, listing);
  const isOwn = listing.user_id === meId;
  const ini = (s: string) => (s || '?').split(' ').map((x: string) => x[0]).join('').slice(0, 2).toUpperCase();

  return (
    <StudentLayout title="Listing Detail">
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '28px 0 80px' }}>

        {/* Back */}
        <Link href="/student/roommates" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#7d9188', fontSize: 13, fontWeight: 600, textDecoration: 'none', marginBottom: 20 }}>
          <BackIcon /> Back to Roommates
        </Link>

        <div className="rg-side" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>

          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Photo gallery — only when there ARE photos. "Looking for a room"
                listings have no place to show, so an empty grey placeholder was
                just dead space; those listings now lead with their details. */}
            {images.length > 0 && (
            <div style={{ ...card, overflow: 'hidden', padding: 0 }}>
              {(
                <div style={{ position: 'relative' }}>
                  <img src={images[imgIdx].url} alt="" style={{ width: '100%', height: 340, objectFit: 'cover', display: 'block' }} />
                  {images.length > 1 && (
                    <>
                      <button onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}
                        style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
                      <button onClick={() => setImgIdx(i => (i + 1) % images.length)}
                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
                      <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
                        {images.map((_, i) => (
                          <div key={i} onClick={() => setImgIdx(i)} style={{ width: i === imgIdx ? 20 : 6, height: 6, borderRadius: 3, background: i === imgIdx ? '#12A150' : 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'all .2s' }} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            )}

            {/* Title + type */}
            <div style={card}>
              <div style={{ padding: '20px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 20, background: `${typeColor}18`, color: typeColor, border: `1px solid ${typeColor}30` }}>{typeLabel}</span>
                  {match !== null && (
                    <span style={{ fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 20, background: match >= 75 ? 'rgba(18,161,80,0.12)' : 'rgba(18,36,28,0.06)', color: match >= 75 ? '#12A150' : '#7d9188', border: `1px solid ${match >= 75 ? 'rgba(18,161,80,0.25)' : 'rgba(18,36,28,0.09)'}` }}>
                      {match}% match
                    </span>
                  )}
                </div>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: '#12241C', margin: '0 0 8px', letterSpacing: -0.5 }}>{listing.title || 'Roommate Listing'}</h1>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 13, color: '#7d9188' }}>
                  {listing.location && <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><PinIcon />{listing.location}</span>}
                  {listing.university && <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><SchoolIcon />{listing.university}</span>}
                  {listing.rent && <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#12A150', fontWeight: 700 }}><DollarIcon />${listing.rent}/mo</span>}
                </div>
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div style={{ ...card, padding: '20px 22px' }}>
                <p style={{ fontSize: 11, fontWeight: 800, color: '#7d9188', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 10px' }}>About this listing</p>
                <p style={{ fontSize: 14, color: '#4c6157', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>{listing.description}</p>
              </div>
            )}

            {/* Details grid */}
            <div style={{ ...card, padding: '20px 22px' }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: '#7d9188', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 14px' }}>Details</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {listing.room_type && (
                  <div style={{ padding: '10px 14px', background: 'rgba(18,36,28,0.04)', borderRadius: 10, border: '1px solid rgba(18,36,28,0.07)' }}>
                    <p style={{ margin: '0 0 2px', fontSize: 10, fontWeight: 700, color: '#7d9188', textTransform: 'uppercase', letterSpacing: 0.5 }}>Room type</p>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#12241C', display: 'flex', alignItems: 'center', gap: 6 }}><BedIcon />{listing.room_type}</p>
                  </div>
                )}
                {listing.bathroom && (
                  <div style={{ padding: '10px 14px', background: 'rgba(18,36,28,0.04)', borderRadius: 10, border: '1px solid rgba(18,36,28,0.07)' }}>
                    <p style={{ margin: '0 0 2px', fontSize: 10, fontWeight: 700, color: '#7d9188', textTransform: 'uppercase', letterSpacing: 0.5 }}>Bathroom</p>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#12241C' }}>{listing.bathroom}</p>
                  </div>
                )}
                {listing.occupancy && (
                  <div style={{ padding: '10px 14px', background: 'rgba(18,36,28,0.04)', borderRadius: 10, border: '1px solid rgba(18,36,28,0.07)' }}>
                    <p style={{ margin: '0 0 2px', fontSize: 10, fontWeight: 700, color: '#7d9188', textTransform: 'uppercase', letterSpacing: 0.5 }}>Apartment</p>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#12241C' }}>{listing.occupancy}</p>
                  </div>
                )}
                {listing.furnished && (
                  <div style={{ padding: '10px 14px', background: 'rgba(18,36,28,0.04)', borderRadius: 10, border: '1px solid rgba(18,36,28,0.07)' }}>
                    <p style={{ margin: '0 0 2px', fontSize: 10, fontWeight: 700, color: '#7d9188', textTransform: 'uppercase', letterSpacing: 0.5 }}>Furnished</p>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#12241C' }}>{listing.furnished}</p>
                  </div>
                )}
                {listing.lease_length && (
                  <div style={{ padding: '10px 14px', background: 'rgba(18,36,28,0.04)', borderRadius: 10, border: '1px solid rgba(18,36,28,0.07)' }}>
                    <p style={{ margin: '0 0 2px', fontSize: 10, fontWeight: 700, color: '#7d9188', textTransform: 'uppercase', letterSpacing: 0.5 }}>Lease</p>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#12241C' }}>{listing.lease_length}</p>
                  </div>
                )}
                {listing.gender_preference && (
                  <div style={{ padding: '10px 14px', background: 'rgba(18,36,28,0.04)', borderRadius: 10, border: '1px solid rgba(18,36,28,0.07)' }}>
                    <p style={{ margin: '0 0 2px', fontSize: 10, fontWeight: 700, color: '#7d9188', textTransform: 'uppercase', letterSpacing: 0.5 }}>Gender pref.</p>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#12241C', display: 'flex', alignItems: 'center', gap: 6 }}><UserIcon />{listing.gender_preference}</p>
                  </div>
                )}
                {listing.available_from && (
                  <div style={{ padding: '10px 14px', background: 'rgba(18,36,28,0.04)', borderRadius: 10, border: '1px solid rgba(18,36,28,0.07)' }}>
                    <p style={{ margin: '0 0 2px', fontSize: 10, fontWeight: 700, color: '#7d9188', textTransform: 'uppercase', letterSpacing: 0.5 }}>{listing.listing_type === 'sublet' ? 'Sublet from' : 'Available from'}</p>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#12241C', display: 'flex', alignItems: 'center', gap: 6 }}><CalIcon />{fmt(listing.available_from)}</p>
                  </div>
                )}
                {listing.sublet_end_date && (
                  <div style={{ padding: '10px 14px', background: 'rgba(18,36,28,0.04)', borderRadius: 10, border: '1px solid rgba(18,36,28,0.07)' }}>
                    <p style={{ margin: '0 0 2px', fontSize: 10, fontWeight: 700, color: '#7d9188', textTransform: 'uppercase', letterSpacing: 0.5 }}>Sublet until</p>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#12241C', display: 'flex', alignItems: 'center', gap: 6 }}><CalIcon />{fmt(listing.sublet_end_date)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Amenities */}
            {Array.isArray(listing.amenities) && listing.amenities.length > 0 && (
              <div style={{ ...card, padding: '20px 22px' }}>
                <p style={{ fontSize: 11, fontWeight: 800, color: '#7d9188', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 14px' }}>Amenities</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {listing.amenities.map((a: string) => (
                    <span key={a} style={{ fontSize: 12.5, fontWeight: 600, padding: '6px 12px', borderRadius: 100, background: 'rgba(18,161,80,0.08)', border: '1px solid rgba(18,161,80,0.2)', color: '#0F8A44' }}>✓ {a}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Preferences */}
            {(listing.diet || listing.smoking || listing.pets) && (
              <div style={{ ...card, padding: '20px 22px' }}>
                <p style={{ fontSize: 11, fontWeight: 800, color: '#7d9188', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 14px' }}>Preferences</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {listing.diet && listing.diet !== 'No preference' && <Badge label={listing.diet} ok />}
                  {listing.smoking && listing.smoking !== 'No preference' && <Badge label={listing.smoking === 'Non-smoker' ? 'No smoking' : listing.smoking} ok={listing.smoking === 'Non-smoker'} />}
                  {listing.pets && listing.pets !== 'No preference' && <Badge label={listing.pets === 'No pets' ? 'No pets' : 'Pets OK'} ok={listing.pets !== 'No pets'} />}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN — sticky contact card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 24 }}>

            {/* Price */}
            <div style={{ ...card, padding: '20px 22px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: '#7d9188', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {listing.listing_type === 'need' ? 'Budget' : 'Monthly rent'}
              </p>
              {(listing.rent_min && listing.rent_max)
                ? <p style={{ margin: '0 0 6px', fontSize: 30, fontWeight: 800, color: '#12A150', letterSpacing: -1.5, lineHeight: 1 }}>${listing.rent_min}–${listing.rent_max}</p>
                : <p style={{ margin: '0 0 6px', fontSize: 38, fontWeight: 800, color: '#12A150', letterSpacing: -2, lineHeight: 1 }}>${listing.rent}</p>}
              <p style={{ margin: 0, fontSize: 12, color: '#7d9188' }}>per month</p>
            </div>

            {/* Poster info */}
            {poster && (
              <div style={{ ...card, padding: '16px 18px' }}>
                <p style={{ fontSize: 10, fontWeight: 800, color: '#7d9188', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 12px' }}>Posted by</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {poster.avatar_url ? (
                    <img src={poster.avatar_url} alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#5A4BB8,#12A150)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: '#ffffff', flexShrink: 0 }}>
                      {ini(poster.full_name || '')}
                    </div>
                  )}
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#12241C' }}>{poster.full_name || 'Student'}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#7d9188' }}>Student</p>
                  </div>
                </div>
              </div>
            )}

            {/* Contact actions */}
            {!isOwn && poster && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Link
                  href={`/student/messages?to=${poster.id}&name=${encodeURIComponent(poster.full_name || 'Student')}&msg=${encodeURIComponent(`Hi! I saw your roommate listing "${listing.title}" and I'm interested.`)}`}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 46, borderRadius: 12, background: '#12A150', color: '#ffffff', fontWeight: 800, fontSize: 14, textDecoration: 'none' }}>
                  <ChatIcon /> Message
                </Link>
                {listing.contact_phone && (
                  <a href={`tel:${listing.contact_phone}`}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 46, borderRadius: 12, border: '1px solid rgba(18,36,28,0.12)', background: 'rgba(18,36,28,0.04)', color: '#12241C', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                    <PhoneIcon /> Call
                  </a>
                )}
              </div>
            )}

            {isOwn && (
              <div style={{ padding: '14px 16px', background: 'rgba(18,161,80,0.06)', border: '1px solid rgba(18,161,80,0.2)', borderRadius: 12, fontSize: 13, color: '#12A150', textAlign: 'center', fontWeight: 600 }}>
                This is your listing
              </div>
            )}

            {/* Match score breakdown */}
            {match !== null && !isOwn && (
              <div style={{ ...card, padding: '16px 18px' }}>
                <p style={{ fontSize: 10, fontWeight: 800, color: '#7d9188', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 10px' }}>Compatibility</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'rgba(18,36,28,0.09)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${match}%`, borderRadius: 4, background: match >= 75 ? '#12A150' : match >= 50 ? '#E08A1E' : '#C25B4E', transition: 'width .5s' }} />
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 800, color: match >= 75 ? '#12A150' : match >= 50 ? '#E08A1E' : '#C25B4E', minWidth: 40, textAlign: 'right' }}>{match}%</span>
                </div>
                <p style={{ margin: '8px 0 0', fontSize: 12, color: '#7d9188' }}>{match >= 75 ? 'Great match!' : match >= 50 ? 'Decent match' : 'Low match — preferences differ'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}

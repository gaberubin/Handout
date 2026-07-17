'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuthGate } from '@/components/auth/AuthGate';
import { createClient } from '@/lib/supabase/client';
import { MediaGallery } from '@/components/ui/MediaGallery';

const BIDFoodIcon  = () => <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>;
const BIDSvcIcon   = () => <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>;
const BIDRoomIcon  = () => <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const BIDEmptyIcon = () => <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const BIDPinIcon   = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const BIDChatIcon  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const BIDBookIcon  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="10" x2="15" y2="10"/></svg>;
const BIDCheckIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const BIDCalIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const BIDUndoIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="2" x2="2" y2="21"/></svg>;
function BIDListingIcon({ t }: { t: string }) {
  if (t === 'food') return <BIDFoodIcon />;
  if (t === 'svc')  return <BIDSvcIcon />;
  return <BIDRoomIcon />;
}

const UNDO_SECS = 10;

export default function ListingDetail() {
  const params = useParams();
  const id = String(params?.id || '');
  const [t, setT] = useState('room'); // room | food | svc
  const { user, requireAuth } = useAuthGate();

  const [l, setL] = useState<any>(null);
  const [poster, setPoster] = useState<any>(null);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState('');
  const [booked, setBooked] = useState(false);

  // Undo state
  const [undoBookingId, setUndoBookingId] = useState<string | null>(null);
  const [undoCountdown, setUndoCountdown] = useState(0);
  const undoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const undoEndRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      const tt = new URLSearchParams(window.location.search).get('t') || 'room';
      setT(tt);
      const supabase = createClient();
      const table = tt === 'food' ? 'tiffin_listings' : tt === 'svc' ? 'service_listings' : 'roommate_listings';
      const { data } = await supabase.from(table).select('*').eq('id', id).single();
      setL(data || null);
      if (data?.user_id) {
        const { data: u } = await supabase.from('public_profiles').select('id, full_name, created_at').eq('id', data.user_id).single();
        setPoster(u || null);
      }
      setReady(true);
    })();
  }, [id]);

  function message() {
    requireAuth(() => {
      window.location.href = `/student/messages?to=${l.user_id}&name=${encodeURIComponent(poster?.full_name || 'Member')}`;
    }, 'Sign in to message this member');
  }

  function startUndoCountdown(bookingId: string) {
    setUndoBookingId(bookingId);
    setUndoCountdown(UNDO_SECS);
    if (undoTimerRef.current) clearInterval(undoTimerRef.current);
    if (undoEndRef.current) clearTimeout(undoEndRef.current);
    undoTimerRef.current = setInterval(() => {
      setUndoCountdown(c => {
        if (c <= 1) { clearInterval(undoTimerRef.current!); return 0; }
        return c - 1;
      });
    }, 1000);
    undoEndRef.current = setTimeout(() => {
      setUndoBookingId(null);
      setUndoCountdown(0);
      setToast('');
    }, UNDO_SECS * 1000);
  }

  async function undoBooking() {
    if (!undoBookingId) return;
    clearInterval(undoTimerRef.current!);
    clearTimeout(undoEndRef.current!);
    const supabase = createClient();
    await supabase.from('bookings').delete().eq('id', undoBookingId);
    setUndoBookingId(null);
    setUndoCountdown(0);
    setBooked(false);
    setToast('Request cancelled ✓');
    setTimeout(() => setToast(''), 2500);
  }

  function book() {
    requireAuth(async () => {
      const supabase = createClient();
      const { data: { user: me } } = await supabase.auth.getUser();
      if (!me) return;
      if (me.id === l.user_id) { setToast("That's your own listing."); setTimeout(() => setToast(''), 3000); return; }
      const price = t === 'food' ? (l.price_per_meal || null) : (l.rate || null);
      const { data: inserted, error } = await supabase.from('bookings').insert({
        student_id: me.id, provider_id: l.user_id,
        listing_type: t === 'food' ? 'tiffin' : 'service',
        listing_id: l.id, total_price: price, status: 'pending',
      }).select('id').single();
      if (error) { setToast('Could not book: ' + error.message); setTimeout(() => setToast(''), 4000); return; }
      setBooked(true);
      setToast('__undo__');
      startUndoCountdown(inserted.id);
    }, 'Sign in to book');
  }

  const badge = t === 'food' ? (l?.cuisine || 'Tiffin / Food') : t === 'svc' ? (l?.category || 'Service') : 'Roommate';
  const title = t === 'food' ? l?.name : l?.title;
  const price = t === 'food' ? (l?.price_per_meal ? `$${l.price_per_meal}` : '—') : t === 'svc' ? (l?.rate ? `$${l.rate}` : '—') : (l?.rent ? `$${l.rent}` : '—');
  const unit = t === 'food' ? '/ meal' : t === 'svc' ? `/ ${l?.rate_type || 'hr'}` : '/ month';
  const media: any[] = Array.isArray(l?.media) ? l.media : [];
  const det: any = l?.details || {};
  const wkMenu: any[] = Array.isArray(l?.weekly_menu) ? l.weekly_menu : [];
  const wkSave = (l?.price_per_meal && l?.price_per_week && l?.meals_per_day)
    ? Math.max(0, Math.round((1 - l.price_per_week / (l.price_per_meal * l.meals_per_day * 7)) * 100)) || null
    : null;

  const pill = (txt: string) => (
    <span key={txt} style={{ fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 100, background: 'rgba(18,36,28,0.05)', border: '1px solid rgba(18,36,28,0.09)', color: '#4c6157' }}>{txt}</span>
  );
  const card: React.CSSProperties = { background: '#FFFFFF', border: '1px solid rgba(18,36,28,0.09)', borderRadius: 16, padding: 20 };
  const row = (k: string, v: any) => v ? (
    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '9px 0', borderBottom: '1px solid rgba(18,36,28,0.05)', fontSize: 13 }}>
      <span style={{ color: '#7d9188' }}>{k}</span><span style={{ color: '#12241C', fontWeight: 600, textAlign: 'right', textTransform: 'capitalize' }}>{String(v)}</span>
    </div>
  ) : null;

  return (
    <div style={{ minHeight: '100vh', background: '#F1F7F3' }}>
      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '26px 20px 80px' }}>
        <Link href="/browse" style={{ color: '#12A150', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>← Back to listings</Link>

        {!ready ? <div style={{ color: '#7d9188', marginTop: 30 }}>Loading…</div> :
        !l ? (
          <div style={{ ...card, marginTop: 24, textAlign: 'center', padding: 50 }}>
            <div style={{ marginBottom: 10, display: 'inline-flex', color: '#7d9188' }}><BIDEmptyIcon /></div>
            <p style={{ color: '#4c6157' }}>This listing doesn't exist anymore.</p>
          </div>
        ) : (
          <>
            <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase', padding: '5px 12px', borderRadius: 100, background: 'rgba(18,161,80,0.1)', color: '#12A150', border: '1px solid rgba(18,161,80,0.3)' }}>{badge}</span>
            </div>
            <h1 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 'clamp(24px,3.6vw,36px)', fontWeight: 800, letterSpacing: -1, color: '#12241C', marginTop: 10, lineHeight: 1.15 }}>{title}</h1>
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <span><span style={{ color: '#12A150', fontWeight: 800, fontSize: 20 }}>{price}</span> <span style={{ color: '#7d9188', fontSize: 13 }}>{unit}</span></span>
              <span style={{ color: '#7d9188', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4 }}><BIDPinIcon />{l.location || '—'}</span>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
              <button onClick={message} style={{ padding: '11px 24px', background: '#12A150', color: '#ffffff', border: 'none', borderRadius: 100, fontWeight: 800, fontSize: 14, cursor: 'pointer' }}><span style={{ display:'inline-flex', alignItems:'center', gap:6 }}><BIDChatIcon /> Message {poster?.full_name?.split(' ')[0] || ''}</span></button>
              {t !== 'room' && !booked && (
                <button onClick={book} style={{ padding: '11px 24px', background: 'rgba(18,161,80,0.1)', color: '#12A150', border: '1px solid rgba(18,161,80,0.35)', borderRadius: 100, fontWeight: 800, fontSize: 14, cursor: 'pointer' }}><span style={{ display:'inline-flex', alignItems:'center', gap:6 }}><BIDBookIcon /> Book / Request</span></button>
              )}
              {booked && !undoBookingId && <span style={{ padding: '11px 20px', color: '#12A150', fontWeight: 700, fontSize: 14, display:'inline-flex', alignItems:'center', gap:5 }}><BIDCheckIcon /> Request sent</span>}
            </div>

            {/* Undo toast */}
            {toast === '__undo__' && undoBookingId ? (
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', background: '#FFFFFF', border: '1px solid rgba(18,161,80,0.3)', borderRadius: 12, maxWidth: 480 }}>
                <span style={{ fontSize: 13, color: '#12241C', flex: 1, display:'inline-flex', alignItems:'center', gap:5 }}><BIDCheckIcon /> Request sent to provider!</span>
                <button onClick={undoBooking}
                  style={{ padding: '6px 14px', background: 'rgba(194,91,78,0.15)', color: '#C25B4E', border: '1px solid rgba(194,91,78,0.4)', borderRadius: 100, fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
                  Undo ({undoCountdown}s)
                </button>
              </div>
            ) : toast && toast !== '__undo__' ? (
              <div style={{ marginTop: 12, padding: '10px 16px', background: 'rgba(18,161,80,0.08)', border: '1px solid rgba(18,161,80,0.25)', borderRadius: 10, color: '#12A150', fontSize: 13, maxWidth: 520 }}>{toast}</div>
            ) : null}

            <div style={{ display: 'flex', gap: 18, marginTop: 26, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div style={{ flex: '1.5 1 380px', display: 'flex', flexDirection: 'column', gap: 18 }}>
                {media.length > 0 ? (
                  <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(18,36,28,0.09)' }}>
                    <MediaGallery media={media} height={340} />
                  </div>
                ) : (
                  <div style={{ height: 220, borderRadius: 16, border: '1px solid rgba(18,36,28,0.09)', background: 'linear-gradient(135deg,#5A4BB822,#12A15018)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)' }}><BIDListingIcon t={t} /></div>
                )}

                <div style={card}>
                  <div style={{ fontWeight: 800, color: '#12241C', marginBottom: 10 }}>About {t === 'room' ? (poster?.full_name?.split(' ')[0] || 'this listing') : 'this ' + (t === 'food' ? 'kitchen' : 'service')}</div>
                  <p style={{ color: '#4c6157', fontSize: 14, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{l.description || 'No description provided yet.'}</p>
                  {t === 'room' && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
                      {[l.occupancy ? `${l.occupancy} per room` : null, l.diet, l.smoking, l.pets, l.university].filter(Boolean).map((x: any) => pill(x))}
                    </div>
                  )}
                </div>

                {t === 'food' && wkMenu.length > 0 && (
                  <div style={card}>
                    <div style={{ fontWeight: 800, color: '#12241C', marginBottom: 4, display:'flex', alignItems:'center', gap:6 }}><BIDCalIcon /> Weekly menu</div>
                    {wkSave ? <div style={{ fontSize: 12, color: '#12A150', fontWeight: 700, marginBottom: 8 }}>Weekly plan saves {wkSave}% vs paying per meal</div> : null}
                    {wkMenu.map((m: any) => (
                      <div key={m.day} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid rgba(18,36,28,0.05)', fontSize: 13 }}>
                        <span style={{ width: 84, flexShrink: 0, color: '#12A150', fontWeight: 700 }}>{m.day}</span>
                        <span style={{ color: '#4c6157', lineHeight: 1.5 }}>{m.items}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={card}>
                  <div style={{ fontWeight: 800, color: '#12241C', marginBottom: 6 }}>Details</div>
                  {t === 'room' && <>{row('Rent', l.rent ? `$${l.rent} / month` : null)}{row('Room type', l.room_type)}{row('Looking for', l.listing_type === 'have' ? 'a roommate' : 'a room')}{row('Gender preference', l.gender_preference)}{row('University', l.university)}{row('Location', l.location)}{row('Posted', new Date(l.created_at).toLocaleDateString())}</>}
                  {t === 'food' && <>{row('Per meal', l.price_per_meal ? `$${l.price_per_meal}` : null)}{row('Per week', l.price_per_week ? `$${l.price_per_week}` : null)}{row('Weekly savings', wkSave ? `${wkSave}% off vs daily` : null)}{row('Meals per day', l.meals_per_day)}{row('Cuisine', l.cuisine)}{row('Diet', l.diet_type)}{row('Location', l.location)}{row('Posted', new Date(l.created_at).toLocaleDateString())}</>}
                  {t === 'svc' && <>{row('Rate', l.rate ? `$${l.rate} / ${l.rate_type || 'hr'}` : null)}{row('Category', l.category)}{row('Subject', det.subject)}{row('Levels', Array.isArray(det.levels) ? det.levels.join(', ') : null)}{row('Mode', det.mode)}{row('Documents', Array.isArray(det.documents) ? det.documents.join(', ') : null)}{row('Ride type', det.ride_type)}{row('Airports', Array.isArray(det.airports) ? det.airports.join(', ') : null)}{row('Vehicle', det.vehicle)}{row('Move size', det.move_size)}{row('Age groups', Array.isArray(det.age_groups) ? det.age_groups.join(', ') : null)}{row('Cleaning', det.clean_type)}{row('Note', det.note)}{row('Location', l.location)}{row('Posted', new Date(l.created_at).toLocaleDateString())}</>}
                </div>

                <div style={card}>
                  <div style={{ fontWeight: 800, color: '#12241C', marginBottom: 12 }}>Posted by</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#12A150', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15 }}>{(poster?.full_name || '?').slice(0, 2).toUpperCase()}</div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#12241C', fontSize: 14 }}>{poster?.full_name || 'Member'}</div>
                      <div style={{ fontSize: 12, color: '#7d9188' }}>Member since {poster?.created_at ? new Date(poster.created_at).toLocaleDateString('en', { month: 'short', year: 'numeric' }) : '—'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

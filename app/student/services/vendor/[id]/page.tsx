'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { StudentLayout } from '@/components/layout/StudentLayout';

function ini(s: string) {
  return (s || '?').split(' ').map((x: string) => x[0]).join('').slice(0, 2).toUpperCase();
}

const VD_StarIcon = ({ filled }: { filled: boolean }) => <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? '#E08A1E' : 'none'} stroke={filled ? '#E08A1E' : 'rgba(18,36,28,0.12)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const VD_StarSm   = ({ filled }: { filled: boolean }) => <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? '#E08A1E' : 'none'} stroke={filled ? '#E08A1E' : 'rgba(18,36,28,0.12)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const VD_StarBig  = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="#E08A1E" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const VD_PinIcon  = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', transition: 'opacity 0.1s', display:'inline-flex' }}>
          <VD_StarIcon filled={n <= (hovered || value)} />
        </button>
      ))}
    </div>
  );
}

function StarDisplay({ rating, count }: { rating: number; count: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ display: 'flex', gap: 2 }}>
        {[1, 2, 3, 4, 5].map(n => (
          <span key={n} style={{ display:'inline-flex' }}><VD_StarSm filled={n <= Math.round(rating)} /></span>
        ))}
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: '#E08A1E' }}>{rating.toFixed(1)}</span>
      <span style={{ fontSize: 12, color: 'var(--muted)' }}>({count} review{count !== 1 ? 's' : ''})</span>
    </div>
  );
}

export default function VendorDetailPage() {
  const params = useParams();
  const vendorId = params.id as string;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<any>(null);
  const [meRole, setMeRole] = useState('student');
  const [vendor, setVendor] = useState<any>(null);
  const [pp, setPp] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewerNames, setReviewerNames] = useState<Record<string, string>>({});
  const [myReview, setMyReview] = useState<any>(null);

  // Review form
  const [starVal, setStarVal] = useState(0);
  const [comment, setComment] = useState('');
  const [submitErr, setSubmitErr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }

      const { data: u } = await supabase.from('users').select('*').eq('id', user.id).single();
      setMe(u || { id: user.id });
      setMeRole(u?.role || 'student');

      // Load vendor info
      const [{ data: vUser }, { data: vPp }, { data: svcs }, { data: revs }] = await Promise.all([
        supabase.from('public_profiles').select('id, full_name').eq('id', vendorId).maybeSingle(),
        supabase.from('provider_profiles').select('*').eq('user_id', vendorId).maybeSingle(),
        supabase.from('service_listings').select('*').eq('user_id', vendorId).eq('is_active', true).order('created_at', { ascending: false }),
        supabase.from('reviews').select('*').eq('reviewee_id', vendorId).eq('listing_type', 'service').order('created_at', { ascending: false }),
      ]);

      setVendor(vUser);
      setPp(vPp);
      setServices(svcs || []);
      const allRevs = revs || [];
      setReviews(allRevs);

      // Check if I already reviewed this vendor's service
      const mine = allRevs.find((r: any) => r.reviewer_id === user.id && r.listing_type === 'service');
      if (mine) { setMyReview(mine); setSubmitted(true); setStarVal(mine.rating); setComment(mine.comment || ''); }

      // Fetch reviewer names
      const rids = Array.from(new Set(allRevs.map((r: any) => r.reviewer_id).filter(Boolean))) as string[];
      if (rids.length) {
        const { data: rUsers } = await supabase.from('public_profiles').select('id, full_name').in('id', rids);
        const nm: Record<string, string> = {};
        (rUsers || []).forEach((u: any) => { nm[u.id] = u.full_name || 'Student'; });
        setReviewerNames(nm);
      }

      setLoading(false);
    })();
  }, [vendorId]);

  async function submitReview() {
    if (starVal === 0) { setSubmitErr('Please select a star rating'); return; }
    setSubmitErr(''); setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.from('reviews').upsert({
      reviewer_id: me.id,
      reviewee_id: vendorId,
      listing_type: 'service',
      listing_id: vendorId,
      rating: starVal,
      comment: comment.trim() || null,
    }, { onConflict: 'reviewer_id,reviewee_id,listing_type,listing_id' });
    setSubmitting(false);
    if (error) { setSubmitErr('Error: ' + error.message); return; }
    setSubmitted(true);
    // Refresh reviews — only service reviews
    const { data: revs } = await supabase.from('reviews').select('*').eq('reviewee_id', vendorId).eq('listing_type', 'service').order('created_at', { ascending: false });
    const allRevs = revs || [];
    setReviews(allRevs);
    const mine = allRevs.find((r: any) => r.reviewer_id === me.id && r.listing_type === 'service');
    setMyReview(mine || null);
    const rids = Array.from(new Set(allRevs.map((r: any) => r.reviewer_id).filter(Boolean))) as string[];
    if (rids.length) {
      const { data: rUsers } = await supabase.from('public_profiles').select('id, full_name').in('id', rids);
      const nm: Record<string, string> = {};
      (rUsers || []).forEach((u: any) => { nm[u.id] = u.full_name || 'Student'; });
      setReviewerNames(nm);
    }
  }

  const avgRating = reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;
  const vendorName = pp?.business_name || vendor?.full_name || 'Provider';
  const avatarUrl = pp?.avatar_url;

  if (loading) {
    return (
      <StudentLayout title="Vendor">
        <div style={{ color: 'var(--muted)', padding: 40, textAlign: 'center' }}>Loading…</div>
      </StudentLayout>
    );
  }

  if (!vendor) {
    return (
      <StudentLayout title="Vendor">
        <div style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ marginBottom: 12, display:'inline-flex', color:'var(--muted)' }}><VD_StarBig /></div>
          <p style={{ color: 'var(--muted)' }}>Vendor not found.</p>
          <Link href="/student/services" style={{ color: 'var(--amber)', textDecoration: 'none', fontSize: 14 }}>← Back to Services</Link>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout title={vendorName}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        {/* Back */}
        <Link href="/student/services" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--muted)', textDecoration: 'none', fontSize: 13, marginBottom: 24 }}>
          ← All services
        </Link>

        {/* Vendor hero card */}
        <div style={{ background: 'var(--navy2)', border: '1px solid var(--border)', borderRadius: 20, padding: 28, marginBottom: 24, display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{ width: 80, height: 80, borderRadius: 20, background: avatarUrl ? 'transparent' : 'linear-gradient(135deg,#5A4BB8,#12A150)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 28, color: '#ffffff', flexShrink: 0, overflow: 'hidden' }}>
            {avatarUrl ? <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : ini(vendorName)}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--white)', marginBottom: 4 }}>{vendorName}</h1>
            {pp?.experience_years && (
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>Verified vendor · {pp.experience_years} yr{pp.experience_years !== 1 ? 's' : ''} experience</p>
            )}
            {!pp?.experience_years && <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>Verified vendor</p>}
            {reviews.length > 0 && <StarDisplay rating={avgRating} count={reviews.length} />}
            {pp?.bio && <p style={{ fontSize: 14, color: 'var(--light)', marginTop: 10, lineHeight: 1.6 }}>{pp.bio}</p>}
            {pp?.location && <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6, display:'flex', alignItems:'center', gap:4 }}><VD_PinIcon /> {pp.location}</p>}
          </div>

          {/* Contact */}
          {me?.id !== vendorId && (
            <Link href={`/student/messages?to=${vendorId}&name=${encodeURIComponent(vendorName)}`}
              style={{ height: 42, padding: '0 22px', background: 'var(--amber)', color: '#ffffff', borderRadius: 100, fontWeight: 700, fontSize: 14, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <span style={{ display:'inline-flex', alignItems:'center', gap:6 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> Message</span>
            </Link>
          )}
        </div>

        {/* Services */}
        {services.length > 0 && (
          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--white)', marginBottom: 16 }}>Services offered</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(285px,1fr))', gap: 16 }}>
              {services.map(s => (
                <div key={s.id} style={{ background: 'var(--navy2)', border: '1px solid var(--border)', borderRadius: 16, padding: '18px 18px 14px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: 'rgba(90,75,184,0.18)', color: 'var(--purple)', textTransform: 'capitalize' }}>{s.category || 'Service'}</span>
                    {s.rate && <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--amber)' }}>${s.rate}<span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 400 }}>/{s.rate_type || 'hr'}</span></span>}
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--white)', marginBottom: 4, lineHeight: 1.3 }}>{s.title}</h3>
                  {s.duration && <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>{s.duration}</p>}
                  {s.location && <p style={{ fontSize: 12, color: 'var(--light)', marginBottom: 4, display:'flex', alignItems:'center', gap:3 }}><VD_PinIcon /> {s.location}</p>}
                  {s.description && <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, flex: 1 }}>{s.description}</p>}
                  <Link href="/student/services"
                    style={{ display: 'block', marginTop: 12, textAlign: 'center', height: 36, lineHeight: '36px', background: 'var(--amber)', borderRadius: 100, color: '#ffffff', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                    Book now
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Ratings & Reviews */}
        <section>
          <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--white)', marginBottom: 16 }}>
            {reviews.length > 0 ? `Ratings & Reviews (${reviews.length})` : 'Ratings & Reviews'}
          </h2>

          {/* Leave a review — students only, not the vendor themselves */}
          {meRole === 'student' && me?.id !== vendorId && (
            <div style={{ background: 'var(--navy2)', border: '1px solid var(--border)', borderRadius: 16, padding: 22, marginBottom: 24 }}>
              {submitted ? (
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--white)', marginBottom: 8 }}>Your review</p>
                  <div style={{ display: 'flex', gap: 2, marginBottom: 6 }}>
                    {[1,2,3,4,5].map(n => <span key={n} style={{ display:'inline-flex' }}><VD_StarSm filled={n <= starVal} /></span>)}
                  </div>
                  {comment && <p style={{ fontSize: 13, color: 'var(--light)', lineHeight: 1.5 }}>{comment}</p>}
                  <button onClick={() => setSubmitted(false)} style={{ marginTop: 10, fontSize: 12, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>Edit review</button>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--white)', marginBottom: 12 }}>{myReview ? 'Update your review' : 'Leave a review'}</p>
                  <StarPicker value={starVal} onChange={setStarVal} />
                  <textarea
                    value={comment} onChange={e => setComment(e.target.value)}
                    placeholder="Share your experience (optional)…"
                    rows={3}
                    style={{ width: '100%', marginTop: 12, padding: '10px 14px', background: 'rgba(18,36,28,0.05)', border: '1px solid rgba(18,36,28,0.12)', borderRadius: 10, color: 'var(--white)', fontSize: 14, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5, boxSizing: 'border-box', outline: 'none' }}
                  />
                  {submitErr && <p style={{ fontSize: 12, color: '#C25B4E', marginTop: 6 }}>{submitErr}</p>}
                  <button onClick={submitReview} disabled={submitting}
                    style={{ marginTop: 10, height: 40, padding: '0 22px', borderRadius: 100, border: 'none', background: 'var(--amber)', color: '#ffffff', fontSize: 13, fontWeight: 800, cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
                    {submitting ? 'Submitting…' : myReview ? 'Update review' : 'Submit review'}
                  </button>
                </div>
              )}
            </div>
          )}

          {reviews.length === 0 ? (
            <div style={{ background: 'var(--navy2)', border: '1px dashed var(--border)', borderRadius: 14, padding: 32, textAlign: 'center' }}>
              <div style={{ display:'inline-flex', marginBottom: 8, color:'#E08A1E' }}><VD_StarBig /></div>
              <p style={{ fontSize: 14, color: 'var(--muted)' }}>No reviews yet. Be the first to rate this vendor!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {reviews.map(r => (
                <div key={r.id} style={{ background: 'var(--navy2)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--white)' }}>{reviewerNames[r.reviewer_id] || 'Student'}</span>
                      {r.reviewer_id === me?.id && <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--amber)', fontWeight: 700 }}>You</span>}
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 2, marginBottom: r.comment ? 8 : 0 }}>
                    {[1,2,3,4,5].map(n => <span key={n} style={{ display:'inline-flex' }}><VD_StarSm filled={n <= r.rating} /></span>)}
                  </div>
                  {r.comment && <p style={{ fontSize: 13, color: 'var(--light)', lineHeight: 1.6 }}>{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </StudentLayout>
  );
}

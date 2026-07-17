'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { createClient } from '@/lib/supabase/client';

const BackIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const CheckIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const ClockIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const MapIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const MsgIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;

const STATUS_STEPS = ['pending', 'confirmed', 'in_progress', 'completed'];
const STATUS_LABELS: Record<string, string> = { pending: 'Pending', confirmed: 'Confirmed', in_progress: 'In Progress', completed: 'Completed', cancelled: 'Cancelled' };
const STATUS_COLOR: Record<string, string> = { pending: '#FFB347', confirmed: '#12A150', in_progress: '#7C6BD1', completed: '#12A150', cancelled: '#C25B4E' };

const card: React.CSSProperties = { background: '#FFFFFF', border: '1px solid rgba(18,36,28,0.09)', borderRadius: 16, padding: 22, marginBottom: 14 };
const btn = (accent?: boolean): React.CSSProperties => ({ height: 42, padding: '0 20px', borderRadius: 100, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: accent ? 'none' : '1px solid rgba(18,36,28,0.12)', background: accent ? '#12A150' : 'transparent', color: accent ? '#ffffff' : '#12241C' });

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [bk, setBk] = useState<any>(null);
  const [vendor, setVendor] = useState<any>(null);
  const [ready, setReady] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    (async () => {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { window.location.href = '/auth/login'; return; }
      const { data } = await sb.from('bookings').select('*').eq('id', id).eq('student_id', user.id).single();
      if (data) {
        setBk(data);
        if (data.provider_id) {
          const { data: v } = await sb.from('public_profiles').select('full_name, avatar_url').eq('id', data.provider_id).single();
          setVendor(v);
        }
      }
      setReady(true);
    })();
  }, [id]);

  async function cancel() {
    if (!confirm('Cancel this booking?')) return;
    setCancelling(true);
    const sb = createClient();
    await sb.from('bookings').update({ status: 'cancelled' }).eq('id', id);
    setBk((prev: any) => ({ ...prev, status: 'cancelled' }));
    setCancelling(false);
  }

  const fmt = (d: string) => d ? new Date(d).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—';
  const isCancelled = bk?.status === 'cancelled';
  const canCancel = bk && !['cancelled', 'completed'].includes(bk.status);
  const stepIdx = STATUS_STEPS.indexOf(bk?.status || 'pending');

  return (
    <StudentLayout title="Bookings">
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 0 60px' }}>
          <Link href="/student/bookings" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#7d9188', fontSize: 13, textDecoration: 'none', marginBottom: 20 }}>
            <BackIcon /> Back to bookings
          </Link>

          {!ready && <p style={{ color: '#7d9188' }}>Loading…</p>}
          {ready && !bk && <p style={{ color: '#7d9188' }}>Booking not found.</p>}

          {ready && bk && (
            <>
              <div style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 11, color: '#7d9188', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>Booking #{bk.id.slice(0, 8).toUpperCase()}</p>
                    <p style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 700, color: '#12241C' }}>{bk.listing_type === 'tiffin' ? 'Food Order' : 'Service Booking'}</p>
                  </div>
                  <span style={{ background: `${STATUS_COLOR[bk.status] || '#7d9188'}20`, color: STATUS_COLOR[bk.status] || '#7d9188', borderRadius: 100, padding: '4px 12px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                    {STATUS_LABELS[bk.status] || bk.status}
                  </span>
                </div>

                {!isCancelled && (
                  <div style={{ display: 'flex', gap: 0, marginBottom: 4 }}>
                    {STATUS_STEPS.map((s, i) => (
                      <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: i <= stepIdx ? (i === stepIdx ? '#12A150' : '#12A150') : 'rgba(18,36,28,0.06)', border: `2px solid ${i <= stepIdx ? (i === stepIdx ? '#12A150' : '#12A150') : 'rgba(18,36,28,0.12)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: i <= stepIdx ? '#ffffff' : '#7d9188', fontSize: 9, position: 'relative', zIndex: 1 }}>
                          {i <= stepIdx ? <CheckIcon /> : i + 1}
                        </div>
                        <p style={{ margin: 0, fontSize: 9, color: i <= stepIdx ? '#12241C' : '#7d9188', fontWeight: i === stepIdx ? 700 : 400, textAlign: 'center' }}>{STATUS_LABELS[s]}</p>
                        {i < STATUS_STEPS.length - 1 && (
                          <div style={{ position: 'absolute', width: '25%', height: 2, background: i < stepIdx ? '#12A150' : 'rgba(18,36,28,0.09)', top: 11, left: `${(i + 0.5) * 25 + 12.5}%` }} />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={card}>
                <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: '#12241C' }}>Details</p>
                {[
                  { icon: <ClockIcon />, label: 'Booked on', value: fmt(bk.created_at) },
                  bk.scheduled_time && { icon: <ClockIcon />, label: 'Scheduled', value: fmt(bk.scheduled_time) },
                  bk.hours && { icon: <ClockIcon />, label: 'Duration', value: `${bk.hours} hour${bk.hours > 1 ? 's' : ''}` },
                  bk.notes && { icon: <MapIcon />, label: 'Notes', value: bk.notes },
                ].filter(Boolean).map((row: any, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                    <span style={{ color: '#7d9188', marginTop: 1 }}>{row.icon}</span>
                    <div>
                      <p style={{ margin: 0, fontSize: 11, color: '#7d9188', fontWeight: 600 }}>{row.label}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 13, color: '#12241C' }}>{row.value}</p>
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(18,36,28,0.07)', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#12241C' }}>Total</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#12A150' }}>${Number(bk.total_price || bk.price || 0).toFixed(2)}</span>
                </div>
              </div>

              {vendor && (
                <div style={card}>
                  <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: '#12241C' }}>Vendor</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(18,161,80,0.12)', color: '#12A150', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                        {(vendor.full_name || 'V')[0].toUpperCase()}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#12241C' }}>{vendor.full_name}</p>
                        {vendor.email && <p style={{ margin: '2px 0 0', fontSize: 11, color: '#7d9188' }}>{vendor.email}</p>}
                      </div>
                    </div>
                    <Link href={`/student/messages?partner=${bk.provider_id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#12A150', fontSize: 13, textDecoration: 'none', background: 'rgba(18,161,80,0.08)', padding: '7px 12px', borderRadius: 100 }}>
                      <MsgIcon /> Message
                    </Link>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                {canCancel && (
                  <button onClick={cancel} disabled={cancelling} style={{ ...btn(), flex: 1, opacity: cancelling ? 0.6 : 1 }}>
                    {cancelling ? 'Cancelling…' : 'Cancel Booking'}
                  </button>
                )}
                <Link href="/student/report" style={{ ...btn(), flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                  Report Issue
                </Link>
              </div>
            </>
          )}
        </div>
      
    </StudentLayout>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { createClient } from '@/lib/supabase/client';

const BackIcon   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const CheckIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const ClockIcon  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const TruckIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
const BowlIcon   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>;
const StarIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const PhoneIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;

const STEPS = [
  { key: 'placed',    label: 'Order Placed',  icon: <CheckIcon /> },
  { key: 'accepted',  label: 'Accepted',       icon: <CheckIcon /> },
  { key: 'preparing', label: 'Preparing',      icon: <BowlIcon /> },
  { key: 'on_the_way',label: 'On the Way',     icon: <TruckIcon /> },
  { key: 'delivered', label: 'Delivered',      icon: <CheckIcon /> },
];

const STATUS_IDX: Record<string, number> = {
  placed: 0, pending: 0, accepted: 1, confirmed: 1,
  preparing: 2, on_the_way: 3, out_for_delivery: 3, delivered: 4, completed: 4,
};

const card: React.CSSProperties = { background: '#FFFFFF', border: '1px solid rgba(18,36,28,0.09)', borderRadius: 16, padding: 22, marginBottom: 14 };

export default function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [vendor, setVendor] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { window.location.href = '/auth/login'; return; }

      const { data: bk } = await sb.from('bookings').select('*').eq('id', id).eq('student_id', user.id).single();
      if (!bk) { setReady(true); return; }
      setOrder(bk);

      if (bk.provider_id) {
        const { data: v } = await sb.from('public_profiles').select('full_name').eq('id', bk.provider_id).single();
        setVendor(v);
      }
      if (bk.listing_id && bk.listing_type === 'tiffin') {
        const { data: t } = await sb.from('tiffin_listings').select('title').eq('id', bk.listing_id).single();
        if (t) setItems([{ name: t.title, qty: 1, price: bk.total_price || bk.price || 0 }]);
      }
      setReady(true);
    })();
  }, [id]);

  const stepIdx = order ? (STATUS_IDX[order.status] ?? 0) : 0;
  const isCancelled = order?.status === 'cancelled';

  const fmt = (d: string) => d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—';

  return (
    <StudentLayout title="Order Tracking">
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 0 60px' }}>
          <Link href="/student/bookings" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#7d9188', fontSize: 13, textDecoration: 'none', marginBottom: 20 }}>
            <BackIcon /> Back to bookings
          </Link>

          {!ready && <p style={{ color: '#7d9188', fontSize: 14 }}>Loading…</p>}
          {ready && !order && <p style={{ color: '#7d9188', fontSize: 14 }}>Order not found.</p>}

          {ready && order && (
            <>
              <div style={{ ...card }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 11, color: '#7d9188', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>Order #{order.id.slice(0, 8).toUpperCase()}</p>
                    <p style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 700, color: '#12241C' }}>{order.listing_type === 'tiffin' ? 'Food Order' : 'Service Booking'}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#7d9188' }}>{fmt(order.created_at)}</p>
                  </div>
                  <span style={{ background: isCancelled ? 'rgba(255,100,100,0.15)' : 'rgba(18,161,80,0.12)', color: isCancelled ? '#C25B4E' : '#12A150', borderRadius: 100, padding: '4px 12px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                    {order.status?.replace(/_/g, ' ') || 'Placed'}
                  </span>
                </div>

                {!isCancelled && (
                  <div style={{ position: 'relative', paddingLeft: 28 }}>
                    <div style={{ position: 'absolute', left: 11, top: 14, bottom: 14, width: 2, background: 'rgba(18,36,28,0.09)', borderRadius: 2 }} />
                    {STEPS.map((s, i) => {
                      const done = i <= stepIdx;
                      const active = i === stepIdx;
                      return (
                        <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: i < STEPS.length - 1 ? 22 : 0, position: 'relative' }}>
                          <div style={{ position: 'absolute', left: -28, width: 22, height: 22, borderRadius: '50%', background: done ? (active ? '#12A150' : '#12A150') : 'rgba(18,36,28,0.06)', border: `2px solid ${done ? (active ? '#12A150' : '#12A150') : 'rgba(18,36,28,0.12)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: done ? '#ffffff' : '#7d9188', flexShrink: 0, zIndex: 1 }}>
                            {done ? <CheckIcon /> : <span style={{ fontSize: 9 }}>{i + 1}</span>}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontSize: 13, fontWeight: active ? 700 : 500, color: done ? '#12241C' : '#7d9188' }}>{s.label}</p>
                            {active && <p style={{ margin: '2px 0 0', fontSize: 11, color: '#12A150' }}>Current status</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {isCancelled && (
                  <div style={{ background: 'rgba(194,91,78,0.1)', border: '1px solid rgba(194,91,78,0.3)', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#C25B4E' }}>
                    This order was cancelled.
                  </div>
                )}
              </div>

              {vendor && (
                <div style={{ ...card }}>
                  <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: '#12241C' }}>Vendor</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(18,161,80,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#12A150', fontWeight: 700, fontSize: 15 }}>
                        {(vendor.full_name || 'V')[0].toUpperCase()}
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#12241C' }}>{vendor.full_name}</span>
                    </div>
                    {vendor.phone && (
                      <a href={`tel:${vendor.phone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#12A150', fontSize: 13, textDecoration: 'none', background: 'rgba(18,161,80,0.08)', padding: '7px 12px', borderRadius: 100 }}>
                        <PhoneIcon /> Call
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div style={{ ...card }}>
                <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: '#12241C' }}>Order Summary</p>
                {items.length > 0 ? items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: '#12241C' }}>
                    <span>{item.name} {item.qty > 1 ? `×${item.qty}` : ''}</span>
                    <span>${Number(item.price).toFixed(2)}</span>
                  </div>
                )) : (
                  <p style={{ fontSize: 13, color: '#7d9188', margin: 0 }}>{order.listing_type === 'service' ? 'Service booking' : 'Order details'}</p>
                )}
                {order.scheduled_time && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(18,36,28,0.07)', fontSize: 12, color: '#7d9188' }}>
                    <ClockIcon /> Scheduled: {fmt(order.scheduled_time)}
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(18,36,28,0.07)' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#12241C' }}>Total</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#12A150' }}>${Number(order.total_price || order.price || 0).toFixed(2)}</span>
                </div>
              </div>

              {order.status === 'delivered' || order.status === 'completed' ? (
                <Link href={`/student/bookings`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, height: 46, background: 'rgba(18,161,80,0.1)', border: '1px solid rgba(18,161,80,0.3)', borderRadius: 100, color: '#12A150', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                  <StarIcon /> Leave a review
                </Link>
              ) : !isCancelled && (
                <p style={{ textAlign: 'center', fontSize: 12, color: '#7d9188' }}>Need help? <Link href="/student/report" style={{ color: '#12A150', textDecoration: 'none' }}>Report an issue</Link></p>
              )}
            </>
          )}
        </div>
      
    </StudentLayout>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { useCart } from '@/lib/cart-store';
import { createClient } from '@/lib/supabase/client';

/* ─── Inline SVG icons ─── */
const Icon = {
  Cart: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  ),
  Trash: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  ),
  Plus: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Minus: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Check: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  CheckCircle: () => (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  Clock: () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  ChevronLeft: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  ),
  CreditCard: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  Lock: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  Package: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  ),
  Tag: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  ),
  // Payment brand icons
  VenmoLogo: () => (
    <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="#3D95CE"/>
      <path d="M28 10c.8 1.3 1.2 2.7 1.2 4.4 0 5.5-4.7 12.6-8.5 17.6H13L9.8 10.5l6.7-.6 1.9 10.2c1.8-3 4-7.7 4-10.9 0-1.7-.3-2.9-.8-3.9L28 10z" fill="white"/>
    </svg>
  ),
  ZelleLogo: () => (
    <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="#6D1ED4"/>
      <path d="M27 12H15l-3 4.5h9.5L13 28h12l3-4.5H18.5L27 12z" fill="white"/>
    </svg>
  ),
  CashAppLogo: () => (
    <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="#00D632"/>
      <path d="M21.8 14.2a5.8 5.8 0 0 0-3.8.4l-.6-1.6-2 .7.6 1.7A5.8 5.8 0 0 0 13 20c0 2.8 1.8 5.1 4.4 5.7l.6 1.7 2-.7-.6-1.6a5.8 5.8 0 0 0 3.5-3.3l-2.3-.8a3.3 3.3 0 0 1-3.2 2.1 3.3 3.3 0 0 1-1.8-4.4 3.3 3.3 0 0 1 3.6-1.8l.6 1.6 2-.7-.6-1.6z" fill="white"/>
      <path d="M20 9v2m0 18v2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  CardLogo: () => (
    <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="#1E2D4A"/>
      <rect x="6" y="12" width="28" height="18" rx="3" stroke="#12A150" strokeWidth="1.5"/>
      <rect x="6" y="18" width="28" height="5" fill="#12A150" fillOpacity="0.2"/>
      <rect x="10" y="23" width="8" height="3" rx="1" fill="#12A150" fillOpacity="0.6"/>
      <circle cx="28" cy="24.5" r="3" fill="#FFD700" fillOpacity="0.8"/>
      <circle cx="31" cy="24.5" r="3" fill="#FF6B00" fillOpacity="0.7"/>
    </svg>
  ),
};

const PAY_METHODS = [
  { id: 'venmo',   label: 'Venmo',    Logo: Icon.VenmoLogo,   color: '#3D95CE', handle: '@handout-pay',     hint: 'Instant transfer via Venmo' },
  { id: 'zelle',   label: 'Zelle',    Logo: Icon.ZelleLogo,   color: '#6D1ED4', handle: 'pay@handout.app',  hint: 'Bank-to-bank, no fees' },
  { id: 'cashapp', label: 'Cash App', Logo: Icon.CashAppLogo, color: '#00D632', handle: '$HandoutApp',      hint: 'Send via Cash App' },
  { id: 'card',    label: 'Card',     Logo: Icon.CardLogo,    color: '#12A150', handle: 'Visa · MC · Amex', hint: 'Pay securely by card' },
];

/* ─── Stepper ─── */
function Stepper({ step }: { step: 'cart' | 'fulfillment' | 'payment' | 'done' }) {
  const steps = [
    { key: 'cart', label: 'Cart' },
    { key: 'fulfillment', label: 'Delivery' },
    { key: 'payment', label: 'Payment' },
    { key: 'done', label: 'Sent' },
  ];
  const idx = steps.findIndex(s => s.key === step);
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
      {steps.map((s, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: done ? '#12A150' : active ? 'var(--amber)' : 'rgba(18,36,28,0.06)',
                border: `2px solid ${done ? '#12A150' : active ? 'var(--amber)' : 'rgba(18,36,28,0.12)'}`,
                color: done ? '#0d2010' : active ? '#ffffff' : 'var(--muted)',
                fontWeight: 800, fontSize: 12, transition: 'all 0.3s',
              }}>
                {done ? <Icon.Check /> : i + 1}
              </div>
              <span style={{ fontSize: 11, fontWeight: active ? 700 : 400, color: active ? 'var(--white)' : 'var(--muted)', whiteSpace: 'nowrap' }}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, marginBottom: 18, background: i < idx ? '#12A150' : 'rgba(18,36,28,0.09)', transition: 'background 0.3s' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Summary row ─── */
function SumRow({ label, value, valueColor, bold, large }: { label: string; value: string; valueColor?: string; bold?: boolean; large?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 13, color: bold ? 'var(--light)' : 'var(--muted)', fontWeight: bold ? 600 : 400 }}>{label}</span>
      <span style={{ fontSize: large ? 17 : 13, fontWeight: large ? 800 : bold ? 700 : 500, color: valueColor ?? (large ? 'var(--white)' : 'var(--light)') }}>
        {value}
      </span>
    </div>
  );
}

/* ─── Main page ─── */
export default function CartPage() {
  const { items, count, total, totalSaved, removeItem, updateQty, clearCart } = useCart();
  const [method, setMethod] = useState<string | null>(null);
  const [step, setStep] = useState<'cart' | 'fulfillment' | 'payment' | 'done'>('cart');
  const [fulfillment, setFulfillment] = useState<'pickup' | 'delivery' | null>(null);
  const [deliveryAddr, setDeliveryAddr] = useState('');
  const [cardNum, setCardNum] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [processing, setProcessing] = useState(false);
  const [payErr, setPayErr]         = useState('');
  const [doneVendorCount, setDoneVendorCount] = useState(1);
  const [couponCode, setCouponCode]       = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponErr, setCouponErr]         = useState('');
  const [couponApplied, setCouponApplied] = useState('');

  const tax        = Math.round((total - couponDiscount) * 0.06 * 100) / 100;
  const grandTotal = Math.round((total - couponDiscount + tax) * 100) / 100;

  async function applyCoupon() {
    if (!couponCode.trim()) return;
    setCouponErr('');
    const sb = createClient();
    const { data } = await sb.from('coupons').select('*').eq('code', couponCode.trim().toUpperCase()).eq('is_active', true).maybeSingle();
    if (!data) { setCouponErr('Invalid or expired coupon code.'); return; }
    if (data.min_order && total < data.min_order) { setCouponErr(`Minimum order $${data.min_order} required.`); return; }
    const discount = data.type === 'percent'
      ? Math.min(total * data.value / 100, data.max_discount || total)
      : Math.min(data.value, total);
    setCouponDiscount(Math.round(discount * 100) / 100);
    setCouponApplied(couponCode.trim().toUpperCase());
    setCouponCode('');
  }

  async function handlePay() {
    if (!method || processing) return;
    setProcessing(true);
    setPayErr('');
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { window.location.href = '/auth/login'; return; }

    // One booking per cart item, status 'pending' — the vendor must accept
    // before the order is confirmed. A DB trigger notifies each vendor.
    const rows = items.map(it => ({
      student_id: user.id,
      provider_id: it.vendorId,
      listing_type: it.type,
      listing_id: it.listingId,
      total_price: Math.round(it.price * it.qty * 100) / 100,
      status: 'pending',
      qty: it.qty,
      item_name: it.name,
      fulfillment,
      delivery_address: fulfillment === 'delivery' ? deliveryAddr.trim() : null,
      payment_method: method,
    }));
    let { error } = await sb.from('bookings').insert(rows);
    if (error) {
      // legacy DB without the cart columns — retry with the base schema fields
      const base = rows.map(({ qty, item_name, fulfillment: f, delivery_address, payment_method, ...r }) => r);
      ({ error } = await sb.from('bookings').insert(base));
    }
    if (error) {
      setProcessing(false);
      setPayErr(/row-level security/i.test(error.message)
        ? 'Your account is not verified yet. Complete verification in Settings before placing orders.'
        : error.message);
      return;
    }

    // Save pending reviews for all tiffin items so vendor detail page can prompt after 30 min
    const tifinItems = items.filter(i => i.type === 'tiffin');
    if (tifinItems.length > 0) {
      const existing: any[] = JSON.parse(localStorage.getItem('handout_pending_reviews') || '[]');
      const now = Date.now();
      tifinItems.forEach(item => {
        // Dedupe by listingId — don't add if already pending
        const alreadyPending = existing.some(e => e.listingId === item.listingId && !e.reviewed);
        if (!alreadyPending) {
          existing.push({
            id: `${item.listingId}-${now}`,
            listingId: item.listingId,
            vendorId: item.vendorId,
            vendorName: item.vendorName,
            itemName: item.name,
            orderedAt: now,
            reviewed: false,
          });
        }
      });
      localStorage.setItem('handout_pending_reviews', JSON.stringify(existing));
    }
    setDoneVendorCount(new Set(items.map(i => i.vendorId)).size || 1);
    setProcessing(false);
    setStep('done');
    clearCart();
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(18,36,28,0.05)',
    border: '1px solid rgba(18,36,28,0.12)',
    borderRadius: 10, padding: '11px 14px',
    color: 'var(--white)', fontSize: 14, outline: 'none',
    transition: 'border-color 0.2s',
  };
  const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 };

  /* ── Request-sent screen ── The order is PENDING; the vendor must accept
     before it becomes confirmed. Copy + amber styling reflect that. ── */
  if (step === 'done') return (
    <StudentLayout title="Request Sent">
      <div style={{ maxWidth: 460, margin: '48px auto', textAlign: 'center', padding: '0 20px' }}>
        <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'rgba(226,138,30,0.12)', border: '2px solid rgba(226,138,30,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#E08A1E' }}>
          <Icon.Clock />
        </div>
        <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: '#B5761A', background: '#FDF0DC', padding: '4px 12px', borderRadius: 100, marginBottom: 14 }}>
          Pending vendor approval
        </span>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--white)', marginBottom: 8, letterSpacing: -0.5 }}>Request sent!</h2>
        <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 28 }}>
          {doneVendorCount === 1
            ? "Your request was sent to the vendor. It isn't confirmed yet — you'll be notified the moment they accept."
            : `Your requests were sent to ${doneVendorCount} vendors. They aren't confirmed yet — you'll be notified as each one accepts.`}
        </p>
        <div style={{ background: 'var(--navy2)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 18px', marginBottom: 28, textAlign: 'left', display: 'flex', gap: 12 }}>
          <div style={{ color: '#E08A1E', flexShrink: 0, marginTop: 1 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--white)' }}>What happens next?</strong> The vendor reviews your request and accepts or declines. If declined, you won't be charged. Track live status under Bookings.
          </div>
        </div>
        <Link href="/student/bookings" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: 'var(--amber)', borderRadius: 100, color: '#ffffff', fontWeight: 800, textDecoration: 'none', fontSize: 14 }}>
          Track Status <Icon.ArrowRight />
        </Link>
        <div style={{ marginTop: 16 }}>
          <Link href="/student/food" style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none' }}>Continue shopping</Link>
        </div>
      </div>
    </StudentLayout>
  );

  return (
    <StudentLayout title="Checkout">
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <Stepper step={step} />

        {/* ── CART STEP ── */}
        {step === 'cart' && (
          <div className="rg-side" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 310px', gap: 24, alignItems: 'start' }}>
            {/* Left: items */}
            <div>
              {items.length === 0 ? (
                <div style={{ background: 'var(--navy2)', border: '1px solid var(--border)', borderRadius: 20, padding: '56px 24px', textAlign: 'center' }}>
                  <div style={{ color: 'var(--muted)', marginBottom: 16, opacity: 0.4 }}><Icon.Cart /></div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--white)', marginBottom: 6 }}>Your cart is empty</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 28 }}>Add items from Food & Tiffin to get started.</div>
                  <Link href="/student/food" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 22px', background: 'var(--amber)', borderRadius: 100, color: '#ffffff', fontWeight: 800, fontSize: 13, textDecoration: 'none' }}>
                    Browse Food <Icon.ArrowRight />
                  </Link>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', marginBottom: 12 }}>
                    {count} item{count !== 1 ? 's' : ''}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {items.map(item => (
                      <div key={item.id} style={{ background: 'var(--navy2)', border: '1px solid var(--border)', borderRadius: 16, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 16, transition: 'border-color 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                        {/* Icon */}
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: item.type === 'tiffin' ? 'rgba(18,161,80,0.1)' : 'rgba(124,107,209,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: item.type === 'tiffin' ? 'var(--amber)' : '#7C6BD1' }}>
                          <Icon.Package />
                        </div>
                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--white)', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--muted)' }}>by {item.vendorName}</div>
                        </div>
                        {/* Pricing */}
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          {item.discountPct > 0 && (
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', textDecoration: 'line-through', marginBottom: 1 }}>
                              ${item.originalPrice}{item.suffix}
                            </div>
                          )}
                          <div style={{ fontSize: 15, fontWeight: 800, color: item.discountPct > 0 ? '#12A150' : 'var(--white)' }}>
                            ${item.price}{item.suffix}
                          </div>
                          {item.discountPct > 0 && (
                            <div style={{ fontSize: 10, color: '#7C6BD1', fontWeight: 700, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3 }}>
                              <Icon.Tag /> Pro –{item.discountPct}%
                            </div>
                          )}
                        </div>
                        {/* Qty */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: 'rgba(18,36,28,0.06)', borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                          <button onClick={() => updateQty(item.id, item.qty - 1)}
                            style={{ width: 32, height: 32, border: 'none', background: 'transparent', color: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon.Minus />
                          </button>
                          <span style={{ width: 28, textAlign: 'center', fontSize: 13, fontWeight: 700, color: 'var(--white)' }}>{item.qty}</span>
                          <button onClick={() => updateQty(item.id, item.qty + 1)}
                            style={{ width: 32, height: 32, border: 'none', background: 'transparent', color: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon.Plus />
                          </button>
                        </div>
                        {/* Remove */}
                        <button onClick={() => removeItem(item.id)}
                          style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'rgba(255,80,80,0.08)', color: '#C25B4E', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,80,80,0.18)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,80,80,0.08)')}>
                          <Icon.Trash />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Right: summary */}
            <div style={{ background: 'var(--navy2)', border: '1px solid var(--border)', borderRadius: 20, padding: '22px 20px', position: 'sticky', top: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--white)', marginBottom: 18, letterSpacing: -0.2 }}>Order Summary</div>
              <div style={{ marginBottom: 14 }}>
                {!couponApplied ? (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} placeholder="Promo code" maxLength={20}
                      onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                      style={{ flex: 1, height: 36, background: 'rgba(18,36,28,0.05)', border: '1px solid rgba(18,36,28,0.12)', borderRadius: 8, padding: '0 10px', color: 'var(--white)', fontSize: 13, outline: 'none' }} />
                    <button onClick={applyCoupon} style={{ height: 36, padding: '0 12px', background: 'rgba(18,161,80,0.12)', border: '1px solid rgba(18,161,80,0.3)', borderRadius: 8, color: '#12A150', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Apply</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(18,161,80,0.08)', border: '1px solid rgba(18,161,80,0.2)', borderRadius: 8, padding: '7px 10px' }}>
                    <span style={{ fontSize: 12, color: '#12A150', fontWeight: 700 }}>Coupon: {couponApplied} applied</span>
                    <button onClick={() => { setCouponApplied(''); setCouponDiscount(0); }} style={{ fontSize: 11, color: '#7d9188', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
                  </div>
                )}
                {couponErr && <p style={{ margin: '4px 0 0', fontSize: 11, color: '#C25B4E' }}>{couponErr}</p>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 18 }}>
                <SumRow label={`Subtotal (${count} item${count !== 1 ? 's' : ''})`} value={`$${total.toFixed(2)}`} />
                {totalSaved > 0 && <SumRow label="Pro discount" value={`−$${totalSaved.toFixed(2)}`} valueColor="#12A150" />}
                {couponDiscount > 0 && <SumRow label={`Coupon (${couponApplied})`} value={`−$${couponDiscount.toFixed(2)}`} valueColor="#12A150" />}
                <SumRow label="Estimated tax (6%)" value={`$${tax.toFixed(2)}`} />
                <div style={{ height: 1, background: 'rgba(18,36,28,0.07)', margin: '4px 0' }} />
                <SumRow label="Total due" value={`$${grandTotal.toFixed(2)}`} bold large />
              </div>
              {items.length > 0 && (
                <button onClick={() => setStep('fulfillment')}
                  style={{ width: '100%', height: 46, background: 'var(--amber)', border: 'none', borderRadius: 12, color: '#ffffff', fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'opacity 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                  Proceed to Payment <Icon.ArrowRight />
                </button>
              )}
              <Link href="/student/food" style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 12, color: 'var(--muted)', textDecoration: 'none' }}>
                <Icon.ChevronLeft /> Continue shopping
              </Link>
              {/* Quick links */}
              <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid rgba(18,36,28,0.07)', display: 'flex', gap: 8 }}>
                <Link href="/student/coupons" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px 0', borderRadius: 10, border: '1px solid rgba(18,36,28,0.09)', background: 'rgba(18,36,28,0.04)', fontSize: 11, fontWeight: 600, color: 'var(--muted)', textDecoration: 'none' }}>
                  <Icon.Tag /> Coupons
                </Link>
                <Link href="/student/saved" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px 0', borderRadius: 10, border: '1px solid rgba(18,36,28,0.09)', background: 'rgba(18,36,28,0.04)', fontSize: 11, fontWeight: 600, color: 'var(--muted)', textDecoration: 'none' }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg> Saved
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── FULFILLMENT STEP ── */}
        {step === 'fulfillment' && (
          <div className="rg-side" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 310px', gap: 24, alignItems: 'start' }}>
            {/* Left: pickup / delivery */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 16, letterSpacing: 0.3, textTransform: 'uppercase' }}>
                How would you like to receive your order?
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                {/* Pickup card */}
                <button onClick={() => setFulfillment('pickup')}
                  style={{ background: fulfillment === 'pickup' ? 'rgba(18,161,80,0.07)' : 'var(--navy2)', border: `1.5px solid ${fulfillment === 'pickup' ? 'var(--amber)' : 'var(--border)'}`, borderRadius: 18, padding: '20px 22px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.18s', display: 'flex', alignItems: 'center', gap: 18 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: fulfillment === 'pickup' ? 'rgba(18,161,80,0.12)' : 'rgba(18,36,28,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: fulfillment === 'pickup' ? 'var(--amber)' : 'var(--muted)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--white)', marginBottom: 4 }}>Pickup</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>Pick up your order directly from the vendor. Coordinate a time after confirming.</div>
                    <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#12A150', background: 'rgba(18,161,80,0.08)', padding: '3px 10px', borderRadius: 6 }}>
                      Free
                    </div>
                  </div>
                  {fulfillment === 'pickup' && (
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#ffffff' }}>
                      <Icon.Check />
                    </div>
                  )}
                </button>

                {/* Delivery card */}
                <button onClick={() => setFulfillment('delivery')}
                  style={{ background: fulfillment === 'delivery' ? 'rgba(18,161,80,0.07)' : 'var(--navy2)', border: `1.5px solid ${fulfillment === 'delivery' ? 'var(--amber)' : 'var(--border)'}`, borderRadius: 18, padding: '20px 22px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.18s', display: 'flex', alignItems: 'center', gap: 18 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: fulfillment === 'delivery' ? 'rgba(18,161,80,0.12)' : 'rgba(18,36,28,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: fulfillment === 'delivery' ? 'var(--amber)' : 'var(--muted)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--white)', marginBottom: 4 }}>Delivery</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>Get your order delivered to your dorm or apartment. Coordinate address with vendor after checkout.</div>
                    <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#12A150', background: 'rgba(18,161,80,0.08)', padding: '3px 10px', borderRadius: 6 }}>
                      Free for now
                    </div>
                  </div>
                  {fulfillment === 'delivery' && (
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#ffffff' }}>
                      <Icon.Check />
                    </div>
                  )}
                </button>

                {/* Delivery address — required when Delivery is chosen */}
                {fulfillment === 'delivery' && (
                  <div style={{ background: 'var(--navy2)', border: '1px solid var(--border)', borderRadius: 16, padding: '16px 18px' }}>
                    <label htmlFor="delivery-addr" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                      Delivery address
                    </label>
                    <textarea
                      id="delivery-addr"
                      value={deliveryAddr}
                      onChange={e => setDeliveryAddr(e.target.value)}
                      rows={2}
                      placeholder="Dorm / building, room or apt #, street, city"
                      style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(18,36,28,0.05)', border: '1px solid rgba(18,36,28,0.12)', borderRadius: 10, padding: '11px 14px', color: 'var(--white)', fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                    />
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>Shared with the vendor so they can deliver your order.</div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: summary + continue */}
            <div style={{ background: 'var(--navy2)', border: '1px solid var(--border)', borderRadius: 20, padding: '22px 20px', position: 'sticky', top: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--white)', marginBottom: 18, letterSpacing: -0.2 }}>Order Summary</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 18 }}>
                <SumRow label={`Subtotal (${count} item${count !== 1 ? 's' : ''})`} value={`$${total.toFixed(2)}`} />
                {totalSaved > 0 && <SumRow label="Pro discount" value={`−$${totalSaved.toFixed(2)}`} valueColor="#12A150" />}
                <SumRow label="Delivery charge" value={fulfillment === 'delivery' ? 'FREE' : '—'} valueColor="#12A150" />
                <SumRow label="Estimated tax (6%)" value={`$${tax.toFixed(2)}`} />
                <div style={{ height: 1, background: 'rgba(18,36,28,0.07)', margin: '4px 0' }} />
                <SumRow label="Total due" value={`$${grandTotal.toFixed(2)}`} bold large />
              </div>
              {(() => {
                const canContinue = fulfillment === 'pickup' || (fulfillment === 'delivery' && deliveryAddr.trim().length > 0);
                return (
                  <button onClick={() => { if (canContinue) setStep('payment'); }}
                    disabled={!canContinue}
                    style={{ width: '100%', height: 46, background: canContinue ? 'var(--amber)' : 'rgba(18,36,28,0.06)', border: 'none', borderRadius: 12, color: canContinue ? '#ffffff' : 'var(--muted)', fontWeight: 800, fontSize: 14, cursor: canContinue ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}>
                    {!fulfillment ? 'Select an option above'
                      : fulfillment === 'delivery' && !deliveryAddr.trim() ? 'Enter a delivery address'
                      : <>Continue to Payment <Icon.ArrowRight /></>}
                  </button>
                );
              })()}
              <button onClick={() => setStep('cart')}
                style={{ marginTop: 10, width: '100%', height: 38, background: 'transparent', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--muted)', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <Icon.ChevronLeft /> Back to cart
              </button>
            </div>
          </div>
        )}

        {/* ── PAYMENT STEP ── */}
        {step === 'payment' && (
          <div className="rg-side" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 310px', gap: 24, alignItems: 'start' }}>
            {/* Left: methods */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 16, letterSpacing: 0.3, textTransform: 'uppercase' }}>
                Select Payment Method
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                {PAY_METHODS.map(m => {
                  const sel = method === m.id;
                  return (
                    <button key={m.id} onClick={() => setMethod(m.id)}
                      style={{
                        background: sel ? `rgba(${m.id === 'venmo' ? '61,149,206' : m.id === 'zelle' ? '109,30,212' : m.id === 'cashapp' ? '0,214,50' : '0,229,255'}, 0.1)` : 'var(--navy2)',
                        border: `1.5px solid ${sel ? m.color : 'var(--border)'}`,
                        borderRadius: 14, padding: '16px 14px',
                        cursor: 'pointer', textAlign: 'left',
                        transition: 'all 0.18s',
                      }}
                      onMouseEnter={e => { if (!sel) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                      onMouseLeave={e => { if (!sel) e.currentTarget.style.borderColor = 'var(--border)'; }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <m.Logo />
                        {sel && (
                          <div style={{ width: 18, height: 18, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                            <Icon.Check />
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--white)', marginBottom: 2 }}>{m.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{m.hint}</div>
                    </button>
                  );
                })}
              </div>

              {/* Card form */}
              {method === 'card' && (
                <div style={{ background: 'var(--navy2)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                    <div style={{ color: 'var(--amber)' }}><Icon.CreditCard /></div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--white)' }}>Card Details</span>
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--muted)' }}>
                      <Icon.Lock /> Secured
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <div style={labelStyle}>Cardholder Name</div>
                      <input value={cardName} onChange={e => setCardName(e.target.value)} placeholder="Jane Smith"
                        style={inputStyle}
                        onFocus={e => (e.target.style.borderColor = 'var(--amber)')}
                        onBlur={e => (e.target.style.borderColor = 'rgba(18,36,28,0.12)')} />
                    </div>
                    <div>
                      <div style={labelStyle}>Card Number</div>
                      <input value={cardNum}
                        onChange={e => setCardNum(e.target.value.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim())}
                        placeholder="1234  5678  9012  3456" maxLength={19}
                        style={{ ...inputStyle, letterSpacing: 3, fontFamily: 'monospace' }}
                        onFocus={e => (e.target.style.borderColor = 'var(--amber)')}
                        onBlur={e => (e.target.style.borderColor = 'rgba(18,36,28,0.12)')} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <div style={labelStyle}>Expiry Date</div>
                        <input value={cardExp}
                          onChange={e => {
                            let v = e.target.value.replace(/\D/g,'').slice(0,4);
                            if (v.length >= 3) v = v.slice(0,2) + '/' + v.slice(2);
                            setCardExp(v);
                          }} placeholder="MM / YY" maxLength={5}
                          style={{ ...inputStyle, fontFamily: 'monospace' }}
                          onFocus={e => (e.target.style.borderColor = 'var(--amber)')}
                          onBlur={e => (e.target.style.borderColor = 'rgba(18,36,28,0.12)')} />
                      </div>
                      <div>
                        <div style={labelStyle}>Security Code</div>
                        <input value={cardCvc} onChange={e => setCardCvc(e.target.value.replace(/\D/g,'').slice(0,4))}
                          placeholder="CVC" maxLength={4}
                          style={{ ...inputStyle, fontFamily: 'monospace' }}
                          onFocus={e => (e.target.style.borderColor = 'var(--amber)')}
                          onBlur={e => (e.target.style.borderColor = 'rgba(18,36,28,0.12)')} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* P2P instructions */}
              {method && method !== 'card' && (() => {
                const m = PAY_METHODS.find(p => p.id === method)!;
                return (
                  <div style={{ background: 'var(--navy2)', border: `1px solid ${m.color}33`, borderRadius: 16, padding: '20px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                      <m.Logo />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--white)' }}>Send to {m.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: m.color, marginTop: 2 }}>{m.handle}</div>
                      </div>
                    </div>
                    <div style={{ background: 'rgba(18,36,28,0.04)', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
                      <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
                        1. Open {m.label} and search for <strong style={{ color: 'var(--white)' }}>{m.handle}</strong><br />
                        2. Send exactly <strong style={{ color: m.color }}>${grandTotal.toFixed(2)}</strong><br />
                        3. Add your name in the note so we can match your payment<br />
                        4. Tap <em>"I've paid"</em> below to confirm your order
                      </div>
                    </div>
                    {/* QR area */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 72, height: 72, borderRadius: 12, background: 'rgba(18,36,28,0.06)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                          <rect x="4" y="4" width="16" height="16" rx="2" fill={m.color} fillOpacity="0.6"/>
                          <rect x="28" y="4" width="16" height="16" rx="2" fill={m.color} fillOpacity="0.6"/>
                          <rect x="4" y="28" width="16" height="16" rx="2" fill={m.color} fillOpacity="0.6"/>
                          <rect x="8" y="8" width="8" height="8" rx="1" fill={m.color}/>
                          <rect x="32" y="8" width="8" height="8" rx="1" fill={m.color}/>
                          <rect x="8" y="32" width="8" height="8" rx="1" fill={m.color}/>
                          <rect x="28" y="28" width="4" height="4" fill={m.color} fillOpacity="0.8"/>
                          <rect x="34" y="28" width="4" height="4" fill={m.color} fillOpacity="0.8"/>
                          <rect x="28" y="34" width="4" height="4" fill={m.color} fillOpacity="0.8"/>
                          <rect x="34" y="34" width="4" height="4" fill={m.color} fillOpacity="0.8"/>
                          <rect x="40" y="28" width="4" height="4" fill={m.color} fillOpacity="0.5"/>
                          <rect x="28" y="40" width="4" height="4" fill={m.color} fillOpacity="0.5"/>
                          <rect x="40" y="40" width="4" height="4" fill={m.color} fillOpacity="0.5"/>
                        </svg>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
                        Scan QR code in the {m.label} app, or search manually for the handle above.
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Right: summary + pay */}
            <div style={{ background: 'var(--navy2)', border: '1px solid var(--border)', borderRadius: 20, padding: '22px 20px', position: 'sticky', top: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--white)', marginBottom: 16, letterSpacing: -0.2 }}>Order Summary</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                {items.map(i => (
                  <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {i.name} <span style={{ color: 'rgba(255,255,255,0.3)' }}>×{i.qty}</span>
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--light)', fontWeight: 600, flexShrink: 0 }}>${(i.price * i.qty).toFixed(2)}</span>
                  </div>
                ))}
                <div style={{ height: 1, background: 'rgba(18,36,28,0.07)', margin: '4px 0' }} />
                {totalSaved > 0 && <SumRow label="Pro savings" value={`−$${totalSaved.toFixed(2)}`} valueColor="#12A150" />}
                <SumRow label="Tax (6%)" value={`$${tax.toFixed(2)}`} />
                <div style={{ height: 1, background: 'rgba(18,36,28,0.07)', margin: '4px 0' }} />
                <SumRow label="Total" value={`$${grandTotal.toFixed(2)}`} bold large />
              </div>

              <button onClick={handlePay} disabled={!method || processing}
                style={{
                  width: '100%', height: 48,
                  background: method ? (processing ? 'rgba(18,161,80,0.15)' : 'var(--amber)') : 'rgba(18,36,28,0.06)',
                  border: processing ? '1px solid rgba(18,161,80,0.3)' : 'none',
                  borderRadius: 12, color: method && !processing ? '#ffffff' : 'var(--muted)',
                  fontWeight: 800, fontSize: 14, cursor: method && !processing ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all 0.2s',
                }}>
                {processing ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
                        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
                      </path>
                    </svg>
                    Processing…
                  </>
                ) : method === 'card' ? (
                  <><Icon.Lock /> Pay ${grandTotal.toFixed(2)}</>
                ) : (
                  <><Icon.Check /> I've Paid ${grandTotal.toFixed(2)}</>
                )}
              </button>

              {payErr && (
                <div style={{ marginTop: 10, padding: '9px 12px', background: 'rgba(194,91,78,0.1)', border: '1px solid rgba(194,91,78,0.3)', borderRadius: 10, fontSize: 12, color: '#C25B4E', lineHeight: 1.5 }}>
                  {payErr}
                </div>
              )}

              {!method && !payErr && (
                <div style={{ marginTop: 10, textAlign: 'center', fontSize: 12, color: 'var(--muted)' }}>
                  Select a payment method to continue
                </div>
              )}

              <button onClick={() => setStep('fulfillment')}
                style={{ marginTop: 10, width: '100%', height: 38, background: 'transparent', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--muted)', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <Icon.ChevronLeft /> Back
              </button>

              <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>
                <Icon.Lock /> Secure checkout
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}

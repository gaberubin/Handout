'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { StudentLayout } from '@/components/layout/StudentLayout';

/* ── Icons ── */
const CheckIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const LockIcon   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const BackIcon   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const StarIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const ZapIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;

const PLANS: Record<string, {
  id: string; name: string; price: number; color: string; badge?: string;
  features: string[]; savings?: string;
}> = {
  plus: {
    id: 'plus', name: 'Plus', price: 9, color: '#12A150', badge: 'Most Popular',
    features: ['Unlimited messages', 'Unlimited roommate matches', 'Priority bookings', 'Verified student badge', 'Advanced search & filters', 'Save & favourite listings', 'Campus Connect (dating)'],
    savings: 'Most students save $20+/mo on bookings',
  },
  pro: {
    id: 'pro', name: 'Pro', price: 19, color: '#7C6BD1', badge: 'Best Value',
    features: ['Everything in Plus', '10% off all service bookings', '15% off bulk tiffin', '$5/month campus credit', 'Group bookings (up to 5)', 'Unlimited handout posts', 'Spending analytics', 'Priority support', 'Early access features'],
    savings: 'Pro users save $25+ on average — plan pays for itself',
  },
};

function formatCard(v: string) {
  return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}
function formatExpiry(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}
function formatCvc(v: string) { return v.replace(/\D/g, '').slice(0, 4); }

function detectBrand(num: string) {
  const n = num.replace(/\s/g, '');
  if (/^4/.test(n)) return 'VISA';
  if (/^5[1-5]/.test(n)) return 'MC';
  if (/^3[47]/.test(n)) return 'AMEX';
  return null;
}

const BRAND_COLORS: Record<string, string> = { VISA: '#1a1f71', MC: '#EB001B', AMEX: '#007bc1' };

export default function CheckoutPage() {
  const router = useRouter();
  const params = useSearchParams();
  const planId = params.get('plan') || 'plus';
  const plan   = PLANS[planId] || PLANS.plus;

  const [me, setMe]         = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep]     = useState<'form' | 'processing' | 'success'>('form');

  /* Card form */
  const [card, setCard]     = useState('');
  const [name, setName]     = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc]       = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const cvcRef = useRef<HTMLInputElement>(null);
  const expiryRef = useRef<HTMLInputElement>(null);

  const brand = detectBrand(card);
  const isAnnual = params.get('annual') === '1';
  const effectivePrice = isAnnual ? Math.round(plan.price * 10) : plan.price;
  const label = isAnnual ? '/year' : '/month';

  useEffect(() => {
    (async () => {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }
      const { data: u } = await sb.from('users').select('*').eq('id', user.id).single();
      setMe(u || { id: user.id, plan: 'free' });
      if (u?.plan === planId) { router.replace('/student/membership'); return; }
      setLoading(false);
    })();
  }, []);

  function validate() {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Name required';
    const rawCard = card.replace(/\s/g, '');
    if (rawCard.length < 16) errs.card = 'Enter a valid 16-digit card number';
    const [mm, yy] = expiry.split('/');
    const nowY = new Date().getFullYear() % 100, nowM = new Date().getMonth() + 1;
    if (!mm || !yy || parseInt(yy) < nowY || (parseInt(yy) === nowY && parseInt(mm) < nowM) || parseInt(mm) > 12)
      errs.expiry = 'Invalid expiry';
    if (cvc.length < 3) errs.cvc = 'Invalid CVC';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStep('processing');

    // Simulate payment processing (2s)
    await new Promise(r => setTimeout(r, 2000));

    // Activate plan
    const sb = createClient();
    await sb.from('users').update({ plan: planId }).eq('id', me.id);
    setMe((p: any) => ({ ...p, plan: planId }));
    setStep('success');
  }

  if (loading) return (
    <StudentLayout title="Checkout">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:300, color:'#7d9188', fontSize:14 }}>Loading…</div>
    </StudentLayout>
  );

  /* ── SUCCESS SCREEN ── */
  if (step === 'success') return (
    <StudentLayout title="Welcome to Premium">
      <div style={{ maxWidth:480, margin:'60px auto', padding:'0 0 80px', textAlign:'center' }}>
        <div style={{ width:80, height:80, borderRadius:'50%', background:'rgba(18,161,80,0.12)', border:'2px solid rgba(18,161,80,0.4)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px', fontSize:36 }}>🎉</div>
        <h1 style={{ fontSize:28, fontWeight:800, color:'#12241C', margin:'0 0 10px', letterSpacing:-0.5 }}>
          Welcome to {plan.name}!
        </h1>
        <p style={{ fontSize:15, color:'#7d9188', margin:'0 0 28px', lineHeight:1.6 }}>
          Your plan is now active. All {plan.name} features have been unlocked on your account.
        </p>

        {/* Unlocked features */}
        <div style={{ background:'#FFFFFF', border:`1px solid ${plan.color}30`, borderRadius:16, padding:'18px 20px', marginBottom:28, textAlign:'left' }}>
          <p style={{ margin:'0 0 12px', fontSize:11, fontWeight:800, color:'#7d9188', textTransform:'uppercase', letterSpacing:1 }}>You now have access to</p>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {plan.features.slice(0, 5).map(f => (
              <span key={f} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#4c6157' }}>
                <span style={{ color:plan.color, flexShrink:0 }}><CheckIcon /></span>{f}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <Link href="/student/dashboard" style={{ display:'block', height:46, lineHeight:'46px', borderRadius:12, background:plan.color, color: plan.id === 'pro' ? '#ffffff' : '#ffffff', fontWeight:800, fontSize:14, textDecoration:'none', textAlign:'center' }}>
            Go to Dashboard →
          </Link>
          <Link href="/student/membership" style={{ display:'block', height:42, lineHeight:'42px', borderRadius:12, border:'1px solid rgba(18,36,28,0.09)', color:'#7d9188', fontSize:13, fontWeight:600, textDecoration:'none', textAlign:'center' }}>
            View membership details
          </Link>
        </div>
      </div>
    </StudentLayout>
  );

  /* ── PROCESSING SCREEN ── */
  if (step === 'processing') return (
    <StudentLayout title="Processing payment">
      <div style={{ maxWidth:400, margin:'80px auto', textAlign:'center', padding:'0 0 80px' }}>
        <div style={{ width:64, height:64, borderRadius:'50%', border:`3px solid ${plan.color}`, borderTopColor:'transparent', margin:'0 auto 24px', animation:'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <h2 style={{ fontSize:20, fontWeight:800, color:'#12241C', margin:'0 0 8px' }}>Processing payment…</h2>
        <p style={{ fontSize:13, color:'#7d9188', margin:0 }}>Please don't close this page</p>
      </div>
    </StudentLayout>
  );

  /* ── CHECKOUT FORM ── */
  return (
    <StudentLayout title="Checkout">
      <div style={{ maxWidth:820, margin:'0 auto', padding:'28px 0 80px' }}>

        <Link href="/student/membership" style={{ display:'inline-flex', alignItems:'center', gap:6, color:'#7d9188', fontSize:13, fontWeight:600, textDecoration:'none', marginBottom:24 }}>
          <BackIcon /> Back to plans
        </Link>

        <div className="rg-side" style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:24, alignItems:'start' }}>

          {/* LEFT — Payment form */}
          <div>
            <h1 style={{ fontSize:22, fontWeight:800, color:'#12241C', margin:'0 0 4px', letterSpacing:-0.5 }}>Complete your upgrade</h1>
            <p style={{ fontSize:13, color:'#7d9188', margin:'0 0 24px' }}>You're upgrading to <strong style={{ color:plan.color }}>{plan.name}</strong> — {effectivePrice === 0 ? 'free forever' : `$${effectivePrice}${label}`}</p>

            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:18 }}>

              {/* Card number */}
              <div>
                <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#7d9188', marginBottom:6, textTransform:'uppercase', letterSpacing:0.5 }}>Card number</label>
                <div style={{ position:'relative' }}>
                  <input
                    value={card}
                    onChange={e => {
                      const v = formatCard(e.target.value);
                      setCard(v);
                      if (v.replace(/\s/g,'').length === 16) expiryRef.current?.focus();
                    }}
                    placeholder="1234 5678 9012 3456"
                    inputMode="numeric"
                    style={{ width:'100%', height:48, padding:'0 50px 0 16px', boxSizing:'border-box', background:'rgba(18,36,28,0.06)', border:`1px solid ${errors.card ? '#C25B4E' : 'rgba(18,36,28,0.12)'}`, borderRadius:12, color:'#12241C', fontSize:16, letterSpacing:2, outline:'none', fontFamily:'monospace' }}
                  />
                  {brand && (
                    <span style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', fontSize:10, fontWeight:800, padding:'3px 6px', borderRadius:4, background: BRAND_COLORS[brand] || '#333', color:'#fff' }}>{brand}</span>
                  )}
                </div>
                {errors.card && <p style={{ margin:'4px 0 0', fontSize:11, color:'#C25B4E' }}>{errors.card}</p>}
              </div>

              {/* Name on card */}
              <div>
                <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#7d9188', marginBottom:6, textTransform:'uppercase', letterSpacing:0.5 }}>Name on card</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="JOHN DOE"
                  style={{ width:'100%', height:48, padding:'0 16px', boxSizing:'border-box', background:'rgba(18,36,28,0.06)', border:`1px solid ${errors.name ? '#C25B4E' : 'rgba(18,36,28,0.12)'}`, borderRadius:12, color:'#12241C', fontSize:14, outline:'none', textTransform:'uppercase', letterSpacing:1 }}
                />
                {errors.name && <p style={{ margin:'4px 0 0', fontSize:11, color:'#C25B4E' }}>{errors.name}</p>}
              </div>

              {/* Expiry + CVC */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div>
                  <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#7d9188', marginBottom:6, textTransform:'uppercase', letterSpacing:0.5 }}>Expiry</label>
                  <input
                    ref={expiryRef}
                    value={expiry}
                    onChange={e => {
                      const v = formatExpiry(e.target.value);
                      setExpiry(v);
                      if (v.length === 5) cvcRef.current?.focus();
                    }}
                    placeholder="MM/YY"
                    inputMode="numeric"
                    style={{ width:'100%', height:48, padding:'0 16px', boxSizing:'border-box', background:'rgba(18,36,28,0.06)', border:`1px solid ${errors.expiry ? '#C25B4E' : 'rgba(18,36,28,0.12)'}`, borderRadius:12, color:'#12241C', fontSize:16, letterSpacing:2, outline:'none', fontFamily:'monospace' }}
                  />
                  {errors.expiry && <p style={{ margin:'4px 0 0', fontSize:11, color:'#C25B4E' }}>{errors.expiry}</p>}
                </div>
                <div>
                  <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#7d9188', marginBottom:6, textTransform:'uppercase', letterSpacing:0.5 }}>CVC</label>
                  <input
                    ref={cvcRef}
                    value={cvc}
                    onChange={e => setCvc(formatCvc(e.target.value))}
                    placeholder="123"
                    inputMode="numeric"
                    type="password"
                    style={{ width:'100%', height:48, padding:'0 16px', boxSizing:'border-box', background:'rgba(18,36,28,0.06)', border:`1px solid ${errors.cvc ? '#C25B4E' : 'rgba(18,36,28,0.12)'}`, borderRadius:12, color:'#12241C', fontSize:16, letterSpacing:4, outline:'none', fontFamily:'monospace' }}
                  />
                  {errors.cvc && <p style={{ margin:'4px 0 0', fontSize:11, color:'#C25B4E' }}>{errors.cvc}</p>}
                </div>
              </div>

              {/* Billing toggle */}
              <div style={{ display:'flex', gap:8 }}>
                <button type="button"
                  onClick={() => router.replace(`/student/checkout?plan=${planId}`)}
                  style={{ flex:1, height:40, borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer', border:`1px solid ${!isAnnual ? `${plan.color}50` : 'rgba(18,36,28,0.09)'}`, background:!isAnnual ? `${plan.color}12` : 'rgba(18,36,28,0.04)', color:!isAnnual ? plan.color : '#7d9188' }}>
                  Monthly — ${plan.price}/mo
                </button>
                <button type="button"
                  onClick={() => router.replace(`/student/checkout?plan=${planId}&annual=1`)}
                  style={{ flex:1, height:40, borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer', border:`1px solid ${isAnnual ? `${plan.color}50` : 'rgba(18,36,28,0.09)'}`, background:isAnnual ? `${plan.color}12` : 'rgba(18,36,28,0.04)', color:isAnnual ? plan.color : '#7d9188', position:'relative' }}>
                  Annual — ${plan.price * 10}/yr
                  <span style={{ position:'absolute', top:-8, right:8, fontSize:9, fontWeight:800, background:'#12A150', color:'#ffffff', padding:'1px 6px', borderRadius:100 }}>SAVE 17%</span>
                </button>
              </div>

              {/* Submit */}
              <button type="submit"
                style={{ height:52, borderRadius:14, background:plan.color, color: plan.id === 'pro' ? '#ffffff' : '#ffffff', fontWeight:800, fontSize:16, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                <LockIcon /> Pay ${effectivePrice}{label} — Activate {plan.name}
              </button>

              {/* Trust signals */}
              <div style={{ display:'flex', justifyContent:'center', gap:20, fontSize:11, color:'#7d9188' }}>
                <span style={{ display:'flex', alignItems:'center', gap:5 }}><LockIcon /> SSL encrypted</span>
                <span>Cancel anytime</span>
                <span>Instant activation</span>
              </div>
            </form>
          </div>

          {/* RIGHT — Plan summary */}
          <div style={{ position:'sticky', top:24 }}>

            {/* Plan card */}
            <div style={{ background:`linear-gradient(135deg, ${plan.color}10, rgba(255,255,255,0.6))`, border:`1px solid ${plan.color}35`, borderRadius:18, padding:'22px 24px', marginBottom:14 }}>
              {plan.badge && (
                <span style={{ display:'inline-block', fontSize:10, fontWeight:800, padding:'3px 10px', borderRadius:100, background:`${plan.color}20`, color:plan.color, border:`1px solid ${plan.color}40`, marginBottom:12, letterSpacing:0.5, textTransform:'uppercase' }}>{plan.badge}</span>
              )}
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
                <div>
                  <p style={{ margin:0, fontSize:11, fontWeight:700, color:'#7d9188', textTransform:'uppercase', letterSpacing:1 }}>You're upgrading to</p>
                  <h2 style={{ margin:'4px 0 0', fontSize:28, fontWeight:800, color:plan.color, letterSpacing:-1 }}>{plan.name}</h2>
                </div>
                <div style={{ textAlign:'right' }}>
                  <p style={{ margin:0, fontSize:30, fontWeight:800, color:'#12241C', letterSpacing:-1, lineHeight:1 }}>${effectivePrice}</p>
                  <p style={{ margin:'2px 0 0', fontSize:12, color:'#7d9188' }}>{label}</p>
                </div>
              </div>

              {/* Features */}
              <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                {plan.features.map(f => (
                  <span key={f} style={{ display:'flex', alignItems:'flex-start', gap:8, fontSize:13, color:'#4c6157' }}>
                    <span style={{ color:plan.color, flexShrink:0, marginTop:1 }}><CheckIcon /></span>{f}
                  </span>
                ))}
              </div>

              {plan.savings && (
                <div style={{ marginTop:16, padding:'10px 12px', background:'rgba(18,161,80,0.08)', border:'1px solid rgba(18,161,80,0.2)', borderRadius:10 }}>
                  <p style={{ margin:0, fontSize:12, color:'#12A150', display:'flex', alignItems:'center', gap:6 }}>
                    <ZapIcon /> {plan.savings}
                  </p>
                </div>
              )}
            </div>

            {/* Guarantee */}
            <div style={{ background:'rgba(18,36,28,0.04)', border:'1px solid rgba(18,36,28,0.09)', borderRadius:14, padding:'14px 16px' }}>
              <p style={{ margin:'0 0 6px', fontSize:12, fontWeight:700, color:'#12241C', display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ fontSize:16 }}>🛡️</span> 7-day money-back guarantee
              </p>
              <p style={{ margin:0, fontSize:12, color:'#7d9188', lineHeight:1.6 }}>
                Not satisfied? Contact support within 7 days for a full refund, no questions asked.
              </p>
            </div>

            {/* Already subscribed? */}
            <p style={{ textAlign:'center', fontSize:12, color:'#7d9188', marginTop:16 }}>
              Already on {plan.name}?{' '}
              <Link href="/student/membership" style={{ color:plan.color, textDecoration:'none', fontWeight:600 }}>View your plan</Link>
            </p>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { StudentLayout } from '@/components/layout/StudentLayout';

/* ── Icons ── */
const CheckIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const StarIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const CardIcon   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
const ReceiptIcon= () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>;
const ZapIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const ShieldIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;

const PLANS = [
  {
    id: 'free', name: 'Free', price: 0, color: '#7d9188',
    features: ['Browse all listings','2 roommate inquiries/month','3 messages/day','Post 1 handout','Community (read-only)'],
  },
  {
    id: 'plus', name: 'Plus', price: 9, color: '#12A150',
    features: ['Everything in Free','Unlimited roommate matches','Unlimited messages','Priority booking','Verified student badge','Campus Connect','Advanced filters'],
  },
  {
    id: 'pro', name: 'Pro', price: 19, color: '#7C6BD1',
    features: ['Everything in Plus','Group bookings','Pro savings on all services','Early access to features','Dedicated support','$5/mo credit back'],
  },
];

const MOCK_HISTORY = [
  { id:'INV-2024-004', date:'Jun 1, 2025', plan:'Plus', amount:'$9.00', status:'Paid' },
  { id:'INV-2024-003', date:'May 1, 2025', plan:'Plus', amount:'$9.00', status:'Paid' },
  { id:'INV-2024-002', date:'Apr 1, 2025', plan:'Plus', amount:'$9.00', status:'Paid' },
  { id:'INV-2024-001', date:'Mar 1, 2025', plan:'Free', amount:'$0.00', status:'—' },
];

const card: React.CSSProperties = { background:'#FFFFFF', border:'1px solid rgba(18,36,28,0.09)', borderRadius:16 };

export default function BillingPage() {
  const router = useRouter();
  const [me, setMe]         = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string|null>(null);

  useEffect(() => {
    (async () => {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }
      const { data: u } = await sb.from('users').select('*').eq('id', user.id).single();
      setMe(u || { id: user.id, plan: 'free' });
      setLoading(false);
    })();
  }, []);

  async function changePlan(planId: string) {
    if (planId === me?.plan) return;
    if (!confirm(`Switch to ${planId.charAt(0).toUpperCase()+planId.slice(1)} plan?`)) return;
    setUpgrading(planId);
    const sb = createClient();
    await sb.from('users').update({ plan: planId }).eq('id', me.id);
    setMe((prev: any) => ({ ...prev, plan: planId }));
    setUpgrading(null);
  }

  const currentPlan = PLANS.find(p => p.id === me?.plan) || PLANS[0];

  if (loading) return (
    <StudentLayout title="Billing">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:300, color:'#7d9188', fontSize:14 }}>Loading…</div>
    </StudentLayout>
  );

  return (
    <StudentLayout title="Billing">
      <div style={{ maxWidth:760, margin:'0 auto', padding:'28px 0 80px' }}>

        <h1 style={{ fontSize:24, fontWeight:800, color:'#12241C', margin:'0 0 6px', letterSpacing:-0.5 }}>Billing & Plan</h1>
        <p style={{ margin:'0 0 28px', fontSize:13, color:'#7d9188' }}>Manage your membership and billing details</p>

        {/* Current plan hero */}
        <div style={{ ...card, padding:'24px 28px', marginBottom:20, border:`1px solid ${currentPlan.color}40`, background:`linear-gradient(135deg, ${currentPlan.color}08, rgba(255,255,255,0.6))`, position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', right:-30, top:-30, width:120, height:120, borderRadius:'50%', background:`${currentPlan.color}08` }} />
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16 }}>
            <div>
              <p style={{ margin:'0 0 4px', fontSize:11, fontWeight:800, color:'#7d9188', textTransform:'uppercase', letterSpacing:1 }}>Current plan</p>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <h2 style={{ margin:0, fontSize:32, fontWeight:800, color:currentPlan.color, letterSpacing:-1 }}>{currentPlan.name}</h2>
                {currentPlan.id !== 'free' && <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:100, background:`${currentPlan.color}18`, color:currentPlan.color, border:`1px solid ${currentPlan.color}30` }}>Active</span>}
              </div>
              <p style={{ margin:'6px 0 0', fontSize:14, color:'#7d9188' }}>
                {currentPlan.price === 0 ? 'Free forever' : `$${currentPlan.price}/month · renews monthly`}
              </p>
            </div>
            <div style={{ textAlign:'right' }}>
              <p style={{ margin:0, fontSize:36, fontWeight:800, color:currentPlan.color, lineHeight:1 }}>
                {currentPlan.price === 0 ? 'Free' : `$${currentPlan.price}`}
              </p>
              {currentPlan.price > 0 && <p style={{ margin:'4px 0 0', fontSize:12, color:'#7d9188' }}>per month</p>}
            </div>
          </div>

          {/* Active features */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:16 }}>
            {currentPlan.features.map(f => (
              <span key={f} style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:12, color:currentPlan.color, background:`${currentPlan.color}10`, padding:'4px 10px', borderRadius:100, border:`1px solid ${currentPlan.color}25` }}>
                <CheckIcon /> {f}
              </span>
            ))}
          </div>
        </div>

        {/* Plan comparison */}
        <div style={{ marginBottom:24 }}>
          <p style={{ fontSize:11, fontWeight:800, color:'#7d9188', textTransform:'uppercase', letterSpacing:1, margin:'0 0 14px' }}>All plans</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
            {PLANS.map(p => {
              const isCurrent = p.id === me?.plan;
              return (
                <div key={p.id} style={{ ...card, padding:'18px 20px', border:`1px solid ${isCurrent ? p.color+'50' : 'rgba(18,36,28,0.09)'}`, background: isCurrent ? `linear-gradient(135deg, ${p.color}08, rgba(255,255,255,0.6))` : undefined }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                    <span style={{ fontSize:14, fontWeight:800, color: isCurrent ? p.color : '#12241C' }}>{p.name}</span>
                    {p.id === 'plus' && <span style={{ fontSize:9, fontWeight:800, padding:'2px 7px', borderRadius:100, background:'rgba(18,161,80,0.12)', color:'#12A150', border:'1px solid rgba(18,161,80,0.25)' }}>POPULAR</span>}
                  </div>
                  <p style={{ margin:'0 0 14px', fontSize:26, fontWeight:800, color: p.color, lineHeight:1 }}>
                    {p.price === 0 ? 'Free' : `$${p.price}`}
                    {p.price > 0 && <span style={{ fontSize:12, fontWeight:400, color:'#7d9188' }}>/mo</span>}
                  </p>
                  <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:16 }}>
                    {p.features.map(f => (
                      <span key={f} style={{ fontSize:11, color:'#4c6157', display:'flex', alignItems:'flex-start', gap:6 }}>
                        <span style={{ color:p.color, flexShrink:0, marginTop:1 }}><CheckIcon /></span>{f}
                      </span>
                    ))}
                  </div>
                  {isCurrent || p.price === 0 ? (
                    <button disabled style={{ width:'100%', height:36, borderRadius:10, fontSize:12, fontWeight:700, cursor:'default', border:'none', background:`${p.color}18`, color:p.color, opacity:0.7 }}>
                      {isCurrent ? 'Current plan' : 'Free forever'}
                    </button>
                  ) : p.price > currentPlan.price ? (
                    <a href={`/student/checkout?plan=${p.id}`} style={{ display:'block', width:'100%', height:36, lineHeight:'36px', textAlign:'center', borderRadius:10, fontSize:12, fontWeight:700, border:`1px solid ${p.color}50`, background:`${p.color}12`, color:p.color, textDecoration:'none' }}>
                      ↑ Upgrade
                    </a>
                  ) : (
                    <button onClick={() => changePlan(p.id)} style={{ width:'100%', height:36, borderRadius:10, fontSize:12, fontWeight:700, cursor:'pointer', border:`1px solid ${p.color}30`, background:'rgba(194,91,78,0.06)', color:'#C25B4E' }}>
                      ↓ Downgrade
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24 }}>
          {/* Payment method */}
          <div style={{ ...card, padding:'18px 20px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
              <span style={{ color:'#7d9188' }}><CardIcon /></span>
              <p style={{ margin:0, fontSize:11, fontWeight:800, color:'#7d9188', textTransform:'uppercase', letterSpacing:1 }}>Payment method</p>
            </div>
            {me?.plan === 'free' ? (
              <p style={{ margin:0, fontSize:13, color:'#7d9188' }}>No payment method on file — upgrade to add one.</p>
            ) : (
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:44, height:28, borderRadius:6, background:'linear-gradient(135deg,#ffffff,#16213e)', border:'1px solid rgba(18,36,28,0.09)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:800, color:'#E08A1E' }}>VISA</div>
                <div>
                  <p style={{ margin:0, fontSize:13, fontWeight:600, color:'#12241C' }}>•••• •••• •••• 4242</p>
                  <p style={{ margin:'2px 0 0', fontSize:11, color:'#7d9188' }}>Expires 08/27</p>
                </div>
              </div>
            )}
          </div>

          {/* Next billing */}
          <div style={{ ...card, padding:'18px 20px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
              <span style={{ color:'#7d9188' }}><ZapIcon /></span>
              <p style={{ margin:0, fontSize:11, fontWeight:800, color:'#7d9188', textTransform:'uppercase', letterSpacing:1 }}>Next billing</p>
            </div>
            {me?.plan === 'free' ? (
              <p style={{ margin:0, fontSize:13, color:'#7d9188' }}>Free plan — no charges.</p>
            ) : (
              <div>
                <p style={{ margin:0, fontSize:20, fontWeight:800, color:'#12241C' }}>${ currentPlan.price }.00</p>
                <p style={{ margin:'4px 0 0', fontSize:12, color:'#7d9188' }}>on Jul 1, 2025</p>
              </div>
            )}
          </div>
        </div>

        {/* Billing history */}
        <div style={{ ...card, padding:'20px 22px', marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
            <span style={{ color:'#7d9188' }}><ReceiptIcon /></span>
            <p style={{ margin:0, fontSize:11, fontWeight:800, color:'#7d9188', textTransform:'uppercase', letterSpacing:1 }}>Billing history</p>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
            {MOCK_HISTORY.map((h, i) => (
              <div key={h.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderTop: i > 0 ? '1px solid rgba(18,36,28,0.06)' : 'none' }}>
                <div>
                  <p style={{ margin:0, fontSize:13, fontWeight:600, color:'#12241C' }}>{h.plan} plan · {h.date}</p>
                  <p style={{ margin:'2px 0 0', fontSize:11, color:'#7d9188' }}>{h.id}</p>
                </div>
                <div style={{ textAlign:'right', display:'flex', alignItems:'center', gap:12 }}>
                  <span style={{ fontSize:13, fontWeight:700, color:'#12241C' }}>{h.amount}</span>
                  <span style={{ fontSize:11, fontWeight:700, padding:'2px 9px', borderRadius:100, background: h.status==='Paid' ? 'rgba(18,161,80,0.1)' : 'rgba(18,36,28,0.06)', color: h.status==='Paid' ? '#12A150' : '#7d9188', border: `1px solid ${h.status==='Paid' ? 'rgba(18,161,80,0.25)' : 'rgba(18,36,28,0.09)'}` }}>{h.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security note */}
        <div style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'14px 18px', background:'rgba(18,36,28,0.04)', border:'1px solid rgba(18,36,28,0.07)', borderRadius:12 }}>
          <span style={{ color:'#12A150', flexShrink:0, marginTop:1 }}><ShieldIcon /></span>
          <p style={{ margin:0, fontSize:12, color:'#7d9188', lineHeight:1.6 }}>
            All payments are processed securely. You can cancel or change your plan at any time. Downgrades take effect at the end of your billing cycle.
          </p>
        </div>

      </div>
    </StudentLayout>
  );
}

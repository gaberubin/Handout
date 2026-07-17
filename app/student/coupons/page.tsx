'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { createClient } from '@/lib/supabase/client';

const TagIcon   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
const CopyIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
const CheckIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const LockIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const GiftIcon  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>;

interface Coupon {
  code: string; type: 'percent'|'fixed'; value: number;
  desc: string; color: string; proOnly?: boolean; minOrder?: number;
}

// Always visible — no DB needed
const ALWAYS_ON: Coupon[] = [
  { code: 'WELCOME10', type: 'percent', value: 10, desc: '10% off your first order — any category', color: '#12A150' },
  { code: 'STUDENT5',  type: 'fixed',   value: 5,  desc: '$5 off any service booking (min. $20)',  color: '#12A150', minOrder: 20 },
  { code: 'PRO20',     type: 'percent', value: 20, desc: '20% off food orders — Pro members only', color: '#7C6BD1', proOnly: true },
];

const card: React.CSSProperties = {
  background: '#FFFFFF',
  border: '1px solid rgba(18,36,28,0.09)',
  borderRadius: 14,
  padding: '16px 18px',
};

export default function CouponsPage() {
  const [plan, setPlan]         = useState('free');
  const [extra, setExtra]       = useState<Coupon[]>([]);
  const [copied, setCopied]     = useState<string|null>(null);

  useEffect(() => {
    (async () => {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return;

      // Get plan
      const { data: u } = await sb.from('users').select('plan,membership_plan').eq('id', user.id).single();
      setPlan(u?.membership_plan || u?.plan || 'free');

      // Referral codes
      const { data: refs } = await sb.from('referrals').select('id,created_at').eq('referrer_id', user.id).limit(5);
      const refCoupons: Coupon[] = (refs || []).map((_, i) => ({
        code: `REFER${String(i + 1).padStart(2, '0')}`,
        type: 'fixed', value: 15,
        desc: '$15 credit — referral reward',
        color: '#E08A1E',
      }));

      // Admin/vendor coupons from DB
      const { data: dbC } = await sb.from('coupons').select('code,type,value,description,min_order').eq('is_active', true);
      const dbCoupons: Coupon[] = (dbC || []).map(c => ({
        code: c.code, type: c.type, value: c.value,
        desc: c.description || `${c.type === 'percent' ? c.value + '%' : '$' + c.value} off`,
        color: '#FF9F6B', minOrder: c.min_order,
      }));

      setExtra([...refCoupons, ...dbCoupons]);
    })();
  }, []);

  function copy(code: string) {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(code);
    setTimeout(() => setCopied(null), 2200);
  }

  const fmt = (c: Coupon) => c.type === 'percent' ? `${c.value}% off` : `$${c.value} off`;
  const allCoupons = [...ALWAYS_ON, ...extra];

  return (
    <StudentLayout title="Coupons">
        <div style={{ maxWidth: 520, margin: '0 auto', padding: '32px 0 80px' }}>

          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 22, fontWeight: 800, color: '#12241C', margin: '0 0 4px' }}>Coupons</h1>
            <p style={{ fontSize: 13, color: '#7d9188', margin: 0 }}>Copy a code and paste it at checkout to save.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {allCoupons.map(c => {
              const locked  = !!c.proOnly && plan !== 'pro';
              const isCopied = copied === c.code;
              return (
                <div key={c.code} style={{ ...card, display: 'flex', alignItems: 'center', gap: 14, opacity: locked ? 0.6 : 1, borderColor: isCopied ? `${c.color}50` : 'rgba(18,36,28,0.09)' }}>
                  {/* Color dot */}
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${c.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color, flexShrink: 0 }}>
                    {locked ? <LockIcon /> : <TagIcon />}
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 800, color: c.color, letterSpacing: 1 }}>{c.code}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: `${c.color}18`, color: c.color, flexShrink: 0 }}>{fmt(c)}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: locked ? '#7d9188' : '#7d9188' }}>
                      {locked ? 'Upgrade to Pro to unlock this coupon' : c.desc}
                    </p>
                  </div>

                  {/* Copy */}
                  {!locked ? (
                    <button onClick={() => copy(c.code)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 13px', borderRadius: 100, border: `1px solid ${isCopied ? c.color : 'rgba(18,36,28,0.12)'}`, background: isCopied ? `${c.color}15` : 'transparent', color: isCopied ? c.color : '#7d9188', fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0, transition: 'all .15s' }}>
                      {isCopied ? <><CheckIcon /> Copied!</> : <><CopyIcon /> Copy</>}
                    </button>
                  ) : (
                    <Link href="/student/membership"
                      style={{ display: 'inline-flex', alignItems: 'center', padding: '7px 13px', borderRadius: 100, border: '1px solid rgba(124,107,209,0.25)', background: 'rgba(124,107,209,0.08)', color: '#7C6BD1', fontSize: 11, fontWeight: 700, textDecoration: 'none', flexShrink: 0, whiteSpace: 'nowrap' }}>
                      Upgrade
                    </Link>
                  )}
                </div>
              );
            })}
          </div>

          {/* Earn more */}
          <div style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, borderColor: 'rgba(255,212,121,0.2)', background: 'rgba(255,212,121,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ color: '#E08A1E' }}><GiftIcon /></div>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 700, color: '#12241C' }}>Earn $15 per referral</p>
                <p style={{ margin: 0, fontSize: 12, color: '#7d9188' }}>Share your link — get credit for every friend who joins</p>
              </div>
            </div>
            <Link href="/student/referral"
              style={{ padding: '7px 14px', background: '#E08A1E', borderRadius: 100, color: '#3A2800', fontSize: 12, fontWeight: 700, textDecoration: 'none', flexShrink: 0 }}>
              Refer
            </Link>
          </div>
        </div>
      
    </StudentLayout>
  );
}

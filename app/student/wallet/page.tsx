'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { createClient } from '@/lib/supabase/client';

const PlusIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const MinusIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const GiftIcon  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>;
const CartIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>;
const ArrowIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;

const card: React.CSSProperties = {
  background: '#FFFFFF',
  border: '1px solid rgba(18,36,28,0.09)',
  borderRadius: 14,
};

interface Txn { id: string; type: 'earn'|'spend'; label: string; amount: number; date: string; }

export default function WalletPage() {
  const [balance, setBalance] = useState<number|null>(null);
  const [txns, setTxns]       = useState<Txn[]>([]);
  const [refCount, setRefCount] = useState(0);
  const [ready, setReady]     = useState(false);

  useEffect(() => {
    (async () => {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { window.location.href = '/auth/login'; return; }

      // Wallet balance & referral count
      const { data: u } = await sb.from('users').select('wallet_balance,referral_count').eq('id', user.id).single();
      setBalance(u?.wallet_balance ?? 0);
      setRefCount(u?.referral_count ?? 0);

      const built: Txn[] = [];

      // Welcome bonus (fixed entry for all users)
      built.push({ id: 'welcome', type: 'earn', label: 'Welcome bonus', amount: 5, date: new Date().toISOString() });

      // Referrals
      const { data: refs } = await sb.from('referrals')
        .select('id,created_at')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });
      (refs || []).forEach(r => {
        built.push({ id: `ref-${r.id}`, type: 'earn', label: 'Referral reward', amount: 15, date: r.created_at });
      });

      // Completed bookings (as spend events showing value used)
      const { data: bks } = await sb.from('bookings')
        .select('id,created_at,total_price,listing_type')
        .eq('student_id', user.id)
        .in('status', ['completed', 'delivered'])
        .order('created_at', { ascending: false })
        .limit(15);
      (bks || []).forEach(b => {
        if ((b.total_price || 0) > 0) {
          built.push({
            id: `bk-${b.id}`,
            type: 'spend',
            label: `${b.listing_type === 'tiffin' ? 'Food' : 'Service'} booking`,
            amount: b.total_price,
            date: b.created_at,
          });
        }
      });

      // Sort newest first
      built.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTxns(built);
      setReady(true);
    })();
  }, []);

  const earned = txns.filter(t => t.type === 'earn').reduce((s, t) => s + t.amount, 0);
  const spent  = txns.filter(t => t.type === 'spend').reduce((s, t) => s + t.amount, 0);

  return (
    <StudentLayout title="Wallet">
        <div style={{ maxWidth: 520, margin: '0 auto', padding: '32px 0 80px' }}>

          {/* Balance hero */}
          <div style={{ ...card, padding: '28px 24px', marginBottom: 14, background: 'linear-gradient(135deg,rgba(18,161,80,0.10) 0%,rgba(18,18,18,0.85) 100%)', borderColor: 'rgba(18,161,80,0.2)' }}>
            <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: '#7d9188', textTransform: 'uppercase', letterSpacing: '.08em' }}>Available Balance</p>
            <p style={{ margin: '0 0 20px', fontSize: 46, fontWeight: 800, color: '#12A150', fontFamily: "'Bricolage Grotesque',sans-serif", letterSpacing: -2, lineHeight: 1 }}>
              {balance === null ? '—' : `$${balance.toFixed(2)}`}
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <Link href="/student/cart" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#12A150', borderRadius: 100, color: '#ffffff', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                <CartIcon /> Use at checkout
              </Link>
              <Link href="/student/referral" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: '1px solid rgba(18,161,80,0.3)', borderRadius: 100, color: '#12A150', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                <GiftIcon /> Earn more
              </Link>
            </div>
          </div>

          {/* Quick stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 24 }}>
            {[
              { label: 'Earned', value: `$${earned}`, color: '#12A150' },
              { label: 'Spent',  value: `$${spent}`,  color: '#C25B4E' },
              { label: 'Referrals', value: refCount,  color: '#E08A1E' },
            ].map((s, i) => (
              <div key={i} style={{ ...card, padding: '14px 16px', textAlign: 'center' }}>
                <p style={{ margin: '0 0 2px', fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</p>
                <p style={{ margin: 0, fontSize: 11, color: '#7d9188' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Earn more */}
          <div style={{ ...card, padding: '16px 18px', marginBottom: 22, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderColor: 'rgba(255,212,121,0.2)', background: 'rgba(255,212,121,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ color: '#E08A1E' }}><GiftIcon /></div>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 700, color: '#12241C' }}>Earn $15 per referral</p>
                <p style={{ margin: 0, fontSize: 12, color: '#7d9188' }}>Invite a friend, get credit when they join</p>
              </div>
            </div>
            <Link href="/student/referral" style={{ padding: '7px 14px', background: '#E08A1E', borderRadius: 100, color: '#3A2800', fontSize: 12, fontWeight: 700, textDecoration: 'none', flexShrink: 0 }}>
              Refer
            </Link>
          </div>

          {/* Transaction history */}
          <p style={{ fontSize: 12, fontWeight: 700, color: '#7d9188', textTransform: 'uppercase', letterSpacing: '.06em', margin: '0 0 12px' }}>Transaction History</p>

          {!ready ? (
            <div style={{ ...card, padding: 32, textAlign: 'center' }}>
              <p style={{ color: '#7d9188', fontSize: 13, margin: 0 }}>Loading…</p>
            </div>
          ) : txns.length === 0 ? (
            <div style={{ ...card, padding: '36px 24px', textAlign: 'center' }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#12241C', margin: '0 0 6px' }}>No transactions yet</p>
              <p style={{ fontSize: 13, color: '#7d9188', margin: '0 0 18px' }}>Complete an order or refer a friend to see activity here.</p>
              <Link href="/student/referral" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '8px 18px', background: '#12A150', borderRadius: 100, color: '#ffffff', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                Get started <ArrowIcon />
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {txns.map(t => (
                <div key={t.id} style={{ ...card, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: t.type === 'earn' ? 'rgba(18,161,80,0.12)' : 'rgba(194,91,78,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.type === 'earn' ? '#12A150' : '#C25B4E', flexShrink: 0 }}>
                    {t.type === 'earn' ? <PlusIcon /> : <MinusIcon />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, color: '#12241C', fontWeight: 500 }}>{t.label}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: '#7d9188' }}>
                      {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: t.type === 'earn' ? '#12A150' : '#C25B4E', flexShrink: 0 }}>
                    {t.type === 'earn' ? '+' : '−'}${t.amount}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      
    </StudentLayout>
  );
}

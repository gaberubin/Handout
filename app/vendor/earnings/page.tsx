'use client';
import { useEffect, useState } from 'react';
import { VendorShell } from '@/components/layout/VendorShell';
import { createClient } from '@/lib/supabase/client';

function Card({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid rgba(18,36,28,0.09)', borderRadius: 16, padding: 22 }}>
      <div style={{ fontSize: 12, color: '#7d9188', fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 34, fontWeight: 800, color: '#12241C', marginTop: 8 }}>{value}</div>
      <div style={{ fontSize: 12, color: '#7d9188', marginTop: 4 }}>{sub}</div>
    </div>
  );
}

const money = (n: number) => `$${(Math.round(n * 100) / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
const EARNED = ['confirmed', 'accepted', 'completed', 'delivered'];   // counts toward earnings
const CLEARED = ['completed', 'delivered'];                           // paid out

export default function VendorEarnings() {
  const [ready, setReady] = useState(false);
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return;
      const { data } = await sb.from('bookings').select('total_price, status, created_at').eq('provider_id', user.id);
      setRows(data || []);
      setReady(true);
    })();
  }, []);

  const now = new Date();
  const earned = rows.filter(r => EARNED.includes((r.status || '').toLowerCase()));
  const thisMonth = earned.filter(r => { const d = new Date(r.created_at); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
  const sum = (list: any[]) => list.reduce((s, r) => s + Number(r.total_price || 0), 0);
  const pending = earned.filter(r => !CLEARED.includes((r.status || '').toLowerCase()));

  return (
    <VendorShell active="Earnings" title="Earnings">
      {() => (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 14, marginBottom: 24 }}>
            <Card label="This month" value={ready ? money(sum(thisMonth)) : '—'} sub={`${thisMonth.length} order${thisMonth.length !== 1 ? 's' : ''}`} />
            <Card label="Pending payout" value={ready ? money(sum(pending)) : '—'} sub="Clears after completion" />
            <Card label="All-time" value={ready ? money(sum(earned)) : '—'} sub={`${earned.length} paid order${earned.length !== 1 ? 's' : ''}`} />
          </div>
          <div style={{ background: '#FFFFFF', border: '1px solid rgba(18,36,28,0.09)', borderRadius: 16, padding: 28 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#12241C', marginBottom: 8 }}>Payouts</h2>
            <p style={{ fontSize: 14, color: '#7d9188', lineHeight: 1.6, margin: 0 }}>
              Totals above are calculated from your real bookings — an order counts once you accept it and clears to payout when it&apos;s completed. Automated Stripe payouts turn on once business banking is connected; until then, settle directly with students.
            </p>
          </div>
        </>
      )}
    </VendorShell>
  );
}

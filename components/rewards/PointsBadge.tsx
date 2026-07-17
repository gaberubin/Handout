'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { touchDailyLogin } from '@/lib/points';

// Small header pill: total points + login streak. Links to the Rewards page.
// Renders nothing until it has real data, so it stays invisible if the points
// migration (db/feature-1-points.sql) hasn't been run yet — never breaks a page.

const StarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="#12A150" stroke="none" aria-hidden="true">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const FlameIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="#E08A1E" stroke="none" aria-hidden="true">
    <path d="M12 2c1 3-1.5 4.5-3 6.5C7.5 10.5 6 12.4 6 15a6 6 0 0 0 12 0c0-2.2-1-3.9-2.3-5.4-.6 1-1.4 1.6-2.4 1.7.8-2 .3-4.6-1.3-6.3-.5-.5-1.3-1.5-0-3z" />
  </svg>
);

export function PointsBadge() {
  const [points, setPoints] = useState<number | null>(null);
  const [streak, setStreak] = useState<number>(0);

  useEffect(() => {
    (async () => {
      // Daily check-in first (awards login points + updates streak, returns totals)
      const fresh = await touchDailyLogin();
      if (fresh) { setPoints(fresh.points); setStreak(fresh.streak); return; }

      // Fallback: just read current totals (in case the RPC isn't available)
      try {
        const sb = createClient();
        const { data: { user } } = await sb.auth.getUser();
        if (!user) return;
        const { data, error } = await sb.from('users').select('points, streak').eq('id', user.id).maybeSingle();
        if (error || !data) return;
        setPoints((data as any).points ?? 0);
        setStreak((data as any).streak ?? 0);
      } catch { /* columns not migrated yet — stay hidden */ }
    })();
  }, []);

  if (points === null) return null;

  return (
    <Link
      href="/student/rewards"
      title="Your rewards"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8, height: 34, padding: '0 12px',
        borderRadius: 100, background: '#fff', border: '1px solid rgba(18,36,28,0.09)',
        textDecoration: 'none', boxShadow: '0 1px 2px rgba(18,36,28,0.04)', flexShrink: 0,
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        <StarIcon />
        <span className="ft-num" style={{ fontSize: 14, color: '#12241C' }}>{points}</span>
        <span style={{ fontSize: 11, color: '#7D9188', fontWeight: 600 }}>pts</span>
      </span>
      {streak > 0 && (
        <>
          <span style={{ width: 1, height: 16, background: 'rgba(18,36,28,0.10)' }} />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }} title={`${streak}-day streak`}>
            <FlameIcon />
            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#E08A1E' }}>{streak}</span>
          </span>
        </>
      )}
    </Link>
  );
}

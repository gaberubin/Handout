'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

function useCountUp(target: number, decimals = 0, ms = 1200) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!target) { setN(0); return; }
    let raf = 0; const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - start) / ms, 1);
      setN(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return decimals ? n.toFixed(decimals) : Math.round(n).toLocaleString();
}

function Stat({ value, suffix, label, decimals }: { value: number; suffix: string; label: string; decimals?: number }) {
  const display = useCountUp(value, decimals);
  return (
    <div>
      <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 'clamp(40px,5vw,64px)', fontWeight: 800, letterSpacing: -2, color: 'var(--amber)', lineHeight: 1 }}>{display}{suffix}</div>
      <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 8, fontWeight: 500 }}>{label}</div>
    </div>
  );
}

// Real counts only — everything starts at zero and grows as Handout grows.
export function LiveStats() {
  const [s, setS] = useState({ students: 0, providers: 0, bookings: 0, avgRating: 0 });
  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const { count: students } = await supabase.from('public_profiles').select('*', { count: 'exact', head: true }).eq('role', 'student');
        const { count: providers } = await supabase.from('public_profiles').select('*', { count: 'exact', head: true }).eq('role', 'provider');
        const { count: bookings } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'completed');
        const { data: reviews } = await supabase.from('reviews').select('rating');
        const avg = reviews && reviews.length ? reviews.reduce((a, r) => a + (r.rating || 0), 0) / reviews.length : 0;
        setS({ students: students || 0, providers: providers || 0, bookings: bookings || 0, avgRating: avg });
      } catch { /* DB not configured — stays at zero */ }
    })();
  }, []);
  return (
    <div className="rg-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24, marginTop: 56, paddingTop: 48, borderTop: '1px solid var(--border)' }}>
      <Stat value={s.students} suffix="+" label="Students on Handout" />
      <Stat value={s.providers} suffix="+" label="Verified vendors & hosts" />
      <Stat value={s.bookings} suffix="+" label="Bookings completed" />
      <Stat value={s.avgRating} suffix={s.avgRating ? '★' : ''} label="Average rating" decimals={1} />
    </div>
  );
}

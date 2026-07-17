'use client';
import { useEffect, useRef, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

export function PageTransition({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.16,1,0.3,1)';
    const t = setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 30);
    return () => clearTimeout(t);
  }, [pathname]);

  return <div ref={ref}>{children}</div>;
}

// Marquee component
export function Marquee({
  items,
  speed = 22,
  separator = '✦',
}: {
  items: string[];
  speed?: number;
  separator?: string;
}) {
  const doubled = [...items, ...items];
  return (
    <div style={{
      overflow: 'hidden',
      borderTop: '1px solid var(--border)',
      borderBottom: '1px solid var(--border)',
      padding: '16px 0',
    }}>
      <div style={{
        display: 'flex',
        width: 'max-content',
        animation: `marquee ${speed}s linear infinite`,
      }}>
        {doubled.map((item, i) => (
          <span key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            padding: '0 32px',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 2.5,
            textTransform: 'uppercase',
            color: 'var(--muted)',
            whiteSpace: 'nowrap',
          }}>
            <span style={{ color: 'var(--amber)' }}>{separator}</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

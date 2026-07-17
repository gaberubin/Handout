'use client';
import { useEffect, useRef, ReactNode, CSSProperties } from 'react';

interface RevealTextProps {
  children: string;
  className?: string;
  delay?: number;        // base delay in ms
  wordDelay?: number;    // delay between each word in ms
  as?: 'h1'|'h2'|'h3'|'h4'|'p'|'span'|'div';
  once?: boolean;
  threshold?: number;
  style?: CSSProperties; // accepted for callers that pass inline styles
}

export function RevealText({
  children,
  className = '',
  delay = 0,
  wordDelay = 60,
  as: Tag = 'div',
  once = true,
  threshold = 0.15,
}: RevealTextProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const words = el.querySelectorAll<HTMLElement>('.rv-word-inner');

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          words.forEach((w, i) => {
            setTimeout(() => {
              w.style.transform = 'translateY(0)';
              w.style.opacity = '1';
            }, delay + i * wordDelay);
          });
          if (once) obs.disconnect();
        } else if (!once) {
          words.forEach(w => {
            w.style.transform = 'translateY(115%)';
            w.style.opacity = '0';
          });
        }
      },
      { threshold }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [delay, wordDelay, once, threshold]);

  const parts = children.split(/(\s+)/);

  const content = parts.map((part, i) => {
    if (part.trim() === '') return <span key={i}>&nbsp;</span>;
    return (
      <span
        key={i}
        className="rv-word-wrap"
        style={{
          display: 'inline-block',
          overflow: 'hidden',
          verticalAlign: 'bottom',
          marginRight: '0.06em',
        }}
      >
        <span
          className="rv-word-inner"
          style={{
            display: 'inline-block',
            transform: 'translateY(115%)',
            opacity: 0,
            transition: `transform 0.9s cubic-bezier(0.16,1,0.3,1), opacity 0.6s ease`,
          }}
        >
          {part}
        </span>
      </span>
    );
  });

  return (
    <Tag ref={ref as any} className={className}>
      {content}
    </Tag>
  );
}

// Reveal a single line (no word split)
export function RevealLine({
  children,
  delay = 0,
  className = '',
  as: Tag = 'div',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: 'h1'|'h2'|'h3'|'h4'|'p'|'span'|'div';
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const inner = el.querySelector<HTMLElement>('.rl-inner');
    if (!inner) return;

    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          inner.style.transform = 'translateY(0)';
          inner.style.opacity = '1';
        }, delay);
        obs.disconnect();
      }
    }, { threshold: 0.1 });

    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);

  return (
    <Tag
      ref={ref as any}
      className={className}
      style={{ display: 'block', overflow: 'hidden' }}
    >
      <span
        className="rl-inner"
        style={{
          display: 'block',
          transform: 'translateY(110%)',
          opacity: 0,
          transition: `transform 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}ms, opacity 0.7s ease ${delay}ms`,
        }}
      >
        {children}
      </span>
    </Tag>
  );
}

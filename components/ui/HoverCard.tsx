'use client';
import { CSSProperties, ReactNode, useState } from 'react';

interface HoverCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  hoverBorderColor?: string;
  hoverBg?: string;
  lift?: boolean;
  href?: string;
}

export function HoverCard({
  children, className = '', style = {},
  hoverBorderColor = 'rgba(18,161,80,0.35)',
  hoverBg,
  lift = true,
  href,
}: HoverCardProps) {
  const [hovered, setHovered] = useState(false);

  const computedStyle: CSSProperties = {
    ...style,
    transition: 'border-color 0.2s, transform 0.2s, background 0.2s, box-shadow 0.2s',
    ...(hovered ? {
      borderColor: hoverBorderColor,
      transform: lift ? 'translateY(-3px)' : undefined,
      background: hoverBg ?? style.background,
      boxShadow: lift ? '0 8px 24px rgba(0,0,0,0.2)' : undefined,
    } : {}),
  };

  if (href) {
    return (
      <a href={href} className={className} style={computedStyle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}>
        {children}
      </a>
    );
  }

  return (
    <div className={className} style={computedStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      {children}
    </div>
  );
}

// Hover link button (for nav-style items)
export function HoverLink({
  children, href, style = {}, className = '',
  activeColor = 'var(--amber)',
}: {
  children: ReactNode;
  href: string;
  style?: CSSProperties;
  className?: string;
  activeColor?: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <a href={href} className={className}
      style={{
        ...style,
        transition: 'color 0.15s, border-color 0.15s, background 0.15s',
        ...(hovered ? { color: activeColor } : {}),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      {children}
    </a>
  );
}

// Stat card with hover
export function StatCard({
  icon, iconBg, label, value,
}: {
  icon: string; iconBg: string; label: string; value: ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--navy2)',
        border: `1px solid ${hovered ? 'rgba(18,161,80,0.3)' : 'var(--border)'}`,
        borderRadius: 20,
        padding: 22,
        transform: hovered ? 'translateY(-2px)' : 'none',
        transition: 'border-color 0.2s, transform 0.2s',
      }}>
      <div style={{ width: 40, height: 40, borderRadius: 11, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 14 }}>{icon}</div>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 30, fontWeight: 800, color: 'var(--white)', letterSpacing: -1, lineHeight: 1 }}>{value}</div>
    </div>
  );
}

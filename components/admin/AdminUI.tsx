'use client';

import { ReactNode } from 'react';

/* ─── PALETTE ─────────────────────────────────────────────────────────────── */
export const A = {
  bg:      '#F1F7F3',
  surface: '#FFFFFF',
  card:    '#FFFFFF',
  border:  'rgba(18,36,28,0.09)',
  text:    '#12241C',
  muted:   '#7d9188',
  light:   '#4c6157',
  red:     '#C25B4E',
  cyan:    '#12A150',
  green:   '#12A150',
  amber:   '#12A150',
  rose:    '#C25B4E',
};

/* ─── STATUS ───────────────────────────────────────────────────────────────── */
export function statusColor(s: string) {
  if (!s) return A.muted;
  const l = s.toLowerCase();
  if (l === 'pending')                 return A.amber;
  if (l === 'confirmed' || l === 'active' || l === 'approved') return A.cyan;
  if (l === 'completed')               return A.green;
  if (l === 'cancelled' || l === 'rejected') return A.rose;
  return A.light;
}

/* ─── BADGE ────────────────────────────────────────────────────────────────── */
export function AdminBadge({ status, label }: { status: string; label?: string }) {
  const c = statusColor(status);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700,
      textTransform: 'capitalize', letterSpacing: 0.3,
      color: c, background: `${c}18`, border: `1px solid ${c}30`,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: c, flexShrink: 0 }} />
      {label ?? status}
    </span>
  );
}

/* ─── ROLE BADGE ───────────────────────────────────────────────────────────── */
export function RoleBadge({ role }: { role: string }) {
  const c = role === 'admin' ? A.rose : role === 'vendor' ? A.amber : A.cyan;
  return (
    <span style={{ padding: '2px 9px', borderRadius: 6, fontSize: 11, fontWeight: 700, textTransform: 'capitalize', color: c, background: `${c}15`, border: `1px solid ${c}28` }}>
      {role}
    </span>
  );
}

/* ─── STAT CARD ────────────────────────────────────────────────────────────── */
export function AdminStat({ label, value, icon, accent, ready }: {
  label: string; value: string | number; icon?: ReactNode;
  accent?: string; ready?: boolean;
}) {
  const ac = accent ?? A.cyan;
  return (
    <div style={{
      background: A.card, border: `1px solid ${A.border}`, borderRadius: 16,
      padding: '20px 22px', position: 'relative', overflow: 'hidden',
      transition: 'border-color 0.2s, transform 0.2s',
    }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = `${ac}30`; el.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = A.border; el.style.transform = ''; }}
    >
      {/* accent top bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${ac}, transparent)`, borderRadius: '16px 16px 0 0' }} />
      <div style={{ width: 38, height: 38, borderRadius: 11, background: `${ac}15`, border: `1px solid ${ac}28`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, color: ac }}>
        {icon}
      </div>
      <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 28, fontWeight: 800, color: A.text, letterSpacing: -1, lineHeight: 1 }}>
        {ready === false ? <span style={{ color: A.muted, fontSize: 20 }}>—</span> : value}
      </div>
      <div style={{ fontSize: 12, color: A.muted, marginTop: 5, fontWeight: 500 }}>{label}</div>
    </div>
  );
}

/* ─── CARD ─────────────────────────────────────────────────────────────────── */
export function AdminCard({ children, padding = 0, style }: { children: ReactNode; padding?: number; style?: React.CSSProperties }) {
  return (
    <div style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 16, overflow: 'hidden', padding, ...style }}>
      {children}
    </div>
  );
}

/* ─── CARD HEADER ──────────────────────────────────────────────────────────── */
export function AdminCardHead({ title, right }: { title: ReactNode; right?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${A.border}` }}>
      <span style={{ fontSize: 14, fontWeight: 700, color: A.text, letterSpacing: -0.2 }}>{title}</span>
      {right && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{right}</div>}
    </div>
  );
}

/* ─── TABLE ────────────────────────────────────────────────────────────────── */
export function AdminTable({ children }: { children: ReactNode }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>{children}</table>
    </div>
  );
}
export function AdminTh({ children, right }: { children: ReactNode; right?: boolean }) {
  return (
    <th style={{ textAlign: right ? 'right' : 'left', padding: '10px 20px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: A.muted, borderBottom: `1px solid ${A.border}`, whiteSpace: 'nowrap' }}>
      {children}
    </th>
  );
}
export function AdminTd({ children, right, muted }: { children: ReactNode; right?: boolean; muted?: boolean }) {
  return (
    <td style={{ textAlign: right ? 'right' : 'left', padding: '13px 20px', fontSize: 13, color: muted ? A.muted : A.text, borderBottom: `1px solid rgba(18,36,28,0.04)`, verticalAlign: 'middle' }}>
      {children}
    </td>
  );
}
export function AdminTr({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <tr onClick={onClick} style={{ transition: 'background 0.15s', cursor: onClick ? 'pointer' : undefined }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.025)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}>
      {children}
    </tr>
  );
}

/* ─── AVATAR ───────────────────────────────────────────────────────────────── */
export function AdminAvatar({ name, email, size = 36, color = A.cyan }: { name?: string; email?: string; size?: number; color?: string }) {
  const initials = (name || email || '?').slice(0, 2).toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `${color}22`, border: `1px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.33, color, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

/* ─── EMPTY STATE ──────────────────────────────────────────────────────────── */
const AdminEmptyDefaultIcon = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>;
export function AdminEmpty({ icon, title, desc }: { icon?: ReactNode; title: string; desc?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '56px 24px', gap: 10 }}>
      <div style={{ display: 'inline-flex', opacity: 0.5, color: A.muted }}>{icon ?? <AdminEmptyDefaultIcon />}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: A.light }}>{title}</div>
      {desc && <div style={{ fontSize: 13, color: A.muted, textAlign: 'center', maxWidth: 280, lineHeight: 1.6 }}>{desc}</div>}
    </div>
  );
}

/* ─── LOADING ──────────────────────────────────────────────────────────────── */
export function AdminLoading() {
  return (
    <div style={{ padding: '40px 20px', color: A.muted, fontSize: 13, textAlign: 'center' }}>
      Loading…
    </div>
  );
}

/* ─── TAB BAR ──────────────────────────────────────────────────────────────── */
export function AdminTabBar({ tabs, active, onChange }: {
  tabs: { key: string; label: string }[];
  active: string;
  onChange: (k: string) => void;
}) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
      {tabs.map(t => (
        <button key={t.key} onClick={() => onChange(t.key)}
          style={{
            padding: '7px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            fontFamily: "'Bricolage Grotesque', sans-serif", transition: 'all 0.15s',
            background: active === t.key ? A.red : 'rgba(18,36,28,0.04)',
            color: active === t.key ? '#fff' : A.light,
            border: active === t.key ? 'none' : `1px solid ${A.border}`,
          }}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

/* ─── SEARCH + FILTER BAR ──────────────────────────────────────────────────── */
export function AdminSearchBar({ value, onChange, placeholder, right }: {
  value: string; onChange: (v: string) => void; placeholder?: string; right?: ReactNode;
}) {
  return (
    <div style={{ display: 'flex', gap: 10, padding: '14px 20px', borderBottom: `1px solid ${A.border}`, flexWrap: 'wrap', alignItems: 'center' }}>
      <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', display: 'inline-flex', color: A.muted, pointerEvents: 'none' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder ?? 'Search…'}
          style={{ width: '100%', height: 36, paddingLeft: 32, paddingRight: 12, background: 'rgba(18,36,28,0.04)', border: `1px solid ${A.border}`, borderRadius: 9, color: A.text, fontSize: 13, fontFamily: "'Bricolage Grotesque', sans-serif", outline: 'none', transition: 'border-color 0.2s' }}
          onFocus={e => (e.target as HTMLInputElement).style.borderColor = A.red}
          onBlur={e => (e.target as HTMLInputElement).style.borderColor = A.border}
        />
      </div>
      {right}
    </div>
  );
}

/* ─── ACTION BUTTON ────────────────────────────────────────────────────────── */
export function AdminBtn({ onClick, variant = 'ghost', disabled, children }: {
  onClick?: () => void; variant?: 'primary' | 'danger' | 'ghost' | 'outline';
  disabled?: boolean; children: ReactNode;
}) {
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: A.cyan, color: '#04080F', border: 'none' },
    danger:  { background: 'transparent', color: A.rose, border: `1px solid ${A.rose}40` },
    ghost:   { background: 'rgba(18,36,28,0.06)', color: A.light, border: `1px solid ${A.border}` },
    outline: { background: 'transparent', color: A.light, border: `1px solid ${A.border}` },
  };
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ ...styles[variant], padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, fontFamily: "'Bricolage Grotesque', sans-serif", transition: 'opacity 0.15s, transform 0.15s', whiteSpace: 'nowrap' }}
      onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLElement).style.opacity = '0.82'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
    >
      {children}
    </button>
  );
}

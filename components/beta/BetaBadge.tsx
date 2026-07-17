import { APP_VERSION } from '@/config/features';

// Subtle Beta version badge used on the landing, dashboard, sidebar footer,
// settings, and topbar. Plain component (no hooks) — safe anywhere.
export function BetaBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: compact ? 6 : 7,
        background: 'rgba(18,161,80,0.10)', border: '1px solid rgba(18,161,80,0.25)',
        borderRadius: 100, padding: compact ? '5px 11px' : '6px 13px',
        fontSize: compact ? 12 : 12.5, fontWeight: 700, color: '#0F8A44', whiteSpace: 'nowrap',
      }}
    >
      <span style={{ width: compact ? 7 : 8, height: compact ? 7 : 8, borderRadius: '50%', background: '#12A150', display: 'inline-block', flexShrink: 0 }} />
      {compact ? `Handout Beta · v${APP_VERSION}` : `Beta · Version ${APP_VERSION}`}
    </span>
  );
}

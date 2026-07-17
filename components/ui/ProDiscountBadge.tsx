'use client';

/**
 * Shows:  ~~$25~~  $22.50  · 10% Pro discount
 * Pass originalPrice (number) + discounted (number) + pct (0.10 etc)
 */
interface Props {
  original: number;
  discounted: number;
  pct: number;
  suffix?: string; // e.g. '/hr' '/trip'
  size?: 'sm' | 'md';
}

export function ProDiscountBadge({ original, discounted, pct, suffix = '', size = 'md' }: Props) {
  const saved = (original - discounted).toFixed(2);
  const pctLabel = Math.round(pct * 100);
  const fmtOrig = `$${original % 1 === 0 ? original : original.toFixed(2)}${suffix}`;
  const fmtDisc = `$${discounted % 1 === 0 ? discounted : discounted.toFixed(2)}${suffix}`;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: size === 'sm' ? 6 : 8, flexWrap: 'wrap' }}>
      {/* Struck-through original */}
      <span style={{
        fontSize: size === 'sm' ? 12 : 14,
        color: 'rgba(255,255,255,0.3)',
        textDecoration: 'line-through',
      }}>{fmtOrig}</span>

      {/* Discounted price */}
      <span style={{
        fontSize: size === 'sm' ? 15 : 20,
        fontWeight: 800,
        color: 'var(--green, #12A150)',
      }}>{fmtDisc}</span>

      {/* Badge */}
      <span style={{
        fontSize: size === 'sm' ? 10 : 11,
        fontWeight: 700,
        background: 'rgba(124,107,209,0.15)',
        color: 'var(--purple, #7C6BD1)',
        border: '1px solid rgba(124,107,209,0.3)',
        padding: size === 'sm' ? '2px 7px' : '3px 9px',
        borderRadius: 100,
        whiteSpace: 'nowrap',
      }}>⭐ Pro -{pctLabel}% · saves ${saved}</span>
    </div>
  );
}

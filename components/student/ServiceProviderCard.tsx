import { Avatar } from '@/components/ui/Avatar';
import { type ServiceProvider } from '@/lib/data';

interface ServiceProviderCardProps {
  provider: ServiceProvider;
}

export function ServiceProviderCard({ provider }: ServiceProviderCardProps) {
  const { initials, color, name, role, rating, reviews, rate, tags, verified, badge } = provider;

  return (
    <div className="ft-card" style={{ padding: 18, display: 'flex', flexDirection: 'column' }}>
      {/* Top: avatar + name + badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 13 }}>
        <Avatar initials={initials} color={color} size="md" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#12241C', display: 'flex', alignItems: 'center', gap: 7 }}>
            {name}
            {verified && (
              <span className="ft-verified" aria-label="Verified">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: '#7d9188' }}>{role}</div>
        </div>
        {badge && (
          <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase', background: '#FDF0DC', color: '#B5761A', padding: '3px 8px', borderRadius: 100, whiteSpace: 'nowrap' }}>{badge}</span>
        )}
      </div>

      {/* Rating */}
      <div style={{ fontSize: 12, color: '#7d9188', marginBottom: 12 }}>
        ⭐ {rating} · {reviews} reviews
      </div>

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {tags.map((tag) => <span key={tag} className="ft-tag">{tag}</span>)}
      </div>

      {/* Footer: rate + book */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 14 }}>
        <span className="ft-num" style={{ fontSize: 16, color: '#12A150' }}>{rate}</span>
        <button className="ft-btn ft-btn-p" style={{ padding: '8px 14px', fontSize: 12 }}>Book now</button>
      </div>
    </div>
  );
}

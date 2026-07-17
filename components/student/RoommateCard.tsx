import { Avatar } from '@/components/ui/Avatar';
import { type Roommate } from '@/lib/data';

interface RoommateCardProps {
  roommate: Roommate;
  compact?: boolean;
}

export function RoommateCard({ roommate, compact = false }: RoommateCardProps) {
  const { initials, color, name, university, major, compatibility, budget, moveIn, location, tags } = roommate;

  if (compact) {
    return (
      <div className="ft-card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar initials={initials} color={color} size="sm" />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#12241C' }}>{name}</div>
            <div style={{ fontSize: 12, color: '#7d9188' }}>{university} · {major.split(' ')[0]}</div>
          </div>
          <div className="ft-num" style={{ marginLeft: 'auto', fontSize: 14, color: '#12A150' }}>{compatibility}%</div>
        </div>
        <div className="ft-bar"><div className="ft-bar-fill" style={{ width: `${compatibility}%` }} /></div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {tags.slice(0, 2).map((tag) => <span key={tag} className="ft-tag">{tag}</span>)}
        </div>
        <button className="ft-btn ft-btn-p" style={{ width: '100%' }}>Connect</button>
      </div>
    );
  }

  return (
    <div className="ft-card" style={{ padding: 18, display: 'flex', flexDirection: 'column' }}>
      {/* Top: avatar + name + compatibility % */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 14 }}>
        <Avatar initials={initials} color={color} size="md" />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#12241C' }}>{name}</div>
          <div style={{ fontSize: 12, color: '#7d9188', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{university} · {major}</div>
        </div>
        <div className="ft-num" style={{ marginLeft: 'auto', fontSize: 15, color: '#12A150' }}>{compatibility}%</div>
      </div>

      {/* Compatibility bar */}
      <div className="ft-bar" style={{ marginBottom: 14 }}>
        <div className="ft-bar-fill" style={{ width: `${compatibility}%` }} />
      </div>

      {/* Meta rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5, color: '#4c6157', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span aria-hidden="true">💰</span>{budget}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span aria-hidden="true">📅</span>Move-in: {moveIn}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span aria-hidden="true">📍</span>{location}</div>
      </div>

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 15 }}>
        {tags.map((tag) => <span key={tag} className="ft-tag">{tag}</span>)}
      </div>

      {/* Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginTop: 'auto' }}>
        <button className="ft-btn ft-btn-o">View profile</button>
        <button className="ft-btn ft-btn-p">Connect</button>
      </div>
    </div>
  );
}

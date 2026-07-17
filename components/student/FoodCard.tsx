import { type FoodProvider } from '@/lib/data';

interface FoodCardProps {
  provider: FoodProvider;
}

export function FoodCard({ provider }: FoodCardProps) {
  const { name, emoji, bgColor, rating, reviews, cuisine, diet, distance, tags, pricePerMeal, pricePerMonth, verified } = provider;

  return (
    <div className="ft-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Emoji banner */}
      <div style={{ height: 96, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 42, backgroundColor: bgColor }} aria-hidden="true">
        {emoji}
      </div>

      {/* Body */}
      <div style={{ padding: '15px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#12241C' }}>{name}</div>
          {verified && (
            <span className="ft-verified">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              Verified
            </span>
          )}
        </div>

        <div style={{ fontSize: 12, color: '#7d9188', marginBottom: 11 }}>
          ⭐ {rating} ({reviews}) · {cuisine} · {diet} · {distance}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {tags.map((tag) => <span key={tag} className="ft-tag">{tag}</span>)}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 12 }}>
          <div>
            <span className="ft-num" style={{ fontSize: 18, color: '#12241C' }}>${pricePerMeal}</span>
            <span style={{ fontSize: 11, color: '#7d9188', fontWeight: 500 }}> / meal · ${pricePerMonth}/mo</span>
          </div>
          <button className="ft-btn ft-btn-p" style={{ padding: '8px 14px', fontSize: 12 }}>Subscribe</button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';

type Item = { url: string; type?: string };

export function MediaGallery({ media, height = 200 }: { media: any[]; height?: number }) {
  const items: Item[] = Array.isArray(media) ? media : [];
  const [i, setI] = useState(0);
  if (items.length === 0) return null;

  const cur = items[Math.min(i, items.length - 1)];
  const isVideo = (cur.type || '').startsWith('video') || /\.(mp4|webm|mov)$/i.test(cur.url || '');

  const go = (d: number) => setI((p) => (p + d + items.length) % items.length);

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: 12, overflow: 'hidden', background: '#0A0A0A', marginBottom: 12 }}>
      {isVideo ? (
        <video src={cur.url} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <img src={cur.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      )}

      {items.length > 1 && (
        <>
          <button type="button" onClick={() => go(-1)} aria-label="Previous"
            style={navBtn('left')}>‹</button>
          <button type="button" onClick={() => go(1)} aria-label="Next"
            style={navBtn('right')}>›</button>
          <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6 }}>
            {items.map((_, k) => (
              <span key={k} onClick={() => setI(k)} style={{ width: k === i ? 18 : 6, height: 6, borderRadius: 4, background: k === i ? '#12A150' : 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'width .2s' }} />
            ))}
          </div>
          <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100 }}>{i + 1}/{items.length}</div>
        </>
      )}
    </div>
  );
}

function navBtn(side: 'left' | 'right'): React.CSSProperties {
  return {
    position: 'absolute', top: '50%', [side]: 8, transform: 'translateY(-50%)',
    width: 30, height: 30, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', color: '#fff',
    border: 'none', fontSize: 18, lineHeight: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  };
}

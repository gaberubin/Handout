'use client';

import { useState, useRef, useEffect } from 'react';
import { COUNTRIES } from '@/lib/countries';

export function flagUrl(code: string): string | null {
  return code === 'XX' ? null : `https://flagcdn.com/w20/${code.toLowerCase()}.png`;
}

export function CountrySelect({ value, onChange, compact }: { value: string; onChange: (name: string) => void; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const sel = COUNTRIES.find(c => c.name === value) || COUNTRIES[0];

  useEffect(() => {
    function onDoc(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const list = COUNTRIES.filter(c => c.name.toLowerCase().includes(q.toLowerCase()) || c.dial.includes(q));

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button type="button" onClick={() => setOpen(o => !o)} title={sel.name}
        style={{ width: compact ? 'auto' : '100%', minWidth: compact ? 104 : undefined, height: 44, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(18,36,28,0.04)', border: '1px solid rgba(18,36,28,0.12)', borderRadius: 10, color: '#12241C', fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap' }}>
        {flagUrl(sel.code) && <img src={flagUrl(sel.code)!} alt="" width={20} height={14} style={{ borderRadius: 2 }} />}
        {!compact && <span style={{ flex: 1, textAlign: 'left' }}>{sel.name}</span>}
        <span style={{ color: compact ? '#12A150' : '#7d9188', fontWeight: compact ? 700 : 400, fontSize: 13 }}>{sel.dial}</span>
        <span style={{ color: '#7d9188' }}>▾</span>
      </button>

      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, width: compact ? 280 : '100%', zIndex: 60, background: '#FFFFFF', border: '1px solid rgba(18,36,28,0.12)', borderRadius: 10, maxHeight: 260, overflowY: 'auto', boxShadow: '0 12px 32px rgba(0,0,0,0.55)' }}>
          <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search country…"
            style={{ width: '100%', height: 38, padding: '0 12px', background: 'rgba(18,36,28,0.04)', border: 'none', borderBottom: '1px solid rgba(18,36,28,0.09)', color: '#12241C', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          {list.map(c => (
            <button key={c.code} type="button" onClick={() => { onChange(c.name); setOpen(false); setQ(''); }}
              style={{ width: '100%', padding: '9px 12px', display: 'flex', alignItems: 'center', gap: 8, background: c.name === value ? 'rgba(18,161,80,0.1)' : 'transparent', border: 'none', color: '#12241C', fontSize: 13, cursor: 'pointer', textAlign: 'left' }}>
              {flagUrl(c.code) && <img src={flagUrl(c.code)!} alt="" width={20} height={14} style={{ borderRadius: 2 }} />}
              <span style={{ flex: 1 }}>{c.name}</span>
              <span style={{ color: '#7d9188' }}>{c.dial}</span>
            </button>
          ))}
          {list.length === 0 && <div style={{ padding: 12, color: '#7d9188', fontSize: 13 }}>No match</div>}
        </div>
      )}
    </div>
  );
}

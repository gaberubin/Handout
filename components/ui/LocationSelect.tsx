'use client';
import { useState, useRef, useEffect, useCallback } from 'react';

const LOCAL = [
  // New Jersey (Rowan area first)
  'Glassboro, NJ', 'Pitman, NJ', 'Sewell, NJ', 'Williamstown, NJ', 'Sicklerville, NJ',
  'Deptford, NJ', 'Mullica Hill, NJ', 'Turnersville, NJ', 'Mantua, NJ', 'Woodbury, NJ',
  'Washington Township, NJ', 'Clayton, NJ', 'Franklinville, NJ', 'Mickleton, NJ',
  'Vineland, NJ', 'Camden, NJ', 'Cherry Hill, NJ', 'Voorhees, NJ', 'Marlton, NJ',
  'Mount Laurel, NJ', 'Trenton, NJ', 'Princeton, NJ', 'New Brunswick, NJ', 'Newark, NJ',
  'Jersey City, NJ', 'Hoboken, NJ', 'Edison, NJ', 'Atlantic City, NJ', 'Hamilton, NJ',
  'Piscataway, NJ', 'Montclair, NJ', 'Paterson, NJ', 'Elizabeth, NJ',
  // Pennsylvania
  'Philadelphia, PA', 'Pittsburgh, PA', 'Allentown, PA', 'Erie, PA', 'State College, PA',
  'Bethlehem, PA', 'King of Prussia, PA',
  // New York
  'New York, NY', 'Brooklyn, NY', 'Queens, NY', 'Buffalo, NY', 'Rochester, NY',
  'Albany, NY', 'Syracuse, NY', 'Yonkers, NY',
  // Other major US
  'Boston, MA', 'Cambridge, MA', 'Chicago, IL', 'Los Angeles, CA', 'San Francisco, CA',
  'San Jose, CA', 'San Diego, CA', 'Seattle, WA', 'Austin, TX', 'Houston, TX',
  'Dallas, TX', 'Atlanta, GA', 'Miami, FL', 'Orlando, FL', 'Tampa, FL',
  'Washington, DC', 'Baltimore, MD', 'Denver, CO', 'Phoenix, AZ', 'Las Vegas, NV',
  'Portland, OR', 'Detroit, MI', 'Columbus, OH', 'Cleveland, OH', 'Minneapolis, MN',
  'Nashville, TN', 'Charlotte, NC', 'Raleigh, NC', 'Indianapolis, IN', 'Kansas City, MO',
  'St. Louis, MO', 'Salt Lake City, UT', 'Sacramento, CA', 'San Antonio, TX',
];

interface Props {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  inputStyle?: React.CSSProperties;
}

export function LocationSelect({ value, onChange, disabled, placeholder = 'Type any city or area…', inputStyle }: Props) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [apiResults, setApiResults] = useState<string[]>([]);
  const [fetching, setFetching] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Local matches
  const localMatches = value.length < 2
    ? LOCAL.slice(0, 8)
    : LOCAL.filter(l => l.toLowerCase().includes(value.toLowerCase())).slice(0, 8);

  // Merge: local first, then API results not already in local
  const merged = value.length < 2
    ? localMatches
    : [...localMatches, ...apiResults.filter(r => !localMatches.some(l => l.toLowerCase() === r.toLowerCase()))].slice(0, 12);

  // Debounced Nominatim call
  const fetchFromAPI = useCallback((q: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (q.length < 3) { setApiResults([]); return; }
    timerRef.current = setTimeout(async () => {
      setFetching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6&countrycodes=us&addressdetails=1`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        const results: string[] = (data || []).map((item: any) => {
          const a = item.address || {};
          const city = a.city || a.town || a.village || a.county || '';
          const state = a.state || '';
          if (!city) return item.display_name?.split(',').slice(0, 2).join(',').trim() || '';
          return `${city}, ${state}`;
        }).filter(Boolean);
        const seen = new Set<string>();
        setApiResults(results.filter(r => { if (seen.has(r)) return false; seen.add(r); return true; }));
      } catch { /* network error — silent fallback to local */ }
      setFetching(false);
    }, 350);
  }, []);

  useEffect(() => {
    fetchFromAPI(value);
  }, [value, fetchFromAPI]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function selectItem(loc: string) { onChange(loc); setOpen(false); setHighlight(0); }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) { if (e.key === 'ArrowDown' || e.key === 'Enter') setOpen(true); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight(h => Math.min(h + 1, merged.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight(h => Math.max(h - 1, 0)); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (merged[highlight]) selectItem(merged[highlight]);
      else if (value.trim()) { selectItem(value.trim()); }
    }
    else if (e.key === 'Escape') setOpen(false);
  }

  const defaultInputStyle: React.CSSProperties = {
    width: '100%', height: 44, padding: '0 14px',
    background: 'rgba(18,36,28,0.04)', border: '1px solid rgba(18,36,28,0.12)',
    borderRadius: 10, color: '#12241C', fontSize: 14, boxSizing: 'border-box', outline: 'none',
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <input
        type="text"
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true); setHighlight(0); }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete="off"
        style={{ ...defaultInputStyle, ...inputStyle }}
      />

      {open && (merged.length > 0 || fetching) && (
        <div style={{ position: 'absolute', top: 'calc(100% + 5px)', left: 0, right: 0, background: '#fff', border: '1px solid rgba(18,36,28,0.12)', borderRadius: 12, boxShadow: '0 8px 28px rgba(18,36,28,0.18)', maxHeight: 260, overflowY: 'auto', zIndex: 300 }}>
          {merged.map((loc, i) => (
            <div key={loc} onMouseDown={e => { e.preventDefault(); selectItem(loc); }} onMouseEnter={() => setHighlight(i)}
              style={{ padding: '10px 14px', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, background: i === highlight ? 'rgba(18,161,80,0.08)' : 'transparent', color: i === highlight ? '#12A150' : '#12241C', borderBottom: i < merged.length - 1 ? '1px solid rgba(18,36,28,0.04)' : 'none', transition: 'background 0.1s' }}>
              <span style={{ opacity: 0.6, flexShrink: 0 }}>📍</span>
              <span>{loc}</span>
            </div>
          ))}
          {fetching && merged.length === 0 && (
            <div style={{ padding: '12px 14px', fontSize: 13, color: '#7d9188' }}>Searching…</div>
          )}
        </div>
      )}

      {open && value.length > 2 && merged.length === 0 && !fetching && (
        <div style={{ position: 'absolute', top: 'calc(100% + 5px)', left: 0, right: 0, background: '#fff', border: '1px solid rgba(18,36,28,0.12)', borderRadius: 12, padding: '12px 14px', zIndex: 300, fontSize: 13, color: '#4c6157' }}>
          Press Enter to use "<span style={{ color: '#12A150' }}>{value}</span>"
        </div>
      )}
    </div>
  );
}

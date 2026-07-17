'use client';

import { useEffect, useRef, useState } from 'react';

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

let scriptPromise: Promise<boolean> | null = null;
function loadGoogleMaps(): Promise<boolean> {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve) => {
    if (!KEY) { resolve(false); return; }
    if ((window as any).google?.maps?.places) { resolve(true); return; }
    const s = document.createElement('script');
    s.src = `https://maps.googleapis.com/maps/api/js?key=${KEY}&libraries=places`;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export type ParsedAddress = { street: string; city: string; state: string; zip: string; country: string };

export function AddressAutocomplete({ onSelect, onTextChange, style }: { onSelect: (a: ParsedAddress) => void; onTextChange?: (v: string) => void; style?: React.CSSProperties }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    loadGoogleMaps().then((ok) => {
      if (!ok || !inputRef.current) return;
      const g = (window as any).google;
      const ac = new g.maps.places.Autocomplete(inputRef.current, { types: ['address'], fields: ['address_components'] });
      setEnabled(true);
      ac.addListener('place_changed', () => {
        const comp = (ac.getPlace().address_components || []) as any[];
        const get = (type: string, long = true) => {
          const c = comp.find((x) => x.types.includes(type));
          return c ? (long ? c.long_name : c.short_name) : '';
        };
        onSelect({
          street: [get('street_number'), get('route')].filter(Boolean).join(' '),
          city: get('locality') || get('postal_town') || get('sublocality_level_1') || '',
          state: get('administrative_area_level_1'),
          zip: get('postal_code'),
          country: get('country'),
        });
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <input
      ref={inputRef}
      placeholder={enabled ? 'Start typing your address…' : 'Type your street address'}
      autoComplete="off"
      onChange={(e) => onTextChange?.(e.target.value)}
      style={style}
    />
  );
}

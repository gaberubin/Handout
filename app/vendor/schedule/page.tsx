'use client';

import { useEffect, useState } from 'react';
import { VendorShell } from '@/components/layout/VendorShell';
import { createClient } from '@/lib/supabase/client';

const ClockIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const SaveIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const CalIcon    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

const card: React.CSSProperties = { background: '#FFFFFF', border: '1px solid rgba(18,36,28,0.09)', borderRadius: 16, padding: 22 };

type Slot = { open: string; close: string; active: boolean };
type Schedule = Record<string, Slot>;

const DEFAULT: Schedule = Object.fromEntries(
  DAYS.map(d => [d, { open: '09:00', close: '21:00', active: !['Saturday','Sunday'].includes(d) }])
);

export default function VendorSchedulePage() {
  const [schedule, setSchedule] = useState<Schedule>(DEFAULT);
  const [bookings, setBookings]   = useState<any[]>([]);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [uid, setUid]             = useState('');

  useEffect(() => {
    (async () => {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return;
      setUid(user.id);

      const { data: profile } = await sb.from('provider_profiles').select('schedule').eq('user_id', user.id).maybeSingle();
      if (profile?.schedule) setSchedule({ ...DEFAULT, ...profile.schedule });

      // scheduled_time is a TIME column (not a timestamp), so filter/sort by created_at instead
      const { data: bk } = await sb.from('bookings').select('*').eq('provider_id', user.id)
        .in('status', ['pending', 'confirmed', 'accepted'])
        .order('created_at', { ascending: false }).limit(10);
      setBookings(bk || []);
    })();
  }, []);

  function toggle(day: string) {
    setSchedule(s => ({ ...s, [day]: { ...s[day], active: !s[day].active } }));
  }
  function setTime(day: string, field: 'open'|'close', val: string) {
    setSchedule(s => ({ ...s, [day]: { ...s[day], [field]: val } }));
  }

  async function save() {
    setSaving(true);
    const sb = createClient();
    await sb.from('provider_profiles').update({ schedule }).eq('user_id', uid);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <VendorShell active="Schedule" title="Schedule">
      {() => (
        <div style={{ maxWidth: 720 }}>
          <div className="rg-side" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 18, alignItems: 'start' }}>
            {/* Availability */}
            <div style={card}>
              <p style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#12241C', display: 'flex', alignItems: 'center', gap: 8 }}><ClockIcon /> Weekly Availability</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {DAYS.map(day => {
                  const s = schedule[day];
                  return (
                    <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {/* Toggle */}
                      <button onClick={() => toggle(day)}
                        style={{ width: 38, height: 22, borderRadius: 11, background: s.active ? '#12A150' : 'rgba(18,36,28,0.09)', border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background .2s' }}>
                        <span style={{ position: 'absolute', top: 3, left: s.active ? 18 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left .2s', display: 'block' }} />
                      </button>
                      <span style={{ fontSize: 13, fontWeight: 600, color: s.active ? '#12241C' : '#7d9188', width: 88, flexShrink: 0 }}>{day.slice(0,3)}</span>
                      {s.active ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                          <input type="time" value={s.open} onChange={e => setTime(day,'open',e.target.value)}
                            style={{ flex: 1, height: 34, padding: '0 8px', background: 'rgba(18,36,28,0.05)', border: '1px solid rgba(18,36,28,0.12)', borderRadius: 8, color: '#12241C', fontSize: 13 }} />
                          <span style={{ color: '#7d9188', fontSize: 12 }}>to</span>
                          <input type="time" value={s.close} onChange={e => setTime(day,'close',e.target.value)}
                            style={{ flex: 1, height: 34, padding: '0 8px', background: 'rgba(18,36,28,0.05)', border: '1px solid rgba(18,36,28,0.12)', borderRadius: 8, color: '#12241C', fontSize: 13 }} />
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: '#7d9188' }}>Closed</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <button onClick={save} disabled={saving}
                style={{ marginTop: 20, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 20px', background: saved ? '#12A150' : '#12A150', border: 'none', borderRadius: 100, color: saved ? '#0A3320' : '#ffffff', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'background .3s' }}>
                <SaveIcon /> {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Schedule'}
              </button>
            </div>

            {/* Upcoming bookings */}
            <div style={card}>
              <p style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: '#12241C', display: 'flex', alignItems: 'center', gap: 8 }}><CalIcon /> Upcoming Bookings</p>
              {bookings.length === 0 ? (
                <p style={{ fontSize: 13, color: '#7d9188' }}>No upcoming bookings.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {bookings.map((b, i) => {
                    const dt = b.scheduled_time ? new Date(b.scheduled_time) : null;
                    return (
                      <div key={i} style={{ padding: '12px 14px', background: 'rgba(18,161,80,0.06)', border: '1px solid rgba(18,161,80,0.15)', borderRadius: 10 }}>
                        <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 600, color: '#12241C' }}>{b.listing_title || 'Booking'}</p>
                        {dt && (
                          <p style={{ margin: 0, fontSize: 11, color: '#7d9188' }}>
                            {dt.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})} · {dt.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}
                          </p>
                        )}
                        <span style={{ display: 'inline-block', marginTop: 4, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: 'rgba(18,161,80,0.12)', color: '#12A150' }}>{b.status||'pending'}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </VendorShell>
  );
}

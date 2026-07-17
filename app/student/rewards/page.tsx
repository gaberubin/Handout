'use client';

import { useEffect, useState } from 'react';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { createClient } from '@/lib/supabase/client';
import { POINT_RULES, POINT_VALUES, touchDailyLogin, type PointAction } from '@/lib/points';

const StarIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#12A150" stroke="none" aria-hidden="true">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const FlameIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#E08A1E" stroke="none" aria-hidden="true">
    <path d="M12 2c1 3-1.5 4.5-3 6.5C7.5 10.5 6 12.4 6 15a6 6 0 0 0 12 0c0-2.2-1-3.9-2.3-5.4-.6 1-1.4 1.6-2.4 1.7.8-2 .3-4.6-1.3-6.3-.5-.5-1.3-1.5 0-3z" />
  </svg>
);
const GiftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
);

const ACTION_LABELS: Record<string, string> = {
  get_verified: 'Got verified', refer_friend: 'Referred a friend', complete_profile: 'Completed profile',
  set_connection_profile: 'Set up Find Your People', list_item: 'Listed an item', create_post: 'Posted in Community',
  rsvp_event: 'RSVP’d to an event', send_message: 'Messaged a student', daily_login: 'Daily check-in',
};

const REDEEM = [
  { title: 'Profile spotlight (24h)', cost: 500, emoji: '🌟' },
  { title: 'Featured Marketplace listing', cost: 300, emoji: '📢' },
  { title: 'Campus Connect boost', cost: 400, emoji: '💜' },
  { title: 'Custom profile flair', cost: 200, emoji: '🎨' },
];

const card: React.CSSProperties = { background: '#fff', border: '1px solid rgba(18,36,28,0.09)', borderRadius: 18, padding: 22 };

export default function RewardsPage() {
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [events, setEvents] = useState<any[]>([]);
  const [ready, setReady]   = useState(false);
  const [migrated, setMigrated] = useState(true);

  useEffect(() => {
    (async () => {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { window.location.href = '/auth/login'; return; }

      const fresh = await touchDailyLogin();
      if (fresh) { setPoints(fresh.points); setStreak(fresh.streak); }
      else {
        const { data, error } = await sb.from('users').select('points, streak').eq('id', user.id).maybeSingle();
        if (error) setMigrated(false);
        else if (data) { setPoints((data as any).points ?? 0); setStreak((data as any).streak ?? 0); }
      }

      const { data: ev } = await sb.from('point_events').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(12);
      setEvents(ev || []);
      setReady(true);
    })();
  }, []);

  return (
    <StudentLayout title="Rewards">
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        {/* Summary */}
        <div style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(18,161,80,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><StarIcon size={26} /></div>
            <div>
              <div className="ft-num" style={{ fontSize: 34, color: '#12241C', lineHeight: 1 }}>{ready ? points : '—'}</div>
              <div style={{ fontSize: 13, color: '#7D9188', marginTop: 3 }}>Handout points</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 14, background: 'rgba(224,138,30,0.08)', border: '1px solid rgba(224,138,30,0.18)' }}>
            <FlameIcon size={20} />
            <div>
              <div className="ft-num" style={{ fontSize: 20, color: '#12241C', lineHeight: 1 }}>{streak}</div>
              <div style={{ fontSize: 11, color: '#7D9188', marginTop: 2 }}>day streak</div>
            </div>
          </div>
        </div>

        {!migrated && (
          <div style={{ ...card, marginBottom: 18, borderColor: 'rgba(224,138,30,0.3)', background: 'rgba(224,138,30,0.06)', fontSize: 13, color: '#4C6157' }}>
            Points aren’t active yet. Run <code style={{ background: 'rgba(18,36,28,0.06)', padding: '1px 6px', borderRadius: 6 }}>db/feature-1-points.sql</code> in Supabase to enable rewards.
          </div>
        )}

        {/* How to earn */}
        <div style={{ ...card, marginBottom: 18 }}>
          <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 800, color: '#12241C' }}>How you earn points</p>
          <p style={{ margin: '0 0 16px', fontSize: 12.5, color: '#7D9188' }}>Real actions across Handout — the more you use the app, the more you earn.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {POINT_RULES.map(r => (
              <div key={r.action} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 12, background: 'rgba(18,36,28,0.02)', border: '1px solid rgba(18,36,28,0.05)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#12241C' }}>{r.label}</div>
                  <div style={{ fontSize: 12, color: '#7D9188' }}>{r.hint}</div>
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12.5, fontWeight: 800, color: '#12A150', background: 'rgba(18,161,80,0.10)', border: '1px solid rgba(18,161,80,0.20)', borderRadius: 100, padding: '4px 11px', flexShrink: 0 }}>
                  +{POINT_VALUES[r.action as PointAction]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Redeem — coming soon */}
        <div style={{ ...card, marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ color: '#7C6BD1', display: 'inline-flex' }}><GiftIcon /></span>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#12241C' }}>Redeem</p>
            <span style={{ fontSize: 10.5, fontWeight: 800, color: '#7C6BD1', background: 'rgba(124,107,209,0.10)', border: '1px solid rgba(124,107,209,0.22)', borderRadius: 100, padding: '2px 9px' }}>COMING SOON</span>
          </div>
          <p style={{ margin: '0 0 16px', fontSize: 12.5, color: '#7D9188' }}>Rewards you’ll be able to unlock with your points.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: 12 }}>
            {REDEEM.map(rw => {
              const affordable = points >= rw.cost;
              return (
                <div key={rw.title} style={{ padding: 16, borderRadius: 14, border: '1px solid rgba(18,36,28,0.08)', background: 'rgba(18,36,28,0.02)', opacity: 0.9 }}>
                  <div style={{ fontSize: 26, marginBottom: 8 }}>{rw.emoji}</div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#12241C', marginBottom: 10, lineHeight: 1.3 }}>{rw.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 800, color: affordable ? '#12A150' : '#7D9188' }}><StarIcon size={12} /> {rw.cost}</span>
                    <button disabled style={{ fontSize: 11.5, fontWeight: 700, color: '#7D9188', background: 'rgba(18,36,28,0.05)', border: '1px solid rgba(18,36,28,0.09)', borderRadius: 100, padding: '5px 12px', cursor: 'not-allowed' }}>Soon</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent activity */}
        <div style={card}>
          <p style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 800, color: '#12241C' }}>Recent activity</p>
          {!ready ? (
            <p style={{ fontSize: 13, color: '#7D9188' }}>Loading…</p>
          ) : events.length === 0 ? (
            <p style={{ fontSize: 13, color: '#7D9188' }}>No points yet — start with a daily check-in and getting verified.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {events.map(e => (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '9px 2px', borderBottom: '1px solid rgba(18,36,28,0.05)' }}>
                  <span style={{ fontSize: 13, color: '#12241C' }}>{ACTION_LABELS[e.action] || e.action}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    <span style={{ fontSize: 11.5, color: '#7D9188' }}>{new Date(e.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 800, color: '#12A150' }}>+{e.points}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </StudentLayout>
  );
}

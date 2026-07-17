'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function NotificationBell() {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  async function load() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    // RLS returns only this user's notifications.
    const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(25);
    setItems(data || []);
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 10000); // poll for new ones
    function onDoc(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener('mousedown', onDoc);
    return () => { clearInterval(t); document.removeEventListener('mousedown', onDoc); };
  }, []);

  const unread = items.filter(i => !i.is_read).length;

  async function toggle() {
    const willOpen = !open;
    setOpen(willOpen);
    if (willOpen && unread > 0) {
      const supabase = createClient();
      await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
      setItems(prev => prev.map(i => ({ ...i, is_read: true })));
    }
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={toggle} aria-label="Notifications"
        style={{ position: 'relative', width: 42, height: 42, borderRadius: '50%', background: 'rgba(18,36,28,0.06)', border: '1px solid rgba(18,36,28,0.09)', color: '#12241C', fontSize: 18, cursor: 'pointer' }}>
        🔔
        {unread > 0 && (
          <span style={{ position: 'absolute', top: -2, right: -2, minWidth: 18, height: 18, padding: '0 4px', borderRadius: 9, background: '#FF5C5C', color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>{unread}</span>
        )}
      </button>

      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 330, maxHeight: 400, overflowY: 'auto', background: '#FFFFFF', border: '1px solid rgba(18,36,28,0.12)', borderRadius: 12, boxShadow: '0 12px 32px rgba(0,0,0,0.55)', zIndex: 90 }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(18,36,28,0.09)', fontWeight: 700, color: '#12241C', fontSize: 14 }}>Notifications</div>
          {items.length === 0 ? <div style={{ padding: 22, color: '#7d9188', fontSize: 13 }}>No notifications yet.</div> :
          items.map(n => (
            <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid rgba(18,36,28,0.05)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#12241C' }}>{n.title}</div>
              <div style={{ fontSize: 12, color: '#4c6157', marginTop: 2, lineHeight: 1.4 }}>{n.message}</div>
              <div style={{ fontSize: 10, color: '#7d9188', marginTop: 4 }}>{new Date(n.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { MessagesUI } from '@/components/messages/MessagesUI';

export default function MessagesPage() {
  const [meId, setMeId] = useState('');

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/auth/login'; return; }
      setMeId(user.id);
    })();
  }, []);

  return (
    <StudentLayout title="Messages" noPad>
      {meId ? <MessagesUI meId={meId} /> : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7d9188', fontSize: 13 }}>
          Loading…
        </div>
      )}
    </StudentLayout>
  );
}

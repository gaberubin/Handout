'use client';

import { VendorShell } from '@/components/layout/VendorShell';
import { MessagesUI } from '@/components/messages/MessagesUI';

export default function VendorMessagesPage() {
  return (
    <VendorShell active="Messages" title="Messages" noPad>
      {(me) => <MessagesUI meId={me?.id || ''} />}
    </VendorShell>
  );
}

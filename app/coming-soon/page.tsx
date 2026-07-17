'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { ComingSoon } from '@/components/beta/ComingSoon';

function ComingSoonInner() {
  const params = useSearchParams();
  const feature = params.get('feature') || undefined;
  return <ComingSoon feature={feature} />;
}

export default function ComingSoonPage() {
  return (
    <StudentLayout title="What's Next">
      <Suspense fallback={<div style={{ padding: 40, color: '#7D9188' }}>Loading…</div>}>
        <ComingSoonInner />
      </Suspense>
    </StudentLayout>
  );
}

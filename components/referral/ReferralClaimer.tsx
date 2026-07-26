'use client';

import { useEffect } from 'react';
import { captureRefFromUrl, claimStoredReferral } from '@/lib/referral';

// Mounts on every authenticated student page (via StudentLayout). Grabs any
// ?ref= still on the URL, then claims a stored referral code once the user is
// signed in — awarding both sides their banked Plus days automatically.
export function ReferralClaimer() {
  useEffect(() => {
    captureRefFromUrl();
    claimStoredReferral();
  }, []);
  return null;
}

import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileBottomNav } from './MobileBottomNav';
import { FeedbackButton } from '@/components/beta/FeedbackButton';
import { VendorRoleClaimer } from '@/components/auth/VendorRoleClaimer';
import { ReferralClaimer } from '@/components/referral/ReferralClaimer';

export function StudentLayout({ children, title, noPad }: { children: React.ReactNode; title: string; noPad?: boolean }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <Topbar title={title} />
        <main className={noPad ? 'app-content-noPad' : 'app-content'}>{children}</main>
      </div>
      <MobileBottomNav />
      <FeedbackButton />
      {/* Catches a vendor who signed up via Google but was created as a student */}
      <VendorRoleClaimer />
      <ReferralClaimer />
    </div>
  );
}

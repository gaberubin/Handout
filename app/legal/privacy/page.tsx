import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy · Handout',
};

export default function PrivacyPage() {
  return (
    <div style={{ minHeight:'100vh', background:'var(--navy)', color:'var(--white)' }}>
      <div style={{ borderBottom:'1px solid var(--border)', padding:'20px 32px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <Link href="/landing" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
          <div style={{ width:36, height:36, background:'var(--amber)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:800, fontSize:18, color:'#ffffff' }}>H</div>
          <span style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:700, fontSize:20, color:'var(--white)' }}>Handout</span>
        </Link>
        <Link href="/landing" style={{ fontSize:13, color:'var(--muted)', textDecoration:'none' }}>← Back home</Link>
      </div>

      <div style={{ maxWidth:820, margin:'0 auto', padding:'64px 32px 96px' }}>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'var(--amber)', marginBottom:12 }}>Legal</div>
        <h1 style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:'clamp(40px,5vw,64px)', fontWeight:800, letterSpacing:-2, lineHeight:1, color:'var(--white)', marginBottom:16 }}>Privacy Policy</h1>
        <p style={{ fontSize:14, color:'var(--muted)', marginBottom:48 }}>Last updated: January 2026</p>

        <Section title="1. Information We Collect">
          <P>When you use Handout, we collect:</P>
          <Bullet><Strong>Account info:</Strong> name, email, phone number, password (encrypted), university, major, role</Bullet>
          <Bullet><Strong>Profile info:</Strong> bio, photos, lifestyle preferences, budget, move-in date, gender preferences</Bullet>
          <Bullet><Strong>Service info (Providers only):</Strong> service title, rates, availability, certifications, ID for verification</Bullet>
          <Bullet><Strong>Usage info:</Strong> pages you visit, features you use, messages you send, bookings you make</Bullet>
          <Bullet><Strong>Device info:</Strong> IP address, browser type, operating system, device identifier</Bullet>
          <Bullet><Strong>Payment info (when launched):</Strong> processed by Stripe — we do not store your card number</Bullet>
        </Section>

        <Section title="2. How We Use Your Data">
          <Bullet>To create and manage your account</Bullet>
          <Bullet>To match you with roommates, providers, or services</Bullet>
          <Bullet>To enable messaging between users</Bullet>
          <Bullet>To process payments and subscriptions</Bullet>
          <Bullet>To send service-related emails (booking confirmations, password resets)</Bullet>
          <Bullet>To improve the Platform via aggregated, anonymous analytics</Bullet>
          <Bullet>To prevent fraud and enforce our Terms</Bullet>
          <Bullet>To comply with legal obligations</Bullet>
          <P>We do not sell your personal data. Ever.</P>
        </Section>

        <Section title="3. Who We Share With">
          <Bullet><Strong>Other users:</Strong> only the profile info you make visible (name, photo, university, etc.)</Bullet>
          <Bullet><Strong>Providers you book:</Strong> name, contact info, booking details</Bullet>
          <Bullet><Strong>Service vendors:</Strong> Supabase (database), Vercel (hosting), Resend (email), Stripe (payments) — all bound by data agreements</Bullet>
          <Bullet><Strong>Law enforcement:</Strong> only when legally required (subpoena, warrant, or imminent safety threat)</Bullet>
          <P>We do not share your data with advertisers, data brokers, or any third party for marketing.</P>
        </Section>

        <Section title="4. Cookies & Tracking">
          <P>We use cookies for:</P>
          <Bullet>Keeping you logged in (essential)</Bullet>
          <Bullet>Remembering your preferences</Bullet>
          <Bullet>Anonymous analytics (Vercel Analytics, PostHog)</Bullet>
          <P>We do not use ad-tracking cookies. You can disable cookies in your browser, but the Platform may not work properly.</P>
        </Section>

        <Section title="5. Your Rights">
          <Bullet><Strong>Access:</Strong> view all data we have on you (Settings → Privacy)</Bullet>
          <Bullet><Strong>Correct:</Strong> update any personal info anytime from Settings</Bullet>
          <Bullet><Strong>Delete:</Strong> delete your account from Settings — most data deleted within 30 days</Bullet>
          <Bullet><Strong>Export:</Strong> download your data in JSON format (email support@handout.app)</Bullet>
          <Bullet><Strong>Opt out:</Strong> unsubscribe from marketing emails via the link in any email</Bullet>
          <P>Residents of California (CCPA) and EU (GDPR) have additional rights — email privacy@handout.app to exercise them.</P>
        </Section>

        <Section title="6. Data Security">
          <Bullet>Passwords are hashed using bcrypt — we never see your actual password</Bullet>
          <Bullet>All data is transmitted over HTTPS</Bullet>
          <Bullet>Database access is restricted via Row-Level Security policies</Bullet>
          <Bullet>We use 2-factor authentication on all admin accounts</Bullet>
          <P>No system is 100% secure. If a breach occurs, we will notify affected users within 72 hours.</P>
        </Section>

        <Section title="7. Data Retention">
          <Bullet>Active accounts: kept while you use the Platform</Bullet>
          <Bullet>Deleted accounts: personal info removed within 30 days</Bullet>
          <Bullet>Some data retained up to 2 years for fraud prevention and legal compliance</Bullet>
          <Bullet>Anonymous, aggregated analytics may be retained indefinitely</Bullet>
        </Section>

        <Section title="8. Children's Privacy">
          <P>Handout is not intended for users under 13. We do not knowingly collect data from children under 13. If we learn that we have, we will delete it immediately.</P>
        </Section>

        <Section title="9. Changes to This Policy">
          <P>We will notify you of material changes via email or in-app notice at least 14 days before taking effect.</P>
        </Section>

        <Section title="10. Contact">
          <Bullet>Privacy questions: privacy@handout.app</Bullet>
          <Bullet>Data requests: privacy@handout.app</Bullet>
          <Bullet>General support: support@handout.app</Bullet>
        </Section>

        <div style={{ marginTop:64, paddingTop:32, borderTop:'1px solid var(--border)', fontSize:13, color:'var(--muted)', textAlign:'center' }}>
          © 2026 Handout. All rights reserved.
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom:40 }}>
      <h2 style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:24, fontWeight:800, color:'var(--white)', marginBottom:16, letterSpacing:-0.5 }}>{title}</h2>
      <div style={{ fontSize:15, lineHeight:1.7, color:'var(--light)' }}>{children}</div>
    </div>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p style={{ marginBottom:14 }}>{children}</p>;
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display:'flex', gap:12, marginBottom:8, paddingLeft:6 }}>
      <span style={{ color:'var(--amber)', flexShrink:0 }}>•</span>
      <span>{children}</span>
    </div>
  );
}

function Strong({ children }: { children: React.ReactNode }) {
  return <strong style={{ color:'var(--white)', fontWeight:700 }}>{children}</strong>;
}
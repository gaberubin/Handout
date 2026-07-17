import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service · Handout',
  description: 'Terms and conditions for using Handout.',
};

export default function TermsPage() {
  return (
    <div style={{ minHeight:'100vh', background:'var(--navy)', color:'var(--white)' }}>
      {/* Header */}
      <div style={{ borderBottom:'1px solid var(--border)', padding:'20px 32px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <Link href="/landing" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
          <div style={{ width:36, height:36, background:'var(--amber)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:800, fontSize:18, color:'#ffffff' }}>H</div>
          <span style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:700, fontSize:20, color:'var(--white)' }}>Handout</span>
        </Link>
        <Link href="/landing" style={{ fontSize:13, color:'var(--muted)', textDecoration:'none' }}>← Back home</Link>
      </div>

      <div style={{ maxWidth:820, margin:'0 auto', padding:'64px 32px 96px' }}>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'var(--amber)', marginBottom:12 }}>Legal</div>
        <h1 style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:'clamp(40px,5vw,64px)', fontWeight:800, letterSpacing:-2, lineHeight:1, color:'var(--white)', marginBottom:16 }}>Terms of Service</h1>
        <p style={{ fontSize:14, color:'var(--muted)', marginBottom:48 }}>Last updated: January 2026 · Effective immediately</p>

        <Section title="1. Acceptance of Terms">
          <P>By creating an account, accessing, or using Handout ("the Platform", "we", "us", "our"), you ("User", "you") agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, do not use the Platform.</P>
          <P>You must be at least 18 years old, or have the consent of a parent or legal guardian if between 13-17, to use Handout. Users under 13 are prohibited.</P>
        </Section>

        <Section title="2. What Handout Is">
          <P>Handout is a community marketplace platform that connects university students with:</P>
          <Bullet>Roommate matches based on lifestyle compatibility</Bullet>
          <Bullet>Food and tiffin subscriptions from local providers</Bullet>
          <Bullet>Trusted personal services (rides, tutoring, babysitting, handyman work, etc.)</Bullet>
          <Bullet>A community forum for sharing tips and questions</Bullet>
          <P><Strong>Handout is a platform, not a service provider.</Strong> We do not provide rides, prepare food, or deliver services directly. Service providers ("Providers") are independent third parties responsible for their own work, conduct, licensing, insurance, and tax obligations.</P>
        </Section>

        <Section title="3. Account Registration">
          <P>To use Handout you must provide accurate, current, and complete information including your full name, email, phone number, university, and major.</P>
          <Bullet>You are responsible for keeping your password confidential.</Bullet>
          <Bullet>You are responsible for all activity on your account.</Bullet>
          <Bullet>One person may not maintain more than one account.</Bullet>
          <Bullet>You must notify us immediately of any unauthorized account use.</Bullet>
        </Section>

        <Section title="4. User Responsibilities">
          <P>You agree NOT to:</P>
          <Bullet>Post false, misleading, or fraudulent information about yourself or others</Bullet>
          <Bullet>Harass, stalk, threaten, or impersonate any user or Provider</Bullet>
          <Bullet>Use Handout for any illegal activity</Bullet>
          <Bullet>Solicit payment outside the Platform (this voids our protections for you)</Bullet>
          <Bullet>Post discriminatory content based on race, gender, religion, sexual orientation, disability, or national origin</Bullet>
          <Bullet>Scrape, copy, or republish Handout content without written permission</Bullet>
          <Bullet>Use bots, automated tools, or attempt to bypass security measures</Bullet>
          <Bullet>Post spam, advertisements, or commercial content outside designated areas</Bullet>
          <Bullet>Share inappropriate, sexual, violent, or otherwise harmful content</Bullet>
        </Section>

        <Section title="5. Provider Responsibilities">
          <P>If you offer services on Handout, you confirm that:</P>
          <Bullet>You have all required licenses, certifications, and permits for your service</Bullet>
          <Bullet>You carry appropriate insurance (where applicable)</Bullet>
          <Bullet>You are legally allowed to work in the United States</Bullet>
          <Bullet>You will report and pay your own taxes — Handout does not withhold taxes for you</Bullet>
          <Bullet>You will deliver services as advertised, on time, and with care</Bullet>
          <Bullet>You will follow all federal, state, and local laws</Bullet>
          <Bullet>You will pass any background check required for your service category (especially childcare and rides)</Bullet>
          <Bullet>You are solely liable for your own conduct and the quality of work</Bullet>
        </Section>

        <Section title="6. Bookings, Payments & Cancellations">
          <Bullet>All bookings are between the Student and the Provider — Handout facilitates but is not party to the transaction.</Bullet>
          <Bullet>Pricing is set by Providers. Students agree to the displayed price before booking.</Bullet>
          <Bullet>Handout may charge a service fee or commission on transactions (clearly disclosed at checkout when payments launch).</Bullet>
          <Bullet>Cancellation policies vary by Provider and are shown at booking time.</Bullet>
          <Bullet>Refunds are subject to the individual Provider's policy unless the service was clearly not delivered.</Bullet>
          <Bullet>Chargebacks or disputes will be investigated; abuse may result in account suspension.</Bullet>
        </Section>

        <Section title="7. Roommate Matching — Important">
          <P>Compatibility scores are based on preferences you provide and are <Strong>guidance only, not guarantees</Strong>. Handout does not verify any user's lifestyle claims, background, or character.</P>
          <Bullet>Always meet potential roommates in public places before committing.</Bullet>
          <Bullet>Sign a written lease or roommate agreement — verbal agreements are not protected by Handout.</Bullet>
          <Bullet>Conduct your own due diligence including background checks where appropriate.</Bullet>
          <Bullet>Handout is not responsible for disputes between roommates including unpaid rent, damages, or personal conflicts.</Bullet>
        </Section>

        <Section title="8. Safety & Trust">
          <P>While we verify Provider profiles where possible, we cannot guarantee any user's identity, background, or safety. You agree to:</P>
          <Bullet>Use common sense when meeting strangers</Bullet>
          <Bullet>Meet in public places initially</Bullet>
          <Bullet>Trust your instincts — leave if something feels wrong</Bullet>
          <Bullet>Report unsafe behavior, scams, or policy violations to safety@handout.app</Bullet>
          <Bullet>In emergencies, contact local authorities (911 in the US) before contacting us</Bullet>
        </Section>

        <Section title="9. Content You Post">
          <P>You retain ownership of content you post (profile info, reviews, community posts, photos). By posting, you grant Handout a non-exclusive, royalty-free, worldwide license to display, distribute, and promote that content on and through the Platform.</P>
          <P>You represent that any content you post is your own or that you have the right to share it. We may remove content that violates these Terms without notice.</P>
        </Section>

        <Section title="10. Membership Plans">
          <Bullet><Strong>Free</Strong> — Limited matches per month, basic features. Always free.</Bullet>
          <Bullet><Strong>Plus ($9/month)</Strong> — Unlimited matches, priority booking, verified badge.</Bullet>
          <Bullet><Strong>Pro ($19/month)</Strong> — Everything in Plus, plus group housing tools and bulk discounts.</Bullet>
          <P>Subscriptions auto-renew monthly until cancelled. Cancel anytime from your Settings — access continues until the end of the paid period. Refunds for partial months are at our discretion.</P>
        </Section>

        <Section title="11. Termination">
          <P>We may suspend or terminate your account at any time, without notice, if you:</P>
          <Bullet>Violate these Terms</Bullet>
          <Bullet>Engage in fraudulent, abusive, or illegal activity</Bullet>
          <Bullet>Harm or endanger other users</Bullet>
          <Bullet>Receive multiple verified complaints</Bullet>
          <P>You may delete your account at any time from Settings. Some data may be retained for legal compliance, fraud prevention, or anti-abuse purposes for up to 2 years after deletion.</P>
        </Section>

        <Section title="12. Disclaimers — Read Carefully">
          <P>Handout is provided "AS IS" without any warranties of any kind, express or implied.</P>
          <Bullet>We do not warrant that the Platform will be uninterrupted, error-free, or secure.</Bullet>
          <Bullet>We do not endorse any specific user, Provider, or service.</Bullet>
          <Bullet>We are not responsible for the conduct, quality, or safety of any user or Provider.</Bullet>
          <Bullet>Reviews and ratings reflect individual users' opinions, not Handout's endorsement.</Bullet>
        </Section>

        <Section title="13. Limitation of Liability">
          <P>To the maximum extent permitted by law, Handout, its founders, employees, partners, and affiliates shall not be liable for:</P>
          <Bullet>Any indirect, incidental, consequential, or punitive damages</Bullet>
          <Bullet>Loss of data, profits, reputation, or opportunities</Bullet>
          <Bullet>Injury, theft, or damage caused by other users or Providers</Bullet>
          <Bullet>Disputes between users or between users and Providers</Bullet>
          <P>Our total liability for any claim shall not exceed the greater of (a) $100 USD, or (b) the amount you paid us in the last 12 months.</P>
        </Section>

        <Section title="14. Indemnification">
          <P>You agree to indemnify and hold Handout harmless from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of the Platform, your violation of these Terms, or your violation of any rights of another party.</P>
        </Section>

        <Section title="15. Dispute Resolution">
          <P>Disputes should first be raised by emailing support@handout.app. We will attempt to resolve in good faith within 30 days.</P>
          <P>If unresolved, disputes shall be governed by the laws of the State of New Jersey, USA, and resolved exclusively in the state or federal courts located in Gloucester County, New Jersey.</P>
          <P>You waive any right to a jury trial or to participate in a class action.</P>
        </Section>

        <Section title="16. Changes to These Terms">
          <P>We may update these Terms at any time. Material changes will be communicated via email or a notice on the Platform at least 14 days before taking effect. Continued use after changes means you accept the new Terms.</P>
        </Section>

        <Section title="17. Contact">
          <P>Questions about these Terms? Reach us at:</P>
          <Bullet>General: support@handout.app</Bullet>
          <Bullet>Safety concerns: safety@handout.app</Bullet>
          <Bullet>Legal notices: legal@handout.app</Bullet>
        </Section>

        <div style={{ marginTop:64, paddingTop:32, borderTop:'1px solid var(--border)', fontSize:13, color:'var(--muted)', textAlign:'center' }}>
          By using Handout, you confirm you have read, understood, and agree to these Terms of Service.
          <br/><br/>
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
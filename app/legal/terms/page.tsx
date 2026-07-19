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
        <p style={{ fontSize:14, color:'var(--muted)', marginBottom:32 }}>Last updated: July 2026 · Beta Version 1.0 · Effective immediately</p>

        {/* Beta notice — prominent callout */}
        <div style={{ background:'rgba(18,161,80,0.08)', border:'1px solid rgba(18,161,80,0.28)', borderRadius:16, padding:'20px 22px', marginBottom:48 }}>
          <div style={{ fontSize:12, fontWeight:800, letterSpacing:1, textTransform:'uppercase', color:'#0F8A44', marginBottom:8 }}>🟢 Beta Notice</div>
          <p style={{ fontSize:14.5, lineHeight:1.65, color:'var(--light)', margin:0 }}>
            Handout is currently a <strong style={{ color:'var(--white)' }}>free public Beta</strong>. It is pre-release, experimental software provided <strong style={{ color:'var(--white)' }}>“as is” and “as available.”</strong> It may contain bugs, downtime, or incomplete features; features and data may change, be reset, or be removed at any time; and there are <strong style={{ color:'var(--white)' }}>no payments, subscriptions, or fees</strong> during Beta. You use Handout at your own risk. See Sections 2, 11, and 17–19 below.
          </p>
        </div>

        <Section title="1. Acceptance of Terms">
          <P>By creating an account, accessing, or using Handout ("the Platform", "we", "us", "our"), you ("User", "you") agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, do not use the Platform.</P>
          <P>You must be at least 18 years old, or between 13–17 with the consent of a parent or legal guardian, to use Handout. Users under 13 are prohibited. <Strong>Campus Connect (our dating / social-matching feature) is strictly limited to users 18 and older.</Strong></P>
        </Section>

        <Section title="2. Beta Service">
          <P>Handout is offered as a free, pre-release Beta. By using it, you acknowledge and agree that:</P>
          <Bullet>The Platform is experimental and provided <Strong>"as is" and "as available"</Strong>, with no guarantee of reliability, uptime, accuracy, or data preservation.</Bullet>
          <Bullet>Features may be added, changed, limited, or removed at any time without notice.</Bullet>
          <Bullet>We may reset, modify, migrate, or delete data during Beta, including your content and account.</Bullet>
          <Bullet>There are no paid plans, subscriptions, commissions, or fees during Beta. Every available feature is free.</Bullet>
          <Bullet>Some features described in these Terms (such as paid services, food, rides, or in-app payments) are planned but not yet available, and the related sections apply only if and when those features launch.</Bullet>
        </Section>

        <Section title="3. What Handout Is">
          <P>Handout is a student community platform. Features currently available in Beta include:</P>
          <Bullet>Roommate matching based on lifestyle compatibility</Bullet>
          <Bullet>Campus Connect — university-locked social matching (18+)</Bullet>
          <Bullet>A community feed for questions, tips, and campus discussion</Bullet>
          <Bullet>A student Marketplace for buying and selling books and items</Bullet>
          <Bullet>Campus events, "Find Your People" matching, direct messaging, and a rewards / points program</Bullet>
          <P>Additional services — such as food & tiffin, airport pickup, tutoring, and other student services — are planned for future releases and are <Strong>not yet available</Strong>.</P>
          <P><Strong>Handout is a platform, not a service provider.</Strong> We introduce users to one another and to independent third parties. We do not provide housing, prepare food, deliver services, or take part in any transaction between users.</P>
        </Section>

        <Section title="4. Account Registration">
          <P>To use Handout you must provide accurate, current, and complete information such as your name, email, and university. Students must register with a valid <Strong>.edu university email address</Strong>. A phone number is optional.</P>
          <Bullet>You are responsible for keeping your password confidential.</Bullet>
          <Bullet>You are responsible for all activity on your account.</Bullet>
          <Bullet>One person may not maintain more than one account, and you may not register with someone else's identity.</Bullet>
          <Bullet>You must notify us immediately of any unauthorized account use.</Bullet>
        </Section>

        <Section title="5. User Responsibilities">
          <P>You agree NOT to:</P>
          <Bullet>Post false, misleading, or fraudulent information about yourself or others</Bullet>
          <Bullet>Harass, stalk, threaten, or impersonate any user or Provider</Bullet>
          <Bullet>Use Handout for any illegal activity</Bullet>
          <Bullet>Post discriminatory content based on race, gender, religion, sexual orientation, disability, or national origin</Bullet>
          <Bullet>Scrape, copy, or republish Handout content without written permission</Bullet>
          <Bullet>Use bots, automated tools, or attempt to bypass security measures</Bullet>
          <Bullet>Post spam, advertisements, or commercial content outside designated areas</Bullet>
          <Bullet>Share inappropriate, sexual, violent, or otherwise harmful content</Bullet>
        </Section>

        <Section title="6. Student Marketplace">
          <P>The Marketplace lets students list and browse books and personal items. It is a peer-to-peer listings board only.</P>
          <Bullet><Strong>Handout does not process payments</Strong> and is not a party to any Marketplace transaction. Any exchange of money happens directly between buyer and seller, off-platform.</Bullet>
          <Bullet>We do not inspect, verify, authenticate, or guarantee any item, price, or listing.</Bullet>
          <Bullet>Trade safely: meet in public campus locations and inspect items before paying.</Bullet>
          <Bullet>Only lawful items may be listed. Prohibited, stolen, counterfeit, hazardous, or restricted items are not allowed.</Bullet>
          <Bullet>Handout is not responsible for any loss, fraud, damage, or dispute arising from a Marketplace transaction.</Bullet>
        </Section>

        <Section title="7. Provider Responsibilities (Future Paid Services)">
          <P>This section applies if and when paid service providers become available. If you offer services on Handout, you confirm that:</P>
          <Bullet>You have all required licenses, certifications, and permits for your service</Bullet>
          <Bullet>You carry appropriate insurance (where applicable)</Bullet>
          <Bullet>You are legally allowed to work in the United States</Bullet>
          <Bullet>You will report and pay your own taxes — Handout does not withhold taxes for you</Bullet>
          <Bullet>You will deliver services as advertised, on time, and with care</Bullet>
          <Bullet>You will follow all federal, state, and local laws</Bullet>
          <Bullet>You will pass any background check required for your service category</Bullet>
          <Bullet>You are solely liable for your own conduct and the quality of work</Bullet>
        </Section>

        <Section title="8. Bookings, Payments & Cancellations (Future Feature)">
          <P><Strong>Handout does not process any payments during Beta.</Strong> This section applies only if and when paid transactions launch.</P>
          <Bullet>All bookings are between the Student and the Provider — Handout facilitates but is not party to the transaction.</Bullet>
          <Bullet>Pricing is set by Providers. Students agree to the displayed price before booking.</Bullet>
          <Bullet>Handout may charge a service fee or commission on transactions (clearly disclosed at checkout when payments launch).</Bullet>
          <Bullet>Cancellation and refund policies vary by Provider and are shown at booking time.</Bullet>
          <Bullet>Chargebacks or disputes will be investigated; abuse may result in account suspension.</Bullet>
        </Section>

        <Section title="9. Roommate Matching — Important">
          <P>Compatibility scores are based on preferences you provide and are <Strong>guidance only, not guarantees</Strong>. Handout does not verify any user's lifestyle claims, background, or character.</P>
          <Bullet>Always meet potential roommates in public places before committing.</Bullet>
          <Bullet>Sign a written lease or roommate agreement — verbal agreements are not protected by Handout.</Bullet>
          <Bullet>Conduct your own due diligence, including background checks where appropriate.</Bullet>
          <Bullet>Handout is <Strong>not responsible</Strong> for any dispute, harm, injury, harassment, theft, property damage, unpaid rent or bills, or any other loss arising between roommates or housemates.</Bullet>
        </Section>

        <Section title="10. Campus Connect (Dating & Social Matching)">
          <P>Campus Connect introduces students to one another for social and dating purposes. By using it you agree that:</P>
          <Bullet><Strong>You are 18 years of age or older.</Strong></Bullet>
          <Bullet>Handout does not conduct background checks and does not verify any user's identity, age, character, or intentions.</Bullet>
          <Bullet>Meet matches in public places, tell a friend where you're going, and trust your instincts.</Bullet>
          <Bullet>You may block or report any user. Report unsafe behavior to safety@handout.app; in emergencies, contact local authorities first.</Bullet>
          <Bullet>Handout is not responsible for the conduct of any match, online or in person.</Bullet>
        </Section>

        <Section title="11. Assumption of Risk & Release — In-Person Interactions">
          <P>Handout only introduces students to one another. <Strong>We do not screen users, conduct criminal background checks, or verify anyone's identity, character, or intentions.</Strong> Any decision to communicate with, meet, live with, room with, or transact with another user is made solely at your own risk.</P>
          <P>You understand and agree that Handout is <Strong>not responsible or liable for the acts or omissions of any user</Strong>, whether online or in person, including but not limited to: bodily injury, emotional distress, harassment, assault, theft, property damage, loss of belongings, unpaid rent or bills, lease or roommate disputes, financial loss, or death.</P>
          <P>To the fullest extent permitted by law, you <Strong>release, waive, and discharge Handout, its founders, employees, and affiliates from any and all claims, demands, or damages</Strong> of every kind — known or unknown — arising out of or connected to your interactions with any other user, including any roommate arrangement, Marketplace exchange, Campus Connect match, or in-person meeting arranged through the Platform. <Strong>You assume all risk</Strong> associated with such interactions.</P>
        </Section>

        <Section title="12. Safety & Trust">
          <P>While we verify some profiles where possible, we cannot guarantee any user's identity, background, or safety. You agree to:</P>
          <Bullet>Use common sense when meeting strangers</Bullet>
          <Bullet>Meet in public places initially, whether for roommates, Marketplace exchanges, or Campus Connect</Bullet>
          <Bullet>Trust your instincts — leave if something feels wrong</Bullet>
          <Bullet>Report unsafe behavior, scams, or policy violations to safety@handout.app</Bullet>
          <Bullet>In emergencies, contact local authorities (911 in the US) before contacting us</Bullet>
        </Section>

        <Section title="13. Content You Post">
          <P>You retain ownership of content you post (profile info, reviews, community posts, photos). By posting, you grant Handout a non-exclusive, royalty-free, worldwide license to display, distribute, and promote that content on and through the Platform.</P>
          <P>You represent that any content you post is your own or that you have the right to share it. We may remove content that violates these Terms without notice.</P>
        </Section>

        <Section title="14. Rewards & Points">
          <P>Handout may award points for activity on the Platform. Points are a promotional feature only.</P>
          <Bullet>Points have <Strong>no monetary or cash value</Strong> and cannot be exchanged, sold, or redeemed for money.</Bullet>
          <Bullet>We may change, expire, suspend, or revoke points and the rewards program at any time.</Bullet>
          <Bullet>Points obtained through fraud, abuse, or automated means may be voided and may result in account suspension.</Bullet>
        </Section>

        <Section title="15. Pricing — Free During Beta">
          <P><Strong>Handout is completely free during our public Beta.</Strong> There are no paid plans, subscriptions, or fees, and you will never be charged.</P>
          <P>If we introduce paid features in the future, we will provide advance notice, and any paid feature will be optional — you will never be charged without first opting in.</P>
        </Section>

        <Section title="16. Termination">
          <P>We may suspend or terminate your account at any time, without notice, if you:</P>
          <Bullet>Violate these Terms</Bullet>
          <Bullet>Engage in fraudulent, abusive, or illegal activity</Bullet>
          <Bullet>Harm or endanger other users</Bullet>
          <Bullet>Receive multiple verified complaints</Bullet>
          <P>You may delete your account at any time from Settings. Some data may be retained for legal compliance, fraud prevention, or anti-abuse purposes for up to 2 years after deletion.</P>
        </Section>

        <Section title="17. Disclaimers — Read Carefully">
          <P>Handout is provided "AS IS" and "AS AVAILABLE" without any warranties of any kind, express or implied, including for a Beta service.</P>
          <Bullet>We do not warrant that the Platform will be uninterrupted, error-free, secure, or that data will be preserved.</Bullet>
          <Bullet>We do not endorse any specific user, Provider, or service.</Bullet>
          <Bullet>We are not responsible for the conduct, quality, or safety of any user or Provider.</Bullet>
          <Bullet>Reviews and ratings reflect individual users' opinions, not Handout's endorsement.</Bullet>
        </Section>

        <Section title="18. Limitation of Liability">
          <P>To the maximum extent permitted by law, Handout, its founders, employees, partners, and affiliates shall not be liable for:</P>
          <Bullet>Any indirect, incidental, consequential, or punitive damages</Bullet>
          <Bullet>Loss of data, profits, reputation, or opportunities (including Beta data loss or resets)</Bullet>
          <Bullet>Injury, theft, or damage caused by other users or Providers</Bullet>
          <Bullet>Disputes between users or between users and Providers</Bullet>
          <P>Our total liability for any claim shall not exceed the greater of (a) $100 USD, or (b) the amount you paid us in the last 12 months (which, during the free Beta, is $0).</P>
        </Section>

        <Section title="19. Indemnification">
          <P>You agree to indemnify and hold Handout harmless from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of the Platform, your violation of these Terms, or your violation of any rights of another party.</P>
        </Section>

        <Section title="20. Dispute Resolution">
          <P>Disputes should first be raised by emailing support@handout.app. We will attempt to resolve in good faith within 30 days.</P>
          <P>If unresolved, disputes shall be governed by the laws of the State of New Jersey, USA, and resolved exclusively in the state or federal courts located in Gloucester County, New Jersey.</P>
          <P>You waive any right to a jury trial or to participate in a class action.</P>
        </Section>

        <Section title="21. Changes to These Terms">
          <P>We may update these Terms at any time. Material changes will be communicated via email or a notice on the Platform at least 14 days before taking effect. Continued use after changes means you accept the new Terms.</P>
        </Section>

        <Section title="22. Contact">
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

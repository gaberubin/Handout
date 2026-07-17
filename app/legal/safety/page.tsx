import Link from 'next/link';

export const metadata = {
  title: 'Safety & Trust · Handout',
  description: 'How Handout keeps students safe — verification, background checks, and reporting.',
};

export default function SafetyPage() {
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
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'var(--amber)', marginBottom:12 }}>Trust &amp; Safety</div>
        <h1 style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:'clamp(40px,5vw,64px)', fontWeight:800, letterSpacing:-2, lineHeight:1, color:'var(--white)', marginBottom:16 }}>Your safety comes first.</h1>
        <p style={{ fontSize:16, color:'var(--light)', lineHeight:1.7, marginBottom:48, maxWidth:560 }}>
          Handout exists so students far from home can find people they can trust. Here is exactly what we do to keep the community safe — and what you should do too.
        </p>

        {/* Quick actions */}
        <div className="rg-3" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:56 }}>
          <ActionCard emoji="🚨" title="Emergency?" body="Call 911 first. Always. Then let us know what happened." />
          <ActionCard emoji="🛡️" title="Report a user" body="Email safety@handout.app — we review every report within 24 hours." />
          <ActionCard emoji="💬" title="Something feels off?" body="Trust your instincts. Block, leave, and tell us about it." />
        </div>

        <Section title="How we verify the community">
          <Bullet><Strong>University email verification</Strong> — every student signs up with a school email address and confirms it before they can message anyone.</Bullet>
          <Bullet><Strong>Provider screening</Strong> — service providers submit ID and relevant licenses; childcare and ride providers must pass a background check before the Verified badge appears.</Bullet>
          <Bullet><Strong>Verified badges</Strong> — the green check means we reviewed that profile's identity documents. No badge, no verification — treat accordingly.</Bullet>
          <Bullet><Strong>Reviews you can trust</Strong> — only users who completed a booking can review it, and we investigate review manipulation.</Bullet>
        </Section>

        <Section title="Meeting someone from Handout">
          <Bullet>Meet in a public place the first time — a campus café, library, or student center.</Bullet>
          <Bullet>Tell a friend where you are going and who you are meeting.</Bullet>
          <Bullet>Keep conversations and payments on the platform — that is what lets us step in if something goes wrong.</Bullet>
          <Bullet>Never share your password, banking details, or immigration documents with anyone.</Bullet>
          <Bullet>For roommate visits, bring a friend and never hand over a deposit before signing a written agreement.</Bullet>
        </Section>

        <Section title="What we act on">
          <P>Reports of any of the following lead to investigation and can end in immediate, permanent removal:</P>
          <Bullet>Harassment, threats, or hate speech</Bullet>
          <Bullet>Scams, fake listings, or requests to pay off-platform</Bullet>
          <Bullet>Impersonation or fake profiles</Bullet>
          <Bullet>Unsafe service conduct — unlicensed driving, unsafe childcare, and similar</Bullet>
          <Bullet>Any behavior involving minors or non-consensual content</Bullet>
        </Section>

        <Section title="How to report">
          <P>Three ways, all reviewed by a human:</P>
          <Bullet>Tap <Strong>Report</Strong> on any profile, listing, or message thread.</Bullet>
          <Bullet>Email <Strong>safety@handout.app</Strong> with screenshots if you have them.</Bullet>
          <Bullet>For anything urgent involving physical safety, contact local authorities first (911), then notify us.</Bullet>
          <P>We aim to respond to every safety report within 24 hours, and we never tell the reported person who reported them.</P>
        </Section>

        <div style={{ marginTop:64, paddingTop:32, borderTop:'1px solid var(--border)', fontSize:13, color:'var(--muted)', textAlign:'center' }}>
          Questions about safety? Email safety@handout.app — a person reads every message.
          <br/><br/>
          © 2026 Handout. All rights reserved.
        </div>
      </div>
    </div>
  );
}

function ActionCard({ emoji, title, body }: { emoji: string; title: string; body: string }) {
  return (
    <div style={{ background:'var(--navy2)', border:'1px solid var(--border)', borderRadius:18, padding:'20px 18px' }}>
      <div style={{ fontSize:26, marginBottom:10 }}>{emoji}</div>
      <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:16, fontWeight:800, color:'var(--white)', marginBottom:6 }}>{title}</div>
      <div style={{ fontSize:13, color:'var(--light)', lineHeight:1.6 }}>{body}</div>
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

import Link from 'next/link';

export const metadata = {
  title: 'Contact · Handout',
  description: 'Get in touch with the Handout team — support, safety, partnerships, and press.',
};

const CHANNELS = [
  { emoji: '💬', title: 'General support',   body: 'Account issues, bugs, billing questions, or anything else.',            email: 'support@handout.app',  note: 'Replies within 1 business day' },
  { emoji: '🛡️', title: 'Trust & safety',    body: 'Report a user, a scam, or anything that made you feel unsafe.',        email: 'safety@handout.app',   note: 'Reviewed within 24 hours' },
  { emoji: '🍱', title: 'Cooks & providers', body: 'Want to sell food or offer a service on Handout? Start here.',         email: 'vendors@handout.app',  note: 'Onboarding help included' },
  { emoji: '📣', title: 'Press & partners',  body: 'Universities, student orgs, media, and partnership inquiries.',        email: 'hello@handout.app',    note: 'We love working with campuses' },
];

export default function ContactPage() {
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

      <div style={{ maxWidth:920, margin:'0 auto', padding:'64px 32px 96px' }}>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'var(--amber)', marginBottom:12 }}>Contact</div>
        <h1 style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:'clamp(40px,5vw,64px)', fontWeight:800, letterSpacing:-2, lineHeight:1, color:'var(--white)', marginBottom:16 }}>Talk to a human.</h1>
        <p style={{ fontSize:16, color:'var(--light)', lineHeight:1.7, marginBottom:48, maxWidth:520 }}>
          No ticket numbers, no bots. Pick the right inbox below and a real person on the Handout team will get back to you.
        </p>

        <div className="rg-2" style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:16, marginBottom:56 }}>
          {CHANNELS.map(c => (
            <a key={c.email} href={`mailto:${c.email}`} style={{ display:'block', background:'var(--navy2)', border:'1px solid var(--border)', borderRadius:20, padding:'24px 22px', textDecoration:'none', transition:'border-color 0.2s' }}>
              <div style={{ fontSize:28, marginBottom:12 }}>{c.emoji}</div>
              <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:18, fontWeight:800, color:'var(--white)', marginBottom:6 }}>{c.title}</div>
              <div style={{ fontSize:14, color:'var(--light)', lineHeight:1.6, marginBottom:14 }}>{c.body}</div>
              <div style={{ fontSize:14, fontWeight:700, color:'var(--amber2)' }}>{c.email}</div>
              <div style={{ fontSize:12, color:'var(--muted)', marginTop:4 }}>{c.note}</div>
            </a>
          ))}
        </div>

        {/* Campus */}
        <div style={{ background:'var(--navy3)', border:'1px solid rgba(18,161,80,0.18)', borderRadius:20, padding:'26px 28px', display:'flex', alignItems:'center', gap:18, flexWrap:'wrap' }}>
          <div style={{ fontSize:30 }}>📍</div>
          <div style={{ flex:1, minWidth:220 }}>
            <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:17, fontWeight:800, color:'var(--white)', marginBottom:4 }}>Find us on campus</div>
            <div style={{ fontSize:14, color:'var(--light)' }}>Handout is built at Rowan University · Glassboro, NJ. Look for our table at student org fairs, or say hi at hello@handout.app.</div>
          </div>
          <Link href="/help" style={{ display:'inline-flex', alignItems:'center', gap:7, background:'var(--amber)', color:'#ffffff', fontWeight:700, fontSize:13, padding:'11px 20px', borderRadius:100, textDecoration:'none' }}>Visit the Help Center →</Link>
        </div>

        <div style={{ marginTop:64, paddingTop:32, borderTop:'1px solid var(--border)', fontSize:13, color:'var(--muted)', textAlign:'center' }}>
          © 2026 Handout. All rights reserved. · <Link href="/legal/terms" style={{ color:'var(--muted)' }}>Terms</Link> · <Link href="/legal/privacy" style={{ color:'var(--muted)' }}>Privacy</Link> · <Link href="/legal/safety" style={{ color:'var(--muted)' }}>Safety</Link>
        </div>
      </div>
    </div>
  );
}

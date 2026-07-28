'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { LiveStats } from '@/components/motion/LiveStats';
import { BETA_MODE } from '@/config/features';
import { BetaBadge } from '@/components/beta/BetaBadge';

/* ── Landing page SVG icons ── */
const LD_People  = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const LD_Food    = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>;
const LD_Ride    = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
const LD_Book    = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const LD_Heart   = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const LD_Globe   = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const LD_Move    = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
const LD_Pet     = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg>;
const LD_Clean   = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const LD_Ride2   = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;

const features = [
  { Icon: LD_People, tag:'Smart Match',  title:'Find your roommate.',    desc:'Compatibility scoring on lifestyle, budget, and preferences — match with students on your own campus.', delay:'d1' },
  { Icon: LD_Heart,  tag:'Rowan Only',   title:'Campus Connect.',        desc:'University-locked matching to meet verified students from your campus — safe, private, and free.', delay:'d2' },
  { Icon: LD_Globe,  tag:'Your Campus',  title:'Community feed.',        desc:'Ask questions, share tips, and stay in the loop with everyone at your university.', delay:'d3' },
  { Icon: LD_Book,   tag:'Buy & Sell',   title:'Student Marketplace.',   desc:'Buy and sell textbooks and dorm items with students nearby. Free — just meet safely on campus.', delay:'d4' },
  { Icon: LD_Ride,   tag:'On Campus',    title:'Campus Events.',         desc:'Discover what’s happening around campus and RSVP in a single tap.', delay:'d5' },
  { Icon: LD_Food,   tag:'Find People',  title:'Find your people.',      desc:'Match with study buddies, gym partners, and project teammates who fit your vibe.', delay:'d6' },
];

const testimonials = [
  { initials:'AK', bg:'#12A150', fg:'#ffffff', name:'Arjun Kumar',  uni:'UIC · CS',         quote:'"Found my roommate in 3 days. 94% match — he became my closest friend here."' },
  { initials:'PM', bg:'#12A150', fg:'#fff',    name:'Priya Mehta',  uni:'Rowan · Business',  quote:'"Sold my old textbooks in a week and found my study group here. All of it free."' },
  { initials:'LN', bg:'#E11D48', fg:'#fff',    name:'Lin Nguyen',   uni:'Rowan · Engineering',quote:'"As an international student, Handout was the first thing that made this place feel like home."' },
];

const services = [
  { num:'01', Icon: LD_Ride2,  name:'Airport Rides',  desc:'Licensed drivers, flat rates, all airports.',        rate:'Est. $20/trip',  bg:'rgba(37,99,235,0.1)' },
  { num:'02', Icon: LD_Book,   name:'Tutoring',        desc:'GRE, Calculus, CS, Physics — all levels.',           rate:'Est. $15/hr',    bg:'rgba(124,58,237,0.1)' },
  { num:'03', Icon: LD_Heart,  name:'Babysitting',     desc:'CPR certified, background checked, reviewed.',       rate:'Est. $10/hr',    bg:'rgba(220,38,38,0.1)' },
  { num:'04', Icon: LD_Move,   name:'Moving Help',     desc:'Affordable crews, same-day available.',              rate:'Est. $30/hr',    bg:'rgba(5,150,105,0.1)' },
  { num:'05', Icon: LD_Pet,    name:'Pet Care',        desc:'Dog walking, sitting, grooming.',                    rate:'Est. $10/visit', bg:'rgba(16,185,129,0.1)' },
  { num:'06', Icon: LD_Clean,  name:'Cleaning',        desc:'Deep cleaning and regular maintenance.',             rate:'Est. $15/hr',    bg:'rgba(99,102,241,0.1)' },
];

const marqueeItems = ['Roommate Matching','Campus Connect','Community','Marketplace','Events','Find Your People','Messaging','Rewards'];

export default function LandingPage() {
  /* Scroll-reveal: the CSS hides [data-sr]/.sr elements; this reveals them
     as they enter the viewport. Runs as a React effect so it survives
     hydration (the old inline <script> did not execute reliably). */
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-sr], .sr'));
    const reveal = (el: HTMLElement) => { el.classList.add('revealed', 'in-view'); };
    if (!('IntersectionObserver' in window)) { els.forEach(reveal); return; }
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { reveal(e.target as HTMLElement); obs.unobserve(e.target); }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });
    els.forEach(el => obs.observe(el));
    // failsafes: never leave above-the-fold content hidden, and reveal
    // everything once the user reaches the bottom of the page
    const t = setTimeout(() => {
      els.forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight) reveal(el);
      });
    }, 1200);
    const onScroll = () => {
      const doc = document.documentElement;
      if (window.innerHeight + window.scrollY >= doc.scrollHeight - 60) {
        els.forEach(reveal);
        window.removeEventListener('scroll', onScroll);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { clearTimeout(t); obs.disconnect(); window.removeEventListener('scroll', onScroll); };
  }, []);

  return (
    <div style={{ minHeight:'100vh', background:'#EAF3ED', color:'var(--white)' }}>

      {/* ── NAV ── */}
      <nav className="lp-nav" style={{ position:'sticky', top:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 48px', background:'rgba(241,247,243,0.85)', backdropFilter:'blur(16px)', borderBottom:'1px solid var(--border)' }}>
        <Link href="/landing" style={{ display:'flex', alignItems:'center', gap:12, textDecoration:'none' }}>
          <div style={{ width:36, height:36, background:'var(--amber)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Bricolage Grotesque', sans-serif", fontWeight:800, fontSize:18, color:'#ffffff' }}>H</div>
          <span style={{ fontFamily:"'Bricolage Grotesque', sans-serif", fontWeight:800, fontSize:20, color:'var(--white)', letterSpacing:-0.5 }}>Handout</span>
        </Link>
        <div className="lp-nav-links" style={{ display:'flex', alignItems:'center', gap:26 }}>
          <Link href="#available" className="nav-link">Features</Link>
          {!BETA_MODE && <Link href="#services" className="nav-link">Services</Link>}
          {!BETA_MODE && <Link href="#pricing"  className="nav-link">Pricing</Link>}
          <Link href="/explore" className="nav-link">Browse listings</Link>
          <Link href="/auth/login"  className="btn btn-outline btn-sm">Log in</Link>
          <Link href="/auth/signup" className="btn btn-primary btn-sm">Sign up free</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="lp-hero" style={{ minHeight:'100vh', display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:'0 48px 80px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
          <div style={{ position:'absolute', width:700, height:700, background:'radial-gradient(circle,rgba(18,161,80,0.18) 0%,transparent 70%)', top:-80, right:-80, borderRadius:'50%', animation:'float1 8s ease-in-out infinite' }}/>
          <div style={{ position:'absolute', width:500, height:500, background:'radial-gradient(circle,rgba(37,99,235,0.10) 0%,transparent 70%)', bottom:-40, left:120, borderRadius:'50%', animation:'float2 10s ease-in-out infinite' }}/>
          <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.028) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.028) 1px,transparent 1px)', backgroundSize:'80px 80px' }}/>
        </div>

        <div style={{ display:'inline-flex', alignItems:'center', gap:9, marginBottom:24, position:'relative', zIndex:2, background:'#ffffff', border:'1px solid rgba(18,161,80,0.22)', borderRadius:100, padding:'8px 16px', alignSelf:'flex-start' }} className="animate-fade-in delay-1">
          <span style={{ width:8, height:8, background:'var(--amber)', borderRadius:'50%', animation:'blink 2s ease-in-out infinite', display:'block' }}/>
          <span style={{ fontSize:11, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'var(--amber2)', overflow:'hidden', display:'inline-block' }}>
            <span style={{ display:'inline-block', animation:'slideRight 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s both' }}>Handout Beta · Now at Rowan University</span>
          </span>
        </div>

        <h1 style={{ fontFamily:"'Bricolage Grotesque', sans-serif", fontSize:'clamp(52px,7.6vw,120px)', fontWeight:800, lineHeight:0.94, letterSpacing:-3, marginBottom:44, position:'relative', zIndex:2 }}>
          <span style={{ display:'block', overflow:'hidden' }}><span style={{ display:'block', animation:'revealUp 1s cubic-bezier(0.16,1,0.3,1) 0.2s both' }}>Everything a</span></span>
          <span style={{ display:'block', overflow:'hidden' }}><span style={{ display:'block', animation:'revealUp 1s cubic-bezier(0.16,1,0.3,1) 0.32s both', color:'var(--amber)' }}>Student Needs,</span></span>
          <span style={{ display:'block', overflow:'hidden' }}><span style={{ display:'block', animation:'revealUp 1s cubic-bezier(0.16,1,0.3,1) 0.44s both' }}>All in One Place.</span></span>
        </h1>

        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', position:'relative', zIndex:2, gap:24, flexWrap:'wrap' }}>
          <p style={{ maxWidth:460, fontSize:17, color:'var(--light)', lineHeight:1.65, animation:'fadeUpIn 0.9s ease 0.8s both' }}>
            Handout Beta helps students find roommates, meet new people, discover campus events, buy and sell items, and build their campus community.
          </p>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:14, animation:'fadeUpIn 0.9s ease 1s both' }}>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent:'flex-end' }}>
              <Link href="/auth/signup" className="btn btn-primary btn-xl" style={{ gap:10 }}>
                Join Beta →
              </Link>
              <Link href="/explore" className="btn btn-outline btn-xl">
                Browse listings
              </Link>
            </div>
            <Link href="/auth/login" style={{ fontSize:13, color:'var(--muted)', display:'flex', alignItems:'center', gap:6 }}>
              Already have an account? Log in
            </Link>
          </div>
        </div>

        <div style={{ position:'absolute', bottom:40, left:'50%', transform:'translateX(-50%)', display:'flex', flexDirection:'column', alignItems:'center', gap:8, zIndex:2, animation:'fadeUpIn 0.9s ease 1.4s both' }}>
          <span style={{ fontSize:9, letterSpacing:3, textTransform:'uppercase', color:'var(--muted)', fontWeight:600 }}>Scroll</span>
          <div style={{ width:1, height:52, background:'linear-gradient(to bottom,var(--amber),transparent)', animation:'blink 2s ease-in-out infinite' }}/>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div style={{ borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)', padding:'18px 0', overflow:'hidden', background:'#ffffff' }}>
        <div className="marquee-track">
          {[...marqueeItems,...marqueeItems].map((item,i) => (
            <span key={i} className="marquee-item"><span className="marquee-dot">✦</span> {item}</span>
          ))}
        </div>
      </div>

      {/* ── AVAILABLE TODAY / COMING SOON (Beta) ── */}
      <section id="available" className="lp-section" style={{ padding:'96px 48px 40px', maxWidth:1280, margin:'0 auto' }}>
        <div className="section-label"><div className="section-label-line"/><span className="section-label-text">The Beta</span><span className="section-label-num">·</span></div>
        <div className="lp-two-col" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
          {/* Available today */}
          <div data-sr className="ft-card" style={{ padding:'32px 30px' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(18,161,80,0.10)', border:'1px solid rgba(18,161,80,0.22)', borderRadius:100, padding:'5px 13px', marginBottom:18 }}>
              <span style={{ width:7, height:7, background:'var(--amber)', borderRadius:'50%' }}/>
              <span style={{ fontSize:10.5, fontWeight:800, letterSpacing:2, textTransform:'uppercase', color:'#0F8A44' }}>Available Today</span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {[['🏠','Roommate Matching'],['👥','Campus Connect'],['💬','Community'],['🛍','Marketplace'],['🎉','Events'],['🤝','Find Your People'],['✉️','Messaging'],['🏆','Rewards']].map(([e,f]) => (
                <div key={f} style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <span style={{ fontSize:18, width:22, textAlign:'center', flexShrink:0 }}>{e}</span>
                  <span style={{ fontSize:15.5, fontWeight:600, color:'var(--white)' }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
          {/* What's Next */}
          <div data-sr className="ft-card" style={{ padding:'32px 30px' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(124,107,209,0.10)', border:'1px solid rgba(124,107,209,0.22)', borderRadius:100, padding:'5px 13px', marginBottom:18 }}>
              <span style={{ fontSize:10.5, fontWeight:800, letterSpacing:2, textTransform:'uppercase', color:'#7C6BD1' }}>What&apos;s Next</span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {[['🍱','Homemade Food'],['🚗','Airport Pickup'],['💼','Student Jobs'],['🧹','Student Services'],['🎓','Tutoring'],['✨','More Features']].map(([e,f]) => (
                <div key={f} style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <span style={{ fontSize:18, width:22, textAlign:'center', flexShrink:0 }}>{e}</span>
                  <span style={{ fontSize:15.5, fontWeight:600, color:'var(--muted)' }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── INTRO ── */}
      <section className="lp-section" style={{ padding:'56px 48px 80px', maxWidth:1280, margin:'0 auto' }}>
        <div className="section-label">
          <div className="section-label-line"/><span className="section-label-text">About</span><span className="section-label-num">01</span>
        </div>
        <p data-sr style={{ fontFamily:"'Bricolage Grotesque', sans-serif", fontSize:'clamp(32px,4.5vw,62px)', fontWeight:500, lineHeight:1.12, letterSpacing:-2, maxWidth:960 }}>
          We built Handout because being a student far from home is{' '}
          <em style={{ fontStyle:'italic', fontWeight:300, color:'var(--amber)' }}>harder than it should be</em>{' '}
          — finding a roommate, meeting people, and building your campus community shouldn&apos;t take weeks of googling.
        </p>
        <LiveStats />
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="lp-section" style={{ padding:'60px 48px 100px', maxWidth:1280, margin:'0 auto' }}>
        <div className="section-label"><div className="section-label-line"/><span className="section-label-text">Features</span><span className="section-label-num">02</span></div>
        <div className="lp-grid-3" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
          {features.map((f,i) => (
            <div key={i} className={`bento-card sr ${f.delay}`} data-sr style={{ minHeight:220 }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:8, marginBottom:14 }}>
                <span style={{ display:'inline-flex', color:'var(--amber)' }}><f.Icon /></span>
                <div className="pill pill-amber">{f.tag}</div>
              </div>
              <div style={{ fontFamily:"'Bricolage Grotesque', sans-serif", fontSize:22, fontWeight:800, letterSpacing:-0.5, marginBottom:10, color:'var(--white)' }}>{f.title}</div>
              <div style={{ fontSize:14, color:'var(--light)', lineHeight:1.65 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CAMPUS CONNECT ── */}
      <section className="lp-section" style={{ padding:'0 48px 100px', maxWidth:1280, margin:'0 auto' }}>
        <div className="lp-two-col" style={{ background:'linear-gradient(135deg,rgba(124,107,209,0.07) 0%,rgba(18,161,80,0.05) 100%)', border:'1px solid rgba(124,107,209,0.2)', borderRadius:28, padding:'52px 48px', display:'grid', gridTemplateColumns:'1fr auto', gap:48, alignItems:'center', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', width:400, height:400, background:'radial-gradient(circle,rgba(124,107,209,0.08) 0%,transparent 70%)', top:-100, right:200, borderRadius:'50%', pointerEvents:'none' }}/>
          <div style={{ position:'relative' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(124,107,209,0.1)', border:'1px solid rgba(124,107,209,0.25)', borderRadius:100, padding:'5px 14px', marginBottom:22 }}>
              <span style={{ display:'inline-flex', color:'#7C6BD1' }}><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></span>
              <span style={{ fontSize:10, fontWeight:800, letterSpacing:2, textTransform:'uppercase', color:'#7C6BD1' }}>Beta · Free</span>
            </div>
            <h2 style={{ fontFamily:"'Bricolage Grotesque', sans-serif", fontSize:'clamp(36px,4vw,56px)', fontWeight:800, letterSpacing:-2, lineHeight:1, marginBottom:16, color:'var(--white)' }}>
              Campus Connect
            </h2>
            <p style={{ fontSize:16, color:'var(--muted)', lineHeight:1.7, marginBottom:28, maxWidth:480 }}>
              University-locked dating built just for your campus. Swipe through verified Rowan students, match, and message — in a safe, private space only you can access.
            </p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:32 }}>
              {['Rowan students only','See who liked you','3 profile photos','Message matches','Interest matching'].map(tag => (
                <span key={tag} style={{ fontSize:13, padding:'6px 14px', borderRadius:100, background:'rgba(124,107,209,0.08)', border:'1px solid rgba(124,107,209,0.15)', color:'#7C6BD1' }}>{tag}</span>
              ))}
            </div>
            <Link href="/auth/signup" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'13px 28px', borderRadius:12, fontSize:15, fontWeight:800, color:'#ffffff', background:'linear-gradient(135deg,#7C6BD1,#12A150)', textDecoration:'none' }}>
              Get Campus Connect →
            </Link>
            <span style={{ display:'inline-block', marginLeft:16, fontSize:13, color:'var(--muted)' }}>Free during Beta</span>
          </div>
          {/* Mock card */}
          <div style={{ background:'var(--navy2)', border:'1px solid rgba(124,107,209,0.15)', borderRadius:22, padding:'0 0 20px', overflow:'hidden', width:220, flexShrink:0, boxShadow:'0 24px 54px rgba(18,36,28,0.16)' }}>
            <div style={{ height:160, background:'linear-gradient(160deg,#7C6BD1,#5A4BB8)', display:'flex', alignItems:'center', justifyContent:'center' }}><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
            <div style={{ padding:'14px 16px 0' }}>
              <div style={{ fontWeight:800, fontSize:16, color:'var(--white)', marginBottom:3 }}>Ananya, 21</div>
              <div style={{ fontSize:12, color:'var(--muted)', marginBottom:10 }}>Business · Sophomore</div>
              <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:14 }}>
                {['Music','Coffee'].map(t=><span key={t} style={{ fontSize:10, padding:'3px 8px', borderRadius:100, background:'rgba(124,107,209,0.1)', color:'#7C6BD1', border:'1px solid rgba(124,107,209,0.15)' }}>{t}</span>)}
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button style={{ flex:1, height:38, borderRadius:10, background:'transparent', border:'1px solid rgba(194,91,78,0.35)', color:'#C25B4E', cursor:'pointer', display:'inline-flex', alignItems:'center', justifyContent:'center' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                <button style={{ flex:1, height:38, borderRadius:10, background:'linear-gradient(135deg,#7C6BD1,#12A150)', border:'none', color:'#ffffff', cursor:'pointer', display:'inline-flex', alignItems:'center', justifyContent:'center' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="#ffffff" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── (future paid services — hidden during free Beta) */}
      {!BETA_MODE && (
      <section id="services" style={{ padding:'60px 0 100px', overflow:'hidden' }}>
        <div style={{ padding:'0 48px', maxWidth:1280, margin:'0 auto', marginBottom:52 }}>
          <div className="section-label"><div className="section-label-line"/><span className="section-label-text">Services</span><span className="section-label-num">03</span></div>
          <h2 data-sr style={{ fontFamily:"'Bricolage Grotesque', sans-serif", fontSize:'clamp(52px,7vw,96px)', fontWeight:800, letterSpacing:-3, lineHeight:0.95 }}>
            Everything<br/><em style={{ fontStyle:'italic', fontWeight:300, color:'var(--amber)' }}>verified.</em>
          </h2>
        </div>
        <div style={{ display:'flex', gap:16, padding:'0 48px', overflowX:'auto', scrollSnapType:'x mandatory', scrollbarWidth:'none', cursor:'grab' }}>
          {services.map(s => (
            <div key={s.num} style={{ flexShrink:0, scrollSnapAlign:'start', background:'var(--navy2)', border:'1px solid var(--border)', borderRadius:20, padding:28, width:270, transition:'border-color 0.3s, transform 0.3s', cursor:'pointer' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor='rgba(18,161,80,0.35)'; (e.currentTarget as HTMLElement).style.transform='translateY(-4px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor='var(--border)'; (e.currentTarget as HTMLElement).style.transform=''; }}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:1.5, color:'var(--muted)', marginBottom:20 }}>{s.num}</div>
              <div style={{ width:50, height:50, borderRadius:12, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16, color:'var(--amber)' }}><s.Icon /></div>
              <div style={{ fontFamily:"'Bricolage Grotesque', sans-serif", fontSize:22, fontWeight:800, letterSpacing:-0.5, color:'var(--white)', marginBottom:8 }}>{s.name}</div>
              <div style={{ fontSize:13, color:'var(--muted)', lineHeight:1.6, marginBottom:16 }}>{s.desc}</div>
              <div style={{ fontSize:14, fontWeight:600, color:'var(--amber)' }}>{s.rate}</div>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'16px 48px', fontSize:12, color:'var(--muted)', fontWeight:500 }}>
          <span style={{ fontSize:18, animation:'slideRight 1.5s ease-in-out infinite' }}>→</span>
          Drag to explore all services
        </div>
      </section>
      )}

      {/* ── HOW IT WORKS ── */}
      <section className="lp-section" style={{ padding:'80px 48px 100px', maxWidth:1280, margin:'0 auto', borderTop:'1px solid var(--border)' }}>
        <div className="section-label"><div className="section-label-line"/><span className="section-label-text">How it works</span><span className="section-label-num">04</span></div>
        <div className="lp-two-col" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:80, alignItems:'center' }}>
          <div>
            <h2 data-sr style={{ fontFamily:"'Bricolage Grotesque', sans-serif", fontSize:'clamp(44px,5.5vw,74px)', fontWeight:800, letterSpacing:-3, lineHeight:0.95, marginBottom:28 }}>
              Up and running <em style={{ fontStyle:'italic', fontWeight:300, color:'var(--amber)' }}>in minutes.</em>
            </h2>
            <p style={{ fontSize:17, color:'var(--light)', lineHeight:1.65, marginBottom:44 }}>No complicated setup. No fees upfront. Just sign up with your university email and start connecting.</p>
            {[
              { n:'01', title:'Create your account', desc:'Sign up free with your university email. Takes under 2 minutes.' },
              { n:'02', title:'Set your preferences', desc:'Tell us your lifestyle, budget, city, and what you need.' },
              { n:'03', title:'Start connecting', desc:'Get matched, join the community, buy & sell, and meet your people — all free.' },
            ].map((step,i) => (
              <div key={i} data-sr className={`sr sr-left d${i+1}`} style={{ display:'flex', gap:20, padding:'28px 0', borderBottom:'1px solid var(--border)' }}>
                <span style={{ fontFamily:"'Bricolage Grotesque', sans-serif", fontSize:13, fontWeight:700, color:'var(--amber)', width:28, flexShrink:0, marginTop:3 }}>{step.n}</span>
                <div>
                  <div style={{ fontFamily:"'Bricolage Grotesque', sans-serif", fontSize:20, fontWeight:700, letterSpacing:-0.5, color:'var(--white)', marginBottom:6 }}>{step.title}</div>
                  <div style={{ fontSize:14, color:'var(--muted)', lineHeight:1.6 }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div data-sr="scale" style={{ background:'var(--navy2)', border:'1px solid var(--border)', borderRadius:36, padding:'28px 22px', maxWidth:300, margin:'0 auto', boxShadow:'0 34px 80px rgba(18,36,28,0.14)' }}>
            <div style={{ width:80, height:20, background:'var(--navy)', borderRadius:10, margin:'0 auto 20px' }}/>
            <div style={{ fontFamily:"'Bricolage Grotesque', sans-serif", fontSize:19, fontWeight:800, letterSpacing:-0.5, marginBottom:4 }}>Your Matches</div>
            <div style={{ fontSize:12, color:'var(--muted)', marginBottom:18 }}>3 new · 94% avg compat.</div>
            {[
              { ini:'SM', bg:'#12A150', fg:'#ffffff', name:'Sonal M.', uni:'UIC · CS', pct:94 },
              { ini:'LN', bg:'#7C3AED', fg:'#fff',    name:'Lin N.',   uni:'DePaul', pct:88 },
              { ini:'AP', bg:'#12A150', fg:'#fff',    name:'Aarav P.', uni:'NWU Eng', pct:82 },
            ].map((m,i) => (
              <div key={i} style={{ background:'rgba(18,36,28,0.04)', border:'1px solid rgba(18,36,28,0.07)', borderRadius:14, padding:14, marginBottom:10, display:'flex', alignItems:'center', gap:12, opacity:1-i*0.2 }}>
                <div style={{ width:38, height:38, borderRadius:'50%', background:m.bg, color:m.fg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, flexShrink:0 }}>{m.ini}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'var(--white)', marginBottom:2 }}>{m.name}</div>
                  <div style={{ fontSize:11, color:'var(--muted)', marginBottom:6 }}>{m.uni}</div>
                  <div style={{ height:3, background:'rgba(18,36,28,0.09)', borderRadius:2, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${m.pct}%`, background:'linear-gradient(90deg,var(--amber),var(--amber2))', borderRadius:2 }}/>
                  </div>
                </div>
                <div style={{ fontFamily:"'Bricolage Grotesque', sans-serif", fontSize:16, fontWeight:800, color:'var(--amber)' }}>{m.pct}%</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="lp-section" style={{ padding:'80px 48px 100px', maxWidth:1280, margin:'0 auto', borderTop:'1px solid var(--border)' }}>
        <div className="section-label"><div className="section-label-line"/><span className="section-label-text">Testimonials</span><span className="section-label-num">05</span></div>
        <h2 data-sr style={{ fontFamily:"'Bricolage Grotesque', sans-serif", fontSize:'clamp(48px,6vw,80px)', fontWeight:800, letterSpacing:-3, lineHeight:1, marginBottom:52 }}>
          Students <em style={{ fontStyle:'italic', fontWeight:300, color:'var(--amber)' }}>love</em> Handout.
        </h2>
        <div className="lp-grid-3" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
          {testimonials.map((t,i) => (
            <div key={i} data-sr className={`sr d${i+1}`} style={{ background:'var(--navy2)', border:'1px solid var(--border)', borderRadius:20, padding:36, transition:'border-color 0.3s' }}
              onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor='rgba(18,161,80,0.25)'}
              onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor='var(--border)'}>
              <div style={{ display:'flex', gap:3, marginBottom:18 }}>{[1,2,3,4,5].map(n=><span key={n} style={{ display:'inline-flex', color:'var(--amber)' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></span>)}</div>
              <p style={{ fontFamily:"'Bricolage Grotesque', sans-serif", fontSize:18, fontWeight:500, lineHeight:1.5, color:'var(--white)', marginBottom:24, fontStyle:'italic' }}>{t.quote}</p>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:'50%', background:t.bg, color:t.fg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700 }}>{t.initials}</div>
                <div>
                  <div style={{ fontSize:14, fontWeight:600, color:'var(--white)' }}>{t.name}</div>
                  <div style={{ fontSize:12, color:'var(--muted)' }}>{t.uni}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── (subscription tiers — hidden during free Beta) */}
      {!BETA_MODE && (
      <section id="pricing" className="lp-section" style={{ padding:'80px 48px 100px', maxWidth:1280, margin:'0 auto', borderTop:'1px solid var(--border)' }}>
        <div className="section-label"><div className="section-label-line"/><span className="section-label-text">Pricing</span><span className="section-label-num">06</span></div>
        <h2 data-sr style={{ fontFamily:"'Bricolage Grotesque', sans-serif", fontSize:'clamp(48px,6vw,80px)', fontWeight:800, letterSpacing:-3, lineHeight:0.95, marginBottom:24 }}>
          Simple, <em style={{ fontStyle:'italic', fontWeight:300, color:'var(--amber)' }}>transparent</em><br/>pricing.
        </h2>
        <div data-sr style={{ display:'inline-flex', alignItems:'center', gap:10, background:'rgba(18,161,80,0.08)', border:'1px solid rgba(18,161,80,0.22)', borderRadius:100, padding:'10px 20px', marginBottom:44, fontSize:14, fontWeight:700, color:'#0F8A44' }}>
          <span style={{ fontSize:16 }}>🎉</span> Everything is 100% free during Beta — paid plans arrive in a future release.
        </div>
        <div className="lp-grid-3" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
          {[
            { name:'Free', price:'$0', period:'forever', features:['5 roommate matches/month','Browse all food providers','Browse service listings','3 messages per day','Basic community access'], cta:'Get started', featured:false },
            { name:'Plus', price:'$9', period:'/month',  features:['Unlimited roommate matches','Priority booking','Unlimited messages','Full community features','Verified badge on profile','Campus Connect dating'], cta:'Upgrade to Plus', featured:true, badge:'Most Popular' },
            { name:'Pro',  price:'$19',period:'/month',  features:['Everything in Plus','Campus Connect dating','Group housing coordination','Bulk food order discounts','Dedicated support','Early access to features'], cta:'Upgrade to Pro', featured:false },
          ].map((plan,i) => (
            <div key={i} data-sr className={`sr d${i+1}`} style={{ border:`2px solid ${plan.featured ? 'var(--amber)' : 'var(--border)'}`, borderRadius:24, padding:44, background:plan.featured ? 'var(--amber)' : 'transparent', position:'relative', transition:'transform 0.3s' }}
              onMouseEnter={e=>!(plan.featured) && ((e.currentTarget as HTMLElement).style.transform='translateY(-4px)')}
              onMouseLeave={e=>!(plan.featured) && ((e.currentTarget as HTMLElement).style.transform='')}>
              {plan.badge && <div style={{ position:'absolute', top:-14, left:'50%', transform:'translateX(-50%)', background:'#12241C', color:'#7fe0a6', fontSize:10, fontWeight:800, letterSpacing:2, textTransform:'uppercase', padding:'6px 16px', borderRadius:100 }}>{plan.badge}</div>}
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:3, textTransform:'uppercase', color:plan.featured?'rgba(255,255,255,0.75)':'var(--muted)', marginBottom:20 }}>{plan.name}</div>
              <div style={{ fontFamily:"'Bricolage Grotesque', sans-serif", fontSize:60, fontWeight:800, letterSpacing:-3, lineHeight:1, color:plan.featured?'#ffffff':'var(--white)', marginBottom:6 }}>{plan.price}</div>
              <div style={{ fontSize:13, color:plan.featured?'rgba(255,255,255,0.8)':'var(--muted)', marginBottom:28 }}>{plan.period}</div>
              <div style={{ height:1, background:plan.featured?'rgba(255,255,255,0.22)':'var(--border)', marginBottom:24 }}/>
              {plan.features.map(f => (
                <div key={f} style={{ display:'flex', gap:10, marginBottom:12, fontSize:14, color:plan.featured?'rgba(255,255,255,0.92)':'var(--light)', alignItems:'flex-start' }}>
                  <span style={{ width:6, height:6, background:plan.featured?'#ffffff':'var(--amber)', borderRadius:'50%', flexShrink:0, marginTop:5 }}/>
                  {f}
                </div>
              ))}
              <Link href={plan.price === '$0' ? '/auth/signup' : '/coming-soon?feature=premium'} style={{ display:'block', textAlign:'center', padding:'16px', borderRadius:14, fontSize:14, fontWeight:700, marginTop:32, background:plan.featured?'#ffffff':'transparent', color:plan.featured?'var(--amber)':'var(--light)', border:plan.featured?'none':'1px solid var(--border)', textDecoration:'none', transition:'all 0.2s' }}>{plan.price === '$0' ? 'Join Beta free' : 'Coming after Beta'}</Link>
            </div>
          ))}
        </div>
      </section>
      )}

      {/* ── CTA ── */}
      <section style={{ padding:'100px 48px', textAlign:'center', position:'relative', overflow:'hidden', borderTop:'1px solid var(--border)' }}>
        <div style={{ position:'absolute', width:600, height:600, background:'radial-gradient(circle,rgba(18,161,80,0.08) 0%,transparent 70%)', top:'50%', left:'50%', transform:'translate(-50%,-50%)', borderRadius:'50%', pointerEvents:'none' }}/>
        <h2 data-sr style={{ fontFamily:"'Bricolage Grotesque', sans-serif", fontSize:'clamp(60px,9vw,130px)', fontWeight:800, letterSpacing:-4, lineHeight:0.92, position:'relative' }}>
          Ready to feel<br/><em style={{ fontStyle:'italic', fontWeight:300, color:'var(--amber)' }}>at home?</em>
        </h2>
        <p data-sr className="sr d1" style={{ fontSize:18, color:'var(--muted)', margin:'28px 0 40px' }}>Join students who already found their community on Handout.</p>
        <div data-sr className="sr d2" style={{ display:'flex', justifyContent:'center', gap:16 }}>
          <Link href="/auth/signup" className="btn btn-primary btn-xl">Create free account →</Link>
        </div>
        <div data-sr className="sr d3" style={{ marginTop:32, display:'flex', justifyContent:'center' }}>
          <span style={{ display:'inline-flex', alignItems:'center', gap:10, background:'var(--navy3)', border:'1px solid rgba(18,161,80,0.22)', borderRadius:100, padding:'10px 20px', fontSize:13, fontWeight:700, color:'#0F8A44' }}>Proudly serving Rowan University · Glassboro, NJ</span>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop:'1px solid var(--border)', padding:'36px 48px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:28 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:30, height:30, background:'var(--amber)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:800, fontSize:15, color:'#ffffff' }}>H</div>
            <span style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:700, fontSize:17, color:'var(--white)', letterSpacing:-0.3 }}>Handout</span>
          </div>
          <span style={{ fontSize:13, color:'var(--muted)' }}>© 2026 Handout Inc.</span>
          <BetaBadge compact />
          {[{ l:'Terms', h:'/legal/terms' },{ l:'Privacy', h:'/legal/privacy' },{ l:'Safety', h:'/legal/safety' },{ l:'Contact', h:'/contact' }].map(x=><Link key={x.l} href={x.h} style={{ fontSize:13, color:'var(--muted)', transition:'color 0.2s', textDecoration:'none' }}>{x.l}</Link>)}
        </div>
        <a href="mailto:handout.corp@gmail.com" style={{ fontSize:13, color:'var(--muted)', textDecoration:'none' }}>handout.corp@gmail.com</a>
      </footer>

    </div>
  );
}

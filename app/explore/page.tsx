'use client';

// PUBLIC preview — no login required to BROWSE. Logged-out visitors see real
// roommate + marketplace listings (anon-readable via RLS), and every ACTION
// (message / connect / view contact) routes them to sign up. This is the
// "show value before the wall" conversion page: people see the app is alive,
// then create an account to actually reach someone.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const SIGNUP = '/auth/signup';

const BoxIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
const HomeIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const LockIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;

type Room = { id:string; title:string; location:string; rent:number; rent_min:number; rent_max:number; listing_type:string; room_type:string; media:any; university:string };
type Item = { id:string; title:string; price:number; category:string; media:string[]; description:string };

function firstPhoto(media: any): string {
  if (!media) return '';
  if (Array.isArray(media)) {
    const m = media[0];
    if (!m) return '';
    return typeof m === 'string' ? m : (m.url || '');
  }
  return '';
}

export default function ExplorePage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const sb = createClient();
      const [{ data: r }, { data: m }] = await Promise.all([
        sb.from('roommate_listings').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(8),
        sb.from('market_listings').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(8),
      ]);
      setRooms((r || []) as Room[]);
      setItems((m || []) as Item[]);
      setLoading(false);
    })();
  }, []);

  const total = rooms.length + items.length;

  return (
    <div style={{ minHeight:'100vh', background:'#F1F7F3', color:'#12241C' }}>
      {/* Top bar */}
      <header style={{ position:'sticky', top:0, zIndex:20, background:'rgba(241,247,243,0.9)', backdropFilter:'blur(10px)', borderBottom:'1px solid rgba(18,36,28,0.08)', padding:'14px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Link href="/landing" style={{ display:'flex', alignItems:'center', gap:9, textDecoration:'none' }}>
          <div style={{ width:32, height:32, background:'#12A150', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:800, fontSize:16, color:'#fff' }}>H</div>
          <span style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:700, fontSize:18, color:'#12241C' }}>Handout</span>
        </Link>
        <div style={{ display:'flex', gap:8 }}>
          <Link href="/auth/login" className="ft-btn ft-btn-o" style={{ padding:'8px 14px', fontSize:13 }}>Log in</Link>
          <Link href={SIGNUP} className="ft-btn ft-btn-p" style={{ padding:'8px 16px', fontSize:13 }}>Sign up free</Link>
        </div>
      </header>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'32px 20px 120px' }}>
        {/* Hero */}
        <div style={{ marginBottom:28 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:'rgba(18,161,80,0.1)', border:'1px solid rgba(18,161,80,0.22)', borderRadius:100, padding:'5px 12px', fontSize:12, fontWeight:700, color:'#0F8A44', marginBottom:14 }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:'#12A150', display:'inline-block' }} /> Live on campus right now
          </div>
          <h1 className="ft-num" style={{ fontSize:'clamp(28px,5vw,40px)', letterSpacing:-1, margin:'0 0 8px', color:'#12241C' }}>
            See what students are posting
          </h1>
          <p style={{ fontSize:15, color:'#4c6157', maxWidth:560, lineHeight:1.55, margin:0 }}>
            Real rooms, roommates and marketplace deals from students on your campus. Browse free — <strong style={{ color:'#12241C' }}>sign up to message anyone.</strong>
          </p>
        </div>

        {loading ? (
          <p style={{ color:'#7D9188', fontSize:14 }}>Loading listings…</p>
        ) : total === 0 ? (
          <div style={{ background:'#fff', border:'1px solid rgba(18,36,28,0.09)', borderRadius:18, padding:'48px 24px', textAlign:'center' }}>
            <p style={{ fontSize:15, fontWeight:700, color:'#12241C', margin:'0 0 6px' }}>Be the first to post</p>
            <p style={{ fontSize:13.5, color:'#7D9188', margin:'0 0 18px' }}>New listings show up here the moment students post them.</p>
            <Link href={SIGNUP} className="ft-btn ft-btn-p" style={{ padding:'10px 20px' }}>Sign up & post free</Link>
          </div>
        ) : (
          <>
            {/* Rooms & roommates */}
            {rooms.length > 0 && (
              <Section title="Rooms & roommates" icon={<HomeIcon />}>
                {rooms.map(r => {
                  const img = firstPhoto(r.media);
                  const price = r.listing_type === 'need'
                    ? (r.rent_min || r.rent_max ? `$${r.rent_min || 0}–${r.rent_max || r.rent_min || 0}` : 'Budget flexible')
                    : (r.rent != null ? `$${Number(r.rent).toFixed(0)}/mo` : '—');
                  return (
                    <PreviewCard key={r.id} img={img} title={r.title || 'Roommate listing'} price={price}
                      sub={[r.location, r.room_type].filter(Boolean).join(' · ') || r.university || 'On campus'} action="Message" />
                  );
                })}
              </Section>
            )}

            {/* Marketplace */}
            {items.length > 0 && (
              <Section title="Marketplace" icon={<BoxIcon />}>
                {items.map(it => (
                  <PreviewCard key={it.id} img={firstPhoto(it.media)} title={it.title} price={it.price != null ? `$${Number(it.price).toFixed(0)}` : '—'}
                    sub={it.category || 'Item'} action="Message seller" />
                ))}
              </Section>
            )}
          </>
        )}
      </div>

      {/* Sticky sign-up bar */}
      <div style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:30, background:'#12241C', color:'#fff', padding:'14px 20px', display:'flex', alignItems:'center', justifyContent:'center', gap:16, flexWrap:'wrap' }}>
        <span style={{ fontSize:14, fontWeight:600 }}>Like what you see? Join free and start connecting.</span>
        <Link href={SIGNUP} className="ft-btn" style={{ background:'#12A150', color:'#fff', padding:'9px 20px', fontSize:14, fontWeight:700 }}>Sign up free →</Link>
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title:string; icon:React.ReactNode; children:React.ReactNode }) {
  return (
    <section style={{ marginBottom:34 }}>
      <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:14 }}>
        <span style={{ color:'#12A150', display:'inline-flex' }}>{icon}</span>
        <h2 className="ft-num" style={{ fontSize:20, color:'#12241C', margin:0 }}>{title}</h2>
      </div>
      <div className="rg-3" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>{children}</div>
    </section>
  );
}

// A card that shows the listing but sends every click to sign-up.
function PreviewCard({ img, title, price, sub, action }: { img:string; title:string; price:string; sub:string; action:string }) {
  return (
    <Link href={SIGNUP} className="ft-card" style={{ overflow:'hidden', display:'flex', flexDirection:'column', textDecoration:'none', color:'inherit' }}>
      <div style={{ height:150, background:'#E6EFE9', position:'relative', flexShrink:0 }}>
        {img
          ? <img src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#B7C6BD' }}><BoxIcon /></div>}
      </div>
      <div style={{ padding:14, display:'flex', flexDirection:'column', gap:7, flex:1 }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8 }}>
          <span style={{ fontSize:14, fontWeight:700, color:'#12241C', lineHeight:1.3 }}>{title}</span>
          <span className="ft-num" style={{ fontSize:14, color:'#12A150', flexShrink:0 }}>{price}</span>
        </div>
        <span style={{ fontSize:12.5, color:'#7D9188', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{sub}</span>
        <div style={{ marginTop:'auto', display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'9px 0', borderRadius:10, background:'rgba(18,161,80,0.08)', border:'1px solid rgba(18,161,80,0.2)', color:'#0F8A44', fontSize:13, fontWeight:700 }}>
          <LockIcon /> {action}
        </div>
      </div>
    </Link>
  );
}

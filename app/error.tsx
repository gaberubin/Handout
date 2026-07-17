'use client';
import { useEffect } from 'react';
import { RevealText } from '@/components/motion/RevealText';

const Err_WarnIcon = () => <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div style={{ minHeight:'100vh', background:'var(--navy)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ textAlign:'center', maxWidth:480 }}>
        <div style={{ display:'inline-flex', marginBottom:16, color:'var(--amber)' }}><Err_WarnIcon /></div>
        <RevealText as="h1" style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:36, fontWeight:800, letterSpacing:-1.5, color:'var(--white)', marginBottom:12 } as any}>Something went wrong.</RevealText>
        <p style={{ fontSize:14, color:'var(--muted)', marginBottom:8, fontFamily:'monospace', background:'rgba(18,36,28,0.04)', padding:'10px 14px', borderRadius:10 }}>{error.message}</p>
        <div style={{ display:'flex', gap:12, justifyContent:'center', marginTop:24 }}>
          <button onClick={reset} className="btn btn-primary btn-lg">Try again</button>
          <a href="/student/dashboard" className="btn btn-dark btn-lg">Go home</a>
        </div>
      </div>
    </div>
  );
}

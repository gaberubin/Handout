import Link from 'next/link';
import { RevealText } from '@/components/motion/RevealText';
import { ScrollReveal } from '@/components/motion/ScrollReveal';

export default function NotFound() {
  return (
    <div style={{ minHeight:'100vh', background:'var(--navy)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ textAlign:'center', maxWidth:480 }}>
        <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:'clamp(80px,15vw,160px)', fontWeight:800, letterSpacing:-6, color:'var(--navy2)', lineHeight:1, marginBottom:8, userSelect:'none' }}>404</div>
        <RevealText as="h1" style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:'clamp(28px,4vw,48px)', fontWeight:800, letterSpacing:-2, color:'var(--white)', marginBottom:16 } as any}>
          Page not found.
        </RevealText>
        <ScrollReveal delay={200}><p style={{ fontSize:16, color:'var(--muted)', lineHeight:1.65, marginBottom:36 }}>Looks like this page moved out without leaving a forwarding address.</p></ScrollReveal>
        <ScrollReveal delay={300} style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          <Link href="/student/dashboard" className="btn btn-primary btn-lg">← Dashboard</Link>
          <Link href="/landing" className="btn btn-dark btn-lg">Homepage</Link>
        </ScrollReveal>
      </div>
    </div>
  );
}

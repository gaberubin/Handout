export default function Loading() {
  return (
    <div style={{ minHeight:'100vh', background:'var(--navy)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
        <div style={{ width:48, height:48, background:'var(--amber)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:800, fontSize:24, color:'var(--navy)', animation:'spinSlow 1.5s ease-in-out infinite' }}>H</div>
        <div style={{ fontSize:13, color:'var(--muted)', fontWeight:500, letterSpacing:1 }}>Loading…</div>
      </div>
    </div>
  );
}

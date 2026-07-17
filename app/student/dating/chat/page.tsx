'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { StudentLayout } from '@/components/layout/StudentLayout';

const DC_HeartIcon = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const DC_HeartBig  = () => <svg width="44" height="44" viewBox="0 0 24 24" fill="var(--amber)" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const DC_BrokenHeart = () => <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;

/* ── types ── */
interface MatchProfile {
  user_id: string;
  display_name: string;
  age: number;
  gender: string;
  photo_url: string;
  photos: string[];
  university: string;
  major: string;
  bio: string;
  lastMsg?: string;
  lastMsgTime?: string;
  unread?: number;
}
interface Msg {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

function allPhotos(p: Partial<MatchProfile>): string[] {
  const arr: string[] = [];
  if (p.photo_url) arr.push(p.photo_url);
  if (p.photos) p.photos.forEach(u => { if (u && !arr.includes(u)) arr.push(u); });
  return arr;
}

function Avi({ p, size = 48 }: { p: MatchProfile; size?: number }) {
  const photo = allPhotos(p)[0];
  if (photo) return <img src={photo} alt={p.display_name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />;
  const col = ['#C25B4E','#7C6BD1','#2563EB','#2E7D5B','#E08A1E'];
  const bg  = col[(p.display_name?.charCodeAt(0) || 0) % col.length];
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
      {p.display_name?.[0]?.toUpperCase() || '?'}
    </div>
  );
}

function fmtTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffH = diffMs / 3600000;
  if (diffH < 24) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffH < 48) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

/* ════════════════════════════════════════════════════════════════════ */
export default function DatingChatPage() {
  const router      = useRouter();
  const params      = useSearchParams();
  const toParam     = params.get('to');

  const [meId,     setMeId]     = useState('');
  const [matches,  setMatches]  = useState<MatchProfile[]>([]);
  const [active,   setActive]   = useState<MatchProfile | null>(null);
  const [msgs,     setMsgs]     = useState<Msg[]>([]);
  const [text,     setText]     = useState('');
  const [sending,  setSending]  = useState(false);
  const [loading,  setLoading]  = useState(true);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLTextAreaElement>(null);

  /* ── 1. Auth + load matches ── */
  useEffect(() => {
    (async () => {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }
      setMeId(user.id);

      // Mutual matches: I liked them AND they liked me
      const [{ data: iLiked }, { data: likedMe }] = await Promise.all([
        sb.from('dating_likes').select('liked_id').eq('liker_id', user.id),
        sb.from('dating_likes').select('liker_id').eq('liked_id', user.id),
      ]);
      const iLikedSet  = new Set((iLiked  || []).map((r: any) => r.liked_id));
      const likedMeSet = new Set((likedMe || []).map((r: any) => r.liker_id));
      const mutualIds  = [...iLikedSet].filter(id => likedMeSet.has(id));

      if (!mutualIds.length) { setLoading(false); return; }

      // Load dating profiles for matches
      const { data: profiles } = await sb.from('dating_profiles').select('*').in('user_id', mutualIds);

      // Load last message for each match
      const msgPreviews: Record<string, { content: string; created_at: string }> = {};
      await Promise.all(mutualIds.map(async (pid) => {
        const { data: m } = await sb.from('messages')
          .select('content, created_at')
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${pid}),and(sender_id.eq.${pid},receiver_id.eq.${user.id})`)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (m) msgPreviews[pid] = m;
      }));

      const built: MatchProfile[] = (profiles || []).map((p: any) => ({
        ...p,
        lastMsg:     msgPreviews[p.user_id]?.content,
        lastMsgTime: msgPreviews[p.user_id]?.created_at,
      })).sort((a, b) => {
        if (a.lastMsgTime && b.lastMsgTime) return new Date(b.lastMsgTime).getTime() - new Date(a.lastMsgTime).getTime();
        if (a.lastMsgTime) return -1;
        if (b.lastMsgTime) return 1;
        return 0;
      });

      setMatches(built);

      // Auto-select from URL param or first match
      const target = toParam ? built.find(m => m.user_id === toParam) : built[0];
      if (target) { setActive(target); setMobileShowChat(true); }
      setLoading(false);
    })();
  }, []);

  /* ── 2. Load + subscribe messages for active match ── */
  useEffect(() => {
    if (!meId || !active) return;
    const sb = createClient();
    setMsgs([]);

    const load = async () => {
      const { data } = await sb.from('messages')
        .select('*')
        .or(`and(sender_id.eq.${meId},receiver_id.eq.${active.user_id}),and(sender_id.eq.${active.user_id},receiver_id.eq.${meId})`)
        .order('created_at', { ascending: true });
      setMsgs(data || []);
    };
    load();

    const sub = sb.channel(`dating_chat_${meId}_${active.user_id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        const m = payload.new as Msg;
        const relevant = (m.sender_id === meId && m.receiver_id === active.user_id) ||
                         (m.sender_id === active.user_id && m.receiver_id === meId);
        if (relevant) setMsgs(prev => [...prev, m]);
      })
      .subscribe();

    return () => { sb.removeChannel(sub); };
  }, [meId, active]);

  /* ── 3. Scroll to bottom on new messages ── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  /* ── 4. Send ── */
  const send = async () => {
    const t = text.trim();
    if (!t || !active || sending) return;
    setSending(true);
    setText('');
    const sb = createClient();
    await sb.from('messages').insert({ sender_id: meId, receiver_id: active.user_id, content: t });
    // Update last msg preview
    setMatches(prev => prev.map(m => m.user_id === active.user_id ? { ...m, lastMsg: t, lastMsgTime: new Date().toISOString() } : m));
    setSending(false);
    inputRef.current?.focus();
  };

  const selectMatch = (m: MatchProfile) => {
    setActive(m);
    setMobileShowChat(true);
  };

  /* ── Render ── */
  const ACCENT = '#FF6B9D';
  const PURPLE = '#C084FC';

  if (loading) return (
    <StudentLayout title="Campus Connect — Messages">
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--muted)', fontSize:14 }}>Loading your matches…</div>
    </StudentLayout>
  );

  return (
    <StudentLayout title="Campus Connect — Messages" noPad>
      <div style={{ display:'flex', height:'100%', overflow:'hidden' }}>

        {/* ── Left: Match List ── */}
        <div style={{
          width: 300, flexShrink: 0, borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          ...(mobileShowChat ? { display: 'none' } as any : {}),
        }} className="dating-chat-sidebar">
          {/* Header */}
          <div style={{ padding:'20px 18px 14px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
              <button onClick={() => router.push('/student/dating')}
                style={{ background:'none', border:'none', color:'var(--muted)', cursor:'pointer', fontSize:18, padding:0, lineHeight:1, marginRight:2 }}>←</button>
              <span style={{ fontSize:18, fontWeight:800, color:'var(--white)', letterSpacing:-0.5, display:'inline-flex', alignItems:'center', gap:6 }}><DC_HeartIcon /> Matches</span>
            </div>
            <p style={{ fontSize:12, color:'var(--muted)', margin:0 }}>{matches.length} mutual match{matches.length !== 1 ? 'es' : ''}</p>
          </div>

          {/* Match list */}
          <div style={{ flex:1, overflowY:'auto' }}>
            {matches.length === 0 ? (
              <div style={{ padding:'40px 20px', textAlign:'center' }}>
                <div style={{ marginBottom:12, display:'inline-flex' }}><DC_BrokenHeart /></div>
                <div style={{ fontSize:14, fontWeight:700, color:'var(--white)', marginBottom:6 }}>No matches yet</div>
                <div style={{ fontSize:12, color:'var(--muted)', lineHeight:1.5 }}>Start swiping to get your first match!</div>
                <button onClick={() => router.push('/student/dating')}
                  style={{ marginTop:16, padding:'9px 20px', borderRadius:100, background:`${ACCENT}22`, border:`1px solid ${ACCENT}55`, color:ACCENT, fontSize:13, fontWeight:700, cursor:'pointer' }}>
                  Go to Discover
                </button>
              </div>
            ) : matches.map(m => (
              <button key={m.user_id} onClick={() => selectMatch(m)}
                style={{ width:'100%', padding:'12px 16px', display:'flex', alignItems:'center', gap:12, background:active?.user_id === m.user_id ? 'rgba(255,107,157,0.08)' : 'transparent', border:'none', borderBottom:'1px solid rgba(18,36,28,0.04)', cursor:'pointer', textAlign:'left', transition:'background 0.15s', position:'relative' }}>
                <div style={{ position:'relative', flexShrink:0 }}>
                  <Avi p={m} size={46} />
                  <div style={{ position:'absolute', bottom:-2, right:-2, background:`linear-gradient(135deg,${ACCENT},${PURPLE})`, borderRadius:'50%', width:16, height:16, display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid var(--navy)', color:'white' }}><DC_HeartIcon /></div>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:2 }}>
                    <span style={{ fontSize:14, fontWeight:700, color: active?.user_id === m.user_id ? ACCENT : 'var(--white)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:120 }}>{m.display_name}</span>
                    {m.lastMsgTime && <span style={{ fontSize:11, color:'var(--muted)', flexShrink:0 }}>{fmtTime(m.lastMsgTime)}</span>}
                  </div>
                  <div style={{ fontSize:12, color:'var(--muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {m.lastMsg || <span style={{ color:`${PURPLE}99`, fontStyle:'italic' }}>Say hi!</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Right: Chat panel ── */}
        {active ? (
          <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}
            className={mobileShowChat ? 'dating-chat-active' : ''}>

            {/* Chat header */}
            <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:14, flexShrink:0, background:'rgba(255,107,157,0.04)' }}>
              <button onClick={() => setMobileShowChat(false)}
                style={{ background:'none', border:'none', color:'var(--muted)', cursor:'pointer', fontSize:20, padding:0, lineHeight:1, display:'none' }} className="back-btn-mobile">←</button>
              <div style={{ position:'relative' }}>
                <Avi p={active} size={42} />
                <div style={{ position:'absolute', bottom:-2, right:-2, background:`linear-gradient(135deg,${ACCENT},${PURPLE})`, borderRadius:'50%', width:16, height:16, display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid var(--navy)', color:'white' }}><DC_HeartIcon /></div>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:16, fontWeight:800, color:'var(--white)', letterSpacing:-0.3 }}>{active.display_name}</div>
                <div style={{ fontSize:12, color:'var(--muted)' }}>
                  {[active.age && `${active.age}`, active.major, active.university].filter(Boolean).join(' · ')}
                </div>
              </div>
              <button onClick={() => router.push(`/student/dating`)}
                style={{ padding:'7px 14px', borderRadius:100, background:`${ACCENT}18`, border:`1px solid ${ACCENT}44`, color:ACCENT, fontSize:12, fontWeight:700, cursor:'pointer', flexShrink:0, whiteSpace:'nowrap' }}>
                View profile
              </button>
            </div>

            {/* Match banner */}
            {msgs.length === 0 && (
              <div style={{ margin:'20px auto', padding:'14px 24px', borderRadius:16, background:`linear-gradient(135deg,${ACCENT}18,${PURPLE}18)`, border:`1px solid ${ACCENT}33`, textAlign:'center', maxWidth:340 }}>
                <div style={{ marginBottom:6, display:'inline-flex', color:'#7C6BD1' }}><svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>
                <div style={{ fontSize:15, fontWeight:800, color:'var(--white)', marginBottom:4 }}>You matched with {active.display_name}!</div>
                <div style={{ fontSize:12, color:'var(--muted)' }}>Say something nice to start the conversation.</div>
              </div>
            )}

            {/* Messages */}
            <div style={{ flex:1, overflowY:'auto', padding:'16px 20px', display:'flex', flexDirection:'column', gap:10 }}>
              {msgs.map((m, i) => {
                const mine = m.sender_id === meId;
                const showAvi = !mine && (i === 0 || msgs[i-1].sender_id !== m.sender_id);
                return (
                  <div key={m.id} style={{ display:'flex', alignItems:'flex-end', gap:8, justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                    {!mine && <div style={{ width:28, flexShrink:0 }}>{showAvi && <Avi p={active} size={28} />}</div>}
                    <div style={{ maxWidth:'68%' }}>
                      <div style={{
                        padding:'10px 14px', borderRadius: mine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        background: mine ? `linear-gradient(135deg,${ACCENT},${PURPLE})` : 'rgba(18,36,28,0.07)',
                        color: mine ? '#fff' : 'var(--white)', fontSize:14, lineHeight:1.5,
                        boxShadow: mine ? `0 2px 12px ${ACCENT}44` : 'none',
                      }}>
                        {m.content}
                      </div>
                      <div style={{ fontSize:11, color:'var(--muted)', marginTop:3, textAlign: mine ? 'right' : 'left', paddingLeft: mine ? 0 : 4, paddingRight: mine ? 4 : 0 }}>
                        {fmtTime(m.created_at)}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{ padding:'12px 16px', borderTop:'1px solid var(--border)', display:'flex', gap:10, alignItems:'flex-end', flexShrink:0 }}>
              <textarea ref={inputRef} value={text} onChange={e => setText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder={`Message ${active.display_name}…`} rows={1}
                style={{ flex:1, padding:'10px 14px', background:'rgba(18,36,28,0.06)', border:'1px solid var(--border)', borderRadius:20, color:'var(--white)', fontSize:14, outline:'none', resize:'none', lineHeight:1.5, fontFamily:'inherit', maxHeight:120, overflowY:'auto' }}
                onInput={e => { const t = e.target as HTMLTextAreaElement; t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 120) + 'px'; }}
              />
              <button onClick={send} disabled={!text.trim() || sending}
                style={{ width:42, height:42, borderRadius:'50%', border:'none', cursor: text.trim() ? 'pointer' : 'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0, transition:'all 0.2s',
                  background: text.trim() ? `linear-gradient(135deg,${ACCENT},${PURPLE})` : 'rgba(18,36,28,0.06)',
                  boxShadow: text.trim() ? `0 2px 12px ${ACCENT}55` : 'none',
                }}>
                {sending ? '…' : '➤'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, color:'var(--muted)' }}>
            <div style={{ display:'inline-flex' }}><DC_HeartBig /></div>
            <div style={{ fontSize:16, fontWeight:700, color:'var(--white)' }}>Your match messages</div>
            <div style={{ fontSize:13 }}>Select a match to start chatting</div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .dating-chat-sidebar { display: flex !important; width: 100% !important; }
          .dating-chat-active .dating-chat-sidebar { display: none !important; }
          .back-btn-mobile { display: block !important; }
        }
      `}</style>
    </StudentLayout>
  );
}

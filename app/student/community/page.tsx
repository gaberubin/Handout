'use client';

import { useEffect, useState } from 'react';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { createClient } from '@/lib/supabase/client';
import { createCommunityPostAction } from '@/lib/actions/auth';
import { awardPoints } from '@/lib/points';
import { Marketplace } from '@/components/community/Marketplace';
import { getMyCampus } from '@/lib/campus';

/* ── Community page SVG icons ── */
const PartyIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V7"/></svg>;
const WrenchIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>;
const SparkIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const MegaIcon   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>;
const ChartIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const ChatBubble = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const MsgMiniIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const HeartOnIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="#C25B4E" stroke="#C25B4E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const HeartOffIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;

const announcements = [
  { Icon: PartyIcon,  title: 'Welcome 500 new students this month!',          time: '1 day ago' },
  { Icon: WrenchIcon, title: 'Provider verification now faster — 24hr turnaround', time: '3 days ago' },
  { Icon: SparkIcon,  title: 'New feature: Group Housing Coordination is live', time: '1 week ago' },
];

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function initials(name: string) {
  return (name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [me, setMe] = useState<any>(null);
  const [draft, setDraft] = useState('');
  const [posting, setPosting] = useState(false);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState('');
  const [ready, setReady] = useState(false);
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [view, setView] = useState<'feed' | 'market'>('feed');

  async function load() {
    const supabase = createClient();
    const campus = await getMyCampus();
    let q = supabase
      .from('community_posts')
      .select('*, users:public_profiles(full_name)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(50);
    if (campus) q = q.eq('campus', campus);   // campus isolation — only my university
    const { data } = await q;
    setPosts(data || []);
  }

  useEffect(() => {
    // Open the Marketplace tab directly when linked with ?tab=market
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('tab') === 'market') setView('market');
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: u } = await supabase.from('users').select('*').eq('id', user.id).single();
        setMe(u || { id: user.id });
        // load posts this user already liked
        const { data: lk } = await supabase.from('post_likes').select('post_id').eq('user_id', user.id);
        if (lk) setLiked(new Set(lk.map((l: any) => l.post_id)));
      }
      const { count } = await supabase.from('public_profiles').select('*', { count: 'exact', head: true });
      setMemberCount(count);
      await load();
      setReady(true);
    })();
  }, []);

  async function post() {
    const body = draft.trim();
    if (!body || !me) return;
    if (body.length < 10) { setToast('Post is too short (10 chars min).'); return; }
    if (body.length > 5000) { setToast('Post is too long (5000 chars max).'); return; }
    setPosting(true);
    // Routed through a server action: sanitizes + validates, rate-limits, and
    // derives the author from the server session.
    const fd = new FormData();
    fd.set('title', body.slice(0, 150));
    fd.set('content', body);
    const res = await createCommunityPostAction(fd);
    setPosting(false);
    if (res?.error) { setToast('Could not post: ' + res.error); return; }
    awardPoints('create_post');
    setDraft('');
    setToast('Posted!');
    setTimeout(() => setToast(''), 2500);
    await load();
  }

  async function toggleLike(postId: string, currentLikes: number) {
    if (!me) { setToast('Sign in to like posts.'); return; }
    const supabase = createClient();
    const isLiked = liked.has(postId);
    if (isLiked) {
      await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', me.id);
      await supabase.from('community_posts').update({ likes: Math.max(0, currentLikes - 1) }).eq('id', postId);
      setLiked(prev => { const s = new Set(prev); s.delete(postId); return s; });
    } else {
      await supabase.from('post_likes').insert({ post_id: postId, user_id: me.id });
      await supabase.from('community_posts').update({ likes: currentLikes + 1 }).eq('id', postId);
      setLiked(prev => new Set(prev).add(postId));
    }
    await load();
  }

  return (
    <StudentLayout title="Community">
      {/* Feed / Marketplace tabs */}
      <div style={{ display:'flex', gap:4, background:'rgba(18,36,28,0.05)', borderRadius:14, padding:5, marginBottom:18, maxWidth:320 }}>
        {(['feed','market'] as const).map(t => (
          <button key={t} onClick={() => setView(t)} style={{ flex:1, height:38, borderRadius:10, fontWeight:700, fontSize:13, cursor:'pointer', border:'none', background: view===t ? '#fff' : 'transparent', color: view===t ? '#12A150' : '#7D9188', boxShadow: view===t ? '0 2px 8px rgba(18,36,28,0.08)' : 'none', transition:'all .2s' }}>
            {t === 'feed' ? 'Feed' : 'Marketplace'}
          </button>
        ))}
      </div>

      {view === 'market' ? <Marketplace me={me} /> : (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main feed */}
        <div className="md:col-span-2 flex flex-col gap-4">

          {toast && (
            <div className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ background: toast.startsWith('Could') ? 'rgba(220,38,38,0.1)' : 'rgba(18,161,80,0.1)', color: toast.startsWith('Could') ? '#DC2626' : '#12A150', border: `1px solid ${toast.startsWith('Could') ? 'rgba(220,38,38,0.3)' : 'rgba(18,161,80,0.3)'}` }}>
              {toast}
            </div>
          )}

          {/* Post input */}
          <Card>
            <div className="flex flex-col gap-3">
              <textarea
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) post(); }}
                placeholder="Ask the community anything… (Cmd+Enter to post)"
                rows={3}
                className="w-full px-4 py-3 rounded-lg text-sm text-[#12241C] bg-[#F1F7F3] border border-[rgba(18,36,28,0.12)] outline-none placeholder:text-[#7d9188] focus:border-[#12A150] resize-none"
              />
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-[#7d9188]">{draft.length}/150 chars</span>
                <button
                  onClick={post}
                  disabled={posting || !draft.trim() || !me}
                  className="px-5 py-2 rounded-lg text-sm font-bold transition-all"
                  style={{ background: (!draft.trim() || !me || posting) ? 'rgba(18,36,28,0.12)' : '#12241C', color: (!draft.trim() || !me || posting) ? '#7d9188' : 'white', cursor: (!draft.trim() || !me || posting) ? 'not-allowed' : 'pointer' }}>
                  {posting ? 'Posting…' : 'Post'}
                </button>
              </div>
            </div>
          </Card>

          {/* Posts feed */}
          {!ready ? (
            <div className="text-sm text-[#7d9188] py-4">Loading posts…</div>
          ) : posts.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <div className="mb-3" style={{ color: 'var(--muted)', display: 'inline-flex' }}><ChatBubble /></div>
                <p className="text-sm text-[#7d9188]">No posts yet — be the first to ask something!</p>
              </div>
            </Card>
          ) : (
            posts.map((p) => {
              const name = p.users?.full_name || 'Student';
              const ini = initials(name);
              const isLiked = liked.has(p.id);
              return (
                <div key={p.id} onClick={() => window.location.href = `/student/community/${p.id}`} style={{ cursor: 'pointer' }}>
                <Card key={p.id}>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#12241C] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {ini}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[13px] font-semibold text-[#12241C]">{name}</span>
                        <span className="text-[11px] text-[#7d9188]">{timeAgo(p.created_at)}</span>
                      </div>
                      <div className="text-sm font-semibold text-[#12241C] mb-3">{p.title}</div>
                      <div className="flex gap-4 text-[12px] text-[#7d9188]">
                        <button
                          onClick={() => toggleLike(p.id, p.likes)}
                          className="hover:text-[#DC2626] transition-colors font-medium"
                          style={{ color: isLiked ? '#DC2626' : undefined }}>
                          <span style={{ display:'inline-flex', alignItems:'center', gap:4 }}>{isLiked ? <HeartOnIcon /> : <HeartOffIcon />} {p.likes}</span>
                        </button>
                        {me && p.author_id && p.author_id !== me.id && (
                          <button
                            onClick={(e) => { e.stopPropagation(); window.location.href = `/student/messages?to=${p.author_id}&name=${encodeURIComponent(name)}`; }}
                            className="hover:text-[#12A150] transition-colors font-medium">
                            <span style={{ display:'inline-flex', alignItems:'center', gap:4 }}><MsgMiniIcon /> Message</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader title={<span style={{ display:'inline-flex', alignItems:'center', gap:6 }}><MegaIcon /> Announcements</span>} />
            <div className="flex flex-col gap-3">
              {announcements.map((a) => (
                <div key={a.title} className="flex gap-3 text-sm">
                  <span style={{ display:'inline-flex', color:'var(--amber)', flexShrink:0 }}><a.Icon /></span>
                  <div>
                    <div className="font-medium text-[#12241C] leading-tight">{a.title}</div>
                    <div className="text-[11px] text-[#7d9188] mt-0.5">{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title={<span style={{ display:'inline-flex', alignItems:'center', gap:6 }}><ChartIcon /> Community Stats</span>} />
            <div className="flex flex-col gap-2 text-sm">
              {[
                { label: 'Members', value: memberCount != null ? memberCount.toLocaleString() : '—' },
                { label: 'Posts', value: ready ? posts.length.toString() : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-[13px]">
                  <span className="text-[#7d9188]">{label}</span>
                  <span className="font-bold text-[#12241C]">{value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
      )}
    </StudentLayout>
  );
}

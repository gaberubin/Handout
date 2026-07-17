'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { StudentLayout } from '@/components/layout/StudentLayout';

/* ── Icons ── */
const BackIcon   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const HeartOnIcon  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="#C25B4E" stroke="#C25B4E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const HeartOffIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const SendIcon   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const TrashIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const ChatIcon   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function ini(name: string) {
  return (name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function Avatar({ url, name, size = 38 }: { url?: string; name: string; size?: number }) {
  return url ? (
    <img src={url} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
  ) : (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg,#5A4BB8,#12A150)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: size * 0.33, flexShrink: 0 }}>
      {ini(name)}
    </div>
  );
}

const card: React.CSSProperties = {
  background: '#FFFFFF', 
  border: '1px solid rgba(18,36,28,0.09)', borderRadius: 16,
};

export default function CommunityPostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost]       = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [me, setMe]           = useState<any>(null);
  const [liked, setLiked]     = useState(false);
  const [draft, setDraft]     = useState('');
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  async function loadPost() {
    const sb = createClient();
    const { data: p } = await sb
      .from('community_posts')
      .select('*, users:public_profiles(id, full_name, avatar_url)')
      .eq('id', id)
      .single();
    if (p) setPost(p);
  }

  async function loadComments() {
    const sb = createClient();
    const { data } = await sb
      .from('post_comments')
      .select('*, users:public_profiles(id, full_name, avatar_url)')
      .eq('post_id', id)
      .order('created_at', { ascending: true });
    setComments(data || []);
  }

  useEffect(() => {
    (async () => {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }

      const { data: u } = await sb.from('users').select('*').eq('id', user.id).single();
      setMe(u || { id: user.id });

      // Check if already liked
      const { data: lk } = await sb.from('post_likes').select('id').eq('post_id', id).eq('user_id', user.id).maybeSingle();
      setLiked(!!lk);

      await Promise.all([loadPost(), loadComments()]);
      setLoading(false);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function toggleLike() {
    if (!me || !post) return;
    const sb = createClient();
    if (liked) {
      await sb.from('post_likes').delete().eq('post_id', id).eq('user_id', me.id);
      await sb.from('community_posts').update({ likes: Math.max(0, post.likes - 1) }).eq('id', id);
      setPost((p: any) => ({ ...p, likes: Math.max(0, p.likes - 1) }));
    } else {
      await sb.from('post_likes').insert({ post_id: id, user_id: me.id });
      await sb.from('community_posts').update({ likes: post.likes + 1 }).eq('id', id);
      setPost((p: any) => ({ ...p, likes: p.likes + 1 }));
    }
    setLiked(v => !v);
  }

  async function submitComment() {
    const body = draft.trim();
    if (!body || !me) return;
    setPosting(true);
    const sb = createClient();
    const { error } = await sb.from('post_comments').insert({ post_id: id, user_id: me.id, content: body });
    setPosting(false);
    if (error) { alert('Error: ' + error.message); return; }
    setDraft('');
    await loadComments();
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }

  async function deleteComment(cid: string) {
    const sb = createClient();
    await sb.from('post_comments').delete().eq('id', cid);
    setComments(prev => prev.filter(c => c.id !== cid));
  }

  if (loading) return (
    <StudentLayout title="Post">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, color: '#7d9188', fontSize: 14 }}>Loading…</div>
    </StudentLayout>
  );

  if (!post) return (
    <StudentLayout title="Not Found">
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <p style={{ color: '#7d9188', fontSize: 14 }}>This post doesn't exist or was removed.</p>
        <Link href="/student/community" style={{ color: '#12A150', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>← Back to Community</Link>
      </div>
    </StudentLayout>
  );

  const author = post.users;
  const authorName = author?.full_name || 'Student';

  return (
    <StudentLayout title="Community">
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '28px 0 80px' }}>

        {/* Back */}
        <Link href="/student/community" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#7d9188', fontSize: 13, fontWeight: 600, textDecoration: 'none', marginBottom: 20 }}>
          <BackIcon /> Back to Community
        </Link>

        {/* Post card */}
        <div style={{ ...card, padding: '22px 24px', marginBottom: 20 }}>
          {/* Author row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <Avatar url={author?.avatar_url} name={authorName} size={44} />
            <div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#12241C' }}>{authorName}</p>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#7d9188' }}>{timeAgo(post.created_at)}</p>
            </div>
          </div>

          {/* Content */}
          <p style={{ fontSize: 16, color: '#12241C', lineHeight: 1.7, margin: '0 0 20px', whiteSpace: 'pre-line' }}>{post.content}</p>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingTop: 16, borderTop: '1px solid rgba(18,36,28,0.07)' }}>
            <button onClick={toggleLike} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: liked ? 'rgba(194,91,78,0.1)' : 'transparent',
              border: `1px solid ${liked ? 'rgba(194,91,78,0.3)' : 'rgba(18,36,28,0.09)'}`,
              borderRadius: 100, padding: '6px 14px',
              color: liked ? '#C25B4E' : '#7d9188', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>
              {liked ? <HeartOnIcon /> : <HeartOffIcon />} {post.likes ?? 0}
            </button>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#7d9188' }}>
              <ChatIcon /> {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
            </span>
          </div>
        </div>

        {/* Comments */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: '#7d9188', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 14px' }}>
            {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
          </p>

          {comments.length === 0 ? (
            <div style={{ ...card, padding: '32px 24px', textAlign: 'center' }}>
              <p style={{ color: '#7d9188', fontSize: 14, margin: 0 }}>No comments yet — be the first to reply!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {comments.map(c => {
                const cAuthor = c.users;
                const cName = cAuthor?.full_name || 'Student';
                const isOwn = me && c.user_id === me.id;
                return (
                  <div key={c.id} style={{ ...card, padding: '14px 18px', display: 'flex', gap: 12 }}>
                    <Avatar url={cAuthor?.avatar_url} name={cName} size={36} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#12241C' }}>{cName}</span>
                          <span style={{ fontSize: 11, color: '#7d9188' }}>{timeAgo(c.created_at)}</span>
                        </div>
                        {isOwn && (
                          <button onClick={() => deleteComment(c.id)} style={{ background: 'none', border: 'none', color: '#7d9188', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4 }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#C25B4E')}
                            onMouseLeave={e => (e.currentTarget.style.color = '#7d9188')}>
                            <TrashIcon />
                          </button>
                        )}
                      </div>
                      <p style={{ margin: 0, fontSize: 14, color: '#4c6157', lineHeight: 1.6, wordBreak: 'break-word' }}>{c.content}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={endRef} />
            </div>
          )}
        </div>

        {/* Comment input */}
        <div style={{ ...card, padding: '16px 18px' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <Avatar url={me?.avatar_url} name={me?.full_name || '?'} size={36} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <textarea
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) submitComment(); }}
                placeholder="Write a comment…"
                rows={3}
                style={{
                  width: '100%', padding: '10px 14px', boxSizing: 'border-box',
                  background: 'rgba(18,36,28,0.05)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: 12, color: '#12241C', fontSize: 14,
                  outline: 'none', resize: 'none', lineHeight: 1.5,
                  fontFamily: 'inherit',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: '#7d9188' }}>{draft.length}/1000</span>
                <button
                  onClick={submitComment}
                  disabled={!draft.trim() || posting || draft.length > 1000}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 18px', borderRadius: 100,
                    background: draft.trim() && !posting ? '#12A150' : 'rgba(18,36,28,0.09)',
                    color: draft.trim() && !posting ? '#ffffff' : '#7d9188',
                    border: 'none', fontSize: 13, fontWeight: 700,
                    cursor: draft.trim() && !posting ? 'pointer' : 'default',
                    transition: 'all .12s',
                  }}>
                  <SendIcon /> {posting ? 'Posting…' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </StudentLayout>
  );
}

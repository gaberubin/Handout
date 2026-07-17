'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { validateText, validateParagraph, validateInt } from '@/lib/validation';

/* ── Icons ── */
const BookIcon   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
const UsersIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const PinIcon    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const ClockIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const ChatIcon   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const AddIcon    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const CheckIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const XIcon      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

function ini(name: string) { return (name||'?').split(' ').map((n:string)=>n[0]).join('').slice(0,2).toUpperCase(); }

const card: React.CSSProperties = { background:'#FFFFFF', border:'1px solid rgba(18,36,28,0.09)', borderRadius:16 };
const MODAL0 = { title:'', course:'', subject:'', description:'', location:'', schedule:'', max_members:10 };

export default function StudyGroupsPage() {
  const router = useRouter();
  const [groups, setGroups]     = useState<any[]>([]);
  const [members, setMembers]   = useState<Record<string,number>>({});
  const [joined, setJoined]     = useState<Set<string>>(new Set());
  const [names, setNames]       = useState<Record<string,string>>({});
  const [me, setMe]             = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [q, setQ]               = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]         = useState<any>(MODAL0);
  const [saving, setSaving]     = useState(false);
  const [formErr, setFormErr]   = useState('');
  const [joining, setJoining]   = useState<string|null>(null);

  async function load(uid: string) {
    const sb = createClient();
    const [{ data: gs }, { data: ms }, { data: myMs }] = await Promise.all([
      sb.from('study_groups').select('*').eq('is_active', true).order('created_at', { ascending: false }),
      sb.from('study_group_members').select('group_id'),
      sb.from('study_group_members').select('group_id').eq('user_id', uid),
    ]);
    const gList = gs || [];
    setGroups(gList);

    const counts: Record<string,number> = {};
    (ms||[]).forEach((m:any) => { counts[m.group_id] = (counts[m.group_id]||0) + 1; });
    setMembers(counts);
    setJoined(new Set((myMs||[]).map((m:any) => m.group_id)));

    const uids = [...new Set(gList.map((g:any) => g.user_id))] as string[];
    if (uids.length) {
      const { data: users } = await sb.from('public_profiles').select('id, full_name').in('id', uids);
      const nm: Record<string,string> = {};
      (users||[]).forEach((u:any) => { nm[u.id] = u.full_name||'Student'; });
      setNames(nm);
    }
  }

  useEffect(() => {
    (async () => {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }
      const { data: u } = await sb.from('users').select('*').eq('id', user.id).single();
      setMe(u||{id:user.id});
      await load(user.id);
      setLoading(false);
    })();
  }, []);

  async function toggleJoin(g: any) {
    if (!me) return;
    setJoining(g.id);
    const sb = createClient();
    if (joined.has(g.id)) {
      await sb.from('study_group_members').delete().eq('group_id', g.id).eq('user_id', me.id);
      setJoined(prev => { const s = new Set(prev); s.delete(g.id); return s; });
      setMembers(prev => ({ ...prev, [g.id]: Math.max(0, (prev[g.id]||1) - 1) }));
    } else {
      const count = members[g.id] || 0;
      if (count >= g.max_members) { setJoining(null); return; }
      await sb.from('study_group_members').insert({ group_id: g.id, user_id: me.id });
      setJoined(prev => new Set([...prev, g.id]));
      setMembers(prev => ({ ...prev, [g.id]: (prev[g.id]||0) + 1 }));
    }
    setJoining(null);
  }

  async function submit() {
    const tErr = validateText(form.title, 'Group name', { min: 3, max: 60 });
    const sErr = form.subject ? validateText(form.subject, 'Subject', { min: 2, max: 40, required: false }) : '';
    const dErr = validateParagraph(form.description, 'Description', { max: 500 });
    const mErr = validateInt(form.max_members, 'Group size', { min: 2, max: 50, required: true });
    if (tErr || sErr || dErr || mErr) { setFormErr(tErr || sErr || dErr || mErr); return; }
    setFormErr('');
    setSaving(true);
    const sb = createClient();
    const { data: newG } = await sb.from('study_groups').insert({ ...form, user_id: me.id, max_members: parseInt(form.max_members)||10 }).select().single();
    if (newG) {
      await sb.from('study_group_members').insert({ group_id: newG.id, user_id: me.id });
    }
    setSaving(false);
    setShowModal(false);
    setForm(MODAL0);
    await load(me.id);
  }

  async function deleteGroup(id: string) {
    if (!confirm('Delete this study group?')) return;
    const sb = createClient();
    await sb.from('study_groups').update({ is_active: false }).eq('id', id);
    setGroups(prev => prev.filter(g => g.id !== id));
  }

  const visible = groups.filter(g => {
    if (!q) return true;
    return `${g.title} ${g.course||''} ${g.subject||''} ${g.description||''}`.toLowerCase().includes(q.toLowerCase());
  });

  return (
    <StudentLayout title="Study Groups">
      <div style={{ maxWidth:860, margin:'0 auto', padding:'28px 0 80px' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:800, color:'#12241C', margin:0, letterSpacing:-0.5 }}>Study Groups</h1>
            <p style={{ margin:'4px 0 0', fontSize:13, color:'#7d9188' }}>Find your people, ace together</p>
          </div>
          <button onClick={() => setShowModal(true)} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'9px 18px', borderRadius:100, background:'#12A150', color:'#ffffff', fontWeight:700, fontSize:13, border:'none', cursor:'pointer' }}>
            <AddIcon /> Create group
          </button>
        </div>

        {/* Search */}
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by course, subject, or title…"
          style={{ width:'100%', height:42, padding:'0 16px', boxSizing:'border-box', background:'rgba(18,36,28,0.06)', border:'1px solid rgba(18,36,28,0.09)', borderRadius:100, color:'#12241C', fontSize:13, outline:'none', marginBottom:20 }} />

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
          {[
            { label:'Active groups', value: groups.length },
            { label:'Groups joined', value: joined.size },
            { label:'Your groups', value: groups.filter(g => me && g.user_id === me.id).length },
          ].map(s => (
            <div key={s.label} style={{ ...card, padding:'14px 18px', textAlign:'center' }}>
              <p style={{ margin:0, fontSize:24, fontWeight:800, color:'#12A150' }}>{loading ? '—' : s.value}</p>
              <p style={{ margin:'3px 0 0', fontSize:11, color:'#7d9188' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Group cards */}
        {loading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(285px,1fr))', gap:16 }}>
            {Array(4).fill(null).map((_,i) => <div key={i} style={{ ...card, height:180 }} className="skeleton" />)}
          </div>
        ) : visible.length === 0 ? (
          <div style={{ ...card, padding:'48px 24px', textAlign:'center' }}>
            <span style={{ fontSize:36 }}>📚</span>
            <p style={{ color:'#7d9188', fontSize:14, margin:'12px 0 4px' }}>No study groups yet.</p>
            <p style={{ color:'#7d9188', fontSize:12, margin:0 }}>Create one and find study partners!</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(285px,1fr))', gap:16 }}>
            {visible.map(g => {
              const creator = names[g.user_id] || 'Student';
              const isOwn = me && g.user_id === me.id;
              const isJoined = joined.has(g.id);
              const count = members[g.id] || 0;
              const isFull = count >= g.max_members;

              return (
                <div key={g.id} style={{ ...card, padding:'18px 20px', display:'flex', flexDirection:'column', gap:10, transition:'border-color .15s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor='rgba(18,161,80,0.25)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor='rgba(18,36,28,0.09)')}>

                  {/* Title + badges */}
                  <div>
                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8 }}>
                      <h3 style={{ margin:0, fontSize:15, fontWeight:800, color:'#12241C', lineHeight:1.3 }}>{g.title}</h3>
                      {isOwn && <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:100, background:'rgba(18,161,80,0.1)', color:'#12A150', border:'1px solid rgba(18,161,80,0.2)', flexShrink:0 }}>Owner</span>}
                    </div>
                    {(g.course || g.subject) && (
                      <p style={{ margin:'4px 0 0', fontSize:12, color:'#7d9188', display:'flex', alignItems:'center', gap:5 }}>
                        <BookIcon /> {[g.course, g.subject].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>

                  {/* Meta */}
                  <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                    <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'#7d9188' }}>
                      <UsersIcon /> {count}/{g.max_members} members {isFull && <span style={{ color:'#C25B4E', fontWeight:700 }}>· Full</span>}
                    </span>
                    {g.location && <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'#7d9188' }}><PinIcon />{g.location}</span>}
                    {g.schedule && <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'#7d9188' }}><ClockIcon />{g.schedule}</span>}
                  </div>

                  {g.description && <p style={{ margin:0, fontSize:13, color:'#4c6157', lineHeight:1.5, flex:1 }}>{g.description}</p>}

                  {/* Actions */}
                  <div style={{ display:'flex', gap:8, marginTop:'auto', paddingTop:10, borderTop:'1px solid rgba(18,36,28,0.07)' }}>
                    {!isOwn && (
                      <button onClick={() => toggleJoin(g)} disabled={joining===g.id || (isFull && !isJoined)}
                        style={{ flex:1, height:36, borderRadius:100, fontSize:12, fontWeight:700, cursor:(isFull && !isJoined) ? 'not-allowed' : 'pointer', border:'none', background:isJoined ? 'rgba(18,161,80,0.12)' : isFull ? 'rgba(18,36,28,0.06)' : 'rgba(18,161,80,0.12)', color:isJoined ? '#12A150' : isFull ? '#7d9188' : '#12A150', display:'inline-flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                        {joining===g.id ? '…' : isJoined ? <><CheckIcon /> Joined</> : isFull ? 'Full' : '+ Join'}
                      </button>
                    )}
                    {!isOwn && (
                      <button onClick={() => router.push(`/student/messages?to=${g.user_id}&name=${encodeURIComponent(creator)}&msg=${encodeURIComponent(`Hi! I'm interested in joining your "${g.title}" study group.`)}`)}
                        style={{ height:36, padding:'0 14px', borderRadius:100, fontSize:12, fontWeight:700, cursor:'pointer', border:'1px solid rgba(18,36,28,0.09)', background:'rgba(18,36,28,0.04)', color:'#7d9188', display:'inline-flex', alignItems:'center', gap:5 }}>
                        <ChatIcon /> Chat
                      </button>
                    )}
                    {isOwn && (
                      <button onClick={() => deleteGroup(g.id)} style={{ flex:1, height:36, borderRadius:100, fontSize:12, fontWeight:700, cursor:'pointer', border:'1px solid rgba(194,91,78,0.2)', background:'rgba(194,91,78,0.06)', color:'#C25B4E' }}>
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create modal */}
        {showModal && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 }} onClick={() => setShowModal(false)}>
            <div style={{ background:'#FFFFFF', borderRadius:20, border:'1px solid rgba(18,36,28,0.12)', width:'100%', maxWidth:460, padding:'24px 28px', maxHeight:'90vh', overflowY:'auto' }} onClick={e => e.stopPropagation()}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
                <h2 style={{ margin:0, fontSize:18, fontWeight:800, color:'#12241C' }}>Create Study Group</h2>
                <button onClick={() => setShowModal(false)} style={{ background:'none', border:'none', color:'#7d9188', cursor:'pointer', display:'flex' }}><XIcon /></button>
              </div>

              {[
                { label:'Group name *', key:'title', placeholder:'e.g. CHEM 101 Finals Prep' },
                { label:'Course', key:'course', placeholder:'e.g. Chemistry 101' },
                { label:'Subject', key:'subject', placeholder:'e.g. Organic Chemistry' },
                { label:'Meeting location', key:'location', placeholder:'Library Room 3B / Zoom' },
                { label:'Schedule', key:'schedule', placeholder:'Tuesdays 5–7pm' },
              ].map(f => (
                <div key={f.key} style={{ marginBottom:12 }}>
                  <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#7d9188', marginBottom:4, textTransform:'uppercase', letterSpacing:0.5 }}>{f.label}</label>
                  <input value={form[f.key]} onChange={e => setForm((p:any) => ({...p, [f.key]:e.target.value}))} placeholder={f.placeholder}
                    style={{ width:'100%', height:38, padding:'0 12px', boxSizing:'border-box', background:'rgba(18,36,28,0.06)', border:'1px solid rgba(18,36,28,0.09)', borderRadius:10, color:'#12241C', fontSize:13, outline:'none' }} />
                </div>
              ))}

              <div style={{ marginBottom:12 }}>
                <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#7d9188', marginBottom:4, textTransform:'uppercase', letterSpacing:0.5 }}>Max members</label>
                <input type="number" min={2} max={50} value={form.max_members} onChange={e => setForm((p:any) => ({...p, max_members:e.target.value}))}
                  style={{ width:'100%', height:38, padding:'0 12px', boxSizing:'border-box', background:'rgba(18,36,28,0.06)', border:'1px solid rgba(18,36,28,0.09)', borderRadius:10, color:'#12241C', fontSize:13, outline:'none' }} />
              </div>

              <div style={{ marginBottom:20 }}>
                <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#7d9188', marginBottom:4, textTransform:'uppercase', letterSpacing:0.5 }}>Description</label>
                <textarea value={form.description} onChange={e => setForm((p:any) => ({...p, description:e.target.value}))} placeholder="What will you study? Any requirements?" rows={3}
                  style={{ width:'100%', padding:'10px 12px', boxSizing:'border-box', background:'rgba(18,36,28,0.06)', border:'1px solid rgba(18,36,28,0.09)', borderRadius:10, color:'#12241C', fontSize:13, outline:'none', resize:'none', fontFamily:'inherit' }} />
              </div>

              {formErr && <div style={{ fontSize:12, color:'#C25B4E', fontWeight:600, marginBottom:10 }}>{formErr}</div>}
              <button onClick={submit} disabled={!form.title || saving}
                style={{ width:'100%', height:44, borderRadius:12, background:form.title ? '#12A150' : 'rgba(18,36,28,0.09)', color:form.title ? '#ffffff' : '#7d9188', fontWeight:800, fontSize:14, border:'none', cursor:form.title ? 'pointer' : 'default' }}>
                {saving ? 'Creating…' : 'Create Group'}
              </button>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}

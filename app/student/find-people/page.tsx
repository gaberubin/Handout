'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { createClient } from '@/lib/supabase/client';
import { UniversitySelect } from '@/components/ui/UniversitySelect';
import { validateParagraph } from '@/lib/validation';
import { PointsBadge } from '@/components/rewards/PointsBadge';
import { awardPoints } from '@/lib/points';

/* ── Icons ── */
const UsersIcon = ({ size = 22, color = '#fff' }: { size?: number; color?: string }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const ChatIcon  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const CheckIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#12A150" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const EditIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;

/* ── Constants (reuse the app's interest vocabulary) ── */
const LOOKING_FOR = ['Study buddy', 'Friends', 'Gym partner', 'Project/team partner'];
const INTERESTS   = ['Hiking','Gaming','Cooking','Movies','Music','Art','Travel','Fitness','Reading','Photography','Coffee','Yoga','Dance','Coding','Fashion'];

const INP: React.CSSProperties = { width:'100%', height:44, padding:'0 14px', background:'#F1F7F3', border:'1px solid rgba(18,36,28,0.12)', borderRadius:10, color:'#12241C', fontSize:14, outline:'none', boxSizing:'border-box' };
const card: React.CSSProperties = { background:'#fff', border:'1px solid rgba(18,36,28,0.09)', borderRadius:18, padding:22 };

type CP = { id:string; user_id:string; looking_for:string[]; interests:string[]; major:string; availability:string; bio:string; campus:string; is_active:boolean };
type Person = { full_name:string; avatar_url:string; is_verified:boolean; city:string };

/* ── Selectable pill (green accent — primary brand, not the dating purple) ── */
function Pill(label: string, active: boolean, onClick: () => void, dim = false) {
  return (
    <button key={label} onClick={onClick} type="button" style={{
      padding:'7px 13px', borderRadius:100, fontSize:12, fontWeight:600, cursor:'pointer',
      border:`1px solid ${active ? '#12A150' : 'rgba(18,36,28,0.12)'}`,
      background: active ? 'rgba(18,161,80,0.10)' : 'transparent',
      color: active ? '#0F8A44' : '#7D9188', opacity: dim ? 0.35 : 1, transition:'all .15s',
    }}>{label}</button>
  );
}

function ini(s: string) { return (s || '?').split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase(); }

function scoreMatch(mine: CP | null, theirs: CP, myCampus: string) {
  const overlap = (a?: string[], b?: string[]) => (a || []).filter(x => (b || []).includes(x));
  const sharedLook = overlap(mine?.looking_for, theirs.looking_for);
  const sharedInt  = overlap(mine?.interests, theirs.interests);
  const sameCampus = myCampus && theirs.campus && myCampus.toLowerCase() === theirs.campus.toLowerCase() ? 1 : 0;
  const pct = Math.min(99, sameCampus * 30 + Math.min(sharedLook.length, 2) * 15 + Math.min(sharedInt.length, 4) * 10);
  return { pct: Math.max(pct, 8), sharedLook, sharedInt, sameCampus };
}

export default function FindPeoplePage() {
  const [meId, setMeId]       = useState('');
  const [myCampus, setMyCampus] = useState('');
  const [myProfile, setMyProfile] = useState<CP | null>(null);
  const [people, setPeople]   = useState<Record<string, Person>>({});
  const [others, setOthers]   = useState<CP[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [migrated, setMigrated] = useState(true);

  // form state
  const [looking, setLooking]     = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [major, setMajor]         = useState('');
  const [availability, setAvail]  = useState('');
  const [bio, setBio]             = useState('');
  const [campus, setCampus]       = useState('');
  const [saving, setSaving]       = useState(false);
  const [saveErr, setSaveErr]     = useState('');

  async function load() {
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { window.location.href = '/auth/login'; return; }
    setMeId(user.id);

    const { data: sp } = await sb.from('student_profiles').select('university, major').eq('user_id', user.id).maybeSingle();
    const uni = sp?.university || '';
    setMyCampus(uni); setCampus(uni);
    if (sp?.major) setMajor(sp.major);

    const { data: mine, error: mineErr } = await sb.from('connection_profiles').select('*').eq('user_id', user.id).maybeSingle();
    if (mineErr) { setMigrated(false); setLoading(false); return; }
    if (mine) {
      setMyProfile(mine as CP);
      setLooking(mine.looking_for || []); setInterests(mine.interests || []);
      setMajor(mine.major || sp?.major || ''); setAvail(mine.availability || '');
      setBio(mine.bio || ''); setCampus(mine.campus || uni);
    } else {
      setEditing(true); // first visit → show the form
    }

    const { data: profs } = await sb.from('connection_profiles').select('*').eq('is_active', true).neq('user_id', user.id);
    const list = (profs || []) as CP[];
    setOthers(list);
    if (list.length) {
      const { data: pp } = await sb.from('public_profiles').select('id, full_name, avatar_url, is_verified, city').in('id', list.map(p => p.user_id));
      const map: Record<string, Person> = {};
      (pp || []).forEach((r: any) => { map[r.id] = { full_name: r.full_name, avatar_url: r.avatar_url, is_verified: r.is_verified, city: r.city }; });
      setPeople(map);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const toggle = (arr: string[], set: (v: string[]) => void, v: string, max?: number) =>
    set(arr.includes(v) ? arr.filter(x => x !== v) : (max && arr.length >= max) ? arr : [...arr, v]);

  async function save() {
    if (looking.length === 0) { setSaveErr('Pick at least one thing you’re looking for.'); return; }
    const bErr = validateParagraph(bio, 'Bio', { max: 500 });
    // Major is optional free-text (may be a composite like "UG • Computer Science") — length-check only.
    const mErr = major.trim().length > 60 ? 'Major must be under 60 characters.' : '';
    if (bErr || mErr) { setSaveErr(bErr || mErr); return; }
    setSaving(true); setSaveErr('');
    const sb = createClient();
    const row = { user_id: meId, looking_for: looking, interests, major: major.trim() || null, availability: availability.trim() || null, bio: bio.trim() || null, campus: campus.trim() || null, is_active: true, updated_at: new Date().toISOString() };
    const { data, error } = await sb.from('connection_profiles').upsert(row, { onConflict: 'user_id' }).select().single();
    setSaving(false);
    if (error) { setSaveErr(error.message || 'Could not save.'); return; }
    const isNew = !myProfile;
    setMyProfile(data as CP);
    setEditing(false);
    if (isNew) awardPoints('set_connection_profile');
  }

  const matches = others
    .map(o => ({ o, ...scoreMatch(myProfile, o, myCampus) }))
    .sort((a, b) => b.pct - a.pct);

  return (
    <StudentLayout title="Find Your People">
      <div style={{ maxWidth: 940, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, marginBottom:20, flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:13 }}>
            <div style={{ width:46, height:46, borderRadius:15, background:'linear-gradient(135deg,#12A150,#0F8A44)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 8px 20px rgba(18,161,80,0.28)', flexShrink:0 }}><UsersIcon /></div>
            <div>
              <h2 style={{ fontSize:26, fontWeight:800, letterSpacing:-0.6, color:'#12241C', marginBottom:2 }}>Find Your People</h2>
              <p style={{ fontSize:12.5, color:'#7D9188', margin:0 }}>Study buddies, friends, gym & project partners{myCampus ? ` · ${myCampus}` : ''}</p>
            </div>
          </div>
          <PointsBadge />
        </div>

        {!migrated && (
          <div style={{ ...card, marginBottom:18, borderColor:'rgba(224,138,30,0.3)', background:'rgba(224,138,30,0.06)', fontSize:13, color:'#4C6157' }}>
            Find Your People isn’t active yet. Run <code style={{ background:'rgba(18,36,28,0.06)', padding:'1px 6px', borderRadius:6 }}>db/feature-2-find-your-people.sql</code> in Supabase to enable it.
          </div>
        )}

        {/* My profile / form */}
        {migrated && (editing ? (
          <div style={{ ...card, marginBottom:22 }}>
            <p style={{ margin:'0 0 4px', fontSize:15, fontWeight:800, color:'#12241C' }}>{myProfile ? 'Edit your profile' : 'Set up your profile'}</p>
            <p style={{ margin:'0 0 18px', fontSize:12.5, color:'#7D9188' }}>Tell us who you want to meet — this is how others find you.</p>

            <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
              <div>
                <label style={{ fontSize:12, color:'#7D9188', display:'block', marginBottom:8 }}>I’m looking for <span style={{ color:'#9aa8a0' }}>(pick any)</span></label>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>{LOOKING_FOR.map(l => Pill(l, looking.includes(l), () => toggle(looking, setLooking, l)))}</div>
              </div>
              <div>
                <label style={{ fontSize:12, color:'#7D9188', display:'block', marginBottom:8 }}>Interests <span style={{ color:'#9aa8a0' }}>(up to 6)</span></label>
                <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>{INTERESTS.map(i => Pill(i, interests.includes(i), () => toggle(interests, setInterests, i, 6), !interests.includes(i) && interests.length >= 6))}</div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }} className="rg-2">
                <div>
                  <label style={{ fontSize:12, color:'#7D9188', display:'block', marginBottom:6 }}>Major</label>
                  <input value={major} onChange={e => setMajor(e.target.value)} placeholder="e.g. Computer Science" style={INP} />
                </div>
                <div>
                  <label style={{ fontSize:12, color:'#7D9188', display:'block', marginBottom:6 }}>Availability <span style={{ color:'#9aa8a0' }}>(optional)</span></label>
                  <input value={availability} onChange={e => setAvail(e.target.value)} placeholder="e.g. Evenings & weekends" style={INP} />
                </div>
              </div>
              <div>
                <label style={{ fontSize:12, color:'#7D9188', display:'block', marginBottom:6 }}>Campus</label>
                <UniversitySelect value={campus} onChange={setCampus} inputStyle={{ ...INP }} />
              </div>
              <div>
                <label style={{ fontSize:12, color:'#7D9188', display:'block', marginBottom:6 }}>Bio <span style={{ color:'#9aa8a0' }}>(optional)</span></label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="A little about you and what you’re after…" style={{ ...INP, height:'auto', padding:'10px 14px', resize:'none' }} />
              </div>
            </div>

            {saveErr && <div style={{ marginTop:14, padding:'10px 14px', borderRadius:10, background:'rgba(194,91,78,0.10)', border:'1px solid rgba(194,91,78,0.3)', color:'#C25B4E', fontSize:13 }}>{saveErr}</div>}

            <div style={{ display:'flex', gap:10, marginTop:18 }}>
              <button onClick={save} disabled={saving} className="ft-btn ft-btn-p" style={{ height:44, padding:'0 24px', fontSize:14 }}>{saving ? 'Saving…' : myProfile ? 'Save changes' : 'Save & find people'}</button>
              {myProfile && <button onClick={() => setEditing(false)} className="ft-btn ft-btn-o" style={{ height:44, padding:'0 20px', fontSize:14 }}>Cancel</button>}
            </div>
          </div>
        ) : myProfile && (
          <div style={{ ...card, marginBottom:22, display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:14, flexWrap:'wrap' }}>
            <div style={{ flex:1, minWidth:220 }}>
              <p style={{ margin:'0 0 10px', fontSize:13, fontWeight:800, color:'#12241C' }}>You’re visible to others as looking for:</p>
              <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginBottom:10 }}>
                {(myProfile.looking_for || []).map(l => <span key={l} style={{ fontSize:12, fontWeight:700, color:'#0F8A44', background:'rgba(18,161,80,0.10)', border:'1px solid rgba(18,161,80,0.22)', borderRadius:100, padding:'4px 11px' }}>{l}</span>)}
              </div>
              {(myProfile.interests || []).length > 0 && (
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {myProfile.interests.map(i => <span key={i} style={{ fontSize:11.5, color:'#7D9188', background:'rgba(18,36,28,0.04)', borderRadius:100, padding:'3px 10px' }}>{i}</span>)}
                </div>
              )}
            </div>
            <button onClick={() => setEditing(true)} className="ft-btn ft-btn-o" style={{ padding:'8px 16px' }}><EditIcon /> Edit</button>
          </div>
        ))}

        {/* Matches */}
        {migrated && (
          <>
            <p style={{ margin:'0 0 14px', fontSize:15, fontWeight:800, color:'#12241C' }}>
              {loading ? 'Finding your people…' : matches.length ? `${matches.length} ${matches.length === 1 ? 'student' : 'students'} to meet` : 'No one here yet'}
            </p>
            {!loading && matches.length === 0 && (
              <div style={{ ...card, textAlign:'center', color:'#7D9188', fontSize:13, padding:'40px 22px' }}>
                Be the first! Once you set up your profile, students who join your campus will show up here.
              </div>
            )}
            <div className="rg-3" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
              {matches.map(({ o, pct, sharedLook, sharedInt }) => {
                const p = people[o.user_id] || { full_name:'Student', avatar_url:'', is_verified:false, city:'' };
                return (
                  <div key={o.id} className="ft-card" style={{ padding:18, display:'flex', flexDirection:'column', gap:12 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:11 }}>
                      {p.avatar_url
                        ? <img src={p.avatar_url} alt="" style={{ width:44, height:44, borderRadius:'50%', objectFit:'cover', flexShrink:0 }} />
                        : <div style={{ width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg,#12A150,#0F8A44)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:15, flexShrink:0 }}>{ini(p.full_name)}</div>}
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                          <span style={{ fontSize:14, fontWeight:700, color:'#12241C', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.full_name || 'Student'}</span>
                          {p.is_verified && <CheckIcon />}
                        </div>
                        <div style={{ fontSize:12, color:'#7D9188', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{o.major || p.city || 'Student'}</div>
                      </div>
                      <span style={{ fontSize:12, fontWeight:800, color:'#0F8A44', background:'rgba(18,161,80,0.10)', border:'1px solid rgba(18,161,80,0.20)', borderRadius:100, padding:'3px 9px', flexShrink:0 }}>{pct}%</span>
                    </div>

                    <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                      {(o.looking_for || []).slice(0, 3).map(l => (
                        <span key={l} style={{ fontSize:11, fontWeight:600, color: sharedLook.includes(l) ? '#0F8A44' : '#7D9188', background: sharedLook.includes(l) ? 'rgba(18,161,80,0.10)' : 'rgba(18,36,28,0.04)', border: sharedLook.includes(l) ? '1px solid rgba(18,161,80,0.20)' : '1px solid transparent', borderRadius:100, padding:'3px 9px' }}>{l}</span>
                      ))}
                    </div>

                    {sharedInt.length > 0 && (
                      <div style={{ fontSize:11.5, color:'#7D9188' }}>
                        <span style={{ color:'#12A150', fontWeight:700 }}>{sharedInt.length}</span> shared interest{sharedInt.length > 1 ? 's' : ''}: {sharedInt.slice(0, 3).join(', ')}
                      </div>
                    )}

                    {o.bio && <p style={{ margin:0, fontSize:12.5, color:'#4C6157', lineHeight:1.5, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{o.bio}</p>}

                    <Link href={`/student/messages?to=${o.user_id}&name=${encodeURIComponent(p.full_name || 'Student')}`} className="ft-btn ft-btn-p" style={{ justifyContent:'center', marginTop:'auto' }}><ChatIcon /> Message</Link>
                  </div>
                );
              })}
            </div>
          </>
        )}

      </div>
    </StudentLayout>
  );
}

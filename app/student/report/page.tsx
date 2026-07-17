'use client';

import { useEffect, useState } from 'react';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { createClient } from '@/lib/supabase/client';
import { validateParagraph, validateEmail } from '@/lib/validation';

const FlagIcon   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>;
const CheckIcon  = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;

const ISSUE_TYPES = [
  'Order not delivered',
  'Wrong items received',
  'Vendor no-show (service)',
  'Billing / overcharge issue',
  'Inappropriate vendor behavior',
  'Account or login problem',
  'Roommate listing issue',
  'Other',
];

const I: React.CSSProperties = { width: '100%', padding: '10px 14px', background: 'rgba(18,36,28,0.05)', border: '1px solid rgba(18,36,28,0.12)', borderRadius: 10, color: '#12241C', fontSize: 14, boxSizing: 'border-box', outline: 'none' };
const L: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#4c6157', display: 'block', marginBottom: 6 };
const card: React.CSSProperties = { background: '#FFFFFF', border: '1px solid rgba(18,36,28,0.09)', borderRadius: 16, padding: 24 };

export default function ReportPage() {
  const [form, setForm] = useState({ type: '', orderId: '', description: '', email: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formErr, setFormErr] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [pastReports, setPastReports] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return;
      setUserEmail(user.email || '');
      setForm(f => ({ ...f, email: user.email || '' }));
      const { data } = await sb.from('reports').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5);
      setPastReports(data || []);
    })();
  }, []);

  async function submit() {
    if (!form.type) { setFormErr('Please choose an issue type.'); return; }
    const dErr = validateParagraph(form.description, 'Description', { min: 10, max: 600, required: true });
    const eErr = form.email.trim() ? validateEmail(form.email) : '';
    if (dErr || eErr) { setFormErr(dErr || eErr); return; }
    setFormErr('');
    setSubmitting(true);
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    await sb.from('reports').insert({
      user_id: user?.id,
      issue_type: form.type,
      order_id: form.orderId.trim() || null,
      description: form.description.trim(),
      contact_email: form.email.trim() || userEmail,
      status: 'open',
    });
    setSubmitting(false);
    setSubmitted(true);
  }

  const STATUS_COLOR: Record<string, string> = { open: '#E08A1E', in_review: '#12A150', resolved: '#12A150', closed: '#7d9188' };

  return (
    <StudentLayout title="Report an Issue">
        <div style={{ maxWidth: 580, margin: '0 auto', padding: '24px 0 60px' }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#12241C', margin: '0 0 4px', fontFamily: "'Bricolage Grotesque',sans-serif" }}>Report an Issue</h1>
          <p style={{ fontSize: 14, color: '#7d9188', margin: '0 0 24px' }}>We review every report and respond within 24 hours.</p>

          {submitted ? (
            <div style={{ ...card, textAlign: 'center', padding: 48 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(18,161,80,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#12A150' }}><CheckIcon /></div>
              <p style={{ fontSize: 18, fontWeight: 800, color: '#12241C', margin: '0 0 8px' }}>Report Submitted</p>
              <p style={{ fontSize: 14, color: '#7d9188', margin: '0 0 24px' }}>We've received your report and will follow up at <strong style={{ color: '#12241C' }}>{form.email || userEmail}</strong>.</p>
              <button onClick={() => { setSubmitted(false); setForm({ type: '', orderId: '', description: '', email: userEmail }); }}
                style={{ padding: '9px 22px', background: 'rgba(18,36,28,0.06)', border: '1px solid rgba(18,36,28,0.12)', borderRadius: 100, color: '#12241C', fontSize: 13, cursor: 'pointer' }}>
                Submit Another
              </button>
            </div>
          ) : (
            <div style={card}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={L}>Issue Type *</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    style={{ ...I, cursor: 'pointer' }}>
                    <option value="">Select issue type…</option>
                    {ISSUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label style={L}>Order / Booking ID <span style={{ color: '#7d9188', fontWeight: 400 }}>(optional)</span></label>
                  <input style={I} value={form.orderId} onChange={e => setForm(f => ({ ...f, orderId: e.target.value }))} placeholder="e.g. #A3F2 or #B1C9" />
                </div>

                <div>
                  <label style={L}>Describe the issue *</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Please provide as much detail as possible…" rows={5}
                    style={{ ...I, resize: 'vertical', lineHeight: 1.6 }} />
                </div>

                <div>
                  <label style={L}>Reply-to email</label>
                  <input style={I} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="your@email.com" />
                </div>

                {formErr && <div style={{ fontSize: 12, color: '#C25B4E', fontWeight: 600, marginBottom: 10 }}>{formErr}</div>}
                <button onClick={submit} disabled={submitting || !form.type || !form.description.trim()}
                  style={{ height: 46, background: !form.type || !form.description.trim() ? 'rgba(18,36,28,0.05)' : '#12A150', border: 'none', borderRadius: 100, color: !form.type || !form.description.trim() ? '#7d9188' : '#ffffff', fontSize: 14, fontWeight: 700, cursor: !form.type || !form.description.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all .2s' }}>
                  <FlagIcon /> {submitting ? 'Submitting…' : 'Submit Report'}
                </button>
              </div>
            </div>
          )}

          {pastReports.length > 0 && (
            <div style={{ marginTop: 28 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#12241C', margin: '0 0 12px' }}>Previous Reports</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {pastReports.map((r, i) => (
                  <div key={i} style={{ ...card, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#12241C' }}>{r.issue_type}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: '#7d9188' }}>{new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: `${STATUS_COLOR[r.status] || '#7d9188'}18`, color: STATUS_COLOR[r.status] || '#7d9188', textTransform: 'capitalize', flexShrink: 0 }}>
                      {(r.status || 'open').replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      
    </StudentLayout>
  );
}

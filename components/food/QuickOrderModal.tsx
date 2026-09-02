'use client';

// Simple tiffin ordering — deliberately NOT the cart/checkout flow.
// During the beta a student only answers three things: how many, what time,
// and where. No fulfillment choice, no payment step (Handout takes no money);
// the vendor is notified instantly and arranges the rest directly.

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Props = {
  listingId: string;
  vendorId: string;
  itemName: string;
  pricePerMeal: number | null;
  onClose: () => void;
};

const INP: React.CSSProperties = {
  width: '100%', height: 46, padding: '0 14px', background: '#F1F7F3',
  border: '1px solid rgba(18,36,28,0.12)', borderRadius: 10, color: '#12241C',
  fontSize: 14, outline: 'none', boxSizing: 'border-box',
};
const LBL: React.CSSProperties = {
  display: 'block', fontSize: 11.5, fontWeight: 700, color: '#4c6157',
  marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4,
};

// Keep it loose — the cook and student agree the exact time when she calls.
const TIMES = ['Lunch', 'Dinner'];

export function QuickOrderModal({ listingId, vendorId, itemName, pricePerMeal, onClose }: Props) {
  const [qty, setQty]         = useState(1);
  const [time, setTime]       = useState(TIMES[0]);
  const [address, setAddress] = useState('');
  const [notes, setNotes]     = useState('');
  const [busy, setBusy]       = useState(false);
  const [err, setErr]         = useState('');
  const [done, setDone]       = useState(false);

  const total = pricePerMeal != null ? pricePerMeal * qty : null;

  async function submit() {
    if (qty < 1)                  { setErr('Choose at least 1 tiffin.'); return; }
    if (address.trim().length < 6) { setErr('Please enter your delivery address.'); return; }

    setBusy(true); setErr('');
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { setErr('Please sign in again to place your order.'); setBusy(false); return; }

    const { error } = await sb.from('bookings').insert({
      student_id: user.id,
      provider_id: vendorId,
      listing_type: 'tiffin',
      listing_id: listingId,
      item_name: itemName,
      qty,
      scheduled_time: time,
      delivery_address: address.trim(),
      notes: notes.trim() || null,
      total_price: total,
      status: 'pending',
    });

    setBusy(false);
    if (error) { setErr(error.message); return; }
    setDone(true);   // the DB trigger notifies the vendor
  }

  return (
    <div onClick={onClose}
      style={{ position:'fixed', inset:0, background:'rgba(18,36,28,0.55)', backdropFilter:'blur(8px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div onClick={e => e.stopPropagation()}
        style={{ background:'#fff', border:'1px solid rgba(18,36,28,0.12)', borderRadius:22, padding:'26px 24px', width:'100%', maxWidth:440, maxHeight:'92vh', overflowY:'auto' }}>

        {done ? (
          <div style={{ textAlign:'center', padding:'12px 4px' }}>
            <div style={{ fontSize:38, marginBottom:10 }}>✅</div>
            <h3 style={{ fontSize:19, fontWeight:800, color:'#12241C', margin:'0 0 8px' }}>Request sent 🎉</h3>
            <p style={{ fontSize:13.5, color:'#4c6157', lineHeight:1.6, margin:'0 0 14px' }}>
              {itemName} — <strong>{qty} tiffin{qty > 1 ? 's' : ''}</strong> for {time}.
            </p>
            <div style={{ padding:'12px 14px', borderRadius:12, background:'rgba(18,161,80,0.07)', border:'1px solid rgba(18,161,80,0.22)', fontSize:13.5, color:'#12241C', lineHeight:1.6, marginBottom:18 }}>
              <strong>The cook will reach out to you soon</strong> to confirm your order and arrange payment directly.
            </div>
            <button onClick={onClose} className="ft-btn ft-btn-p" style={{ padding:'11px 24px' }}>Done</button>
          </div>
        ) : (
          <>
            <h3 style={{ fontSize:19, fontWeight:800, color:'#12241C', margin:'0 0 4px' }}>Order tiffin</h3>
            <p style={{ fontSize:13, color:'#7D9188', margin:'0 0 20px' }}>{itemName}</p>

            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {/* Quantity */}
              <div>
                <label style={LBL}>How many tiffins?</label>
                <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}
                    style={{ width:42, height:42, borderRadius:10, border:'1px solid rgba(18,36,28,0.14)', background:'#fff', fontSize:20, cursor:'pointer', color:'#12241C' }}>−</button>
                  <span className="ft-num" style={{ fontSize:22, minWidth:34, textAlign:'center', color:'#12241C' }}>{qty}</span>
                  <button onClick={() => setQty(q => Math.min(30, q + 1))}
                    style={{ width:42, height:42, borderRadius:10, border:'1px solid rgba(18,36,28,0.14)', background:'#fff', fontSize:20, cursor:'pointer', color:'#12241C' }}>+</button>
                  {total != null && (
                    <span style={{ marginLeft:'auto', fontSize:14, color:'#7D9188' }}>
                      Total <b className="ft-num" style={{ color:'#12A150', fontSize:17 }}>${total.toFixed(0)}</b>
                    </span>
                  )}
                </div>
              </div>

              {/* Time */}
              <div>
                <label style={LBL}>Lunch or dinner?</label>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {TIMES.map(t => (
                    <button key={t} type="button" onClick={() => setTime(t)}
                      style={{
                        padding:'9px 14px', borderRadius:100, fontSize:12.5, fontWeight:700, cursor:'pointer',
                        border:`1px solid ${time === t ? '#12A150' : 'rgba(18,36,28,0.12)'}`,
                        background: time === t ? 'rgba(18,161,80,0.10)' : '#fff',
                        color: time === t ? '#0F8A44' : '#7D9188',
                      }}>{t}</button>
                  ))}
                </div>
              </div>

              {/* Address */}
              <div>
                <label style={LBL}>Delivery address</label>
                <textarea value={address} onChange={e => setAddress(e.target.value)} rows={2}
                  placeholder="Building / apartment, street, Glassboro NJ"
                  style={{ ...INP, height:'auto', padding:'11px 14px', resize:'none' }} />
              </div>

              {/* Notes */}
              <div>
                <label style={LBL}>Notes <span style={{ color:'#9aa8a0', textTransform:'none', letterSpacing:0 }}>(optional)</span></label>
                <input value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Less spicy, no onion, call on arrival…" style={INP} />
              </div>
            </div>

            <div style={{ marginTop:16, padding:'10px 13px', borderRadius:10, background:'rgba(37,99,235,0.05)', border:'1px solid rgba(37,99,235,0.15)', fontSize:12.5, color:'#4C6157', lineHeight:1.5 }}>
              Handout doesn’t handle payment — we just connect you. The cook will contact you to confirm and arrange payment directly.
            </div>

            {err && <div style={{ marginTop:12, padding:'10px 14px', borderRadius:10, background:'rgba(194,91,78,0.10)', border:'1px solid rgba(194,91,78,0.3)', color:'#C25B4E', fontSize:13 }}>{err}</div>}

            <div style={{ display:'flex', gap:10, marginTop:18 }}>
              <button onClick={submit} disabled={busy} className="ft-btn ft-btn-p"
                style={{ height:46, flex:1, justifyContent:'center', fontSize:14 }}>
                {busy ? 'Placing order…' : 'Place order'}
              </button>
              <button onClick={onClose} className="ft-btn ft-btn-o" style={{ height:46, padding:'0 20px', fontSize:14 }}>Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

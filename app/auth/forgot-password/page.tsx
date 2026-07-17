"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { validateEmail } from "@/lib/validation";

const S = {
  wrap: { minHeight: "100vh", background: "#F1F7F3", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 } as React.CSSProperties,
  card: { width: "100%", maxWidth: 400, background: "#fff", border: "1px solid rgba(18,36,28,0.1)", borderRadius: 22, padding: "34px 30px", boxShadow: "0 20px 50px rgba(18,36,28,0.08)" } as React.CSSProperties,
  icon: { width: 48, height: 48, borderRadius: 14, background: "#E7F1EA", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18, color: "#12A150" } as React.CSSProperties,
  h1: { fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 24, fontWeight: 800, color: "#12241C", letterSpacing: -0.5, margin: "0 0 6px" } as React.CSSProperties,
  sub: { fontSize: 14, color: "#4c6157", lineHeight: 1.55, margin: "0 0 22px" } as React.CSSProperties,
  label: { display: "block", fontSize: 12.5, fontWeight: 700, color: "#4c6157", marginBottom: 7 } as React.CSSProperties,
  input: (err?: string): React.CSSProperties => ({ width: "100%", boxSizing: "border-box", height: 46, padding: "0 15px", background: "#F1F7F3", border: `1.5px solid ${err ? "#C25B4E" : "rgba(18,36,28,0.12)"}`, borderRadius: 12, color: "#12241C", fontSize: 14, outline: "none" }),
  err: { fontSize: 12, color: "#C25B4E", fontWeight: 600, marginTop: 6, display: "block" } as React.CSSProperties,
  btn: { width: "100%", height: 48, marginTop: 16, background: "#12A150", color: "#fff", border: "none", borderRadius: 100, fontSize: 15, fontWeight: 800, cursor: "pointer", boxShadow: "0 6px 16px rgba(18,161,80,0.26)" } as React.CSSProperties,
  link: { fontSize: 13, color: "#12A150", fontWeight: 700, textDecoration: "none" } as React.CSSProperties,
};

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function send() {
    const e = validateEmail(email);
    if (e) { setErr(e); return; }
    setErr(""); setBusy(true);
    const redirectTo = `${window.location.origin}/auth/callback?next=/auth/reset-password`;
    const { error } = await createClient().auth.resetPasswordForEmail(email.trim(), { redirectTo });
    setBusy(false);
    if (error && /rate|network|too many/i.test(error.message)) { setErr(error.message); return; }
    setSent(true);
  }

  return (
    <div style={S.wrap}>
      <div style={S.card} className="animate-fade-up">
        <div style={S.icon}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
        </div>
        {!sent ? (
          <>
            <h1 style={S.h1}>Reset your password</h1>
            <p style={S.sub}>Enter your university email and we&apos;ll send you a secure reset link.</p>
            <label style={S.label}>Email address</label>
            <input type="email" placeholder="you@university.edu" value={email}
              onChange={e => { setEmail(e.target.value); setErr(""); }}
              onKeyDown={e => e.key === "Enter" && send()}
              onFocus={e => (e.target.style.borderColor = "#12A150")}
              onBlur={e => (e.target.style.borderColor = err ? "#C25B4E" : "rgba(18,36,28,0.12)")}
              style={S.input(err)} />
            {err && <span style={S.err}>{err}</span>}
            <button onClick={send} disabled={busy} style={{ ...S.btn, opacity: busy ? 0.6 : 1 }}>{busy ? "Sending…" : "Send reset link"}</button>
          </>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>📬</div>
            <h1 style={S.h1}>Check your email</h1>
            <p style={S.sub}>If an account exists for <strong style={{ color: "#12241C" }}>{email}</strong>, we&apos;ve sent a reset link. Check your inbox and spam — it expires in 1 hour.</p>
            <button onClick={() => setSent(false)} style={{ ...S.link, background: "none", border: "none", cursor: "pointer" }}>Use a different email</button>
          </div>
        )}
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <Link href="/auth/login" style={S.link}>← Back to login</Link>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { validatePassword, passwordChecks } from "@/lib/validation";

const S = {
  wrap: { minHeight: "100vh", background: "#F1F7F3", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 } as React.CSSProperties,
  card: { width: "100%", maxWidth: 400, background: "#fff", border: "1px solid rgba(18,36,28,0.1)", borderRadius: 22, padding: "34px 30px", boxShadow: "0 20px 50px rgba(18,36,28,0.08)" } as React.CSSProperties,
  icon: { width: 48, height: 48, borderRadius: 14, background: "#E7F1EA", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18, color: "#12A150" } as React.CSSProperties,
  h1: { fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 24, fontWeight: 800, color: "#12241C", letterSpacing: -0.5, margin: "0 0 6px" } as React.CSSProperties,
  sub: { fontSize: 14, color: "#4c6157", lineHeight: 1.55, margin: "0 0 20px" } as React.CSSProperties,
  label: { display: "block", fontSize: 12.5, fontWeight: 700, color: "#4c6157", marginBottom: 7 } as React.CSSProperties,
  input: { width: "100%", boxSizing: "border-box", height: 46, padding: "0 15px", background: "#F1F7F3", border: "1.5px solid rgba(18,36,28,0.12)", borderRadius: 12, color: "#12241C", fontSize: 14, outline: "none", marginBottom: 14 } as React.CSSProperties,
  err: { fontSize: 12, color: "#C25B4E", fontWeight: 600, margin: "0 0 12px", display: "block" } as React.CSSProperties,
  btn: { width: "100%", height: 48, marginTop: 4, background: "#12A150", color: "#fff", border: "none", borderRadius: 100, fontSize: 15, fontWeight: 800, cursor: "pointer", boxShadow: "0 6px 16px rgba(18,161,80,0.26)" } as React.CSSProperties,
  link: { fontSize: 13, color: "#12A150", fontWeight: 700, textDecoration: "none" } as React.CSSProperties,
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await createClient().auth.getSession();
      setHasSession(!!session);
      setReady(true);
    })();
  }, []);

  const checks = passwordChecks(pw);

  async function submit() {
    const e = validatePassword(pw) || (pw !== pw2 ? "Passwords don't match" : "");
    if (e) { setErr(e); return; }
    setErr(""); setBusy(true);
    const { error } = await createClient().auth.updateUser({ password: pw });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setDone(true);
    setTimeout(() => router.push("/auth/login"), 2200);
  }

  const Check = ({ ok, label }: { ok: boolean; label: string }) => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 600, color: ok ? "#0F8A44" : "#7d9188" }}>
      <span style={{ width: 15, height: 15, borderRadius: "50%", background: ok ? "#12A150" : "rgba(18,36,28,0.1)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800 }}>{ok ? "✓" : ""}</span>{label}
    </span>
  );

  const field = (val: string, set: (v: string) => void, ph: string) => (
    <input type="password" value={val} onChange={e => { set(e.target.value); setErr(""); }} placeholder={ph}
      onKeyDown={e => e.key === "Enter" && submit()}
      onFocus={e => (e.target.style.borderColor = "#12A150")}
      onBlur={e => (e.target.style.borderColor = "rgba(18,36,28,0.12)")}
      style={S.input} />
  );

  return (
    <div style={S.wrap}>
      <div style={S.card} className="animate-fade-up">
        <div style={S.icon}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
        </div>

        {!ready ? (
          <p style={S.sub}>Loading…</p>
        ) : done ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 44, marginBottom: 8 }}>✅</div>
            <h1 style={S.h1}>Password updated</h1>
            <p style={S.sub}>You can now sign in with your new password. Redirecting…</p>
          </div>
        ) : !hasSession ? (
          <div style={{ textAlign: "center" }}>
            <h1 style={S.h1}>Link expired or invalid</h1>
            <p style={S.sub}>This reset link is no longer valid. Request a fresh one to continue.</p>
            <Link href="/auth/forgot-password" style={{ ...S.btn, display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none", width: "auto", padding: "0 24px" }}>Request a new link</Link>
          </div>
        ) : (
          <>
            <h1 style={S.h1}>Set a new password</h1>
            <p style={S.sub}>Choose a strong password for your Handout account.</p>
            <label style={S.label}>New password</label>
            {field(pw, setPw, "••••••••")}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", margin: "-4px 0 14px" }}>
              <Check ok={checks.length} label="8+ characters" />
              <Check ok={checks.upper} label="Uppercase" />
              <Check ok={checks.lower} label="Lowercase" />
              <Check ok={checks.number} label="Number" />
            </div>
            <label style={S.label}>Confirm password</label>
            {field(pw2, setPw2, "••••••••")}
            {err && <span style={S.err}>{err}</span>}
            <button onClick={submit} disabled={busy} style={{ ...S.btn, opacity: busy ? 0.6 : 1 }}>{busy ? "Updating…" : "Update password"}</button>
          </>
        )}
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <Link href="/auth/login" style={S.link}>← Back to login</Link>
        </div>
      </div>
    </div>
  );
}

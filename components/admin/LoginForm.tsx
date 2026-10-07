"use client";
import { useRef, useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";

export function LoginForm({ configured }: { configured: boolean }) {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured) { setError("Sign-in is temporarily unavailable."); return; }
    if (pending.current) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    pending.current = true; setBusy(true); setError("");
    try {
      const result = await signIn("credentials", { username: values.get("username"), password: values.get("password"), redirect: false, callbackUrl: "/admin" });
      if (result?.ok && !result.error) { form.reset(); window.location.replace("/admin"); return; }
      setError("Invalid username or password.");
    } catch { setError("Sign-in is temporarily unavailable. Please try again."); }
    finally { pending.current = false; setBusy(false); }
  }
  return <main id="main" className="admin-login">
    <div className="admin-login-brand"><Link href="/">FEB <span>2026</span></Link><span>Administration</span></div>
    <div className="admin-login-content">
      <ShieldCheck className="admin-login-icon" size={30} aria-hidden="true" />
      <p className="admin-kicker">FEB Admin</p><h1>Welcome back</h1><p className="admin-muted">Sign in to manage applications.</p>
      {!configured && <p role="alert" className="admin-error">Sign-in is temporarily unavailable.</p>}
      <form onSubmit={submit} className="admin-login-form" aria-busy={busy}>
        <fieldset disabled={busy || !configured}>
          <label htmlFor="admin-username">Username</label><input id="admin-username" name="username" autoComplete="username" required maxLength={120} />
          <label htmlFor="admin-password">Password</label><div className="admin-password"><input id="admin-password" name="password" autoComplete="current-password" type={visible ? "text" : "password"} required maxLength={72} /><button type="button" className="admin-icon" aria-label={visible ? "Hide password" : "Show password"} title={visible ? "Hide password" : "Show password"} onClick={() => setVisible(value => !value)}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
          {error && <p role="alert" className="admin-error">{error}</p>}
          <button type="submit" className="admin-button primary">{busy ? <><Loader2 size={18} className="animate-spin" /> Signing in</> : <>Sign in <ArrowRight size={18} /></>}</button>
        </fieldset>
      </form>
    </div><p className="admin-login-footer">Finance, Economics &amp; Banking</p>
  </main>;
}

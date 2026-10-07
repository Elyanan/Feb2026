"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { LayoutDashboard, Users, ExternalLink, LogOut, Menu, X, ShieldCheck } from "lucide-react";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const drawer = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { drawer.current?.close(); }, [pathname]);
  async function logout() {
    if (busy) return;
    setBusy(true); setError("");
    try { await signOut({ redirect: false }); window.location.replace("/admin/login"); }
    catch { setError("Couldn't sign out. Please try again."); setBusy(false); }
  }
  function nav() {
    return <><Link href="/admin" className="admin-brand">FEB <span>Admin</span></Link><p className="admin-kicker">Workspace</p><nav aria-label="Admin navigation">
      <Link href="/admin" aria-current={pathname === "/admin" ? "page" : undefined}><LayoutDashboard size={18} /> Dashboard</Link>
      <Link href="/admin/registrations" aria-current={pathname === "/admin/registrations" ? "page" : undefined}><Users size={18} /> Registrations</Link>
    </nav><div className="admin-sidebar-bottom"><Link href="/studio" target="_blank" rel="noopener noreferrer"><ExternalLink size={16} /> Sanity Studio</Link><button onClick={logout} disabled={busy}><LogOut size={16} /> {busy ? "Signing out" : "Sign out"}</button>{error && <p className="admin-error" role="alert">{error}</p>}<p>FEB 2026</p></div></>;
  }
  return <div className="admin-shell"><aside className="admin-sidebar">{nav()}</aside>
    <dialog ref={drawer} className="admin-nav-drawer" aria-label="Admin navigation"><button className="admin-icon admin-drawer-close" aria-label="Close navigation" title="Close navigation" onClick={() => drawer.current?.close()}><X size={20} /></button>{nav()}</dialog>
    <div className="admin-workspace"><header className="admin-topbar"><button className="admin-icon admin-menu" aria-label="Open navigation" title="Open navigation" onClick={() => drawer.current?.showModal()}><Menu size={20} /></button><span>Application management</span><span className="admin-session"><ShieldCheck size={16} /> Administrator</span></header><main id="main" className="admin-main">{children}</main></div>
  </div>;
}

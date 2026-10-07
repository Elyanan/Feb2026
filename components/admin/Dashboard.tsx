"use client";
import { useCallback, useEffect, useState } from "react";
import { Users, Clock3, UserCheck, UserX, RefreshCw, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { RegistrationStats } from "@/types/registration";
import { adminFetch } from "./client";

export function Dashboard() {
  const [stats, setStats] = useState<RegistrationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshed, setRefreshed] = useState("");
  const refresh = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError("");
    try { setStats(await adminFetch<RegistrationStats>("/api/admin/stats", { signal })); setRefreshed(new Date().toLocaleTimeString()); }
    catch (error) { if (!signal?.aborted) setError(error instanceof Error ? error.message : "Please try again."); }
    finally { if (!signal?.aborted) setLoading(false); }
  }, []);
  useEffect(() => { const controller = new AbortController(); const timer = setTimeout(() => void refresh(controller.signal), 0); return () => { clearTimeout(timer); controller.abort(); }; }, [refresh]);
  const metrics = [
    { label: "Total registrations", value: stats?.total, icon: Users, color: "blue", status: "" },
    { label: "Pending", value: stats?.pending, icon: Clock3, color: "amber", status: "Pending" },
    { label: "In", value: stats?.accepted, icon: UserCheck, color: "green", status: "In" },
    { label: "Not in", value: stats?.declined, icon: UserX, color: "red", status: "Not in" }
  ];
  return <><div className="admin-page-heading"><div><p className="admin-kicker">FEB 2026</p><h1>Dashboard</h1><p className="admin-muted">Registration overview</p></div><button className="admin-button" onClick={() => void refresh()} disabled={loading}><RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh</button></div>
    {error && <div role="alert" className="admin-error-banner">{error}</div>}
    <div className="admin-metrics">{metrics.map((metric, index) => <Link key={metric.label} href={`/admin/registrations${metric.status ? `?status=${encodeURIComponent(metric.status)}` : ""}`} className={`admin-metric ${metric.color}`} style={{ animationDelay: `${index * 50}ms` }}><div><p>{metric.label}</p><metric.icon size={19} /></div>{loading ? <span className="admin-skeleton" /> : <strong>{metric.value ?? "--"}</strong>}<span>View registrations <ArrowRight size={14} /></span></Link>)}</div>
    {!error && <div className="admin-insights"><Distribution title="By grade" items={stats?.grades ?? []} loading={loading} /><Distribution title="Areas of interest" items={stats?.areas ?? []} loading={loading} /></div>}
    <p className="admin-refreshed">{refreshed ? `Last refreshed ${refreshed}` : ""}</p>
  </>;
}
function Distribution({ title, items, loading }: { title: string; items: { label: string; count: number }[]; loading: boolean }) {
  const maximum = Math.max(1, ...items.map(item => item.count));
  return <section className="admin-distribution"><h2>{title}</h2>{loading ? <div className="admin-loading"><div /><div /><div /></div> : items.every(item => item.count === 0) ? <p className="admin-muted">No registrations yet.</p> : <ul>{items.map(item => <li key={item.label}><div><span>{item.label}</span><strong>{item.count}</strong></div><div className="admin-bar-track" aria-hidden="true"><span style={{ width: `${item.count / maximum * 100}%` }} /></div></li>)}</ul>}</section>;
}

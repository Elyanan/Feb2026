"use client";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, RefreshCw, Download, X, ChevronLeft, ChevronRight, Users, Loader2 } from "lucide-react";
import { areas, grades, statuses } from "@/lib/validation/registration-options";
import type { RegistrationPage } from "@/types/registration";
import { adminFetch, dateLabel } from "./client";
import { StatusBadge } from "./StatusBadge";
import { RegistrationDetail } from "./RegistrationDetail";

export function Registrations() {
  const params = useSearchParams();
  const [status, setStatus] = useState(params.get("status") || "");
  const [grade, setGrade] = useState("");
  const [area, setArea] = useState("");
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<RegistrationPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [scope, setScope] = useState("filtered");
  const [exporting, setExporting] = useState(false);
  const [notice, setNotice] = useState("");
  const [refreshed, setRefreshed] = useState("");
  useEffect(() => { const timer = setTimeout(() => { setDebounced(search); setPage(1); }, 300); return () => clearTimeout(timer); }, [search]);
  const query = new URLSearchParams({ sort, page: String(page), pageSize: "25" });
  if (status) query.set("status", status); if (grade) query.set("grade", grade); if (area) query.set("area", area); if (debounced.trim()) query.set("search", debounced.trim());
  const queryString = query.toString();
  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError("");
    try { setData(await adminFetch<RegistrationPage>(`/api/admin/registrations?${queryString}`, { signal })); setRefreshed(new Date().toLocaleTimeString()); }
    catch (error) { if (!signal?.aborted) setError(error instanceof Error ? error.message : "Please try again."); }
    finally { if (!signal?.aborted) setLoading(false); }
  }, [queryString]);
  useEffect(() => { const controller = new AbortController(); const timer = setTimeout(() => void load(controller.signal), 0); return () => { clearTimeout(timer); controller.abort(); }; }, [load]);
  function clear() { setStatus(""); setGrade(""); setArea(""); setSort("newest"); setSearch(""); setDebounced(""); setPage(1); }
  async function exportCSV() {
    if (exporting) return;
    setExporting(true); setError(""); setNotice("");
    try {
      const response = await fetch(`/api/admin/export${scope === "filtered" ? `?${queryString}` : ""}`, { cache: "no-store", signal: AbortSignal.timeout(60000) });
      if (response.status === 401 || response.status === 403) { window.location.replace("/admin/login"); return; }
      if (!response.ok) throw new Error("Couldn't export applications. Please try again.");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob); const link = document.createElement("a");
      link.href = url; link.download = `feb-registrations-${new Date().toISOString().slice(0, 10)}.csv`; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000); setNotice("CSV exported.");
    } catch { setError("Couldn't export applications. Please try again."); }
    finally { setExporting(false); }
  }
  const filtered = Boolean(status || grade || area || search || sort !== "newest");
  const pages = Math.max(1, Math.ceil((data?.total ?? 0) / 25));
  return <><div className="admin-page-heading"><div><p className="admin-kicker">Applications</p><h1>Registrations</h1><p className="admin-muted">Review applicants and manage their status.</p></div><div className="admin-heading-actions"><button className="admin-icon" title="Refresh registrations" aria-label="Refresh registrations" disabled={loading} onClick={() => void load()}><RefreshCw size={18} className={loading ? "animate-spin" : ""} /></button><select aria-label="Export scope" value={scope} onChange={event => setScope(event.target.value)}><option value="filtered">Filtered registrations</option><option value="all">All registrations</option></select><button className="admin-button primary" onClick={() => void exportCSV()} disabled={exporting || loading}>{exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}{exporting ? "Exporting" : "Export CSV"}</button></div></div>
    <div className="admin-filters"><div className="admin-search"><Search size={17} aria-hidden="true" /><input type="search" aria-label="Search registrations" placeholder="Search applications" maxLength={120} value={search} onChange={event => setSearch(event.target.value)} /></div>
      <select aria-label="Filter by status" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}><option value="">All statuses</option>{statuses.map(value => <option key={value}>{value}</option>)}</select>
      <select aria-label="Filter by grade" value={grade} onChange={event => { setGrade(event.target.value); setPage(1); }}><option value="">All grades</option>{grades.map(value => <option key={value}>{value}</option>)}</select>
      <select aria-label="Filter by area" value={area} onChange={event => { setArea(event.target.value); setPage(1); }}><option value="">All areas</option>{areas.map(value => <option key={value}>{value}</option>)}</select>
      <select aria-label="Sort registrations" value={sort} onChange={event => { setSort(event.target.value); setPage(1); }}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="name">Name</option><option value="grade">Grade</option><option value="status">Status</option></select>
      {filtered && <button className="admin-clear" onClick={clear}><X size={14} /> Clear filters</button>}
    </div>
    {notice && <p role="status" className="admin-notice">{notice}</p>}{error && <div role="alert" className="admin-error-banner">{error}<button className="admin-button" onClick={() => void load()}>Try again</button></div>}
    <section className="admin-records" aria-label="Registration results" aria-busy={loading}>
      {loading ? <div className="admin-table-skeleton" role="status" aria-label="Loading registrations">{Array.from({ length: 6 }, (_, index) => <div className="admin-skeleton" key={index} />)}</div> : !data?.items.length ? <div className="admin-empty"><Users size={32} aria-hidden="true" /><h2>{filtered ? "No matching applications" : "No applications yet"}</h2><p>{filtered ? "Try a different search or clear your filters." : "New submissions will appear here."}</p>{filtered && <button className="admin-button" onClick={clear}>Clear filters</button>}</div> : <>
        <div className="admin-table-scroll"><table><thead><tr>{["Applicant", "Grade", "Email", "Phone", "Area", "Submitted", "Status"].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>{data.items.map(record => <tr key={record._id} onClick={() => setSelected(record._id)}><td><button className="admin-applicant" onClick={() => setSelected(record._id)}>{record.fullName}</button></td><td>{record.grade}</td><td>{record.email}</td><td>{record.phone}</td><td>{record.area}</td><td>{dateLabel(record.submittedAt)}</td><td><StatusBadge status={record.status} /></td></tr>)}</tbody></table></div>
        <div className="admin-mobile-records">{data.items.map(record => <button className="admin-mobile-record" key={record._id} onClick={() => setSelected(record._id)}><div><strong>{record.fullName}</strong><StatusBadge status={record.status} /></div><p>{record.grade} / {record.area}</p><span>{record.email}</span><span>{record.phone}</span><small>{dateLabel(record.submittedAt)}</small></button>)}</div>
      </>}
      <footer className="admin-pagination"><span>{data?.total ? `${(page - 1) * 25 + 1}-${Math.min(page * 25, data.total)} of ${data.total}` : "0 registrations"}</span><div><button className="admin-icon" title="Previous page" aria-label="Previous page" disabled={page <= 1 || loading} onClick={() => setPage(value => value - 1)}><ChevronLeft size={18} /></button><span>Page {page} of {pages}</span><button className="admin-icon" title="Next page" aria-label="Next page" disabled={page >= pages || loading} onClick={() => setPage(value => value + 1)}><ChevronRight size={18} /></button></div></footer>
    </section><p className="admin-refreshed">{refreshed ? `Last refreshed ${refreshed}` : ""}</p>
    {selected && <RegistrationDetail key={selected} id={selected} onClose={() => setSelected(null)} onUpdated={() => void load()} />}
  </>;
}

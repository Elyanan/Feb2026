"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Copy, Check, X, Loader2, Trash2 } from "lucide-react";
import type { RegistrationRecord, RegistrationStatus } from "@/types/registration";
import { statuses } from "@/lib/validation/registration-options";
import { adminFetch, dateLabel } from "./client";
import { StatusBadge } from "./StatusBadge";
import { DeleteRegistrationDialog } from "./DeleteRegistrationDialog";

export function RegistrationDetail({ id, onClose, onUpdated, onDeleted }: { id: string; onClose: () => void; onUpdated: () => void; onDeleted: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const deleteTrigger = useRef<HTMLButtonElement>(null);
  const [record, setRecord] = useState<RegistrationRecord | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const load = useCallback(async (signal?: AbortSignal) => {
    setError("");
    try { setRecord(await adminFetch<RegistrationRecord>(`/api/admin/registrations/${id}`, { signal })); }
    catch (error) { if (!signal?.aborted) setError(error instanceof Error ? error.message : "Please try again."); }
  }, [id]);
  useEffect(() => {
    dialog.current?.showModal();
    const controller = new AbortController(); const timer = setTimeout(() => void load(controller.signal), 0);
    const previousOverflow = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { clearTimeout(timer); controller.abort(); document.body.style.overflow = previousOverflow; };
  }, [load]);
  async function changeStatus(status: RegistrationStatus) {
    if (!record || busy || status === record.status) return;
    setBusy(true); setError(""); setNotice("");
    try {
      await adminFetch(`/api/admin/registrations/${id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      setRecord(current => current && { ...current, status }); setNotice("Status updated."); onUpdated();
    } catch (error) { setError(error instanceof Error ? error.message : "Couldn't update status. Please try again."); }
    finally { setBusy(false); }
  }
  async function copy(value: string, label: string) {
    try { await navigator.clipboard.writeText(value); setNotice(`${label} copied.`); } catch { setError("Couldn't copy. Please select and copy the value."); }
  }
  return <><dialog ref={dialog} className="admin-detail" aria-labelledby="applicant-title" onCancel={onClose} onClose={onClose}>
    <div className="admin-detail-header"><span className="admin-kicker">Application</span><button className="admin-icon" title="Close application" aria-label="Close application" onClick={onClose}><X size={20} /></button></div>
    {record ? <div className="admin-detail-body"><h2 id="applicant-title">{record.fullName}</h2><p className="admin-muted">{record.grade} / {record.area}</p><div className="admin-detail-status"><StatusBadge status={record.status} /><label>Change status<select aria-label="Change status" value={record.status} disabled={busy} onChange={event => void changeStatus(event.target.value as RegistrationStatus)}>{statuses.map(status => <option key={status}>{status}</option>)}</select></label>{busy && <Loader2 className="animate-spin" size={18} aria-label="Saving status" />}</div>
      {error && <p className="admin-error" role="alert">{error}</p>}{notice && <p className="admin-notice" role="status"><Check size={15} />{notice}</p>}
      <dl className="admin-contact"><div><dt>Email</dt><dd>{record.email}<button className="admin-icon" title="Copy email" aria-label="Copy email" onClick={() => void copy(record.email, "Email")}><Copy size={16} /></button></dd></div><div><dt>Phone</dt><dd>{record.phone}<button className="admin-icon" title="Copy phone number" aria-label="Copy phone number" onClick={() => void copy(record.phone, "Phone")}><Copy size={16} /></button></dd></div><div><dt>Submitted</dt><dd>{dateLabel(record.submittedAt)}</dd></div><div><dt>Source</dt><dd>{record.source}</dd></div></dl>
      <section className="admin-answer"><h3>Motivation</h3><p>{record.motivation}</p></section><section className="admin-answer"><h3>Question for banker</h3><p>{record.speakerQuestion}</p></section><section className="admin-answer"><h3>Admin notes</h3><p>{record.adminNotes || "No notes yet."}</p></section>
      <div className="admin-delete-section"><button ref={deleteTrigger} className="admin-button destructive" disabled={busy} onClick={() => setConfirmingDelete(true)}><Trash2 size={16} />Delete registration</button></div>
    </div> : error ? <div className="admin-empty"><h2 id="applicant-title">Application unavailable</h2><p role="alert">{error}</p><button className="admin-button" onClick={() => void load()}>Try again</button></div> : <div className="admin-loading" role="status" aria-label="Loading application"><h2 id="applicant-title" className="sr-only">Loading application</h2><div /><div /><div /></div>}
  </dialog>{confirmingDelete && record && <DeleteRegistrationDialog id={id} name={record.fullName} onCancel={() => { setConfirmingDelete(false); deleteTrigger.current?.focus(); }} onDeleted={onDeleted} />}</>;
}

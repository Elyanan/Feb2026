"use client";
import { useEffect, useRef, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { adminFetch } from "./client";

export function DeleteRegistrationDialog({ id, name, onCancel, onDeleted }: { id: string; name: string; onCancel: () => void; onDeleted: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  const pending = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const element = dialog.current;
    element?.showModal(); cancel.current?.focus();
    return () => { element?.close(); };
  }, []);
  async function remove() {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError("");
    try {
      const result = await adminFetch<{ ok: boolean }>(`/api/admin/registrations/${id}`, { method: "DELETE" });
      if (!result.ok) throw new Error("Delete was not confirmed");
      onDeleted();
    } catch { setError("Could not delete this registration. Please try again."); }
    finally { pending.current = false; setBusy(false); }
  }
  function dismiss() {
    if (pending.current) return;
    dialog.current?.close();
    onCancel();
  }
  return <dialog ref={dialog} className="admin-delete-dialog" aria-labelledby="delete-title" aria-describedby="delete-description" aria-busy={busy} onCancel={event => { event.preventDefault(); dismiss(); }}>
    <h2 id="delete-title">Delete registration?</h2>
    <p id="delete-description">You are about to permanently delete the registration for <strong>{name}</strong>This action cannot be undone.</p>
    {error && <p className="admin-error" role="alert">{error}</p>}
    <div className="admin-delete-actions"><button ref={cancel} className="admin-button" disabled={busy} onClick={dismiss}>Cancel</button><button className="admin-button danger" disabled={busy} onClick={() => void remove()}>{busy ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}{busy ? "Deleting" : "Delete permanently"}</button></div>
  </dialog>;
}

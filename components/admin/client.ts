export async function adminFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, { ...options, cache: "no-store", signal: options.signal ?? AbortSignal.timeout(20000) });
  if (response.status === 401 || response.status === 403) { window.location.replace("/admin/login"); throw new Error("Please sign in again."); }
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "We couldn't complete this request. Please try again.");
  return data as T;
}
export function dateLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? "Unavailable" : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

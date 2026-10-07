import { ZodError } from "zod";
import { adminApiGuard, privateJson, adminFailure } from "@/lib/admin/http";
import { parseFilters } from "@/lib/admin/validation";
import { csvFields, csvRow } from "@/lib/admin/csv";
import { exportRegistrations } from "@/lib/sanity/adminRegistrations";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const denied = await adminApiGuard(); if (denied) return denied;
  try {
    const records = exportRegistrations(parseFilters(request.url));
    // Fetch the first page before sending headers so upstream failures remain proper errors.
    const first = await records.next();
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) { controller.enqueue(encoder.encode("\uFEFF" + csvFields.join(",") + "\r\n")); if (!first.done) controller.enqueue(encoder.encode(csvRow(first.value))); },
      async pull(controller) {
        try { const item = await records.next(); if (item.done) controller.close(); else controller.enqueue(encoder.encode(csvRow(item.value))); }
        catch { controller.error(new Error("Export interrupted")); }
      },
      async cancel() { await records.return(undefined); }
    });
    return new Response(stream, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="feb-registrations-${new Date().toISOString().slice(0, 10)}.csv"`, "Cache-Control": "private, no-store", "Vary": "Cookie" } });
  } catch (error) { return error instanceof ZodError ? privateJson({ message: "Invalid filters." }, 400) : adminFailure(); }
}

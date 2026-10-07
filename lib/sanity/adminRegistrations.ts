import "server-only";
import { areas, grades } from "@/lib/validation/registration-options";
import { filtersSchema, registrationIdSchema, statusUpdateSchema, type RegistrationFilters } from "@/lib/admin/validation";
import type { RegistrationPage, RegistrationRecord, RegistrationStats } from "@/types/registration";
import { getServerClient, requirePrivateDataset } from "./serverClient";
import { detailProjection, registrationByIdQuery, registrationPredicate, summaryProjection } from "./queries";

// All route/page callers must authorize before invoking these server-only helpers.
const sortOrders = { newest: "submittedAt desc", oldest: "submittedAt asc", name: "fullName asc", grade: "grade asc, fullName asc", status: "status asc, fullName asc" } as const;
function parameters(options: RegistrationFilters) {
  const search = options.search.replace(/[?*\\]/g, "");
  return { status: options.status ?? null, grade: options.grade ?? null, area: options.area ?? null, search: search ? `*${search}*` : "" };
}
async function privateClient() {
  const client = getServerClient();
  await requirePrivateDataset(client);
  return client;
}
export async function getRegistrations(input: Partial<RegistrationFilters> = {}): Promise<RegistrationPage> {
  const options = filtersSchema.parse(input);
  const client = await privateClient();
  const start = (options.page - 1) * options.pageSize;
  // GROQ requires literal slice bounds; both numbers come from validated integers.
  const query = `{"items": *[${registrationPredicate}] | order(${sortOrders[options.sort]}, _id asc) [${start}...${start + options.pageSize}]{${summaryProjection}}, "total": count(*[${registrationPredicate}])}`;
  const result = await client.fetch<{ items: RegistrationPage["items"]; total: number }>(query, parameters(options));
  return { ...result, page: options.page, pageSize: options.pageSize };
}
export async function getRegistrationById(id: string) {
  registrationIdSchema.parse(id);
  return (await privateClient()).fetch<RegistrationRecord | null>(registrationByIdQuery, { id });
}
export async function getRegistrationStats(): Promise<RegistrationStats> {
  const client = await privateClient();
  const base = `_type == "registration" && !(_id in path("drafts.**"))`;
  const gradeCounts = grades.map((_, index) => `{"label": $grade${index}, "count": count(*[${base} && grade == $grade${index}])}`).join(",");
  const areaCounts = areas.map((_, index) => `{"label": $area${index}, "count": count(*[${base} && area == $area${index}])}`).join(",");
  const query = `{"total": count(*[${base}]), "pending": count(*[${base} && status == "Pending"]), "accepted": count(*[${base} && status == "In"]), "declined": count(*[${base} && status == "Not in"]), "gradeCounts": [${gradeCounts}], "areaCounts": [${areaCounts}]}`;
  const params = Object.fromEntries([...grades.map((value, index) => [`grade${index}`, value]), ...areas.map((value, index) => [`area${index}`, value])]);
  const result = await client.fetch<{ total: number; pending: number; accepted: number; declined: number; gradeCounts: RegistrationStats["grades"]; areaCounts: RegistrationStats["areas"] }>(query, params);
  return { total: result.total, pending: result.pending, accepted: result.accepted, declined: result.declined, grades: result.gradeCounts, areas: result.areaCounts };
}
export async function* exportRegistrations(input: Partial<RegistrationFilters>) {
  const options = filtersSchema.parse(input);
  const client = await privateClient();
  let cursor = "";
  while (true) {
    const query = `*[${registrationPredicate} && _id > $cursor] | order(_id asc)[0...500]{${detailProjection}}`;
    const records = await client.fetch<RegistrationRecord[]>(query, { ...parameters(options), cursor });
    for (const record of records) yield record;
    if (records.length < 500) return;
    cursor = records[records.length - 1]._id;
  }
}
export class RegistrationNotFoundError extends Error {}
export async function deleteRegistration(id: string) {
  registrationIdSchema.parse(id);
  const client = await privateClient();
  const record = await client.fetch<{ _type: string; _rev: string } | null>(`*[_id == $id][0]{_type, _rev}`, { id }, { perspective: "raw" });
  if (record?._type !== "registration") throw new RegistrationNotFoundError();
  // Abort the entire transaction if the record changed after its type was verified.
  await client.transaction()
    .patch(id, patch => patch.ifRevisionId(record._rev).set({ updatedAt: new Date().toISOString() }))
    .delete(id).commit({ visibility: "sync" });
}
export async function updateRegistrationStatus(id: string, status: string) {
  registrationIdSchema.parse(id);
  const { status: nextStatus } = statusUpdateSchema.parse({ status });
  const client = await privateClient();
  const record = await client.fetch<{ _type: string; _rev: string } | null>(`*[_id == $id][0]{_type, _rev}`, { id });
  if (record?._type !== "registration") throw new RegistrationNotFoundError();
  return client.patch(id).ifRevisionId(record._rev).set({ status: nextStatus, updatedAt: new Date().toISOString() }).commit();
}

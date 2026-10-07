import { z } from "zod";
import { areas, grades, statuses } from "@/lib/validation/registration-options";
export const registrationIdSchema = z.string().regex(/^registration\.[a-f0-9]{64}$/);
export const filtersSchema = z.object({
  status: z.enum(statuses).optional(), grade: z.enum(grades).optional(), area: z.enum(areas).optional(),
  search: z.string().trim().max(120).default(""),
  sort: z.enum(["newest", "oldest", "name", "grade", "status"]).default("newest"),
  page: z.coerce.number().int().min(1).max(100000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25)
});
export type RegistrationFilters = z.infer<typeof filtersSchema>;
export function parseFilters(url: string) {
  return filtersSchema.parse(Object.fromEntries(new URL(url).searchParams));
}
export const statusUpdateSchema = z.object({ status: z.enum(statuses) }).strict();

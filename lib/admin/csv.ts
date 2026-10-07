import type { RegistrationRecord } from "@/types/registration";
export const csvFields = ["submittedAt", "fullName", "grade", "email", "phone", "motivation", "area", "speakerQuestion", "source", "status"] as const;
export function csvCell(value: unknown) {
  let text = String(value ?? "");
  // Defuse spreadsheet formulas, including leading whitespace/control characters.
  if (/^[\s\u0000-\u001f]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}
export function csvRow(record: RegistrationRecord) { return csvFields.map(field => csvCell(record[field])).join(",") + "\r\n"; }

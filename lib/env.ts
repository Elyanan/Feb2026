import "server-only";
import { z } from "zod";

export class ConfigurationError extends Error {
  constructor(public readonly issues: string[]) {
    super(`Configuration incomplete: ${issues.join(", ")}`);
    this.name = "ConfigurationError";
  }
}
const required = z.string().min(1, "is missing");
const secret = z.string().min(32, "must contain at least 32 characters");
const sanitySchema = z.object({
  NEXT_PUBLIC_SANITY_PROJECT_ID: required.regex(/^[a-z0-9]+$/, "must be a valid project ID"),
  NEXT_PUBLIC_SANITY_DATASET: required.regex(/^[a-z0-9][a-z0-9_-]*$/, "must be a valid dataset name"),
  NEXT_PUBLIC_SANITY_API_VERSION: required.regex(/^\d{4}-\d{2}-\d{2}$/, "must be a YYYY-MM-DD date").refine(value => Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value, "must be a valid date"),
  SANITY_API_WRITE_TOKEN: required,
});
const authSchema = z.object({
  ADMIN_USERNAME: required.max(120, "must be at most 120 characters"),
  ADMIN_PASSWORD_HASH: required.regex(/^\$2[aby]\$(1[2-6])\$[./A-Za-z0-9]{53}$/, "must be a bcrypt hash with cost 12-16, not a plaintext password"),
  AUTH_SECRET: secret,
});
function validate<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
  const result = schema.safeParse(process.env);
  if (!result.success) throw new ConfigurationError(result.error.issues.map(issue => `${issue.path.join(".")} ${issue.message}`));
  return result.data;
}
// Validate only the subsystem being used; public rendering does not require admin credentials.
export function getSanityEnvironment() { return validate(sanitySchema); }
export function getAuthEnvironment() { return validate(authSchema); }
export function getRegistrationSecret() {
  return validate(z.object({ REGISTRATION_FORM_SECRET: secret })).REGISTRATION_FORM_SECRET;
}

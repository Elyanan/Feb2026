import "server-only";
import { ConfigurationError } from "./env";

export function developmentInfo(scope: string, stage: string) {
  if (process.env.NODE_ENV === "development") console.info(`[${scope}] ${stage}`);
}
export function developmentError(scope: string, stage: string, error: unknown) {
  if (process.env.NODE_ENV !== "development") return;
  if (error instanceof ConfigurationError) {
    console.error(`[${scope}] ${stage}: ${error.issues.join("; ")}`);
    return;
  }
  // SDK exceptions may contain request bodies or authorization headers. Never dump them.
  const details: { kind: string; status?: number; code?: string } = { kind: error instanceof Error ? error.name : "UpstreamError" };
  if (error && typeof error === "object") {
    if ("statusCode" in error && typeof error.statusCode === "number") details.status = error.statusCode;
    if ("code" in error && typeof error.code === "string" && /^[A-Z_]{1,40}$/.test(error.code)) details.code = error.code;
  }
  console.error(`[${scope}] ${stage}`, details);
}

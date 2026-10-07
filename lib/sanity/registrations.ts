import "server-only";
import { createHash } from "node:crypto";
import type { ApplicationFormValues } from "@/lib/validation/application";
import { getServerClient, requirePrivateDataset } from "./serverClient";
import { emailExistsQuery } from "./queries";
import { developmentInfo } from "@/lib/diagnostics";

export class DuplicateRegistrationError extends Error {}
export function registrationId(email: string) {
  return `registration.${createHash("sha256").update(email.trim().toLowerCase()).digest("hex")}`;
}
export async function saveRegistration(values: ApplicationFormValues) {
  const client = getServerClient();
  developmentInfo("registration", "connecting to Sanity; checking dataset privacy");
  await requirePrivateDataset(client);
  developmentInfo("registration", "private dataset verified; checking duplicate");
  if (await client.fetch<boolean>(emailExistsQuery, { email: values.email }, { perspective: "raw" })) throw new DuplicateRegistrationError();
  const now = new Date().toISOString();
  try {
    // Atomic create prevents concurrent submissions replacing an existing record.
    const document = await client.create({
      ...values, _id: registrationId(values.email), _type: "registration",
      status: "Pending", source: "feb-website", submittedAt: now, createdAt: now, updatedAt: now
    }, { visibility: "sync" });
    if (!document._id) throw new Error("Storage confirmation missing");
    developmentInfo("registration", "Sanity create succeeded");
  } catch (error) {
    if (typeof error === "object" && error !== null && "statusCode" in error && error.statusCode === 409) throw new DuplicateRegistrationError();
    throw error;
  }
}

import "server-only";
import { createClient } from "@sanity/client";
import { getSanityEnvironment } from "@/lib/env";

export function getServerClient() {
  const { NEXT_PUBLIC_SANITY_PROJECT_ID: projectId, NEXT_PUBLIC_SANITY_DATASET: dataset, NEXT_PUBLIC_SANITY_API_VERSION: apiVersion, SANITY_API_WRITE_TOKEN: token } = getSanityEnvironment();
  return createClient({ projectId, dataset, apiVersion, token, useCdn: false, timeout: 10000, maxRetries: 0 });
}

// Fail closed before sending any PII. A dataset name does not prove privacy.
export async function requirePrivateDataset(client: ReturnType<typeof getServerClient>) {
  const datasets = await client.datasets.list();
  if (datasets.find(item => item.name === client.config().dataset)?.aclMode !== "private") {
    throw new DatasetPrivacyError();
  }
}
export class DatasetPrivacyError extends Error {
  readonly code = "DATASET_NOT_PRIVATE";
  constructor() { super("Registration dataset must be private"); this.name = "DatasetPrivacyError"; }
}

import "server-only";
import { createClient } from "@sanity/client";

export function getServerClient() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION;
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!projectId || !dataset || !apiVersion || !token) throw new Error("Sanity is not configured");
  return createClient({ projectId, dataset, apiVersion, token, useCdn: false, timeout: 10000, maxRetries: 0 });
}

// Fail closed before sending any PII. A dataset name does not prove privacy.
export async function requirePrivateDataset(client: ReturnType<typeof getServerClient>) {
  const datasets = await client.datasets.list();
  if (datasets.find(item => item.name === client.config().dataset)?.aclMode !== "private") {
    throw new Error("Registration dataset must be private");
  }
}

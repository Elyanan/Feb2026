import "server-only";
import { createHmac } from "node:crypto";
import { getServerClient, requirePrivateDataset } from "@/lib/sanity/serverClient";

// Shared, atomic account-level budget. No IP headers, passwords, or usernames stored.
// Old buckets can be deleted without affecting the current window.
export async function loginAttemptAllowed(now = Date.now()) {
  const windowMs = 15 * 60 * 1000;
  const bucket = Math.floor(now / windowMs);
  const id = `authLimit.${createHmac("sha256", process.env.AUTH_SECRET!).update(`feb-admin:${bucket}`).digest("hex")}`;
  const client = getServerClient();
  await requirePrivateDataset(client);
  await client.createIfNotExists({ _id: id, _type: "authRateLimit", count: 0, expiresAt: new Date((bucket + 1) * windowMs).toISOString() });
  const record = await client.patch(id).inc({ count: 1 }).commit({ visibility: "sync" });
  return typeof record.count === "number" && record.count <= 30;
}

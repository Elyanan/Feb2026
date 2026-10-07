import { randomUUID } from "node:crypto";
import nextEnv from "@next/env";
import { expect, test, vi } from "vitest";
import { deleteRegistration, exportRegistrations, getRegistrationById } from "@/lib/sanity/adminRegistrations";
import { registrationId, saveRegistration } from "@/lib/sanity/registrations";
import { getServerClient, requirePrivateDataset } from "@/lib/sanity/serverClient";

test.skipIf(process.env.FEB_LIVE_SANITY_TEST !== "1")("permanently deletes only its synthetic registration in live Sanity", async () => {
  vi.stubEnv("NODE_ENV", "development");
  nextEnv.loadEnvConfig(process.cwd(), true);
  const email = `feb-delete-check-${randomUUID()}@example.test`;
  const id = registrationId(email);
  const client = getServerClient();
  await requirePrivateDataset(client);
  try {
    await saveRegistration({ fullName: "FEB Delete Diagnostic", grade: "Grade 11", email, phone: "+15550102030", area: "Finance", motivation: "Synthetic diagnostic application for permanent deletion verification.", speakerQuestion: "How do banks evaluate lending risk?" });
    expect((await getRegistrationById(id))?.status).toBe("Pending");
    const unauthorized = await fetch(`http://127.0.0.1:3000/api/admin/registrations/${id}`, { method: "DELETE", headers: { origin: "http://127.0.0.1:3000" } });
    expect(unauthorized.status).toBe(401);
    expect((await getRegistrationById(id))?.email).toBe(email);
    await deleteRegistration(id);
    expect(await getRegistrationById(id)).toBeNull();
    let exported = 0;
    for await (const _record of exportRegistrations({ search: email })) { void _record; exported++; }
    expect(exported).toBe(0);
  } finally {
    const remaining = await getRegistrationById(id);
    if (remaining?.email === email && remaining.fullName === "FEB Delete Diagnostic") await client.delete(id);
    vi.unstubAllEnvs();
  }
}, 60000);

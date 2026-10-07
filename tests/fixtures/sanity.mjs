// Loaded ONLY by the isolated browser-test process, never by application code.
import nock from "nock";
import { parse, evaluate } from "groq-js";
import { createHash } from "node:crypto";
const records = new Map();
let revision = 1;
function add(email, name, grade, area, status) {
  const id = `registration.${createHash("sha256").update(email).digest("hex")}`;
  records.set(id, { _id: id, _type: "registration", _rev: String(revision++), email, fullName: name, grade, area, status, phone: "+251911123456", motivation: "I want to learn about capital allocation and financial markets.", speakerQuestion: "How do you evaluate lending risk?", submittedAt: "2026-10-07T09:00:00.000Z", source: "feb-website" });
}
add("maya@example.test", "Maya Alem", "Grade 11", "Finance", "Pending");
add("daniel@example.test", "Daniel Bekele", "Grade 12", "Business", "In");
add("sara@example.test", "Sara Tesfaye", "Grade 10", "Economics", "Not in");
const api = nock("https://testproject.api.sanity.io").persist();
api.get(/\/datasets(?:\?|$)/).reply(200, [{ name: "registrations", aclMode: "private" }]);
async function queryReply(request) {
  try {
    const url = new URL(request.url);
    const body = request.method === "POST" ? await request.json() : null;
    const params = body?.params || {};
    for (const [key, value] of url.searchParams) if (key.startsWith("$")) params[key.slice(1)] = JSON.parse(value);
    const query = body?.query || url.searchParams.get("query");
    const result = await (await evaluate(parse(query), { dataset: [...records.values()], params })).get();
    return [200, { result }];
  } catch (error) { return [400, { error: { description: String(error) } }]; }
}
api.get(/\/data\/query\/registrations/).reply(queryReply);
api.post(/\/data\/query\/registrations/).reply(queryReply);
api.post(/\/data\/mutate\/registrations/).reply(async function (request) {
  const body = await request.json();
  const results = [];
  for (const mutation of body.mutations) {
    const document = mutation.create || mutation.createIfNotExists;
    if (document) {
      if (mutation.create && records.has(document._id)) return [409, { error: { description: "Duplicate" } }];
      if (!records.has(document._id)) records.set(document._id, { ...document, _rev: String(revision++) });
      results.push({ id: document._id, document: records.get(document._id), operation: "create" });
    } else if (mutation.patch) {
      const patch = mutation.patch; const current = records.get(patch.id);
      if (!current) return [404, { error: { description: "Missing" } }];
      if (patch.ifRevisionID && patch.ifRevisionID !== current._rev) return [409, { error: { description: "Conflict" } }];
      Object.assign(current, patch.set || {});
      for (const [key, value] of Object.entries(patch.inc || {})) current[key] = (current[key] || 0) + value;
      current._rev = String(revision++); results.push({ id: patch.id, document: { ...current }, operation: "update" });
    }
  }
  return [200, { transactionId: "fixture-transaction", results }];
});

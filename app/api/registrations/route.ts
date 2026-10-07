import { registrationRequestSchema } from "@/lib/validation/application";
import { allowAttempt, issueFormToken, readLimitedJson, validFormToken } from "@/lib/registrations/abuse";
import { DuplicateRegistrationError, saveRegistration } from "@/lib/sanity/registrations";
import { sameOrigin } from "@/lib/security/origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
function reply(body: object, status = 200) { return Response.json(body, { status, headers: { "Cache-Control": "no-store" } }); }
const unavailable = () => reply({ code: "unavailable", message: "We couldn't submit your application. Your information is still here. Please try again." }, 503);
export async function GET() {
  try { return reply({ formToken: issueFormToken() }); } catch { return unavailable(); }
}
export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return reply({ code: "origin", message: "Please submit from the FEB website." }, 403);
  }
  if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") return reply({ code: "invalid", message: "Please reload the form and try again." }, 415);
  let body: unknown;
  try { body = await readLimitedJson(request); }
  catch (error) { return reply({ code: "invalid", message: "Please check your application and try again." }, error instanceof RangeError ? 413 : 400); }
  const result = registrationRequestSchema.safeParse(body);
  if (!result.success) return reply({ code: "validation", message: "Please check the highlighted fields.", errors: result.error.flatten().fieldErrors }, 422);
  const { website, formToken, ...values } = result.data;
  if (website) return reply({ code: "bot", message: "Please reload the form and try again." }, 400);
  try {
    if (!validFormToken(formToken)) return reply({ code: "timing", message: "Please wait a moment and try again. If the form has expired, reload it." }, 400);
    if (!allowAttempt(formToken)) return reply({ code: "rate", message: "Please wait a minute before trying again." }, 429);
    await saveRegistration(values);
    return reply({ saved: true }, 201);
  } catch (error) {
    if (error instanceof DuplicateRegistrationError) return reply({ code: "duplicate", message: "It looks like an application has already been submitted with this email." }, 409);
    console.error("Registration storage unavailable");
    return unavailable();
  }
}

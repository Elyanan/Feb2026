import "server-only";
export function sameOrigin(request: Request) {
  // A configured public origin also works behind hosting/internal URL rewrites.
  try {
    const expected = new URL(process.env.NEXTAUTH_URL || request.url).origin;
    return request.headers.get("origin") === expected && request.headers.get("sec-fetch-site") !== "cross-site";
  } catch { return false; }
}

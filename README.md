# FEB 2026

Next.js website with server-only registration storage and an embedded Sanity Studio.

## Created files

| Area | Files |
| --- | --- |
| API and abuse checks | `app/api/registrations/route.ts`, `lib/registrations/abuse.ts` |
| Sanity server modules | `lib/sanity/serverClient.ts`, `lib/sanity/queries.ts`, `lib/sanity/registrations.ts`, `lib/sanity/adminRegistrations.ts` |
| Schema and Studio | `sanity/schemaTypes/registration.ts`, `sanity/schemaTypes/index.ts`, `sanity/sanity.config.ts`, `app/studio/[[...tool]]/page.tsx`, `app/studio/[[...tool]]/Studio.tsx` |
| Form support | `components/forms/ApplicationSuccess.tsx`, `lib/validation/registration-options.ts`, `lib/use-reduced-motion.ts` |
| Environment | `.env.local`, `.env.example` |
| Tests | `vitest.config.ts`, `playwright.config.ts`, `tests/server-only.ts`, `tests/registrations.test.ts`, `tests/application-service.test.ts`, `tests/ui/application.spec.ts` |

Existing form/service/validation/config files were updated, together with the motion components affected by the reduced-motion hydration bug, package files, and `.gitignore`.

## FEB Setup

### Installation

Use Node.js 24 and run `npm install`. Install the browser used by tests once with `npx playwright install chromium`.

### Sanity configuration

1. Create or select a project at https://manage.sanity.io. Find its Project ID in project settings.
2. Under Datasets, create a dedicated dataset called `registrations` with **Private** visibility. Do not use a public content dataset. If your account cannot create private datasets, resolve that before accepting applications. The server inspects actual dataset visibility before every save and fails closed if it is public or cannot be checked.
3. Under API > Tokens, create a server token with Editor permissions, or a custom role that can read/create/update registration documents and `authRateLimit` metadata, and inspect dataset visibility. Keep it in `.env.local` and your hosting provider's secret environment settings. Do not paste it into code, browser settings, or Studio configuration. No separate read token is needed: the server token supplies duplicate checks, authenticated reads, and status updates.
4. Under API > CORS origins, add `http://127.0.0.1:3000` (and `http://localhost:3000` if used), allowing credentials for Studio authentication. Add the exact production website origin on deployment. Do not use wildcard origins.
5. Invite authorized organizers as Sanity project members with the appropriate role. Studio uses their Sanity login independently of custom admin authentication.
6. Fill `.env.local` and restart `npm run dev`:

### Environment variables

```dotenv
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=registrations
NEXT_PUBLIC_SANITY_API_VERSION=2026-10-07
SANITY_API_WRITE_TOKEN=your_server_editor_token
REGISTRATION_FORM_SECRET=your_random_64_character_hex_secret
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD_HASH=your_escaped_bcrypt_hash
AUTH_SECRET=your_separate_random_64_character_hex_secret
NEXTAUTH_URL=http://127.0.0.1:3000
```

Generate the form secret once with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Keep it stable across all server instances. The API version is a fixed date; it is not a credential. Project/dataset/version are public identifiers used by Studio; the token and form secret stay server-only. `.env.example` contains no credentials; `.env.local` is ignored by Git.

### Generate admin password hash

Run `npm run hash-password` in an interactive terminal. Enter and confirm a strong password; input is hidden. The script enforces 12+ characters, bcrypt's 72-byte limit, and cost 12. It prints a line for `.env.local` with dollar signs escaped and a separate raw value for Vercel. **Use the escaped line locally:** Next.js expands dollar signs even inside quoted environment values. Use the raw hash without quotes/backslashes in Vercel's environment-variable field. Never use a real password as a command-line argument.

### Generate AUTH_SECRET

Run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Generate `AUTH_SECRET` and `REGISTRATION_FORM_SECRET` separately. Keep both stable across server instances; changing `AUTH_SECRET` signs out all sessions.

### Development server

Run `npm run dev` and open the printed URL. Set `NEXTAUTH_URL` to that exact origin and restart after changing environment variables. Use `http://127.0.0.1:3000` with the supplied default.

### Sanity Studio

Studio is at `/studio`; no separate Studio process is required. Sign in with a Sanity account belonging to the project. FEB admin credentials do not grant Studio access. Registration data stays in the private dataset.

### Admin login

For initial local setup, run `npm run setup:admin` in your terminal. It keeps the configured username by default, accepts a hidden password and confirmation, saves only its escaped bcrypt hash to `.env.local`, and generates any missing authentication/form secrets. Existing Sanity settings are preserved. Restart `npm run dev` after setup. If sign-in says temporarily unavailable, this means the username/hash/secret configuration is missing or invalid; never enter a plaintext password into `ADMIN_PASSWORD_HASH`.

Open `/admin/login` and enter your configured username and password. `/admin` shows real aggregate counts/distributions; `/admin/registrations` provides server-side search, grade/area/status filters, sorting, pagination, details, status changes, and all/filtered CSV export. Admin notes are displayed if entered through Studio. Logout clears the session cookie and reloads the page to clear in-memory applicant data.

NextAuth's stable Credentials provider verifies bcrypt on the server and issues an encrypted JWT in an HTTP-only SameSite=Strict cookie (Secure and `__Host-` prefixed in production). Sessions have an absolute eight-hour lifetime; changing the username/hash also invalidates existing sessions. NextAuth handles sign-in/sign-out CSRF tokens; write endpoints additionally enforce same origin. Every page and admin endpoint verifies identity before private data access. Login attempts are counted atomically in Sanity `authRateLimit` documents, with 30 attempts per 15-minute account-wide bucket, so throttling works across Vercel instances and resets automatically. Throttled and invalid credentials produce the same message. A Sanity outage prevents login. Old expired throttle documents may be periodically deleted; never delete the current bucket while enforcing throttling.

### Registration testing

Submit the website form using a test email and realistic answers after at least three seconds. Success appears only after a confirmed Sanity write. Open Studio > Registration and verify name, normalized email, answers, source `feb-website`, timestamps, and status `Pending`. Submit the same email again to verify the friendly duplicate message. Use synthetic test information and delete the record in Studio when done. If a network timeout occurs after a save, a retry may report duplicate; inspect Studio to confirm receipt.

### Data and security

`sanity/schemaTypes/registration.ts` defines fullName, grade, email, phone, motivation, area, speakerQuestion, submittedAt, source, status, createdAt, updatedAt, and adminNotes. Status values are exactly `Pending`, `In`, and `Not in`. Sanity also supplies `_createdAt` and `_updatedAt`; Studio edits update `_updatedAt`, while custom admin helpers update `updatedAt`.

`POST /api/registrations` accepts only the seven applicant fields plus a honeypot and signed form token. Zod strips unexpected properties. Status, document ID, source, and timestamps are assigned by the server. Same-origin checks, a 16 KiB streaming limit, honeypot, signed three-second/two-hour time window, and a small per-token retry limiter run before storage. GET on the same route returns only a short-lived signed form token, never registrations. No browser data client or public registration read endpoint exists.

The normalized email determines a hashed document ID. Sanity's atomic `create` rejects collisions, preventing simultaneous requests from creating duplicates. Studio duplicate actions are disabled. Do not change applicant emails in Studio if relying on this ID strategy; document IDs are immutable. Signed timing and honeypots are lightweight defenses, not a CAPTCHA. The in-memory limiter is a local backstop and can be bypassed by obtaining another token; replace `allowAttempt` with a shared production limiter and/or add Turnstile in the same abuse-check layer when needed. Do not trust forwarded IP headers without a configured hosting proxy.

`lib/sanity/adminRegistrations.ts` provides parameterized search across all seven applicant fields, status/grade/area filtering, validated sort/pagination, record lookup, aggregate statistics, and revision-guarded status updates. All callers authorize on the server. CSV export streams cursor-paginated records, quotes fields, includes a UTF-8 BOM, and defuses spreadsheet formulas. Private responses have no-store headers. No registration data is statically generated or included in unauthenticated page HTML.

Admin endpoints: `GET /api/admin/registrations`, `GET /api/admin/registrations/[id]`, `PATCH /api/admin/registrations/[id]/status`, `GET /api/admin/stats`, and `GET /api/admin/export`. Authentication is at `/api/auth/[...nextauth]`. The legacy `admin.html` was removed. Public registration flow remains browser > Next.js validation/abuse checks > Sanity with status Pending > authenticated admin API.

### Production deployment

Deploy the repository as a Next.js project on Vercel, with `npm run build` as its build command. Choose Node.js 24. Supply the environment values below, set `NEXTAUTH_URL` to the exact production HTTPS origin, add that origin to Sanity Studio CORS with credentials enabled, and redeploy. On preview deployments, use an isolated dataset/account and the preview's own HTTPS origin. Never publish a private dataset or reuse production applicant data in public previews. No deployment has been performed by this task.

The app sends nosniff, referrer and permissions restrictions, frame denial, and a limited CSP for frame ancestors/base/object sources. It deliberately does not set a blanket script/connect CSP that could break Next.js or Studio; a stricter nonce-based policy can be evaluated for your final hosting configuration. HTTPS is required for production cookies. Rotate server secrets/tokens through hosting environment settings when needed.

### Vercel environment variables

Set `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION`, `SANITY_API_WRITE_TOKEN`, `REGISTRATION_FORM_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `AUTH_SECRET`, and `NEXTAUTH_URL`. Use the script's raw bcrypt hash for Vercel. Never prefix credentials/tokens/secrets with `NEXT_PUBLIC_`. A separate Sanity read token would duplicate the current server token and is intentionally omitted.

## Checks

### Debugging configuration

Server configuration is validated lazily by `lib/env.ts`, separately for Sanity writes, form signing, and admin authentication. Development logs identify invalid variable names, registration stages, dataset privacy failures, and SDK HTTP status codes. They deliberately omit raw SDK exceptions because those can contain authorization headers or applicant data. Browser registration diagnostics include only a sanitized code/status; production diagnostics are silent. A public dataset is rejected even if the token has write access.

If the form fails before submission, check `GET /api/registrations`: it must return a signed `formToken`. An empty `REGISTRATION_FORM_SECRET` makes it return 503. If authentication is not configured, inspect server diagnostics for `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, and `AUTH_SECRET`; a plaintext password is not a hash. Run `npm run setup:admin`, then completely restart the development server. A token may read/create/update documents without having permission to change dataset privacy; change privacy separately through Sanity Manage.

`npm test`, `npm run test:ui`, `npm run test:admin`, `npm run lint`, `npm run typecheck`, and `npm run build` validate the implementation. Unit tests mock Sanity and evaluate the actual GROQ queries. Admin browser tests start an isolated Next.js server on port 3100 with synthetic credentials and intercepted Sanity HTTP calls, exercising the real form/API/auth/dashboard/export code. The fixture preload is used only by the test launcher and is never imported by the application. These tests do not prove a live Sanity save. A live record check requires your configured project and credentials: submit, confirm in Studio/admin, search/open details, change Pending to In, refresh, export, logout, and verify unauthenticated API calls return 401.

New admin files: `lib/auth/{config,session,throttle}.ts`, `lib/admin/{http,validation,csv}.ts`, `types/{auth.d.ts,registration.ts}`, `app/api/auth/[...nextauth]/route.ts`, `app/api/admin/**/route.ts`, `app/admin/layout.tsx`, `app/admin/admin.css`, `app/admin/login/page.tsx`, protected admin layouts/pages/loading, `components/admin/*`, `scripts/hash-password.mjs`, and the admin test suite/fixtures/config/launcher. Modified files include the root/public layouts, Sanity query helpers, environment templates, package files, security headers, `.gitignore`, and this README.

Install the test browser once with `npx playwright install chromium`. UI tests reuse an existing local server or start one automatically.

The installed latest Sanity packages currently inherit npm audit advisories through their CLI dependencies (including glob/YAML/TOML parsing). npm's suggested automatic fix downgrades major Sanity versions; it has not been applied. Review upstream fixes before deployment and keep CLI tooling away from untrusted inputs. The registration API does not invoke the CLI.

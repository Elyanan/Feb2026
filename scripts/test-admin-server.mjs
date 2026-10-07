import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { hashSync } from "bcryptjs";
const fixture = new URL("../tests/fixtures/sanity.mjs", import.meta.url).href;
const cli = fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url));
const child = spawn(process.execPath, ["--import", fixture, cli, "dev", "--hostname", "127.0.0.1", "--port", "3100"], {
  stdio: "inherit", env: { ...process.env,
    NODE_OPTIONS: `${process.env.NODE_OPTIONS || ""} --import "${fixture}"`,
    NEXT_BUILD_DIR: ".next-test", NEXTAUTH_URL: "http://127.0.0.1:3100",
    ADMIN_USERNAME: "fixture-admin", ADMIN_PASSWORD_HASH: hashSync("Synthetic password 2026!", 12).replace(/\$/g, "\\$"), AUTH_SECRET: "browser-fixture-auth-secret-never-use-in-production-2026",
    NEXT_PUBLIC_SANITY_PROJECT_ID: "testproject", NEXT_PUBLIC_SANITY_DATASET: "registrations", NEXT_PUBLIC_SANITY_API_VERSION: "2026-10-07", SANITY_API_WRITE_TOKEN: "fixture-only-token",
    REGISTRATION_FORM_SECRET: "browser-fixture-form-secret-never-use-in-production"
  }
});
for (const event of ["SIGINT", "SIGTERM"]) process.on(event, () => { child.kill(event); });
child.on("exit", code => { process.exitCode = code ?? 0; });

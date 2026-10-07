import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { expect, it } from "vitest";

it("loads the setup script under Node and rejects non-interactive password input", () => {
  try {
    execFileSync(process.execPath, [resolve("scripts/setup-admin.mjs")], { stdio: ["pipe", "pipe", "pipe"] });
    throw new Error("Expected interactive-terminal requirement");
  } catch (error) {
    expect(error).toMatchObject({ status: 1 });
    const stderr = String((error as { stderr?: Buffer }).stderr);
    expect(stderr).toContain("Run npm run setup:admin in an interactive terminal.");
    expect(stderr).not.toContain("Named export");
  }
});

import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { join } from "node:path";

// The version query prevents an older PWA/service-worker navigation from being
// reused after a new Lovable deployment.
const RELEASE_VERSION = "2026.08.04.1";
const APP_URL = `https://showdosaber.lovable.app/?desktop=${RELEASE_VERSION}`;

function launch(command: string, args: string[]): boolean {
  try {
    const child = spawn(command, args, {
      detached: true,
      stdio: "ignore",
      windowsHide: true,
    });
    child.unref();
    return true;
  } catch {
    return false;
  }
}

function edgeCandidates(): string[] {
  const roots = [
    process.env["PROGRAMFILES(X86)"],
    process.env.PROGRAMFILES,
    process.env.LOCALAPPDATA,
  ].filter((value): value is string => Boolean(value));

  return roots.map((root) => join(root, "Microsoft", "Edge", "Application", "msedge.exe"));
}

for (const edge of edgeCandidates()) {
  if (existsSync(edge) && launch(edge, [`--app=${APP_URL}`, "--start-maximized"])) {
    process.exit(0);
  }
}

if (
  launch("cmd.exe", [
    "/d",
    "/s",
    "/c",
    "start",
    "",
    APP_URL,
  ])
) {
  process.exit(0);
}

launch("rundll32.exe", ["url.dll,FileProtocolHandler", APP_URL]);

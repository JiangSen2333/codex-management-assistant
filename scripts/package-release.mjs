import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, "package.json"), "utf8"));
const version = packageJson.version || "0.0.0";
const macArch = process.env.MAC_ARCH || process.arch;
if (!["arm64", "x64"].includes(macArch)) {
  throw new Error(`Unsupported macOS architecture: ${macArch}`);
}
const distRoot = path.join(projectRoot, "dist");
const appPath = path.join(distRoot, "Codex 管理助手.app");
const zipPath = path.join(distRoot, `codex-management-assistant-mac-${macArch}-v${version}.zip`);
const dmgRoot = path.join(distRoot, `dmg-root-${macArch}`);
const dmgPath = path.join(distRoot, `codex-management-assistant-mac-${macArch}-v${version}.dmg`);

if (process.platform !== "darwin") {
  throw new Error("macOS release archives must be created on macOS because they package a .app bundle.");
}

if (!fs.existsSync(appPath)) {
  throw new Error(`Missing macOS app bundle: ${appPath}`);
}

fs.rmSync(zipPath, { force: true });
fs.rmSync(dmgPath, { force: true });
fs.rmSync(dmgRoot, { recursive: true, force: true });

const result = spawnSync("ditto", ["-c", "-k", "--sequesterRsrc", "--keepParent", appPath, zipPath], {
  stdio: "inherit",
});

if (result.status !== 0) {
  throw new Error(`Failed to create release archive: ${zipPath}`);
}

console.log(`Created release archive at ${zipPath}`);

fs.mkdirSync(dmgRoot, { recursive: true });
fs.cpSync(appPath, path.join(dmgRoot, "Codex 管理助手.app"), { recursive: true });
fs.symlinkSync("/Applications", path.join(dmgRoot, "Applications"));

const dmg = spawnSync(
  "hdiutil",
  ["create", "-volname", "Codex 管理助手", "-srcfolder", dmgRoot, "-ov", "-format", "UDZO", dmgPath],
  { stdio: "inherit" }
);

fs.rmSync(dmgRoot, { recursive: true, force: true });

if (dmg.status !== 0) {
  throw new Error(`Failed to create dmg installer: ${dmgPath}`);
}

console.log(`Created dmg installer at ${dmgPath}`);

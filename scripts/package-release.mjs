import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, "package.json"), "utf8"));
const version = packageJson.version || "0.0.0";
const distRoot = path.join(projectRoot, "dist");
const appPath = path.join(distRoot, "Codex 管理助手.app");
const zipPath = path.join(distRoot, `codex-management-assistant-mac-v${version}.zip`);

if (process.platform !== "darwin") {
  throw new Error("macOS release archives must be created on macOS because they package a .app bundle.");
}

if (!fs.existsSync(appPath)) {
  throw new Error(`Missing macOS app bundle: ${appPath}`);
}

fs.rmSync(zipPath, { force: true });

const result = spawnSync("ditto", ["-c", "-k", "--sequesterRsrc", "--keepParent", appPath, zipPath], {
  stdio: "inherit",
});

if (result.status !== 0) {
  throw new Error(`Failed to create release archive: ${zipPath}`);
}

console.log(`Created release archive at ${zipPath}`);

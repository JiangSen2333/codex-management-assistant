import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, "package.json"), "utf8"));
const neutralinoConfig = JSON.parse(fs.readFileSync(path.join(projectRoot, "neutralino.config.json"), "utf8"));
const distRoot = path.join(projectRoot, "dist");
const binaryName = neutralinoConfig.cli?.binaryName || "codex-management-assistant";
const appName = "Codex 管理助手";
const macArch = process.env.MAC_ARCH || process.arch;
if (!["arm64", "x64"].includes(macArch)) {
  throw new Error(`Unsupported macOS architecture: ${macArch}`);
}
const machoArch = macArch === "x64" ? "x86_64" : macArch;
const releaseRoot = path.join(distRoot, binaryName);
const bundleRoot = path.join(distRoot, "Codex 管理助手.app");
const contentsRoot = path.join(bundleRoot, "Contents");
const macOSRoot = path.join(contentsRoot, "MacOS");
const resourcesRoot = path.join(contentsRoot, "Resources");
const executableSource = path.join(releaseRoot, `${binaryName}-mac_${macArch}`);
const executableTarget = path.join(macOSRoot, binaryName);
const runtimeTarget = path.join(macOSRoot, "neutralino", "extensions", "provider-manager", "runtime", "darwin", "node");
const iconSource = path.join(projectRoot, "assets", "app-icon.icns");
const iconName = "app-icon";

if (!fs.existsSync(executableSource)) {
  throw new Error(`Missing macOS executable: ${executableSource}`);
}

fs.rmSync(bundleRoot, { recursive: true, force: true });
fs.mkdirSync(macOSRoot, { recursive: true });
fs.mkdirSync(resourcesRoot, { recursive: true });

fs.copyFileSync(executableSource, executableTarget);
fs.chmodSync(executableTarget, 0o755);
fs.copyFileSync(path.join(releaseRoot, "resources.neu"), path.join(macOSRoot, "resources.neu"));
fs.cpSync(path.join(releaseRoot, "neutralino"), path.join(macOSRoot, "neutralino"), { recursive: true });

for (const executable of [executableTarget, runtimeTarget]) {
  const verification = spawnSync("lipo", [executable, "-verify_arch", machoArch], { encoding: "utf8" });
  if (verification.status !== 0) {
    throw new Error(`Packaged executable does not support ${macArch}: ${executable}`);
  }
}

if (fs.existsSync(iconSource)) {
  fs.copyFileSync(iconSource, path.join(resourcesRoot, `${iconName}.icns`));
} else {
  console.warn(`Skipped app icon: ${iconSource} not found`);
}

function xml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

const version = packageJson.version || neutralinoConfig.version || "0.0.0";
const applicationId = neutralinoConfig.applicationId || "dev.codex.management.assistant";

const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleDevelopmentRegion</key>
  <string>zh_CN</string>
  <key>CFBundleExecutable</key>
  <string>${xml(binaryName)}</string>
  <key>CFBundleIdentifier</key>
  <string>${xml(applicationId)}</string>
  <key>CFBundleInfoDictionaryVersion</key>
  <string>6.0</string>
  <key>CFBundleName</key>
  <string>${xml(appName)}</string>
  <key>CFBundleIconFile</key>
  <string>${xml(iconName)}</string>
  <key>CFBundleIconName</key>
  <string>${xml(iconName)}</string>
  <key>CFBundlePackageType</key>
  <string>APPL</string>
  <key>CFBundleShortVersionString</key>
  <string>${xml(version)}</string>
  <key>CFBundleVersion</key>
  <string>${xml(version)}</string>
  <key>LSMinimumSystemVersion</key>
  <string>10.15</string>
  <key>NSHighResolutionCapable</key>
  <true/>
</dict>
</plist>
`;

fs.writeFileSync(path.join(contentsRoot, "Info.plist"), plist, "utf8");

console.log(`Created macOS ${macArch} app bundle at ${bundleRoot}`);

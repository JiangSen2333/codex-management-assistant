import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const extensionRoot = path.join(projectRoot, "neutralino", "extensions", "provider-manager");
const appRoot = path.join(extensionRoot, "app");
const neutralinoClientSource = path.join(projectRoot, "node_modules", "@neutralinojs", "lib", "dist", "neutralino.js");
const neutralinoClientTarget = path.join(projectRoot, "neutralino", "resources", "js", "neutralino.js");
const sourceServer = path.join(projectRoot, "server.js");
const sourcePublic = path.join(projectRoot, "public");
const sourcePackage = path.join(projectRoot, "package.json");

fs.rmSync(appRoot, { recursive: true, force: true });
fs.mkdirSync(appRoot, { recursive: true });
fs.copyFileSync(sourceServer, path.join(appRoot, "server.js"));
fs.copyFileSync(sourcePackage, path.join(appRoot, "package.json"));
fs.cpSync(sourcePublic, path.join(appRoot, "public"), { recursive: true });

if (fs.existsSync(neutralinoClientSource)) {
  fs.mkdirSync(path.dirname(neutralinoClientTarget), { recursive: true });
  fs.copyFileSync(neutralinoClientSource, neutralinoClientTarget);
  console.log(`Copied Neutralino client: ${neutralinoClientTarget}`);
} else {
  console.warn("Skipped Neutralino client: run npm install first");
}

const runtimeTargets = [
  {
    key: "darwin",
    nodeEnv: "NODE_RUNTIME_DARWIN",
    nodeName: "node",
    matchesCurrent: process.platform === "darwin",
  },
  {
    key: "windows",
    nodeEnv: "NODE_RUNTIME_WINDOWS",
    nodeName: "node.exe",
    matchesCurrent: process.platform === "win32",
  },
  {
    key: "linux",
    nodeEnv: "NODE_RUNTIME_LINUX",
    nodeName: "node",
    matchesCurrent: process.platform === "linux",
  },
];

function copyRuntime(source, destination, label) {
  if (!source || !fs.existsSync(source)) {
    console.warn(`Skipped ${label}: runtime source not found`);
    return false;
  }

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
  if (!destination.endsWith(".exe")) fs.chmodSync(destination, 0o755);
  console.log(`Copied ${label}: ${source} -> ${destination}`);
  return true;
}

function copyDarwinRuntime(source, destination) {
  if (!source || !fs.existsSync(source)) {
    console.warn("Skipped darwin Node: runtime source not found");
    return false;
  }

  const targetArch = process.env.MAC_ARCH || process.arch;
  if (!["arm64", "x64"].includes(targetArch)) {
    throw new Error(`Unsupported macOS architecture: ${targetArch}`);
  }
  const machoArch = targetArch === "x64" ? "x86_64" : targetArch;

  const architecture = spawnSync("lipo", ["-archs", source], { encoding: "utf8" });
  if (architecture.status !== 0) {
    throw new Error(`Unable to inspect darwin Node runtime: ${architecture.stderr.trim()}`);
  }

  const available = architecture.stdout.trim().split(/\s+/);
  if (!available.includes(machoArch)) {
    throw new Error(`Darwin Node runtime does not include ${targetArch}: ${available.join(", ")}`);
  }

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  if (available.length > 1) {
    const thin = spawnSync("lipo", ["-thin", machoArch, source, "-output", destination], { encoding: "utf8" });
    if (thin.status !== 0) {
      throw new Error(`Unable to create ${targetArch} Node runtime: ${thin.stderr.trim()}`);
    }

    const sign = spawnSync("codesign", ["--force", "--sign", "-", "--timestamp=none", destination], { encoding: "utf8" });
    if (sign.status !== 0) {
      throw new Error(`Unable to sign ${targetArch} Node runtime: ${sign.stderr.trim()}`);
    }
  } else {
    fs.copyFileSync(source, destination);
  }

  fs.chmodSync(destination, 0o755);
  console.log(`Prepared darwin ${targetArch} Node: ${source} -> ${destination}`);
  return true;
}

for (const target of runtimeTargets) {
  const runtimeRoot = path.join(extensionRoot, "runtime", target.key);
  const nodeSource = process.env[target.nodeEnv] || (target.matchesCurrent ? process.execPath : null);

  fs.rmSync(runtimeRoot, { recursive: true, force: true });
  if (target.key === "darwin" && process.platform === "darwin") {
    copyDarwinRuntime(nodeSource, path.join(runtimeRoot, target.nodeName));
  } else {
    copyRuntime(nodeSource, path.join(runtimeRoot, target.nodeName), `${target.key} Node`);
  }
}

console.log(`Prepared Neutralino extension app at ${appRoot}`);

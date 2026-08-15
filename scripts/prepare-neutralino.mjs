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

fs.rmSync(appRoot, { recursive: true, force: true });
fs.mkdirSync(appRoot, { recursive: true });
fs.copyFileSync(sourceServer, path.join(appRoot, "server.js"));
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

for (const target of runtimeTargets) {
  const runtimeRoot = path.join(extensionRoot, "runtime", target.key);
  const nodeSource = process.env[target.nodeEnv] || (target.matchesCurrent ? process.execPath : null);

  fs.rmSync(runtimeRoot, { recursive: true, force: true });
  copyRuntime(nodeSource, path.join(runtimeRoot, target.nodeName), `${target.key} Node`);
}

console.log(`Prepared Neutralino extension app at ${appRoot}`);

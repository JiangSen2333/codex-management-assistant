import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packagePath = path.join(projectRoot, "package.json");
const neutralinoPath = path.join(projectRoot, "neutralino.config.json");
const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const neutralinoConfig = JSON.parse(fs.readFileSync(neutralinoPath, "utf8"));

neutralinoConfig.version = packageJson.version;
fs.writeFileSync(neutralinoPath, `${JSON.stringify(neutralinoConfig, null, 2)}\n`);

console.log(`Synced Neutralino version to ${packageJson.version}`);

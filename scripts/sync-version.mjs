import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packagePath = path.join(projectRoot, "package.json");
const neutralinoPath = path.join(projectRoot, "neutralino.config.json");
const neutralinoIndexPath = path.join(projectRoot, "neutralino", "resources", "index.html");
const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const neutralinoConfig = JSON.parse(fs.readFileSync(neutralinoPath, "utf8"));

neutralinoConfig.version = packageJson.version;
fs.writeFileSync(neutralinoPath, `${JSON.stringify(neutralinoConfig, null, 2)}\n`);

if (fs.existsSync(neutralinoIndexPath)) {
  const html = fs.readFileSync(neutralinoIndexPath, "utf8");
  const updatedHtml = html.replace(
    /const expectedVersion = "([^"]+)";/,
    `const expectedVersion = "${packageJson.version}";`
  );
  fs.writeFileSync(neutralinoIndexPath, updatedHtml, "utf8");
}

console.log(`Synced Neutralino version to ${packageJson.version}`);

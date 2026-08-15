import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = path.join(projectRoot, "dist");

fs.rmSync(distRoot, { recursive: true, force: true });
console.log(`Cleaned Neutralino dist at ${distRoot}`);

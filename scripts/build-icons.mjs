import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceIcon = path.join(projectRoot, "assets", "app-icon.png");
const targetIcon = path.join(projectRoot, "assets", "app-icon.icns");
const targetWindowsIcon = path.join(projectRoot, "assets", "app-icon.ico");
const targetPublicIcon = path.join(projectRoot, "public", "app-icon.png");
const targetLoadingIcon = path.join(projectRoot, "neutralino", "resources", "app-icon.png");
const require = createRequire(import.meta.url);
const png2icons = require("png2icons");

if (!fs.existsSync(sourceIcon)) {
  throw new Error(`Missing source icon: ${sourceIcon}`);
}

const input = fs.readFileSync(sourceIcon);
fs.copyFileSync(sourceIcon, targetPublicIcon);
console.log(`Copied ${targetPublicIcon}`);

fs.copyFileSync(sourceIcon, targetLoadingIcon);
console.log(`Copied ${targetLoadingIcon}`);

const icns = png2icons.createICNS(input, png2icons.BICUBIC, 0);
if (!icns) throw new Error(`Failed to generate ${targetIcon}`);
fs.writeFileSync(targetIcon, icns);
console.log(`Generated ${targetIcon}`);

const ico = png2icons.createICO(input, png2icons.BICUBIC2, 0, false, true);
if (!ico) throw new Error(`Failed to generate ${targetWindowsIcon}`);
fs.writeFileSync(targetWindowsIcon, ico);
console.log(`Generated ${targetWindowsIcon}`);

"use strict";

const fs = require("fs");
const path = require("path");

process.env.PORT ||= "47835";

const desktopProcessId = process.ppid;
const parentMonitor = setInterval(() => {
  try {
    process.kill(desktopProcessId, 0);
  } catch {
    process.exit(0);
  }

  if (process.ppid !== desktopProcessId) process.exit(0);
}, 2000);
parentMonitor.unref();

const packagedServer = path.join(__dirname, "app", "server.js");
const developmentServer = path.resolve(__dirname, "..", "..", "..", "server.js");
const serverPath = fs.existsSync(packagedServer) ? packagedServer : developmentServer;

if (!fs.existsSync(serverPath)) {
  console.error(`Cannot find Codex Management Assistant server at ${serverPath}`);
  process.exit(1);
}

require(serverPath);

"use strict";

const fs = require("fs");
const path = require("path");

process.env.PORT ||= "47835";

const packagedServer = path.join(__dirname, "app", "server.js");
const developmentServer = path.resolve(__dirname, "..", "..", "..", "server.js");
const serverPath = fs.existsSync(packagedServer) ? packagedServer : developmentServer;

if (!fs.existsSync(serverPath)) {
  console.error(`Cannot find Codex Management Assistant server at ${serverPath}`);
  process.exit(1);
}

require(serverPath);

"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");

process.env.CODEX_MANAGER_NO_LISTEN = "1";
const { preferredReleaseAsset } = require("../server.js");

const release = {
  assets: [
    { name: "codex-management-assistant-mac-x64-v0.1.7.zip" },
    { name: "codex-management-assistant-mac-arm64-v0.1.7.dmg" },
    { name: "codex-management-assistant-mac-x64-v0.1.7.dmg" },
    { name: "codex-management-assistant-mac-arm64-v0.1.7.zip" },
  ],
};

test("selects the Apple Silicon DMG on arm64 macOS", () => {
  assert.equal(
    preferredReleaseAsset(release, "darwin", "arm64")?.name,
    "codex-management-assistant-mac-arm64-v0.1.7.dmg"
  );
});

test("selects the Intel DMG on x64 macOS", () => {
  assert.equal(
    preferredReleaseAsset(release, "darwin", "x64")?.name,
    "codex-management-assistant-mac-x64-v0.1.7.dmg"
  );
});

test("keeps compatibility with legacy architecture-neutral releases", () => {
  const legacy = { assets: [{ name: "codex-management-assistant-mac-v0.1.6.dmg" }] };
  assert.equal(
    preferredReleaseAsset(legacy, "darwin", "arm64")?.name,
    "codex-management-assistant-mac-v0.1.6.dmg"
  );
});

test("does not offer a package built only for the other macOS architecture", () => {
  const armOnly = { assets: [{ name: "codex-management-assistant-mac-arm64-v0.1.7.dmg" }] };
  assert.equal(preferredReleaseAsset(armOnly, "darwin", "x64"), null);
});

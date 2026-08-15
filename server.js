#!/usr/bin/env node
"use strict";

const crypto = require("crypto");
const fs = require("fs");
const https = require("https");
const http = require("http");
const os = require("os");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");
const url = require("url");

const DEFAULT_PORT = Number(process.env.PORT || 47831);
const CODEX_HOME = path.resolve(process.env.CODEX_HOME || path.join(os.homedir(), ".codex"));
const PUBLIC_DIR = path.join(__dirname, "public");
const MIGRATION_DIR = path.join(CODEX_HOME, "provider-migrations");
const OPERATIONS_FILE = path.join(MIGRATION_DIR, "operations.jsonl");
const GITHUB_REPOSITORY = "JiangSen2333/codex-management-assistant";
const APP_VERSION = readAppVersion();

function readAppVersion() {
  const candidates = [
    path.join(__dirname, "package.json"),
    path.join(__dirname, "..", "package.json"),
  ];

  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) {
        return JSON.parse(fs.readFileSync(candidate, "utf8")).version || "0.0.0";
      }
    } catch {
      // Fall through to the default version.
    }
  }

  return "0.0.0";
}

function sendJson(response, status, payload) {
  const body = JSON.stringify(payload, null, 2);
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Content-Length": Buffer.byteLength(body),
  });
  response.end(body);
}

function sendText(response, status, body, type = "text/plain; charset=utf-8") {
  response.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-store",
    "Content-Length": Buffer.byteLength(body),
  });
  response.end(body);
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 2_000_000) {
        reject(new Error("Request body is too large"));
        request.destroy();
      }
    });
    request.on("end", () => resolve(body ? JSON.parse(body) : {}));
    request.on("error", reject);
  });
}

function requestJson(requestUrl) {
  return new Promise((resolve, reject) => {
    const githubRequest = https.get(
      requestUrl,
      {
        headers: {
          "Accept": "application/vnd.github+json",
          "User-Agent": `codex-management-assistant/${APP_VERSION}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
      (githubResponse) => {
        let body = "";
        githubResponse.setEncoding("utf8");
        githubResponse.on("data", (chunk) => {
          body += chunk;
          if (body.length > 2_000_000) {
            githubResponse.destroy(new Error("Response body is too large"));
          }
        });
        githubResponse.on("end", () => {
          if (githubResponse.statusCode < 200 || githubResponse.statusCode >= 300) {
            reject(new Error(`GitHub request failed with status ${githubResponse.statusCode}`));
            return;
          }

          try {
            resolve(JSON.parse(body));
          } catch {
            reject(new Error("GitHub returned an invalid JSON response"));
          }
        });
      }
    );

    githubRequest.setTimeout(10_000, () => githubRequest.destroy(new Error("GitHub request timed out")));
    githubRequest.on("error", reject);
  });
}

function compareVersions(left, right) {
  const a = String(left || "0.0.0").replace(/^v/i, "").split(/[.-]/).map((part) => Number.parseInt(part, 10) || 0);
  const b = String(right || "0.0.0").replace(/^v/i, "").split(/[.-]/).map((part) => Number.parseInt(part, 10) || 0);
  const length = Math.max(a.length, b.length);

  for (let index = 0; index < length; index += 1) {
    const delta = (a[index] || 0) - (b[index] || 0);
    if (delta) return Math.sign(delta);
  }

  return 0;
}

function releaseAsset(release, extension) {
  return release.assets?.find((asset) => asset.name?.endsWith(extension)) || null;
}

async function checkLatestRelease() {
  const release = await requestJson(`https://api.github.com/repos/${GITHUB_REPOSITORY}/releases/latest`);
  const latestVersion = String(release.tag_name || release.name || "").replace(/^v/i, "") || "0.0.0";
  const dmg = releaseAsset(release, ".dmg");
  const zip = releaseAsset(release, ".zip");
  const asset = dmg || zip;

  return {
    currentVersion: APP_VERSION,
    latestVersion,
    repository: GITHUB_REPOSITORY,
    updateAvailable: compareVersions(latestVersion, APP_VERSION) > 0,
    releaseName: release.name || release.tag_name || latestVersion,
    releaseUrl: release.html_url,
    publishedAt: release.published_at,
    notes: release.body || "",
    asset: asset ? {
      name: asset.name,
      size: asset.size,
      downloadUrl: asset.browser_download_url,
      contentType: asset.content_type,
    } : null,
  };
}

function ensureDirectory(directory) {
  fs.mkdirSync(directory, { recursive: true });
}

function validateProviderId(providerId) {
  return typeof providerId === "string" && /^[A-Za-z0-9._-]+$/.test(providerId);
}

function readJsonLine(line) {
  try {
    return JSON.parse(line);
  } catch {
    return null;
  }
}

function listJsonlFiles(root) {
  if (!fs.existsSync(root)) return [];
  const entries = fs.readdirSync(root, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...listJsonlFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".jsonl")) {
      files.push(fullPath);
    }
  }

  return files;
}

function sessionFiles() {
  return [
    ...listJsonlFiles(path.join(CODEX_HOME, "sessions")),
    ...listJsonlFiles(path.join(CODEX_HOME, "archived_sessions")),
  ];
}

function inspectSessionFiles() {
  const providerCounts = {};
  const files = sessionFiles();
  const perFile = [];

  for (const filePath of files) {
    const text = fs.readFileSync(filePath, "utf8");
    const lines = text.split(/\r?\n/);
    const counts = {};

    for (const line of lines) {
      if (!line) continue;
      const data = readJsonLine(line);
      const provider = data?.type === "session_meta" ? data.payload?.model_provider : null;
      if (provider) {
        counts[provider] = (counts[provider] || 0) + 1;
        providerCounts[provider] = (providerCounts[provider] || 0) + 1;
      }
    }

    if (Object.keys(counts).length) {
      perFile.push({ filePath, counts });
    }
  }

  return { fileCount: files.length, providerCounts, perFile };
}

function readConfig() {
  const configPath = path.join(CODEX_HOME, "config.toml");
  if (!fs.existsSync(configPath)) {
    return { configPath, exists: false, currentProvider: null, providers: [] };
  }

  const text = fs.readFileSync(configPath, "utf8");
  const providers = [];
  let currentProvider = null;
  let inSection = false;

  for (const line of text.split(/\r?\n/)) {
    if (/^\s*\[/.test(line)) inSection = true;
    if (!inSection) {
      const match = line.match(/^\s*model_provider\s*=\s*"([^"]+)"/);
      if (match) currentProvider = match[1];
    }

    const providerMatch = line.match(/^\s*\[model_providers\.([^\]]+)\]\s*$/);
    if (providerMatch) providers.push(providerMatch[1].replace(/^"|"$/g, ""));
  }

  return { configPath, exists: true, currentProvider, providers };
}

function updateConfigText(text, sourceProvider, targetProvider, options) {
  const lines = text.split(/\r?\n/);
  const sourceSection = `[model_providers.${sourceProvider}]`;
  const targetSection = `[model_providers.${targetProvider}]`;
  const hasSourceSection = lines.some((line) => line.trim() === sourceSection);
  const hasTargetSection = lines.some((line) => line.trim() === targetSection);

  if (options.renameProviderDefinition && hasSourceSection && hasTargetSection) {
    throw new Error(`目标标识 ${targetProvider} 已有 provider 定义，请关闭“重命名 provider 定义”后再执行。`);
  }

  let inSourceSection = false;
  let sawAnySection = false;
  let changed = false;

  const output = lines.map((line) => {
    if (/^\s*\[/.test(line)) {
      sawAnySection = true;
      inSourceSection = line.trim() === sourceSection;
    }

    if (!sawAnySection && options.updateConfigProvider) {
      const next = line.replace(
        new RegExp(`^(\\s*model_provider\\s*=\\s*)"${escapeRegExp(sourceProvider)}"(\\s*)$`),
        `$1"${targetProvider}"$2`
      );
      if (next !== line) changed = true;
      return next;
    }

    if (options.renameProviderDefinition && line.trim() === sourceSection) {
      changed = true;
      return targetSection;
    }

    if (options.renameProviderDefinition && inSourceSection) {
      const next = line.replace(
        new RegExp(`^(\\s*name\\s*=\\s*)"${escapeRegExp(sourceProvider)}"(\\s*)$`),
        `$1"${targetProvider}"$2`
      );
      if (next !== line) changed = true;
      return next;
    }

    return line;
  });

  return { text: output.join("\n"), changed };
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sqlString(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlStringList(values) {
  if (!values.length) return "(NULL)";
  return `(${values.map(sqlString).join(", ")})`;
}

function sqliteQuery(dbPath, sql) {
  if (!fs.existsSync(dbPath)) return null;
  let database = null;
  try {
    database = new DatabaseSync(dbPath, { readOnly: true });
    return database.prepare(sql).all();
  } catch (error) {
    return { error: error.message };
  } finally {
    database?.close();
  }
}

function sqliteTableExists(dbPath, tableName) {
  const rows = sqliteQuery(
    dbPath,
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name = ${sqlString(tableName)} LIMIT 1`
  );
  return Array.isArray(rows) && rows.length > 0;
}

function inspectSqlite() {
  const dbPath = path.join(CODEX_HOME, "sqlite", "codex-dev.db");
  const summary = { dbPath, exists: fs.existsSync(dbPath), catalogCounts: {}, ledgerCounts: {}, error: null };
  if (!summary.exists) return summary;

  const catalog = sqliteQuery(dbPath, "SELECT model_provider, COUNT(*) AS count FROM local_thread_catalog GROUP BY model_provider");
  if (catalog?.error) {
    summary.error = catalog.error;
    return summary;
  }

  for (const row of catalog || []) {
    if (row.model_provider) summary.catalogCounts[row.model_provider] = row.count;
  }

  const ledger = sqliteQuery(dbPath, "SELECT payload_json FROM thread_timeline_ledger");
  if (!ledger?.error && Array.isArray(ledger)) {
    for (const row of ledger) {
      const payload = readJsonLine(row.payload_json);
      const provider = payload?.type === "session_meta" ? payload.payload?.model_provider : null;
      if (provider) summary.ledgerCounts[provider] = (summary.ledgerCounts[provider] || 0) + 1;
    }
  }

  return summary;
}

function desktopStateDbPaths() {
  return [
    path.join(CODEX_HOME, "state_5.sqlite"),
    path.join(CODEX_HOME, "sqlite", "state_5.sqlite"),
  ].filter((dbPath, index, all) => all.indexOf(dbPath) === index);
}

function inspectDesktopStateSqlite() {
  const summary = {
    dbs: [],
    threadCounts: {},
    importCounts: {},
  };

  for (const dbPath of desktopStateDbPaths()) {
    const item = {
      dbPath,
      exists: fs.existsSync(dbPath),
      threadCounts: {},
      importCounts: {},
      error: null,
    };
    summary.dbs.push(item);
    if (!item.exists) continue;

    if (sqliteTableExists(dbPath, "threads")) {
      const threads = sqliteQuery(dbPath, "SELECT model_provider, COUNT(*) AS count FROM threads GROUP BY model_provider");
      if (threads?.error) {
        item.error = threads.error;
      } else {
        for (const row of threads || []) {
          if (!row.model_provider) continue;
          item.threadCounts[row.model_provider] = row.count;
          summary.threadCounts[row.model_provider] = (summary.threadCounts[row.model_provider] || 0) + row.count;
        }
      }
    }

    if (sqliteTableExists(dbPath, "external_agent_config_imports")) {
      const imports = sqliteQuery(dbPath, "SELECT provider_id, COUNT(*) AS count FROM external_agent_config_imports GROUP BY provider_id");
      if (!imports?.error && Array.isArray(imports)) {
        for (const row of imports) {
          if (!row.provider_id) continue;
          item.importCounts[row.provider_id] = row.count;
          summary.importCounts[row.provider_id] = (summary.importCounts[row.provider_id] || 0) + row.count;
        }
      }
    }
  }

  return summary;
}

function scanState() {
  return {
    codexHome: CODEX_HOME,
    config: readConfig(),
    sessions: inspectSessionFiles(),
    sqlite: inspectSqlite(),
    desktopState: inspectDesktopStateSqlite(),
    operations: readOperations(),
  };
}

function planMigration(sourceProvider, targetProvider, options) {
  const state = scanState();
  const sessionMatches = state.sessions.perFile
    .filter((item) => item.counts[sourceProvider])
    .map((item) => ({ filePath: item.filePath, count: item.counts[sourceProvider] }));

  return {
    sourceProvider,
    targetProvider,
    options,
    sessionFiles: sessionMatches.length,
    sessionRows: sessionMatches.reduce((total, item) => total + item.count, 0),
    sqliteCatalogRows: state.sqlite.catalogCounts[sourceProvider] || 0,
    sqliteLedgerRows: state.sqlite.ledgerCounts[sourceProvider] || 0,
    desktopThreadRows: state.desktopState.threadCounts[sourceProvider] || 0,
    desktopImportRows: state.desktopState.importCounts[sourceProvider] || 0,
    configProviderChanges: state.config.currentProvider === sourceProvider && options.updateConfigProvider ? 1 : 0,
    configDefinitionChanges: state.config.providers.includes(sourceProvider) && options.renameProviderDefinition ? 1 : 0,
    targetDefinitionExists: state.config.providers.includes(targetProvider),
  };
}

function relativeToCodexHome(filePath) {
  return path.relative(CODEX_HOME, filePath);
}

function backupFile(backupRoot, filePath) {
  const relative = relativeToCodexHome(filePath);
  const destination = path.join(backupRoot, relative);
  ensureDirectory(path.dirname(destination));
  fs.copyFileSync(filePath, destination);
}

function rewriteSessionFile(filePath, sourceProvider, targetProvider) {
  const original = fs.readFileSync(filePath, "utf8");
  let changedRows = 0;

  const output = original.split(/\r?\n/).map((line) => {
    if (!line) return line;
    const data = readJsonLine(line);
    if (
      data?.type === "session_meta" &&
      data.payload?.model_provider === sourceProvider
    ) {
      data.payload.model_provider = targetProvider;
      changedRows += 1;
      return JSON.stringify(data);
    }
    return line;
  }).join("\n");

  if (changedRows) {
    fs.writeFileSync(filePath, output.endsWith("\n") ? output : `${output}\n`, "utf8");
  }

  return changedRows;
}

function sqliteExec(dbPath, sql) {
  let database = null;
  try {
    database = new DatabaseSync(dbPath);
    database.exec(sql);
  } finally {
    database?.close();
  }
}

function rewriteSqlite(sourceProvider, targetProvider) {
  const dbPath = path.join(CODEX_HOME, "sqlite", "codex-dev.db");
  const result = { catalogRows: 0, ledgerRows: 0, catalogThreadIds: [], ledgerKeys: [] };
  if (!fs.existsSync(dbPath)) return result;

  const before = inspectSqlite();
  result.catalogRows = before.catalogCounts[sourceProvider] || 0;
  result.ledgerRows = before.ledgerCounts[sourceProvider] || 0;
  const catalogRows = sqliteQuery(
    dbPath,
    `SELECT host_id, thread_id FROM local_thread_catalog WHERE model_provider = ${sqlString(sourceProvider)}`
  );
  if (Array.isArray(catalogRows)) {
    result.catalogThreadIds = catalogRows.map((row) => ({ host_id: row.host_id, thread_id: row.thread_id }));
  }

  sqliteExec(
    dbPath,
    `UPDATE local_thread_catalog SET model_provider = ${sqlString(targetProvider)} WHERE model_provider = ${sqlString(sourceProvider)}`
  );

  const rows = sqliteQuery(dbPath, "SELECT host_id, thread_id, sequence, payload_json FROM thread_timeline_ledger") || [];
  for (const row of rows) {
    const payload = readJsonLine(row.payload_json);
    if (payload?.type === "session_meta" && payload.payload?.model_provider === sourceProvider) {
      payload.payload.model_provider = targetProvider;
      result.ledgerKeys.push({ host_id: row.host_id, thread_id: row.thread_id, sequence: Number(row.sequence) });
      sqliteExec(
        dbPath,
        [
          `UPDATE thread_timeline_ledger SET payload_json = ${sqlString(JSON.stringify(payload))}`,
          `WHERE host_id = ${sqlString(row.host_id)}`,
          `AND thread_id = ${sqlString(row.thread_id)}`,
          `AND sequence = ${Number(row.sequence)}`,
        ].join(" ")
      );
    }
  }

  return result;
}

function rewriteDesktopStateDb(dbPath, sourceProvider, targetProvider) {
  const result = { dbPath, threadRows: 0, importRows: 0, threadIds: [], importIds: [] };
  if (!fs.existsSync(dbPath)) return result;

  if (sqliteTableExists(dbPath, "threads")) {
    const rows = sqliteQuery(dbPath, `SELECT id FROM threads WHERE model_provider = ${sqlString(sourceProvider)}`);
    if (Array.isArray(rows)) result.threadIds = rows.map((row) => row.id).filter(Boolean);
    result.threadRows = result.threadIds.length;
    if (result.threadIds.length) {
      sqliteExec(
        dbPath,
        `UPDATE threads SET model_provider = ${sqlString(targetProvider)} WHERE id IN ${sqlStringList(result.threadIds)} AND model_provider = ${sqlString(sourceProvider)}`
      );
    }
  }

  if (sqliteTableExists(dbPath, "external_agent_config_imports")) {
    const rows = sqliteQuery(dbPath, `SELECT import_id FROM external_agent_config_imports WHERE provider_id = ${sqlString(sourceProvider)}`);
    if (Array.isArray(rows)) result.importIds = rows.map((row) => row.import_id).filter(Boolean);
    result.importRows = result.importIds.length;
    if (result.importIds.length) {
      sqliteExec(
        dbPath,
        `UPDATE external_agent_config_imports SET provider_id = ${sqlString(targetProvider)} WHERE import_id IN ${sqlStringList(result.importIds)} AND provider_id = ${sqlString(sourceProvider)}`
      );
    }
  }

  return result;
}

function rewriteDesktopStateSqlite(sourceProvider, targetProvider) {
  const result = { threadRows: 0, importRows: 0, dbs: [] };
  for (const dbPath of desktopStateDbPaths()) {
    if (!fs.existsSync(dbPath)) continue;
    const dbResult = rewriteDesktopStateDb(dbPath, sourceProvider, targetProvider);
    result.threadRows += dbResult.threadRows;
    result.importRows += dbResult.importRows;
    result.dbs.push({
      dbRelativePath: relativeToCodexHome(dbPath),
      threadIds: dbResult.threadIds,
      importIds: dbResult.importIds,
    });
  }
  return result;
}

function appendOperation(operation) {
  ensureDirectory(MIGRATION_DIR);
  fs.appendFileSync(OPERATIONS_FILE, `${JSON.stringify(operation)}\n`, "utf8");
}

function readOperations() {
  if (!fs.existsSync(OPERATIONS_FILE)) return [];
  return fs.readFileSync(OPERATIONS_FILE, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map(readJsonLine)
    .filter(Boolean)
    .reverse();
}

function defaultOptions(input) {
  return {
    updateConfigProvider: input.updateConfigProvider !== false,
    renameProviderDefinition: input.renameProviderDefinition !== false,
    syncHistory: input.syncHistory === true,
    syncSqlite: input.syncSqlite === true,
  };
}

function runApply(payload) {
  const sourceProvider = payload.sourceProvider;
  const targetProvider = payload.targetProvider;
  const options = defaultOptions(payload.options || {});

  if (!validateProviderId(sourceProvider) || !validateProviderId(targetProvider)) {
    throw new Error("标识只能包含字母、数字、点、下划线和短横线。");
  }
  if (sourceProvider === targetProvider) {
    throw new Error("标识 A 和标识 B 不能相同。");
  }

  const plan = planMigration(sourceProvider, targetProvider, options);
  if (plan.targetDefinitionExists && plan.configDefinitionChanges) {
    throw new Error(`目标标识 ${targetProvider} 已有 provider 定义，请关闭“重命名 provider 定义”。`);
  }

  const startedAt = new Date().toISOString();
  const operationId = `${startedAt.replace(/[:.]/g, "-")}-${crypto.randomBytes(4).toString("hex")}`;
  const backupRoot = path.join(MIGRATION_DIR, "backups", operationId);
  ensureDirectory(backupRoot);

  const operation = {
    id: operationId,
    status: "completed",
    startedAt,
    completedAt: null,
    sourceProvider,
    targetProvider,
    options,
    backupRoot,
    plan,
    changes: {
      configUpdated: false,
      sessionFiles: 0,
      sessionRows: 0,
      sqliteCatalogRows: 0,
      sqliteLedgerRows: 0,
      desktopThreadRows: 0,
      desktopImportRows: 0,
    },
    touched: {
      sessionFiles: [],
      sqliteCatalogThreadIds: [],
      sqliteLedgerKeys: [],
      desktopStateDbs: [],
    },
  };

  try {
    const configPath = path.join(CODEX_HOME, "config.toml");
    if (fs.existsSync(configPath) && (options.updateConfigProvider || options.renameProviderDefinition)) {
      const original = fs.readFileSync(configPath, "utf8");
      const updated = updateConfigText(original, sourceProvider, targetProvider, options);
      if (updated.changed) {
        backupFile(backupRoot, configPath);
        fs.writeFileSync(configPath, updated.text, "utf8");
        operation.changes.configUpdated = true;
      }
    }

    if (options.syncHistory) {
      for (const filePath of sessionFiles()) {
        const text = fs.readFileSync(filePath, "utf8");
        if (!text.includes(`"model_provider":"${sourceProvider}"`) && !text.includes(`"model_provider": "${sourceProvider}"`)) {
          continue;
        }
        backupFile(backupRoot, filePath);
        const rows = rewriteSessionFile(filePath, sourceProvider, targetProvider);
        if (rows) {
          operation.changes.sessionFiles += 1;
          operation.changes.sessionRows += rows;
          operation.touched.sessionFiles.push(relativeToCodexHome(filePath));
        }
      }
    }

    const dbPath = path.join(CODEX_HOME, "sqlite", "codex-dev.db");
    if (options.syncSqlite && fs.existsSync(dbPath)) {
      backupFile(backupRoot, dbPath);
      const sqliteChanges = rewriteSqlite(sourceProvider, targetProvider);
      operation.changes.sqliteCatalogRows = sqliteChanges.catalogRows;
      operation.changes.sqliteLedgerRows = sqliteChanges.ledgerRows;
      operation.touched.sqliteCatalogThreadIds = sqliteChanges.catalogThreadIds;
      operation.touched.sqliteLedgerKeys = sqliteChanges.ledgerKeys;
    }

    if (options.syncSqlite) {
      const existingDesktopDbs = desktopStateDbPaths().filter((dbPath) => fs.existsSync(dbPath));
      for (const stateDbPath of existingDesktopDbs) backupFile(backupRoot, stateDbPath);
      const desktopChanges = rewriteDesktopStateSqlite(sourceProvider, targetProvider);
      operation.changes.desktopThreadRows = desktopChanges.threadRows;
      operation.changes.desktopImportRows = desktopChanges.importRows;
      operation.touched.desktopStateDbs = desktopChanges.dbs;
    }

    operation.completedAt = new Date().toISOString();
    appendOperation(operation);
    return operation;
  } catch (error) {
    operation.status = "failed";
    operation.error = error.message;
    operation.completedAt = new Date().toISOString();
    appendOperation(operation);
    throw error;
  }
}

function rollbackCodexDevSqlite(operation) {
  const dbPath = path.join(CODEX_HOME, "sqlite", "codex-dev.db");
  if (!fs.existsSync(dbPath)) return;

  for (const key of operation.touched?.sqliteCatalogThreadIds || []) {
    sqliteExec(
      dbPath,
      [
        `UPDATE local_thread_catalog SET model_provider = ${sqlString(operation.sourceProvider)}`,
        `WHERE host_id = ${sqlString(key.host_id)}`,
        `AND thread_id = ${sqlString(key.thread_id)}`,
        `AND model_provider = ${sqlString(operation.targetProvider)}`,
      ].join(" ")
    );
  }

  for (const key of operation.touched?.sqliteLedgerKeys || []) {
    const rows = sqliteQuery(
      dbPath,
      [
        "SELECT payload_json FROM thread_timeline_ledger",
        `WHERE host_id = ${sqlString(key.host_id)}`,
        `AND thread_id = ${sqlString(key.thread_id)}`,
        `AND sequence = ${Number(key.sequence)}`,
        "LIMIT 1",
      ].join(" ")
    );
    const payload = Array.isArray(rows) && rows[0] ? readJsonLine(rows[0].payload_json) : null;
    if (payload?.type === "session_meta" && payload.payload?.model_provider === operation.targetProvider) {
      payload.payload.model_provider = operation.sourceProvider;
      sqliteExec(
        dbPath,
        [
          `UPDATE thread_timeline_ledger SET payload_json = ${sqlString(JSON.stringify(payload))}`,
          `WHERE host_id = ${sqlString(key.host_id)}`,
          `AND thread_id = ${sqlString(key.thread_id)}`,
          `AND sequence = ${Number(key.sequence)}`,
        ].join(" ")
      );
    }
  }
}

function rollbackDesktopStateSqlite(operation) {
  for (const db of operation.touched?.desktopStateDbs || []) {
    const dbPath = path.join(CODEX_HOME, db.dbRelativePath);
    if (!fs.existsSync(dbPath)) continue;

    if (db.threadIds?.length && sqliteTableExists(dbPath, "threads")) {
      sqliteExec(
        dbPath,
        `UPDATE threads SET model_provider = ${sqlString(operation.sourceProvider)} WHERE id IN ${sqlStringList(db.threadIds)} AND model_provider = ${sqlString(operation.targetProvider)}`
      );
    }

    if (db.importIds?.length && sqliteTableExists(dbPath, "external_agent_config_imports")) {
      sqliteExec(
        dbPath,
        `UPDATE external_agent_config_imports SET provider_id = ${sqlString(operation.sourceProvider)} WHERE import_id IN ${sqlStringList(db.importIds)} AND provider_id = ${sqlString(operation.targetProvider)}`
      );
    }
  }
}

function runSelectiveRollback(operation) {
  let restoredFiles = 0;

  const configPath = path.join(CODEX_HOME, "config.toml");
  const configBackup = path.join(operation.backupRoot, relativeToCodexHome(configPath));
  if (operation.changes?.configUpdated && fs.existsSync(configBackup)) {
    fs.copyFileSync(configBackup, configPath);
    restoredFiles += 1;
  }

  for (const relative of operation.touched?.sessionFiles || []) {
    const filePath = path.join(CODEX_HOME, relative);
    if (!fs.existsSync(filePath)) continue;
    rewriteSessionFile(filePath, operation.targetProvider, operation.sourceProvider);
    restoredFiles += 1;
  }

  rollbackCodexDevSqlite(operation);
  rollbackDesktopStateSqlite(operation);

  const rollback = {
    id: `${new Date().toISOString().replace(/[:.]/g, "-")}-${crypto.randomBytes(4).toString("hex")}`,
    status: "rollback-completed",
    rolledBackOperationId: operation.id,
    sourceProvider: operation.targetProvider,
    targetProvider: operation.sourceProvider,
    completedAt: new Date().toISOString(),
    restoredFiles,
    mode: "selective",
  };
  appendOperation(rollback);
  return rollback;
}

function runRollback(operationId) {
  const operation = readOperations().find((item) => item.id === operationId);
  if (!operation) throw new Error("找不到这次迁移记录。");
  if (!operation.backupRoot || !fs.existsSync(operation.backupRoot)) {
    throw new Error("找不到备份目录，无法回滚。");
  }
  if (operation.touched) return runSelectiveRollback(operation);

  const restored = [];
  const restoreFiles = listAllFiles(operation.backupRoot);
  for (const backup of restoreFiles) {
    const relative = path.relative(operation.backupRoot, backup);
    const destination = path.join(CODEX_HOME, relative);
    ensureDirectory(path.dirname(destination));
    fs.copyFileSync(backup, destination);
    restored.push(destination);
  }

  const rollback = {
    id: `${new Date().toISOString().replace(/[:.]/g, "-")}-${crypto.randomBytes(4).toString("hex")}`,
    status: "rollback-completed",
    rolledBackOperationId: operationId,
    sourceProvider: operation.targetProvider,
    targetProvider: operation.sourceProvider,
    completedAt: new Date().toISOString(),
    restoredFiles: restored.length,
  };
  appendOperation(rollback);
  return rollback;
}

function listAllFiles(root) {
  const entries = fs.readdirSync(root, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...listAllFiles(fullPath));
    if (entry.isFile()) files.push(fullPath);
  }
  return files;
}

function serveStatic(requestPath, response) {
  const filePath = path.normalize(path.join(PUBLIC_DIR, requestPath === "/" ? "index.html" : requestPath));
  if (!filePath.startsWith(PUBLIC_DIR) || !fs.existsSync(filePath)) {
    sendText(response, 404, "Not found");
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const types = {
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".png": "image/png",
    ".ico": "image/x-icon",
    ".svg": "image/svg+xml",
    ".html": "text/html; charset=utf-8",
  };
  const type = types[ext] || "application/octet-stream";
  sendText(response, 200, fs.readFileSync(filePath), type);
}

async function handleRequest(request, response) {
  const parsed = url.parse(request.url, true);

  try {
    if (request.method === "GET" && parsed.pathname === "/api/state") {
      sendJson(response, 200, scanState());
      return;
    }

    if (request.method === "GET" && parsed.pathname === "/api/update") {
      sendJson(response, 200, await checkLatestRelease());
      return;
    }

    if (request.method === "POST" && parsed.pathname === "/api/plan") {
      const body = await readRequestBody(request);
      sendJson(response, 200, planMigration(body.sourceProvider, body.targetProvider, defaultOptions(body.options || {})));
      return;
    }

    if (request.method === "POST" && parsed.pathname === "/api/apply") {
      const body = await readRequestBody(request);
      sendJson(response, 200, runApply(body));
      return;
    }

    if (request.method === "POST" && parsed.pathname === "/api/rollback") {
      const body = await readRequestBody(request);
      sendJson(response, 200, runRollback(body.operationId));
      return;
    }

    serveStatic(parsed.pathname || "/", response);
  } catch (error) {
    sendJson(response, 400, { error: error.message });
  }
}

http.createServer(handleRequest).listen(DEFAULT_PORT, "127.0.0.1", () => {
  console.log(`Codex Management Assistant: http://127.0.0.1:${DEFAULT_PORT}`);
  console.log(`CODEX_HOME: ${CODEX_HOME}`);
});

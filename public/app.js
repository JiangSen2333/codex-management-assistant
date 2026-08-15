"use strict";

const languageStorageKey = "codexBoostAssistantLanguage";

const translations = {
  zh: {
    appTitle: "Codex 管理助手",
    englishName: "Codex Management Assistant",
    brandSubtitle: "MANAGEMENT ASSISTANT",
    functionDirectory: "功能目录",
    workspace: "工作区",
    localStatus: "本地状态",
    indexHealthy: "索引状态正常",
    statusSummary: "状态摘要",
    currentProvider: "当前标识",
    sessionFiles: "会话文件",
    recordLocation: "记录位置",
    refreshStatus: "刷新状态",
    migrationTitle: "会话管理",
    migrationSubtitle: "管理 provider 标识、历史会话与本地索引。",
    migrationPanelHint: "管理 provider 标识和历史会话同步",
    controlsTitle: "会话管理操作",
    controlsSubtitle: "设置旧标识名与新标识名，再预览影响范围",
    previewRequired: "预览",
    sourceLabel: "旧标识名",
    targetLabel: "新标识名",
    targetPlaceholder: "此处填写新标识名",
    updateConfig: "更新当前配置",
    updateConfigMeta: "写入 config.toml",
    renameDefinition: "重命名 provider 定义",
    renameDefinitionMeta: "迁移 provider 定义",
    syncHistory: "同步历史会话",
    syncHistoryMeta: "改写 JSONL 记录",
    syncSqlite: "同步本地索引库",
    syncSqliteMeta: "更新 SQLite 索引",
    warningCopy: "历史同步会改写 `~/.codex/sessions`、`codex-dev.db` 和 Desktop 线程库。切换 provider 后要能看到旧任务，必须同步本地索引库。",
    previewImpact: "预览影响",
    runMigration: "执行迁移",
    preview: "预览",
    previewResults: "预览结果",
    previewTimestamp: "等待预览",
    willChange: "将修改",
    willSkip: "跳过",
    conflicts: "冲突",
    scope: "范围",
    matched: "命中",
    dataSource: "数据源",
    change: "变化",
    status: "状态",
    tagReplace: "标识替换",
    indexSync: "索引同步",
    pathRewrite: "路径重写",
    currentConfig: "当前配置",
    recordsUnit: "条",
    rowsUnit: "行",
    itemsUnit: "项",
    recordCount: "记录数",
    desktopShort: "桌面",
    migration: "迁移",
    time: "时间",
    impact: "影响",
    operation: "记录",
    action: "操作",
    scrollMore: "滚动查看更多",
    configEntry: "配置入口",
    providerDefinition: "Provider 定义",
    historyFiles: "历史文件",
    historyRows: "历史记录",
    desktopThreads: "Desktop 线程库",
    historyDistribution: "历史分布",
    migrationRecords: "迁移记录",
    rollbackAvailable: "可按备份回滚",
    confirmTitle: "确认操作",
    cancel: "取消",
    confirmExecute: "确认执行",
    confirmMigrate: "确认迁移",
    confirmRollback: "确认回滚",
    ready: "就绪",
    disconnected: "未连接",
    reading: "读取中",
    previewing: "预览中",
    previewed: "已预览",
    failed: "失败",
    awaitingConfirm: "等待确认",
    applying: "执行中",
    rollingBack: "回滚中",
    actionDefault: "执行迁移前会要求确认，并自动创建备份。",
    actionChanged: "参数已变化，请重新预览后再执行迁移。",
    actionPreviewing: "正在预览影响...",
    actionPreviewReady: "预览已完成，可以执行迁移。",
    actionPreviewFailed: "预览失败，请修正后重试。",
    actionCanceled: "已取消执行，预览结果仍可继续使用。",
    actionApplying: "正在执行迁移，请不要关闭窗口...",
    actionMigrationDone: "迁移完成。",
    actionApplyFailed: "执行失败，预览结果仍可继续使用。",
    actionRollingBack: "正在回滚，请不要关闭窗口...",
    nonJsonResponse: "本地管理服务返回了非 JSON 响应",
    requestFailed: "请求失败",
    fileProtocolNotice: "请通过 http://127.0.0.1:47835 打开本页面，直接打开 HTML 文件无法调用本地管理接口。",
    noRecords: "暂无记录",
    noMigrationRecords: "暂无迁移记录",
    rollback: "回滚",
    rolledBack: "已回滚",
    systemTime: "系统时间",
    conflict: "冲突",
    countSummary: "JSONL {sessions} / catalog {catalog} / ledger {ledger} / Desktop {desktop}",
    statusCompleted: "已完成",
    statusRollbackCompleted: "回滚完成",
    noPlanNotice: "请先点击“预览影响”，确认命中数量后再执行迁移。",
    noPlanToast: "请先预览影响",
    changedNotice: "迁移参数已经变化，请重新预览后再执行。",
    changedToast: "请重新预览",
    confirmMigrationMessage: "确认将 {source} 迁移为 {target}？执行前会创建备份。",
    confirmRollbackMessage: "确认回滚迁移 {operationId}？",
    migrationDoneToast: "迁移完成：{rows} 条历史记录",
    rollbackDoneToast: "已还原 {files} 个备份文件",
  },
  en: {
    appTitle: "Codex Management Assistant",
    englishName: "Codex Management Assistant",
    brandSubtitle: "MANAGEMENT ASSISTANT",
    functionDirectory: "Function Directory",
    workspace: "Workspace",
    localStatus: "Local Status",
    indexHealthy: "Indexes healthy",
    statusSummary: "Status summary",
    currentProvider: "Current provider",
    sessionFiles: "Session files",
    recordLocation: "Record path",
    refreshStatus: "Refresh status",
    migrationTitle: "Session Management",
    migrationSubtitle: "Manage provider IDs, historical sessions, and local indexes.",
    migrationPanelHint: "Manage provider IDs and historical session sync",
    controlsTitle: "Session Controls",
    controlsSubtitle: "Set old and new provider names, then preview the impact",
    previewRequired: "Preview",
    sourceLabel: "Old provider name",
    targetLabel: "New provider name",
    targetPlaceholder: "Enter new provider name",
    updateConfig: "Update active config",
    updateConfigMeta: "Write config.toml",
    renameDefinition: "Rename provider definition",
    renameDefinitionMeta: "Migrate provider definition",
    syncHistory: "Sync historical sessions",
    syncHistoryMeta: "Rewrite JSONL records",
    syncSqlite: "Sync local indexes",
    syncSqliteMeta: "Update SQLite indexes",
    warningCopy: "History sync rewrites `~/.codex/sessions`, `codex-dev.db`, and Desktop thread databases. To keep old tasks visible after switching providers, sync local indexes as well.",
    previewImpact: "Preview Impact",
    runMigration: "Run Migration",
    preview: "Preview",
    previewResults: "Preview Results",
    previewTimestamp: "Awaiting preview",
    willChange: "Will change",
    willSkip: "Skipped",
    conflicts: "Conflicts",
    scope: "Scope",
    matched: "Matched",
    dataSource: "Data source",
    change: "Change",
    status: "Status",
    tagReplace: "Tag replace",
    indexSync: "Index sync",
    pathRewrite: "Path rewrite",
    currentConfig: "Current config",
    recordsUnit: "rows",
    rowsUnit: "rows",
    itemsUnit: "items",
    recordCount: "Records",
    desktopShort: "Desktop",
    migration: "Migration",
    time: "Time",
    impact: "Impact",
    operation: "Record",
    action: "Action",
    scrollMore: "Scroll for more",
    configEntry: "Config entry",
    providerDefinition: "Provider definition",
    historyFiles: "History files",
    historyRows: "History rows",
    desktopThreads: "Desktop threads",
    historyDistribution: "History Distribution",
    migrationRecords: "Migration Records",
    rollbackAvailable: "Rollback from backups",
    confirmTitle: "Confirm Action",
    cancel: "Cancel",
    confirmExecute: "Confirm",
    confirmMigrate: "Confirm Migration",
    confirmRollback: "Confirm Rollback",
    ready: "Ready",
    disconnected: "Disconnected",
    reading: "Reading",
    previewing: "Previewing",
    previewed: "Previewed",
    failed: "Failed",
    awaitingConfirm: "Awaiting confirmation",
    applying: "Applying",
    rollingBack: "Rolling back",
    actionDefault: "A confirmation step appears before migration, and backups are created automatically.",
    actionChanged: "Parameters changed. Preview again before running the migration.",
    actionPreviewing: "Previewing impact...",
    actionPreviewReady: "Preview complete. You can run the migration.",
    actionPreviewFailed: "Preview failed. Fix the issue and try again.",
    actionCanceled: "Execution canceled. The preview result is still available.",
    actionApplying: "Running migration. Keep this window open...",
    actionMigrationDone: "Migration complete.",
    actionApplyFailed: "Migration failed. The preview result is still available.",
    actionRollingBack: "Rolling back. Keep this window open...",
    nonJsonResponse: "The local manager returned a non-JSON response",
    requestFailed: "Request failed",
    fileProtocolNotice: "Open this page from http://127.0.0.1:47835. Opening the HTML file directly cannot call the local manager API.",
    noRecords: "No records",
    noMigrationRecords: "No migration records",
    rollback: "Rollback",
    rolledBack: "Rolled back",
    systemTime: "System time",
    conflict: "Conflict",
    countSummary: "JSONL {sessions} / catalog {catalog} / ledger {ledger} / Desktop {desktop}",
    statusCompleted: "Completed",
    statusRollbackCompleted: "Rollback completed",
    noPlanNotice: "Preview the impact first, then run the migration after checking the matched counts.",
    noPlanToast: "Preview first",
    changedNotice: "Migration parameters changed. Preview again before running.",
    changedToast: "Preview again",
    confirmMigrationMessage: "Migrate {source} to {target}? A backup will be created first.",
    confirmRollbackMessage: "Rollback migration {operationId}?",
    migrationDoneToast: "Migration complete: {rows} historical rows",
    rollbackDoneToast: "Restored {files} backup files",
  },
};

const elements = {
  currentProvider: document.querySelector("#currentProvider"),
  sessionFiles: document.querySelector("#sessionFiles"),
  codexHome: document.querySelector("#codexHome"),
  providerCounts: document.querySelector("#providerCounts"),
  operations: document.querySelector("#operations"),
  statusBadge: document.querySelector("#statusBadge"),
  toast: document.querySelector("#toast"),
  notice: document.querySelector("#notice"),
  form: document.querySelector("#migrationForm"),
  refreshButton: document.querySelector("#refreshButton"),
  planButton: document.querySelector("#planButton"),
  applyButton: document.querySelector("#applyButton"),
  actionHint: document.querySelector("#actionHint"),
  sourceProvider: document.querySelector("#sourceProvider"),
  targetProvider: document.querySelector("#targetProvider"),
  updateConfigProvider: document.querySelector("#updateConfigProvider"),
  renameProviderDefinition: document.querySelector("#renameProviderDefinition"),
  syncHistory: document.querySelector("#syncHistory"),
  syncSqlite: document.querySelector("#syncSqlite"),
  planChanged: document.querySelector("#planChanged"),
  planSkipped: document.querySelector("#planSkipped"),
  planConflicts: document.querySelector("#planConflicts"),
  planConfig: document.querySelector("#planConfig"),
  planDefinition: document.querySelector("#planDefinition"),
  planFiles: document.querySelector("#planFiles"),
  planRows: document.querySelector("#planRows"),
  planCatalog: document.querySelector("#planCatalog"),
  planLedger: document.querySelector("#planLedger"),
  planDesktopThreads: document.querySelector("#planDesktopThreads"),
  confirmOverlay: document.querySelector("#confirmOverlay"),
  confirmMessage: document.querySelector("#confirmMessage"),
  confirmCancel: document.querySelector("#confirmCancel"),
  confirmOk: document.querySelector("#confirmOk"),
  langButtons: document.querySelectorAll("[data-lang]"),
  directoryLinks: document.querySelectorAll(".directory-link"),
};

let latestPlan = null;
let latestPlanSignature = "";
let latestState = null;
let isBusy = false;
let currentLanguage = normalizeLanguage(localStorage.getItem(languageStorageKey) || navigator.language);
let currentStatusKey = "ready";
let currentActionHintKey = "actionDefault";
let currentActionHintValues = {};

function normalizeLanguage(value) {
  return String(value || "").toLowerCase().startsWith("zh") ? "zh" : "en";
}

function t(key, values = {}) {
  const template = translations[currentLanguage][key] || translations.zh[key] || key;
  return template.replace(/\{(\w+)\}/g, (_, name) => values[name] ?? "");
}

function applyLanguage() {
  document.documentElement.lang = currentLanguage === "zh" ? "zh-CN" : "en";
  document.title = t("appTitle");
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((node) => {
    node.setAttribute("aria-label", t(node.dataset.i18nAriaLabel));
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    node.setAttribute("placeholder", t(node.dataset.i18nPlaceholder));
  });
  elements.langButtons.forEach((button) => {
    const isActive = button.dataset.lang === currentLanguage;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  setStatus(currentStatusKey);
  setActionHint(currentActionHintKey, currentActionHintValues);
  if (latestState) {
    renderCounts(latestState);
    renderOperations(latestState.operations);
  }
  if (latestPlan) updatePlanConflictLabel(latestPlan);
}

function setLanguage(language) {
  currentLanguage = normalizeLanguage(language);
  localStorage.setItem(languageStorageKey, currentLanguage);
  applyLanguage();
  refresh().catch((error) => {
    setStatus("failed");
    showNotice(error.message);
    showToast(error.message);
  });
}

function options() {
  return {
    updateConfigProvider: elements.updateConfigProvider.checked,
    renameProviderDefinition: elements.renameProviderDefinition.checked,
    syncHistory: elements.syncHistory.checked,
    syncSqlite: elements.syncSqlite.checked,
  };
}

function migrationPayload() {
  return {
    sourceProvider: elements.sourceProvider.value.trim(),
    targetProvider: elements.targetProvider.value.trim(),
    options: options(),
  };
}

function payloadSignature(payload) {
  return JSON.stringify(payload);
}

async function api(path, payload) {
  const response = await fetch(path, {
    method: payload ? "POST" : "GET",
    headers: payload ? { "Content-Type": "application/json" } : undefined,
    body: payload ? JSON.stringify(payload) : undefined,
  });
  const text = await response.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(text || t("nonJsonResponse"));
    }
  }
  if (!response.ok) throw new Error(data.error || t("requestFailed"));
  return data;
}

function setStatus(key) {
  currentStatusKey = key;
  elements.statusBadge.textContent = t(key);
}

function showToast(text) {
  elements.toast.textContent = text;
  elements.toast.classList.add("show");
  window.setTimeout(() => elements.toast.classList.remove("show"), 2600);
}

function showNotice(text, tone = "error") {
  elements.notice.hidden = false;
  elements.notice.textContent = text;
  elements.notice.dataset.tone = tone;
  elements.notice.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

function clearNotice() {
  elements.notice.hidden = true;
  elements.notice.textContent = "";
}

function setActionHint(key, values = {}) {
  currentActionHintKey = key;
  currentActionHintValues = values;
  elements.actionHint.textContent = t(key, values);
}

function setBusy(busy, hintKey = "", hintValues = {}) {
  isBusy = busy;
  elements.planButton.disabled = busy;
  elements.applyButton.disabled = busy;
  elements.refreshButton.disabled = busy;
  if (hintKey) setActionHint(hintKey, hintValues);
}

function invalidatePlan() {
  latestPlan = null;
  latestPlanSignature = "";
  elements.planConfig.textContent = "-";
  elements.planDefinition.textContent = "-";
  elements.planFiles.textContent = "-";
  elements.planRows.textContent = "-";
  elements.planCatalog.textContent = "-";
  elements.planLedger.textContent = "-";
  elements.planDesktopThreads.textContent = "-";
  elements.planChanged.textContent = "-";
  elements.planSkipped.textContent = "-";
  elements.planConflicts.textContent = "-";
  setActionHint("actionChanged");
}

function confirmAction(message, confirmText = t("confirmExecute")) {
  elements.confirmMessage.textContent = message;
  elements.confirmOk.textContent = confirmText;
  elements.confirmOverlay.hidden = false;
  elements.confirmOk.focus();

  return new Promise((resolve) => {
    const cleanup = (value) => {
      elements.confirmOverlay.hidden = true;
      elements.confirmCancel.removeEventListener("click", onCancel);
      elements.confirmOk.removeEventListener("click", onOk);
      elements.confirmOverlay.removeEventListener("click", onOverlayClick);
      document.removeEventListener("keydown", onKeydown);
      resolve(value);
    };
    const onCancel = () => cleanup(false);
    const onOk = () => cleanup(true);
    const onOverlayClick = (event) => {
      if (event.target === elements.confirmOverlay) cleanup(false);
    };
    const onKeydown = (event) => {
      if (event.key === "Escape") cleanup(false);
    };

    elements.confirmCancel.addEventListener("click", onCancel);
    elements.confirmOk.addEventListener("click", onOk);
    elements.confirmOverlay.addEventListener("click", onOverlayClick);
    document.addEventListener("keydown", onKeydown);
  });
}

function providerTotal(state, provider) {
  return {
    sessions: state.sessions.providerCounts[provider] || 0,
    catalog: state.sqlite.catalogCounts[provider] || 0,
    ledger: state.sqlite.ledgerCounts[provider] || 0,
    desktop: state.desktopState?.threadCounts?.[provider] || 0,
  };
}

function renderCounts(state) {
  const providers = new Set([
    ...Object.keys(state.sessions.providerCounts),
    ...Object.keys(state.sqlite.catalogCounts),
    ...Object.keys(state.sqlite.ledgerCounts),
    ...Object.keys(state.desktopState?.threadCounts || {}),
    ...state.config.providers,
  ]);

  elements.providerCounts.innerHTML = "";
  if (!providers.size) {
    elements.providerCounts.innerHTML = `<div class="count-row"><strong>${escapeHtml(t("noRecords"))}</strong><span>-</span></div>`;
    return;
  }

  for (const provider of [...providers].sort()) {
    const total = providerTotal(state, provider);
    const row = document.createElement("div");
    row.className = "count-row";
    row.innerHTML = `
      <strong>${escapeHtml(provider)}</strong>
      <span>${escapeHtml(t("countSummary", total))}</span>
    `;
    elements.providerCounts.appendChild(row);
  }
}

function renderOperations(operations) {
  elements.operations.innerHTML = "";
  if (!operations.length) {
    elements.operations.innerHTML = `<div class="operation-row"><div class="operation-meta"><strong>${escapeHtml(t("noMigrationRecords"))}</strong><span>-</span></div></div>`;
    return;
  }

  const rolledBackOperationIds = new Set(
    operations
      .filter((operation) => operation.status === "rollback-completed" && operation.rolledBackOperationId)
      .map((operation) => operation.rolledBackOperationId)
  );

  for (const operation of operations.slice(0, 12)) {
    const row = document.createElement("div");
    row.className = "operation-row";
    const isRolledBack = rolledBackOperationIds.has(operation.id);
    const canRollback = operation.status === "completed" && operation.backupRoot && !isRolledBack;
    const rollbackControl = canRollback
      ? `<button class="rollback-button" type="button" data-operation="${escapeHtml(operation.id)}">${escapeHtml(t("rollback"))}</button>`
      : isRolledBack
        ? `<button class="rollback-button" type="button" disabled>${escapeHtml(t("rolledBack"))}</button>`
        : "";
    row.innerHTML = `
      <div class="operation-meta">
        <strong>${escapeHtml(operation.sourceProvider || "-")} -> ${escapeHtml(operation.targetProvider || "-")}</strong>
        <span>${escapeHtml(formatOperationStatus(operation.status))} / ${escapeHtml(t("systemTime"))} ${escapeHtml(formatSystemTime(operation.completedAt || operation.startedAt))}</span>
        <span>${escapeHtml(operation.id)}</span>
      </div>
      ${rollbackControl}
    `;
    elements.operations.appendChild(row);
  }
}

function formatOperationStatus(status) {
  if (status === "completed") return t("statusCompleted");
  if (status === "rollback-completed") return t("statusRollbackCompleted");
  return status || "-";
}

function formatSystemTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(currentLanguage === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

function renderPlan(plan) {
  latestPlan = plan;
  const changedRows = (plan.configProviderChanges || 0)
    + (plan.configDefinitionChanges || 0)
    + (plan.sessionRows || 0)
    + (plan.sqliteCatalogRows || 0)
    + (plan.sqliteLedgerRows || 0)
    + (plan.desktopThreadRows || 0)
    + (plan.desktopImportRows || 0);
  elements.planChanged.textContent = String(changedRows);
  elements.planSkipped.textContent = "0";
  elements.planConflicts.textContent = plan.targetDefinitionExists && plan.configDefinitionChanges ? "1" : "0";
  elements.planConfig.textContent = String(plan.configProviderChanges);
  updatePlanConflictLabel(plan);
  elements.planFiles.textContent = String(plan.sessionFiles);
  elements.planRows.textContent = String(plan.sessionRows);
  elements.planCatalog.textContent = String(plan.sqliteCatalogRows);
  elements.planLedger.textContent = String(plan.sqliteLedgerRows);
  elements.planDesktopThreads.textContent = String(plan.desktopThreadRows);
  setActionHint("actionPreviewReady");
}

function updatePlanConflictLabel(plan) {
  elements.planDefinition.textContent = plan.targetDefinitionExists && plan.configDefinitionChanges
    ? t("conflict")
    : String(plan.configDefinitionChanges);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function refresh() {
  if (window.location.protocol === "file:") {
    showNotice(t("fileProtocolNotice"));
    setStatus("disconnected");
    return;
  }
  clearNotice();
  setStatus("reading");
  const state = await api("/api/state");
  latestState = state;
  elements.currentProvider.textContent = state.config.currentProvider || "-";
  elements.sessionFiles.textContent = String(state.sessions.fileCount);
  elements.codexHome.textContent = state.codexHome;
  elements.sourceProvider.value ||= state.config.currentProvider || "";
  renderCounts(state);
  renderOperations(state.operations);
  setStatus("ready");
}

elements.form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (isBusy) return;
  try {
    const payload = migrationPayload();
    const signature = payloadSignature(payload);
    setBusy(true, "actionPreviewing");
    setStatus("previewing");
    const plan = await api("/api/plan", payload);
    renderPlan(plan);
    latestPlanSignature = signature;
    clearNotice();
    setStatus("previewed");
  } catch (error) {
    setStatus("failed");
    showNotice(error.message);
    showToast(error.message);
  } finally {
    setBusy(false, latestPlan ? "actionPreviewReady" : "actionPreviewFailed");
  }
});

elements.applyButton.addEventListener("click", async () => {
  if (isBusy) return;
  if (!latestPlan) {
    showNotice(t("noPlanNotice"), "info");
    showToast(t("noPlanToast"));
    return;
  }
  const payload = migrationPayload();
  if (payloadSignature(payload) !== latestPlanSignature) {
    invalidatePlan();
    showNotice(t("changedNotice"), "info");
    showToast(t("changedToast"));
    return;
  }
  setStatus("awaitingConfirm");
  const confirmation = await confirmAction(
    t("confirmMigrationMessage", { source: latestPlan.sourceProvider, target: latestPlan.targetProvider }),
    t("confirmMigrate")
  );
  if (!confirmation) {
    setStatus("previewed");
    setActionHint("actionCanceled");
    return;
  }

  try {
    setBusy(true, "actionApplying");
    setStatus("applying");
    const operation = await api("/api/apply", payload);
    showToast(t("migrationDoneToast", { rows: operation.changes.sessionRows }));
    clearNotice();
    latestPlan = null;
    latestPlanSignature = "";
    setActionHint("actionMigrationDone");
    await refresh();
  } catch (error) {
    setStatus("failed");
    showNotice(error.message);
    showToast(error.message);
  } finally {
    setBusy(false, latestPlan ? "actionApplyFailed" : "actionDefault");
  }
});

elements.operations.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-operation]");
  if (!button) return;
  if (isBusy) return;
  const operationId = button.dataset.operation;
  setStatus("awaitingConfirm");
  const confirmation = await confirmAction(t("confirmRollbackMessage", { operationId }), t("confirmRollback"));
  if (!confirmation) {
    setStatus("ready");
    return;
  }

  try {
    setBusy(true, "actionRollingBack");
    setStatus("rollingBack");
    const result = await api("/api/rollback", { operationId });
    showToast(t("rollbackDoneToast", { files: result.restoredFiles }));
    clearNotice();
    await refresh();
  } catch (error) {
    setStatus("failed");
    showNotice(error.message);
    showToast(error.message);
  } finally {
    setBusy(false, "actionDefault");
  }
});

elements.refreshButton.addEventListener("click", () => {
  if (isBusy) return;
  refresh().catch((error) => {
    setStatus("failed");
    showNotice(error.message);
    showToast(error.message);
  });
});

[
  elements.sourceProvider,
  elements.targetProvider,
  elements.updateConfigProvider,
  elements.renameProviderDefinition,
  elements.syncHistory,
  elements.syncSqlite,
].forEach((control) => {
  control.addEventListener("input", () => {
    if (latestPlan) invalidatePlan();
  });
  control.addEventListener("change", () => {
    if (latestPlan) invalidatePlan();
  });
});

elements.langButtons.forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.lang));
});

elements.directoryLinks.forEach((link) => {
  link.addEventListener("click", () => {
    elements.directoryLinks.forEach((item) => item.classList.toggle("active", item === link));
  });
});

applyLanguage();

refresh().catch((error) => {
  setStatus("failed");
  showNotice(error.message);
  showToast(error.message);
});

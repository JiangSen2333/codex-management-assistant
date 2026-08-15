# Codex 管理助手

Codex 管理助手（Codex Management Assistant）是一个本地桌面工具，用于管理 Codex provider 标识、历史会话迁移、本地索引同步和回滚。

它适合在你切换 Codex provider 标识时使用，例如把旧记录中的 `newapi` 统一迁移到新的 provider 标识，避免切换后历史任务在侧边栏或会话列表中不可见。

> This is a community local utility. It is not an official OpenAI product.

## Features

- 修改当前 Codex provider 标识。
- 可选重命名 provider 定义。
- 可选同步历史 JSONL 会话记录。
- 可选同步 Codex 本地 SQLite 索引。
- 可选同步 Codex Desktop 任务列表数据库。
- 执行前预览影响范围。
- 执行迁移前自动创建备份。
- 记录每次迁移操作。
- 支持对已完成迁移执行回滚。
- 支持中文和 English 界面切换。
- 基于 Neutralinojs 打包，面向用户不要求额外安装 Node.js。

## Download

正式发布后，请从 GitHub Releases 下载最新版：

- macOS: `codex-management-assistant-mac-v<version>.zip`
- Windows: planned

Windows 包需要补齐 Windows Node runtime 后再发布。

## Usage

1. 打开 Codex 管理助手。
2. “旧标识名”默认读取当前 Codex provider。
3. 在“新标识名”填写目标 provider。
4. 按需选择是否同步历史会话和本地索引。
5. 点击“预览影响”。
6. 确认命中数量和影响范围。
7. 点击“执行迁移”。
8. 如有问题，在“迁移记录”中点击“回滚”。

迁移后建议重启 Codex Desktop，让侧边栏和任务列表重新读取本地索引。

## What It Updates

根据你选择的选项，工具可能读取或修改：

- `~/.codex/config.toml`
- `~/.codex/sessions`
- `~/.codex/archived_sessions`
- `~/.codex/sqlite/codex-dev.db`
- `~/.codex/state_5.sqlite`
- `~/.codex/sqlite/state_5.sqlite`

迁移记录写入：

- `~/.codex/provider-migrations/operations.jsonl`

备份写入：

- `~/.codex/provider-migrations/backups/<operation-id>`

## Development

Requirements:

- Node.js 22 or newer
- npm

Install dependencies:

```bash
npm install
```

Download Neutralino binaries:

```bash
npm run neutralino:update
```

Run the local web server:

```bash
npm run start
```

Open:

```text
http://127.0.0.1:47831
```

Run the Neutralino desktop shell:

```bash
npm run neutralino:run
```

## Build

Build a Neutralino release:

```bash
npm run neutralino:build
```

Build a macOS `.app` bundle:

```bash
npm run neutralino:build:mac
```

Regenerate platform icons from `assets/app-icon.png`:

```bash
npm run icons:build
```

Build a macOS GitHub Release zip:

```bash
npm run neutralino:release:mac
```

The archive is written to:

```text
dist/codex-management-assistant-mac-v<version>.zip
```

## Runtime Notes

`scripts/prepare-neutralino.mjs` copies the current platform Node runtime into the Neutralino extension runtime directory.

You can also provide explicit runtimes:

```bash
NODE_RUNTIME_DARWIN=/path/to/node npm run neutralino:prepare
NODE_RUNTIME_WINDOWS=/path/to/node.exe npm run neutralino:prepare
NODE_RUNTIME_LINUX=/path/to/node npm run neutralino:prepare
```

SQLite access uses Node's built-in `node:sqlite` module.

## Release Process

1. Update `package.json` version.
2. Sync `neutralino.config.json` version:

```bash
npm run version:sync
```

3. Update `CHANGELOG.md`.
4. Build locally:

```bash
npm run neutralino:release:mac
```

5. Commit changes.
6. Create a tag:

```bash
git tag v0.1.0
git push origin main
git push origin v0.1.0
```

The GitHub Actions release workflow builds the macOS zip and uploads it to the GitHub Release when a `v*` tag is pushed.

## License

MIT

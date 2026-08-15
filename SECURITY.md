# Security Policy

## Local Data Access

Codex Management Assistant is a local desktop tool. It reads and may modify files under your local Codex home directory, usually `~/.codex`.

Depending on the options selected, it can update:

- `~/.codex/config.toml`
- `~/.codex/sessions`
- `~/.codex/archived_sessions`
- `~/.codex/sqlite/codex-dev.db`
- `~/.codex/state_5.sqlite`
- `~/.codex/sqlite/state_5.sqlite`

The app creates backups before applying migration changes. Review the preview carefully before running a migration.

## Before Opening An Issue

Do not upload real `.codex` session files, SQLite databases, provider keys, API keys, or private conversation content.

If you need to report a bug, include:

- App version
- Operating system
- The migration options selected
- Sanitized logs or screenshots
- A redacted operation id if relevant

## Reporting Vulnerabilities

Please open a private security advisory on GitHub when the repository is published, or contact the maintainer privately.

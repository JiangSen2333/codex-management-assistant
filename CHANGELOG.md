# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project follows Semantic Versioning.

## [0.1.7] - 2026-08-16

### Changed

- Publish separate Apple Silicon (`arm64`) and Intel (`x64`) macOS packages.
- Select the matching macOS architecture automatically when downloading an update.
- Reduce each macOS package by bundling only its required Node.js architecture.

## [0.1.6] - 2026-08-16

### Fixed

- Allow the Neutralino loading page to verify the packaged local manager across its local ports.
- Prevent a running local manager from being misreported as still starting.
- Stop the packaged local manager when its desktop window process exits.

## [0.1.5] - 2026-08-16

### Fixed

- Avoid connecting the desktop shell to stale local manager services from older installed versions.
- Hide the header update check button while an update prompt is already visible.
- Resolve update download failures caused by old local service routing.

## [0.1.4] - 2026-08-15

### Fixed

- Check for updates automatically after launch.
- Download the latest release package through the local manager service.
- Save downloaded update packages to the user's Downloads folder with completion feedback.

## [0.1.3] - 2026-08-15

### Fixed

- Updated the sidebar brand icon to use a dedicated packaged icon asset path.

## [0.1.2] - 2026-08-15

### Added

- Added macOS `.dmg` installer packaging.
- Added in-app GitHub Release update checks.
- Added update download and Release page actions.
- Reused the application icon in the sidebar brand and Neutralino loading page.

### Changed

- Matched the Neutralino loading page colors with the main app UI.
- Updated release workflow to upload both `.zip` and `.dmg` assets.

## [0.1.1] - 2026-08-15

### Added

- Added the official application icon source image.
- Generated macOS `.icns` and Windows `.ico` icon assets.
- Wired the icon into Neutralino packaging and macOS app bundles.

## [0.1.0] - 2026-08-15

### Added

- Local Codex provider migration workflow.
- Preview step for config, provider definition, session files, SQLite indexes, and Desktop thread databases.
- Automatic backups for modified files.
- Migration operation ledger.
- Rollback support for completed migrations.
- Neutralinojs desktop shell.
- Chinese and English interface switching.
- macOS app bundle packaging and release archive script.

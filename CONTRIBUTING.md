# Contributing

Thanks for taking a look at Codex Management Assistant.

## Development

```bash
npm install
npm run start
```

Open `http://127.0.0.1:47831`.

For the Neutralino desktop shell:

```bash
npm run neutralino:run
```

## Checks

Run JavaScript syntax checks before submitting changes:

```bash
node --check server.js
node --check public/app.js
node --check scripts/prepare-neutralino.mjs
node --check scripts/package-mac-app.mjs
node --check scripts/package-release.mjs
node --check scripts/sync-version.mjs
```

## Pull Requests

- Keep UI changes consistent with the existing design system.
- Do not commit generated files from `dist/`, Neutralino runtime folders, or local `.codex` data.
- Update `CHANGELOG.md` for user-visible changes.

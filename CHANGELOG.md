## Unreleased

### Changed
- Upgraded `vite` to 7.1.7 to address security advisories (required `npm audit fix --force`).
- Applied automated `npm audit fix` and resolved remaining vulnerabilities.
- Adjusted `vite.config.ts` manualChunks to reduce large vendor bundle size.
- Refactored `src/services/supabaseService.ts` to avoid bundling node-only modules in the client.
- Added server helper `globalThis.__runLocalAiCliFallback` in `server/ai-agent/index.mjs` to allow safe server-side CLI fallback.

### Fixed
- Resolved ESLint warnings across the codebase and removed unused eslint-disable directives.

### Notes
- The forced upgrade of `vite` is a semver-major change. Please test in staging before deploying to production.
- e2e/concurrency tests require access to the Postgres DB and appropriate secrets in CI.

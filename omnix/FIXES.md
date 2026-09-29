# Omnix cleanup & fixes

The project was cleaned and the following concrete issues were addressed:

- Removed hard-coded Vite dev HMR `wss:443` settings that break local development.
- Fixed the TypeScript `@/*` path alias to point at `src/*`.
- Fixed server-side TypeScript imports that referenced `.js` files which only existed as `.ts`.
- Fixed PWA asset configuration so it no longer references missing PNG/ICO files.
- Added working `favicon.svg` and `robots.txt` assets.
- Added configurable `PORT` support for the Express server.
- Added a startup error handler for failed server initialization.
- Moved the original one-off patch/debug/database inspection scripts into `tools/legacy/` so they cannot be mistaken for production application code.
- Removed generated diagnostic artifacts from the application root.
- Renamed the package from the placeholder `react-example` to `omnix`.
- Updated the README to reflect React 19 and the cleaned project layout.
- Removed the payment verification bypass that unconditionally treated every payment signature as valid.
- Added server-side Razorpay order creation and HMAC-SHA256 signature verification.
- Prevented the browser from inventing gateway order IDs for real payment mode.
- Prevented failed production payment persistence from being silently converted into a completed local payment.
- Restricted payment logs/revenue endpoints to admin/super-admin role metadata.
- Added server-only Razorpay environment variables to `.env.example`.

## Validation

- Relative source imports were checked and no missing relative imports remain.
- Application TypeScript/TSX source was syntax-transpiled successfully; the only compiler utility exception was the declaration-only `src/vite-env.d.ts` file, which is expected because it contains TypeScript triple-slash references.
- A complete `npm run build` could not be executed in this environment because the uploaded archive did not contain a complete dependency installation and registry access was unavailable. Run `npm install` followed by `npm run lint` and `npm run build` on a machine with network access.

## Full-length music playback
- iTunes preview URLs are explicitly treated as preview-only; they are not extended or mislabeled as full songs.
- Added `audioUrl` / `isFullTrack` support throughout music selection and Stories.
- Added optional Jamendo full-track search via `JAMENDO_CLIENT_ID`.
- Full-track playback is available only when the selected catalog provides a stream the app is authorized to use.
- Added `.env.example` documenting the configuration.

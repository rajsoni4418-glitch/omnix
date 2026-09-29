# Omnix merged release

This release combines the original Omnix fixes with the full-track music integration.

## Included
- Original project cleanup and runtime/security fixes from `omnix_fixed.zip`
- Server-side Razorpay order/signature verification
- PWA asset fixes
- Vite/HMR and TypeScript fixes
- Full-track `audioUrl` / `isFullTrack` music support
- Story creator/viewer and music picker updated for full-track playback
- Jamendo full-track provider support via `JAMENDO_CLIENT_ID`
- iTunes preview is treated as preview-only; the app does not pretend it is a full song

## Setup
1. Copy `.env.example` to `.env` and configure required Supabase/Razorpay values.
2. Set `JAMENDO_CLIENT_ID` if using Jamendo full-track catalog.
3. Run `npm install`.
4. Run `npm run lint` and `npm run build`.

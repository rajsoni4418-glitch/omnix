# Omnix

The ultimate next-generation social platform designed to empower creators, foster communities, and seamlessly integrate artificial intelligence.

## Features
- **Profiles & Communities**: Build your following and find your tribe.
- **OmniClips**: Short-form vertical video with AI-powered production tools.
- **Stories**: Disappearing 24-hour content.
- **AI Studio**: Generate posts, scripts, ideas, and complete video concepts with Gemini 2.5 Flash.
- **Live Streaming**: Go live instantly and interact with your audience.
- **Creator Coach**: AI-powered insights for growing your brand.
- **Monetization**: Built-in digital wallets and tip jars.
- **Direct Messaging**: Chat, call, and connect securely.

## Tech Stack
- Frontend: React 19, Vite, Tailwind CSS, Motion
- Backend: Express, Supabase (PostgreSQL), Google Gemini API
- State Management: Zustand, Tanstack Query

## Setup

> The original archive contained many one-off patch/debug scripts. They are preserved under `tools/legacy/` and are not required to run the app.
1. `npm install`
2. Create `.env` from `.env.example`
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. For real Razorpay payments, set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` on the server. Never expose the secret to the browser.
5. `npm run dev`

## Deployment
- Cloud Run / Docker compatible.
- `npm run build` bundles the frontend and ESM server to `dist/server.cjs`
- `npm start` runs the compiled application server.

## Production notes

- Payment verification must use a real gateway signature. The previous archive contained a hard-coded successful verification path; it has been removed.
- Payment/order state in the existing payment module is still application-level state unless the Supabase payment tables are installed and used by the client store. Do not treat local fallback data as a production financial ledger.
- The `tools/legacy/` directory contains the original one-off diagnostics and patch scripts for reference only.

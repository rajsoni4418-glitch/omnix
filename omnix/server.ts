import express from "express";
import http from "http";
import path from "path";
import { createServer as createViteServer } from "vite";
import * as dotenv from "dotenv";
import { handleAssistantChat } from "./src/server/assistant.ts";
import { handleStudioTools } from "./src/server/studio.ts";
import { handleCreatePaymentOrder, handleVerifyPayment, handleGetPaymentLogs, handleGetRevenueStats } from "./src/server/payment.ts";

dotenv.config();

process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught Exception:', err);
  // Log critical error to disk if needed here
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[ERROR] Unhandled Rejection:', reason);
});

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);
  const server = http.createServer(app);

  app.use(express.json({ limit: '50mb' }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/assistant/chat", handleAssistantChat);
  app.post("/api/studio", handleStudioTools);

  // Secure Payment Gateway API Endpoints
  app.post("/api/payment/create-order", handleCreatePaymentOrder);
  app.post("/api/payment/verify", handleVerifyPayment);
  app.get("/api/payment/logs", handleGetPaymentLogs);
  app.get("/api/payment/revenue", handleGetRevenueStats);

  app.get("/api/music/search", async (req, res) => {
    try {
      const { q } = req.query;
      const query = (typeof q === "string" ? q : "") || "trending music";
      const formatDuration = (seconds: number) => {
        const safe = Number.isFinite(seconds) ? seconds : 0;
        const minutes = Math.floor(safe / 60);
        const remainingSeconds = Math.floor(safe % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
      };

      // Full-length playback must come from a catalog that grants streaming rights.
      // Configure JAMENDO_CLIENT_ID to enable Jamendo full-track streaming.
      if (process.env.JAMENDO_CLIENT_ID) {
        const url = new URL('https://api.jamendo.com/v3.0/tracks/');
        url.searchParams.set('client_id', process.env.JAMENDO_CLIENT_ID);
        url.searchParams.set('format', 'json');
        url.searchParams.set('limit', '15');
        url.searchParams.set('search', query);
        url.searchParams.set('audioformat', 'mp32');
        url.searchParams.set('type', 'single albumtrack');
        const response = await fetch(url);
        const data = await response.json();
        if (!response.ok || data?.headers?.status !== 'success') throw new Error('Jamendo API error');
        const tracks = (data.results || []).filter((item: any) => item.audio).map((item: any) => ({
          id: `jamendo:${item.id}`,
          title: item.name,
          artist: item.artist_name,
          duration: formatDuration(Number(item.duration)),
          coverUrl: item.image || item.album_image,
          audioUrl: item.audio,
          isFullTrack: true,
          provider: 'jamendo',
          isLicensed: true,
          licenseUrl: item.license_ccurl || null
        }));
        return res.json(tracks);
      }

      // Fallback: iTunes exposes preview clips only. Never label these as full tracks.
      const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=15`;
      const searchResponse = await fetch(itunesUrl);
      const searchData = await searchResponse.json();
      if (!searchResponse.ok) throw new Error("iTunes API error");
      const tracks = (searchData.results || []).map((item: any) => ({
        id: String(item.trackId),
        title: item.trackName,
        artist: item.artistName,
        duration: formatDuration((item.trackTimeMillis || 30000) / 1000),
        coverUrl: item.artworkUrl100,
        previewUrl: item.previewUrl,
        isFullTrack: false,
        provider: 'itunes-preview',
        isLicensed: false
      }));
      res.json(tracks);
    } catch (error: any) {
      console.error("[Music Search] Error:", error?.message || error);
      res.status(500).json({ error: error?.message || 'Music search failed' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: { server } },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[FATAL] Failed to start server:', err);
  process.exitCode = 1;
});

import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { createProxyMiddleware } from "http-proxy-middleware";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Proxy API requests to backend
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8080";
  console.log(`📡 Backend proxy target: ${backendUrl}`);

  app.use(
    createProxyMiddleware({
      target: backendUrl,
      changeOrigin: true,
      pathFilter: (path) => {
        // Only proxy if it starts with /api and is not handled by existing frontend routes
        if (!path.startsWith("/api")) return false;
        const frontendRoutes = ["/api/ping", "/api/demo"];
        return !frontendRoutes.some(route => path.startsWith(route));
      }
    })
  );

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  return app;
}

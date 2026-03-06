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
  app.use(
    "/api",
    createProxyMiddleware({
      target: process.env.BACKEND_URL || "http://localhost:30007",
      changeOrigin: true,
      pathFilter: (path) => {
        // Only proxy if not handled by existing frontend routes
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

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
        if (!path.startsWith("/api")) return false;
        const frontendRoutes = ["/api/ping", "/api/demo"];
        return !frontendRoutes.some(route => path.startsWith(route));
      },
      on: {
        proxyReq: (proxyReq, req: any) => {
          if (req.body && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
            const bodyData = JSON.stringify(req.body);
            proxyReq.setHeader('Content-Type', 'application/json');
            proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
            proxyReq.write(bodyData);
          }
        },
        error: (err, _req, res) => {
          console.error(`❌ Proxy Error to ${backendUrl}:`, err.message);
          // @ts-ignore
          if (!res.headersSent) {
            // @ts-ignore
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              error: "Proxy failed",
              details: err.message,
              target: backendUrl
            }));
          }
        }
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

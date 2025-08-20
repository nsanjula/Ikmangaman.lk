import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";

const BACKEND_URL = "https://ikmangamanlk-production.up.railway.app";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors({
    origin: true, // Allow all origins in development
    credentials: true,
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Cache control headers to prevent iframe caching issues
  app.use((req, res, next) => {
    // Prevent caching for development
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

  // Proxy middleware for backend API calls in development
  app.use("/api/backend", async (req, res) => {
    try {
      const path = req.path.replace('/api/backend', '');
      const url = `${BACKEND_URL}${path}${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`;

      console.log(`Proxying request: ${req.method} ${url}`);

      const response = await fetch(url, {
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
          ...req.headers,
          'host': undefined, // Remove host header
        },
        body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
      });

      // Handle PDF responses
      if (response.headers.get('content-type')?.includes('application/pdf')) {
        const buffer = await response.arrayBuffer();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="itinerary.pdf"');
        res.send(Buffer.from(buffer));
        return;
      }

      // Handle JSON responses
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error('Proxy error:', error);
      res.status(500).json({ error: 'Proxy error', details: error.message });
    }
  });

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/demo", handleDemo);

  return app;
}

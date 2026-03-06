import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // ✅ FIX: Corrected path handling for both local and Vercel deployments
  // In Vercel: process.cwd() is /var/task, dist/public is built there
  // Locally: __dirname is project root, so we go up to dist
  let staticPath: string;

  if (process.env.NODE_ENV === "production") {
    // In production (Vercel), use current working directory
    // Vite builds to dist/public, which becomes ./public in Vercel's working directory
    staticPath = path.join(process.cwd(), "public");
    
    // Fallback: if public directory doesn't exist in cwd, try relative to dist
    if (!process.cwd().includes("dist")) {
      staticPath = path.join(process.cwd(), "dist", "public");
    }
  } else {
    // In development, resolve from __dirname
    staticPath = path.resolve(__dirname, "..", "dist", "public");
  }

  console.log(`[Server] Serving static files from: ${staticPath}`);
  console.log(`[Server] NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`[Server] process.cwd(): ${process.cwd()}`);

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    const indexPath = path.join(staticPath, "index.html");
    console.log(`[Server] Attempting to serve index.html from: ${indexPath}`);
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error(`[Server] Error serving index.html:`, err);
        res.status(500).send("Error loading application");
      }
    });
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`[Server] Running on http://localhost:${port}/`);
    console.log(`[Server] Static path configured: ${staticPath}`);
  });
}

startServer().catch(console.error);

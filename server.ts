import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

// Import our serverless handlers for local dev
import testConnection from "./api/test-connection.ts";
import importProducts from "./api/import-products.ts";
import publishProducts from "./api/publish-products.ts";
import saveSettings from "./api/save-settings.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mount the serverless functions as express routes for local testing
  app.all("/api/test-connection", async (req, res) => await testConnection(req, res));
  app.all("/api/import-products", async (req, res) => await importProducts(req, res));
  app.all("/api/publish-products", async (req, res) => await publishProducts(req, res));
  app.all("/api/save-settings", async (req, res) => await saveSettings(req, res));

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

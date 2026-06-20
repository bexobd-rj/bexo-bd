import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Route for Visual Search
  app.post("/api/visual-search", async (req, res) => {
    try {
      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ error: "No image data provided" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server" });
      }

      // Initialize Gemini lazily with correct config
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = "You are a product identification assistant. Describe the product in this image with 3-5 specific English keywords that would likely appear in its title or description (e.g., 't-shirt', 'blue watch', 'denim jacket', 'leather wallet'). Return ONLY the keywords separated by spaces.";

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: image,
                mimeType: "image/jpeg",
              },
            },
          ],
        },
      });

      const keywords = response.text || "";
      res.json({ keywords: keywords.trim() });
    } catch (error) {
      console.error("Visual Search Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // API Route for Proxy Download to bypass CORS and force direct download
  app.get("/api/proxy-download", async (req, res) => {
    try {
      const imageUrl = req.query.url as string;
      if (!imageUrl) {
        return res.status(400).send("No image URL provided");
      }

      const response = await fetch(imageUrl);
      if (!response.ok) {
        return res.status(500).send("Failed to fetch image");
      }

      const contentType = response.headers.get("content-type") || "image/jpeg";
      
      // Determine file extension based on contentType or original URL
      let ext = "jpg";
      if (contentType.includes("png")) {
        ext = "png";
      } else if (contentType.includes("webp")) {
        ext = "webp";
      } else if (contentType.includes("gif")) {
        ext = "gif";
      } else if (contentType.includes("jpeg")) {
        ext = "jpeg";
      } else {
        try {
          const cleanUrl = imageUrl.split('?')[0];
          const parts = cleanUrl.split('.');
          if (parts.length > 1) {
            const possibleExt = parts[parts.length - 1].toLowerCase();
            if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(possibleExt)) {
              ext = possibleExt;
            }
          }
        } catch(e) {}
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", `attachment; filename="bexobd-${Date.now()}.${ext}"`);
      res.send(buffer);
    } catch (error) {
      console.error("Proxy Download Error:", error);
      res.status(500).send("Error reading image content");
    }
  });

  // Vite middleware for development
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

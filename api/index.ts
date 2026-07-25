
import express from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

const verificationStore = new Map<string, { code: string; expiresAt: number }>();

const app = express();
app.use(express.json());


  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // API Route to send verification email
  app.post("/api/send-verification-email", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email || !email.includes("@")) {
        return res.status(400).json({ error: "অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা দিন।" });
      }

      const cleanEmail = email.trim().toLowerCase();
      
      // Generate a 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes from now

      verificationStore.set(cleanEmail, { code, expiresAt });

      const smtpHost = process.env.SMTP_HOST || "";
      const smtpPort = parseInt(process.env.SMTP_PORT || "587");
      const smtpUser = process.env.SMTP_USER || "";
      const smtpPass = process.env.SMTP_PASS || "";
      const smtpFrom = process.env.SMTP_FROM || smtpUser || "no-reply@bexobd.com";

      let mailSent = false;
      let errorMsg = "";

      if (smtpUser && smtpPass) {
        try {
          const transporter = nodemailer.createTransport({
            host: smtpHost || "smtp.gmail.com",
            port: smtpPort,
            secure: smtpPort === 465, // true for 465, false for other ports
            auth: {
              user: smtpUser,
              pass: smtpPass,
            },
          });

          await transporter.sendMail({
            from: `"Bexo Reseller Verification" <${smtpFrom}>`,
            to: cleanEmail,
            subject: "Bexo BD Email Verification Code",
            text: `Welcome to Bexo BD! Your verification code is: ${code}. This code will expire in 10 minutes.`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                <div style="text-align: center; margin-bottom: 20px;">
                  <h2 style="color: #6366f1; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Bexo Reseller</h2>
                  <p style="color: #64748b; font-size: 14px; margin: 5px 0 0 0;">আপনার বিশ্বস্ত রিসেলিং প্ল্যাটফর্ম</p>
                </div>
                <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
                <p style="font-size: 16px; color: #334155; line-height: 1.6; margin: 0 0 16px 0;">Bexo BD-তে আপনাকে স্বাগতম! আপনার অ্যাকাউন্ট সফলভাবে তৈরি করতে নিচের ভেরিফিকেশন কোডটি ব্যবহার করুন:</p>
                <div style="text-align: center; margin: 30px 0;">
                  <span style="font-size: 36px; font-weight: 800; letter-spacing: 6px; color: #4f46e5; background-color: #e0e7ff; padding: 16px 32px; border-radius: 12px; border: 2px dashed #818cf8; display: inline-block;">${code}</span>
                </div>
                <p style="color: #ff4d4f; font-size: 14px; text-align: center; font-weight: 500;">কোডটি আগামী ১০ মিনিটের জন্য কার্যকর থাকবে।</p>
                <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 24px 0 0 0; text-align: center;">আপনি যদি এই অ্যাকাউন্ট তৈরির জন্য অনুরোধ না করে থাকেন, তবে এই ইমেইলটি উপেক্ষা করুন।</p>
                <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 25px 0 0 0;" />
                <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 15px 0 0 0;">এটি একটি স্বয়ংক্রিয় ইমেইল, অনুগ্রহ করে উত্তর দেবেন না। © Bexo BD</p>
              </div>
            `,
          });
          mailSent = true;
        } catch (mailErr: any) {
          console.error("Nodemailer failed to send email:", mailErr);
          errorMsg = mailErr.message || "Failed to send email via SMTP";
        }
      } else {
        errorMsg = "SMTP user and password are not configured.";
      }

      if (!mailSent) {
         throw new Error(errorMsg || "Failed to send verification email.");
      }
      
      return res.json({
        success: true,
        message: "Verification email sent successfully!"
      });

    } catch (error: any) {
      console.error("Error in send-verification-email:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // API Route to verify code
  app.post("/api/verify-email-code", (req, res) => {
    try {
      const { email, code } = req.body;
      if (!email || !code) {
        return res.status(400).json({ error: "ইমেইল এবং কোড উভয়ই প্রয়োজন।" });
      }

      const cleanEmail = email.trim().toLowerCase();
      const enteredCode = code.trim();

      const record = verificationStore.get(cleanEmail);
      if (!record) {
        return res.status(400).json({ error: "ভেরিফিকেশন কোড পাওয়া যায়নি! অনুগ্রহ করে কোডটি আবার পাঠিয়ে চেষ্টা করুন।" });
      }

      if (Date.now() > record.expiresAt) {
        verificationStore.delete(cleanEmail);
        return res.status(400).json({ error: "কোডটির মেয়াদ শেষ হয়ে গেছে! অনুগ্রহ করে নতুন কোড পাঠান।" });
      }

      if (record.code !== enteredCode) {
        return res.status(400).json({ error: "ভুল ভেরিফিকেশন কোড! অনুগ্রহ করে সঠিক কোড দিন।" });
      }

      // Success - remove from store
      verificationStore.delete(cleanEmail);
      return res.json({ success: true, message: "Email verified successfully!" });

    } catch (error: any) {
      console.error("Error in verify-email-code:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });


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
      let imageUrl = req.query.url as string;
      if (!imageUrl) {
        return res.status(400).send("No image URL provided");
      }

      // Reconstruct original URL if it was split by '&' inside WebViews or query parser
      // e.g., if Firestore storage URL had '&alt=media&token=...' which becomes separate query params
      const rawUrl = req.originalUrl;
      const urlIndex = rawUrl.indexOf("url=");
      if (urlIndex !== -1) {
        const afterUrl = rawUrl.substring(urlIndex + 4);
        imageUrl = decodeURIComponent(afterUrl);
      }

      // Security Check: Prevent SSRF (Server-Side Request Forgery)
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(imageUrl);
      } catch (e) {
        return res.status(400).send("Invalid URL format");
      }

      const isHttp = parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
      if (!isHttp) {
        return res.status(400).send("Only http or https URLs are permitted");
      }

      const hostname = parsedUrl.hostname.toLowerCase();
      
      // Blacklist local and private network ranges to block internal scanning (GCP Metadata / Localhost)
      const isInternal = 
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname === "0.0.0.0" ||
        hostname === "169.254.169.254" || // GCP Metadata Server
        hostname.startsWith("10.") ||
        hostname.startsWith("192.168.") ||
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname); // 172.16.0.0/12

      if (isInternal) {
        return res.status(403).send("Access to internal or private URLs is forbidden");
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

  // API Route for Proxy Download via POST to handle very long URLs
  app.post("/api/proxy-download", async (req, res) => {
    try {
      const imageUrl = req.body.url as string;
      if (!imageUrl) {
        return res.status(400).send("No image URL provided");
      }

      // Security Check: Prevent SSRF
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(imageUrl);
      } catch (e) {
        return res.status(400).send("Invalid URL format");
      }

      const isHttp = parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
      if (!isHttp) {
        return res.status(400).send("Only http or https URLs are permitted");
      }

      const hostname = parsedUrl.hostname.toLowerCase();
      
      const isInternal = 
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname === "0.0.0.0" ||
        hostname === "169.254.169.254" || 
        hostname.startsWith("10.") ||
        hostname.startsWith("192.168.") ||
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname); 

      if (isInternal) {
        return res.status(403).send("Access to internal or private URLs is forbidden");
      }

      const response = await fetch(imageUrl);
      if (!response.ok) {
        return res.status(500).send("Failed to fetch image");
      }

      const contentType = response.headers.get("content-type") || "application/octet-stream";
      
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
      console.error("Proxy Download POST Error:", error);
      res.status(500).send("Error reading image content");
    }
  });

  


  // ==========================================
  // BEXO BD SUPPLIER API INTEGRATION ENDPOINTS
  // ==========================================

  // 1. Test Connection to Supplier API
  app.post("/api/supplier/test-connection", async (req, res) => {
    const startTime = Date.now();
    try {
      const { baseUrl, apiKey, secretKey } = req.body;
      if (!baseUrl) {
        return res.status(400).json({
          success: false,
          httpStatus: "400 Bad Request",
          statusCode: 400,
          authStatus: "Base URL Missing",
          productsCount: 0,
          responseTimeMs: Date.now() - startTime,
          error: "Base URL is required"
        });
      }

      let parsedUrl: URL;
      try {
        parsedUrl = new URL(baseUrl);
      } catch (e) {
        return res.status(400).json({
          success: false,
          httpStatus: "400 Bad Request",
          statusCode: 400,
          authStatus: "Invalid URL Format",
          productsCount: 0,
          responseTimeMs: Date.now() - startTime,
          error: "Invalid Base URL format. Must start with http:// or https://"
        });
      }

      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        return res.status(400).json({
          success: false,
          httpStatus: "400 Bad Request",
          statusCode: 400,
          authStatus: "Invalid Protocol",
          productsCount: 0,
          responseTimeMs: Date.now() - startTime,
          error: "Only http or https URLs are permitted"
        });
      }

      const hostname = parsedUrl.hostname.toLowerCase();
      const isInternal = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0" || hostname === "169.254.169.254" || hostname.startsWith("10.") || hostname.startsWith("192.168.");
      if (isInternal) {
        return res.status(403).json({
          success: false,
          httpStatus: "403 Forbidden",
          statusCode: 403,
          authStatus: "Access Forbidden",
          productsCount: 0,
          responseTimeMs: Date.now() - startTime,
          error: "Internal or private URLs are forbidden for security"
        });
      }

      const headers: Record<string, string> = {
        "User-Agent": "BexoBD-SupplierIntegration/1.0",
        "Accept": "application/json",
        "Content-Type": "application/json"
      };

      if (apiKey) {
        headers["X-API-Key"] = apiKey;
        headers["Authorization"] = `Bearer ${apiKey}`;
      }
      if (secretKey) {
        headers["X-Secret-Key"] = secretKey;
      }

      let testUrl = baseUrl.trim();
      if (!testUrl.includes('/products') && !testUrl.includes('/items') && !testUrl.includes('/api')) {
        testUrl = testUrl.replace(/\/$/, '') + '/products';
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      let response;
      try {
        response = await fetch(testUrl, { method: "GET", headers, signal: controller.signal });
      } catch (fetchErr: any) {
        clearTimeout(timeout);
        const responseTimeMs = Date.now() - startTime;
        return res.status(200).json({
          success: false,
          httpStatus: "Connection Error / Timeout",
          statusCode: 0,
          authStatus: "Unable to connect to supplier server",
          productsCount: 0,
          responseTimeMs,
          error: `Unable to connect to supplier server: ${fetchErr.message || 'Timeout'}`
        });
      }
      clearTimeout(timeout);

      const responseTimeMs = Date.now() - startTime;
      const statusCode = response.status;
      const httpStatus = `${statusCode} ${response.statusText || (statusCode === 200 ? 'OK' : 'Response')}`;

      if (!response.ok) {
        let errSnippet = "";
        try {
          const errText = await response.text();
          errSnippet = errText.slice(0, 200);
        } catch (e) {}

        let authStatus = "Authentication Failed";
        if (statusCode === 401) authStatus = "❌ Invalid API Key / Unauthorized (401)";
        else if (statusCode === 403) authStatus = "❌ Access Forbidden / Invalid Secret Key (403)";
        else if (statusCode === 404) authStatus = "❌ Products endpoint not found (404)";
        else authStatus = `❌ HTTP ${statusCode} Error`;

        return res.status(200).json({
          success: false,
          httpStatus,
          statusCode,
          authStatus,
          productsCount: 0,
          responseTimeMs,
          error: `Supplier API Test Failed (${httpStatus})${errSnippet ? ': ' + errSnippet : ''}`
        });
      }

      const data = await response.json();
      let productList: any[] = [];
      if (Array.isArray(data)) {
        productList = data;
      } else if (Array.isArray(data.products)) {
        productList = data.products;
      } else if (Array.isArray(data.data)) {
        productList = data.data;
      } else if (Array.isArray(data.items)) {
        productList = data.items;
      } else if (Array.isArray(data.result)) {
        productList = data.result;
      } else if (typeof data === 'object' && data !== null) {
        productList = Object.values(data).filter(v => typeof v === 'object' && v !== null);
      }

      return res.json({
        success: true,
        httpStatus: "200 OK (Connected)",
        statusCode,
        authStatus: "✅ Authenticated Successfully",
        productsCount: productList.length,
        responseTimeMs,
        message: `Supplier API Connection Successful! Found ${productList.length} products.`
      });
    } catch (error: any) {
      console.error("Supplier Test Connection Error:", error);
      return res.status(200).json({
        success: false,
        httpStatus: "500 Internal Error",
        statusCode: 500,
        authStatus: "Execution Exception",
        productsCount: 0,
        responseTimeMs: Date.now() - startTime,
        error: error.message || "Failed to establish connection with Supplier API"
      });
    }
  });

  // 2. Fetch Products from Supplier API
  app.post("/api/supplier/fetch-products", async (req, res) => {
    try {
      const { baseUrl, apiKey, secretKey } = req.body;
      if (!baseUrl) {
        return res.status(400).json({ success: false, error: "Base URL is required" });
      }

      let parsedUrl: URL;
      try {
        parsedUrl = new URL(baseUrl);
      } catch (e) {
        return res.status(400).json({ success: false, error: "Invalid Base URL format" });
      }

      const headers: Record<string, string> = {
        "User-Agent": "BexoBD-SupplierIntegration/1.0",
        "Accept": "application/json",
        "Content-Type": "application/json"
      };

      if (apiKey) {
        headers["X-API-Key"] = apiKey;
        headers["Authorization"] = `Bearer ${apiKey}`;
      }
      if (secretKey) {
        headers["X-Secret-Key"] = secretKey;
      }

      let fetchUrl = baseUrl.trim();
      if (!fetchUrl.includes('/products') && !fetchUrl.includes('/items') && !fetchUrl.includes('/api')) {
        fetchUrl = fetchUrl.replace(/\/$/, '') + '/products';
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      let response;
      try {
        response = await fetch(fetchUrl, { method: "GET", headers, signal: controller.signal });
      } catch (fetchErr: any) {
        clearTimeout(timeout);
        return res.status(200).json({
          success: false,
          error: `Connection error: ${fetchErr.message || 'Timeout connecting to supplier server'}`
        });
      }
      clearTimeout(timeout);

      if (!response.ok) {
        let errSnippet = "";
        try {
          const errText = await response.text();
          errSnippet = errText.slice(0, 200);
        } catch (e) {}
        return res.status(200).json({
          success: false,
          error: `Supplier API HTTP ${response.status} ${response.statusText}${errSnippet ? ': ' + errSnippet : ''}`
        });
      }

      const rawData = await response.json();
      let productList: any[] = [];
      if (Array.isArray(rawData)) {
        productList = rawData;
      } else if (Array.isArray(rawData.products)) {
        productList = rawData.products;
      } else if (Array.isArray(rawData.data)) {
        productList = rawData.data;
      } else if (Array.isArray(rawData.items)) {
        productList = rawData.items;
      } else if (Array.isArray(rawData.result)) {
        productList = rawData.result;
      } else if (typeof rawData === 'object' && rawData !== null) {
        productList = Object.values(rawData).filter(v => typeof v === 'object' && v !== null);
      }

      const normalizedProducts = productList.map((p: any, idx: number) => {
        const suppId = String(p.supplierProductId || p.id || p.productId || p.product_id || p.sku || p.code || `SUP-${idx + 1}`);
        const sku = String(p.sku || p.code || suppId);
        const title = String(p.title || p.name || p.productName || p.product_name || `Imported Item #${suppId}`);
        const costPrice = Math.round(Number(p.costPrice ?? p.cost_price ?? p.wholesalePrice ?? p.wholesale_price ?? p.supplierPrice ?? p.supplier_price ?? p.price ?? p.amount ?? 0));
        const stockCount = Math.max(0, Math.round(Number(p.stockCount ?? p.stock ?? p.quantity ?? p.inventory ?? p.stock_quantity ?? 10)));
        const category = String(p.category || p.cat || p.category_name || "পোশাক");
        const subCategory = String(p.subCategory || p.sub_category || "নতুন কালেকশন");
        const details = String(p.details || p.description || p.desc || p.summary || "অফিশিয়াল প্রিমিয়াম সাপ্লায়ার প্রোডাক্ট।");

        let imagesList: string[] = [];
        if (Array.isArray(p.images) && p.images.length > 0) {
          imagesList = p.images.map((img: any) => typeof img === 'string' ? img : (img.url || img.src || '')).filter(Boolean);
        } else if (typeof p.images === 'string' && p.images.trim()) {
          imagesList = p.images.split(/[\s,]+/).filter(Boolean);
        } else if (p.image || p.photo || p.thumbnail) {
          imagesList = [String(p.image || p.photo || p.thumbnail)];
        }

        if (imagesList.length === 0) {
          imagesList = [`https://picsum.photos/seed/supp-${suppId}/800/600`];
        }

        return {
          supplierProductId: suppId,
          sku,
          title,
          category,
          subCategory,
          costPrice,
          stockCount,
          details,
          images: imagesList
        };
      });

      return res.json({
        success: true,
        count: normalizedProducts.length,
        products: normalizedProducts
      });
    } catch (error: any) {
      console.error("Fetch Supplier Products Error:", error);
      return res.status(200).json({ success: false, error: error.message || "Failed to fetch supplier products" });
    }
  });


export default app;

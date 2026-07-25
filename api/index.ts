
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

  // API Route to Test External API Connection
  app.post("/api/test-api-connection", async (req, res) => {
    try {
      let { websiteUrl, apiType, authType, apiKey, apiSecret, customHeaders } = req.body;
      if (!websiteUrl) {
        return res.status(400).json({ success: false, errorReason: "Website URL is required" });
      }

      websiteUrl = websiteUrl.trim();
      if (!websiteUrl.startsWith("http://") && !websiteUrl.startsWith("https://")) {
        websiteUrl = "https://" + websiteUrl;
      }

      let parsedUrl: URL;
      try {
        parsedUrl = new URL(websiteUrl);
      } catch (e) {
        return res.status(400).json({ success: false, errorReason: "Website Not Supported: Invalid URL format" });
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
        return res.status(403).json({ success: false, errorReason: "API Connection Failed: Private network addresses are forbidden" });
      }

      const headers: Record<string, string> = {
        "User-Agent": "BexoBD-ProductImportCenter/1.0",
        "Accept": "application/json"
      };

      if (customHeaders) {
        try {
          const parsedHeaders = typeof customHeaders === "string" ? JSON.parse(customHeaders) : customHeaders;
          Object.assign(headers, parsedHeaders);
        } catch (e) {}
      }

      if (authType === "bearer" && apiKey) {
        headers["Authorization"] = `Bearer ${apiKey.trim()}`;
      } else if (authType === "api_key_header" && apiKey) {
        headers["X-API-Key"] = apiKey.trim();
      } else if (authType === "basic_auth" && (apiKey || apiSecret)) {
        const token = Buffer.from(`${apiKey || ''}:${apiSecret || ''}`).toString('base64');
        headers["Authorization"] = `Basic ${token}`;
      }

      const urlsToTest: string[] = [];
      const cleanBase = websiteUrl.replace(/\/+$/, "");

      if (apiType === "woocommerce") {
        let authQuery = "";
        if (authType === "query_param" || (apiKey && apiSecret)) {
          authQuery = `?consumer_key=${encodeURIComponent(apiKey || '')}&consumer_secret=${encodeURIComponent(apiSecret || '')}`;
        }
        urlsToTest.push(`${cleanBase}/wp-json/wc/v3/products${authQuery}`);
        urlsToTest.push(`${cleanBase}/wp-json/wc/v2/products${authQuery}`);
        urlsToTest.push(`${cleanBase}/wp-json/wp/v2/posts`);
      } else if (apiType === "shopify") {
        urlsToTest.push(`${cleanBase}/products.json`);
      } else if (apiType === "rest_api") {
        let authQuery = "";
        if (authType === "query_param" && apiKey) {
          authQuery = `?api_key=${encodeURIComponent(apiKey)}`;
        }
        urlsToTest.push(`${cleanBase}/api/products${authQuery}`);
        urlsToTest.push(`${cleanBase}/api/v1/products${authQuery}`);
        urlsToTest.push(`${cleanBase}/products${authQuery}`);
        urlsToTest.push(`${cleanBase}${authQuery}`);
      } else {
        urlsToTest.push(cleanBase);
        urlsToTest.push(`${cleanBase}/products.json`);
        urlsToTest.push(`${cleanBase}/wp-json/wc/v3/products`);
        urlsToTest.push(`${cleanBase}/api/products`);
      }

      let successUrl = "";
      let foundCount = 0;
      let lastErrMessage = "Product Data Not Found";

      for (const targetUrl of urlsToTest) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);

          const resp = await fetch(targetUrl, { headers, signal: controller.signal });
          clearTimeout(timeoutId);

          if (resp.status === 401 || resp.status === 403) {
            lastErrMessage = "Invalid API Key or authorization parameters";
            continue;
          }

          if (resp.ok) {
            const data = await resp.json();
            const items = Array.isArray(data) ? data : (data.products || data.items || data.data || []);
            if (Array.isArray(items)) {
              successUrl = targetUrl;
              foundCount = items.length;
              break;
            }
          }
        } catch (err: any) {
          if (err.name === 'AbortError') {
            lastErrMessage = "Network Error: Request timed out";
          } else {
            lastErrMessage = "API Connection Failed: Unable to establish handshake";
          }
        }
      }

      if (successUrl) {
        return res.json({
          success: true,
          message: `Connection successful! Connected to endpoint. Found ${foundCount} products available.`,
          details: { testedUrl: successUrl, itemCount: foundCount }
        });
      } else {
        return res.status(400).json({
          success: false,
          errorReason: lastErrMessage
        });
      }

    } catch (error: any) {
      console.error("Error in test-api-connection:", error);
      res.status(500).json({ success: false, errorReason: "API Connection Failed: Internal server error" });
    }
  });

  // API Route to Fetch External Products
  app.post("/api/fetch-external-products", async (req, res) => {
    try {
      let { websiteUrl, apiType, authType, apiKey, apiSecret, customHeaders } = req.body;
      if (!websiteUrl) {
        return res.status(400).json({ success: false, errorReason: "Website URL is required" });
      }

      websiteUrl = websiteUrl.trim();
      if (!websiteUrl.startsWith("http://") && !websiteUrl.startsWith("https://")) {
        websiteUrl = "https://" + websiteUrl;
      }

      let parsedUrl: URL;
      try {
        parsedUrl = new URL(websiteUrl);
      } catch (e) {
        return res.status(400).json({ success: false, errorReason: "Website Not Supported: Invalid URL format" });
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
        return res.status(403).json({ success: false, errorReason: "API Connection Failed: Private network addresses are forbidden" });
      }

      const headers: Record<string, string> = {
        "User-Agent": "BexoBD-ProductImportCenter/1.0",
        "Accept": "application/json"
      };

      if (customHeaders) {
        try {
          const parsedHeaders = typeof customHeaders === "string" ? JSON.parse(customHeaders) : customHeaders;
          Object.assign(headers, parsedHeaders);
        } catch (e) {}
      }

      if (authType === "bearer" && apiKey) {
        headers["Authorization"] = `Bearer ${apiKey.trim()}`;
      } else if (authType === "api_key_header" && apiKey) {
        headers["X-API-Key"] = apiKey.trim();
      } else if (authType === "basic_auth" && (apiKey || apiSecret)) {
        const token = Buffer.from(`${apiKey || ''}:${apiSecret || ''}`).toString('base64');
        headers["Authorization"] = `Basic ${token}`;
      }

      const cleanBase = websiteUrl.replace(/\/+$/, "");
      const targetUrls: string[] = [];

      if (cleanBase.endsWith(".json") || cleanBase.includes("/products") || cleanBase.includes("/api/")) {
        targetUrls.push(cleanBase);
      }

      if (apiType === "woocommerce") {
        let authQuery = "";
        if (authType === "query_param" || (apiKey && apiSecret)) {
          authQuery = `?consumer_key=${encodeURIComponent(apiKey || '')}&consumer_secret=${encodeURIComponent(apiSecret || '')}&per_page=100`;
        } else {
          authQuery = "?per_page=100";
        }
        targetUrls.push(`${cleanBase}/wp-json/wc/v3/products${authQuery}`);
        targetUrls.push(`${cleanBase}/wp-json/wc/v2/products${authQuery}`);
      } else if (apiType === "shopify") {
        targetUrls.push(`${cleanBase}/products.json?limit=250`);
      } else if (apiType === "rest_api") {
        let authQuery = "";
        if (authType === "query_param" && apiKey) {
          authQuery = `?api_key=${encodeURIComponent(apiKey)}`;
        }
        targetUrls.push(`${cleanBase}/products${authQuery}`);
        targetUrls.push(`${cleanBase}/api/products${authQuery}`);
        targetUrls.push(`${cleanBase}/api/v1/products${authQuery}`);
      } else {
        targetUrls.push(cleanBase);
        targetUrls.push(`${cleanBase}/products.json`);
        targetUrls.push(`${cleanBase}/wp-json/wc/v3/products`);
        targetUrls.push(`${cleanBase}/api/products`);
      }

      let fetchedItems: any[] = [];
      let lastErrReason = "Product Data Not Found";

      for (const targetUrl of targetUrls) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 12000);

          const resp = await fetch(targetUrl, { headers, signal: controller.signal });
          clearTimeout(timeoutId);

          if (resp.status === 401 || resp.status === 403) {
            lastErrReason = "Invalid API Key or permission denied";
            continue;
          }

          if (resp.ok) {
            const data = await resp.json();
            const items = Array.isArray(data) ? data : (data.products || data.items || data.data || []);
            if (Array.isArray(items) && items.length > 0) {
              fetchedItems = items;
              break;
            }
          }
        } catch (err: any) {
          if (err.name === 'AbortError') {
            lastErrReason = "Network Error: Request timed out while fetching products";
          } else {
            lastErrReason = "API Connection Failed: Could not connect to target website";
          }
        }
      }

      if (fetchedItems.length > 0) {
        return res.json({
          success: true,
          products: fetchedItems
        });
      } else {
        return res.status(400).json({
          success: false,
          errorReason: lastErrReason
        });
      }

    } catch (error: any) {
      console.error("Error in fetch-external-products:", error);
      res.status(500).json({ success: false, errorReason: "Network Error: Internal server error" });
    }
  });

  

export default app;

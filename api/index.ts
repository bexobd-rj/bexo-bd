
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
  
  // --- NEW ROUTES REQUESTED BY USER ---
  app.post("/api/test-connection", async (req, res) => {
    try {
      const { baseUrl, apiKey, secretKey, authType } = req.body;
      if (!baseUrl) {
        return res.status(400).json({ success: false, error: "Base URL is required" });
      }
      
      let fullUrl = baseUrl.replace(/\/+$/, "");
      fullUrl += '/products'; // Testing with /products endpoint by default

      let urlObj;
      try {
          urlObj = new URL(fullUrl);
      } catch (e) {
          return res.status(400).json({ success: false, error: "Invalid URL format" });
      }

      const headers: Record<string, string> = { "Accept": "application/json" };

      if (authType === "bearer" && apiKey) {
          headers["Authorization"] = `Bearer ${apiKey}`;
      } else if (authType === "query" && apiKey) {
          urlObj.searchParams.append("api_key", apiKey);
          if (secretKey) {
              urlObj.searchParams.append("secret_key", secretKey);
          }
      } else if (authType === "custom_headers") {
          if (apiKey) headers["api-key"] = apiKey;
          if (secretKey) headers["secret-key"] = secretKey;
          if (apiKey) headers["X-Api-Key"] = apiKey;
          if (secretKey) headers["X-Secret-Key"] = secretKey;
      } else if (authType === "basic" && (apiKey || secretKey)) {
          const token = Buffer.from(`${apiKey || ''}:${secretKey || ''}`).toString('base64');
          headers["Authorization"] = `Basic ${token}`;
      }

      const hostname = urlObj.hostname.toLowerCase();
      const isInternal = 
        hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0" ||
        hostname.startsWith("10.") || hostname.startsWith("192.168.") || /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname);

      if (isInternal) {
        return res.status(403).json({ success: false, error: "Private network addresses are forbidden" });
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(urlObj.toString(), {
          method: 'GET',
          headers: headers,
          signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      const responseText = await response.text();
      let responseData = null;
      try { responseData = JSON.parse(responseText); } catch (e) { responseData = responseText; }

      if (!response.ok) {
          return res.status(response.status).json({
              success: false,
              error: `API Error: ${response.status} ${response.statusText}`,
              details: responseData
          });
      }

      return res.json({ success: true, message: "Connection Successful!", data: responseData });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.name === 'AbortError' ? 'Connection timed out' : err.message });
    }
  });

  app.post("/api/import-products", async (req, res) => {
    try {
      const { baseUrl, endpoint = '/products', apiKey, secretKey, authType } = req.body;
      if (!baseUrl) {
        return res.status(400).json({ success: false, error: "Base URL is required" });
      }
      
      let fullUrl = baseUrl.replace(/\/+$/, "");
      fullUrl += (endpoint.startsWith('/') ? endpoint : '/' + endpoint);

      let urlObj;
      try {
          urlObj = new URL(fullUrl);
      } catch (e) {
          return res.status(400).json({ success: false, error: "Invalid URL format" });
      }

      const headers: Record<string, string> = { "Accept": "application/json" };

      if (authType === "bearer" && apiKey) {
          headers["Authorization"] = `Bearer ${apiKey}`;
      } else if (authType === "query" && apiKey) {
          urlObj.searchParams.append("api_key", apiKey);
          if (secretKey) {
              urlObj.searchParams.append("secret_key", secretKey);
          }
      } else if (authType === "custom_headers") {
          if (apiKey) headers["api-key"] = apiKey;
          if (secretKey) headers["secret-key"] = secretKey;
          if (apiKey) headers["X-Api-Key"] = apiKey;
          if (secretKey) headers["X-Secret-Key"] = secretKey;
      } else if (authType === "basic" && (apiKey || secretKey)) {
          const token = Buffer.from(`${apiKey || ''}:${secretKey || ''}`).toString('base64');
          headers["Authorization"] = `Basic ${token}`;
      }

      const hostname = urlObj.hostname.toLowerCase();
      if (hostname === "localhost" || hostname === "127.0.0.1" || hostname.startsWith("10.") || hostname.startsWith("192.168.")) {
        return res.status(403).json({ success: false, error: "Private network addresses are forbidden" });
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(urlObj.toString(), { method: 'GET', headers: headers, signal: controller.signal });
      clearTimeout(timeoutId);

      const responseText = await response.text();
      let responseData: any = null;
      try { responseData = JSON.parse(responseText); } catch (e) { responseData = responseText; }

      if (!response.ok) {
          return res.status(response.status).json({ success: false, error: `API Error: ${response.status}`, details: responseData });
      }

      // Extract products array
      let productsArray = [];
      if (Array.isArray(responseData)) productsArray = responseData;
      else if (responseData && Array.isArray(responseData.data)) productsArray = responseData.data;
      else if (responseData && Array.isArray(responseData.products)) productsArray = responseData.products;
      else if (responseData && Array.isArray(responseData.items)) productsArray = responseData.items;
      else return res.status(400).json({ success: false, error: "Could not find an array of products in the API response." });

      // Standardize products
      const standardizedProducts = productsArray.map((item: any) => {
          const id = item.id || item._id || item.productId || Math.random().toString(36).substr(2, 9);
          const name = item.name || item.title || item.productName || 'Unknown Product';
          const sku = item.sku || item.productCode || item.code || '';
          const category = item.category || item.categoryName || 'Uncategorized';
          const stock = item.stock || item.quantity || item.inventory || 0;
          
          let img = '';
          if (item.image && typeof item.image === 'string') img = item.image;
          else if (item.imageUrl && typeof item.imageUrl === 'string') img = item.imageUrl;
          else if (item.images && Array.isArray(item.images) && item.images.length > 0) {
              img = item.images[0].src || item.images[0].url || item.images[0] || '';
          }
          
          let price = 0;
          if (item.price !== undefined) price = parseFloat(item.price);
          else if (item.regularPrice !== undefined) price = parseFloat(item.regularPrice);
          else if (item.salePrice !== undefined) price = parseFloat(item.salePrice);
          else if (item.regular_price !== undefined) price = parseFloat(item.regular_price);
          
          return { originalId: id, name, sku, category, stock, img, sourcePrice: price, rawData: item };
      });

      return res.json({ success: true, products: standardizedProducts });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.name === 'AbortError' ? 'Connection timed out' : err.message });
    }
  });

  app.post("/api/publish-products", async (req, res) => {
    try {
      // For this serverless function, we receive the selected products and formatting parameters,
      // and return the ready-to-save products for the frontend to store in the database.
      const { selectedProducts, markupValue, markupType } = req.body;
      
      if (!Array.isArray(selectedProducts) || selectedProducts.length === 0) {
        return res.status(400).json({ success: false, error: "No products selected" });
      }

      const publishedProducts = selectedProducts.map((p, i) => {
          const sourcePrice = parseFloat(p.sourcePrice) || 0;
          let finalPrice = sourcePrice;
          
          if (markupType === 'percentage') {
              finalPrice = sourcePrice + (sourcePrice * (parseFloat(markupValue) / 100));
          } else if (markupType === 'fixed') {
              finalPrice = sourcePrice + parseFloat(markupValue);
          }

          return {
              id: String(Date.now() + i + Math.floor(Math.random() * 10000)),
              title: p.name,
              name: p.name,
              description: p.rawData?.description || p.name,
              price: Math.round(finalPrice),
              sourcePrice: sourcePrice,
              purchasePrice: sourcePrice,
              category: p.category || 'API Import',
              images: p.img ? [p.img] : [],
              img: p.img || '',
              inStock: p.stock > 0,
              stockQuantity: p.stock || 0,
              status: 'active',
              isPublished: true,
              createdAt: Date.now(),
              code: p.sku || `API-${Date.now().toString().slice(-6)}`,
              sourceApiId: p.originalId,
              variants: []
          };
      });

      return res.json({ success: true, publishedCount: publishedProducts.length, products: publishedProducts });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });
  // --- END NEW ROUTES ---
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

  
export default app;

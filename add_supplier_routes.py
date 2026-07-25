with open('api/index.ts', 'r', encoding='utf-8') as f:
    content = f.read()

supplier_code = """
  // ==========================================
  // BEXO BD SUPPLIER API INTEGRATION ENDPOINTS
  // ==========================================

  // 1. Test Connection to Supplier API
  app.post("/api/supplier/test-connection", async (req, res) => {
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
      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        return res.status(400).json({ success: false, error: "Only http or https URLs are permitted" });
      }

      const hostname = parsedUrl.hostname.toLowerCase();
      const isInternal = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0" || hostname === "169.254.169.254" || hostname.startsWith("10.") || hostname.startsWith("192.168.");
      if (isInternal) {
        return res.status(403).json({ success: false, error: "Internal or private URLs are forbidden" });
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

      let response;
      let attempts = 0;
      const maxAttempts = 2;
      while (attempts < maxAttempts) {
        attempts++;
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 8000);
          response = await fetch(testUrl, { method: "GET", headers, signal: controller.signal });
          clearTimeout(timeout);
          if (response.ok) break;
        } catch (err: any) {
          if (attempts >= maxAttempts) throw err;
        }
      }

      if (!response || !response.ok) {
        const statusMsg = response ? `HTTP ${response.status}: ${response.statusText}` : "Connection failed / Timeout";
        return res.status(200).json({
          success: false,
          error: `Supplier API test failed (${statusMsg})`
        });
      }

      const data = await response.json();
      const sampleList = Array.isArray(data) ? data : (data.products || data.data || data.items || []);
      
      return res.json({
        success: true,
        message: "Supplier API Connection Successful!",
        productCount: Array.isArray(sampleList) ? sampleList.length : 0,
        sample: Array.isArray(sampleList) ? sampleList.slice(0, 2) : []
      });
    } catch (error: any) {
      console.error("Supplier Test Connection Error:", error);
      return res.status(200).json({
        success: false,
        error: error.message || "Failed to establish connection with Supplier API"
      });
    }
  });

  // 2. Fetch Products from Supplier API
  app.post("/api/supplier/fetch-products", async (req, res) => {
    try {
      const { baseUrl, apiKey, secretKey, page = 1, limit = 100 } = req.body;
      if (!baseUrl) {
        return res.status(400).json({ success: false, error: "Base URL is required" });
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

      try {
        const urlObj = new URL(fetchUrl);
        if (!urlObj.searchParams.has('page')) urlObj.searchParams.set('page', String(page));
        if (!urlObj.searchParams.has('limit')) urlObj.searchParams.set('limit', String(limit));
        fetchUrl = urlObj.toString();
      } catch (e) {}

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      const response = await fetch(fetchUrl, { method: "GET", headers, signal: controller.signal });
      clearTimeout(timeout);

      if (!response.ok) {
        return res.status(200).json({ success: false, error: `Supplier API HTTP ${response.status}` });
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
      } else {
        productList = Object.values(rawData).filter(v => typeof v === 'object' && v !== null);
      }

      const normalizedProducts = productList.map((p, idx) => {
        const suppId = String(p.id || p.productId || p.sku || p.code || `SUPP-${idx + 1}`);
        const rawPrice = Number(p.price || p.costPrice || p.cost_price || p.supplier_price || p.amount || 0);
        const rawStock = Number(p.stock !== undefined ? p.stock : (p.stockCount !== undefined ? p.stockCount : (p.quantity || p.inventory || 10)));
        
        let imagesList: string[] = [];
        if (Array.isArray(p.images) && p.images.length > 0) {
          imagesList = p.images.map(img => typeof img === 'string' ? img : (img.url || img.src || ''));
        } else if (typeof p.images === 'string' && p.images.trim()) {
          imagesList = p.images.split(/[\s,]+/).filter(Boolean);
        } else if (p.image || p.photo || p.thumbnail) {
          imagesList = [p.image || p.photo || p.thumbnail];
        } else {
          imagesList = [`https://picsum.photos/seed/supp-${suppId}/800/600`];
        }

        return {
          supplierProductId: suppId,
          title: p.title || p.name || p.product_name || `Supplier Item #${suppId}`,
          category: p.category || p.cat || "পোশাক",
          subCategory: p.subCategory || p.sub_category || "টি-শার্ট",
          costPrice: rawPrice,
          stockCount: rawStock,
          details: p.details || p.description || p.desc || "সাপ্লায়ার সরাসরি ইম্পোর্টেড প্রিমিয়াম কোয়ালিটি পণ্য।",
          images: imagesList,
          sku: p.sku || `SUP-${suppId}`,
          variants: p.variants || [],
          remarks: p.remarks || "Supplier Sync"
        };
      });

      return res.json({
        success: true,
        totalCount: normalizedProducts.length,
        products: normalizedProducts
      });
    } catch (error: any) {
      console.error("Fetch Supplier Products Error:", error);
      return res.status(200).json({ success: false, error: error.message || "Failed to fetch supplier products" });
    }
  });
"""

target = "export default app;"
if target in content and "/api/supplier/test-connection" not in content:
    content = content.replace(target, supplier_code + "\n\n" + target)
    with open('api/index.ts', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added supplier routes to api/index.ts successfully!")
else:
    print("Already exists or target not found")

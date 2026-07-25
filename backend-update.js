const fs = require('fs');

let apiCode = fs.readFileSync('api/index.ts', 'utf8');

const newRoutes = `
  // --- NEW ROUTES REQUESTED BY USER ---
  app.post("/api/test-connection", async (req, res) => {
    try {
      const { baseUrl, apiKey, secretKey, authType } = req.body;
      if (!baseUrl) {
        return res.status(400).json({ success: false, error: "Base URL is required" });
      }
      
      let fullUrl = baseUrl.replace(/\\/+$/, "");
      fullUrl += '/products'; // Testing with /products endpoint by default

      let urlObj;
      try {
          urlObj = new URL(fullUrl);
      } catch (e) {
          return res.status(400).json({ success: false, error: "Invalid URL format" });
      }

      const headers = { "Accept": "application/json" };

      if (authType === "bearer" && apiKey) {
          headers["Authorization"] = \`Bearer \${apiKey}\`;
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
          const token = Buffer.from(\`\${apiKey || ''}:\${secretKey || ''}\`).toString('base64');
          headers["Authorization"] = \`Basic \${token}\`;
      }

      const hostname = urlObj.hostname.toLowerCase();
      const isInternal = 
        hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0" ||
        hostname.startsWith("10.") || hostname.startsWith("192.168.") || /^172\\.(1[6-9]|2[0-9]|3[0-1])\\./.test(hostname);

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
              error: \`API Error: \${response.status} \${response.statusText}\`,
              details: responseData
          });
      }

      return res.json({ success: true, message: "Connection Successful!", data: responseData });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.name === 'AbortError' ? 'Connection timed out' : err.message });
    }
  });

  app.post("/api/import-products", async (req, res) => {
    try {
      const { baseUrl, endpoint = '/products', apiKey, secretKey, authType } = req.body;
      if (!baseUrl) {
        return res.status(400).json({ success: false, error: "Base URL is required" });
      }
      
      let fullUrl = baseUrl.replace(/\\/+$/, "");
      fullUrl += (endpoint.startsWith('/') ? endpoint : '/' + endpoint);

      let urlObj;
      try {
          urlObj = new URL(fullUrl);
      } catch (e) {
          return res.status(400).json({ success: false, error: "Invalid URL format" });
      }

      const headers = { "Accept": "application/json" };

      if (authType === "bearer" && apiKey) {
          headers["Authorization"] = \`Bearer \${apiKey}\`;
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
          const token = Buffer.from(\`\${apiKey || ''}:\${secretKey || ''}\`).toString('base64');
          headers["Authorization"] = \`Basic \${token}\`;
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
      let responseData = null;
      try { responseData = JSON.parse(responseText); } catch (e) { responseData = responseText; }

      if (!response.ok) {
          return res.status(response.status).json({ success: false, error: \`API Error: \${response.status}\`, details: responseData });
      }

      // Extract products array
      let productsArray = [];
      if (Array.isArray(responseData)) productsArray = responseData;
      else if (responseData && Array.isArray(responseData.data)) productsArray = responseData.data;
      else if (responseData && Array.isArray(responseData.products)) productsArray = responseData.products;
      else if (responseData && Array.isArray(responseData.items)) productsArray = responseData.items;
      else return res.status(400).json({ success: false, error: "Could not find an array of products in the API response." });

      // Standardize products
      const standardizedProducts = productsArray.map(item => {
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
    } catch (err) {
      return res.status(500).json({ success: false, error: err.name === 'AbortError' ? 'Connection timed out' : err.message });
    }
  });

  app.post("/api/publish-products", async (req, res) => {
    try {
      // For this serverless function, we receive the selected products and formatting parameters,
      // and return the ready-to-save products for the frontend to store in the database.
      // (This avoids needing Firebase Admin SDK on the backend just for publishing)
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
              code: p.sku || \`API-\${Date.now().toString().slice(-6)}\`,
              sourceApiId: p.originalId,
              variants: []
          };
      });

      return res.json({ success: true, publishedCount: publishedProducts.length, products: publishedProducts });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });
  // --- END NEW ROUTES ---
`;

// Just prepend to routes
const index = apiCode.indexOf('app.post("/api/');
apiCode = apiCode.slice(0, index) + newRoutes + apiCode.slice(index);
fs.writeFileSync('api/index.ts', apiCode);
console.log("Backend routes added.");

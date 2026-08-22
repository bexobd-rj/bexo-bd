import { authenticateAdmin, isSafeUrl } from "./security.ts";

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-access-token'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  // 1. Authenticate Admin
  const authResult = await authenticateAdmin(req);
  if (!authResult.authenticated) {
    return res.status(401).json({ success: false, error: authResult.error || "Unauthorized" });
  }

  try {
    const { baseUrl, endpoint, authType, apiKey, secretKey } = req.body || {};
    if (!baseUrl) {
      return res.status(400).json({ success: false, error: "Base URL is required" });
    }

    let fullUrl = baseUrl.replace(/\/+$/, "");
    if (endpoint) {
      fullUrl += (endpoint.startsWith('/') ? endpoint : '/' + endpoint);
    }

    // 2. SSRF Protection
    const urlValidation = isSafeUrl(fullUrl);
    if (!urlValidation.safe) {
      return res.status(400).json({ success: false, error: `Blocked unsafe URL: ${urlValidation.error}` });
    }

    const headers: Record<string, string> = {
      "Accept": "application/json",
      "User-Agent": "Bexo-BD-Sync/1.0"
    };

    if (authType === "bearer" && apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    } else if (authType === "api_key_header" && apiKey) {
      headers["X-API-Key"] = apiKey;
    } else if (authType === "basic_auth" && (apiKey || secretKey)) {
      const token = Buffer.from(`${apiKey || ''}:${secretKey || ''}`).toString('base64');
      headers["Authorization"] = `Basic ${token}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    
    const response = await fetch(fullUrl, { headers, signal: controller.signal as any });
    clearTimeout(timeout);
    
    if (!response.ok) {
      return res.status(response.status).json({ success: false, error: `External API Error: ${response.status} ${response.statusText}` });
    }
    
    const data = await response.json();
    
    let productsList: any[] = [];
    if (Array.isArray(data)) {
      productsList = data;
    } else if (data && data.products && Array.isArray(data.products)) {
      productsList = data.products;
    } else if (data && data.items && Array.isArray(data.items)) {
      productsList = data.items;
    } else if (data && data.data && Array.isArray(data.data)) {
      productsList = data.data;
    }
    
    const formattedProducts = productsList.map(item => {
      let name = item.name || item.title || "Unnamed Product";
      let price = item.price || item.base_price || 0;
      let id = item.id || item._id || Math.random().toString(36).substr(2, 9);
      let category = item.category || item.category_name || "Uncategorized";
      let sku = item.sku || "";
      let stock = item.stock || item.current_stock || item.quantity || 0;
      let img = item.thumbnail_image || item.image || item.picture || "";
      
      if (img && !img.startsWith('http')) {
        let base = baseUrl.replace(/\/+$/, "");
        img = `${base}/${img.replace(/^\/+/, "")}`;
      }
      
      return {
        originalId: id,
        name,
        sku,
        category,
        stock,
        img,
        sourcePrice: price,
        rawData: item
      };
    });

    return res.json({ success: true, products: formattedProducts });
  } catch (error: any) {
    console.error("Import products error:", error);
    return res.status(500).json({ success: false, error: error.message || "Internal server error" });
  }
}

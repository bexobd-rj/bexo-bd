export default async function handler(req: any, res: any) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { baseUrl, authType, apiKey, secretKey } = req.body || {};
    if (!baseUrl) {
      return res.status(400).json({ success: false, error: "Base URL is required" });
    }
    
    let fullUrl = baseUrl.replace(/\/+$/, "");
    let urlObj;
    try {
        urlObj = new URL(fullUrl);
    } catch (e) {
        return res.status(400).json({ success: false, error: "Invalid URL format" });
    }
    
    const headers: Record<string, string> = {
      "Accept": "application/json"
    };
    
    if (authType === "bearer" && apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`;
    } else if (authType === "api_key_header" && apiKey) {
        headers["X-API-Key"] = apiKey;
    } else if (authType === "basic_auth" && (apiKey || secretKey)) {
        const token = Buffer.from(`${apiKey || ''}:${secretKey || ''}`).toString('base64');
        headers["Authorization"] = `Basic ${token}`;
    }
    
    const testUrls = [
        fullUrl,
        fullUrl + "/products",
        fullUrl + "/wp-json/wc/v3/products",
        fullUrl + "/posts"
    ];
    
    let success = false;
    let lastError = "Could not connect";
    
    for (const url of testUrls) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 8000);
            const response = await fetch(url, { headers, signal: controller.signal as any });
            clearTimeout(timeout);
            
            if (response.status < 500) {
                success = true;
                break;
            }
        } catch (err: any) {
           lastError = err.message;
        }
    }
    
    if (success) {
        return res.json({ success: true, message: "Connection successful" });
    } else {
        return res.status(400).json({ success: false, error: lastError });
    }
  } catch (error: any) {
    console.error("Test connection error:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}
